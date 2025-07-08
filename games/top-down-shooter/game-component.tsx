"use client"

import { useEffect, useRef, useState } from "react"
import { useBaseGameController } from "@/utils/base-game-controller"
import { setupGameInputHandlers } from "@/utils/game-input-handler"
import { debugManager } from "@/utils/debug-utils"
import transitionDebugger from "@/utils/transition-debug"
import { audioManager } from "@/utils/audio-manager"
import GameRenderer from "@/components/pvp-game/game-renderer"
import DebugOverlay from "@/components/pvp-game/debug-overlay"
import ResourceMonitor from "@/components/resource-monitor"
import { updateGameState } from "@/components/pvp-game/game-engine"

export default function GameComponent({ playerId, playerName, isHost, gameMode, initialGameState, onGameEnd }) {
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
    cleanupGame,
    startBackgroundMusic,
    handleGameEnd,
  } = useBaseGameController({
    playerId,
    playerName,
    isHost,
    gameMode,
    initialGameState,
    onGameEnd,
  })

  const bowSoundPlayedRef = useRef(false)
  const fullDrawSoundPlayedRef = useRef(false)
  const specialSoundPlayedRef = useRef(false)
  const minDrawSoundPlayedRef = useRef(false)
  const [showTutorial, setShowTutorial] = useState(true)

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
    })

    transitionDebugger.trackTransition("initialized", "mounting", "GameComponent")

    // Make game state available globally for debugging
    if (typeof window !== "undefined") {
      window.__gameStateRef = gameStateRef
    }

    gameInitializedRef.current = true

    debugManager.logInfo("GAME", `Initializing game with mode: ${gameMode}`)

    // Initialize audio system - using the correct method
    try {
      // Use audioManager.init() directly instead of initializeAudio()
      audioManager.init()
      audioInitializedRef.current = true
      debugManager.logInfo("AUDIO", "Audio system initialized")
    } catch (err) {
      debugManager.logError("AUDIO", "Failed to initialize audio", err)
    }

    // Set initial game state
    setGameState(initialGameState)
    gameStateRef.current = initialGameState

    // Capture initial state
    debugManager.captureState(initialGameState, "Initial State")

    transitionDebugger.trackTransition("mounting", "mounted", "GameComponent")

    // Set up crash detection timer
    const crashDetectionTimer = transitionDebugger.safeSetInterval(
      () => {
        // Check if game has been running for at least 5 seconds
        const gameTime = gameStateRef.current?.gameTime || 0

        if (gameTime > 0 && gameTime < 5) {
          debugManager.logInfo("CRASH_DETECTION", "Game is in early stage, monitoring for crashes")

          // Capture state more frequently during this critical period
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
        const deltaTime = Math.min((now - lastUpdateTimeRef.current) / 1000, 0.1) // Cap delta time to prevent large jumps
        lastUpdateTimeRef.current = now

        // Track entity counts
        if (gameStateRef.current) {
          const entityCounts = {
            players: Object.keys(gameStateRef.current.players).length,
            arrows: gameStateRef.current.arrows?.length || 0,
            walls: gameStateRef.current.walls?.length || 0,
            pickups: gameStateRef.current.pickups?.length || 0,
          }

          debugManager.trackEntities(entityCounts)

          // Check for potential memory leaks
          if (gameStateRef.current.arrows && gameStateRef.current.arrows.length > 100) {
            debugManager.logWarning("GAME_LOOP", "Possible memory leak: Too many arrows", {
              arrowCount: gameStateRef.current.arrows.length,
            })

            // Safety cleanup - remove oldest arrows if too many
            if (gameStateRef.current.arrows.length > 200) {
              gameStateRef.current.arrows = gameStateRef.current.arrows.slice(-100)
              debugManager.logInfo("GAME_LOOP", "Performed safety cleanup of arrows")
            }
          }

          // Update game state with error handling and timeout protection
          let newState = gameStateRef.current

          // Use a promise with timeout to prevent infinite loops in updateGameState
          const updateWithTimeout = () => {
            return new Promise((resolve, reject) => {
              // Set timeout to catch infinite loops
              const timeoutId = setTimeout(() => {
                reject(new Error("Game update timed out - possible infinite loop"))
              }, 500) // 500ms should be more than enough for a single frame

              try {
                const result = updateGameState(gameStateRef.current, deltaTime, handlePlayerDeath)
                clearTimeout(timeoutId)
                resolve(result)
              } catch (error) {
                clearTimeout(timeoutId)
                reject(error)
              }
            })
          }

          // Try to update with timeout protection
          updateWithTimeout()
            .then((result) => {
              newState = result
              continueGameLoop(newState)
            })
            .catch((error) => {
              debugManager.logError("GAME_LOOP", "Error in game update", error)
              debugManager.captureState(gameStateRef.current, "Update Error State")
              // Continue with old state
              continueGameLoop(gameStateRef.current)
            })
        }

        function continueGameLoop(state) {
          // Check for sound effects for the local player
          const localPlayer = state.players[playerId]
          if (localPlayer && audioInitializedRef.current && !audioManager.isSoundMuted()) {
            // Only try to play sounds if audio is initialized and not muted
            try {
              // Bow drawing sound
              if (localPlayer.isDrawingBow && !bowSoundPlayedRef.current) {
                audioManager.playSound("bow-draw")
                bowSoundPlayedRef.current = true
              }

              // Full draw sound (when bow is fully drawn)
              if (localPlayer.isDrawingBow && localPlayer.drawStartTime) {
                const currentTime = Date.now() / 1000
                const drawTime = currentTime - localPlayer.drawStartTime

                if (drawTime >= localPlayer.maxDrawTime && !fullDrawSoundPlayedRef.current) {
                  audioManager.playSound("bow-full-draw")
                  fullDrawSoundPlayedRef.current = true
                }

                // Play sound when minimum draw is reached
                const minDrawTime = localPlayer.maxDrawTime * 0.3 // 30% of max draw time
                if (drawTime >= minDrawTime && !minDrawSoundPlayedRef.current) {
                  audioManager.playSound("bow-min-draw")
                  minDrawSoundPlayedRef.current = true
                }
              }

              // Bow release sound
              if (!localPlayer.isDrawingBow && gameStateRef.current.players[playerId]?.isDrawingBow) {
                // Check if it was a weak shot
                const prevPlayer = gameStateRef.current.players[playerId]
                if (prevPlayer.drawStartTime) {
                  const currentTime = Date.now() / 1000
                  const drawTime = currentTime - prevPlayer.drawStartTime
                  const minDrawTime = prevPlayer.maxDrawTime * 0.3 // 30% of max draw time

                  if (drawTime < minDrawTime) {
                    // Play weak shot sound
                    audioManager.playSound("bow-weak-release")
                  } else {
                    // Play normal release sound
                    audioManager.playSound("bow-release")
                  }
                } else {
                  audioManager.playSound("bow-release")
                }

                bowSoundPlayedRef.current = false
                fullDrawSoundPlayedRef.current = false
                minDrawSoundPlayedRef.current = false
              }

              // Special attack sound
              if (localPlayer.isChargingSpecial && !specialSoundPlayedRef.current) {
                specialSoundPlayedRef.current = true
              }

              // Special attack release sound
              if (!localPlayer.isChargingSpecial && gameStateRef.current.players[playerId]?.isChargingSpecial) {
                audioManager.playSound("special-attack")
                specialSoundPlayedRef.current = false
              }

              // Dash sound
              if (localPlayer.isDashing && !gameStateRef.current.players[playerId]?.isDashing) {
                audioManager.playSound("dash")
              }

              // Hit sound
              if (
                localPlayer.animationState === "hit" &&
                gameStateRef.current.players[playerId]?.animationState !== "hit"
              ) {
                audioManager.playSound("hit")
              }

              // Death sound
              if (
                localPlayer.animationState === "death" &&
                gameStateRef.current.players[playerId]?.animationState !== "death"
              ) {
                audioManager.playSound("death")
              }
            } catch (error) {
              debugManager.logError("AUDIO", "Error playing game sounds", error)
              // Continue game even if sound playback fails
            }
          }

          gameStateRef.current = state
          setGameState(state)

          // Check for game over
          if (state.isGameOver) {
            // Play appropriate game over sound
            if (!audioManager.isSoundMuted()) {
              if (state.winner === playerId) {
                audioManager.playSound("victory")
              } else {
                audioManager.playSound("game-over")
              }
            }

            // Stop background music
            audioManager.stopBackgroundMusic()

            transitionDebugger.trackTransition("playing", "game-over", "GameComponent")

            if (onGameEnd) {
              onGameEnd(state.winner)
            }

            // Log game end
            debugManager.logInfo("GAME", "Game ended", {
              winner: state.winner,
              gameTime: state.gameTime,
              playerCount: Object.keys(state.players).length,
            })
          } else {
            // Continue game loop
            requestAnimationFrameIdRef.current = transitionDebugger.safeRequestAnimationFrame(
              gameLoop,
              `${componentIdRef.current}-game-loop`,
            )
          }

          debugManager.endFrame()
        }
      } catch (error) {
        debugManager.logError("GAME_LOOP", "Critical error in game loop", error)

        // Capture state for debugging
        debugManager.captureState(gameStateRef.current, "Critical Error State")

        // Try to continue the game loop after a short delay
        setTimeout(() => {
          requestAnimationFrameIdRef.current = transitionDebugger.safeRequestAnimationFrame(
            gameLoop,
            `${componentIdRef.current}-game-loop`,
          )
        }, 1000) // 1 second delay to prevent rapid error loops
      }
    }

    const handlePlayerDeath = (playerId) => {
      if (!gameStateRef.current) return

      const player = gameStateRef.current.players[playerId]
      if (!player) return

      // Reduce lives
      player.lives -= 1

      // Check if player is out of lives
      if (player.lives <= 0) {
        player.health = 0
        player.animationState = "death"

        // In duel mode, end the game immediately
        if (gameStateRef.current.gameMode === "duel") {
          // Find the other player and set them as winner
          const winner =
            Object.values(gameStateRef.current.players).find((p) => p.id !== playerId && p.lives > 0)?.id || null

          setGameState((prev) => ({
            ...prev,
            isGameOver: true,
            winner,
          }))

          if (onGameEnd) {
            onGameEnd(winner)
          }
          return
        }

        // For other modes, handle respawn
        player.deaths += 1
        player.respawnTimer = 3 // 3 seconds respawn time

        // Update scores
        if (player.lastDamageFrom && player.lastDamageFrom !== playerId) {
          const killer = gameStateRef.current.players[player.lastDamageFrom]
          if (killer) {
            killer.kills += 1
            killer.score += 10
          }
        }
      }

      // Reset player state for respawn
      if (player.lives > 0) {
        player.health = 100
        player.velocity = { x: 0, y: 0 }
        player.isDrawingBow = false
        player.drawStartTime = null
        player.isChargingSpecial = false
        player.specialChargeStartTime = null
        player.specialAttackCooldown = 0
        player.hitAnimationTimer = 0
      }

      // Check if game should end (for FFA mode)
      const topPlayer = Object.values(gameStateRef.current.players).reduce(
        (top, p) => (p.kills > top.kills ? p : top),
        { kills: -1 },
      )

      if (topPlayer.kills >= 10) {
        setGameState((prev) => ({
          ...prev,
          isGameOver: true,
          winner: topPlayer.id,
        }))

        if (onGameEnd) {
          onGameEnd(topPlayer.id)
        }
      }
    }

    // Start game loop
    requestAnimationFrameIdRef.current = transitionDebugger.safeRequestAnimationFrame(
      gameLoop,
      `${componentIdRef.current}-game-loop`,
    )

    // Start background music if not muted
    if (!audioManager.isSoundMuted()) {
      try {
        audioManager.startBackgroundMusic()
      } catch (err) {
        debugManager.logWarning("AUDIO", "Error starting background music", err)
      }
    }

    // Set up input handlers
    const cleanupInputHandlers = setupGameInputHandlers({
      playerId,
      gameStateRef,
      componentIdRef,
    })

    // Track component unmount
    return () => {
      transitionDebugger.trackTransition("any", "unmounting", "GameComponent")

      // Cancel animation frame
      if (requestAnimationFrameIdRef.current !== null) {
        transitionDebugger.safeCancelAnimationFrame(`${componentIdRef.current}-game-loop`)
        requestAnimationFrameIdRef.current = null
        transitionDebugger.trackCleanup("GameComponent", "Animation Frame", true)
      }

      // Clean up input handlers
      cleanupInputHandlers()

      // Clear intervals
      transitionDebugger.safeClearInterval(`${componentIdRef.current}-crash-detection`)
      clearTimeout(tutorialTimer)

      // Stop background music
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
  }, [playerId, playerName, isHost, gameMode, initialGameState, onGameEnd, setGameState])

  // Update AI players
  useEffect(() => {
    const aiUpdateInterval = transitionDebugger.safeSetInterval(
      () => {
        try {
          if (!gameStateRef.current) return

          Object.keys(gameStateRef.current.players).forEach((id) => {
            if (id.startsWith("ai-")) {
              const ai = gameStateRef.current.players[id]
              if (!ai) return // Skip if AI player doesn't exist

              // Simple AI: move randomly and shoot occasionally
              ai.controls.up = Math.random() > 0.7
              ai.controls.down = Math.random() > 0.7 && !ai.controls.up
              ai.controls.left = Math.random() > 0.7
              ai.controls.right = Math.random() > 0.7 && !ai.controls.left

              // Randomly shoot arrows
              if (Math.random() > 0.95 && !ai.isDrawingBow) {
                ai.controls.shoot = true

                // Release arrow after a random time
                transitionDebugger.safeSetTimeout(
                  () => {
                    try {
                      if (gameStateRef.current?.players[id]) {
                        gameStateRef.current.players[id].controls.shoot = false
                      }
                    } catch (error) {
                      debugManager.logError("AI", "Error in AI arrow release", error)
                    }
                  },
                  Math.random() * 1000 + 200,
                  `${componentIdRef.current}-ai-${id}-release-arrow`,
                )
              }

              // Randomly use special attack
              if (Math.random() > 0.98 && !ai.isChargingSpecial && ai.specialAttackCooldown <= 0) {
                ai.controls.special = true

                // Release special after a random time
                transitionDebugger.safeSetTimeout(
                  () => {
                    try {
                      if (gameStateRef.current?.players[id]) {
                        gameStateRef.current.players[id].controls.special = false
                      }
                    } catch (error) {
                      debugManager.logError("AI", "Error in AI special release", error)
                    }
                  },
                  Math.random() * 500 + 500,
                  `${componentIdRef.current}-ai-${id}-release-special`,
                )
              }

              // Randomly dash
              ai.controls.dash = Math.random() > 0.95

              // Randomly change rotation
              if (Math.random() > 0.9) {
                ai.rotation = Math.random() * Math.PI * 2
              }
            }
          })
        } catch (error) {
          debugManager.logError("AI", "Error in AI update interval", error)
        }
      },
      500,
      `${componentIdRef.current}-ai-update`,
    )

    return () => {
      transitionDebugger.safeClearInterval(`${componentIdRef.current}-ai-update`)
    }
  }, [componentIdRef, gameStateRef])

  // Track renders
  useEffect(() => {
    debugManager.trackComponentRender("GameComponent")
  })

  // Show loading state while game initializes
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

      {/* Resource Monitor */}
      <ResourceMonitor visible={showResourceMonitor} position="bottom-right" />

      {/* Small hint text */}
      <div className="absolute bottom-2 right-2 text-xs text-white/70 bg-black/20 backdrop-blur-sm px-2 py-1 rounded">
        Press M to toggle sound | F3 for debug | F8 for game debug | F11 for resource monitor
      </div>
    </div>
  )
}
