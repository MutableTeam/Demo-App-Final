"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useGameControls } from "@/hooks/use-game-controls"
import { usePlatform } from "@/contexts/platform-context"
import MobileGameContainer from "@/components/mobile-game-container"

interface TopDownShooterProps {
  onGameEnd?: (result: any) => void
  className?: string
}

interface Player {
  x: number
  y: number
  angle: number
  health: number
  maxHealth: number
  speed: number
}

interface Enemy {
  id: string
  x: number
  y: number
  health: number
  speed: number
  lastAttack: number
}

interface Bullet {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  damage: number
}

interface GameState {
  player: Player
  enemies: Enemy[]
  bullets: Bullet[]
  score: number
  gameStatus: "playing" | "paused" | "ended"
  wave: number
}

export default function TopDownShooterComponent({ onGameEnd, className = "" }: TopDownShooterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const lastEnemySpawn = useRef<number>(0)
  const { platform } = usePlatform()

  // Use the unified game controls
  const controls = useGameControls()

  const [gameState, setGameState] = useState<GameState>({
    player: {
      x: 400,
      y: 300,
      angle: 0,
      health: 100,
      maxHealth: 100,
      speed: 4,
    },
    enemies: [],
    bullets: [],
    score: 0,
    gameStatus: "playing",
    wave: 1,
  })

  // Spawn enemies
  const spawnEnemy = useCallback(() => {
    const now = Date.now()
    if (now - lastEnemySpawn.current < 2000) return // Spawn every 2 seconds

    const side = Math.floor(Math.random() * 4)
    let x, y

    switch (side) {
      case 0: // Top
        x = Math.random() * 800
        y = -20
        break
      case 1: // Right
        x = 820
        y = Math.random() * 600
        break
      case 2: // Bottom
        x = Math.random() * 800
        y = 620
        break
      default: // Left
        x = -20
        y = Math.random() * 600
        break
    }

    const enemy: Enemy = {
      id: `enemy_${now}`,
      x,
      y,
      health: 30,
      speed: 1 + Math.random(),
      lastAttack: 0,
    }

    setGameState((prev) => ({
      ...prev,
      enemies: [...prev.enemies, enemy],
    }))

    lastEnemySpawn.current = now
  }, [])

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState.gameStatus !== "playing") return

    setGameState((prevState) => {
      const newState = { ...prevState }
      const { player } = newState

      // Handle movement
      if (controls.moveUp) player.y -= player.speed
      if (controls.moveDown) player.y += player.speed
      if (controls.moveLeft) player.x -= player.speed
      if (controls.moveRight) player.x += player.speed

      // Handle dash
      if (controls.dash) {
        const dashMultiplier = 2
        if (controls.moveUp) player.y -= player.speed * dashMultiplier
        if (controls.moveDown) player.y += player.speed * dashMultiplier
        if (controls.moveLeft) player.x -= player.speed * dashMultiplier
        if (controls.moveRight) player.x += player.speed * dashMultiplier
      }

      // Handle aiming
      if (controls.isAiming) {
        player.angle = controls.aimAngle
      }

      // Handle shooting
      if (controls.shoot) {
        const bullet: Bullet = {
          id: `bullet_${Date.now()}_${Math.random()}`,
          x: player.x,
          y: player.y,
          vx: Math.cos(player.angle) * 8,
          vy: Math.sin(player.angle) * 8,
          damage: 25,
        }
        newState.bullets.push(bullet)
      }

      // Update bullets
      newState.bullets = newState.bullets.filter((bullet) => {
        bullet.x += bullet.vx
        bullet.y += bullet.vy

        // Remove bullets that are off-screen
        return bullet.x > -50 && bullet.x < 850 && bullet.y > -50 && bullet.y < 650
      })

      // Update enemies
      newState.enemies = newState.enemies.filter((enemy) => {
        // Move towards player
        const dx = player.x - enemy.x
        const dy = player.y - enemy.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 0) {
          enemy.x += (dx / distance) * enemy.speed
          enemy.y += (dy / distance) * enemy.speed
        }

        // Check collision with bullets
        for (let i = newState.bullets.length - 1; i >= 0; i--) {
          const bullet = newState.bullets[i]
          const bulletDistance = Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2)

          if (bulletDistance < 20) {
            enemy.health -= bullet.damage
            newState.bullets.splice(i, 1)

            if (enemy.health <= 0) {
              newState.score += 10
              return false // Remove enemy
            }
          }
        }

        // Check collision with player
        const playerDistance = Math.sqrt((player.x - enemy.x) ** 2 + (player.y - enemy.y) ** 2)

        if (playerDistance < 25) {
          const now = Date.now()
          if (now - enemy.lastAttack > 1000) {
            player.health -= 10
            enemy.lastAttack = now
          }
        }

        return enemy.health > 0
      })

      // Keep player in bounds
      player.x = Math.max(20, Math.min(780, player.x))
      player.y = Math.max(20, Math.min(580, player.y))

      // Check game over
      if (player.health <= 0) {
        newState.gameStatus = "ended"
        if (onGameEnd) {
          onGameEnd({ score: newState.score, wave: newState.wave })
        }
      }

      return newState
    })

    // Spawn enemies
    spawnEnemy()

    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [controls, gameState.gameStatus, spawnEnemy, onGameEnd])

  // Render game
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw player
    const { player } = gameState
    ctx.save()
    ctx.translate(player.x, player.y)
    ctx.rotate(player.angle)

    // Player body
    ctx.fillStyle = "#00ff00"
    ctx.fillRect(-12, -8, 24, 16)

    // Player weapon
    ctx.fillStyle = "#666666"
    ctx.fillRect(12, -2, 15, 4)

    ctx.restore()

    // Draw enemies
    gameState.enemies.forEach((enemy) => {
      ctx.fillStyle = "#ff0000"
      ctx.fillRect(enemy.x - 10, enemy.y - 10, 20, 20)

      // Enemy health bar
      ctx.fillStyle = "#ff0000"
      ctx.fillRect(enemy.x - 12, enemy.y - 18, 24, 4)
      ctx.fillStyle = "#00ff00"
      ctx.fillRect(enemy.x - 12, enemy.y - 18, (enemy.health / 30) * 24, 4)
    })

    // Draw bullets
    gameState.bullets.forEach((bullet) => {
      ctx.fillStyle = "#ffff00"
      ctx.fillRect(bullet.x - 2, bullet.y - 2, 4, 4)
    })

    // Draw UI
    ctx.fillStyle = "#ffffff"
    ctx.font = "16px monospace"
    ctx.fillText(`Health: ${player.health}`, 10, 30)
    ctx.fillText(`Score: ${gameState.score}`, 10, 50)
    ctx.fillText(`Wave: ${gameState.wave}`, 10, 70)
    ctx.fillText(`Enemies: ${gameState.enemies.length}`, 10, 90)

    // Draw aiming indicator
    if (controls.isAiming) {
      ctx.strokeStyle = "#ffff00"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(player.x, player.y)
      ctx.lineTo(player.x + Math.cos(player.angle) * 50, player.y + Math.sin(player.angle) * 50)
      ctx.stroke()
    }
  }, [gameState, controls])

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 600

    // Start game loop
    gameLoop()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameLoop])

  // Render loop
  useEffect(() => {
    const renderLoop = () => {
      render()
      requestAnimationFrame(renderLoop)
    }
    renderLoop()
  }, [render])

  const gameContent = (
    <div className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain bg-gray-900"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Game UI Overlay */}
      <div className="absolute top-4 left-4 text-white font-mono text-sm">
        <div>Top-Down Shooter</div>
        <div>Platform: {platform}</div>
        <div>Status: {gameState.gameStatus}</div>
      </div>

      {gameState.gameStatus === "ended" && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Game Over</h2>
            <p className="text-lg mb-2">Final Score: {gameState.score}</p>
            <p className="text-lg mb-4">Wave Reached: {gameState.wave}</p>
          </div>
        </div>
      )}
    </div>
  )

  // Wrap in mobile container if on mobile platform
  if (platform === "mobile") {
    return <MobileGameContainer gameId="top-down-shooter">{gameContent}</MobileGameContainer>
  }

  return gameContent
}
