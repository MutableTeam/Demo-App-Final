"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pause, Play, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { updateLastStandGameState } from "@/games/last-stand/game-engine"
import { createInitialLastStandGameState, type LastStandGameState, type Player } from "@/games/last-stand/game-state"
import { audioManager } from "@/utils/audio-manager"

interface GameControllerEnhancedProps {
  gameId: string
  playerId: string
  playerName: string
  isHost: boolean
  gameMode: string
  onGameEnd: (winner: string | null) => void
  platformType?: "desktop" | "mobile"
  joystickInput?: { x: number; y: number }
  actionInput?: { action: string; pressed: boolean } | null
}

export default function GameControllerEnhanced({
  gameId,
  playerId,
  playerName,
  isHost,
  gameMode,
  onGameEnd,
  platformType = "desktop",
  joystickInput = { x: 0, y: 0 },
  actionInput = null,
}: GameControllerEnhancedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  const keysRef = useRef<Set<string>>(new Set())
  const mouseRef = useRef({ x: 0, y: 0, isDown: false })

  const [gameState, setGameState] = useState<LastStandGameState | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [fps, setFps] = useState(0)

  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  // Initialize game state
  useEffect(() => {
    const initialState = createInitialLastStandGameState(playerId, playerName)
    setGameState(initialState)
  }, [playerId, playerName])

  // Handle keyboard input for desktop
  useEffect(() => {
    if (platformType !== "desktop") return

    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code)

      // Prevent default for game keys
      if (["KeyW", "KeyA", "KeyS", "KeyD", "Space", "ShiftLeft"].includes(e.code)) {
        e.preventDefault()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [platformType])

  // Handle mouse input for desktop
  useEffect(() => {
    if (platformType !== "desktop") return

    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        // Left click
        mouseRef.current.isDown = true
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        // Left click
        mouseRef.current.isDown = false
      }
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mouseup", handleMouseUp)

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mouseup", handleMouseUp)
    }
  }, [platformType])

  // Update player controls based on input method
  const updatePlayerControls = useCallback(
    (player: Player) => {
      if (platformType === "mobile") {
        // Use joystick and action inputs for mobile
        player.controls.up = joystickInput.y < -0.5
        player.controls.down = joystickInput.y > 0.5
        player.controls.left = joystickInput.x < -0.5
        player.controls.right = joystickInput.x > 0.5

        if (actionInput) {
          switch (actionInput.action) {
            case "shoot":
              player.controls.shoot = actionInput.pressed
              break
            case "dash":
              player.controls.dash = actionInput.pressed
              break
            case "special":
              player.controls.special = actionInput.pressed
              break
          }
        }
      } else {
        // Use keyboard and mouse for desktop
        player.controls.up = keysRef.current.has("KeyW")
        player.controls.down = keysRef.current.has("KeyS")
        player.controls.left = keysRef.current.has("KeyA")
        player.controls.right = keysRef.current.has("KeyD")
        player.controls.shoot = mouseRef.current.isDown
        player.controls.dash = keysRef.current.has("ShiftLeft")
        player.controls.special = keysRef.current.has("Space")

        // Update player rotation based on mouse position
        if (canvasRef.current) {
          const centerX = canvasRef.current.width / 2
          const centerY = canvasRef.current.height / 2
          const dx = mouseRef.current.x - centerX
          const dy = mouseRef.current.y - centerY
          player.rotation = Math.atan2(dy, dx)
        }
      }
    },
    [platformType, joystickInput, actionInput],
  )

  // Game loop
  useEffect(() => {
    if (!gameState || isPaused) return

    let frameCount = 0
    let lastFpsTime = performance.now()

    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000
      lastTimeRef.current = currentTime

      // Update FPS counter
      frameCount++
      if (currentTime - lastFpsTime >= 1000) {
        setFps(frameCount)
        frameCount = 0
        lastFpsTime = currentTime
      }

      // Update player controls
      updatePlayerControls(gameState.player)

      // Update game state
      const newGameState = updateLastStandGameState(gameState, deltaTime)
      setGameState(newGameState)

      // Check for game over
      if (newGameState.isGameOver && !gameState.isGameOver) {
        onGameEnd(null) // No winner in PvE mode
        return
      }

      // Render game
      renderGame(newGameState)

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState, isPaused, updatePlayerControls, onGameEnd])

  // Render game function
  const renderGame = (state: LastStandGameState) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#2d5a27"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid pattern
    ctx.strokeStyle = "#1a3d1a"
    ctx.lineWidth = 1
    const gridSize = 50
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw enemies
    state.enemies.forEach((enemy) => {
      ctx.fillStyle = "#8B0000"
      ctx.beginPath()
      ctx.arc(enemy.position.x, enemy.position.y, enemy.size, 0, Math.PI * 2)
      ctx.fill()

      // Health bar
      const barWidth = enemy.size * 2
      const barHeight = 4
      const healthPercent = enemy.health / enemy.maxHealth

      ctx.fillStyle = "#333"
      ctx.fillRect(enemy.position.x - barWidth / 2, enemy.position.y - enemy.size - 10, barWidth, barHeight)

      ctx.fillStyle = healthPercent > 0.5 ? "#4CAF50" : healthPercent > 0.25 ? "#FFC107" : "#F44336"
      ctx.fillRect(
        enemy.position.x - barWidth / 2,
        enemy.position.y - enemy.size - 10,
        barWidth * healthPercent,
        barHeight,
      )
    })

    // Draw arrows
    state.arrows.forEach((arrow) => {
      ctx.save()
      ctx.translate(arrow.position.x, arrow.position.y)
      ctx.rotate(arrow.rotation)

      ctx.fillStyle = arrow.isWeakShot ? "#8B4513" : "#D2691E"
      ctx.fillRect(-arrow.size, -1, arrow.size * 2, 2)

      // Arrow tip
      ctx.beginPath()
      ctx.moveTo(arrow.size, 0)
      ctx.lineTo(arrow.size - 3, -2)
      ctx.lineTo(arrow.size - 3, 2)
      ctx.closePath()
      ctx.fill()

      ctx.restore()
    })

    // Draw player
    const player = state.player
    ctx.save()
    ctx.translate(player.position.x, player.position.y)

    // Player body
    ctx.fillStyle = player.isInvulnerable ? "#FFB6C1" : "#4169E1"
    ctx.beginPath()
    ctx.arc(0, 0, player.size, 0, Math.PI * 2)
    ctx.fill()

    // Player direction indicator
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(Math.cos(player.rotation) * player.size, Math.sin(player.rotation) * player.size)
    ctx.stroke()

    // Bow drawing indicator
    if (player.isDrawingBow && player.drawStartTime !== null) {
      const currentTime = Date.now() / 1000
      const drawTime = currentTime - player.drawStartTime
      const drawPercent = Math.min(drawTime / player.maxDrawTime, 1)

      ctx.strokeStyle = drawPercent < 0.3 ? "#FF4444" : drawPercent < 0.7 ? "#FFAA44" : "#44FF44"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(0, 0, player.size + 5, 0, Math.PI * 2 * drawPercent)
      ctx.stroke()
    }

    ctx.restore()

    // Draw UI
    drawUI(ctx, state, canvas.width, canvas.height)
  }

  // Draw UI function
  const drawUI = (ctx: CanvasRenderingContext2D, state: LastStandGameState, width: number, height: number) => {
    // Health bar
    const healthBarWidth = 200
    const healthBarHeight = 20
    const healthPercent = state.player.health / state.player.maxHealth

    ctx.fillStyle = "#333"
    ctx.fillRect(10, 10, healthBarWidth, healthBarHeight)

    ctx.fillStyle = healthPercent > 0.5 ? "#4CAF50" : healthPercent > 0.25 ? "#FFC107" : "#F44336"
    ctx.fillRect(10, 10, healthBarWidth * healthPercent, healthBarHeight)

    ctx.fillStyle = "#FFF"
    ctx.font = "14px monospace"
    ctx.textAlign = "center"
    ctx.fillText(`${state.player.health}/${state.player.maxHealth}`, 10 + healthBarWidth / 2, 25)

    // Score and wave info
    ctx.fillStyle = "#FFF"
    ctx.font = "16px monospace"
    ctx.textAlign = "left"
    ctx.fillText(`Score: ${state.playerStats.score}`, 10, 50)
    ctx.fillText(`Wave: ${state.currentWave.number}`, 10, 70)
    ctx.fillText(`Enemies: ${state.enemies.length}`, 10, 90)

    // Cooldown indicators
    if (state.player.dashCooldown > 0) {
      ctx.fillStyle = "#FFD700"
      ctx.fillText(`Dash: ${state.player.dashCooldown.toFixed(1)}s`, width - 150, 30)
    }

    if (state.player.specialAttackCooldown > 0) {
      ctx.fillStyle = "#FF69B4"
      ctx.fillText(`Special: ${state.player.specialAttackCooldown.toFixed(1)}s`, width - 150, 50)
    }

    // Game over screen
    if (state.isGameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = "#FFF"
      ctx.font = "48px monospace"
      ctx.textAlign = "center"
      ctx.fillText("GAME OVER", width / 2, height / 2 - 50)

      ctx.font = "24px monospace"
      ctx.fillText(`Final Score: ${state.playerStats.score}`, width / 2, height / 2)
      ctx.fillText(`Waves Completed: ${state.playerStats.wavesCompleted}`, width / 2, height / 2 + 30)
      ctx.fillText(`Time Alive: ${state.playerStats.timeAlive.toFixed(1)}s`, width / 2, height / 2 + 60)
    }
  }

  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  const handleRestart = () => {
    const newState = createInitialLastStandGameState(playerId, playerName)
    setGameState(newState)
    setIsPaused(false)
  }

  const handleAudioToggle = () => {
    setAudioEnabled(!audioEnabled)
    if (audioEnabled) {
      audioManager.setMasterVolume(0)
    } else {
      audioManager.setMasterVolume(1)
    }
  }

  const handleFullscreen = () => {
    if (!isFullscreen) {
      canvasRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  if (!gameState) {
    return <div className="flex items-center justify-center h-64">Loading game...</div>
  }

  const containerClass = isCyberpunk ? "bg-black/90 border-cyan-500/50 text-cyan-200" : "bg-white border-gray-300"

  const buttonClass = isCyberpunk
    ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 hover:bg-cyan-500/40"
    : "bg-gray-100 border-gray-300 hover:bg-gray-200"

  return (
    <div className={cn("w-full h-full flex flex-col", containerClass)}>
      {/* Game Controls - Only show on desktop */}
      {platformType === "desktop" && (
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handlePause} className={buttonClass}>
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={handleRestart} className={buttonClass}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleAudioToggle} className={buttonClass}>
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={handleFullscreen} className={buttonClass}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={isCyberpunk ? "border-cyan-500 text-cyan-300" : ""}>
              FPS: {fps}
            </Badge>
            <Badge variant="outline" className={isCyberpunk ? "border-cyan-500 text-cyan-300" : ""}>
              {gameState.enemies.length} Enemies
            </Badge>
          </div>
        </div>
      )}

      {/* Game Canvas */}
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border-2 border-gray-600 max-w-full max-h-full"
          style={{
            imageRendering: "pixelated",
            width: platformType === "mobile" ? "100%" : "auto",
            height: platformType === "mobile" ? "100%" : "auto",
          }}
        />
      </div>

      {/* Mobile Instructions */}
      {platformType === "mobile" && (
        <div className="p-2 text-center text-sm opacity-75">Use joystick to move, buttons to attack</div>
      )}
    </div>
  )
}
