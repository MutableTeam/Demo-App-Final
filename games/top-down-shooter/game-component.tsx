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
import { useIsMobile } from "@/hooks/use-mobile"

export default function GameComponent({ playerId, playerName, isHost, gameMode, initialGameState, onGameEnd }) {
  const isMobile = useIsMobile()
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
  const joystickManagerRef = useRef(null)
  const [joystickData, setJoystickData] = useState({
    x: 0,
    y: 0,
    angle: 0,
    force: 0,
  })

  useEffect(() => {
    if (gameInitializedRef.current) return

    debugManager.setupGlobalErrorTracking()

    debugManager.trackComponentMount("GameComponent", {
      playerId,
      playerName,
      isHost,
      gameMode,
    })

    transitionDebugger.trackTransition("initialized", "mounting", "GameComponent")

    if (typeof window !== "undefined") {
      window.__gameStateRef = gameStateRef
    }

    gameInitializedRef.current = true

    debugManager.logInfo("GAME", `Initializing game with mode: ${gameMode}`)

    try {
      audioManager.init()
      audioInitializedRef.current = true
      debugManager.logInfo("AUDIO", "Audio system initialized")
    } catch (err) {
      debugManager.logError("AUDIO", "Failed to initialize audio", err)
    }

    setGameState(initialGameState)
    gameStateRef.current = initialGameState

    debugManager.captureState(initialGameState, "Initial State")

    transitionDebugger.trackTransition("mounting", "mounted", "GameComponent")

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

    const tutorialTimer = setTimeout(() => {
      setShowTutorial(false)
    }, 10000)

    const gameLoop = (timestamp) => {
      try {
        debugManager.startFrame()

        const now = Date.now()
        const deltaTime = Math.min((now - lastUpdateTimeRef.current) / 1000, 0.1)
        lastUpdateTimeRef.current = now

        if (gameStateRef.current) {
          const entityCounts = {
            players: Object.keys(gameStateRef.current.players).length,
            arrows: gameStateRef.current.arrows?.length || 0,
            walls: gameStateRef.current.walls?.length || 0,
            pickups: gameStateRef.current.pickups?.length || 0,
          }

          debugManager.trackEntities(entityCounts)

          if (gameStateRef.current.arrows && gameStateRef.current.arrows.length > 100) {
            debugManager.logWarning("GAME_LOOP", "Possible memory leak: Too many arrows", {
              arrowCount: gameStateRef.current.arrows.length,
            })

            if (gameStateRef.current.arrows.length > 200) {
              gameStateRef.current.arrows = gameStateRef.current.arrows.slice(-100)
              debugManager.logInfo("GAME_LOOP", "Performed safety cleanup of arrows")
            }
          }

          const updateWithTimeout = () => {
            return new Promise((resolve, reject) => {
              const timeoutId = setTimeout(() => {
                reject(new Error("Game update timed out - possible infinite loop"))
              }, 500)

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

          updateWithTimeout()
            .then((result) => {
              continueGameLoop(result)
            })
            .catch((error) => {
              debugManager.logError("GAME_LOOP", "Error in game update", error)
              debugManager.captureState(gameStateRef.current, "Update Error State")
              continueGameLoop(gameStateRef.current)
            })
        }

        function continueGameLoop(state) {
          const localPlayer = state.players[playerId]
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

              if (localPlayer.isChargingSpecial && !specialSoundPlayedRef.current) {
                specialSoundPlayedRef.current = true
              }

              if (!localPlayer.isChargingSpecial && gameStateRef.current.players[playerId]?.isChargingSpecial) {
                audioManager.playSound("special-attack")
                specialSoundPlayedRef.current = false
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

          gameStateRef.current = state
          setGameState(state)

          if (state.isGameOver) {
            if (!audioManager.isSoundMuted()) {
              if (state.winner === playerId) {
                audioManager.playSound("victory")
              } else {
                audioManager.playSound("game-over")
              }
            }

            audioManager.stopBackgroundMusic()

            transitionDebugger.trackTransition("playing", "game-over", "GameComponent")

            if (onGameEnd) {
              onGameEnd(state.winner)
            }

            debugManager.logInfo("GAME", "Game ended", {
              winner: state.winner,
              gameTime: state.gameTime,
              playerCount: Object.keys(state.players).length,
            })
          } else {
            requestAnimationFrameIdRef.current = transitionDebugger.safeRequestAnimationFrame(
              gameLoop,
              `${componentIdRef.current}-game-loop`,
            )
          }

          debugManager.endFrame()
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

    const handlePlayerDeath = (playerId) => {
      if (!gameStateRef.current) return

      const player = gameStateRef.current.players[playerId]
      if (!player) return

      player.lives -= 1

      if (player.lives <= 0) {
        player.health = 0
        player.animationState = "death"

        if (gameStateRef.current.gameMode === "duel") {
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

        player.deaths += 1
        player.respawnTimer = 3

        if (player.lastDamageFrom && player.lastDamageFrom !== playerId) {
          const killer = gameStateRef.current.players[player.lastDamageFrom]
          if (killer) {
            killer.kills += 1
            killer.score += 10
          }
        }
      }

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

    const cleanupInputHandlers = setupGameInputHandlers({
      playerId,
      gameStateRef,
      componentIdRef,
    })

    return () => {
      transitionDebugger.trackTransition("any", "unmounting", "GameComponent")

      if (requestAnimationFrameIdRef.current !== null) {
        transitionDebugger.safeCancelAnimationFrame(`${componentIdRef.current}-game-loop`)
        requestAnimationFrameIdRef.current = null
        transitionDebugger.trackCleanup("GameComponent", "Animation Frame", true)
      }

      cleanupInputHandlers()

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
  }, [playerId, playerName, isHost, gameMode, initialGameState, onGameEnd, setGameState])

  useEffect(() => {
    if (!isMobile) return

    import("react-joystick-component")
      .then((JoystickModule) => {
        const { Joystick } = JoystickModule

        const joystickZone = document.getElementById("joystick-zone")
        if (!joystickZone) return

        joystickZone.innerHTML = ""

        import("react-dom/client").then(({ createRoot }) => {
          const root = createRoot(joystickZone)

          const JoystickComponent = () => (
            <Joystick
              size={100}
              sticky={false}
              baseColor="#ffffff40"
              stickColor="#ffffff"
              move={(event) => {
                if (event && gameStateRef.current?.players?.[playerId]) {
                  const player = gameStateRef.current.players[playerId]
                  const threshold = 0.3

                  const normalizedX = event.x ? event.x / 100 : 0
                  const normalizedY = event.y ? event.y / 100 : 0

                  player.controls.up = normalizedY < -threshold
                  player.controls.down = normalizedY > threshold
                  player.controls.left = normalizedX < -threshold
                  player.controls.right = normalizedX > threshold

                  setJoystickData({
                    x: normalizedX,
                    y: normalizedY,
                    angle: Math.atan2(normalizedY, normalizedX),
                    force: Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY),
                  })
                }
              }}
              stop={() => {
                if (gameStateRef.current?.players?.[playerId]) {
                  const player = gameStateRef.current.players[playerId]
                  player.controls.up = false
                  player.controls.down = false
                  player.controls.left = false
                  player.controls.right = false
                }

                setJoystickData({
                  x: 0,
                  y: 0,
                  angle: 0,
                  force: 0,
                })
              }}
            />
          )

          root.render(<JoystickComponent />)
          joystickManagerRef.current = root
        })
      })
      .catch((error) => {
        debugManager.logError("JOYSTICK", "Failed to load react-joystick-component", error)
        createFallbackJoystick()
      })

    return () => {
      if (joystickManagerRef.current) {
        joystickManagerRef.current.unmount()
        joystickManagerRef.current = null
      }
    }
  }, [playerId, isMobile])

  const createFallbackJoystick = () => {
    const joystickZone = document.getElementById("joystick-zone")
    if (!joystickZone) return

    joystickZone.innerHTML = `
      <div style="
        width: 100px;
        height: 100px;
        border: 2px solid rgba(255,255,255,0.5);
        border-radius: 50%;
        position: relative;
        background: rgba(255,255,255,0.1);
      ">
        <div id="joystick-knob" style="
          width: 30px;
          height: 30px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          cursor: pointer;
        "></div>
      </div>
    `

    let isDragging = false
    const knob = document.getElementById("joystick-knob")
    const zone = joystickZone.firstElementChild as HTMLElement

    const handleStart = (clientX: number, clientY: number) => {
      isDragging = true
      updateKnobPosition(clientX, clientY)
    }

    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging) return
      updateKnobPosition(clientX, clientY)
    }

    const handleEnd = () => {
      isDragging = false
      if (knob) {
        knob.style.transform = "translate(-50%, -50%)"
      }

      if (gameStateRef.current?.players?.[playerId]) {
        const player = gameStateRef.current.players[playerId]
        player.controls.up = false
        player.controls.down = false
        player.controls.left = false
        player.controls.right = false
      }

      setJoystickData({ x: 0, y: 0, angle: 0, force: 0 })
    }

    const updateKnobPosition = (clientX: number, clientY: number) => {
      if (!zone || !knob) return

      const rect = zone.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = clientX - centerX
      const deltaY = clientY - centerY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const maxDistance = 35

      let x = deltaX
      let y = deltaY

      if (distance > maxDistance) {
        x = (deltaX / distance) * maxDistance
        y = (deltaY / distance) * maxDistance
      }

      knob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`

      const normalizedX = x / maxDistance
      const normalizedY = y / maxDistance
      const threshold = 0.3

      if (gameStateRef.current?.players?.[playerId]) {
        const player = gameStateRef.current.players[playerId]
        player.controls.up = normalizedY < -threshold
        player.controls.down = normalizedY > threshold
        player.controls.left = normalizedX < -threshold
        player.controls.right = normalizedX > threshold
      }

      setJoystickData({
        x: normalizedX,
        y: normalizedY,
        angle: Math.atan2(normalizedY, normalizedX),
        force: Math.min(distance / maxDistance, 1),
      })
    }

    knob?.addEventListener("touchstart", (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      handleStart(touch.clientX, touch.clientY)
    })

    document.addEventListener("touchmove", (e) => {
      if (!isDragging) return
      e.preventDefault()
      const touch = e.touches[0]
      handleMove(touch.clientX, touch.clientY)
    })

    document.addEventListener("touchend", handleEnd)

    knob?.addEventListener("mousedown", (e) => {
      e.preventDefault()
      handleStart(e.clientX, e.clientY)
    })

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return
      e.preventDefault()
      handleMove(e.clientX, e.clientY)
    })

    document.addEventListener("mouseup", handleEnd)
  }

  useEffect(() => {
    const aiUpdateInterval = transitionDebugger.safeSetInterval(
      () => {
        try {
          if (!gameStateRef.current) return

          Object.keys(gameStateRef.current.players).forEach((id) => {
            if (id.startsWith("ai-")) {
              const ai = gameStateRef.current.players[id]
              if (!ai) return

              ai.controls.up = Math.random() > 0.7
              ai.controls.down = Math.random() > 0.7 && !ai.controls.up
              ai.controls.left = Math.random() > 0.7
              ai.controls.right = Math.random() > 0.7 && !ai.controls.left

              if (Math.random() > 0.95 && !ai.isDrawingBow) {
                ai.controls.shoot = true

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

              if (Math.random() > 0.98 && !ai.isChargingSpecial && ai.specialAttackCooldown <= 0) {
                ai.controls.special = true

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

              ai.controls.dash = Math.random() > 0.95

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

      {isMobile && (
        <>
          <div
            id="joystick-zone"
            className="absolute bottom-4 left-4 w-32 h-32 pointer-events-auto"
            style={{ zIndex: 1000 }}
          />

          <div className="absolute bottom-4 right-4 flex flex-col gap-2" style={{ zIndex: 1000 }}>
            <button
              className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
              onTouchStart={(e) => {
                e.preventDefault()
                if (gameStateRef.current?.players?.[playerId]) {
                  gameStateRef.current.players[playerId].controls.shoot = true
                }
              }}
              onTouchEnd={(e) => {
                e.preventDefault()
                if (gameStateRef.current?.players?.[playerId]) {
                  gameStateRef.current.players[playerId].controls.shoot = false
                }
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                if (gameStateRef.current?.players?.[playerId]) {
                  gameStateRef.current.players[playerId].controls.shoot = true
                }
              }}
              onMouseUp={(e) => {
                e.preventDefault()
                if (gameStateRef.current?.players?.[playerId]) {
                  gameStateRef.current.players[playerId].controls.shoot = false
                }
              }}
            >
              🏹
            </button>

            <button
              className="w-16 h-16 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
              onTouchStart={(e) => {
                e.preventDefault()
                if (gameStateRef.current?.players?.[playerId]) {
                  gameStateRef.current.players[playerId].controls.special = true
                }
              }}
              onTouchEnd={(e) => {
                e.preventDefault()
                if (gameStateRef.current?.players?.[playerId]) {
                  gameStateRef.current.players[playerId].controls.special = false
                }
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                if (gameStateRef.current?.players?.[playerId]) {
                  gameStateRef.current.players[playerId].controls.special = true
                }
              }}
              onMouseUp={(e) => {
                e.preventDefault()
                if (gameStateRef.current?.players?.[playerId]) {
                  gameStateRef.current.players[playerId].controls.special = false
                }
              }}
            >
              ⚡
            </button>

            <button
              className="w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
              onTouchStart={(e) => {
                e.preventDefault()
                if (gameStateRef.current?.players?.[playerId]) {
                  gameStateRef.current.players[playerId].controls.dash = true
                }
              }}
              onTouchEnd={(e) => {
                e.preventDefault()
                if (gameStateRef.current?.players?.[playerId]) {
                  gameStateRef.current.players[playerId].controls.dash = false
                }
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                if (gameStateRef.current?.players?.[playerId]) {
                  gameStateRef.current.players[playerId].controls.dash = true
                }
              }}
              onMouseUp={(e) => {
                e.preventDefault()
                if (gameStateRef.current?.players?.[playerId]) {
                  gameStateRef.current.players[playerId].controls.dash = false
                }
              }}
            >
              💨
            </button>
          </div>
        </>
      )}

      <div className="absolute bottom-2 right-2 text-xs text-white/70 bg-black/20 backdrop-blur-sm px-2 py-1 rounded">
        {isMobile
          ? "Use joystick to move, buttons to attack"
          : "Press M to toggle sound | F3 for debug | F8 for game debug | F11 for resource monitor"}
      </div>
    </div>
  )
}
