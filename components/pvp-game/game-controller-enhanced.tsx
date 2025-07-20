"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createInitialGameState, createPlayer, type GameState, updateGameState } from "./game-engine"
import EnhancedGameRenderer from "./enhanced-game-renderer"
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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import MobileGameContainer from "@/components/mobile-game-container"
import { setupGameInputHandlers } from "@/utils/game-input-handler"

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
  const componentIdRef = useRef<string>(`game-controller-${Date.now()}`)
  const animationTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({})
  const memoryTrackingInterval = useRef<NodeJS.Timeout | null>(null)
  const specialSoundPlayedRef = useRef<boolean>(false)

  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected")
  const [playersOnline, setPlayersOnline] = useState(0)
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false)

  // Handle movement from joystick - ONLY movement, no shooting
  const handleMovementChange = useCallback(
    (movement: { up: boolean; down: boolean; left: boolean; right: boolean }) => {
      console.log("🎮 handleMovementChange called with:", movement)

      if (!gameStateRef.current?.players?.[playerId]) {
        console.log("❌ No player found for movement change, playerId:", playerId)
        console.log("Available players:", Object.keys(gameStateRef.current?.players || {}))
        return
      }

      const player = gameStateRef.current.players[playerId]

      // Store previous movement state for debugging
      const previousControls = {
        up: player.controls.up,
        down: player.controls.down,
        left: player.controls.left,
        right: player.controls.right,
      }

      // Update ONLY movement controls - do NOT touch shooting controls
      player.controls.up = movement.up
      player.controls.down = movement.down
      player.controls.left = movement.left
      player.controls.right = movement.right

      const isMoving = movement.up || movement.down || movement.left || movement.right
      const wasMoving = previousControls.up || previousControls.down || previousControls.left || previousControls.right

      console.log("🎮 Movement controls updated:", {
        playerId,
        previousControls,
        newControls: {
          up: player.controls.up,
          down: player.controls.down,
          left: player.controls.left,
          right: player.controls.right,
        },
        shootControl: player.controls.shoot, // This should NOT change
        isMoving,
        wasMoving,
        playerPosition: player.position,
        currentAnimation: player.animationState,
      })

      // Handle animation state changes based on movement
      if (isMoving && !wasMoving) {
        if (
          player.animationState === "idle" &&
          !player.isDrawingBow &&
          !player.isDashing &&
          !player.isChargingSpecial
        ) {
          player.animationState = "run"
          player.lastAnimationChange = Date.now()
          console.log("🏃 Animation changed to run")
        }
      } else if (!isMoving && wasMoving) {
        if (player.animationState === "run" && !player.isDrawingBow && !player.isDashing && !player.isChargingSpecial) {
          player.animationState = "idle"
          player.lastAnimationChange = Date.now()
          console.log("🧍 Animation changed to idle")
        }
      }
    },
    [playerId],
  )

  // Handle action button presses - ONLY actions, no movement
  const handleActionPress = useCallback(
    (action: string, pressed: boolean) => {
      console.log("🎯 handleActionPress called with:", { action, pressed })

      if (!gameStateRef.current?.players?.[playerId]) {
        console.log("❌ No player found for action press")
        return
      }

      const player = gameStateRef.current.players[playerId]

      switch (action) {
        case "shoot": // A button - Shoot Arrow
          console.log("🏹 Handling shoot action:", pressed)
          player.controls.shoot = pressed
          if (pressed) {
            player.isDrawingBow = true
            player.drawStartTime = Date.now() / 1000
            player.animationState = "draw"
            player.lastAnimationChange = Date.now()
            console.log("🏹 Started drawing bow")
          } else {
            if (player.isDrawingBow) {
              player.isDrawingBow = false
              console.log("🏹 Released bow - firing arrow")
            }
          }
          break
        case "dash": // X button - Dash
          console.log("💨 Handling dash action:", pressed)
          if (pressed && !player.isDashing && (player.dashCooldown || 0) <= 0) {
            player.controls.dash = true
            console.log("💨 Dash activated")
          } else {
            player.controls.dash = false
          }
          break
        case "special": // Y button - Special Attack
          console.log("⚡ Handling special action:", pressed)
          player.controls.special = pressed
          if (pressed) {
            player.isChargingSpecial = true
            player.specialChargeStartTime = Date.now() / 1000
            player.animationState = "special"
            player.lastAnimationChange = Date.now()
            console.log("⚡ Started charging special")
          } else {
            if (player.isChargingSpecial) {
              player.isChargingSpecial = false
              console.log("⚡ Released special attack")
            }
          }
          break
        case "explosive": // B button - Explosive Arrow
          console.log("💥 Handling explosive action:", pressed)
          if (pressed && (player.explosiveArrowCooldown || 0) <= 0) {
            player.controls.explosiveArrow = true
            console.log("💥 Explosive arrow activated")
          } else {
            player.controls.explosiveArrow = false
          }
          break
      }

      // Log all controls after action
      console.log("🎮 All player controls after action:", {
        movement: {
          up: player.controls.up,
          down: player.controls.down,
          left: player.controls.left,
          right: player.controls.right,
        },
        actions: {
          shoot: player.controls.shoot,
          dash: player.controls.dash,
          special: player.controls.special,
          explosiveArrow: player.controls.explosiveArrow,
        },
      })
    },
    [playerId],
  )

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

    console.log("🎮 Initializing game with playerId:", playerId)

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

    console.log("🎮 Created local player:", localPlayer)

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

    console.log("🎮 Initial game state:", {
      playerCount: Object.keys(initialState.players).length,
      players: Object.keys(initialState.players),
      localPlayerId: playerId,
    })

    debugManager.captureState(initialState, "Initial State")

    transitionDebugger.trackTransition("mounting", "mounted", "GameControllerEnhanced")

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

        // Update AI controllers
        Object.keys(aiControllersRef.current).forEach((aiId) => {
          if (gameStateRef.current.players[aiId]) {
            const aiController = aiControllersRef.current[aiId]
            const { controls, targetRotation } = aiController.update(aiId, gameStateRef.current, deltaTime)

            gameStateRef.current.players[aiId].controls = controls
            gameStateRef.current.players[aiId].rotation = targetRotation
          }
        })

        // Update game state
        const newState = updateGameState(gameStateRef.current, deltaTime)

        // Handle audio
        const localPlayer = newState.players[playerId]
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

        gameStateRef.current = newState
        setGameState(newState)

        if (newState.isGameOver && onGameEnd) {
          if (!audioManager.isSoundMuted()) {
            if (newState.winner === playerId) {
              playVictorySound()
            } else {
              playGameOverSound()
            }
          }

          stopBackgroundMusic()
          transitionDebugger.trackTransition("playing", "game-over", "GameControllerEnhanced")
          onGameEnd(newState.winner)

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

        debugManager.endFrame()
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

    let cleanupDesktop: () => void = () => {}
    if (platformType === "desktop") {
      cleanupDesktop = setupGameInputHandlers({
        playerId,
        gameStateRef,
        componentIdRef,
      })
    }

    return () => {
      if (requestAnimationFrameIdRef.current !== null) {
        transitionDebugger.safeCancelAnimationFrame(`${componentIdRef.current}-game-loop`)
        requestAnimationFrameIdRef.current = null
        transitionDebugger.trackCleanup("GameControllerEnhanced", "Animation Frame", true)
      }

      Object.keys(animationTimeoutsRef.current).forEach((key) => {
        clearTimeout(animationTimeoutsRef.current[key])
      })
      animationTimeoutsRef.current = {}

      cleanupDesktop()
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

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
      <MobileGameContainer
        onMovementChange={handleMovementChange}
        onActionPress={handleActionPress}
        className={className}
      >
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
