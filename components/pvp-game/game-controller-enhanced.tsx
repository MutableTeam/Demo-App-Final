"use client"

import { useEffect, useRef, useState } from "react"
import { createInitialGameState, createPlayer, type GameState, updateGameState } from "./game-engine"
import EnhancedGameRenderer from "./enhanced-game-renderer"
import { audioManager } from "@/utils/audio-manager"
import { debugManager, DebugLevel } from "@/utils/debug-utils"
import { createAIController, AIDifficulty } from "../../utils/game-ai"
import type { PlatformType } from "@/contexts/platform-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import MobileGameContainer from "@/components/mobile-game-container"

interface GameStats {
  score: number
  level: number
  lives: number
  time: number
  multiplier: number
}

interface GameControllerEnhancedProps {
  playerId: string
  playerName: string
  isHost: boolean
  gameMode?: string
  onGameEnd?: (winner: string | null) => void
  useEnhancedPhysics?: boolean
  platformType?: PlatformType
  gameId: string
  onGameStart: () => void
  onGamePause: () => void
  onGameStop: () => void
  onGameReset: () => void
  gameStats?: GameStats
  isPlaying?: boolean
  isPaused?: boolean
  className?: string
}

export default function GameControllerEnhanced({
  playerId,
  playerName,
  isHost,
  gameMode = "duel",
  onGameEnd,
  useEnhancedPhysics = true,
  platformType = "desktop",
  gameId,
  onGameStart,
  onGamePause,
  onGameStop,
  onGameReset,
  gameStats = { score: 0, level: 1, lives: 3, time: 0, multiplier: 1 },
  isPlaying = false,
  isPaused = false,
  className,
}: GameControllerEnhancedProps) {
  // Use a function to initialize state to ensure it's only created once
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialState = createInitialGameState()
    // Add arena size for mobile compatibility
    initialState.arenaSize = { width: 800, height: 600 }
    initialState.arrows = []
    initialState.walls = []
    initialState.pickups = []
    return initialState
  })

  const gameStateRef = useRef<GameState>(gameState)
  const lastUpdateTimeRef = useRef<number>(Date.now())
  const requestAnimationFrameIdRef = useRef<number | null>(null)
  const bowSoundPlayedRef = useRef<boolean>(false)
  const fullDrawSoundPlayedRef = useRef<boolean>(false)
  const specialSoundPlayedRef = useRef<boolean>(false)
  const audioInitializedRef = useRef<boolean>(false)
  const gameInitializedRef = useRef<boolean>(false)
  const aiControllersRef = useRef<Record<string, ReturnType<typeof createAIController>>>({})
  const [showDebug, setShowDebug] = useState<boolean>(false)
  const [showResourceMonitor, setShowResourceMonitor] = useState<boolean>(false)
  const componentIdRef = useRef<string>(`game-controller-${Date.now()}`)
  const animationTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({})
  const memoryTrackingInterval = useRef<NodeJS.Timeout | null>(null)

  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected")
  const [playersOnline, setPlayersOnline] = useState(0)

  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false)

  // Handle joystick movement for mobile - ONLY MOVEMENT
  const handleJoystickMove = (direction: { x: number; y: number }) => {
    if (!gameStateRef.current.players[playerId]) return
    const player = gameStateRef.current.players[playerId]
    const deadzone = 0.1

    player.controls.up = direction.y > deadzone
    player.controls.down = direction.y < -deadzone
    player.controls.left = direction.x < -deadzone
    player.controls.right = direction.x > deadzone

    const isMoving = Math.abs(direction.x) > deadzone || Math.abs(direction.y) > deadzone
    if (isMoving) {
      if (player.animationState === "idle" && !player.isDrawingBow && !player.isDashing) {
        player.animationState = "run"
        player.lastAnimationChange = Date.now()
      }
    } else {
      if (player.animationState === "run" && !player.isDrawingBow && !player.isDashing) {
        player.animationState = "idle"
        player.lastAnimationChange = Date.now()
      }
    }
  }

  // Handle action button presses - ONLY ACTIONS
  const handleActionPress = (action: string, pressed: boolean) => {
    if (!gameStateRef.current.players[playerId]) return
    const player = gameStateRef.current.players[playerId]

    switch (action) {
      case "shoot":
        player.controls.shoot = pressed
        if (pressed) {
          player.isDrawingBow = true
          player.drawStartTime = Date.now() / 1000
          player.animationState = "draw"
          player.lastAnimationChange = Date.now()
        }
        break
      case "dash":
        if (pressed && !player.isDashing && (player.dashCooldown || 0) <= 0) {
          player.controls.dash = true
        } else {
          player.controls.dash = false
        }
        break
      case "special":
        player.controls.special = pressed
        if (pressed) {
          player.isChargingSpecial = true
          player.specialStartTime = Date.now() / 1000
          player.animationState = "special"
          player.lastAnimationChange = Date.now()
        }
        break
      case "explosive":
        if (pressed && (player.explosiveArrowCooldown || 0) <= 0) {
          player.controls.explosiveArrow = true
        } else {
          player.controls.explosiveArrow = false
        }
        break
    }
  }

  // Initialize debug system
  useEffect(() => {
    // Enable debug system with more verbose logging
    debugManager.updateConfig({
      enabled: true,
      level: DebugLevel.DEBUG,
      capturePerformance: true,
    })
    debugManager.logInfo("GAME", `Platform type: ${platformType}`)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F8") setShowDebug((prev) => !prev)
      if (e.key === "F9") debugManager.captureState(gameStateRef.current, "Manual Snapshot")
      if (e.key === "F11") setShowResourceMonitor((prev) => !prev)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [platformType])

  // Initialize game
  useEffect(() => {
    // Prevent multiple initializations
    if (gameInitializedRef.current) return
    gameInitializedRef.current = true

    audioManager.init().then(() => (audioInitializedRef.current = true))
    debugManager.setupGlobalErrorTracking()
    debugManager.trackComponentMount("GameControllerEnhanced", { playerId, gameMode })

    const currentState = createInitialGameState()
    const localPlayer = createPlayer(playerId, playerName, { x: 100, y: 100 }, "#FF5252")
    currentState.players[playerId] = localPlayer

    const aiCount = gameMode === "duel" ? 1 : 3
    for (let i = 1; i <= aiCount; i++) {
      const aiId = `ai-${i}`
      const aiPlayer = createPlayer(aiId, `AI ${i}`, { x: 700, y: 100 + i * 100 }, "#4CAF50")
      currentState.players[aiId] = aiPlayer
      aiControllersRef.current[aiId] = createAIController(AIDifficulty.MEDIUM)
    }

    setGameState(currentState)
    gameStateRef.current = currentState
    debugManager.captureState(currentState, "Initial State")

    const gameLoop = () => {
      const now = Date.now()
      const deltaTime = (now - lastUpdateTimeRef.current) / 1000
      lastUpdateTimeRef.current = now

      Object.values(aiControllersRef.current).forEach((ai) =>
        ai.update(Object.keys(ai.playerState.players)[0], gameStateRef.current, deltaTime),
      )

      const newState = updateGameState(gameStateRef.current, deltaTime)
      gameStateRef.current = newState
      setGameState(newState)

      if (newState.isGameOver && onGameEnd) {
        onGameEnd(newState.winner)
      } else {
        requestAnimationFrameIdRef.current = requestAnimationFrame(gameLoop)
      }
    }

    requestAnimationFrameIdRef.current = requestAnimationFrame(gameLoop)

    if (platformType === "desktop") {
      // Desktop input handling logic here
    }

    return () => {
      if (requestAnimationFrameIdRef.current) {
        cancelAnimationFrame(requestAnimationFrameIdRef.current)
      }
    }
  }, [playerId, playerName, isHost, gameMode, onGameEnd, platformType])

  const gameRenderer = (
    <EnhancedGameRenderer
      gameState={gameState}
      localPlayerId={playerId}
      debugMode={showDebug}
      platformType={platformType}
    />
  )

  if (platformType === "mobile") {
    return (
      <MobileGameContainer onJoystickMove={handleJoystickMove} onActionPress={handleActionPress}>
        {gameRenderer}
        {gameState.isGameOver && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-50">
            <h2 className="text-4xl font-bold mb-4">{gameState.winner === playerId ? "Victory!" : "Game Over"}</h2>
            <Button onClick={onGameReset}>Play Again</Button>
          </div>
        )}
      </MobileGameContainer>
    )
  }

  // Desktop Layout
  return (
    <div className={cn("relative w-full h-[600px] bg-gray-900", className)}>
      {gameRenderer}
      {gameState.isGameOver && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-50">
          <h2 className="text-4xl font-bold mb-4">{gameState.winner === playerId ? "Victory!" : "Game Over"}</h2>
          <Button onClick={onGameReset}>Play Again</Button>
        </div>
      )}
    </div>
  )
}
