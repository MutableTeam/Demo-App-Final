"use client"

import { useEffect, useRef, useState } from "react"
import { createInitialGameState, createPlayer, type GameState, updateGameState } from "./game-engine"
import GameRenderer from "./game-renderer"
import {
  playBowDrawSound,
  playBowReleaseSound,
  playBowFullDrawSound,
  playSpecialAttackSound,
  playHitSound,
  playDeathSound,
  playDashSound,
  playGameOverSound,
  playVictorySound,
  startBackgroundMusic,
  stopBackgroundMusic,
  audioManager,
  playExplosionSound,
} from "@/utils/audio-manager"
import { debugManager, DebugLevel } from "@/utils/debug-utils"
import transitionDebugger from "@/utils/transition-debug"
import { createAIController, AIDifficulty } from "../../utils/game-ai"
import type { PlatformType } from "@/contexts/platform-context"
import { cn } from "@/lib/utils"

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
  gameId?: string
  onGameStart?: () => void
  onGamePause?: () => void
  onGameStop?: () => void
  onGameReset?: () => void
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
  className,
}: GameControllerEnhancedProps) {
  // Use a function to initialize state to ensure it's only created once
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialState = createInitialGameState()
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
  const componentIdRef = useRef<string>(`game-controller-${Date.now()}`)
  const animationTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({})

  // Initialize debug system
  useEffect(() => {
    debugManager.updateConfig({
      enabled: true,
      level: DebugLevel.DEBUG,
      capturePerformance: true,
    })

    debugManager.logInfo("GAME", "Debug system initialized for enhanced game controller")
    debugManager.logInfo("GAME", `Platform type: ${platformType}`)
    transitionDebugger.trackTransition("none", "initialized", "GameControllerEnhanced")

    return () => {
      // Cleanup handled in main useEffect
    }
  }, [platformType])

  // Initialize game
  useEffect(() => {
    if (gameInitializedRef.current) return

    audioManager
      .init()
      .then(() => {
        audioInitializedRef.current = true
        debugManager.logInfo("AUDIO", "Audio system initialized")
      })
      .catch((err) => {
        debugManager.logError("AUDIO", "Failed to initialize audio", err)
      })

    debugManager.setupGlobalErrorTracking()

    debugManager.trackComponentMount("GameControllerEnhanced", {
      playerId,
      playerName,
      isHost,
      gameMode,
      useEnhancedPhysics,
      platformType,
    })

    transitionDebugger.trackTransition("initialized", "mounting", "GameControllerEnhanced")

    if (typeof window !== "undefined") {
      ;(window as any).__gameStateRef = gameStateRef
    }

    gameInitializedRef.current = true

    debugManager.logInfo("GAME", `Initializing enhanced game with mode: ${gameMode}, platform: ${platformType}`)

    // Create local player
    const playerColors = ["#FF5252", "#4CAF50", "#2196F3", "#FFC107"]
    const playerPositions = [
      { x: 100, y: 100 },
      { x: 700, y: 500 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
    ]

    const currentState = { ...gameStateRef.current }

    const localPlayer = createPlayer(playerId, playerName, playerPositions[0], playerColors[0])
    localPlayer.controls = {
      up: false,
      down: false,
      left: false,
      right: false,
      shoot: false,
      special: false,
      dash: false,
    }
    localPlayer.rotation = 0
    localPlayer.size = 20
    localPlayer.animationState = "idle"
    localPlayer.isDrawingBow = false
    localPlayer.isDashing = false
    localPlayer.isChargingSpecial = false
    localPlayer.drawPower = 0

    currentState.players[playerId] = localPlayer
    debugManager.logInfo("GAME", `Created player with ID: ${playerId}, name: ${playerName}`)

    let aiCount = 1
    if (gameMode === "ffa" || gameMode === "timed") {
      aiCount = 3
    }

    debugManager.logInfo("GAME", `Adding ${aiCount} AI opponents for game mode: ${gameMode}`)

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
      }
      aiPlayer.rotation = 0
      aiPlayer.size = 20
      aiPlayer.animationState = "idle"
      aiPlayer.isDrawingBow = false
      aiPlayer.isDashing = false
      aiPlayer.isChargingSpecial = false

      currentState.players[aiId] = aiPlayer

      const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
      aiControllersRef.current[aiId] = createAIController(randomDifficulty)

      debugManager.logInfo("GAME", `Created AI player ${aiId} with difficulty: ${randomDifficulty}`)
    }

    setGameState(currentState)
    gameStateRef.current = currentState

    debugManager.captureState(currentState, "Initial State")

    transitionDebugger.trackTransition("mounting", "mounted", "GameControllerEnhanced")

    // Start game loop
    const gameLoop = (timestamp: number) => {
      try {
        debugManager.startFrame()

        const now = Date.now()
        const deltaTime = Math.min((now - lastUpdateTimeRef.current) / 1000, 0.1)
        lastUpdateTimeRef.current = now

        const entityCounts = {
          players: Object.keys(gameStateRef.current.players).length,
          arrows: gameStateRef.current.arrows?.length || 0,
          walls: gameStateRef.current.walls?.length || 0,
          pickups: gameStateRef.current.pickups?.length || 0,
        }

        debugManager.trackEntities(entityCounts)

        if ((gameStateRef.current.arrows?.length || 0) > 100) {
          debugManager.logWarning("GAME_LOOP", "Possible memory leak: Too many arrows", {
            arrowCount: gameStateRef.current.arrows?.length || 0,
          })

          if ((gameStateRef.current.arrows?.length || 0) > 200) {
            gameStateRef.current.arrows = gameStateRef.current.arrows?.slice(-100) || []
            debugManager.logInfo("GAME_LOOP", "Performed safety cleanup of arrows")
          }
        }

        // Update AI controls
        Object.keys(aiControllersRef.current).forEach((aiId) => {
          if (gameStateRef.current.players[aiId]) {
            const aiController = aiControllersRef.current[aiId]
            const { controls, targetRotation } = aiController.update(aiId, gameStateRef.current, deltaTime)

            gameStateRef.current.players[aiId].controls = controls
            gameStateRef.current.players[aiId].rotation = targetRotation
          }
        })

        const updateWithTimeout = () => {
          return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              reject(new Error("Game update timed out - possible infinite loop"))
            }, 500)

            try {
              const result = updateGameState(gameStateRef.current, deltaTime)
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
            const newState = result as GameState
            continueGameLoop(newState)
          })
          .catch((error) => {
            debugManager.logError("GAME_LOOP", "Error in game update", error)
            debugManager.captureState(gameStateRef.current, "Update Error State")
            continueGameLoop(gameStateRef.current)
          })

        function continueGameLoop(state: GameState) {
          const localPlayer = state.players[playerId]
          if (localPlayer && audioInitializedRef.current && !audioManager.isSoundMuted()) {
            try {
              if (localPlayer.isDrawingBow && !bowSoundPlayedRef.current) {
                playBowDrawSound()
                bowSoundPlayedRef.current = true
              }

              if (localPlayer.isDrawingBow && localPlayer.drawStartTime) {
                const currentTime = Date.now() / 1000
                const drawTime = currentTime - localPlayer.drawStartTime

                if (drawTime >= (localPlayer.maxDrawTime || 2) && !fullDrawSoundPlayedRef.current) {
                  playBowFullDrawSound()
                  fullDrawSoundPlayedRef.current = true
                }
              }

              if (!localPlayer.isDrawingBow && gameStateRef.current.players[playerId]?.isDrawingBow) {
                playBowReleaseSound()
                bowSoundPlayedRef.current = false
                fullDrawSoundPlayedRef.current = false
              }

              if (localPlayer.isChargingSpecial && !specialSoundPlayedRef.current) {
                specialSoundPlayedRef.current = true
              }

              if (!localPlayer.isChargingSpecial && gameStateRef.current.players[playerId]?.isChargingSpecial) {
                playSpecialAttackSound()
                specialSoundPlayedRef.current = false
              }

              if (localPlayer.isDashing && !gameStateRef.current.players[playerId]?.isDashing) {
                playDashSound()
              }

              if (
                localPlayer.animationState === "hit" &&
                gameStateRef.current.players[playerId]?.animationState !== "hit"
              ) {
                playHitSound()
              }

              if (
                localPlayer.animationState === "death" &&
                gameStateRef.current.players[playerId]?.animationState !== "death"
              ) {
                playDeathSound()
              }

              if (localPlayer.controls?.explosiveArrow && (localPlayer.explosiveArrowCooldown || 0) <= 0) {
                playExplosionSound()
              }
            } catch (error) {
              debugManager.logError("AUDIO", "Error playing game sounds", error)
            }
          }

          gameStateRef.current = state
          setGameState(state)

          if (state.isGameOver && onGameEnd) {
            if (!audioManager.isSoundMuted()) {
              if (state.winner === playerId) {
                playVictorySound()
              } else {
                playGameOverSound()
              }
            }

            stopBackgroundMusic()

            transitionDebugger.trackTransition("playing", "game-over", "GameControllerEnhanced")

            onGameEnd(state.winner)

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

    requestAnimationFrameIdRef.current = transitionDebugger.safeRequestAnimationFrame(
      gameLoop,
      `${componentIdRef.current}-game-loop`,
    )

    if (!audioManager.isSoundMuted()) {
      try {
        const musicPromise = startBackgroundMusic()
        if (musicPromise && typeof musicPromise.catch === "function") {
          musicPromise.catch((err) => {
            debugManager.logWarning("AUDIO", "Failed to start background music", err)
          })
        }
      } catch (err) {
        debugManager.logWarning("AUDIO", "Error starting background music", err)
      }
    }

    // Set up controls for desktop only
    if (platformType === "desktop") {
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
            if (!player.isDashing && (player.dashCooldown || 0) <= 0) {
              player.controls.dash = true
            }
            break
          case "m":
            audioManager.toggleMute()
            break
          case "e":
            if (gameStateRef.current.players[playerId]) {
              gameStateRef.current.players[playerId].controls.explosiveArrow = true
            }
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
            if (gameStateRef.current.players[playerId]) {
              gameStateRef.current.players[playerId].controls.explosiveArrow = false
            }
            break
        }

        if (
          !player.isDrawingBow &&
          !player.isDashing &&
          !player.isChargingSpecial &&
          player.health > 0 &&
          (player.hitAnimationTimer || 0) <= 0 &&
          (player.animationState === "fire" || player.animationState === "special" || player.animationState === "hit")
        ) {
          const isMoving = player.controls.up || player.controls.down || player.controls.left || player.controls.right

          if (isMoving) {
            player.animationState = "run"
          } else {
            player.animationState = "idle"
          }
          player.lastAnimationChange = Date.now()
        }
      }

      const handleMouseMove = (e: MouseEvent) => {
        if (!gameStateRef.current.players[playerId]) return

        const player = gameStateRef.current.players[playerId]
        const canvas = document.querySelector("canvas")
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()

        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const dx = mouseX - player.position.x
        const dy = mouseY - player.position.y
        player.rotation = Math.atan2(dy, dx)
      }

      const handleMouseDown = (e: MouseEvent) => {
        if (!gameStateRef.current.players[playerId]) return

        if (e.button === 0) {
          gameStateRef.current.players[playerId].controls.shoot = true
        } else if (e.button === 2) {
          gameStateRef.current.players[playerId].controls.special = true
        }
      }

      const handleMouseUp = (e: MouseEvent) => {
        if (!gameStateRef.current.players[playerId]) return

        const player = gameStateRef.current.players[playerId]

        if (e.button === 0) {
          player.controls.shoot = false

          if (player.animationState === "fire") {
            if (animationTimeoutsRef.current[playerId]) {
              clearTimeout(animationTimeoutsRef.current[playerId])
            }

            animationTimeoutsRef.current[playerId] = setTimeout(() => {
              if (
                gameStateRef.current.players[playerId] &&
                gameStateRef.current.players[playerId].animationState === "fire" &&
                !gameStateRef.current.players[playerId].isDrawingBow
              ) {
                const isMoving =
                  player.controls.up || player.controls.down || player.controls.left || player.controls.right

                gameStateRef.current.players[playerId].animationState = isMoving ? "run" : "idle"
                gameStateRef.current.players[playerId].lastAnimationChange = Date.now()
              }
            }, 300)
          }
        } else if (e.button === 2) {
          player.controls.special = false

          if (player.animationState === "special" || player.animationState === "fire") {
            if (animationTimeoutsRef.current[playerId]) {
              clearTimeout(animationTimeoutsRef.current[playerId])
            }

            animationTimeoutsRef.current[playerId] = setTimeout(() => {
              if (
                gameStateRef.current.players[playerId] &&
                (gameStateRef.current.players[playerId].animationState === "special" ||
                  gameStateRef.current.players[playerId].animationState === "fire") &&
                !gameStateRef.current.players[playerId].isChargingSpecial
              ) {
                const isMoving =
                  player.controls.up || player.controls.down || player.controls.left || player.controls.right

                gameStateRef.current.players[playerId].animationState = isMoving ? "run" : "idle"
                gameStateRef.current.players[playerId].lastAnimationChange = Date.now()
              }
            }, 300)
          }
        }
      }

      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault()
      }

      transitionDebugger.safeAddEventListener(
        window,
        "keydown",
        handleKeyDown,
        undefined,
        `${componentIdRef.current}-game-keydown`,
      )
      transitionDebugger.safeAddEventListener(
        window,
        "keyup",
        handleKeyUp,
        undefined,
        `${componentIdRef.current}-game-keyup`,
      )
      transitionDebugger.safeAddEventListener(
        document,
        "mousemove",
        handleMouseMove,
        undefined,
        `${componentIdRef.current}-mousemove`,
      )
      transitionDebugger.safeAddEventListener(
        document,
        "mousedown",
        handleMouseDown,
        undefined,
        `${componentIdRef.current}-mousedown`,
      )
      transitionDebugger.safeAddEventListener(
        document,
        "mouseup",
        handleMouseUp,
        undefined,
        `${componentIdRef.current}-mouseup`,
      )
      transitionDebugger.safeAddEventListener(
        document,
        "contextmenu",
        handleContextMenu,
        undefined,
        `${componentIdRef.current}-contextmenu`,
      )
    }

    const resumeAudio = () => {
      if (!audioManager.isSoundMuted()) {
        audioManager.resumeAudioContext()
      }
    }
    transitionDebugger.safeAddEventListener(
      document,
      "click",
      resumeAudio,
      undefined,
      `${componentIdRef.current}-resume-audio`,
    )

    debugManager.trackComponentUnmount("GameControllerEnhanced", "useEffect cleanup")

    return () => {
      transitionDebugger.trackTransition("any", "unmounting", "GameControllerEnhanced")

      if (requestAnimationFrameIdRef.current !== null) {
        transitionDebugger.safeCancelAnimationFrame(`${componentIdRef.current}-game-loop`)
        requestAnimationFrameIdRef.current = null
        transitionDebugger.trackCleanup("GameControllerEnhanced", "Animation Frame", true)
      }

      Object.keys(animationTimeoutsRef.current).forEach((key) => {
        clearTimeout(animationTimeoutsRef.current[key])
      })
      animationTimeoutsRef.current = {}

      if (platformType === "desktop") {
        transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-game-keydown`)
        transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-game-keyup`)
        transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-mousemove`)
        transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-mousedown`)
        transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-mouseup`)
        transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-contextmenu`)
      }
      transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-resume-audio`)

      try {
        stopBackgroundMusic()
        transitionDebugger.trackCleanup("GameControllerEnhanced", "Background Music", true)
      } catch (err) {
        debugManager.logWarning("AUDIO", "Error stopping background music", err)
        transitionDebugger.trackCleanup("GameControllerEnhanced", "Background Music", false, err)
      }

      debugManager.logInfo("GAME", "Enhanced game cleanup completed")
      transitionDebugger.trackTransition("unmounting", "unmounted", "GameControllerEnhanced")
      debugManager.trackComponentUnmount("GameControllerEnhanced")
    }
  }, [playerId, playerName, isHost, gameMode, onGameEnd, useEnhancedPhysics, platformType])

  useEffect(() => {
    debugManager.trackComponentRender("GameControllerEnhanced")
  })

  const gameRenderer = <GameRenderer gameState={gameState} localPlayerId={playerId} />

  return <div className={cn("relative w-full h-[600px] bg-gray-900", className)}>{gameRenderer}</div>
}
