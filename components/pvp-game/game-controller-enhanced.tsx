"use client"

import { useEffect, useRef, useState } from "react"
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
import { useGameControls } from "@/hooks/use-game-controls"

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

  // Use the new unified game controls hook
  useGameControls({
    playerId,
    gameStateRef,
    platformType,
    isEnabled: !gameState.isGameOver,
  })

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

        Object.keys(aiControllersRef.current).forEach((aiId) => {
          if (gameStateRef.current.players[aiId]) {
            const aiController = aiControllersRef.current[aiId]
            const { controls, targetRotation } = aiController.update(aiId, gameStateRef.current, deltaTime)

            gameStateRef.current.players[aiId].controls = controls
            gameStateRef.current.players[aiId].rotation = targetRotation
          }
        })

        let newState = gameStateRef.current

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
            newState = result as GameState
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

      transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-resume-audio`)

      transitionDebugger.safeClearInterval(`${componentIdRef.current}-crash-detection`)

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
      gameState={gameState}
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
