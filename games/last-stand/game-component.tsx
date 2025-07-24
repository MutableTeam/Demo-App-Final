"use client"

import { useEffect, useRef, useState } from "react"
import { createInitialLastStandState } from "./game-state"
import { updateLastStandGameState } from "./game-engine"
import LastStandRenderer from "./game-renderer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skull, Trophy, Clock, Heart, Zap } from "lucide-react"
import { debugManager } from "@/utils/debug-utils"
import { audioManager, playGameOverSound } from "@/utils/audio-manager"
import CountdownTimer from "@/components/pvp-game/countdown-timer"
import { formatTime } from "./utils"
import { usePlatform } from "@/contexts/platform-context"
import { useGameControls } from "@/hooks/use-game-controls"
import { Joystick } from "react-joystick-component"
import { gameInputHandler } from "@/utils/game-input-handler"

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
  const { platformType } = usePlatform()
  const isMobile = platformType === "mobile"

  // Game state
  const [gameState, setGameState] = useState(() => createInitialLastStandState(playerId, playerName, gameMode))
  const [showConfirmation, setShowConfirmation] = useState<boolean>(true)
  const [showCountdown, setShowCountdown] = useState<boolean>(false)
  const [showGameOver, setShowGameOver] = useState<boolean>(false)
  const [leaderboardTimeRemaining, setLeaderboardTimeRemaining] = useState<string>("00:00")
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [specialCooldown, setSpecialCooldown] = useState<number>(0)

  // Refs
  const gameStateRef = useRef(gameState)
  const lastUpdateTimeRef = useRef<number>(Date.now())
  const requestAnimationFrameIdRef = useRef<number | null>(null)

  // Determine if the game is active to enable controls
  const isGameActive = !showConfirmation && !showCountdown && !showGameOver && !isPaused

  // Centralized game controls hook
  useGameControls({
    playerId: "player", // In Last Stand, the player key is 'player'
    gameStateRef,
    platformType: platformType || "desktop",
    isEnabled: isGameActive,
  })

  // Update game state ref when state changes
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  // Handle confirmation
  const handleConfirmStart = () => {
    setShowConfirmation(false)
    setShowCountdown(true)
  }

  // Handle countdown complete
  const handleCountdownComplete = () => {
    setShowCountdown(false)
    startGame()
  }

  // Start game
  const startGame = () => {
    const initialState = createInitialLastStandState(playerId, playerName, gameMode)
    // The useGameControls hook expects the player to be in a `players` object
    const adaptedState = {
      ...initialState,
      players: {
        player: initialState.player,
      },
    }
    setGameState(adaptedState)
    gameStateRef.current = adaptedState

    setSpecialCooldown(0)

    lastUpdateTimeRef.current = Date.now()
    requestAnimationFrameIdRef.current = requestAnimationFrame(gameLoop)

    if (!audioManager.isSoundMuted()) {
      try {
        audioManager.startBackgroundMusic()
      } catch (error) {
        console.error("Failed to start background music:", error)
      }
    }
  }

  // Game loop
  const gameLoop = () => {
    if (isPaused) {
      requestAnimationFrameIdRef.current = requestAnimationFrame(gameLoop)
      return
    }

    const now = Date.now()
    const deltaTime = Math.min((now - lastUpdateTimeRef.current) / 1000, 0.1)
    lastUpdateTimeRef.current = now

    // The useGameControls hook updates the controls directly in gameStateRef.
    // We just need to run the game engine.
    const unadaptedState = {
      ...gameStateRef.current,
      player: gameStateRef.current.players.player,
    }

    const newState = updateLastStandGameState(unadaptedState, deltaTime)

    // Re-adapt state for the next frame
    const adaptedState = {
      ...newState,
      players: {
        player: newState.player,
      },
    }

    if (newState.isGameOver && !gameStateRef.current.isGameOver) {
      handleGameOver(newState)
    }

    gameStateRef.current = adaptedState
    setGameState(adaptedState)
    setSpecialCooldown(newState.player.specialCooldown || 0)

    if (!newState.isGameOver) {
      requestAnimationFrameIdRef.current = requestAnimationFrame(gameLoop)
    }
  }

  // Handle game over
  const handleGameOver = (finalState) => {
    setShowGameOver(true)
    try {
      audioManager.stopBackgroundMusic()
    } catch (error) {
      console.error("Failed to stop background music:", error)
    }
    if (!audioManager.isSoundMuted()) {
      try {
        playGameOverSound()
      } catch (error) {
        console.error("Failed to play game over sound:", error)
      }
    }
    debugManager.logInfo("LAST_STAND", "Game over", {
      score: finalState.playerStats.score,
      wave: finalState.completedWaves,
      timeAlive: finalState.playerStats.timeAlive,
    })
  }

  // Handle exit
  const handleExit = () => {
    if (requestAnimationFrameIdRef.current) {
      cancelAnimationFrame(requestAnimationFrameIdRef.current)
    }
    try {
      audioManager.stopBackgroundMusic()
    } catch (error) {
      console.error("Failed to stop background music:", error)
    }
    onGameEnd({
      score: gameState.playerStats.score,
      wave: gameState.completedWaves,
      timeAlive: gameState.playerStats.timeAlive,
    })
  }

  // Set up keyboard listener for pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPaused((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Initialize audio
  useEffect(() => {
    try {
      audioManager.init()
    } catch (error) {
      console.error("Failed to initialize audio:", error)
    }
    return () => {
      try {
        audioManager.stopBackgroundMusic()
      } catch (error) {
        console.error("Failed to stop background music:", error)
      }
    }
  }, [])

  // Render confirmation screen
  if (showConfirmation) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-900 rounded-lg">
        <Card className="w-[400px] bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skull className="h-5 w-5" />
                <CardTitle className="font-mono">ARCHER ARENA: LAST STAND</CardTitle>
              </div>
              <Badge
                variant="outline"
                className="bg-[#FFD54F] text-black border-2 border-black flex items-center gap-1 font-mono"
              >
                {gameMode.toUpperCase()}
              </Badge>
            </div>
            <CardDescription>Survive waves of undead enemies and compete for high scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-black/10 p-4 rounded-md">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4" /> Leaderboard
                </h3>
                <div className="flex justify-between text-sm">
                  <span>Time Remaining:</span>
                  <span className="font-mono">{leaderboardTimeRemaining}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Entry Fee:</span>
                  <span className="font-mono">
                    {gameMode === "hourly" ? "5" : gameMode === "daily" ? "10" : "0"} MUTB
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Current Pot:</span>
                  <span className="font-mono">
                    {gameMode === "hourly" ? "250" : gameMode === "daily" ? "1000" : "0"} MUTB
                  </span>
                </div>
              </div>

              <div className="bg-black/10 p-4 rounded-md">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Skull className="h-4 w-4" /> Game Rules
                </h3>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  <li>Survive as many waves of undead enemies as possible</li>
                  <li>Each wave gets progressively harder</li>
                  <li>Score points by defeating enemies</li>
                  <li>Special enemies are worth more points</li>
                  <li>Your final score now determines your position on the leaderboard</li>
                </ul>
              </div>

              <div className="bg-black/10 p-4 rounded-md">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Controls
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>WASD / Arrows</div>
                  <div>Move</div>
                  <div>Mouse</div>
                  <div>Aim</div>
                  <div>Left Click / Space</div>
                  <div>Shoot Arrow</div>
                  <div>Right Click / Q</div>
                  <div>Special Attack</div>
                  <div>E Key</div>
                  <div>Explosive Arrow (30s cooldown)</div>
                  <div>Shift</div>
                  <div>Dash</div>
                  <div>ESC</div>
                  <div>Pause</div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" className="border-2 border-black bg-transparent" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              className="bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
              onClick={handleConfirmStart}
            >
              Start Game ({gameMode === "hourly" ? "5" : gameMode === "daily" ? "10" : "0"} MUTB)
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Render countdown screen
  if (showCountdown) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-900 rounded-lg">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">Get Ready!</h2>
          <div className="text-6xl text-white font-bold">
            <CountdownTimer duration={3} onComplete={handleCountdownComplete} size="large" />
          </div>
        </div>
      </div>
    )
  }

  // Render game over screen
  if (showGameOver) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-900/80 rounded-lg">
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

              <div className="bg-black/10 p-4 rounded-md">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4" /> Leaderboard Position
                </h3>
                <div className="text-center p-4">
                  <div className="text-4xl font-bold mb-2">#{gameMode === "practice" ? "-" : "5"}</div>
                  <div className="text-sm text-gray-600">
                    {gameMode === "practice"
                      ? "Practice mode - no leaderboard entry"
                      : "Your score has been submitted to the leaderboard"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render game
  return (
    <div className="relative h-[600px] bg-gray-900 rounded-lg overflow-hidden">
      <LastStandRenderer gameState={gameState} />

      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-md flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${(gameState.player.health / gameState.player.maxHealth) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-md flex items-center gap-2">
            <Skull className="h-4 w-4" />
            <span className="font-mono">{gameState.enemies.length}</span>
          </div>
          <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-md flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="font-mono">{gameState.playerStats.score}</span>
          </div>
          <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-md flex items-center gap-2">
            <Zap className={`h-4 w-4 ${specialCooldown === 0 ? "text-orange-500" : "text-gray-400"}`} />
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${(1 - specialCooldown / 30) * 100}%` }}
              ></div>
            </div>
            <span className="font-mono text-xs">
              {specialCooldown === 0 ? "READY" : Math.ceil(specialCooldown) + "s"}
            </span>
          </div>
        </div>
        <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-md flex items-center gap-2">
          <span className="font-mono">Wave {gameState.currentWave.number}</span>
        </div>
        <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-md flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="font-mono">{formatTime(gameState.gameTime)}</span>
        </div>
      </div>

      {/* Mobile Controls */}
      {isMobile && isGameActive && (
        <>
          <div className="absolute bottom-8 left-8">
            <Joystick
              size={120}
              baseColor="rgba(255, 255, 255, 0.2)"
              stickColor="rgba(255, 255, 255, 0.5)"
              move={(e) => gameInputHandler.handleMovementJoystick(e)}
              stop={(e) => gameInputHandler.handleMovementJoystick(e)}
            />
          </div>
          <div className="absolute bottom-8 right-48 flex flex-col-reverse gap-4">
            <button
              className="w-16 h-16 rounded-full bg-blue-500/50 text-white font-bold border-2 border-blue-300 flex items-center justify-center active:bg-blue-400"
              onTouchStart={() => gameInputHandler.handleActionPress("dash", true)}
              onTouchEnd={() => gameInputHandler.handleActionPress("dash", false)}
            >
              X
            </button>
            <button
              className="w-16 h-16 rounded-full bg-purple-500/50 text-white font-bold border-2 border-purple-300 flex items-center justify-center active:bg-purple-400"
              onTouchStart={() => gameInputHandler.handleActionPress("special", true)}
              onTouchEnd={() => gameInputHandler.handleActionPress("special", false)}
            >
              Y
            </button>
          </div>
          <div className="absolute bottom-8 right-8">
            <Joystick
              size={120}
              baseColor="rgba(255, 255, 255, 0.2)"
              stickColor="rgba(255, 255, 255, 0.5)"
              move={(e) => gameInputHandler.handleAimingJoystick(e)}
              stop={(e) => gameInputHandler.handleAimingJoystick(e)}
            />
          </div>
        </>
      )}

      {/* Pause menu */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <Card className="w-[300px] bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <CardTitle className="font-mono text-center">PAUSED</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
                onClick={() => setIsPaused(false)}
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

      {/* Controls hint */}
      {!isMobile && (
        <div className="absolute bottom-4 left-4 right-4 text-center text-white/70 text-sm bg-black/30 py-1 px-2 rounded-md pointer-events-none">
          WASD/Arrows to move | Mouse to aim | Left Click/Space to shoot | E for explosive arrow | Right Click/Q for
          special | Shift to dash | ESC to pause
        </div>
      )}
    </div>
  )
}
