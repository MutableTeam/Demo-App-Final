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
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  // Update canvas size to fill container
  useEffect(() => {
    const updateCanvasSize = () => {
      const container = containerRef.current
      const canvas = canvasRef.current
      if (!container || !canvas) return

      const rect = container.getBoundingClientRect()
      const newWidth = Math.floor(rect.width)
      const newHeight = Math.floor(rect.height)

      // Only update if size actually changed
      if (newWidth !== canvas.width || newHeight !== canvas.height) {
        canvas.width = newWidth
        canvas.height = newHeight
        setCanvasSize({ width: newWidth, height: newHeight })

        console.log(`Canvas resized to ${newWidth}x${newHeight}`)
        debugManager.logInfo("RENDERER", `Canvas resized to ${newWidth}x${newHeight}`)
      }
    }

    // Initial size update
    updateCanvasSize()

    // Set up resize observer
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateCanvasSize)
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    // Also listen to window resize as fallback
    window.addEventListener("resize", updateCanvasSize)
    window.addEventListener("orientationchange", () => {
      setTimeout(updateCanvasSize, 100) // Delay to allow orientation change to complete
    })

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateCanvasSize)
      window.removeEventListener("orientationchange", updateCanvasSize)
    }
  }, [])

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const render = () => {
      // Clear canvas with dark background
      ctx.fillStyle = "#1a1a1a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Calculate game area scaling
      const gameWidth = gameState.arenaSize?.width || 800
      const gameHeight = gameState.arenaSize?.height || 600

      // Scale to fit canvas while maintaining aspect ratio
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
      ctx.strokeStyle = "rgba(61, 106, 55, 0.3)"
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

      // Draw arena border
      ctx.strokeStyle = "#00ffff"
      ctx.lineWidth = 3
      ctx.strokeRect(0, 0, gameWidth, gameHeight)

      // Draw walls
      if (gameState.walls && gameState.walls.length > 0) {
        ctx.fillStyle = "#8B4513"
        ctx.strokeStyle = "#654321"
        ctx.lineWidth = 2
        gameState.walls.forEach((wall) => {
          const wallX = wall.position?.x || wall.x || 0
          const wallY = wall.position?.y || wall.y || 0
          const wallWidth = wall.width || 50
          const wallHeight = wall.height || 50

          ctx.fillRect(wallX, wallY, wallWidth, wallHeight)
          ctx.strokeRect(wallX, wallY, wallWidth, wallHeight)
        })
      }

      // Draw pickups
      if (gameState.pickups && gameState.pickups.length > 0) {
        gameState.pickups.forEach((pickup) => {
          const pickupX = pickup.position?.x || pickup.x || 0
          const pickupY = pickup.position?.y || pickup.y || 0

          ctx.save()
          ctx.translate(pickupX, pickupY)

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
      if (gameState.arrows && gameState.arrows.length > 0) {
        gameState.arrows.forEach((arrow) => {
          const arrowX = arrow.position?.x || arrow.x || 0
          const arrowY = arrow.position?.y || arrow.y || 0
          const arrowAngle = arrow.rotation || arrow.angle || 0

          ctx.save()
          ctx.translate(arrowX, arrowY)
          ctx.rotate(arrowAngle)

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
        if (!player || (player.health !== undefined && player.health <= 0)) return

        const playerX = player.position?.x || 0
        const playerY = player.position?.y || 0
        const playerRotation = player.rotation || 0
        const playerSize = player.size || 20

        ctx.save()
        ctx.translate(playerX, playerY)
        ctx.rotate(playerRotation)

        // Player shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
        ctx.beginPath()
        ctx.ellipse(2, 2, playerSize + 2, playerSize + 2, 0, 0, Math.PI * 2)
        ctx.fill()

        // Player body
        ctx.fillStyle = player.color || "#00ff88"
        ctx.beginPath()
        ctx.arc(0, 0, playerSize, 0, Math.PI * 2)
        ctx.fill()

        // Player outline
        ctx.strokeStyle = player.id === localPlayerId ? "#FFD700" : "#FFFFFF"
        ctx.lineWidth = player.id === localPlayerId ? 3 : 2
        ctx.stroke()

        // Direction indicator
        ctx.fillStyle = "#FFFFFF"
        ctx.beginPath()
        ctx.moveTo(playerSize - 5, 0)
        ctx.lineTo(playerSize + 10, -5)
        ctx.lineTo(playerSize + 10, 5)
        ctx.closePath()
        ctx.fill()

        // Bow if drawing
        if (player.isDrawingBow) {
          ctx.strokeStyle = "#8B4513"
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(0, 0, playerSize + 15, -0.3, 0.3)
          ctx.stroke()

          // Bow string with tension
          ctx.strokeStyle = "#FFFFFF"
          ctx.lineWidth = 1
          const stringTension = (player.drawPower || 0) * 10
          ctx.beginPath()
          ctx.moveTo(Math.cos(-0.3) * (playerSize + 15), Math.sin(-0.3) * (playerSize + 15))
          ctx.quadraticCurveTo(-stringTension, 0, Math.cos(0.3) * (playerSize + 15), Math.sin(0.3) * (playerSize + 15))
          ctx.stroke()
        }

        // Dash effect
        if (player.isDashing) {
          ctx.strokeStyle = "#00FFFF"
          ctx.lineWidth = 2
          for (let i = 0; i < 3; i++) {
            ctx.beginPath()
            ctx.arc(0, 0, playerSize + 5 + i * 5, 0, Math.PI * 2)
            ctx.stroke()
          }
        }

        ctx.restore()

        // Player name and health bar
        ctx.save()
        ctx.translate(playerX, playerY - playerSize - 25)

        // Name background
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
        ctx.fillRect(-30, -15, 60, 12)

        // Name
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "10px Arial"
        ctx.textAlign = "center"
        ctx.fillText(player.name || "Player", 0, -5)

        // Health bar background
        ctx.fillStyle = "#333333"
        ctx.fillRect(-25, 0, 50, 6)

        // Health bar
        const healthPercent = (player.health || 100) / (player.maxHealth || 100)
        ctx.fillStyle = healthPercent > 0.6 ? "#4CAF50" : healthPercent > 0.3 ? "#FFC107" : "#F44336"
        ctx.fillRect(-25, 0, 50 * healthPercent, 6)

        // Health bar border
        ctx.strokeStyle = "#FFFFFF"
        ctx.lineWidth = 1
        ctx.strokeRect(-25, 0, 50, 6)

        ctx.restore()
      })

      ctx.restore()

      // UI Overlays (not scaled)

      // Game timer (top center)
      if (gameState.gameTime !== undefined) {
        const minutes = Math.floor(gameState.gameTime / 60)
        const seconds = Math.floor(gameState.gameTime % 60)
        const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
        ctx.fillRect(canvas.width / 2 - 50, 10, 100, 35)
        ctx.strokeStyle = "#00ffff"
        ctx.lineWidth = 2
        ctx.strokeRect(canvas.width / 2 - 50, 10, 100, 35)

        ctx.fillStyle = "#FFFFFF"
        ctx.font = "18px Arial"
        ctx.textAlign = "center"
        ctx.fillText(timeString, canvas.width / 2, 32)
      }

      // Scoreboard (top right)
      const alivePlayers = Object.values(gameState.players).filter((p) => p && p.health > 0)
      if (alivePlayers.length > 0) {
        const scoreboardWidth = 180
        const scoreboardHeight = alivePlayers.length * 25 + 30

        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
        ctx.fillRect(canvas.width - scoreboardWidth - 10, 10, scoreboardWidth, scoreboardHeight)
        ctx.strokeStyle = "#00ffff"
        ctx.lineWidth = 2
        ctx.strokeRect(canvas.width - scoreboardWidth - 10, 10, scoreboardWidth, scoreboardHeight)

        ctx.fillStyle = "#FFFFFF"
        ctx.font = "14px Arial"
        ctx.textAlign = "left"
        ctx.fillText("SCOREBOARD", canvas.width - scoreboardWidth + 5, 30)

        alivePlayers.forEach((player, index) => {
          const y = 50 + index * 25
          const score = player.score || 0

          // Player color indicator
          ctx.fillStyle = player.color || "#FFFFFF"
          ctx.fillRect(canvas.width - scoreboardWidth + 10, y - 12, 12, 12)

          // Player name and score
          ctx.fillStyle = "#FFFFFF"
          ctx.font = "12px Arial"
          ctx.fillText(`${index + 1}`, canvas.width - scoreboardWidth + 30, y - 2)
          ctx.fillText(`${player.name}`, canvas.width - scoreboardWidth + 45, y - 2)
          ctx.textAlign = "right"
          ctx.fillText(`${score}`, canvas.width - 20, y - 2)
          ctx.textAlign = "left"
        })
      }

      // Debug info
      if (debugMode) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
        ctx.fillRect(10, canvas.height - 120, 220, 110)
        ctx.strokeStyle = "#00ff00"
        ctx.lineWidth = 1
        ctx.strokeRect(10, canvas.height - 120, 220, 110)

        ctx.fillStyle = "#00FF00"
        ctx.font = "12px monospace"
        ctx.textAlign = "left"
        ctx.fillText(`Canvas: ${canvas.width}x${canvas.height}`, 15, canvas.height - 100)
        ctx.fillText(`Game: ${gameWidth}x${gameHeight}`, 15, canvas.height - 85)
        ctx.fillText(`Scale: ${scale.toFixed(2)}`, 15, canvas.height - 70)
        ctx.fillText(`Players: ${Object.keys(gameState.players).length}`, 15, canvas.height - 55)
        ctx.fillText(`Arrows: ${gameState.arrows?.length || 0}`, 15, canvas.height - 40)
        ctx.fillText(`Time: ${gameState.gameTime?.toFixed(1) || 0}s`, 15, canvas.height - 25)
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
    <div ref={containerRef} className={cn("w-full h-full bg-black", className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          imageRendering: "pixelated",
          touchAction: "none",
        }}
      />
    </div>
  )
}
