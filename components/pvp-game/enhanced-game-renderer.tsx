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
  className?: string
}

export default function EnhancedGameRenderer({
  gameState,
  localPlayerId,
  debugMode = false,
  platformType = "desktop",
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

      if (newWidth > 0 && newHeight > 0 && (newWidth !== canvas.width || newHeight !== canvas.height)) {
        canvas.width = newWidth
        canvas.height = newHeight
        setCanvasSize({ width: newWidth, height: newHeight })
        debugManager.logInfo("RENDERER", `Canvas resized to ${newWidth}x${newHeight}`)
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateCanvasSize)
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    // Initial size update
    requestAnimationFrame(updateCanvasSize)

    // Handle orientation changes
    window.addEventListener("orientationchange", () => {
      setTimeout(updateCanvasSize, 100)
    })

    return () => {
      resizeObserver.disconnect()
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
      // Clear canvas with dark cyberpunk background
      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Calculate game area scaling
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

      // Draw game background with cyberpunk grid
      ctx.fillStyle = "#1a1a2e"
      ctx.fillRect(0, 0, gameWidth, gameHeight)

      // Draw cyberpunk grid pattern
      ctx.strokeStyle = "rgba(0, 255, 255, 0.1)"
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

      // Draw arena border with neon glow
      ctx.strokeStyle = "#00ffff"
      ctx.lineWidth = 3
      ctx.shadowColor = "#00ffff"
      ctx.shadowBlur = 10
      ctx.strokeRect(0, 0, gameWidth, gameHeight)
      ctx.shadowBlur = 0

      // Draw walls with cyberpunk styling
      if (gameState.walls && gameState.walls.length > 0) {
        gameState.walls.forEach((wall) => {
          const wallX = wall.position?.x || wall.x || 0
          const wallY = wall.position?.y || wall.y || 0
          const wallWidth = wall.width || 50
          const wallHeight = wall.height || 50

          // Wall shadow/glow
          ctx.fillStyle = "rgba(139, 69, 19, 0.3)"
          ctx.fillRect(wallX + 2, wallY + 2, wallWidth, wallHeight)

          // Main wall
          ctx.fillStyle = "#8B4513"
          ctx.fillRect(wallX, wallY, wallWidth, wallHeight)

          // Wall border
          ctx.strokeStyle = "#654321"
          ctx.lineWidth = 2
          ctx.strokeRect(wallX, wallY, wallWidth, wallHeight)

          // Highlight edge
          ctx.strokeStyle = "#CD853F"
          ctx.lineWidth = 1
          ctx.strokeRect(wallX + 1, wallY + 1, wallWidth - 2, wallHeight - 2)
        })
      }

      // Draw pickups with glowing effects
      if (gameState.pickups && gameState.pickups.length > 0) {
        gameState.pickups.forEach((pickup) => {
          const pickupX = pickup.position?.x || pickup.x || 0
          const pickupY = pickup.position?.y || pickup.y || 0

          ctx.save()
          ctx.translate(pickupX, pickupY)

          // Glow effect
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20)
          if (pickup.type === "health") {
            gradient.addColorStop(0, "rgba(255, 107, 107, 0.8)")
            gradient.addColorStop(1, "rgba(255, 107, 107, 0)")
            ctx.fillStyle = gradient
          } else {
            gradient.addColorStop(0, "rgba(78, 205, 196, 0.8)")
            gradient.addColorStop(1, "rgba(78, 205, 196, 0)")
            ctx.fillStyle = gradient
          }
          ctx.fillRect(-20, -20, 40, 40)

          // Pickup icon
          ctx.fillStyle = pickup.type === "health" ? "#ff4757" : "#2ed573"
          ctx.fillRect(-8, -8, 16, 16)

          // Inner highlight
          ctx.fillStyle = pickup.type === "health" ? "#ff6b6b" : "#4ecdc4"
          ctx.fillRect(-6, -6, 12, 12)

          ctx.restore()
        })
      }

      // Draw arrows with enhanced visuals
      if (gameState.arrows && gameState.arrows.length > 0) {
        gameState.arrows.forEach((arrow) => {
          const arrowX = arrow.position?.x || arrow.x || 0
          const arrowY = arrow.position?.y || arrow.y || 0
          const arrowAngle = arrow.rotation || arrow.angle || 0

          ctx.save()
          ctx.translate(arrowX, arrowY)
          ctx.rotate(arrowAngle)

          // Arrow trail effect
          ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(-20, 0)
          ctx.lineTo(-5, 0)
          ctx.stroke()

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

          // Arrow head highlight
          ctx.fillStyle = "#FFFFFF"
          ctx.beginPath()
          ctx.moveTo(15, 0)
          ctx.lineTo(12, -2)
          ctx.lineTo(12, 2)
          ctx.closePath()
          ctx.fill()

          // Arrow fletching
          ctx.fillStyle = "#FF6B6B"
          ctx.fillRect(-15, -3, 5, 6)

          ctx.restore()
        })
      }

      // Draw explosions with particle effects
      if (gameState.explosions && gameState.explosions.length > 0) {
        gameState.explosions.forEach((explosion) => {
          const explosionX = explosion.position?.x || explosion.x || 0
          const explosionY = explosion.position?.y || explosion.y || 0

          ctx.save()
          ctx.translate(explosionX, explosionY)

          const progress = 1 - (explosion.timeLeft || 0) / (explosion.duration || 1)
          const radius = (explosion.radius || 30) * progress

          // Outer explosion ring
          const outerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
          outerGradient.addColorStop(0, "rgba(255, 165, 0, 0.8)")
          outerGradient.addColorStop(0.5, "rgba(255, 69, 0, 0.6)")
          outerGradient.addColorStop(1, "rgba(255, 0, 0, 0)")
          ctx.fillStyle = outerGradient
          ctx.beginPath()
          ctx.arc(0, 0, radius, 0, Math.PI * 2)
          ctx.fill()

          // Inner explosion core
          const innerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.5)
          innerGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)")
          innerGradient.addColorStop(1, "rgba(255, 255, 0, 0)")
          ctx.fillStyle = innerGradient
          ctx.beginPath()
          ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2)
          ctx.fill()

          ctx.restore()
        })
      }

      // Draw players with enhanced cyberpunk styling
      Object.values(gameState.players).forEach((player) => {
        if (!player || (player.health !== undefined && player.health <= 0)) return

        const playerX = player.position?.x || 0
        const playerY = player.position?.y || 0
        const playerRotation = player.rotation || 0
        const playerSize = player.size || 20
        const isLocalPlayer = player.id === localPlayerId

        ctx.save()
        ctx.translate(playerX, playerY)
        ctx.rotate(playerRotation)

        // Player shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
        ctx.beginPath()
        ctx.ellipse(3, 3, playerSize + 2, playerSize + 2, 0, 0, Math.PI * 2)
        ctx.fill()

        // Player glow effect
        if (isLocalPlayer) {
          ctx.shadowColor = "#00ffff"
          ctx.shadowBlur = 15
        }

        // Player body
        ctx.fillStyle = player.color || (isLocalPlayer ? "#00ff88" : "#ff6b6b")
        ctx.beginPath()
        ctx.arc(0, 0, playerSize, 0, Math.PI * 2)
        ctx.fill()

        // Player outline
        ctx.strokeStyle = isLocalPlayer ? "#FFD700" : "#FFFFFF"
        ctx.lineWidth = isLocalPlayer ? 3 : 2
        ctx.shadowBlur = 0
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
          ctx.lineWidth = 4
          ctx.beginPath()
          ctx.arc(0, 0, playerSize + 15, -0.3, 0.3)
          ctx.stroke()

          // Bow string with tension
          ctx.strokeStyle = "#FFFFFF"
          ctx.lineWidth = 2
          const stringTension = (player.drawPower || 0) * 12
          ctx.beginPath()
          ctx.moveTo(Math.cos(-0.3) * (playerSize + 15), Math.sin(-0.3) * (playerSize + 15))
          ctx.quadraticCurveTo(-stringTension, 0, Math.cos(0.3) * (playerSize + 15), Math.sin(0.3) * (playerSize + 15))
          ctx.stroke()

          // Draw power indicator
          if (player.drawPower && player.drawPower > 0) {
            ctx.strokeStyle = `hsl(${120 * player.drawPower}, 100%, 50%)`
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.arc(0, 0, playerSize + 20, -0.2, 0.2)
            ctx.stroke()
          }
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

        // Special attack charging effect
        if (player.isChargingSpecial) {
          ctx.strokeStyle = "#FF00FF"
          ctx.lineWidth = 3
          ctx.shadowColor = "#FF00FF"
          ctx.shadowBlur = 10
          ctx.beginPath()
          ctx.arc(0, 0, playerSize + 25, 0, Math.PI * 2)
          ctx.stroke()
          ctx.shadowBlur = 0
        }

        ctx.restore()

        // Player name and health bar
        ctx.save()
        ctx.translate(playerX, playerY - playerSize - 30)

        // Name background
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
        ctx.fillRect(-35, -15, 70, 25)

        // Player name
        ctx.fillStyle = isLocalPlayer ? "#00ffff" : "#FFFFFF"
        ctx.font = "12px 'Courier New', monospace"
        ctx.textAlign = "center"
        ctx.fillText(player.name || "Player", 0, -5)

        // Health bar background
        ctx.fillStyle = "#333333"
        ctx.fillRect(-30, 5, 60, 8)

        // Health bar
        const healthPercent = (player.health || 100) / (player.maxHealth || 100)
        let healthColor = "#4CAF50"
        if (healthPercent <= 0.3) healthColor = "#F44336"
        else if (healthPercent <= 0.6) healthColor = "#FFC107"

        ctx.fillStyle = healthColor
        ctx.fillRect(-30, 5, 60 * healthPercent, 8)

        // Health bar border
        ctx.strokeStyle = "#FFFFFF"
        ctx.lineWidth = 1
        ctx.strokeRect(-30, 5, 60, 8)

        // Health bar glow
        if (healthPercent <= 0.3) {
          ctx.shadowColor = "#F44336"
          ctx.shadowBlur = 5
          ctx.strokeRect(-30, 5, 60, 8)
          ctx.shadowBlur = 0
        }

        ctx.restore()
      })

      ctx.restore()

      // UI Overlays (not scaled)
      // Game timer with cyberpunk styling
      if (gameState.gameTime !== undefined) {
        const minutes = Math.floor(gameState.gameTime / 60)
        const seconds = Math.floor(gameState.gameTime % 60)
        const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

        // Timer background
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
        ctx.fillRect(canvas.width / 2 - 60, 10, 120, 40)

        // Timer border with glow
        ctx.strokeStyle = "#00ffff"
        ctx.lineWidth = 2
        ctx.shadowColor = "#00ffff"
        ctx.shadowBlur = 5
        ctx.strokeRect(canvas.width / 2 - 60, 10, 120, 40)
        ctx.shadowBlur = 0

        // Timer text
        ctx.fillStyle = "#00ffff"
        ctx.font = "20px 'Courier New', monospace"
        ctx.textAlign = "center"
        ctx.fillText(timeString, canvas.width / 2, 35)
      }

      // Enhanced scoreboard
      const alivePlayers = Object.values(gameState.players).filter((p) => p && p.health > 0)
      if (alivePlayers.length > 0) {
        const scoreboardWidth = 200
        const scoreboardHeight = alivePlayers.length * 30 + 40

        // Scoreboard background
        ctx.fillStyle = "rgba(0, 0, 0, 0.9)"
        ctx.fillRect(canvas.width - scoreboardWidth - 10, 10, scoreboardWidth, scoreboardHeight)

        // Scoreboard border
        ctx.strokeStyle = "#00ffff"
        ctx.lineWidth = 2
        ctx.shadowColor = "#00ffff"
        ctx.shadowBlur = 5
        ctx.strokeRect(canvas.width - scoreboardWidth - 10, 10, scoreboardWidth, scoreboardHeight)
        ctx.shadowBlur = 0

        // Scoreboard title
        ctx.fillStyle = "#00ffff"
        ctx.font = "16px 'Courier New', monospace"
        ctx.textAlign = "center"
        ctx.fillText("SCOREBOARD", canvas.width - scoreboardWidth / 2 - 10, 30)

        // Player scores
        alivePlayers.forEach((player, index) => {
          const y = 55 + index * 30
          const score = player.score || 0
          const isLocal = player.id === localPlayerId

          // Player color indicator
          ctx.fillStyle = player.color || "#FFFFFF"
          ctx.fillRect(canvas.width - scoreboardWidth + 5, y - 12, 15, 15)

          // Player name and score
          ctx.fillStyle = isLocal ? "#FFD700" : "#FFFFFF"
          ctx.font = "12px 'Courier New', monospace"
          ctx.textAlign = "left"
          ctx.fillText(`${index + 1}. ${player.name}`, canvas.width - scoreboardWidth + 25, y)
          ctx.textAlign = "right"
          ctx.fillText(`${score}`, canvas.width - 20, y)
        })
      }

      // Debug info with cyberpunk styling
      if (debugMode) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.9)"
        ctx.fillRect(10, canvas.height - 140, 250, 130)

        ctx.strokeStyle = "#00ff00"
        ctx.lineWidth = 1
        ctx.strokeRect(10, canvas.height - 140, 250, 130)

        ctx.fillStyle = "#00FF00"
        ctx.font = "12px 'Courier New', monospace"
        ctx.textAlign = "left"
        ctx.fillText(`Canvas: ${canvas.width}x${canvas.height}`, 15, canvas.height - 120)
        ctx.fillText(`Platform: ${platformType}`, 15, canvas.height - 105)
        ctx.fillText(`Scale: ${scale.toFixed(2)}`, 15, canvas.height - 90)
        ctx.fillText(`Players: ${Object.keys(gameState.players).length}`, 15, canvas.height - 75)
        ctx.fillText(`Arrows: ${gameState.arrows?.length || 0}`, 15, canvas.height - 60)
        ctx.fillText(`Walls: ${gameState.walls?.length || 0}`, 15, canvas.height - 45)
        ctx.fillText(`Pickups: ${gameState.pickups?.length || 0}`, 15, canvas.height - 30)
        ctx.fillText(`Time: ${gameState.gameTime?.toFixed(1) || 0}s`, 15, canvas.height - 15)
      }

      animationFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameState, localPlayerId, debugMode, platformType, canvasSize])

  return (
    <div ref={containerRef} className={cn("w-full h-full bg-black", className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          touchAction: "none",
        }}
      />
    </div>
  )
}
