"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { GameState } from "./game-engine"
import type { PlatformType } from "@/contexts/platform-context"

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
  const [fps, setFps] = useState(0)
  const fpsCounterRef = useRef({ frames: 0, lastTime: Date.now() })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 600

    const render = () => {
      // Clear canvas
      ctx.fillStyle = "#1a1a2e"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid background
      ctx.strokeStyle = "#16213e"
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
        ctx.fillStyle = "#4a5568"
        gameState.walls.forEach((wall) => {
          ctx.fillRect(wall.x, wall.y, wall.width, wall.height)
        })
      }

      // Draw pickups
      if (gameState.pickups) {
        gameState.pickups.forEach((pickup) => {
          ctx.fillStyle = pickup.type === "health" ? "#48bb78" : "#ed8936"
          ctx.beginPath()
          ctx.arc(pickup.position.x, pickup.position.y, 8, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      // Draw arrows
      if (gameState.arrows) {
        gameState.arrows.forEach((arrow) => {
          ctx.save()
          ctx.translate(arrow.position.x, arrow.position.y)
          ctx.rotate(arrow.rotation)

          // Arrow shaft
          ctx.strokeStyle = "#8b4513"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(-15, 0)
          ctx.lineTo(15, 0)
          ctx.stroke()

          // Arrow head
          ctx.fillStyle = "#c0392b"
          ctx.beginPath()
          ctx.moveTo(15, 0)
          ctx.lineTo(10, -3)
          ctx.lineTo(10, 3)
          ctx.closePath()
          ctx.fill()

          ctx.restore()
        })
      }

      // Draw players
      Object.values(gameState.players).forEach((player) => {
        if (player.health <= 0) return

        ctx.save()
        ctx.translate(player.position.x, player.position.y)

        // Player body
        ctx.fillStyle = player.color
        ctx.beginPath()
        ctx.arc(0, 0, player.size || 20, 0, Math.PI * 2)
        ctx.fill()

        // Player direction indicator
        ctx.save()
        ctx.rotate(player.rotation)
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(25, 0)
        ctx.stroke()
        ctx.restore()

        // Draw bow if drawing
        if (player.isDrawingBow) {
          ctx.save()
          ctx.rotate(player.rotation)
          ctx.strokeStyle = "#8b4513"
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(0, 0, 15, -Math.PI / 4, Math.PI / 4)
          ctx.stroke()

          // Draw string
          const drawTime = player.drawStartTime ? Date.now() / 1000 - player.drawStartTime : 0
          const maxDraw = player.maxDrawTime || 2
          const drawProgress = Math.min(drawTime / maxDraw, 1)
          const stringOffset = drawProgress * 10

          ctx.strokeStyle = "#ffffff"
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(-10.6, -10.6)
          ctx.lineTo(-stringOffset, 0)
          ctx.lineTo(-10.6, 10.6)
          ctx.stroke()
          ctx.restore()
        }

        // Player name
        ctx.fillStyle = "#ffffff"
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.fillText(player.name, 0, -30)

        // Health bar
        const barWidth = 40
        const barHeight = 4
        ctx.fillStyle = "#333333"
        ctx.fillRect(-barWidth / 2, 25, barWidth, barHeight)

        const healthPercent = player.health / 100
        ctx.fillStyle = healthPercent > 0.5 ? "#48bb78" : healthPercent > 0.25 ? "#ed8936" : "#e53e3e"
        ctx.fillRect(-barWidth / 2, 25, barWidth * healthPercent, barHeight)

        ctx.restore()
      })

      // Draw particles/effects
      if (gameState.particles) {
        gameState.particles.forEach((particle) => {
          ctx.save()
          ctx.globalAlpha = particle.alpha || 1
          ctx.fillStyle = particle.color || "#ffffff"
          ctx.beginPath()
          ctx.arc(particle.position.x, particle.position.y, particle.size || 2, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        })
      }

      // Debug info
      if (debugMode) {
        ctx.fillStyle = "#ffffff"
        ctx.font = "12px monospace"
        ctx.textAlign = "left"
        ctx.fillText(`FPS: ${fps}`, 10, 20)
        ctx.fillText(`Players: ${Object.keys(gameState.players).length}`, 10, 35)
        ctx.fillText(`Arrows: ${gameState.arrows?.length || 0}`, 10, 50)
        ctx.fillText(`Game Time: ${gameState.gameTime.toFixed(1)}s`, 10, 65)
      }

      // Update FPS counter
      fpsCounterRef.current.frames++
      const now = Date.now()
      if (now - fpsCounterRef.current.lastTime >= 1000) {
        setFps(fpsCounterRef.current.frames)
        fpsCounterRef.current.frames = 0
        fpsCounterRef.current.lastTime = now
      }

      animationFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameState, debugMode, fps])

  const localPlayer = gameState.players[localPlayerId]
  const sortedPlayers = Object.values(gameState.players).sort((a, b) => b.score - a.score)

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="border border-gray-600 rounded-lg bg-gray-900"
        style={{ width: "100%", height: "100%" }}
      />

      {/* HUD Elements */}
      <div className="absolute top-4 right-4 space-y-2">
        {/* Local Player Stats */}
        {localPlayer && (
          <Card className="bg-black/50 text-white border-gray-600">
            <CardContent className="p-3">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Health</span>
                  <span className="text-sm font-bold">{Math.round(localPlayer.health)}</span>
                </div>
                <Progress value={localPlayer.health} className="h-2" />
                <div className="flex justify-between text-xs">
                  <span>Score: {localPlayer.score}</span>
                  <span>
                    K/D: {localPlayer.kills}/{localPlayer.deaths}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scoreboard */}
        <Card className="bg-black/50 text-white border-gray-600">
          <CardContent className="p-3">
            <h3 className="text-sm font-bold mb-2">Leaderboard</h3>
            <div className="space-y-1">
              {sortedPlayers.slice(0, 4).map((player, index) => (
                <div key={player.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant={player.id === localPlayerId ? "default" : "secondary"} className="w-4 h-4 p-0">
                      {index + 1}
                    </Badge>
                    <span className={cn("truncate max-w-20", player.id === localPlayerId && "font-bold")}>
                      {player.name}
                    </span>
                  </div>
                  <span>{player.score}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Timer */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <Card className="bg-black/50 text-white border-gray-600">
          <CardContent className="p-2">
            <div className="text-center">
              <div className="text-lg font-bold">
                {Math.floor(gameState.gameTime / 60)}:
                {(Math.floor(gameState.gameTime) % 60).toString().padStart(2, "0")}
              </div>
              <div className="text-xs text-gray-400">Game Time</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Controls Hint */}
      {platformType === "mobile" && (
        <div className="absolute bottom-4 left-4 right-4">
          <Card className="bg-black/50 text-white border-gray-600">
            <CardContent className="p-2">
              <div className="text-xs text-center text-gray-400">
                Use virtual joystick to move • Tap to aim and shoot
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState.isGameOver && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <Card className="bg-gray-900 text-white border-gray-600 max-w-md w-full mx-4">
            <CardContent className="p-6 text-center">
              <h2 className="text-3xl font-bold mb-4">
                {gameState.winner === localPlayerId ? "Victory!" : "Game Over"}
              </h2>
              <div className="space-y-2 mb-6">
                <p className="text-lg">Winner: {gameState.players[gameState.winner || ""]?.name || "Unknown"}</p>
                <p className="text-sm text-gray-400">
                  Game Duration: {Math.floor(gameState.gameTime / 60)}:
                  {(Math.floor(gameState.gameTime) % 60).toString().padStart(2, "0")}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold">Final Scores:</h3>
                {sortedPlayers.map((player, index) => (
                  <div key={player.id} className="flex justify-between items-center">
                    <span className={cn(player.id === localPlayerId && "font-bold text-yellow-400")}>
                      {index + 1}. {player.name}
                    </span>
                    <span>
                      {player.score} ({player.kills}K/{player.deaths}D)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
