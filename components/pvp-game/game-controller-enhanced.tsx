"use client"

import type React from "react"
import { useEffect, useRef, useState, useMemo } from "react"
import { createInitialGameState, createPlayer, type GameState } from "./game-engine"
import EnhancedGameRenderer from "./enhanced-game-renderer"
import { audioManager } from "@/utils/audio-manager"
import { debugManager, DebugLevel } from "@/utils/debug-utils"
import transitionDebugger from "@/utils/transition-debug"
import { createAIController, AIDifficulty } from "../../utils/game-ai"
import type { PlatformType } from "@/contexts/platform-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import MobileGameContainer from "@/components/mobile-game-container"
import { useGameControls } from "@/hooks/use-game-controls"
import { useGameContext } from "@/contexts/game-context"
import { usePlatform } from "@/contexts/platform-context"
import type { GameEngine } from "@/games/top-down-shooter/game-engine"

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
  initialGameState: GameState
  gameEngine: GameEngine | null
}

const GameControllerEnhanced: React.FC<GameControllerEnhancedProps> = ({
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
  initialGameState,
  gameEngine,
}) => {
  const { isPaused: contextIsPaused } = useGameContext()
  const { platformType: contextPlatformType } = usePlatform()
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  const gameStateRef = useRef<GameState>(initialGameState)
  const lastUpdateTimeRef = useRef<number>(Date.now())
  const requestAnimationFrameIdRef = useRef<number | null>(null)
  const bowSoundPlayedRef = useRef<boolean>(false)
  const fullDrawSoundPlayedRef = useRef<boolean>(false)
  const audioInitializedRef = useRef<boolean>(false)
  const gameInitializedRef = useRef<boolean>(false)
  const aiControllersRef = useRef<Record<string, ReturnType<typeof createAIController>>>({})
  const [showDebug, setShowDebug] = useState<boolean>(false)
  const componentIdRef = useRef<string>(`game-controller-${Date.now()}`)
  const animationTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({})
  const memoryTrackingInterval = useRef<NodeJS.Timeout | null>(null)
  const specialSoundPlayedRef = useRef<boolean>(false)

  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected")
  const [playersOnline, setPlayersOnline] = useState(0)
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false)
  const gameEngineRef = useRef<GameEngine | null>(null)

  useEffect(() => {
    debugManager.updateConfig({
      enabled: true,
      level: DebugLevel.INFO,
      capturePerformance: true,
    })

    debugManager.logInfo("GAME", "Debug system initialized for enhanced game controller")
    debugManager.logInfo("GAME", `Platform type: ${platformType}`)
    transitionDebugger.trackTransition("none", "initialized", "GameControllerEnhanced")

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F8") {
        setShowDebug((prev) => !prev)
      }

      if (e.key === "F9") {
        debugManager.captureState(gameStateRef.current, "Manual Snapshot")
        debugManager.logInfo("GAME", "Manual state snapshot captured")
      }

      if (e.key === "F11") {
        setShowDiagnostics((prev) => !prev)
      }
    }

    transitionDebugger.safeAddEventListener(
      window,
      "keydown",
      handleKeyDown,
      undefined,
      `${componentIdRef.current}-keydown`,
    )

    return () => {
      transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-keydown`)
    }
  }, [platformType])

  useEffect(() => {
    if (gameInitializedRef.current) return
    gameInitializedRef.current = true

    audioManager.init().catch((err) => debugManager.logError("AUDIO", "Failed to initialize audio", err))

    const localPlayer = createPlayer(playerId, playerName, { x: 100, y: 100 }, "#FF5252")
    const playerColors = ["#FF5252", "#4CAF50", "#2196F3", "#FFC107"]
    const playerPositions = [
      { x: 100, y: 100 },
      { x: 700, y: 500 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
    ]

    const initialState = createInitialGameState()
    initialState.players[playerId] = localPlayer

    let aiCount = 1
    if (gameMode === "ffa" || gameMode === "timed") {
      aiCount = 3
    }

    const difficulties = [AIDifficulty.EASY, AIDifficulty.MEDIUM, AIDifficulty.HARD, AIDifficulty.EXPERT]

    for (let i = 1; i <= aiCount; i++) {
      const aiId = `ai-${i}`
      const aiPlayer = createPlayer(
        aiId,
        `AI ${i}`,
        playerPositions[i % playerPositions.length],
        playerColors[i % playerColors.length],
      )

      aiPlayer.controls = {
        up: false,
        down: false,
        left: false,
        right: false,
        shoot: false,
        special: false,
        dash: false,
        explosiveArrow: false,
      }
      aiPlayer.rotation = 0
      aiPlayer.size = 20
      aiPlayer.animationState = "idle"
      aiPlayer.isDrawingBow = false
      aiPlayer.isDashing = false
      aiPlayer.isChargingSpecial = false

      initialState.players[aiId] = aiPlayer
      aiControllersRef.current[aiId] = createAIController(difficulties[i % difficulties.length])

      debugManager.logInfo(
        "GAME",
        `Created AI player ${aiId} with difficulty: ${difficulties[i % difficulties.length]}`,
      )
    }

    setGameState(initialState)
    gameStateRef.current = initialState

    debugManager.captureState(initialState, "Initial State")

    transitionDebugger.trackTransition("mounting", "mounted", "GameControllerEnhanced")

    const crashDetectionTimer = transitionDebugger.safeSetInterval(
      () => {
        const gameTime = gameStateRef.current.gameTime

        if (gameTime > 0 && gameTime < 5) {
          debugManager.logInfo("CRASH_DETECTION", "Game is in early stage, monitoring for crashes")
          debugManager.captureState(gameStateRef.current, "Early Game State")
        }
      },
      1000,
      `${componentIdRef.current}-crash-detection`,
    )

    gameEngineRef.current = gameEngine
    gameEngine?.start()

    return () => {
      debugManager.logInfo("GAME_CTRL", "Cleaning up game engine.")
      gameEngine?.stop()
      gameEngineRef.current = null
    }
  }, [gameId, playerId, initialGameState, gameEngine])

  useEffect(() => {
    if (contextIsPaused) {
      gameEngineRef.current?.stop()
    } else {
      gameEngineRef.current?.start()
    }
  }, [contextIsPaused])

  useGameControls({
    playerId,
    gameStateRef,
    platformType: contextPlatformType,
    isEnabled: !contextIsPaused,
  })

  const memoizedGameState = useMemo(() => gameState, [gameState])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-500"
      case "connecting":
        return "text-yellow-500"
      default:
        return "text-red-500"
    }
  }

  const getPlatformControls = () => {
    if (platformType === "desktop") {
      return {
        primary: "WASD + Mouse",
        secondary: "Space/Enter",
        special: "Shift/Ctrl",
        hint: "Use keyboard and mouse for precise control",
      }
    } else {
      return {
        primary: "Joystick + Action Buttons",
        secondary: "Touch Controls",
        special: "Mobile Optimized",
        hint: "Use joystick for movement and buttons for actions",
      }
    }
  }

  const controls = getPlatformControls()

  const gameRenderer = (
    <EnhancedGameRenderer
      gameState={memoizedGameState}
      localPlayerId={playerId}
      debugMode={showDebug}
      platformType={platformType}
    />
  )

  if (platformType === "mobile") {
    return (
      <MobileGameContainer className={className}>
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

  return (
    <div className={cn("relative w-full h-[600px] bg-gray-900", className)}>
      <div className="absolute top-2 left-2 z-10">
        <Card className="bg-gray-800/50 text-white border-cyan-400/50">
          <CardHeader>
            <CardTitle>Archer Arena</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Score: {gameStats.score}</p>
            <p>Time: {Math.floor(gameState.gameTime)}</p>
          </CardContent>
        </Card>
      </div>
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

export default GameControllerEnhanced
