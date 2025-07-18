"use client"

import { useEffect, useRef, useState } from "react"
import type { GameState } from "./game-engine"
import type { PlatformType } from "@/contexts/platform-context"
import { debugManager } from "@/utils/debug-utils"
import { cn } from "@/lib/utils"

interface EnhancedGameRendererProps {
  gameState: GameState
  localPlayerId: string
  debugMode?: boolean
  platformType?: PlatformType
  onTouchControl?: (control: string, active: boolean) => void
  className?: string
}

export default function EnhancedGameRenderer({
  gameState,
  localPlayerId,
  debugMode = false,
  platformType = "desktop",
  onTouchControl,
  className,
}: EnhancedGameRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  // Update canvas size based on container
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const container = canvas.parentElement
      if (!container) return

      const rect = container.getBoundingClientRect()
      const newWidth = Math.floor(rect.width)
      const newHeight = Math.floor(rect.height)

      if (newWidth !== canvasSize.width || newHeight !== canvasSize.height) {
        setCanvasSize({ width: newWidth, height: newHeight })
        canvas.width = newWidth
        canvas.height = newHeight

        debugManager.logInfo("RENDERER", `Canvas resized to ${newWidth}x${newHeight}`)
      }
    }

    updateCanvasSize()

    const resizeObserver = new ResizeObserver(updateCanvasSize)
    const canvas = canvasRef.current
    if (canvas?.parentElement) {
      resizeObserver.observe(canvas.parentElement)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [canvasSize.width, canvasSize.height])

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const render = () => {
      // Clear canvas
      ctx.fillStyle = "#1a1a1a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Calculate scale to fit game area in canvas
      const gameWidth = gameState.arenaSize?.width || 800
      const gameHeight = gameState.arenaSize?.height || 600
      const scaleX = canvas.width / gameWidth
      const scaleY = canvas.height / gameHeight
      const scale = Math.min(scaleX, scaleY)

      // Center the game area
      const offsetX = (canvas.width - gameWidth * scale) / 2
      const offsetY = (canvas.height - gameHeight * scale) / 2

      ctx.save()
      ctx.translate(offsetX, offsetY)
      ctx.scale(scale, scale)

      // Draw game background
      ctx.fillStyle = "#2d5a27"
      ctx.fillRect(0, 0, gameWidth, gameHeight)

      // Draw grid pattern
      ctx.strokeStyle = "#3d6a37"
      ctx.lineWidth = 1
      const gridSize = 50
      for (let x = 0; x <= gameWidth; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, gameHeight)
        ctx.stroke()
      }
      for (let y = 0; y <= gameHeight; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(gameWidth, y)
        ctx.stroke()
      }

      // Draw walls
      if (gameState.walls) {
        ctx.fillStyle = "#8B4513"
        ctx.strokeStyle = "#654321"
        ctx.lineWidth = 2
        gameState.walls.forEach((wall) => {
          ctx.fillRect(wall.x, wall.y, wall.width, wall.height)
          ctx.strokeRect(wall.x, wall.y, wall.width, wall.height)
        })
      }

      // Draw pickups
      if (gameState.pickups) {
        gameState.pickups.forEach((pickup) => {
          ctx.save()
          ctx.translate(pickup.x, pickup.y)

          // Glow effect
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15)
          gradient.addColorStop(0, pickup.type === "health" ? "#ff6b6b" : "#4ecdc4")
          gradient.addColorStop(1, "transparent")
          ctx.fillStyle = gradient
          ctx.fillRect(-15, -15, 30, 30)

          // Pickup icon
          ctx.fillStyle = pickup.type === "health" ? "#ff4757" : "#2ed573"
          ctx.fillRect(-8, -8, 16, 16)

          ctx.restore()
        })
      }

      // Draw arrows
      if (gameState.arrows) {
        gameState.arrows.forEach((arrow) => {
          ctx.save()
          ctx.translate(arrow.x, arrow.y)
          ctx.rotate(arrow.angle)

          // Arrow shaft
          ctx.fillStyle = "#8B4513"
          ctx.fillRect(-15, -2, 30, 4)

          // Arrow head
          ctx.fillStyle = "#C0C0C0"
          ctx.beginPath()
          ctx.moveTo(15, 0)
          ctx.lineTo(10, -5)
          ctx.lineTo(10, 5)
          ctx.closePath()
          ctx.fill()

          // Arrow fletching
          ctx.fillStyle = "#FF6B6B"
          ctx.fillRect(-15, -3, 5, 6)

          ctx.restore()
        })
      }

      // Draw players
      Object.values(gameState.players).forEach((player) => {
        if (!player || player.health <= 0) return

        ctx.save()
        ctx.translate(player.position.x, player.position.y)
        ctx.rotate(player.rotation || 0)

        // Player shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
        ctx.beginPath()
        ctx.ellipse(2, 2, player.size + 2, player.size + 2, 0, 0, Math.PI * 2)
        ctx.fill()

        // Player body
        ctx.fillStyle = player.color
        ctx.beginPath()
        ctx.arc(0, 0, player.size, 0, Math.PI * 2)
        ctx.fill()

        // Player outline
        ctx.strokeStyle = player.id === localPlayerId ? "#FFD700" : "#FFFFFF"
        ctx.lineWidth = player.id === localPlayerId ? 3 : 2
        ctx.stroke()

        // Direction indicator
        ctx.fillStyle = "#FFFFFF"
        ctx.beginPath()
        ctx.moveTo(player.size - 5, 0)
        ctx.lineTo(player.size + 10, -5)
        ctx.lineTo(player.size + 10, 5)
        ctx.closePath()
        ctx.fill()

        // Bow if drawing
        if (player.isDrawingBow) {
          ctx.strokeStyle = "#8B4513"
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(0, 0, player.size + 15, -0.3, 0.3)
          ctx.stroke()

          // Bow string
          ctx.strokeStyle = "#FFFFFF"
          ctx.lineWidth = 1
          const stringTension = (player.drawPower || 0) * 10
          ctx.beginPath()
          ctx.moveTo(Math.cos(-0.3) * (player.size + 15), Math.sin(-0.3) * (player.size + 15))
          ctx.quadraticCurveTo(
            -stringTension,
            0,
            Math.cos(0.3) * (player.size + 15),
            Math.sin(0.3) * (player.size + 15),
          )
          ctx.stroke()
        }

        // Dash effect
        if (player.isDashing) {
          ctx.strokeStyle = "#00FFFF"
          ctx.lineWidth = 2
          for (let i = 0; i < 3; i++) {
            ctx.beginPath()
            ctx.arc(0, 0, player.size + 5 + i * 5, 0, Math.PI * 2)
            ctx.stroke()
          }
        }

        ctx.restore()

        // Player name and health bar
        ctx.save()
        ctx.translate(player.position.x, player.position.y - player.size - 20)

        // Name
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.fillText(player.name, 0, 0)

        // Health bar background
        ctx.fillStyle = "#333333"
        ctx.fillRect(-25, 5, 50, 6)

        // Health bar
        const healthPercent = player.health / (player.maxHealth || 100)
        ctx.fillStyle = healthPercent > 0.6 ? "#4CAF50" : healthPercent > 0.3 ? "#FFC107" : "#F44336"
        ctx.fillRect(-25, 5, 50 * healthPercent, 6)

        // Health bar border
        ctx.strokeStyle = "#FFFFFF"
        ctx.lineWidth = 1
        ctx.strokeRect(-25, 5, 50, 6)

        ctx.restore()
      })

      // Draw game UI overlays
      ctx.restore()

      // Game timer (top center)
      if (gameState.gameTime !== undefined) {
        const minutes = Math.floor(gameState.gameTime / 60)
        const seconds = Math.floor(gameState.gameTime % 60)
        const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
        ctx.fillRect(canvas.width / 2 - 40, 10, 80, 30)

        ctx.fillStyle = "#FFFFFF"
        ctx.font = "16px Arial"
        ctx.textAlign = "center"
        ctx.fillText(timeString, canvas.width / 2, 30)
      }

      // Scoreboard (top right)
      const players = Object.values(gameState.players).filter((p) => p && p.health > 0)
      if (players.length > 0) {
        const scoreboardWidth = 200
        const scoreboardHeight = players.length * 25 + 20

        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
        ctx.fillRect(canvas.width - scoreboardWidth - 10, 10, scoreboardWidth, scoreboardHeight)

        ctx.fillStyle = "#FFFFFF"
        ctx.font = "14px Arial"
        ctx.textAlign = "left"
        ctx.fillText("SCOREBOARD", canvas.width - scoreboardWidth, 30)

        players.forEach((player, index) => {
          const y = 50 + index * 25
          const score = player.score || 0

          // Player color indicator
          ctx.fillStyle = player.color
          ctx.fillRect(canvas.width - scoreboardWidth + 5, y - 10, 15, 15)

          // Player name and score
          ctx.fillStyle = "#FFFFFF"
          ctx.fillText(`${player.name}`, canvas.width - scoreboardWidth + 25, y)
          ctx.textAlign = "right"
          ctx.fillText(`${score}`, canvas.width - 20, y)
          ctx.textAlign = "left"
        })
      }

      // Debug info
      if (debugMode) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
        ctx.fillRect(10, canvas.height - 100, 200, 90)

        ctx.fillStyle = "#00FF00"
        ctx.font = "12px monospace"
        ctx.textAlign = "left"
        ctx.fillText(`Players: ${Object.keys(gameState.players).length}`, 15, canvas.height - 80)
        ctx.fillText(`Arrows: ${gameState.arrows?.length || 0}`, 15, canvas.height - 65)
        ctx.fillText(`Walls: ${gameState.walls?.length || 0}`, 15, canvas.height - 50)
        ctx.fillText(`Pickups: ${gameState.pickups?.length || 0}`, 15, canvas.height - 35)
        ctx.fillText(`Time: ${gameState.gameTime?.toFixed(1) || 0}s`, 15, canvas.height - 20)
      }

      animationFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameState, localPlayerId, debugMode, canvasSize])

  return (
    <div className={cn("w-full h-full flex items-center justify-center bg-black", className)}>
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full border border-cyan-500/30 rounded-lg"
        style={{
          imageRendering: "pixelated",
          touchAction: "none",
        }}
      />
    </div>
  )
}
