"use client"

import { useEffect, useRef } from "react"
import type { GameState } from "./game-engine"

interface GameRendererProps {
  gameState: GameState
  localPlayerId: string
}

export default function GameRendererFinal({ gameState, localPlayerId }: GameRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const render = () => {
      // Clear canvas
      ctx.fillStyle = "#1a2a1a" // Dark green background
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid
      ctx.strokeStyle = "rgba(0, 255, 0, 0.1)"
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Draw walls
      if (gameState.walls) {
        ctx.fillStyle = "#555555"
        gameState.walls.forEach((wall) => {
          ctx.fillRect(wall.position.x - wall.size, wall.position.y - wall.size, wall.size * 2, wall.size * 2)
        })
      }

      // Draw arrows
      if (gameState.arrows) {
        gameState.arrows.forEach((arrow) => {
          ctx.save()
          ctx.translate(arrow.position.x, arrow.position.y)
          ctx.rotate(arrow.rotation)
          ctx.fillStyle = arrow.color || "#ffff00"
          ctx.fillRect(-8, -1, 16, 2)
          ctx.restore()
        })
      }

      // Draw players
      Object.values(gameState.players).forEach((player) => {
        if (!player || player.health <= 0) return

        ctx.save()
        ctx.translate(player.position.x, player.position.y)

        // Player Body
        ctx.fillStyle = player.color
        ctx.beginPath()
        ctx.arc(0, 0, player.size, 0, Math.PI * 2)
        ctx.fill()

        // Player direction indicator
        ctx.rotate(player.rotation)
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(player.size * 0.5, 0)
        ctx.lineTo(player.size, 0)
        ctx.stroke()

        ctx.restore()

        // Health bar
        const healthBarWidth = 40
        const healthBarHeight = 5
        const healthPercentage = player.health / 100
        const healthBarX = player.position.x - healthBarWidth / 2
        const healthBarY = player.position.y - player.size - 15

        ctx.fillStyle = "#333"
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight)
        ctx.fillStyle = healthPercentage > 0.5 ? "#00ff00" : healthPercentage > 0.2 ? "#ffff00" : "#ff0000"
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight)

        // Player Name
        ctx.fillStyle = "#ffffff"
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.fillText(player.name, player.position.x, healthBarY - 5)
      })

      animationFrameId.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [gameState])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="w-full h-full"
      style={{ imageRendering: "pixelated" }}
    />
  )
}
