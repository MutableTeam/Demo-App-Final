"use client"

import { useEffect, useRef, useState } from "react"
import type { GameState } from "./game-engine"
import type { PlatformType } from "@/contexts/platform-context"
import { cn } from "@/lib/utils"
import MobileGameContainer from "@/components/mobile-game-container"
import { debugManager } from "@/utils/debug-utils"

interface EnhancedGameRendererProps {
  gameState: GameState
  localPlayerId: string
  debugMode?: boolean
  platformType?: PlatformType
  onTouchControl?: (control: string, active: boolean) => void
}

export default function EnhancedGameRenderer({
  gameState,
  localPlayerId,
  debugMode = false,
  platformType = "desktop",
  onTouchControl = () => {},
}: EnhancedGameRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  // Handle joystick movement for mobile
  const handleJoystickMove = (direction: { x: number; y: number }) => {
    if (!gameState.players[localPlayerId]) return

    const player = gameState.players[localPlayerId]

    // Update player controls based on joystick input
    player.controls.up = direction.y < -0.3
    player.controls.down = direction.y > 0.3
    player.controls.left = direction.x < -0.3
    player.controls.right = direction.x > 0.3

    debugManager.logDebug("RENDERER", "Joystick input", direction)
  }

  // Handle aiming for mobile
  const handleAiming = (angle: number, power: number) => {
    if (!gameState.players[localPlayerId]) return

    const player = gameState.players[localPlayerId]
    player.rotation = angle
    player.drawPower = power
    player.isDrawingBow = power > 0

    debugManager.logDebug("RENDERER", "Aiming input", { angle: angle * (180 / Math.PI), power })
  }

  // Handle shooting for mobile
  const handleShoot = () => {
    if (!gameState.players[localPlayerId]) return

    const player = gameState.players[localPlayerId]
    player.controls.shoot = false // Release to shoot
    player.isDrawingBow = false

    debugManager.logDebug("RENDERER", "Shot fired")
  }

  // Handle action button presses
  const handleActionPress = (action: string, pressed: boolean) => {
    if (!gameState.players[localPlayerId]) return

    const player = gameState.players[localPlayerId]

    switch (action) {
      case "dash":
        player.controls.dash = pressed
        break
      case "special":
        player.controls.special = pressed
        break
      case "shoot":
        player.controls.shoot = pressed
        break
    }

    onTouchControl(action, pressed)
    debugManager.logDebug("RENDERER", "Action button", { action, pressed })
  }

  // Canvas rendering logic
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const render = () => {
      // Clear canvas
      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw arena boundaries
      ctx.strokeStyle = "#00ffff"
      ctx.lineWidth = 2
      ctx.strokeRect(0, 0, canvas.width, canvas.height)

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

        // Draw bow if drawing
        if (player.isDrawingBow) {
          ctx.strokeStyle = "#ffff00"
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(0, 0, player.size + 10, -Math.PI / 4, Math.PI / 4)
          ctx.stroke()

          // Draw power indicator
          const powerRadius = 5 + (player.drawPower || 0) * 15
          ctx.fillStyle = `rgba(255, 255, 0, ${(player.drawPower || 0) * 0.5})`
          ctx.beginPath()
          ctx.arc(0, 0, powerRadius, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()

        // Draw player name and health
        ctx.fillStyle = "#ffffff"
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.fillText(player.name, player.position.x, player.position.y - player.size - 5)

        // Health bar
        const healthBarWidth = 40
        const healthBarHeight = 4
        const healthPercentage = player.health / 100

        ctx.fillStyle = "#ff0000"
        ctx.fillRect(
          player.position.x - healthBarWidth / 2,
          player.position.y - player.size - 20,
          healthBarWidth,
          healthBarHeight,
        )

        ctx.fillStyle = "#00ff00"
        ctx.fillRect(
          player.position.x - healthBarWidth / 2,
          player.position.y - player.size - 20,
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

          // Arrow head
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

          // Rotating pickup effect
          ctx.rotate(Date.now() * 0.005)

          ctx.fillStyle = pickup.color || "#00ff00"
          ctx.fillRect(-8, -8, 16, 16)

          ctx.restore()
        })
      }

      // Debug information
      if (debugMode) {
        ctx.fillStyle = "#ffffff"
        ctx.font = "14px monospace"
        ctx.textAlign = "left"

        const debugInfo = [
          `Players: ${Object.keys(gameState.players).length}`,
          `Arrows: ${gameState.arrows?.length || 0}`,
          `Game Time: ${Math.floor(gameState.gameTime)}s`,
          `Platform: ${platformType}`,
        ]

        debugInfo.forEach((info, index) => {
          ctx.fillText(info, 10, 20 + index * 20)
        })

        // Draw local player info
        const localPlayer = gameState.players[localPlayerId]
        if (localPlayer) {
          const playerInfo = [
            `Position: ${Math.floor(localPlayer.position.x)}, ${Math.floor(localPlayer.position.y)}`,
            `Health: ${localPlayer.health}`,
            `Rotation: ${Math.floor(localPlayer.rotation * (180 / Math.PI))}°`,
            `Drawing: ${localPlayer.isDrawingBow ? "Yes" : "No"}`,
          ]

          playerInfo.forEach((info, index) => {
            ctx.fillText(info, 10, canvas.height - 80 + index * 20)
          })
        }
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

  // Update canvas size based on container
  useEffect(() => {
    const updateCanvasSize = () => {
      if (platformType === "mobile") {
        // Mobile responsive sizing
        const maxWidth = Math.min(window.innerWidth - 40, 800)
        const maxHeight = Math.min(window.innerHeight - 200, 600)
        setCanvasSize({ width: maxWidth, height: maxHeight })
      } else {
        // Desktop sizing
        setCanvasSize({ width: 800, height: 600 })
      }
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
    }
  }, [platformType])

  const gameCanvas = (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      className={cn(
        "border border-cyan-500/30 rounded-lg bg-black",
        "shadow-[0_0_20px_rgba(0,255,255,0.2)]",
        platformType === "mobile" ? "max-w-full max-h-full" : "w-[800px] h-[600px]",
      )}
      style={{
        imageRendering: "pixelated",
        touchAction: "none",
      }}
    />
  )

  if (platformType === "mobile") {
    return (
      <MobileGameContainer
        onJoystickMove={handleJoystickMove}
        onActionPress={handleActionPress}
        onAiming={handleAiming}
        onShoot={handleShoot}
        className="w-full h-full"
      >
        {gameCanvas}
      </MobileGameContainer>
    )
  }

  return <div className="flex items-center justify-center p-4">{gameCanvas}</div>
}
