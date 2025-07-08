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
import {
  audioManager,
  playGameOverSound,
  playBowReleaseSound,
  playBowDrawSound,
  playBowFullDrawSound,
} from "@/utils/audio-manager"
import CountdownTimer from "@/components/pvp-game/countdown-timer"
import { formatTime } from "./utils"
import { createArcherAnimationSet, SpriteAnimator } from "@/utils/sprite-animation"

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
  // Game state
  const [gameState, setGameState] = useState(() => createInitialLastStandState(playerId, playerName, gameMode))
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false)
  const [showCountdown, setShowCountdown] = useState<boolean>(false)
  const [showGameOver, setShowGameOver] = useState<boolean>(false)
  const [leaderboardTimeRemaining, setLeaderboardTimeRemaining] = useState<string>("00:00")
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [specialCooldown, setSpecialCooldown] = useState<number>(0)

  // Refs
  const gameStateRef = useRef(gameState)
  const lastUpdateTimeRef = useRef<number>(Date.now())
  const requestAnimationFrameIdRef = useRef<number | null>(null)
  const keysPressed = useRef<Set<string>>(new Set())
  const mousePositionRef = useRef({ x: 0, y: 0 })
  const mouseButtonsRef = useRef({ left: false, right: false })
  const frameCountRef = useRef<number>(0)
  const animatorRef = useRef<SpriteAnimator | null>(null)
  const specialCooldownRef = useRef<number>(0)

  // Update game state ref when state changes
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  // Initialize animator
  useEffect(() => {
    if (!animatorRef.current) {
      const animationSet = createArcherAnimationSet()
      animatorRef.current = new SpriteAnimator(animationSet)
    }
  }, [])

  // Auto-start countdown when component mounts
  useEffect(() => {
    setShowCountdown(true)
  }, [])

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
    // Initialize game state with proper structure
    const initialState = createInitialLastStandState(playerId, playerName, gameMode)
    setGameState(initialState)
    gameStateRef.current = initialState

    // Reset frame count and cooldowns
    frameCountRef.current = 0
    specialCooldownRef.current = 0
    setSpecialCooldown(0)

    // Start game loop
    lastUpdateTimeRef.current = Date.now()
    requestAnimationFrameIdRef.current = requestAnimationFrame(gameLoop)

    // Play background music
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
    const deltaTime = Math.min((now - lastUpdateTimeRef.current) / 1000, 0.1) // Cap delta time
    lastUpdateTimeRef.current = now
    frameCountRef.current++

    // Update cooldowns
    if (specialCooldownRef.current > 0) {
      specialCooldownRef.current = Math.max(0, specialCooldownRef.current - deltaTime)
      setSpecialCooldown(specialCooldownRef.current)
    }

    // Update player controls based on input
    updatePlayerControls()

    // Update game state
    const newState = updateLastStandGameState(gameStateRef.current, deltaTime)

    // Check for game over
    if (newState.isGameOver && !gameStateRef.current.isGameOver) {
      handleGameOver(newState)
    }

    // Update state
    gameStateRef.current = newState
    setGameState(newState)

    // Continue game loop
    if (!newState.isGameOver) {
      requestAnimationFrameIdRef.current = requestAnimationFrame(gameLoop)
    }
  }

  // Update player controls based on input
  const updatePlayerControls = () => {
    const newState = { ...gameStateRef.current }

    // Update movement controls
    newState.player.controls.up = keysPressed.current.has("w") || keysPressed.current.has("ArrowUp")
    newState.player.controls.down = keysPressed.current.has("s") || keysPressed.current.has("ArrowDown")
    newState.player.controls.left = keysPressed.current.has("a") || keysPressed.current.has("ArrowLeft")
    newState.player.controls.right = keysPressed.current.has("d") || keysPressed.current.has("ArrowRight")

    // Update shooting controls
    newState.player.controls.shoot = mouseButtonsRef.current.left || keysPressed.current.has(" ")
    newState.player.controls.special = mouseButtonsRef.current.right || keysPressed.current.has("q")

    // Add explosive arrow control (E key)
    newState.player.controls.explosiveArrow = keysPressed.current.has("e") && specialCooldownRef.current === 0

    // If explosive arrow is triggered, set cooldown
    if (newState.player.controls.explosiveArrow) {
      specialCooldownRef.current = 30 // 30 second cooldown
      setSpecialCooldown(30)
    }

    newState.player.controls.dash = keysPressed.current.has("Shift")

    // Calculate player rotation based on mouse position
    if (mousePositionRef.current) {
      const dx = mousePositionRef.current.x - newState.player.position.x
      const dy = mousePositionRef.current.y - newState.player.position.y
      newState.player.rotation = Math.atan2(dy, dx)
    }

    gameStateRef.current = newState
  }

  // Handle game over
  const handleGameOver = (finalState) => {
    setShowGameOver(true)

    // Stop background music
    try {
      audioManager.stopBackgroundMusic()
    } catch (error) {
      console.error("Failed to stop background music:", error)
    }

    // Play game over sound
    if (!audioManager.isSoundMuted()) {
      try {
        playGameOverSound()
      } catch (error) {
        console.error("Failed to play game over sound:", error)
      }
    }

    // Log game stats
    debugManager.logInfo("LAST_STAND", "Game over", {
      score: finalState.playerStats.score,
      wave: finalState.completedWaves,
      timeAlive: finalState.playerStats.timeAlive,
    })
  }

  // Handle restart
  const handleRestart = () => {
    setShowGameOver(false)
    setShowConfirmation(true)
  }

  // Handle exit
  const handleExit = () => {
    // Clean up
    if (requestAnimationFrameIdRef.current) {
      cancelAnimationFrame(requestAnimationFrameIdRef.current)
    }

    // Stop background music
    try {
      audioManager.stopBackgroundMusic()
    } catch (error) {
      console.error("Failed to stop background music:", error)
    }

    // Call onGameEnd with stats
    onGameEnd({
      score: gameState.playerStats.score,
      wave: gameState.completedWaves,
      timeAlive: gameState.playerStats.timeAlive,
    })
  }

  // Set up keyboard and mouse controls
  useEffect(() => {
    if (showConfirmation || showCountdown || showGameOver) return

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key)

      // Handle pause
      if (e.key === "Escape") {
        setIsPaused((prev) => !prev)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = document.querySelector("canvas")
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      mousePositionRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        // Left click
        mouseButtonsRef.current.left = true

        // Play shoot sound
        try {
          playBowDrawSound()
        } catch (error) {
          console.error("Failed to play shoot sound:", error)
        }
      } else if (e.button === 2) {
        // Right click
        mouseButtonsRef.current.right = true

        // Play special sound
        try {
          playBowFullDrawSound()
        } catch (error) {
          console.error("Failed to play special sound:", error)
        }
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        // Left click
        mouseButtonsRef.current.left = false

        // Play release sound
        try {
          playBowReleaseSound()
        } catch (error) {
          console.error("Failed to play release sound:", error)
        }
      } else if (e.button === 2) {
        // Right click
        mouseButtonsRef.current.right = false
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      // Prevent context menu from appearing on right-click
      e.preventDefault()
    }

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("contextmenu", handleContextMenu)

    // Clean up
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("contextmenu", handleContextMenu)

      if (requestAnimationFrameIdRef.current) {
        cancelAnimationFrame(requestAnimationFrameIdRef.current)
      }

      // Stop background music
      try {
        audioManager.stopBackgroundMusic()
      } catch (error) {
        console.error("Failed to stop background music:", error)
      }
    }
  }, [showConfirmation, showCountdown, showGameOver])

  // Initialize audio
  useEffect(() => {
    // Initialize audio
    try {
      audioManager.init()
    } catch (error) {
      console.error("Failed to initialize audio:", error)
    }

    // Clean up
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
                  <li>Your final score determines your position on the leaderboard</li>
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
            <Button variant="outline" className="border-2 border-black" onClick={onCancel}>
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
    <div className="relative h-[600px] bg-gray-900 rounded-lg">
      {/* Game renderer */}
      <LastStandRenderer gameState={gameState} />

      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        {/* Player stats */}
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

          {/* Explosive Arrow Cooldown */}
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

        {/* Wave info */}
        <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-md flex items-center gap-2">
          <span className="font-mono">Wave {gameState.currentWave.number}</span>
        </div>

        {/* Time */}
        <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-md flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="font-mono">{formatTime(gameState.gameTime)}</span>
        </div>
      </div>

      {/* Pause menu */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
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
              <Button variant="outline" className="w-full border-2 border-black" onClick={handleExit}>
                Exit Game
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 right-4 text-center text-white/70 text-sm bg-black/30 py-1 px-2 rounded-md">
        WASD/Arrows to move | Mouse to aim | Left Click/Space to shoot | E for explosive arrow | Right Click/Q for
        special | Shift to dash | ESC to pause
      </div>
    </div>
  )
}
