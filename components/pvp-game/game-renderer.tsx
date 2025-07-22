"use client"

import type React from "react"

import { useRef, useEffect, useCallback } from "react"
import type { GameState } from "./game-engine"

interface GameRendererProps {
  gameState: GameState
  localPlayerId: string
  onClick?: (event: React.MouseEvent<HTMLCanvasElement>) => void
}

export function GameRenderer({ gameState, localPlayerId, onClick }: GameRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const drawPlayer = useCallback(
    (ctx: CanvasRenderingContext2D, player: GameState["players"][string]) => {
      ctx.save()
      ctx.translate(player.position.x, player.position.y)
      ctx.rotate(player.rotation)

      // Player body
      ctx.fillStyle = player.id === localPlayerId ? "cyan" : "red"
      ctx.beginPath()
      ctx.arc(0, 0, 15, 0, Math.PI * 2)
      ctx.fill()

      // Player direction indicator
      ctx.strokeStyle = "white"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(20, 0)
      ctx.stroke()

      ctx.restore()

      // Health bar
      ctx.fillStyle = "black"
      ctx.fillRect(player.position.x - 25, player.position.y - 30, 50, 5)
      ctx.fillStyle = "green"
      ctx.fillRect(player.position.x - 25, player.position.y - 30, (player.health / 100) * 50, 5)

      // Player name
      ctx.fillStyle = "white"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.fillText(player.name, player.position.x, player.position.y - 35)
    },
    [localPlayerId],
  )

  const drawProjectile = useCallback((ctx: CanvasRenderingContext2D, projectile: GameState["projectiles"][string]) => {
    ctx.save()
    ctx.translate(projectile.position.x, projectile.position.y)
    ctx.rotate(projectile.rotation)
    ctx.fillStyle = "yellow"
    ctx.fillRect(-10, -1, 20, 2)
    ctx.restore()
  }, [])

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      // Draw background
      ctx.fillStyle = "#333"
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      // Draw players
      Object.values(gameState.players).forEach((player) => {
        if (player.health > 0) {
          drawPlayer(ctx, player)
        }
      })

      // Draw projectiles
      Object.values(gameState.projectiles).forEach((projectile) => {
        drawProjectile(ctx, projectile)
      })
    },
    [gameState, drawPlayer, drawProjectile],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    if (!context) return

    draw(context)
  }, [draw, gameState])

  return <canvas ref={canvasRef} width={800} height={600} className="bg-gray-800 w-full h-full" onClick={onClick} />
}
