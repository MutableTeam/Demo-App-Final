"use client"

import type React from "react"
import { useEffect, useRef, useCallback } from "react"
import type { GameState, Player, Arrow } from "./game-engine"

interface GameRendererProps {
  gameState: GameState
  localPlayerId: string
  onClick?: (event: React.MouseEvent<HTMLCanvasElement>) => void
}

export default function GameRenderer({ gameState, localPlayerId, onClick }: GameRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    contextRef.current = context

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  // Render game state
  useEffect(() => {
    const canvas = canvasRef.current
    const context = contextRef.current
    if (!canvas || !context) return

    // Clear canvas
    context.fillStyle = "#1a1a2e"
    context.fillRect(0, 0, canvas.width, canvas.height)

    // Draw arena bounds
    context.strokeStyle = "#16213e"
    context.lineWidth = 2
    context.strokeRect(50, 50, canvas.width - 100, canvas.height - 100)

    // Draw players
    Object.values(gameState.players).forEach((player) => {
      drawPlayer(context, player, player.id === localPlayerId)
    })

    // Draw arrows
    gameState.arrows.forEach((arrow) => {
      drawArrow(context, arrow)
    })

    // Draw UI elements
    drawUI(context, canvas, gameState, localPlayerId)
  }, [gameState, localPlayerId])

  const drawPlayer = useCallback((context: CanvasRenderingContext2D, player: Player, isLocal: boolean) => {
    const { position, rotation, health, isDrawingBow, animationState } = player

    // Player body
    context.save()
    context.translate(position.x, position.y)
    context.rotate(rotation)

    // Body color based on player type
    if (isLocal) {
      context.fillStyle = "#4ade80" // Green for local player
    } else if (player.id.startsWith("ai_")) {
      context.fillStyle = "#ef4444" // Red for AI
    } else {
      context.fillStyle = "#3b82f6" // Blue for other players
    }

    // Draw player body (circle)
    context.beginPath()
    context.arc(0, 0, 15, 0, Math.PI * 2)
    context.fill()

    // Draw direction indicator
    context.strokeStyle = "#ffffff"
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(0, 0)
    context.lineTo(20, 0)
    context.stroke()

    // Draw bow if drawing
    if (isDrawingBow) {
      context.strokeStyle = "#8b4513"
      context.lineWidth = 3
      context.beginPath()
      context.arc(0, 0, 25, -0.5, 0.5)
      context.stroke()
    }

    context.restore()

    // Health bar
    const barWidth = 30
    const barHeight = 4
    context.fillStyle = "#333"
    context.fillRect(position.x - barWidth / 2, position.y - 25, barWidth, barHeight)

    context.fillStyle = health > 50 ? "#4ade80" : health > 25 ? "#fbbf24" : "#ef4444"
    context.fillRect(position.x - barWidth / 2, position.y - 25, (barWidth * health) / 100, barHeight)

    // Player name
    context.fillStyle = "#ffffff"
    context.font = "12px Arial"
    context.textAlign = "center"
    context.fillText(player.name, position.x, position.y - 30)
  }, [])

  const drawArrow = useCallback((context: CanvasRenderingContext2D, arrow: Arrow) => {
    context.save()
    context.translate(arrow.position.x, arrow.position.y)
    context.rotate(Math.atan2(arrow.velocity.y, arrow.velocity.x))

    // Arrow shaft
    context.strokeStyle = "#8b4513"
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(-10, 0)
    context.lineTo(10, 0)
    context.stroke()

    // Arrow head
    context.fillStyle = "#666"
    context.beginPath()
    context.moveTo(10, 0)
    context.lineTo(5, -3)
    context.lineTo(5, 3)
    context.closePath()
    context.fill()

    context.restore()
  }, [])

  const drawUI = useCallback(
    (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, gameState: GameState, localPlayerId: string) => {
      const localPlayer = gameState.players[localPlayerId]
      if (!localPlayer) return

      // Game timer
      context.fillStyle = "#ffffff"
      context.font = "20px Arial"
      context.textAlign = "center"
      const timeLeft = Math.max(0, gameState.maxGameTime - gameState.gameTime)
      context.fillText(`Time: ${Math.ceil(timeLeft)}s`, canvas.width / 2, 30)

      // Player stats
      context.textAlign = "left"
      context.font = "16px Arial"
      context.fillText(`Health: ${localPlayer.health}`, 20, canvas.height - 60)
      context.fillText(`Lives: ${localPlayer.lives}`, 20, canvas.height - 40)

      // Special attack cooldown
      if (localPlayer.specialAttackCooldown > 0) {
        context.fillText(`Special: ${localPlayer.specialAttackCooldown.toFixed(1)}s`, 20, canvas.height - 20)
      } else {
        context.fillStyle = "#4ade80"
        context.fillText("Special: READY", 20, canvas.height - 20)
      }

      // Bow charge indicator
      if (localPlayer.isDrawingBow) {
        const chargeWidth = 100
        const chargeHeight = 10
        const chargeX = canvas.width / 2 - chargeWidth / 2
        const chargeY = canvas.height - 30

        context.fillStyle = "#333"
        context.fillRect(chargeX, chargeY, chargeWidth, chargeHeight)

        context.fillStyle = "#fbbf24"
        const charge = Math.min(1, (Date.now() - (localPlayer as any).bowDrawStartTime || 0) / 1000)
        context.fillRect(chargeX, chargeY, chargeWidth * charge, chargeHeight)
      }

      // Game over screen
      if (gameState.isGameOver) {
        context.fillStyle = "rgba(0, 0, 0, 0.8)"
        context.fillRect(0, 0, canvas.width, canvas.height)

        context.fillStyle = "#ffffff"
        context.font = "48px Arial"
        context.textAlign = "center"
        context.fillText("GAME OVER", canvas.width / 2, canvas.height / 2)

        const alivePlayers = Object.values(gameState.players).filter((p) => p.health > 0)
        if (alivePlayers.length === 1) {
          context.font = "24px Arial"
          context.fillText(`Winner: ${alivePlayers[0].name}`, canvas.width / 2, canvas.height / 2 + 60)
        }
      }
    },
    [],
  )

  return (
    <canvas
      ref={canvasRef}
      onClick={onClick}
      className="w-full h-full cursor-crosshair"
      style={{ minHeight: "400px" }}
    />
  )
}
