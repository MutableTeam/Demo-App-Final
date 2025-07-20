"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { GameEngine, type GameState } from "./game-engine"
import EnhancedGameRenderer from "./enhanced-game-renderer"
import { debugManager } from "@/utils/debug-utils"
import type { PlatformType } from "@/contexts/platform-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Play, Pause, Square, RotateCcw, Settings, Users, Zap, Monitor, Smartphone, Gamepad2 } from "lucide-react"
import { cn } from "@/lib/utils"
import DebugOverlay from "./debug-overlay"
import ResourceMonitor from "@/components/resource-monitor"
import type { createAIController } from "../../utils/game-ai"
import { audioManager } from "@/utils/audio-manager"
import { DebugLevel } from "@/utils/debug-level"
import { transitionDebugger } from "@/utils/transition-debugger"

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
  const gameStateRef = useRef<GameState>(gameState)
  const lastUpdateTimeRef = useRef<number>(Date.now())
  const requestAnimationFrameIdRef = useRef<number | null>(null)
  const bowSoundPlayedRef = useRef<boolean>(false)
  const fullDrawSoundPlayedRef = useRef<boolean>(false)
  const specialSoundPlayedRef = useRef<boolean>(false)
  const audioInitializedRef = useRef<boolean>(false)
  const gameInitializedRef = useRef<boolean>(false)
  const aiControllersRef = useRef<Record<string, ReturnType<typeof createAIController>>>({})
  const [showDebug, setShowDebug] = useState<boolean>(false)
  const [showResourceMonitor, setShowResourceMonitor] = useState<boolean>(false)
  const componentIdRef = useRef<string>(`game-controller-${Date.now()}`)
  const [showTutorial, setShowTutorial] = useState<boolean>(false)
  const animationTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({})
  const memoryTrackingInterval = useRef<NodeJS.Timeout | null>(null)
  const className = "bg-white" // Declare className variable

  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected")
  const [playersOnline, setPlayersOnline] = useState(0)

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
    // Enable debug system with more verbose logging
    debugManager.updateConfig({
      enabled: true,
      level: DebugLevel.DEBUG,
      capturePerformance: true,
    })

    debugManager.logInfo("GAME", "Debug system initialized for enhanced game controller")
    debugManager.logInfo("GAME", `Platform type: ${platformType}`)
    transitionDebugger.trackTransition("none", "initialized", "GameControllerEnhanced")

    // Set up keyboard shortcuts for debug tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // F8 to toggle debug overlay
      if (e.key === "F8") {
        setShowDebug((prev) => !prev)
      }

      // F9 to capture state snapshot
      if (e.key === "F9") {
        debugManager.captureState(gameStateRef.current, "Manual Snapshot")
        debugManager.logInfo("GAME", "Manual state snapshot captured")
      }

      // F11 to toggle resource monitor
      if (e.key === "F11") {
        setShowResourceMonitor((prev) => !prev)
      }
    }

    transitionDebugger.safeAddEventListener(
      window,
      "keydown",
      handleKeyDown,
      undefined,
      `${componentIdRef.current}-keydown`,
    )

    return () => {
      transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-keydown`)
    }
  }, [platformType])

  // Handle joystick input from mobile container
  useEffect(() => {
    if (platformType === "mobile" && joystickInput && gameStateRef.current.players[playerId]) {
      const player = gameStateRef.current.players[playerId]

      // Convert joystick input to movement controls
      player.controls.up = joystickInput.y < -0.3
      player.controls.down = joystickInput.y > 0.3
      player.controls.left = joystickInput.x < -0.3
      player.controls.right = joystickInput.x > 0.3

      // Calculate rotation based on joystick direction
      if (Math.abs(joystickInput.x) > 0.1 || Math.abs(joystickInput.y) > 0.1) {
        player.rotation = Math.atan2(joystickInput.y, joystickInput.x)
      }
    }
  }, [joystickInput, platformType, playerId])

  // Handle action input from mobile container
  useEffect(() => {
    if (platformType === "mobile" && actionInput && gameStateRef.current.players[playerId]) {
      const player = gameStateRef.current.players[playerId]

      switch (actionInput.action) {
        case "actionA": // Main attack/shoot
          player.controls.shoot = actionInput.pressed
          break
        case "actionB": // Dash
          player.controls.dash = actionInput.pressed
          break
        case "actionX": // Special attack
          player.controls.special = actionInput.pressed
          break
        case "actionY": // Explosive arrow (if available)
          if (player.controls.explosiveArrow !== undefined) {
            player.controls.explosiveArrow = actionInput.pressed
          }
          break
      }
    }
  }, [actionInput, platformType, playerId])

  // Initialize game
  useEffect(() => {
    // Prevent multiple initializations
    if (gameInitializedRef.current) return

    // Initialize audio directly
    audioManager
      .init()
      .then(() => {
        audioInitializedRef.current = true
        debugManager.logInfo("AUDIO", "Audio system initialized")
      })
      .catch((err) => {
        debugManager.logError("AUDIO", "Failed to initialize audio", err)
      })

    // Enable global error tracking
    debugManager.setupGlobalErrorTracking()

    // Track component mount
    debugManager.trackComponentMount("GameControllerEnhanced", {
      playerId,
      playerName,
      isHost,
      gameMode,
      platformType,
    })

    transitionDebugger.trackTransition("initialized", "mounting", "GameControllerEnhanced")

    // Make game state available globally for debugging
    if (typeof window !== "undefined") {
      ;(window as any).__gameStateRef = gameStateRef
    }

    gameInitializedRef.current = true

    debugManager.logInfo("GAME", `Initializing enhanced game with mode: ${gameMode}, platform: ${platformType}`)

    // Create local player
    const playerColors = ["#FF5252", "#4CAF50", "#2196F3", "#FFC107"]
    const playerPositions = [
      { x: 100, y: 100 },
      { x: 700, y: 500 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
    ]

    // Use the current game state
    const currentState: GameState = {
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
        "ai-2": {
          id: "ai-2",
          name: "AI Player 2",
          position: { x: 500, y: 300 },
          rotation: 0,
          health: 100,
          maxHealth: 100,
          size: 20,
          color: "#ffff00",
          isDrawingBow: false,
          drawPower: 0,
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

    setGameState(currentState)

    // Initialize game engine
    gameEngineRef.current = new GameEngine(currentState)
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

    debugManager.logDebug("GameController", "Joystick input processed", joystickInput)
  }, [joystickInput, gameState, playerId])

  // Handle action input
  useEffect(() => {
    if (!gameState || !actionInput) return

    const player = gameState.players[playerId]
    if (!player) return

    switch (actionInput.action) {
      case "dash":
        player.controls.dash = actionInput.pressed
        break
      case "special":
        player.controls.special = actionInput.pressed
        break
      case "shoot":
        player.controls.shoot = actionInput.pressed
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

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
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
      <div className="flex items-center justify-center h-full">
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

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-500"
      case "connecting":
        return "text-yellow-500"
      default:
        return "text-red-500"
    }
  }

  const getPlatformControls = () => {
    if (platformType === "desktop") {
      return {
        primary: "WASD + Mouse",
        secondary: "Space/Enter",
        special: "Shift/Ctrl",
        hint: "Use keyboard and mouse for precise control",
      }
    } else {
      return {
        primary: "Touch & Drag",
        secondary: "Tap",
        special: "Long Press",
        hint: "Touch controls optimized for mobile",
      }
    }
  }

  const controls = getPlatformControls()

  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Game Stats Header - Only show on desktop */}
      {platformType === "desktop" && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" />
                Archer Arena - {gameMode.toUpperCase()}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={connectionStatus === "connected" ? "default" : "destructive"}>{connectionStatus}</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {Object.keys(gameState.players).length}
                </Badge>
                {platformType === "mobile" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    Mobile
                  </Badge>
                )}
                {platformType === "desktop" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Monitor className="w-3 h-3" />
                    Desktop
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-lg">{gameState.players[playerId].score}</div>
                <div className="text-muted-foreground">Score</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{gameState.players[playerId].level}</div>
                <div className="text-muted-foreground">Level</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{gameState.players[playerId].lives}</div>
                <div className="text-muted-foreground">Lives</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{formatTime(gameState.gameTime)}</div>
                <div className="text-muted-foreground">Time</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4" />
                  {gameState.players[playerId].multiplier}x
                </div>
                <div className="text-muted-foreground">Multiplier</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Controls - Only show on desktop */}
      {platformType === "desktop" && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  onClick={isGameRunning ? () => setIsGameRunning(false) : () => setIsGameRunning(true)}
                  variant={isGameRunning ? "secondary" : "default"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isGameRunning ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Start
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setIsGameRunning(false)}
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </Button>
                <Button
                  onClick={() => {
                    setGameState(null)
                    setIsGameRunning(false)
                  }}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowDebug(!showDebug)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Debug
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
