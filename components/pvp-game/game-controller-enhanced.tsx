"use client"

import { useEffect, useRef, useState } from "react"
import { createInitialGameState, createPlayer, type GameState, updateGameState } from "./game-engine"
import EnhancedGameRenderer from "./enhanced-game-renderer"
import DebugOverlay from "./debug-overlay"
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
import ResourceMonitor from "@/components/resource-monitor"
import { createAIController, AIDifficulty } from "../../utils/game-ai"
import type { PlatformType } from "@/contexts/platform-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Play, Pause, Square, RotateCcw, Settings, Users, Zap, Monitor, Smartphone, Gamepad2 } from "lucide-react"
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
  gameId: string
  onGameStart: () => void
  onGamePause: () => void
  onGameStop: () => void
  onGameReset: () => void
  gameStats?: GameStats
  isPlaying?: boolean
  isPaused?: boolean
  className?: string
  joystickInput?: { x: number; y: number }
  actionInput?: { action: string; pressed: boolean } | null
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
  joystickInput = { x: 0, y: 0 },
  actionInput = null,
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
  const [showTutorial, setShowTutorial] = useState<boolean>(false)
  const animationTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({})
  const memoryTrackingInterval = useRef<NodeJS.Timeout | null>(null)

  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected")
  const [playersOnline, setPlayersOnline] = useState(0)

  // Touch controls state for mobile
  const [touchControls, setTouchControls] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false,
    special: false,
    dash: false,
  })

  // Update game state ref when state changes
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  // Initialize debug system
  useEffect(() => {
    // Enable debug system with more verbose logging
    debugManager.updateConfig({
      enabled: true,
      level: DebugLevel.DEBUG,
      capturePerformance: true,
    })

    debugManager.logInfo("GAME", "Debug system initialized for enhanced game controller")
    debugManager.logInfo("GAME", `Platform type: ${platformType}`)
    transitionDebugger.trackTransition("none", "initialized", "GameControllerEnhanced")

    // Set up keyboard shortcuts for debug tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // F8 to toggle debug overlay
      if (e.key === "F8") {
        setShowDebug((prev) => !prev)
      }

      // F9 to capture state snapshot
      if (e.key === "F9") {
        debugManager.captureState(gameStateRef.current, "Manual Snapshot")
        debugManager.logInfo("GAME", "Manual state snapshot captured")
      }

      // F11 to toggle resource monitor
      if (e.key === "F11") {
        setShowResourceMonitor((prev) => !prev)
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

  // Handle joystick input from mobile container
  useEffect(() => {
    if (platformType === "mobile" && joystickInput && gameStateRef.current.players[playerId]) {
      const player = gameStateRef.current.players[playerId]

      // Convert joystick input to movement controls
      player.controls.up = joystickInput.y < -0.3
      player.controls.down = joystickInput.y > 0.3
      player.controls.left = joystickInput.x < -0.3
      player.controls.right = joystickInput.x > 0.3

      // Calculate rotation based on joystick direction
      if (Math.abs(joystickInput.x) > 0.1 || Math.abs(joystickInput.y) > 0.1) {
        player.rotation = Math.atan2(joystickInput.y, joystickInput.x)
      }
    }
  }, [joystickInput, platformType, playerId])

  // Handle action input from mobile container
  useEffect(() => {
    if (platformType === "mobile" && actionInput && gameStateRef.current.players[playerId]) {
      const player = gameStateRef.current.players[playerId]

      switch (actionInput.action) {
        case "actionA": // Main attack/shoot
          player.controls.shoot = actionInput.pressed
          break
        case "actionB": // Dash
          player.controls.dash = actionInput.pressed
          break
        case "actionX": // Special attack
          player.controls.special = actionInput.pressed
          break
        case "actionY": // Explosive arrow (if available)
          if (player.controls.explosiveArrow !== undefined) {
            player.controls.explosiveArrow = actionInput.pressed
          }
          break
      }
    }
  }, [actionInput, platformType, playerId])

  // Initialize game
  useEffect(() => {
    // Prevent multiple initializations
    if (gameInitializedRef.current) return

    // Initialize audio directly
    audioManager
      .init()
      .then(() => {
        audioInitializedRef.current = true
        debugManager.logInfo("AUDIO", "Audio system initialized")
      })
      .catch((err) => {
        debugManager.logError("AUDIO", "Failed to initialize audio", err)
      })

    // Enable global error tracking
    debugManager.setupGlobalErrorTracking()

    // Track component mount
    debugManager.trackComponentMount("GameControllerEnhanced", {
      playerId,
      playerName,
      isHost,
      gameMode,
      useEnhancedPhysics,
      platformType,
    })

    transitionDebugger.trackTransition("initialized", "mounting", "GameControllerEnhanced")

    // Make game state available globally for debugging
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

    // Use the current game state
    const currentState = { ...gameStateRef.current }

    // Add local player with enhanced properties for mobile
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

    // Determine number of AI opponents based on game mode
    let aiCount = 1 // Default for duel
    if (gameMode === "ffa" || gameMode === "timed") {
      aiCount = 3 // For FFA or timed match
    }

    debugManager.logInfo("GAME", `Adding ${aiCount} AI opponents for game mode: ${gameMode}`)

    // Add AI players with varying difficulty
    const difficulties = [AIDifficulty.EASY, AIDifficulty.MEDIUM, AIDifficulty.HARD, AIDifficulty.EXPERT]

    for (let i = 1; i <= aiCount; i++) {
      const aiId = `ai-${i}`
      const aiPlayer = createPlayer(
        aiId,
        `AI ${i}`,
        playerPositions[i % playerPositions.length],
        playerColors[i % playerColors.length],
      )

      // Add AI-specific properties
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

      // Assign random difficulty to each AI
      const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
      aiControllersRef.current[aiId] = createAIController(randomDifficulty)

      // Log the AI creation with its difficulty
      debugManager.logInfo("GAME", `Created AI player ${aiId} with difficulty: ${randomDifficulty}`)
    }

    // Update state
    setGameState(currentState)
    gameStateRef.current = currentState

    // Capture initial state
    debugManager.captureState(currentState, "Initial State")

    transitionDebugger.trackTransition("mounting", "mounted", "GameControllerEnhanced")

    // Set up crash detection timer
    const crashDetectionTimer = transitionDebugger.safeSetInterval(
      () => {
        // Check if game has been running for at least 5 seconds
        const gameTime = gameStateRef.current.gameTime

        if (gameTime > 0 && gameTime < 5) {
          debugManager.logInfo("CRASH_DETECTION", "Game is in early stage, monitoring for crashes")

          // Capture state more frequently during this critical period
          debugManager.captureState(gameStateRef.current, "Early Game State")
        }
      },
      1000,
      `${componentIdRef.current}-crash-detection`,
    )

    // Start game loop
    const gameLoop = (timestamp: number) => {
      try {
        debugManager.startFrame()

        const now = Date.now()
        const deltaTime = Math.min((now - lastUpdateTimeRef.current) / 1000, 0.1) // Cap delta time to prevent large jumps
        lastUpdateTimeRef.current = now

        // Track entity counts
        const entityCounts = {
          players: Object.keys(gameStateRef.current.players).length,
          arrows: gameStateRef.current.arrows?.length || 0,
          walls: gameStateRef.current.walls?.length || 0,
          pickups: gameStateRef.current.pickups?.length || 0,
        }

        debugManager.trackEntities(entityCounts)

        // Check for potential memory leaks
        if ((gameStateRef.current.arrows?.length || 0) > 100) {
          debugManager.logWarning("GAME_LOOP", "Possible memory leak: Too many arrows", {
            arrowCount: gameStateRef.current.arrows?.length || 0,
          })

          // Safety cleanup - remove oldest arrows if too many
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

            // Apply AI controls
            gameStateRef.current.players[aiId].controls = controls
            gameStateRef.current.players[aiId].rotation = targetRotation
          }
        })

        // Apply touch controls for mobile platform
        if (platformType === "mobile" && gameStateRef.current.players[playerId]) {
          const player = gameStateRef.current.players[playerId]
          player.controls.up = touchControls.up
          player.controls.down = touchControls.down
          player.controls.left = touchControls.left
          player.controls.right = touchControls.right
          player.controls.shoot = touchControls.shoot
          player.controls.special = touchControls.special
          player.controls.dash = touchControls.dash
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
              const result = updateGameState(gameStateRef.current, deltaTime)
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
            newState = result as GameState
            continueGameLoop(newState)
          })
          .catch((error) => {
            debugManager.logError("GAME_LOOP", "Error in game update", error)
            debugManager.captureState(gameStateRef.current, "Update Error State")
            // Continue with old state
            continueGameLoop(gameStateRef.current)
          })

        function continueGameLoop(state: GameState) {
          // Check for sound effects for the local player
          const localPlayer = state.players[playerId]
          if (localPlayer && audioInitializedRef.current && !audioManager.isSoundMuted()) {
            // Only try to play sounds if audio is initialized and not muted
            try {
              // Bow drawing sound
              if (localPlayer.isDrawingBow && !bowSoundPlayedRef.current) {
                playBowDrawSound()
                bowSoundPlayedRef.current = true
              }

              // Full draw sound (when bow is fully drawn)
              if (localPlayer.isDrawingBow && localPlayer.drawStartTime) {
                const currentTime = Date.now() / 1000
                const drawTime = currentTime - localPlayer.drawStartTime

                if (drawTime >= (localPlayer.maxDrawTime || 2) && !fullDrawSoundPlayedRef.current) {
                  playBowFullDrawSound()
                  fullDrawSoundPlayedRef.current = true
                }
              }

              // Bow release sound
              if (!localPlayer.isDrawingBow && gameStateRef.current.players[playerId]?.isDrawingBow) {
                playBowReleaseSound()
                bowSoundPlayedRef.current = false
                fullDrawSoundPlayedRef.current = false
              }

              // Special attack sound
              if (localPlayer.isChargingSpecial && !specialSoundPlayedRef.current) {
                specialSoundPlayedRef.current = true
              }

              // Special attack release sound
              if (!localPlayer.isChargingSpecial && gameStateRef.current.players[playerId]?.isChargingSpecial) {
                playSpecialAttackSound()
                specialSoundPlayedRef.current = false
              }

              // Dash sound
              if (localPlayer.isDashing && !gameStateRef.current.players[playerId]?.isDashing) {
                playDashSound()
              }

              // Hit sound
              if (
                localPlayer.animationState === "hit" &&
                gameStateRef.current.players[playerId]?.animationState !== "hit"
              ) {
                playHitSound()
              }

              // Death sound
              if (
                localPlayer.animationState === "death" &&
                gameStateRef.current.players[playerId]?.animationState !== "death"
              ) {
                playDeathSound()
              }

              // Explosive arrow sound
              if (localPlayer.controls?.explosiveArrow && (localPlayer.explosiveArrowCooldown || 0) <= 0) {
                playExplosionSound()
              }
            } catch (error) {
              debugManager.logError("AUDIO", "Error playing game sounds", error)
              // Continue game even if sound playback fails
            }
          }

          gameStateRef.current = state
          setGameState(state)

          // Check for game over
          if (state.isGameOver && onGameEnd) {
            // Play appropriate game over sound
            if (!audioManager.isSoundMuted()) {
              if (state.winner === playerId) {
                playVictorySound()
              } else {
                playGameOverSound()
              }
            }

            // Stop background music
            stopBackgroundMusic()

            transitionDebugger.trackTransition("playing", "game-over", "GameControllerEnhanced")

            onGameEnd(state.winner)

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

    // Start game loop
    requestAnimationFrameIdRef.current = transitionDebugger.safeRequestAnimationFrame(
      gameLoop,
      `${componentIdRef.current}-game-loop`,
    )

    // Start background music if not muted
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

    // Set up controls based on platform type
    if (platformType === "desktop") {
      // Desktop keyboard controls
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
            // Only trigger dash if not already dashing and cooldown is complete
            if (!player.isDashing && (player.dashCooldown || 0) <= 0) {
              player.controls.dash = true
            }
            break
          // Toggle debug mode with F3
          case "f3":
            setShowDebug((prev) => !prev)
            break
          // Toggle mute with M
          case "m":
            audioManager.toggleMute()
            break
          case "f10":
            setShowDiagnostics((prev) => !prev)
            break
          case "f11":
            setShowResourceMonitor((prev) => !prev)
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

        // Check if player should return to run animation after key release
        if (
          !player.isDrawingBow &&
          !player.isDashing &&
          !player.isChargingSpecial &&
          player.health > 0 &&
          (player.hitAnimationTimer || 0) <= 0 &&
          (player.animationState === "fire" || player.animationState === "special" || player.animationState === "hit")
        ) {
          // Check if any movement keys are still pressed
          const isMoving = player.controls.up || player.controls.down || player.controls.left || player.controls.right

          // Set appropriate animation state
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

        // Calculate mouse position relative to canvas
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        // Calculate angle between player and mouse
        const dx = mouseX - player.position.x
        const dy = mouseY - player.position.y
        player.rotation = Math.atan2(dy, dx)
      }

      const handleMouseDown = (e: MouseEvent) => {
        if (!gameStateRef.current.players[playerId]) return

        if (e.button === 0) {
          // Left click - start drawing bow
          gameStateRef.current.players[playerId].controls.shoot = true
        } else if (e.button === 2) {
          // Right click - start charging special attack
          gameStateRef.current.players[playerId].controls.special = true
        }
      }

      const handleMouseUp = (e: MouseEvent) => {
        if (!gameStateRef.current.players[playerId]) return

        const player = gameStateRef.current.players[playerId]

        if (e.button === 0) {
          // Left click release - fire arrow
          player.controls.shoot = false

          // Schedule transition back to run/idle after firing animation completes
          if (player.animationState === "fire") {
            // Clear any existing timeout for this player
            if (animationTimeoutsRef.current[playerId]) {
              clearTimeout(animationTimeoutsRef.current[playerId])
            }

            // Set a timeout to change animation state after a short delay
            animationTimeoutsRef.current[playerId] = setTimeout(() => {
              if (
                gameStateRef.current.players[playerId] &&
                gameStateRef.current.players[playerId].animationState === "fire" &&
                !gameStateRef.current.players[playerId].isDrawingBow
              ) {
                // Check if player is moving
                const isMoving =
                  player.controls.up || player.controls.down || player.controls.left || player.controls.right

                // Set appropriate animation
                gameStateRef.current.players[playerId].animationState = isMoving ? "run" : "idle"
                gameStateRef.current.players[playerId].lastAnimationChange = Date.now()
              }
            }, 300) // Short delay to allow fire animation to complete
          }
        } else if (e.button === 2) {
          // Right click release - fire special attack
          player.controls.special = false

          // Similar logic for special attack animation
          if (player.animationState === "special" || player.animationState === "fire") {
            // Clear any existing timeout for this player
            if (animationTimeoutsRef.current[playerId]) {
              clearTimeout(animationTimeoutsRef.current[playerId])
            }

            // Set a timeout to change animation state after a short delay
            animationTimeoutsRef.current[playerId] = setTimeout(() => {
              if (
                gameStateRef.current.players[playerId] &&
                (gameStateRef.current.players[playerId].animationState === "special" ||
                  gameStateRef.current.players[playerId].animationState === "fire") &&
                !gameStateRef.current.players[playerId].isChargingSpecial
              ) {
                // Check if player is moving
                const isMoving =
                  player.controls.up || player.controls.down || player.controls.left || player.controls.right

                // Set appropriate animation
                gameStateRef.current.players[playerId].animationState = isMoving ? "run" : "idle"
                gameStateRef.current.players[playerId].lastAnimationChange = Date.now()
              }
            }, 300) // Short delay to allow special animation to complete
          }
        }
      }

      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault() // Prevent context menu on right click
      }

      // Add desktop event listeners
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

    // Resume audio context on user interaction
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

    // Track component unmount
    debugManager.trackComponentUnmount("GameControllerEnhanced", "useEffect cleanup")

    // Clean up
    return () => {
      transitionDebugger.trackTransition("any", "unmounting", "GameControllerEnhanced")

      // Cancel animation frame
      if (requestAnimationFrameIdRef.current !== null) {
        transitionDebugger.safeCancelAnimationFrame(`${componentIdRef.current}-game-loop`)
        requestAnimationFrameIdRef.current = null
        transitionDebugger.trackCleanup("GameControllerEnhanced", "Animation Frame", true)
      }

      // Clear all animation timeouts
      Object.keys(animationTimeoutsRef.current).forEach((key) => {
        clearTimeout(animationTimeoutsRef.current[key])
      })
      animationTimeoutsRef.current = {}

      // Remove all event listeners
      if (platformType === "desktop") {
        transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-game-keydown`)
        transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-game-keyup`)
        transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-mousemove`)
        transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-mousedown`)
        transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-mouseup`)
        transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-contextmenu`)
      }
      transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-resume-audio`)

      // Clear intervals
      transitionDebugger.safeClearInterval(`${componentIdRef.current}-crash-detection`)

      // Stop background music
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

  // Track renders
  useEffect(() => {
    debugManager.trackComponentRender("GameControllerEnhanced")
  })

  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false)

  // Touch control handlers for mobile
  const handleTouchControl = (control: keyof typeof touchControls, active: boolean) => {
    setTouchControls((prev) => ({
      ...prev,
      [control]: active,
    }))
  }

  // Show loading state while game initializes
  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-800 rounded-lg">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl font-bold">Loading Enhanced Game...</p>
        </div>
      </div>
    )
  }

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
        primary: "Touch & Drag",
        secondary: "Tap",
        special: "Long Press",
        hint: "Touch controls optimized for mobile",
      }
    }
  }

  const controls = getPlatformControls()

  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Game Stats Header - Only show on desktop */}
      {platformType === "desktop" && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" />
                Archer Arena - {gameMode.toUpperCase()}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={connectionStatus === "connected" ? "default" : "destructive"}>{connectionStatus}</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {Object.keys(gameState.players).length}
                </Badge>
                {platformType === "mobile" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    Mobile
                  </Badge>
                )}
                {platformType === "desktop" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Monitor className="w-3 h-3" />
                    Desktop
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-lg">{gameStats.score}</div>
                <div className="text-muted-foreground">Score</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{gameStats.level}</div>
                <div className="text-muted-foreground">Level</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{gameStats.lives}</div>
                <div className="text-muted-foreground">Lives</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{formatTime(gameState.gameTime)}</div>
                <div className="text-muted-foreground">Time</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4" />
                  {gameStats.multiplier}x
                </div>
                <div className="text-muted-foreground">Multiplier</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Controls - Only show on desktop */}
      {platformType === "desktop" && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  onClick={isPlaying ? onGamePause : onGameStart}
                  variant={isPlaying ? "secondary" : "default"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      {isPaused ? "Resume" : "Start"}
                    </>
                  )}
                </Button>
                <Button onClick={onGameStop} variant="destructive" size="sm" className="flex items-center gap-2">
                  <Square className="w-4 h-4" />
                  Stop
                </Button>
                <Button
                  onClick={onGameReset}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowDebug(!showDebug)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Debug
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Renderer */}
      <div className="relative">
        <EnhancedGameRenderer
          gameState={gameState}
          localPlayerId={playerId}
          debugMode={showDebug}
          platformType={platformType}
          onTouchControl={handleTouchControl}
        />

        {/* Debug Overlay */}
        {showDebug && (
          <div className="absolute top-4 right-4 z-50">
            <DebugOverlay
              gameState={gameState}
              playerId={playerId}
              showFps={true}
              showEntityCount={true}
              showPlayerInfo={true}
              showPerformanceMetrics={true}
            />
          </div>
        )}

        {/* Resource Monitor */}
        {showResourceMonitor && (
          <div className="absolute bottom-4 right-4 z-50">
            <ResourceMonitor />
          </div>
        )}

        {/* Mobile Tutorial Overlay */}
        {platformType === "mobile" && showTutorial && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
            <Card className="max-w-md mx-4">
              <CardHeader>
                <CardTitle>Mobile Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Movement</h4>
                  <p className="text-sm text-muted-foreground">Use the joystick on the left to move your archer</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Aiming & Shooting</h4>
                  <p className="text-sm text-muted-foreground">
                    Touch and drag on the right side to aim. Release to shoot arrows
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Special Actions</h4>
                  <p className="text-sm text-muted-foreground">Use DASH and SPEC buttons for special abilities</p>
                </div>
                <Button onClick={() => setShowTutorial(false)} className="w-full">
                  Got it!
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
            <Card className="max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-center">
                  {gameState.winner === playerId ? "Victory!" : "Game Over"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <p className="text-lg font-semibold">
                    {gameState.winner === playerId
                      ? "Congratulations! You won!"
                      : gameState.winner
                        ? `${gameState.players[gameState.winner]?.name || "Unknown"} wins!`
                        : "It's a draw!"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Game Time: {formatTime(gameState.gameTime)}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={onGameReset} className="flex-1">
                    Play Again
                  </Button>
                  <Button onClick={onGameStop} variant="outline" className="flex-1 bg-transparent">
                    Exit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
