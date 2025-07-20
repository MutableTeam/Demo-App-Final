"use client"

import { useEffect, useRef, useState } from "react"
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
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

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

      animationFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameState, localPlayerId, debugMode, platformType])

  // Update canvas size to fit its container
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return

    const resizeObserver = new ResizeObserver(() => {
      setCanvasSize({ width: parent.clientWidth, height: parent.clientHeight })
    })
    resizeObserver.observe(parent)

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      className={cn("absolute top-0 left-0 w-full h-full bg-transparent")}
      style={{ imageRendering: "pixelated", touchAction: "none" }}
    />
  )
}
