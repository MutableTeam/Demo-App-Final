"use client"

import { useEffect, useRef, useState } from "react"
import { useBaseGameController } from "@/utils/base-game-controller"
import { debugManager } from "@/utils/debug-utils"
import transitionDebugger from "@/utils/transition-debug"
import { audioManager } from "@/utils/audio-manager"
import GameRenderer from "@/components/pvp-game/game-renderer"
import DebugOverlay from "@/components/pvp-game/debug-overlay"
import ResourceMonitor from "@/components/resource-monitor"
import { updateGameState } from "@/components/pvp-game/game-engine"
import type { PlatformType } from "@/contexts/platform-context"
import { useGameControls } from "@/hooks/use-game-controls"
import { createAIController, AIDifficulty } from "@/utils/game-ai"

export default function GameComponent({
  playerId,
  playerName,
  isHost,
  gameMode,
  initialGameState,
  onGameEnd,
  platformType,
}: {
  playerId: string
  playerName: string
  isHost: boolean
  gameMode: string
  initialGameState: any
  onGameEnd: (winner: string | null) => void
  platformType: PlatformType
}) {
  // Use the base game controller
  const {
    gameState,
    setGameState,
    gameStateRef,
    lastUpdateTimeRef,
    requestAnimationFrameIdRef,
    audioInitializedRef,
    gameInitializedRef,
    showDebug,
    setShowDebug,
    showResourceMonitor,
    setShowResourceMonitor,
    componentIdRef,
  } = useBaseGameController({
    playerId,
    playerName,
    isHost,
    gameMode,
    initialGameState,
    onGameEnd,
  })

  const aiControllersRef = useRef<Record<string, ReturnType<typeof createAIController>>>({})
  const bowSoundPlayedRef = useRef(false)
  const fullDrawSoundPlayedRef = useRef(false)
  const specialSoundPlayedRef = useRef(false)
  const minDrawSoundPlayedRef = useRef(false)
  const [showTutorial, setShowTutorial] = useState(true)

  // Use the new unified game controls hook for the human player
  useGameControls({
    playerId,
    gameStateRef,
    platformType,
    isEnabled: !gameState?.isGameOver,
  })

  // Initialize game
  useEffect(() => {
    // Prevent multiple initializations
    if (gameInitializedRef.current) return

    // Enable global error tracking
    debugManager.setupGlobalErrorTracking()

    // Track component mount
    debugManager.trackComponentMount("GameComponent", {
      playerId,
      playerName,
      isHost,
      gameMode,
      platformType,
    })

    transitionDebugger.trackTransition("initialized", "mounting", "GameComponent")

    // Make game state available globally for debugging
    if (typeof window !== "undefined") {
      ;(window as any).__gameStateRef = gameStateRef
    }

    gameInitializedRef.current = true

    debugManager.logInfo("GAME", `Initializing game with mode: ${gameMode} on platform: ${platformType}`)

    // Initialize audio system
    try {
      audioManager.init()
      audioInitializedRef.current = true
      debugManager.logInfo("AUDIO", "Audio system initialized")
    } catch (err) {
      debugManager.logError("AUDIO", "Failed to initialize audio", err)
    }

    // Set initial game state
    setGameState(initialGameState)
    gameStateRef.current = initialGameState

    // Initialize AI controllers for AI players
    Object.keys(initialGameState.players).forEach((pId) => {
      if (pId.startsWith("ai-")) {
        const aiNum = Number.parseInt(pId.split("-")[1] || "1", 10)
        const difficulties = [AIDifficulty.EASY, AIDifficulty.MEDIUM, AIDifficulty.HARD, AIDifficulty.EXPERT]
        const difficulty = difficulties[(aiNum - 1) % difficulties.length]
        aiControllersRef.current[pId] = createAIController(difficulty)
        debugManager.logInfo("AI_INIT", `Created AI controller for ${pId} with difficulty ${difficulty}`)
      }
    })

    // Capture initial state
    debugManager.captureState(initialGameState, "Initial State")

    transitionDebugger.trackTransition("mounting", "mounted", "GameComponent")

    // Set up crash detection timer
    const crashDetectionTimer = transitionDebugger.safeSetInterval(
      () => {
        const gameTime = gameStateRef.current?.gameTime || 0
        if (gameTime > 0 && gameTime < 5) {
          debugManager.logInfo("CRASH_DETECTION", "Game is in early stage, monitoring for crashes")
          debugManager.captureState(gameStateRef.current, "Early Game State")
        }
      },
      1000,
      `${componentIdRef.current}-crash-detection`,
    )

    // Hide tutorial after 10 seconds
    const tutorialTimer = setTimeout(() => {
      setShowTutorial(false)
    }, 10000)

    // Start game loop
    const gameLoop = (timestamp) => {
      try {
        debugManager.startFrame()

        const now = Date.now()
        const deltaTime = Math.min((now - lastUpdateTimeRef.current) / 1000, 0.1) // Cap delta time
        lastUpdateTimeRef.current = now

        if (gameStateRef.current) {
          // Update AI players before updating the game state
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
            try {
              if (localPlayer.isDrawingBow && !bowSoundPlayedRef.current) {
                audioManager.playSound("bow-draw")
                bowSoundPlayedRef.current = true
              }

              if (localPlayer.isDrawingBow && localPlayer.drawStartTime) {
                const currentTime = Date.now() / 1000
                const drawTime = currentTime - localPlayer.drawStartTime
                if (drawTime >= localPlayer.maxDrawTime && !fullDrawSoundPlayedRef.current) {
                  audioManager.playSound("bow-full-draw")
                  fullDrawSoundPlayedRef.current = true
                }
                const minDrawTime = localPlayer.maxDrawTime * 0.3
                if (drawTime >= minDrawTime && !minDrawSoundPlayedRef.current) {
                  audioManager.playSound("bow-min-draw")
                  minDrawSoundPlayedRef.current = true
                }
              }

              if (!localPlayer.isDrawingBow && gameStateRef.current.players[playerId]?.isDrawingBow) {
                const prevPlayer = gameStateRef.current.players[playerId]
                if (prevPlayer.drawStartTime) {
                  const currentTime = Date.now() / 1000
                  const drawTime = currentTime - prevPlayer.drawStartTime
                  const minDrawTime = prevPlayer.maxDrawTime * 0.3
                  if (drawTime < minDrawTime) {
                    audioManager.playSound("bow-weak-release")
                  } else {
                    audioManager.playSound("bow-release")
                  }
                } else {
                  audioManager.playSound("bow-release")
                }
                bowSoundPlayedRef.current = false
                fullDrawSoundPlayedRef.current = false
                minDrawSoundPlayedRef.current = false
              }

              if (localPlayer.isDashing && !gameStateRef.current.players[playerId]?.isDashing) {
                audioManager.playSound("dash")
              }
              if (
                localPlayer.animationState === "hit" &&
                gameStateRef.current.players[playerId]?.animationState !== "hit"
              ) {
                audioManager.playSound("hit")
              }
              if (
                localPlayer.animationState === "death" &&
                gameStateRef.current.players[playerId]?.animationState !== "death"
              ) {
                audioManager.playSound("death")
              }
            } catch (error) {
              debugManager.logError("AUDIO", "Error playing game sounds", error)
            }
          }

          gameStateRef.current = newState
          setGameState(newState)

          if (newState.isGameOver) {
            if (!audioManager.isSoundMuted()) {
              if (newState.winner === playerId) {
                audioManager.playSound("victory")
              } else {
                audioManager.playSound("game-over")
              }
            }
            audioManager.stopBackgroundMusic()
            transitionDebugger.trackTransition("playing", "game-over", "GameComponent")
            if (onGameEnd) {
              onGameEnd(newState.winner)
            }
            debugManager.logInfo("GAME", "Game ended", {
              winner: newState.winner,
              gameTime: newState.gameTime,
              playerCount: Object.keys(newState.players).length,
            })
          } else {
            requestAnimationFrameIdRef.current = transitionDebugger.safeRequestAnimationFrame(
              gameLoop,
              `${componentIdRef.current}-game-loop`,
            )
          }
        }
      } catch (error) {
        debugManager.logError("GAME_LOOP", "Critical error in game loop", error)
        debugManager.captureState(gameStateRef.current, "Critical Error State")
        setTimeout(() => {
          requestAnimationFrameIdRef.current = transitionDebugger.safeRequestAnimationFrame(
            gameLoop,
            `${componentIdRef.current}-game-loop`,
          )
        }, 1000)
      }
    }

    requestAnimationFrameIdRef.current = transitionDebugger.safeRequestAnimationFrame(
      gameLoop,
      `${componentIdRef.current}-game-loop`,
    )

    if (!audioManager.isSoundMuted()) {
      try {
        audioManager.startBackgroundMusic()
      } catch (err) {
        debugManager.logWarning("AUDIO", "Error starting background music", err)
      }
    }

    return () => {
      transitionDebugger.trackTransition("any", "unmounting", "GameComponent")
      if (requestAnimationFrameIdRef.current !== null) {
        transitionDebugger.safeCancelAnimationFrame(`${componentIdRef.current}-game-loop`)
        requestAnimationFrameIdRef.current = null
        transitionDebugger.trackCleanup("GameComponent", "Animation Frame", true)
      }
      transitionDebugger.safeClearInterval(`${componentIdRef.current}-crash-detection`)
      clearTimeout(tutorialTimer)
      try {
        audioManager.stopBackgroundMusic()
        transitionDebugger.trackCleanup("GameComponent", "Background Music", true)
      } catch (err) {
        debugManager.logWarning("AUDIO", "Error stopping background music", err)
        transitionDebugger.trackCleanup("GameComponent", "Background Music", false, err)
      }
      debugManager.logInfo("GAME", "Game cleanup completed")
      transitionDebugger.trackTransition("unmounting", "unmounted", "GameComponent")
      debugManager.trackComponentUnmount("GameComponent")
    }
  }, [playerId, playerName, isHost, gameMode, initialGameState, onGameEnd, setGameState, platformType])

  useEffect(() => {
    debugManager.trackComponentRender("GameComponent")
  })

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-800 rounded-lg">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl font-bold">Loading Game...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <GameRenderer gameState={gameState} localPlayerId={playerId} />
      <DebugOverlay gameState={gameState} localPlayerId={playerId} visible={showDebug} />
      <ResourceMonitor visible={showResourceMonitor} position="bottom-right" />
      <div className="absolute bottom-2 right-2 text-xs text-white/70 bg-black/20 backdrop-blur-sm px-2 py-1 rounded">
        Press M to toggle sound | F3 for debug | F8 for game debug | F11 for resource monitor
      </div>
    </div>
  )
}
