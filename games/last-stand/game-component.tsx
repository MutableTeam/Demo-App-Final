"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createInitialLastStandState, type LastStandGameState } from "./game-state"
import { updateLastStandGameState } from "./game-engine"
import LastStandRenderer from "./game-renderer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Clock, Heart, Star, ArrowUp } from "lucide-react"
import { debugManager } from "@/utils/debug-utils"
import { audioManager, playGameOverSound } from "@/utils/audio-manager"
import CountdownTimer from "@/components/pvp-game/countdown-timer"
import { formatTime } from "./utils"
import { usePlatform } from "@/contexts/platform-context"
import { useGameControls } from "@/hooks/use-game-controls"
import { gameInputHandler, type GameInputState } from "@/utils/game-input-handler"

interface LastStandGameProps {
  playerId: string
  playerName: string
  gameMode?: string
  onGameEnd: (stats: any) => void
  onCancel: () => void
}

export default function LastStandGame({
  playerId,
  playerName,
  gameMode = "practice",
  onGameEnd,
  onCancel,
}: LastStandGameProps) {
  const { platformType, setUiActive } = usePlatform()
  const isMobile = platformType === "mobile"

  const [gameState, setGameState] = useState<LastStandGameState>(() =>
    createInitialLastStandState(playerId, playerName, gameMode),
  )
  const [showCountdown, setShowCountdown] = useState<boolean>(true)
  const [showGameOver, setShowGameOver] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)

  const gameStateRef = useRef(gameState)
  const lastUpdateTimeRef = useRef<number>(Date.now())
  const requestAnimationFrameIdRef = useRef<number | null>(null)
  const gameActionsRef = useRef<{ type: string; payload: any }[]>([])

  const isGameActive = !showCountdown && !showGameOver && !isPaused && !gameState.isLevelingUp

  useGameControls({
    playerId: "player",
    gameStateRef,
    platformType: platformType || "desktop",
    isEnabled: !isMobile && isGameActive,
  })

  useEffect(() => {
    if (isMobile) {
      const handleMobileInput = (inputState: GameInputState) => {
        if (!gameStateRef.current.players.player) return
        const playerControls = gameStateRef.current.players.player.controls
        playerControls.up = inputState.movement.up
        playerControls.down = inputState.movement.down
        playerControls.left = inputState.movement.left
        playerControls.right = inputState.movement.right
        if (inputState.aiming.active) {
          gameStateRef.current.players.player.rotation = inputState.aiming.angle
        }
        playerControls.shoot = inputState.actions.shoot
        playerControls.dash = inputState.actions.dash
        playerControls.special = inputState.actions.special
      }
      gameInputHandler.setCallbacks({ onStateChange: handleMobileInput })
      return () => gameInputHandler.setCallbacks({})
    }
  }, [isMobile])

  useEffect(() => {
    if (isMobile) {
      const isOverlayVisible = showGameOver || isPaused || gameState.isLevelingUp
      setUiActive(isOverlayVisible)
    }
    return () => {
      if (isMobile) setUiActive(false)
    }
  }, [isMobile, showGameOver, isPaused, gameState.isLevelingUp, setUiActive])

  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  const handleCountdownComplete = () => {
    setShowCountdown(false)
    startGame()
  }

  const startGame = () => {
    const initialState = createInitialLastStandState(playerId, playerName, gameMode)
    const adaptedState = { ...initialState, players: { player: initialState.player } }
    setGameState(adaptedState)
    gameStateRef.current = adaptedState
    lastUpdateTimeRef.current = Date.now()
    requestAnimationFrameIdRef.current = requestAnimationFrame(gameLoop)
  }

  const gameLoop = useCallback(() => {
    const now = Date.now()
    const deltaTime = Math.min((now - lastUpdateTimeRef.current) / 1000, 0.1)
    lastUpdateTimeRef.current = now

    const currentActions = gameActionsRef.current
    gameActionsRef.current = []

    // The engine will handle the paused state internally.
    // It will process actions (like selecting an upgrade to unpause),
    // and only advance game time if not paused.
    const unadaptedState = { ...gameStateRef.current, player: gameStateRef.current.players.player }
    const newState = updateLastStandGameState(unadaptedState, deltaTime, currentActions)
    const adaptedState = { ...newState, players: { player: newState.player } }

    if (newState.isGameOver && !gameStateRef.current.isGameOver) {
      handleGameOver(newState)
    }

    // Update the React state from the new engine state
    gameStateRef.current = adaptedState
    setGameState(adaptedState)
    setIsPaused(adaptedState.isPaused) // Sync the component's pause state

    if (!newState.isGameOver) {
      requestAnimationFrameIdRef.current = requestAnimationFrame(gameLoop)
    }
  }, [])

  const handleGameOver = (finalState: any) => {
    setShowGameOver(true)
    audioManager.stopBackgroundMusic()
    playGameOverSound()
    debugManager.logInfo("LAST_STAND", "Game over", {
      score: finalState.playerStats.score,
      wave: finalState.completedWaves,
      timeAlive: finalState.playerStats.timeAlive,
    })
  }

  const handleExit = () => {
    if (requestAnimationFrameIdRef.current) {
      cancelAnimationFrame(requestAnimationFrameIdRef.current)
    }
    onGameEnd({
      score: gameState.playerStats.score,
      wave: gameState.completedWaves,
      timeAlive: gameState.playerStats.timeAlive,
    })
  }

  const handleUpgradeSelect = (upgradeId: string) => {
    gameActionsRef.current.push({ type: "SELECT_UPGRADE", payload: upgradeId })
  }

  const handleResume = () => {
    // This directly modifies the state, which is fine for the manual pause menu
    setIsPaused(false)
    if (gameStateRef.current) {
      gameStateRef.current.isPaused = false
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !gameState.isLevelingUp && !showGameOver) {
        setIsPaused((prev) => {
          const newPausedState = !prev
          if (gameStateRef.current) {
            gameStateRef.current.isPaused = newPausedState
          }
          return newPausedState
        })
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [gameState.isLevelingUp, showGameOver])

  useEffect(() => {
    audioManager.init()
    return () => {
      audioManager.stopBackgroundMusic()
    }
  }, [])

  if (showCountdown) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-900">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">Get Ready!</h2>
          <div className="text-6xl text-white font-bold">
            <CountdownTimer duration={3} onComplete={handleCountdownComplete} size="large" />
          </div>
        </div>
      </div>
    )
  }

  if (showGameOver) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-900/80">
        <Card className="w-[400px] bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="font-mono text-center">GAME OVER</CardTitle>
            <CardDescription className="text-center">
              You survived {gameState.completedWaves} waves and scored {gameState.playerStats.score} points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-black/10 p-4 rounded-md">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4" /> Your Stats
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Score:</span>
                    <span className="font-mono">{gameState.playerStats.score}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Waves Completed:</span>
                    <span className="font-mono">{gameState.completedWaves}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Time Survived:</span>
                    <span className="font-mono">{formatTime(gameState.playerStats.timeAlive)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Accuracy:</span>
                    <span className="font-mono">{gameState.playerStats.accuracy.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Enemies Killed:</span>
                    <span className="font-mono">{gameState.playerStats.kills}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
              onClick={handleExit}
            >
              Exit Game
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full bg-gray-900 overflow-hidden">
      <LastStandRenderer gameState={gameState} />
      <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none text-white">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-md">
            <Heart className="h-5 w-5 text-red-500" />
            <span className="font-mono text-lg">
              {Math.ceil(gameState.player.health)} / {gameState.player.maxHealth}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-md">
            <Star className="h-5 w-5 text-yellow-400" />
            <span className="font-mono text-lg">Lvl {gameState.player.level}</span>
          </div>
          <div className="w-48 h-3 bg-black/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full transition-all duration-300"
              style={{ width: `${(gameState.player.xp / gameState.player.xpToNextLevel) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-md">
            <span className="font-mono text-lg">Wave {gameState.currentWave.number}</span>
          </div>
          <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-md flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span className="font-mono text-lg">{formatTime(gameState.gameTime)}</span>
          </div>
          <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-md flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-mono text-lg">{gameState.playerStats.score}</span>
          </div>
        </div>
      </div>

      {gameState.isLevelingUp && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-6">
            <h1
              className="text-5xl font-bold text-yellow-400 tracking-widest"
              style={{ textShadow: "0 0 10px #fef08a" }}
            >
              LEVEL UP!
            </h1>
            <div className="flex gap-6">
              {gameState.availableUpgrades.map((upgrade) => (
                <Card
                  key={upgrade.id}
                  className="w-64 bg-gray-900/80 border-2 border-yellow-400/50 hover:border-yellow-400 hover:bg-gray-800 transition-all cursor-pointer"
                  onClick={() => handleUpgradeSelect(upgrade.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-yellow-400 flex items-center gap-2">
                      <ArrowUp /> {upgrade.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{upgrade.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {isPaused && !gameState.isLevelingUp && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <Card className="w-[300px] bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <CardTitle className="font-mono text-center">PAUSED</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
                onClick={handleResume}
              >
                Resume
              </Button>
              <Button variant="outline" className="w-full border-2 border-black bg-transparent" onClick={handleExit}>
                Exit Game
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {!isMobile && (
        <div className="absolute bottom-4 left-4 right-4 text-center text-white/70 text-sm bg-black/30 py-1 px-2 rounded-md pointer-events-none">
          WASD/Arrows to move | Mouse to aim | Left Click/Space to shoot | Shift to dash | ESC to pause
        </div>
      )}
    </div>
  )
}
