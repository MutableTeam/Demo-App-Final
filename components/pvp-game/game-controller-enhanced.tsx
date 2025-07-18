"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createInitialGameState, createPlayer, type GameState, updateGameState } from "./game-engine"
import EnhancedGameRenderer from "./enhanced-game-renderer"
import DebugOverlay from "./debug-overlay"
import {
  playBowDrawSound,
  playBowReleaseSound,
  playGameOverSound,
  playVictorySound,
  startBackgroundMusic,
  stopBackgroundMusic,
  audioManager,
} from "@/utils/audio-manager"
import { debugManager, DebugLevel } from "@/utils/debug-utils"
import transitionDebugger from "@/utils/transition-debug"
import ResourceMonitor from "@/components/resource-monitor"
import { createAIController, AIDifficulty } from "../../utils/game-ai"
import MobileTouchControls from "@/components/mobile-touch-controls"
import ResponsiveGameContainer from "@/components/responsive-game-container"
import { useIsMobile } from "@/hooks/use-mobile"

interface GameControllerEnhancedProps {
  playerId: string
  playerName: string
  isHost: boolean
  gameMode?: string
  onGameEnd?: (winner: string | null) => void
  useEnhancedPhysics?: boolean
}

export default function GameControllerEnhanced({
  playerId,
  playerName,
  isHost,
  gameMode = "duel",
  onGameEnd,
  useEnhancedPhysics = true,
}: GameControllerEnhancedProps) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState())
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

  const isMobile = useIsMobile()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Initialize debug system
  useEffect(() => {
    debugManager.updateConfig({ enabled: true, level: DebugLevel.INFO, capturePerformance: true })
    transitionDebugger.trackTransition("none", "initialized", "GameControllerEnhanced")
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F8") setShowDebug((prev) => !prev)
      if (e.key === "F9") debugManager.captureState(gameStateRef.current, "Manual Snapshot")
      if (e.key === "F11") setShowResourceMonitor((prev) => !prev)
    }
    transitionDebugger.safeAddEventListener(
      window,
      "keydown",
      handleKeyDown,
      undefined,
      `${componentIdRef.current}-keydown`,
    )
    return () => transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-keydown`)
  }, [])

  // Initialize game
  useEffect(() => {
    if (gameInitializedRef.current) return
    gameInitializedRef.current = true

    audioManager
      .init()
      .then(() => {
        audioInitializedRef.current = true
      })
      .catch((err) => debugManager.logError("AUDIO", "Failed to initialize", err))

    debugManager.setupGlobalErrorTracking()
    debugManager.trackComponentMount("GameControllerEnhanced", { playerId, gameMode })
    transitionDebugger.trackTransition("initialized", "mounting", "GameControllerEnhanced")

    if (typeof window !== "undefined") (window as any).__gameStateRef = gameStateRef

    const currentState = createInitialGameState()
    const playerColors = ["#FF5252", "#4CAF50", "#2196F3", "#FFC107"]
    const playerPositions = [
      { x: 100, y: 100 },
      { x: 700, y: 500 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
    ]

    currentState.players[playerId] = createPlayer(playerId, playerName, playerPositions[0], playerColors[0])

    const aiCount = gameMode === "ffa" || gameMode === "timed" ? 3 : 1
    const difficulties = [AIDifficulty.EASY, AIDifficulty.MEDIUM, AIDifficulty.HARD]
    for (let i = 1; i <= aiCount; i++) {
      const aiId = `ai-${i}`
      currentState.players[aiId] = createPlayer(aiId, `AI ${i}`, playerPositions[i], playerColors[i])
      const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
      aiControllersRef.current[aiId] = createAIController(randomDifficulty)
    }

    setGameState(currentState)
    gameStateRef.current = currentState
    debugManager.captureState(currentState, "Initial State")
    transitionDebugger.trackTransition("mounting", "mounted", "GameControllerEnhanced")

    const gameLoop = () => {
      const now = Date.now()
      const deltaTime = Math.min((now - lastUpdateTimeRef.current) / 1000, 0.1)
      lastUpdateTimeRef.current = now

      Object.keys(aiControllersRef.current).forEach((aiId) => {
        if (gameStateRef.current.players[aiId]) {
          const aiController = aiControllersRef.current[aiId]
          const { controls, targetRotation } = aiController.update(aiId, gameStateRef.current, deltaTime)
          gameStateRef.current.players[aiId].controls = controls
          gameStateRef.current.players[aiId].rotation = targetRotation
        }
      })

      const newState = updateGameState(gameStateRef.current, deltaTime)

      const localPlayer = newState.players[playerId]
      if (localPlayer && audioInitializedRef.current && !audioManager.isSoundMuted()) {
        if (localPlayer.isDrawingBow && !bowSoundPlayedRef.current) {
          playBowDrawSound()
          bowSoundPlayedRef.current = true
        }
        if (!localPlayer.isDrawingBow && gameStateRef.current.players[playerId]?.isDrawingBow) {
          playBowReleaseSound()
          bowSoundPlayedRef.current = false
          fullDrawSoundPlayedRef.current = false
        }
      }

      gameStateRef.current = newState
      setGameState(newState)

      if (newState.isGameOver && onGameEnd) {
        if (!audioManager.isSoundMuted()) {
          if (newState.winner === playerId) playVictorySound()
          else playGameOverSound()
        }
        stopBackgroundMusic()
        onGameEnd(newState.winner)
      } else {
        requestAnimationFrameIdRef.current = requestAnimationFrame(gameLoop)
      }
    }
    requestAnimationFrameIdRef.current = requestAnimationFrame(gameLoop)

    if (!audioManager.isSoundMuted()) {
      startBackgroundMusic().catch((err) => debugManager.logWarning("AUDIO", "Music start failed", err))
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStateRef.current.players[playerId]) return
      const player = gameStateRef.current.players[playerId]
      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          player.controls.up = true
          break
        case "s":
        case "arrowdown":
          player.controls.down = true
          break
        case "a":
        case "arrowleft":
          player.controls.left = true
          break
        case "d":
        case "arrowright":
          player.controls.right = true
          break
        case "shift":
          if (!player.isDashing && player.dashCooldown <= 0) player.controls.dash = true
          break
        case "m":
          audioManager.toggleMute()
          break
        case "e":
          player.controls.explosiveArrow = true
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!gameStateRef.current.players[playerId]) return
      const player = gameStateRef.current.players[playerId]
      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          player.controls.up = false
          break
        case "s":
        case "arrowdown":
          player.controls.down = false
          break
        case "a":
        case "arrowleft":
          player.controls.left = false
          break
        case "d":
        case "arrowright":
          player.controls.right = false
          break
        case "shift":
          player.controls.dash = false
          break
        case "e":
          player.controls.explosiveArrow = false
          break
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!gameStateRef.current.players[playerId] || !canvasRef.current) return
      const player = gameStateRef.current.players[playerId]
      const rect = canvasRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const dx = mouseX - player.position.x
      const dy = mouseY - player.position.y
      player.rotation = Math.atan2(dy, dx)
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (!gameStateRef.current.players[playerId]) return
      if (e.button === 0) gameStateRef.current.players[playerId].controls.shoot = true
      else if (e.button === 2) gameStateRef.current.players[playerId].controls.special = true
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (!gameStateRef.current.players[playerId]) return
      if (e.button === 0) gameStateRef.current.players[playerId].controls.shoot = false
      else if (e.button === 2) gameStateRef.current.players[playerId].controls.special = false
    }

    const handleContextMenu = (e: MouseEvent) => e.preventDefault()

    if (!isMobile) {
      window.addEventListener("keydown", handleKeyDown)
      window.addEventListener("keyup", handleKeyUp)
      canvasRef.current?.addEventListener("mousemove", handleMouseMove)
      canvasRef.current?.addEventListener("mousedown", handleMouseDown)
      canvasRef.current?.addEventListener("mouseup", handleMouseUp)
      canvasRef.current?.addEventListener("contextmenu", handleContextMenu)
    }

    return () => {
      if (requestAnimationFrameIdRef.current) cancelAnimationFrame(requestAnimationFrameIdRef.current)
      stopBackgroundMusic()
      if (!isMobile) {
        window.removeEventListener("keydown", handleKeyDown)
        window.removeEventListener("keyup", handleKeyUp)
      }
      debugManager.trackComponentUnmount("GameControllerEnhanced")
    }
  }, [playerId, playerName, isHost, gameMode, onGameEnd, useEnhancedPhysics, isMobile])

  const handleMobileMovement = useCallback(
    (x: number, y: number) => {
      if (!gameStateRef.current.players[playerId]) return
      const player = gameStateRef.current.players[playerId]
      player.controls.right = x > 0.1
      player.controls.left = x < -0.1
      player.controls.down = y > 0.1
      player.controls.up = y < -0.1
    },
    [playerId],
  )

  const handleMobileBowDraw = useCallback(
    (active: boolean, angle: number, power: number) => {
      if (!gameStateRef.current.players[playerId]) return
      const player = gameStateRef.current.players[playerId]
      player.controls.shoot = active
      if (active) player.rotation = angle
    },
    [playerId],
  )

  const handleMobileDash = useCallback(() => {
    if (!gameStateRef.current.players[playerId]) return
    const player = gameStateRef.current.players[playerId]
    if (!player.isDashing && player.dashCooldown <= 0) {
      player.controls.dash = true
      setTimeout(() => {
        if (gameStateRef.current.players[playerId]) player.controls.dash = false
      }, 100)
    }
  }, [playerId])

  const handleMobileSpecialAttack = useCallback(() => {
    if (!gameStateRef.current.players[playerId]) return
    const player = gameStateRef.current.players[playerId]
    if (player.specialAttackCooldown <= 0) {
      player.controls.special = true
      setTimeout(() => {
        if (gameStateRef.current.players[playerId]) player.controls.special = false
      }, 100)
    }
  }, [playerId])

  return (
    <ResponsiveGameContainer className={isMobile ? "fixed inset-0" : ""}>
      <EnhancedGameRenderer
        gameState={gameState}
        localPlayerId={playerId}
        debugMode={showDebug}
        canvasRef={canvasRef}
      />
      <DebugOverlay gameState={gameState} localPlayerId={playerId} visible={showDebug} />

      {isMobile && (
        <MobileTouchControls
          onMovement={handleMobileMovement}
          onBowDraw={handleMobileBowDraw}
          onDash={handleMobileDash}
          onSpecialAttack={handleMobileSpecialAttack}
          canvasRef={canvasRef}
          disabled={gameState.isGameOver}
        />
      )}

      <ResourceMonitor visible={showResourceMonitor} position="bottom-right" />

      {!isMobile && (
        <div className="absolute bottom-2 right-2 text-xs text-white/70 bg-black/20 backdrop-blur-sm px-2 py-1 rounded pointer-events-none">
          Press M to toggle sound | F8 for debug | F11 for resource monitor
        </div>
      )}
    </ResponsiveGameContainer>
  )
}
