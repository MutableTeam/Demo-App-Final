"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import EnhancedGameRenderer from "./enhanced-game-renderer"
import { debugManager, DebugLevel } from "@/utils/debug-utils"
import type { PlatformType } from "@/contexts/platform-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import DebugOverlay from "./debug-overlay"
import ResourceMonitor from "@/components/resource-monitor"

// Define game state interfaces
interface Player {
  id: string
  name: string
  position: { x: number; y: number }
  rotation: number
  health: number
  maxHealth: number
  size: number
  color: string
  isDrawingBow: boolean
  drawPower: number
  score?: number
  level?: number
  lives?: number
  multiplier?: number
  controls: {
    up: boolean
    down: boolean
    left: boolean
    right: boolean
    shoot: boolean
    dash: boolean
    special: boolean
    explosiveArrow?: boolean
  }
}

interface Arrow {
  id: string
  position: { x: number; y: number }
  velocity: { x: number; y: number }
  playerId: string
  damage: number
  isExplosive?: boolean
}

interface Wall {
  position: { x: number; y: number }
  width: number
  height: number
}

interface Pickup {
  id: string
  position: { x: number; y: number }
  type: string
  value: number
}

interface GameState {
  players: Record<string, Player>
  arrows: Arrow[]
  walls: Wall[]
  pickups: Pickup[]
  gameTime: number
  gameStatus: "waiting" | "playing" | "ended"
  winner: string | null
}

// Simple game engine class
class GameEngine {
  private gameState: GameState
  private lastUpdate: number = Date.now()

  constructor(initialState: GameState) {
    this.gameState = { ...initialState }
  }

  update(): GameState {
    const now = Date.now()
    const deltaTime = (now - this.lastUpdate) / 1000
    this.lastUpdate = now

    // Update game time
    if (this.gameState.gameStatus === "playing") {
      this.gameState.gameTime += deltaTime
    }

    // Update players
    Object.values(this.gameState.players).forEach((player) => {
      this.updatePlayer(player, deltaTime)
    })

    // Update arrows
    this.gameState.arrows = this.gameState.arrows.filter((arrow) => {
      return this.updateArrow(arrow, deltaTime)
    })

    // Check win conditions
    this.checkWinConditions()

    return { ...this.gameState }
  }

  private updatePlayer(player: Player, deltaTime: number) {
    const speed = 200 // pixels per second

    // Update position based on controls
    if (player.controls.up) player.position.y -= speed * deltaTime
    if (player.controls.down) player.position.y += speed * deltaTime
    if (player.controls.left) player.position.x -= speed * deltaTime
    if (player.controls.right) player.position.x += speed * deltaTime

    // Keep player in bounds (assuming 800x600 game area)
    player.position.x = Math.max(player.size, Math.min(800 - player.size, player.position.x))
    player.position.y = Math.max(player.size, Math.min(600 - player.size, player.position.y))

    // Handle shooting
    if (player.controls.shoot && !player.isDrawingBow) {
      this.createArrow(player)
    }
  }

  private updateArrow(arrow: Arrow, deltaTime: number): boolean {
    // Update arrow position
    arrow.position.x += arrow.velocity.x * deltaTime
    arrow.position.y += arrow.velocity.y * deltaTime

    // Remove arrows that are out of bounds
    if (arrow.position.x < 0 || arrow.position.x > 800 || arrow.position.y < 0 || arrow.position.y > 600) {
      return false
    }

    // Check collision with walls
    for (const wall of this.gameState.walls) {
      if (this.checkArrowWallCollision(arrow, wall)) {
        return false
      }
    }

    // Check collision with players
    for (const player of Object.values(this.gameState.players)) {
      if (player.id !== arrow.playerId && this.checkArrowPlayerCollision(arrow, player)) {
        player.health -= arrow.damage
        if (player.health <= 0) {
          player.health = 0
        }
        return false
      }
    }

    return true
  }

  private createArrow(player: Player) {
    const arrowSpeed = 400
    const arrow: Arrow = {
      id: `arrow-${Date.now()}-${Math.random()}`,
      position: { ...player.position },
      velocity: {
        x: Math.cos(player.rotation) * arrowSpeed,
        y: Math.sin(player.rotation) * arrowSpeed,
      },
      playerId: player.id,
      damage: 25,
      isExplosive: player.controls.explosiveArrow || false,
    }

    this.gameState.arrows.push(arrow)
  }

  private checkArrowWallCollision(arrow: Arrow, wall: Wall): boolean {
    return (
      arrow.position.x >= wall.position.x &&
      arrow.position.x <= wall.position.x + wall.width &&
      arrow.position.y >= wall.position.y &&
      arrow.position.y <= wall.position.y + wall.height
    )
  }

  private checkArrowPlayerCollision(arrow: Arrow, player: Player): boolean {
    const distance = Math.sqrt(
      Math.pow(arrow.position.x - player.position.x, 2) + Math.pow(arrow.position.y - player.position.y, 2),
    )
    return distance < player.size
  }

