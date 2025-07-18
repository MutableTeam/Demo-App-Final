"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { useViewportScaling } from "@/hooks/use-viewport-scaling"

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
  gameWidth?: number
  gameHeight?: number
  enableResponsiveScaling?: boolean
}

export default function GameRendererEnhanced({
  gameState,
  localPlayerId,
  debugMode = false,
  canvasRef: externalCanvasRef,
  gameWidth = 800,
  gameHeight = 600,
  enableResponsiveScaling = true,
}: GameRendererEnhancedProps) {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = externalCanvasRef || internalCanvasRef

  // Add viewport scaling
  const { viewportInfo, getScaledDimensions, getGamePosition } = useViewportScaling({
    gameWidth,
    gameHeight,
    maintainAspectRatio: true,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const render = () => {
      // Set canvas size based on viewport scaling if enabled
      if (enableResponsiveScaling) {
        const scaledDimensions = getScaledDimensions()
        canvas.width = scaledDimensions.width
        canvas.height = scaledDimensions.height

        // Scale the context to match
        ctx.scale(viewportInfo.scale, viewportInfo.scale)
      } else {
        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight
      }

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
      if (enableResponsiveScaling) {
        const scaledDimensions = getScaledDimensions()
        const position = getGamePosition()

        canvas.style.width = `${scaledDimensions.width}px`
        canvas.style.height = `${scaledDimensions.height}px`
        canvas.style.position = "absolute"
        canvas.style.left = `${position.x}px`
        canvas.style.top = `${position.y}px`
      } else {
        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    requestAnimationFrame(render)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [gameState, debugMode, canvasRef, enableResponsiveScaling, viewportInfo, getScaledDimensions, getGamePosition])

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
