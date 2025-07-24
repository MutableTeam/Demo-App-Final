"use client"

import { useEffect, useRef } from "react"
import type { GameState } from "./game-engine"
import type { PlatformType } from "@/contexts/platform-context"
import { cn } from "@/lib/utils"

interface EnhancedGameRendererProps {
  gameState: GameState
  localPlayerId: string
  debugMode?: boolean
  platformType?: PlatformType
}

export default function EnhancedGameRenderer({
  gameState,
  localPlayerId,
  debugMode = false,
  platformType = "desktop",
}: EnhancedGameRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()

  // Canvas rendering logic
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

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

      // Draw players
      Object.values(gameState.players).forEach((player) => {
        if (!player || player.health <= 0) return

        ctx.save()
        ctx.translate(player.position.x, player.position.y)
        ctx.rotate(player.rotation)

        // Draw player body
        ctx.fillStyle = player.color
        ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size)

        // Draw player direction indicator
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(player.size, 0)
        ctx.stroke()

        ctx.restore()

        // Draw player name and health
        ctx.fillStyle = "#ffffff"
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.fillText(player.name, player.position.x, player.position.y - player.size - 15)

        // Health bar
        const healthBarWidth = 40
        const healthBarHeight = 5
        const healthPercentage = player.health / 100

        ctx.fillStyle = "#333"
        ctx.fillRect(
          player.position.x - healthBarWidth / 2,
          player.position.y - player.size - 10,
          healthBarWidth,
          healthBarHeight,
        )

        ctx.fillStyle = healthPercentage > 0.5 ? "#00ff00" : healthPercentage > 0.2 ? "#ffff00" : "#ff0000"
        ctx.fillRect(
          player.position.x - healthBarWidth / 2,
          player.position.y - player.size - 10,
          healthBarWidth * healthPercentage,
          healthBarHeight,
        )
      })

      // Draw arrows
      if (gameState.arrows) {
        gameState.arrows.forEach((arrow) => {
          ctx.save()
          ctx.translate(arrow.position.x, arrow.position.y)
          ctx.rotate(arrow.rotation)
          ctx.fillStyle = arrow.color || "#ffff00"
          ctx.fillRect(-8, -1, 16, 2)
          ctx.beginPath()
          ctx.moveTo(8, 0)
          ctx.lineTo(4, -3)
          ctx.lineTo(4, 3)
          ctx.closePath()
          ctx.fill()
          ctx.restore()
        })
      }

      // Draw walls
      if (gameState.walls) {
        ctx.fillStyle = "#666666"
        gameState.walls.forEach((wall) => {
          ctx.fillRect(wall.position.x, wall.position.y, wall.width, wall.height)
        })
      }

      // Draw pickups
      if (gameState.pickups) {
        gameState.pickups.forEach((pickup) => {
          ctx.save()
          ctx.translate(pickup.position.x, pickup.position.y)
          ctx.rotate(Date.now() * 0.005)
          ctx.fillStyle = pickup.color || "#00ff00"
          ctx.fillRect(-8, -8, 16, 16)
          ctx.restore()
        })
      }

      // Draw timer at top center
      const timeLeft = Math.max(0, (gameState.gameEndTime || Date.now() + 180000) - Date.now())
      const minutes = Math.floor(timeLeft / 60000)
      const seconds = Math.floor((timeLeft % 60000) / 1000)
      const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

      ctx.fillStyle = "#ffffff"
      ctx.font = "20px Arial"
      ctx.textAlign = "center"
      ctx.fillText(timeString, canvas.width / 2, 30)

      // Draw scoreboard
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(canvas.width - 200, 10, 180, 100)

      ctx.fillStyle = "#ffffff"
      ctx.font = "14px Arial"
      ctx.textAlign = "left"
      ctx.fillText("SCOREBOARD", canvas.width - 190, 30)

      let yOffset = 50
      Object.values(gameState.players).forEach((player, index) => {
        if (!player) return
        ctx.fillStyle = player.color
        ctx.fillText(`${index + 1}. ${player.name}`, canvas.width - 190, yOffset)
        ctx.fillStyle = "#ffffff"
        ctx.textAlign = "right"
        ctx.fillText(`${player.score || 0}`, canvas.width - 30, yOffset)
        ctx.textAlign = "left"
        yOffset += 20
      })

      // Debug information
      if (debugMode) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        ctx.font = "14px monospace"
        ctx.textAlign = "left"
        const debugInfo = [
          `Platform: ${platformType}`,
          `Players: ${Object.keys(gameState.players).length}`,
          `Arrows: ${gameState.arrows?.length || 0}`,
          `Game Time: ${Math.floor((gameState.gameTime || 0) / 1000)}s`,
        ]
        debugInfo.forEach((info, index) => ctx.fillText(info, 10, 20 + index * 20))
      }

      animationFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameState, localPlayerId, debugMode, platformType])

  return (
    <canvas
      ref={canvasRef}
      width={gameState.arenaSize.width}
      height={gameState.arenaSize.height}
      className={cn("absolute top-0 left-0 w-full h-full bg-transparent")}
      style={{
        imageRendering: "pixelated",
        touchAction: "none",
        objectFit: "contain",
      }}
    />
  )
}