  private checkWinConditions() {
    const alivePlayers = Object.values(this.gameState.players).filter((p) => p.health > 0)

    if (alivePlayers.length <= 1 && this.gameState.gameStatus === "playing") {
      this.gameState.gameStatus = "ended"
      this.gameState.winner = alivePlayers.length === 1 ? alivePlayers[0].id : null
    }
  }

  getState(): GameState {
    return { ...this.gameState }
  }
}

interface GameStats {
  score: number
  level: number
  lives: number
  time: number
  multiplier: number
}

interface GameControllerEnhancedProps {
  gameId: string
  playerId: string
  playerName: string
  isHost: boolean
  gameMode: string
  onGameEnd: (winner?: string | null) => void
  platformType?: PlatformType
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
  joystickInput,
  actionInput,
}: GameControllerEnhancedProps) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isGameRunning, setIsGameRunning] = useState(false)
  const gameEngineRef = useRef<GameEngine | null>(null)
  const animationFrameRef = useRef<number>()
  const gameStateRef = useRef<GameState | null>(gameState)
  const [showDebug, setShowDebug] = useState<boolean>(false)
  const [showResourceMonitor, setShowResourceMonitor] = useState<boolean>(false)
  const [showTutorial, setShowTutorial] = useState<boolean>(false)

  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected")

  // Touch controls state for mobile
  const [touchControls, setTouchControls] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false,
    special: false,
    dash: false,
  })

  // Update game state ref when state changes
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  // Initialize debug system
  useEffect(() => {
    debugManager.updateConfig({
      enabled: true,
      level: DebugLevel.DEBUG,
      capturePerformance: true,
    })

    debugManager.logInfo("GAME", "Debug system initialized for enhanced game controller")
    debugManager.logInfo("GAME", `Platform type: ${platformType}`)
  }, [platformType])

  // Initialize game
  useEffect(() => {
    debugManager.logInfo("GAME", `Initializing enhanced game with mode: ${gameMode}, platform: ${platformType}`)

    // Create initial game state
    const initialState: GameState = {
      players: {
        [playerId]: {
          id: playerId,
          name: playerName,
          position: { x: 100, y: 100 },
          rotation: 0,
          health: 100,
          maxHealth: 100,
          size: 20,
          color: "#00ffff",
          isDrawingBow: false,
          drawPower: 0,
          score: 0,
          level: 1,
          lives: 3,
          multiplier: 1,
          controls: {
            up: false,
            down: false,
            left: false,
            right: false,
            shoot: false,
            dash: false,
            special: false,
          },
        },
        "ai-1": {
          id: "ai-1",
          name: "AI Player 1",
          position: { x: 300, y: 200 },
          rotation: 0,
          health: 100,
          maxHealth: 100,
          size: 20,
          color: "#ff00ff",
          isDrawingBow: false,
          drawPower: 0,
          score: 0,
          level: 1,
          lives: 3,
          multiplier: 1,
          controls: {
            up: false,
            down: false,
            left: false,
            right: false,
            shoot: false,
            dash: false,
            special: false,
          },
        },
      },
      arrows: [],
      walls: [
        { position: { x: 200, y: 150 }, width: 60, height: 60 },
        { position: { x: 400, y: 250 }, width: 60, height: 60 },
        { position: { x: 600, y: 350 }, width: 60, height: 60 },
      ],
      pickups: [],
      gameTime: 0,
      gameStatus: "playing",
      winner: null,
    }

    setGameState(initialState)
    gameEngineRef.current = new GameEngine(initialState)
    setIsGameRunning(true)

    debugManager.logInfo("GameController", "Game initialized successfully")

    return () => {
      setIsGameRunning(false)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameId, playerId, playerName, platformType])

  // Handle joystick input
  useEffect(() => {
    if (!gameState || !joystickInput) return

    const player = gameState.players[playerId]
    if (!player) return

    // Update player controls based on joystick input
    player.controls.up = joystickInput.y < -0.3
    player.controls.down = joystickInput.y > 0.3
    player.controls.left = joystickInput.x < -0.3
    player.controls.right = joystickInput.x > 0.3

    // Calculate rotation based on joystick direction
    if (Math.abs(joystickInput.x) > 0.1 || Math.abs(joystickInput.y) > 0.1) {
      player.rotation = Math.atan2(joystickInput.y, joystickInput.x)
    }

    debugManager.logDebug("GameController", "Joystick input processed", joystickInput)
  }, [joystickInput, gameState, playerId])

  // Handle action input
  useEffect(() => {
    if (!gameState || !actionInput) return

    const player = gameState.players[playerId]
    if (!player) return

    switch (actionInput.action) {
      case "actionA":
        player.controls.shoot = actionInput.pressed
        break
      case "actionB":
        player.controls.dash = actionInput.pressed
        break
      case "actionX":
        player.controls.special = actionInput.pressed
        break
      case "actionY":
        if (player.controls.explosiveArrow !== undefined) {
          player.controls.explosiveArrow = actionInput.pressed
        }
        break
    }

    debugManager.logDebug("GameController", "Action input processed", actionInput)
  }, [actionInput, gameState, playerId])

  // Game loop
  useEffect(() => {
    if (!isGameRunning || !gameEngineRef.current) return

    const gameLoop = () => {
      if (gameEngineRef.current) {
        const newState = gameEngineRef.current.update()
        setGameState(newState)

        // Check for game end conditions
        if (newState.gameStatus === "ended" && newState.winner) {
          setIsGameRunning(false)
          onGameEnd(newState.winner)
          return
        }
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isGameRunning, onGameEnd])

  // Handle keyboard input for desktop
  useEffect(() => {
    if (platformType !== "desktop" || !gameState) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const player = gameState.players[playerId]
      if (!player) return

      switch (event.key.toLowerCase()) {
        case "w":
        case "arrowup":
          player.controls.up = true
          break
        case "s":
        case "arrowdown":
          player.controls.down = true
          break
        case "a":
        case "arrowleft":
          player.controls.left = true
          break
        case "d":
        case "arrowright":
          player.controls.right = true
          break
        case " ":
          event.preventDefault()
          player.controls.shoot = true
          break
        case "shift":
          player.controls.dash = true
          break
        case "e":
          player.controls.special = true
          break
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const player = gameState.players[playerId]
      if (!player) return

      switch (event.key.toLowerCase()) {
        case "w":
        case "arrowup":
          player.controls.up = false
          break
        case "s":
        case "arrowdown":
          player.controls.down = false
          break
        case "a":
        case "arrowleft":
          player.controls.left = false
          break
        case "d":
        case "arrowright":
          player.controls.right = false
          break
        case " ":
          player.controls.shoot = false
          break
        case "shift":
          player.controls.dash = false
          break
        case "e":
          player.controls.special = false
          break
      }
    }

    const handleMouseMove = (event: MouseEvent) => {
      const player = gameState.players[playerId]
      if (!player) return

      const canvas = document.querySelector("canvas")
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top

      // Calculate angle between player and mouse
      const dx = mouseX - player.position.x
      const dy = mouseY - player.position.y
      player.rotation = Math.atan2(dy, dx)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [platformType, gameState, playerId])

  const handleTouchControl = useCallback((control: string, pressed: boolean) => {
    setTouchControls((prev) => ({
      ...prev,
      [control]: pressed,
    }))
  }, [])

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-mono">Initializing Game...</p>
        </div>
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="relative w-full h-full">
      {/* Game Renderer */}
      <div className="relative">
        <EnhancedGameRenderer
          gameState={gameState}
          localPlayerId={playerId}
          debugMode={showDebug}
          platformType={platformType}
          onTouchControl={handleTouchControl}
        />

        {/* Debug Overlay */}
        {showDebug && (
          <div className="absolute top-4 right-4 z-50">
            <DebugOverlay
              gameState={gameState}
              playerId={playerId}
              showFps={true}
              showEntityCount={true}
              showPlayerInfo={true}
              showPerformanceMetrics={true}
            />
          </div>
        )}

        {/* Resource Monitor */}
        {showResourceMonitor && (
          <div className="absolute bottom-4 right-4 z-50">
            <ResourceMonitor />
          </div>
        )}

        {/* Mobile Tutorial Overlay */}
        {platformType === "mobile" && showTutorial && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
            <Card className="max-w-md mx-4">
              <CardHeader>
                <CardTitle>Mobile Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Movement</h4>
                  <p className="text-sm text-muted-foreground">Use the joystick on the left to move your archer</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Aiming & Shooting</h4>
                  <p className="text-sm text-muted-foreground">
                    Touch and drag on the right side to aim. Release to shoot arrows
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Special Actions</h4>
                  <p className="text-sm text-muted-foreground">Use DASH and SPEC buttons for special abilities</p>
                </div>
                <Button onClick={() => setShowTutorial(false)} className="w-full">
                  Got it!
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState.gameStatus === "ended" && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
            <Card className="max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-center">
                  {gameState.winner === playerId ? "Victory!" : "Game Over"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <p className="text-lg font-semibold">
                    {gameState.winner === playerId
                      ? "Congratulations! You won!"
                      : gameState.winner
                        ? `${gameState.players[gameState.winner]?.name || "Unknown"} wins!`
                        : "It's a draw!"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Game Time: {formatTime(gameState.gameTime)}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setGameState(null)
                      setIsGameRunning(false)
                    }}
                    className="flex-1"
                  >
                    Play Again
                  </Button>
                  <Button onClick={() => setIsGameRunning(false)} variant="outline" className="flex-1 bg-transparent">
                    Exit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
