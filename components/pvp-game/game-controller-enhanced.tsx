"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { GameEngine, type GameState } from "./game-engine"
import GameRenderer from "./game-renderer"
import { debugManager } from "@/utils/debug-utils"
import { useIsMobile } from "@/components/ui/use-mobile"

// Mobile touch controls
interface TouchControl {
  id: number
  startX: number
  startY: number
  currentX: number
  currentY: number
  type: "movement" | "aim" | "none"
}

interface GameControllerEnhancedProps {
  playerId: string
  playerName: string
  isHost: boolean
  gameMode: string
  onGameEnd: (winner: string | null) => void
}

export default function GameControllerEnhanced({
  playerId,
  playerName,
  isHost,
  gameMode,
  onGameEnd,
}: GameControllerEnhancedProps) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isGameRunning, setIsGameRunning] = useState(false)
  const gameEngineRef = useRef<GameEngine | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const lastUpdateTimeRef = useRef<number>(0)
  const isMobile = useIsMobile()

  // Touch controls state
  const [touchControls, setTouchControls] = useState<Map<number, TouchControl>>(new Map())
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 })
  const [aimDirection, setAimDirection] = useState({ x: 0, y: 0 })
  const [isDrawingBow, setIsDrawingBow] = useState(false)

  // Input state
  const keysPressed = useRef<Set<string>>(new Set())
  const mouseState = useRef({ x: 0, y: 0, isDown: false })

  // Initialize game engine
  useEffect(() => {
    const initializeGame = async () => {
      try {
        debugManager.logInfo("GameController", "Initializing enhanced game controller")

        const gameEngine = new GameEngine({
          arenaSize: { width: 1200, height: 800 },
          maxPlayers: 4,
          gameMode: gameMode as any,
        })

        // Add local player
        gameEngine.addPlayer(playerId, {
          name: playerName,
          position: { x: 600, y: 400 },
          color: "#ff6b6b",
          isHost,
        })

        // Add AI players for testing
        gameEngine.addPlayer("ai-1", {
          name: "AI Player 1",
          position: { x: 200, y: 200 },
          color: "#4ecdc4",
          isHost: false,
        })

        gameEngine.addPlayer("ai-2", {
          name: "AI Player 2",
          position: { x: 1000, y: 200 },
          color: "#45b7d1",
          isHost: false,
        })

        gameEngine.addPlayer("ai-3", {
          name: "AI Player 3",
          position: { x: 600, y: 600 },
          color: "#96ceb4",
          isHost: false,
        })

        gameEngineRef.current = gameEngine
        setGameState(gameEngine.getGameState())
        setIsGameRunning(true)

        debugManager.logInfo("GameController", "Game initialized successfully")
      } catch (error) {
        debugManager.logError("GameController", "Failed to initialize game", error)
      }
    }

    initializeGame()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [playerId, playerName, isHost, gameMode])

  // Game loop
  const gameLoop = useCallback(
    (currentTime: number) => {
      if (!gameEngineRef.current || !isGameRunning) return

      const deltaTime = currentTime - lastUpdateTimeRef.current
      lastUpdateTimeRef.current = currentTime

      if (deltaTime > 0) {
        // Process input
        processInput()

        // Update game engine
        gameEngineRef.current.update(deltaTime / 1000)

        // Update game state
        const newGameState = gameEngineRef.current.getGameState()
        setGameState(newGameState)

        // Check for game end
        if (newGameState.isGameOver && newGameState.winner) {
          setIsGameRunning(false)
          onGameEnd(newGameState.winner)
          return
        }
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    },
    [isGameRunning, onGameEnd],
  )

  // Start game loop
  useEffect(() => {
    if (isGameRunning) {
      lastUpdateTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isGameRunning, gameLoop])

  // Process input (keyboard, mouse, touch)
  const processInput = useCallback(() => {
    if (!gameEngineRef.current) return

    const gameEngine = gameEngineRef.current

    if (isMobile) {
      // Mobile touch input
      const moveX = joystickPosition.x
      const moveY = joystickPosition.y

      if (Math.abs(moveX) > 0.1 || Math.abs(moveY) > 0.1) {
        gameEngine.handlePlayerInput(playerId, "move", { x: moveX, y: moveY })
      }

      if (isDrawingBow && (Math.abs(aimDirection.x) > 0.1 || Math.abs(aimDirection.y) > 0.1)) {
        gameEngine.handlePlayerInput(playerId, "aim", aimDirection)
      }
    } else {
      // Desktop keyboard/mouse input
      let moveX = 0
      let moveY = 0

      if (keysPressed.current.has("KeyW") || keysPressed.current.has("ArrowUp")) moveY -= 1
      if (keysPressed.current.has("KeyS") || keysPressed.current.has("ArrowDown")) moveY += 1
      if (keysPressed.current.has("KeyA") || keysPressed.current.has("ArrowLeft")) moveX -= 1
      if (keysPressed.current.has("KeyD") || keysPressed.current.has("ArrowRight")) moveX += 1

      if (moveX !== 0 || moveY !== 0) {
        gameEngine.handlePlayerInput(playerId, "move", { x: moveX, y: moveY })
      }

      // Mouse aiming
      if (mouseState.current.isDown) {
        const canvas = canvasRef.current
        if (canvas) {
          const rect = canvas.getBoundingClientRect()
          const centerX = rect.width / 2
          const centerY = rect.height / 2
          const aimX = (mouseState.current.x - centerX) / centerX
          const aimY = (mouseState.current.y - centerY) / centerY

          gameEngine.handlePlayerInput(playerId, "aim", { x: aimX, y: aimY })
        }
      }

      // Abilities
      if (keysPressed.current.has("Space")) {
        gameEngine.handlePlayerInput(playerId, "dash", {})
      }
      if (keysPressed.current.has("KeyE")) {
        gameEngine.handlePlayerInput(playerId, "special", {})
      }
    }
  }, [playerId, isMobile, joystickPosition, aimDirection, isDrawingBow])

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    Array.from(e.changedTouches).forEach((touch) => {
      const x = (touch.clientX - rect.left) * scaleX
      const y = (touch.clientY - rect.top) * scaleY

      const control: TouchControl = {
        id: touch.identifier,
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
        type: x < canvas.width / 2 ? "movement" : "aim",
      }

      setTouchControls((prev) => new Map(prev).set(touch.identifier, control))

      if (control.type === "aim") {
        setIsDrawingBow(true)
      }
    })
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      Array.from(e.changedTouches).forEach((touch) => {
        const control = touchControls.get(touch.identifier)
        if (!control) return

        const x = (touch.clientX - rect.left) * scaleX
        const y = (touch.clientY - rect.top) * scaleY

        const updatedControl = {
          ...control,
          currentX: x,
          currentY: y,
        }

        setTouchControls((prev) => new Map(prev).set(touch.identifier, updatedControl))

        if (control.type === "movement") {
          // Calculate joystick position
          const deltaX = x - control.startX
          const deltaY = y - control.startY
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
          const maxDistance = 50 // Maximum joystick radius

          if (distance > maxDistance) {
            const normalizedX = (deltaX / distance) * maxDistance
            const normalizedY = (deltaY / distance) * maxDistance
            setJoystickPosition({
              x: normalizedX / maxDistance,
              y: normalizedY / maxDistance,
            })
          } else {
            setJoystickPosition({
              x: deltaX / maxDistance,
              y: deltaY / maxDistance,
            })
          }
        } else if (control.type === "aim") {
          // Calculate aim direction (opposite of draw direction)
          const deltaX = control.startX - x
          const deltaY = control.startY - y
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

          if (distance > 10) {
            setAimDirection({
              x: deltaX / distance,
              y: deltaY / distance,
            })
          }
        }
      })
    },
    [touchControls],
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()

      Array.from(e.changedTouches).forEach((touch) => {
        const control = touchControls.get(touch.identifier)
        if (!control) return

        if (control.type === "movement") {
          setJoystickPosition({ x: 0, y: 0 })
        } else if (control.type === "aim") {
          setIsDrawingBow(false)
          setAimDirection({ x: 0, y: 0 })

          // Fire arrow
          if (gameEngineRef.current) {
            const deltaX = control.startX - control.currentX
            const deltaY = control.startY - control.currentY
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

            if (distance > 20) {
              gameEngineRef.current.handlePlayerInput(playerId, "fire", {
                x: deltaX / distance,
                y: deltaY / distance,
                power: Math.min(distance / 100, 1),
              })
            }
          }
        }

        setTouchControls((prev) => {
          const newMap = new Map(prev)
          newMap.delete(touch.identifier)
          return newMap
        })
      })
    },
    [touchControls, playerId],
  )

  // Keyboard event handlers
  useEffect(() => {
    if (isMobile) return

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.code)

      if (e.code === "Space") {
        e.preventDefault()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code)

      // Fire arrow on mouse release
      if (e.code === "Space" && gameEngineRef.current) {
        gameEngineRef.current.handlePlayerInput(playerId, "fire", {})
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      mouseState.current.isDown = true
    }

    const handleMouseUp = (e: MouseEvent) => {
      mouseState.current.isDown = false

      // Fire arrow
      if (gameEngineRef.current) {
        gameEngineRef.current.handlePlayerInput(playerId, "fire", {})
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      mouseState.current.x = e.clientX - rect.left
      mouseState.current.y = e.clientY - rect.top
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [isMobile, playerId])

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Game renderer */}
      <div
        className="w-full h-full"
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
        style={{ touchAction: "none" }}
      >
        <GameRenderer gameState={gameState} localPlayerId={playerId} />
      </div>

      {/* Mobile touch controls overlay */}
      {isMobile && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Movement joystick */}
          {Array.from(touchControls.values())
            .filter((control) => control.type === "movement")
            .map((control) => (
              <div key={control.id}>
                {/* Joystick base */}
                <div
                  className="absolute w-20 h-20 border-2 border-white/30 rounded-full bg-black/20"
                  style={{
                    left: control.startX - 40,
                    top: control.startY - 40,
                  }}
                />
                {/* Joystick knob */}
                <div
                  className="absolute w-8 h-8 bg-white/60 rounded-full"
                  style={{
                    left: control.currentX - 16,
                    top: control.currentY - 16,
                  }}
                />
              </div>
            ))}

          {/* Aim line */}
          {Array.from(touchControls.values())
            .filter((control) => control.type === "aim")
            .map((control) => {
              const deltaX = control.currentX - control.startX
              const deltaY = control.currentY - control.startY
              const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

              if (distance < 10) return null

              return (
                <div key={control.id}>
                  {/* Draw line */}
                  <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
                    <line
                      x1={control.startX}
                      y1={control.startY}
                      x2={control.currentX}
                      y2={control.currentY}
                      stroke="rgba(255, 255, 255, 0.6)"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                    {/* Arrow trajectory preview */}
                    <line
                      x1={control.startX}
                      y1={control.startY}
                      x2={control.startX + (control.startX - control.currentX) * 2}
                      y2={control.startY + (control.startY - control.currentY) * 2}
                      stroke="rgba(255, 255, 0, 0.8)"
                      strokeWidth="3"
                    />
                  </svg>
                  {/* Power indicator */}
                  <div
                    className="absolute w-4 h-4 bg-yellow-400 rounded-full"
                    style={{
                      left: control.startX - 8,
                      top: control.startY - 8,
                      transform: `scale(${Math.min(distance / 50, 2)})`,
                    }}
                  />
                </div>
              )
            })}
        </div>
      )}

      {/* Control instructions */}
      <div className="absolute top-4 left-4 text-white text-sm bg-black/50 p-2 rounded">
        {isMobile ? (
          <div>
            <div>Left side: Move</div>
            <div>Right side: Aim & Fire</div>
          </div>
        ) : (
          <div>
            <div>WASD: Move</div>
            <div>Mouse: Aim & Fire</div>
            <div>Space: Dash</div>
            <div>E: Special</div>
          </div>
        )}
      </div>
    </div>
  )
}
