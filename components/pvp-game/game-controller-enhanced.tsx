"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useGameControls } from "@/hooks/use-game-controls"
import { usePlatform } from "@/contexts/platform-context"
import MobileGameContainer from "@/components/mobile-game-container"

interface GameControllerEnhancedProps {
  gameId: string
  onGameEnd?: (result: any) => void
  className?: string
}

interface Player {
  id: string
  x: number
  y: number
  angle: number
  health: number
  maxHealth: number
  isCharging: boolean
  chargePower: number
}

interface Arrow {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  angle: number
  playerId: string
}

interface GameState {
  players: Player[]
  arrows: Arrow[]
  gameStatus: "waiting" | "playing" | "ended"
  winner?: string
}

export default function GameControllerEnhanced({ gameId, onGameEnd, className = "" }: GameControllerEnhancedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const { platform } = usePlatform()

  // Use the unified game controls
  const controls = useGameControls()

  const [gameState, setGameState] = useState<GameState>({
    players: [
      {
        id: "player1",
        x: 100,
        y: 300,
        angle: 0,
        health: 100,
        maxHealth: 100,
        isCharging: false,
        chargePower: 0,
      },
      {
        id: "player2",
        x: 700,
        y: 300,
        angle: Math.PI,
        health: 100,
        maxHealth: 100,
        isCharging: false,
        chargePower: 0,
      },
    ],
    arrows: [],
    gameStatus: "playing",
  })

  // Game loop
  const gameLoop = useCallback(() => {
    setGameState((prevState) => {
      const newState = { ...prevState }
      const player = newState.players[0] // Current player

      // Handle movement
      const moveSpeed = 3
      if (controls.moveUp) player.y -= moveSpeed
      if (controls.moveDown) player.y += moveSpeed
      if (controls.moveLeft) player.x -= moveSpeed
      if (controls.moveRight) player.x += moveSpeed

      // Handle aiming
      if (controls.isAiming) {
        player.angle = controls.aimAngle
        player.isCharging = true
        player.chargePower = Math.min(controls.aimPower * 100, 100)
      } else {
        player.isCharging = false
        player.chargePower = 0
      }

      // Handle shooting
      if (controls.shoot && player.chargePower > 10) {
        const arrow: Arrow = {
          id: `arrow_${Date.now()}`,
          x: player.x,
          y: player.y,
          vx: Math.cos(player.angle) * (player.chargePower / 10),
          vy: Math.sin(player.angle) * (player.chargePower / 10),
          angle: player.angle,
          playerId: player.id,
        }
        newState.arrows.push(arrow)
      }

      // Update arrows
      newState.arrows = newState.arrows.filter((arrow) => {
        arrow.x += arrow.vx
        arrow.y += arrow.vy
        arrow.vy += 0.2 // Gravity

        // Remove arrows that are off-screen
        return arrow.x > -50 && arrow.x < 850 && arrow.y > -50 && arrow.y < 650
      })

      // Keep player in bounds
      player.x = Math.max(20, Math.min(780, player.x))
      player.y = Math.max(20, Math.min(580, player.y))

      return newState
    })

    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [controls])

  // Render game
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#1a1a2e"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw players
    gameState.players.forEach((player) => {
      ctx.save()
      ctx.translate(player.x, player.y)
      ctx.rotate(player.angle)

      // Draw player body
      ctx.fillStyle = player.id === "player1" ? "#00ff00" : "#ff0000"
      ctx.fillRect(-15, -10, 30, 20)

      // Draw bow
      ctx.strokeStyle = "#8B4513"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(0, 0, 20, -Math.PI / 4, Math.PI / 4)
      ctx.stroke()

      // Draw charge indicator
      if (player.isCharging) {
        ctx.strokeStyle = "#ffff00"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(0, 0, 25 + player.chargePower / 5, 0, Math.PI * 2)
        ctx.stroke()
      }

      ctx.restore()

      // Draw health bar
      ctx.fillStyle = "#ff0000"
      ctx.fillRect(player.x - 20, player.y - 30, 40, 5)
      ctx.fillStyle = "#00ff00"
      ctx.fillRect(player.x - 20, player.y - 30, (player.health / player.maxHealth) * 40, 5)
    })

    // Draw arrows
    gameState.arrows.forEach((arrow) => {
      ctx.save()
      ctx.translate(arrow.x, arrow.y)
      ctx.rotate(arrow.angle)

      ctx.fillStyle = "#ffff00"
      ctx.fillRect(-10, -2, 20, 4)
      ctx.fillStyle = "#ff0000"
      ctx.fillRect(8, -4, 4, 8)

      ctx.restore()
    })

    // Draw UI
    ctx.fillStyle = "#ffffff"
    ctx.font = "16px monospace"
    ctx.fillText(`Health: ${gameState.players[0].health}`, 10, 30)

    if (gameState.players[0].isCharging) {
      ctx.fillText(`Power: ${Math.round(gameState.players[0].chargePower)}%`, 10, 50)
    }
  }, [gameState])

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
        <div>Game: {gameId}</div>
        <div>Platform: {platform}</div>
        <div>Status: {gameState.gameStatus}</div>
      </div>
    </div>
  )

  // Wrap in mobile container if on mobile platform
  if (platform === "mobile") {
    return <MobileGameContainer gameId={gameId}>{gameContent}</MobileGameContainer>
  }

  return gameContent
}
