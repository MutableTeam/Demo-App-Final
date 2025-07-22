"use client"

import { useEffect, useRef, useState } from "react"
import {
  createInitialGameState,
  createPlayer,
  type GameState,
  updateGameState,
  createArrow,
  calculateArrowDamage,
  calculateArrowSpeed,
} from "./game-engine"
import GameRenderer from "./game-renderer"
import DebugOverlay from "./debug-overlay"
import {
  playBowDrawSound,
  playBowReleaseSound,
  playBowFullDrawSound,
  playHitSound,
  playDeathSound,
  playDashSound,
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
import type { PlatformType } from "@/contexts/platform-context"
import { gameInputHandler, setupGameInputHandlers, type GameInputState } from "@/utils/game-input-handler"

interface GameControllerProps {
  playerId: string
  playerName: string
  isHost: boolean
  gameMode?: string
  onGameEnd?: (winner: string | null) => void
  platformType?: PlatformType
}

export default function GameController({
  playerId,
  playerName,
  isHost,
  gameMode = "duel",
  onGameEnd,
  platformType = "desktop",
}: GameControllerProps) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState())
  const gameStateRef = useRef<GameState>(gameState)
  const lastUpdateTimeRef = useRef<number>(Date.now())
  const requestAnimationFrameIdRef = useRef<number | null>(null)
  const bowSoundPlayedRef = useRef<boolean>(false)
  const fullDrawSoundPlayedRef = useRef<boolean>(false)
  const audioInitializedRef = useRef<boolean>(false)
  const gameInitializedRef = useRef<boolean>(false)
  const aiControllersRef = useRef<Record<string, ReturnType<typeof createAIController>>>({})
  const [showDebug, setShowDebug] = useState<boolean>(false)
  const [showResourceMonitor, setShowDebugResourceMonitor] = useState<boolean>(false)
  const componentIdRef = useRef<string>(`game-controller-${Date.now()}`)

  useEffect(() => {
    debugManager.updateConfig({ enabled: true, level: DebugLevel.DEBUG, capturePerformance: true })
    debugManager.logInfo("GAME", "Debug system initialized for game controller")

    const handleDebugKeys = (e: KeyboardEvent) => {
      if (e.key === "F8") setShowDebug((prev) => !prev)
      if (e.key === "F9") {
        debugManager.captureState(gameStateRef.current, "Manual Snapshot")
        debugManager.logInfo("GAME", "Manual state snapshot captured")
      }
      if (e.key === "F11") setShowDebugResourceMonitor((prev) => !prev)
    }
    transitionDebugger.safeAddEventListener(
      window,
      "keydown",
      handleDebugKeys,
      undefined,
      `${componentIdRef.current}-debug-keys`,
    )
    return () => transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-debug-keys`)
  }, [])

  useEffect(() => {
    if (gameInitializedRef.current) return
    gameInitializedRef.current = true

    audioManager
      .init()
      .then(() => {
        audioInitializedRef.current = true
        debugManager.logInfo("AUDIO", "Audio system initialized")
      })
      .catch((err) => debugManager.logError("AUDIO", "Failed to initialize audio", err))

    debugManager.setupGlobalErrorTracking()
    debugManager.trackComponentMount("GameController", { playerId, playerName, isHost, gameMode })

    if (typeof window !== "undefined") {
      ;(window as any).__gameStateRef = gameStateRef
    }

    const playerColors = ["#FF5252", "#4CAF50", "#2196F3", "#FFC107"]
    const playerPositions = [
      { x: 100, y: 100 },
      { x: 700, y: 500 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
    ]
    const currentState = createInitialGameState()
    currentState.players[playerId] = createPlayer(playerId, playerName, playerPositions[0], playerColors[0])
    debugManager.logInfo("GAME", `Created player with ID: ${playerId}, name: ${playerName}`)

    const aiCount = gameMode === "ffa" || gameMode === "timed" ? 3 : 1
    const difficulties = [AIDifficulty.EASY, AIDifficulty.MEDIUM, AIDifficulty.HARD]
    for (let i = 1; i <= aiCount; i++) {
      const aiId = `ai-${i}`
      const difficulty = difficulties[i - 1] || AIDifficulty.HARD
      currentState.players[aiId] = createPlayer(aiId, `AI ${i}`, playerPositions[i], playerColors[i])
      aiControllersRef.current[aiId] = createAIController(difficulty)
      debugManager.logInfo("GAME", `Created AI player ${aiId} with difficulty: ${difficulty}`)
    }

    setGameState(currentState)
    gameStateRef.current = currentState
    debugManager.captureState(currentState, "Initial State")

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
        if (localPlayer.isDrawingBow && localPlayer.drawStartTime) {
          const drawTime = Date.now() / 1000 - localPlayer.drawStartTime
          if (drawTime >= localPlayer.maxDrawTime && !fullDrawSoundPlayedRef.current) {
            playBowFullDrawSound()
            fullDrawSoundPlayedRef.current = true
          }
        }
        if (!localPlayer.isDrawingBow && gameStateRef.current.players[playerId]?.isDrawingBow) {
          playBowReleaseSound()
          bowSoundPlayedRef.current = false
          fullDrawSoundPlayedRef.current = false
        }
        if (localPlayer.isDashing && !gameStateRef.current.players[playerId]?.isDashing) playDashSound()
        if (localPlayer.animationState === "hit" && gameStateRef.current.players[playerId]?.animationState !== "hit")
          playHitSound()
        if (
          localPlayer.animationState === "death" &&
          gameStateRef.current.players[playerId]?.animationState !== "death"
        )
          playDeathSound()
      }

      gameStateRef.current = newState
      setGameState(newState)

      if (newState.isGameOver) {
        if (onGameEnd) onGameEnd(newState.winner)
        if (!audioManager.isSoundMuted()) {
          newState.winner === playerId ? playVictorySound() : playGameOverSound()
        }
        stopBackgroundMusic()
        return
      }
      requestAnimationFrameIdRef.current = requestAnimationFrame(gameLoop)
    }

    requestAnimationFrameIdRef.current = requestAnimationFrame(gameLoop)
    if (!audioManager.isSoundMuted())
      startBackgroundMusic().catch((err) => debugManager.logWarning("AUDIO", "Failed to start BGM", err))

    let cleanupInputHandlers: (() => void) | null = null

    if (platformType === "desktop") {
      console.log("[InputDebug] Initializing DESKTOP controls.")
      cleanupInputHandlers = setupGameInputHandlers({
        playerId,
        gameStateRef,
        componentIdRef,
      })
    } else {
      console.log("[InputDebug] Initializing MOBILE controls.")
      const handleMobileInput = (inputState: GameInputState) => {
        const player = gameStateRef.current.players[playerId]
        if (!player) return

        // Combine movement and actions into player controls
        player.controls = {
          ...player.controls,
          ...inputState.movement,
          ...inputState.actions,
        }

        if (inputState.aiming.active) {
          if (!player.isDrawingBow) {
            player.isDrawingBow = true
            player.drawStartTime = Date.now() / 1000
          }
          player.rotation = inputState.aiming.angle
        }
      }

      const handleMobileShoot = (angle: number, power: number) => {
        const player = gameStateRef.current.players[playerId]
        if (!player) return

        const drawTime = player.maxDrawTime * power
        const isWeakShot = power < 0.3
        const damage = calculateArrowDamage(drawTime, player.maxDrawTime, isWeakShot)
        const arrowSpeed = calculateArrowSpeed(drawTime, player.maxDrawTime)
        const arrowVelocity = { x: Math.cos(angle) * arrowSpeed, y: Math.sin(angle) * arrowSpeed }
        const arrowPosition = {
          x: player.position.x + Math.cos(angle) * (player.size + 5),
          y: player.position.y + Math.sin(angle) * (player.size + 5),
        }
        const arrow = createArrow(arrowPosition, arrowVelocity, angle, player.id, damage)
        if (isWeakShot) {
          arrow.color = "#5D4037"
          // @ts-ignore
          arrow.isWeakShot = true
        }
        gameStateRef.current.arrows.push(arrow)

        player.isDrawingBow = false
        player.drawStartTime = null
        player.cooldown = 0.2
        player.animationState = "fire"
        player.lastAnimationChange = Date.now()

        setTimeout(() => {
          const p = gameStateRef.current.players[playerId]
          if (p?.animationState === "fire") {
            const isMoving = p.controls.up || p.controls.down || p.controls.left || p.controls.right
            p.animationState = isMoving ? "run" : "idle"
            p.lastAnimationChange = Date.now()
          }
        }, 300)
      }

      gameInputHandler.setCallbacks({
        onStateChange: handleMobileInput,
        onShoot: handleMobileShoot,
      })
      cleanupInputHandlers = () => gameInputHandler.destroy()
    }

    const resumeAudio = () => !audioManager.isSoundMuted() && audioManager.resumeAudioContext()
    transitionDebugger.safeAddEventListener(
      document,
      "click",
      resumeAudio,
      undefined,
      `${componentIdRef.current}-resume-audio`,
    )

    return () => {
      if (requestAnimationFrameIdRef.current) cancelAnimationFrame(requestAnimationFrameIdRef.current)
      if (cleanupInputHandlers) {
        console.log("[InputDebug] Cleaning up input handlers.")
        cleanupInputHandlers()
      }
      transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-resume-audio`)
      stopBackgroundMusic()
      debugManager.logInfo("GAME", "Game cleanup completed")
      debugManager.trackComponentUnmount("GameController")
    }
  }, [playerId, playerName, isHost, gameMode, onGameEnd, platformType])

  if (!gameInitializedRef.current) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-800">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl font-bold">Loading Game...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <GameRenderer gameState={gameState} localPlayerId={playerId} />
      <DebugOverlay gameState={gameState} localPlayerId={playerId} visible={showDebug} />
      <ResourceMonitor visible={showResourceMonitor} position="bottom-right" />
      <div className="absolute bottom-2 right-2 text-xs text-white/70 bg-black/20 backdrop-blur-sm px-2 py-1 rounded">
        Press M to toggle sound | F8 for debug
      </div>
    </div>
  )
}
