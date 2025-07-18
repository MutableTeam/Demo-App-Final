"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { gameRegistry } from "@/types/game-registry"
import { Play, Pause, RotateCcw, Trophy, Users, Clock, Target, Zap } from "lucide-react"

interface GameContainerProps {
  gameId: string
  playerId: string
  playerName: string
  isHost: boolean
  gameMode: "single" | "multiplayer"
  onGameEnd: (winner: string | null) => void
}

export function GameContainer({ gameId, playerId, playerName, isHost, gameMode, onGameEnd }: GameContainerProps) {
  const [gameState, setGameState] = useState<"loading" | "ready" | "playing" | "paused" | "finished">("loading")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameData, setGameData] = useState<any>(null)
  const gameCanvasRef = useRef<HTMLCanvasElement>(null)
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const game = gameRegistry.getGame(gameId)

  useEffect(() => {
    if (game) {
      setGameData(game)
      setGameState("ready")
    }
  }, [game])

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      gameIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleGameEnd()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current)
      }
    }

    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current)
      }
    }
  }, [gameState, timeLeft])

  const handleStartGame = () => {
    setGameState("playing")
    setScore(0)
    setTimeLeft(60)
    initializeGame()
  }

  const handlePauseGame = () => {
    setGameState("paused")
  }

  const handleResumeGame = () => {
    setGameState("playing")
  }

  const handleRestartGame = () => {
    setGameState("ready")
    setScore(0)
    setTimeLeft(60)
  }

  const handleGameEnd = () => {
    setGameState("finished")
    onGameEnd(score > 50 ? playerId : null)
  }

  const initializeGame = () => {
    const canvas = gameCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Simple game initialization
    canvas.width = 800
    canvas.height = 600

    // Clear canvas
    ctx.fillStyle = "#f3f4f6"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw game elements based on game type
    if (gameId === "last-stand") {
      drawTowerDefenseGame(ctx)
    } else if (gameId === "pixel-pool") {
      drawPoolGame(ctx)
    } else if (gameId === "top-down-shooter") {
      drawShooterGame(ctx)
    }
  }

  const drawTowerDefenseGame = (ctx: CanvasRenderingContext2D) => {
    // Draw a simple tower defense layout
    ctx.fillStyle = "#10b981"
    ctx.fillRect(50, 50, 100, 100)
    ctx.fillStyle = "#ffffff"
    ctx.font = "16px Arial"
    ctx.fillText("Tower", 75, 105)

    ctx.fillStyle = "#ef4444"
    ctx.fillRect(200, 200, 50, 50)
    ctx.fillStyle = "#ffffff"
    ctx.fillText("Enemy", 205, 230)
  }

  const drawPoolGame = (ctx: CanvasRenderingContext2D) => {
    // Draw a simple pool table
    ctx.fillStyle = "#059669"
    ctx.fillRect(100, 100, 600, 300)

    // Draw balls
    const balls = [
      { x: 200, y: 200, color: "#ffffff" },
      { x: 250, y: 200, color: "#ef4444" },
      { x: 300, y: 200, color: "#3b82f6" },
    ]

    balls.forEach((ball) => {
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, 15, 0, 2 * Math.PI)
      ctx.fillStyle = ball.color
      ctx.fill()
      ctx.strokeStyle = "#000000"
      ctx.stroke()
    })
  }

  const drawShooterGame = (ctx: CanvasRenderingContext2D) => {
    // Draw a simple shooter layout
    ctx.fillStyle = "#3b82f6"
    ctx.fillRect(375, 500, 50, 50)
    ctx.fillStyle = "#ffffff"
    ctx.font = "16px Arial"
    ctx.fillText("Player", 380, 530)

    // Draw targets
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = "#ef4444"
      ctx.fillRect(200 + i * 200, 100, 40, 40)
      ctx.fillStyle = "#ffffff"
      ctx.fillText("Target", 205 + i * 200, 125)
    }
  }

  // Handle canvas clicks for simple interaction
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== "playing") return

    const canvas = gameCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Simple scoring logic
    setScore((prev) => prev + 10)
  }

  if (!game) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Game not found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Game Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">{game.name}</CardTitle>
              <p className="text-gray-600">{game.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {game.category}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{gameMode === "single" ? "Single Player" : "Multiplayer"}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Game Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{score}</div>
            <div className="text-sm text-gray-600">Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{timeLeft}s</div>
            <div className="text-sm text-gray-600">Time Left</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{Math.floor(score / 10)}</div>
            <div className="text-sm text-gray-600">Hits</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{game.tokenReward}</div>
            <div className="text-sm text-gray-600">MUTB Reward</div>
          </CardContent>
        </Card>
      </div>

      {/* Game Canvas */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Game Area</CardTitle>
            <div className="flex gap-2">
              {gameState === "ready" && (
                <Button onClick={handleStartGame} className="bg-green-500 hover:bg-green-600">
                  <Play className="w-4 h-4 mr-2" />
                  Start Game
                </Button>
              )}
              {gameState === "playing" && (
                <Button onClick={handlePauseGame} variant="outline">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
              {gameState === "paused" && (
                <>
                  <Button onClick={handleResumeGame} className="bg-green-500 hover:bg-green-600">
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                  <Button onClick={handleRestartGame} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restart
                  </Button>
                </>
              )}
              {gameState === "finished" && (
                <Button onClick={handleRestartGame} className="bg-blue-500 hover:bg-blue-600">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <canvas
              ref={gameCanvasRef}
              onClick={handleCanvasClick}
              className="w-full border border-gray-200 rounded-lg cursor-crosshair"
              style={{ maxWidth: "800px", height: "400px" }}
            />
            {gameState === "loading" && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading game...</p>
                </div>
              </div>
            )}
            {gameState === "paused" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <div className="text-center text-white">
                  <Pause className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-xl font-semibold">Game Paused</p>
                </div>
              </div>
            )}
            {gameState === "finished" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <div className="text-center text-white">
                  <Trophy className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-2xl font-bold mb-2">Game Over!</p>
                  <p className="text-lg">Final Score: {score}</p>
                  <p className="text-sm">You earned {game.tokenReward} MUTB tokens!</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Game Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Play</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {game.instructions?.map((instruction, index) => (
              <p key={index} className="text-gray-600">
                {index + 1}. {instruction}
              </p>
            )) || (
              <div className="space-y-2">
                <p className="text-gray-600">1. Click the Start Game button to begin</p>
                <p className="text-gray-600">2. Click on the game area to interact and score points</p>
                <p className="text-gray-600">3. Try to get the highest score before time runs out</p>
                <p className="text-gray-600">4. Earn MUTB tokens based on your performance</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
