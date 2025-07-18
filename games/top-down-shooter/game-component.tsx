"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePlatform } from "@/contexts/platform-context"
import { GameInstructions } from "./instructions"
import { MobileOptimizedContainer } from "@/components/mobile-optimized-container"

interface GameState {
  player: {
    x: number
    y: number
    health: number
  }
  enemies: Array<{
    x: number
    y: number
    health: number
  }>
  bullets: Array<{
    x: number
    y: number
    dx: number
    dy: number
  }>
  score: number
  gameOver: boolean
  started: boolean
}

export default function TopDownShooterGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameStateRef = useRef<GameState>({
    player: { x: 400, y: 300, health: 100 },
    enemies: [],
    bullets: [],
    score: 0,
    gameOver: false,
    started: false,
  })
  const animationFrameRef = useRef<number>()
  const keysRef = useRef<Set<string>>(new Set())
  const mouseRef = useRef({ x: 0, y: 0 })
  const lastEnemySpawnRef = useRef(0)

  const [gameState, setGameState] = useState(gameStateRef.current)
  const { platform } = usePlatform()

  const isMobile = platform === "mobile"

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 600

    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase())
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase())
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }

    const handleMouseClick = (e: MouseEvent) => {
      if (!gameStateRef.current.started || gameStateRef.current.gameOver) return

      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Calculate bullet direction
      const dx = mouseX - gameStateRef.current.player.x
      const dy = mouseY - gameStateRef.current.player.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      gameStateRef.current.bullets.push({
        x: gameStateRef.current.player.x,
        y: gameStateRef.current.player.y,
        dx: (dx / distance) * 10,
        dy: (dy / distance) * 10,
      })
    }

    // Touch controls for mobile
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      if (!gameStateRef.current.started || gameStateRef.current.gameOver) return

      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      const touchX = touch.clientX - rect.left
      const touchY = touch.clientY - rect.top

      // Left side of screen for movement, right side for shooting
      if (touchX < canvas.width / 2) {
        // Movement - set player position towards touch
        const dx = touchX - gameStateRef.current.player.x
        const dy = touchY - gameStateRef.current.player.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 5) {
          gameStateRef.current.player.x += (dx / distance) * 5
          gameStateRef.current.player.y += (dy / distance) * 5
        }
      } else {
        // Shooting - shoot towards touch
        const dx = touchX - gameStateRef.current.player.x
        const dy = touchY - gameStateRef.current.player.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        gameStateRef.current.bullets.push({
          x: gameStateRef.current.player.x,
          y: gameStateRef.current.player.y,
          dx: (dx / distance) * 10,
          dy: (dy / distance) * 10,
        })
      }
    }

    const gameLoop = () => {
      if (!gameStateRef.current.started || gameStateRef.current.gameOver) {
        animationFrameRef.current = requestAnimationFrame(gameLoop)
        return
      }

      // Update player position (desktop only)
      if (!isMobile) {
        if (keysRef.current.has("w") || keysRef.current.has("arrowup")) {
          gameStateRef.current.player.y = Math.max(20, gameStateRef.current.player.y - 5)
        }
        if (keysRef.current.has("s") || keysRef.current.has("arrowdown")) {
          gameStateRef.current.player.y = Math.min(canvas.height - 20, gameStateRef.current.player.y + 5)
        }
        if (keysRef.current.has("a") || keysRef.current.has("arrowleft")) {
          gameStateRef.current.player.x = Math.max(20, gameStateRef.current.player.x - 5)
        }
        if (keysRef.current.has("d") || keysRef.current.has("arrowright")) {
          gameStateRef.current.player.x = Math.min(canvas.width - 20, gameStateRef.current.player.x + 5)
        }
      }

      // Spawn enemies
      const now = Date.now()
      if (now - lastEnemySpawnRef.current > 2000) {
        gameStateRef.current.enemies.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          health: 1,
        })
        lastEnemySpawnRef.current = now
      }

      // Update bullets
      gameStateRef.current.bullets = gameStateRef.current.bullets.filter((bullet) => {
        bullet.x += bullet.dx
        bullet.y += bullet.dy
        return bullet.x > 0 && bullet.x < canvas.width && bullet.y > 0 && bullet.y < canvas.height
      })

      // Check bullet-enemy collisions
      gameStateRef.current.bullets = gameStateRef.current.bullets.filter((bullet) => {
        let hit = false
        gameStateRef.current.enemies = gameStateRef.current.enemies.filter((enemy) => {
          const distance = Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2)
          if (distance < 20) {
            hit = true
            gameStateRef.current.score += 10
            return false
          }
          return true
        })
        return !hit
      })

      // Check player-enemy collisions
      gameStateRef.current.enemies.forEach((enemy) => {
        const distance = Math.sqrt(
          (gameStateRef.current.player.x - enemy.x) ** 2 + (gameStateRef.current.player.y - enemy.y) ** 2,
        )
        if (distance < 30) {
          gameStateRef.current.player.health -= 1
          if (gameStateRef.current.player.health <= 0) {
            gameStateRef.current.gameOver = true
          }
        }
      })

      // Draw everything
      ctx.fillStyle = "#000"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw player
      ctx.fillStyle = "#00ff00"
      ctx.beginPath()
      ctx.arc(gameStateRef.current.player.x, gameStateRef.current.player.y, 15, 0, Math.PI * 2)
      ctx.fill()

      // Draw enemies
      ctx.fillStyle = "#ff0000"
      gameStateRef.current.enemies.forEach((enemy) => {
        ctx.beginPath()
        ctx.arc(enemy.x, enemy.y, 10, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw bullets
      ctx.fillStyle = "#ffff00"
      gameStateRef.current.bullets.forEach((bullet) => {
        ctx.beginPath()
        ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw UI
      ctx.fillStyle = "#fff"
      ctx.font = "20px Arial"
      ctx.fillText(`Score: ${gameStateRef.current.score}`, 10, 30)
      ctx.fillText(`Health: ${gameStateRef.current.player.health}`, 10, 60)

      setGameState({ ...gameStateRef.current })
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    if (!isMobile) {
      window.addEventListener("keydown", handleKeyDown)
      window.addEventListener("keyup", handleKeyUp)
      canvas.addEventListener("mousemove", handleMouseMove)
      canvas.addEventListener("click", handleMouseClick)
    } else {
      canvas.addEventListener("touchstart", handleTouchStart)
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (!isMobile) {
        window.removeEventListener("keydown", handleKeyDown)
        window.removeEventListener("keyup", handleKeyUp)
        canvas.removeEventListener("mousemove", handleMouseMove)
        canvas.removeEventListener("click", handleMouseClick)
      } else {
        canvas.removeEventListener("touchstart", handleTouchStart)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isMobile])

  const startGame = () => {
    gameStateRef.current = {
      player: { x: 400, y: 300, health: 100 },
      enemies: [],
      bullets: [],
      score: 0,
      gameOver: false,
      started: true,
    }
    setGameState({ ...gameStateRef.current })
  }

  const resetGame = () => {
    gameStateRef.current = {
      player: { x: 400, y: 300, health: 100 },
      enemies: [],
      bullets: [],
      score: 0,
      gameOver: false,
      started: false,
    }
    setGameState({ ...gameStateRef.current })
  }

  const GameContent = () => (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Archer Arena
            <div className="flex gap-2">
              <Badge variant="outline">Score: {gameState.score}</Badge>
              <Badge variant="outline">Health: {gameState.player.health}</Badge>
              <Badge variant="secondary">{isMobile ? "Touch Controls" : "Keyboard & Mouse"}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <canvas
              ref={canvasRef}
              className="border border-gray-300 rounded-lg max-w-full h-auto"
              style={{ touchAction: "none" }}
            />

            <div className="flex gap-4">
              {!gameState.started ? (
                <Button onClick={startGame} size="lg">
                  Start Game
                </Button>
              ) : gameState.gameOver ? (
                <Button onClick={resetGame} size="lg">
                  Play Again
                </Button>
              ) : null}
            </div>

            {gameState.gameOver && (
              <div className="text-center">
                <h3 className="text-2xl font-bold text-red-600 mb-2">Game Over!</h3>
                <p className="text-lg">Final Score: {gameState.score}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <GameInstructions platform={platform} />
    </div>
  )

  return isMobile ? (
    <MobileOptimizedContainer>
      <GameContent />
    </MobileOptimizedContainer>
  ) : (
    <GameContent />
  )
}
