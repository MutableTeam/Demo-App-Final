"use client"

import type React from "react"
import { useRef, useEffect } from "react"

interface GameState {
  players: {
    [playerId: string]: {
      x: number
      y: number
      color: string
    }
  }
  bullets: {
    x: number
    y: number
    playerId: string
  }[]
}

interface GameRendererEnhancedProps {
  gameState: GameState
  localPlayerId: string
  debugMode?: boolean
  canvasRef?: React.RefObject<HTMLCanvasElement>
}

export default function GameRendererEnhanced({
  gameState,
  localPlayerId,
  debugMode = false,
  canvasRef: externalCanvasRef,
}: GameRendererEnhancedProps) {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = externalCanvasRef || internalCanvasRef

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const render = () => {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw players
      for (const playerId in gameState.players) {
        const player = gameState.players[playerId]
        ctx.fillStyle = player.color
        ctx.fillRect(player.x, player.y, 20, 20)

        if (debugMode) {
          ctx.fillStyle = "white"
          ctx.font = "12px sans-serif"
          ctx.fillText(playerId, player.x, player.y - 5)
        }
      }

      // Draw bullets
      gameState.bullets.forEach((bullet) => {
        ctx.fillStyle = gameState.players[bullet.playerId].color
        ctx.fillRect(bullet.x, bullet.y, 5, 5)
      })

      requestAnimationFrame(render)
    }

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    requestAnimationFrame(render)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [gameState, debugMode, canvasRef])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (debugMode) {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      console.log(`Clicked at: x=${x}, y=${y}`)
    }
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "black",
        touchAction: "none", // Prevent default touch behaviors
      }}
    />
  )
}
