"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Play, Pause, RotateCcw, Trophy, Target, Volume2, VolumeX } from "lucide-react"

interface GameContainerProps {
  gameId: string
  playerId: string
  playerName: string
  isHost: boolean
  gameMode: "single" | "multiplayer"
  onGameEnd: (winner: string | null) => void
}

interface GameState {
  score: number
  level: number
  lives: number
  timeRemaining: number
  isPlaying: boolean
  isPaused: boolean
  gameOver: boolean
  highScore: number
}

interface GameObject {
  x: number
  y: number
  width: number
  height: number
  color: string
  velocity?: { x: number; y: number }
}

export function GameContainer({ gameId, playerId, playerName, isHost, gameMode, onGameEnd }: GameContainerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const gameLoopRef = useRef<number>()
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    lives: 3,
    timeRemaining: 60,
    isPlaying: false,
    isPaused: false,
    gameOver: false,
    highScore: Number.parseInt(localStorage.getItem(`highScore_${gameId}`) || "0"),
  })

  const [gameObjects, setGameObjects] = useState<GameObject[]>([])
  const [player, setPlayer] = useState<GameObject>({
    x: 50,
    y: 250,
    width: 30,
    height: 30,
    color: "#f97316",
    velocity: { x: 0, y: 0 },
  })

  const [targets, setTargets] = useState<GameObject[]>([])
  const [projectiles, setProjectiles] = useState<GameObject[]>([])

  // Initialize game objects
  useEffect(() => {
    initializeGame()
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [gameId])

  const initializeGame = () => {
    // Reset game state
    setGameState((prev) => ({
      ...prev,
      score: 0,
      level: 1,
      lives: 3,
      timeRemaining: 60,
      isPlaying: false,
      isPaused: false,
      gameOver: false,
    }))

    // Initialize targets based on game type
    const initialTargets: GameObject[] = []
    for (let i = 0; i < 5; i++) {
      initialTargets.push({
        x: 200 + Math.random() * 400,
        y: 50 + Math.random() * 300,
        width: 25,
        height: 25,
        color: "#ef4444",
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        },
      })
    }
    setTargets(initialTargets)
    setProjectiles([])
  }

  const startGame = () => {
    setGameState((prev) => ({ ...prev, isPlaying: true, isPaused: false }))

    // Start game timer
    gameLoopRef.current = window.setInterval(() => {
      setGameState((prev) => {
        if (prev.timeRemaining <= 1) {
          endGame()
          return { ...prev, timeRemaining: 0, gameOver: true, isPlaying: false }
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 }
      })
    }, 1000)

    // Start animation loop
    gameLoop()
  }

  const pauseGame = () => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }))
  }

  const resetGame = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current)
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    initializeGame()
  }

  const endGame = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current)
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    // Update high score
    const newHighScore = Math.max(gameState.score, gameState.highScore)
    localStorage.setItem(`highScore_${gameId}`, newHighScore.toString())

    setGameState((prev) => ({
      ...prev,
      highScore: newHighScore,
      gameOver: true,
      isPlaying: false,
    }))

    // Notify parent component
    onGameEnd(gameState.score > gameState.highScore ? playerId : null)
  }

  const gameLoop = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.gameOver) {
      return
    }

    // Update game objects
    updateGameObjects()
    checkCollisions()
    render()

    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [gameState.isPlaying, gameState.isPaused, gameState.gameOver])

  const updateGameObjects = () => {
    // Update targets
    setTargets((prev) =>
      prev.map((target) => {
        const newX = target.x + (target.velocity?.x || 0)
        const newY = target.y + (target.velocity?.y || 0)

        // Bounce off walls
        let newVelX = target.velocity?.x || 0
        let newVelY = target.velocity?.y || 0

        if (newX <= 0 || newX >= 750) newVelX *= -1
        if (newY <= 0 || newY >= 350) newVelY *= -1

        return {
          ...target,
          x: Math.max(0, Math.min(750, newX)),
          y: Math.max(0, Math.min(350, newY)),
          velocity: { x: newVelX, y: newVelY },
        }
      }),
    )

    // Update projectiles
    setProjectiles((prev) =>
      prev
        .map((projectile) => ({
          ...projectile,
          x: projectile.x + (projectile.velocity?.x || 0),
          y: projectile.y + (projectile.velocity?.y || 0),
        }))
        .filter((projectile) => projectile.x > 0 && projectile.x < 800 && projectile.y > 0 && projectile.y < 400),
    )
  }

  const checkCollisions = () => {
    // Check projectile-target collisions
    setProjectiles((prevProjectiles) => {
      const remainingProjectiles: GameObject[] = []

      prevProjectiles.forEach((projectile) => {
        let hit = false

        setTargets((prevTargets) => {
          return prevTargets.filter((target) => {
            const collision =
              projectile.x < target.x + target.width &&
              projectile.x + projectile.width > target.x &&
              projectile.y < target.y + target.height &&
              projectile.y + projectile.height > target.y

            if (collision && !hit) {
              hit = true
              // Increase score
              setGameState((prev) => ({ ...prev, score: prev.score + 10 }))
              return false // Remove target
            }
            return true // Keep target
          })
        })

        if (!hit) {
          remainingProjectiles.push(projectile)
        }
      })

      return remainingProjectiles
    })
  }

  const render = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#f8fafc"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw player
    ctx.fillStyle = player.color
    ctx.fillRect(player.x, player.y, player.width, player.height)

    // Draw targets
    targets.forEach((target) => {
      ctx.fillStyle = target.color
      ctx.fillRect(target.x, target.y, target.width, target.height)
    })

    // Draw projectiles
    projectiles.forEach((projectile) => {
      ctx.fillStyle = projectile.color
      ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height)
    })

    // Draw UI elements
    ctx.fillStyle = "#1f2937"
    ctx.font = "16px Arial"
    ctx.fillText(`Score: ${gameState.score}`, 10, 25)
    ctx.fillText(`Level: ${gameState.level}`, 10, 50)
    ctx.fillText(`Lives: ${gameState.lives}`, 10, 75)
    ctx.fillText(`Time: ${gameState.timeRemaining}`, 10, 100)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameState.isPlaying || gameState.isPaused) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    // Create projectile
    const newProjectile: GameObject = {
      x: player.x + player.width / 2,
      y: player.y + player.height / 2,
      width: 5,
      height: 5,
      color: "#3b82f6",
      velocity: {
        x: (clickX - (player.x + player.width / 2)) * 0.1,
        y: (clickY - (player.y + player.height / 2)) * 0.1,
      },
    }

    setProjectiles((prev) => [...prev, newProjectile])
  }

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (!gameState.isPlaying || gameState.isPaused) return

      const speed = 5
      setPlayer((prev) => {
        let newX = prev.x
        let newY = prev.y

        switch (e.key) {
          case "ArrowUp":
          case "w":
            newY = Math.max(0, prev.y - speed)
            break
          case "ArrowDown":
          case "s":
            newY = Math.min(350, prev.y + speed)
            break
          case "ArrowLeft":
          case "a":
            newX = Math.max(0, prev.x - speed)
            break
          case "ArrowRight":
          case "d":
            newX = Math.min(750, prev.x + speed)
            break
        }

        return { ...prev, x: newX, y: newY }
      })
    },
    [gameState.isPlaying, gameState.isPaused],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress])

  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      gameLoop()
    }
  }, [gameState.isPlaying, gameState.isPaused, gameLoop])

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                {gameId === "last-stand" ? "Last Stand" : gameId === "pixel-pool" ? "Pixel Pool" : "Cyber Arena"}
              </CardTitle>
              <CardDescription>
                Player: {playerName} | Mode: {gameMode}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsSoundEnabled(!isSoundEnabled)}>
                {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{gameState.score}</div>
            <div className="text-sm text-gray-600">Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{gameState.level}</div>
            <div className="text-sm text-gray-600">Level</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{gameState.lives}</div>
            <div className="text-sm text-gray-600">Lives</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{gameState.highScore}</div>
            <div className="text-sm text-gray-600">High Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Game Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {!gameState.isPlaying ? (
                <Button onClick={startGame} className="bg-green-600 hover:bg-green-700">
                  <Play className="w-4 h-4 mr-2" />
                  Start Game
                </Button>
              ) : (
                <Button onClick={pauseGame} variant="outline">
                  {gameState.isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                  {gameState.isPaused ? "Resume" : "Pause"}
                </Button>
              )}
              <Button onClick={resetGame} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Time: {Math.floor(gameState.timeRemaining / 60)}:
                {(gameState.timeRemaining % 60).toString().padStart(2, "0")}
              </div>
              <Progress value={(gameState.timeRemaining / 60) * 100} className="w-32" />
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Game Canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="border border-gray-300 rounded-lg cursor-crosshair bg-slate-50"
              onClick={handleCanvasClick}
            />

            {gameState.gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <Card className="bg-white">
                  <CardContent className="p-6 text-center">
                    <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Game Over!</h3>
                    <p className="text-gray-600 mb-4">Final Score: {gameState.score}</p>
                    {gameState.score > gameState.highScore && (
                      <Badge className="bg-yellow-100 text-yellow-800 mb-4">New High Score!</Badge>
                    )}
                    <div className="flex gap-2 justify-center">
                      <Button onClick={resetGame} className="bg-orange-600 hover:bg-orange-700">
                        Play Again
                      </Button>
                      <Button variant="outline" onClick={() => onGameEnd(null)}>
                        Back to Games
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {gameState.isPaused && !gameState.gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                <Card className="bg-white">
                  <CardContent className="p-4 text-center">
                    <Pause className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p className="font-medium">Game Paused</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Game Instructions */}
          <div className="mt-4 text-sm text-gray-600">
            <p>
              <strong>Controls:</strong> Use WASD or arrow keys to move. Click to shoot at targets.
            </p>
            <p>
              <strong>Objective:</strong> Hit as many moving targets as possible before time runs out!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
