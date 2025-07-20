"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { GameEngine } from "./game-engine"
import { EnhancedGameRenderer } from "./enhanced-game-renderer"
import { GameInputHandler } from "@/utils/game-input-handler"
import { GameDiagnostics } from "./game-diagnostics"
import { DebugOverlay } from "./debug-overlay"
import { CountdownTimer } from "./countdown-timer"
import { GameInstructions } from "./game-instructions"
import MobileGameContainer from "@/components/mobile-game-container"
import { useMobile } from "@/hooks/use-mobile"

interface GameControllerEnhancedProps {
  gameId: string
  playerId: string
  onGameEnd?: (result: any) => void
  enableDebug?: boolean
}

export function GameControllerEnhanced({
  gameId,
  playerId,
  onGameEnd,
  enableDebug = false,
}: GameControllerEnhancedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameEngineRef = useRef<GameEngine | null>(null)
  const rendererRef = useRef<EnhancedGameRenderer | null>(null)
  const inputHandlerRef = useRef<GameInputHandler | null>(null)
  const animationFrameRef = useRef<number>()
  const isMobile = useMobile()

  const [gameState, setGameState] = useState<any>(null)
  const [isGameRunning, setIsGameRunning] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>({})

  // Initialize game components
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const gameEngine = new GameEngine(gameId, playerId)
    const renderer = new EnhancedGameRenderer(canvas)
    const inputHandler = new GameInputHandler()

    gameEngineRef.current = gameEngine
    rendererRef.current = renderer
    inputHandlerRef.current = inputHandler

    inputHandler.setCanvas(canvas)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      inputHandler.cleanup()
    }
  }, [gameId, playerId])

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameEngineRef.current || !rendererRef.current || !inputHandlerRef.current) return

    const inputState = inputHandlerRef.current.getState()
    const newGameState = gameEngineRef.current.update(inputState)

    setGameState(newGameState)
    rendererRef.current.render(newGameState)

    if (enableDebug) {
      setDebugInfo({
        fps: Math.round(1000 / 16), // Approximate FPS
        playerPosition: newGameState.player?.position,
        inputState: inputState.keyboard,
        gameTime: newGameState.gameTime,
      })
    }

    if (newGameState.gameOver && onGameEnd) {
      onGameEnd(newGameState.result)
      setIsGameRunning(false)
      return
    }

    if (isGameRunning) {
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
  }, [isGameRunning, enableDebug, onGameEnd])

  // Start game loop when game is running
  useEffect(() => {
    if (isGameRunning) {
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isGameRunning, gameLoop])

  // Handle joystick movement for mobile
  const handleJoystickMove = useCallback((direction: { x: number; y: number }) => {
    if (!inputHandlerRef.current) return

    const deadzone = 0.2
    const { x, y } = direction

    // Apply deadzone
    const distance = Math.sqrt(x * x + y * y)
    if (distance < deadzone) {
      inputHandlerRef.current.updateKeyboardState({
        up: false,
        down: false,
        left: false,
        right: false,
      })
      return
    }

    // Convert joystick direction to keyboard-like input
    inputHandlerRef.current.updateKeyboardState({
      up: y > 0.3,
      down: y < -0.3,
      left: x < -0.3,
      right: x > 0.3,
    })
  }, [])

  // Handle action button presses for mobile
  const handleActionPress = useCallback((action: string, pressed: boolean) => {
    if (!inputHandlerRef.current) return
    \
    const actionMap: Record<string, keyof typeof inputHandlerRef.current.getState().keyboard> = {
      shoot: 'shoot',
      special: 'special',
      dash: 'dash',
      explosive: 'explosive'
    }

    const keyboardAction = actionMap[action]
    if (keyboardAction) {
      inputHandlerRef.current.updateKeyboardState({
        [keyboardAction]: pressed,
      })
    }
  }, [])

  const startGame = () => {
    setShowInstructions(false)
    setCountdown(3)

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval)
          setIsGameRunning(true)
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const resetGame = () => {
    setIsGameRunning(false)
    setShowInstructions(true)
    setCountdown(null)
    if (gameEngineRef.current) {
      gameEngineRef.current.reset()
    }
  }

  const gameContent = (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full object-contain bg-black"
        style={{ imageRendering: "pixelated" }}
      />

      {countdown !== null && <CountdownTimer count={countdown} />}

      {enableDebug && <DebugOverlay debugInfo={debugInfo} />}

      {showInstructions && <GameInstructions onStart={startGame} />}

      {gameState?.gameOver && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Game Over</h2>
            <p className="text-xl mb-4">Score: {gameState.score}</p>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <MobileGameContainer onJoystickMove={handleJoystickMove} onActionPress={handleActionPress}>
        {gameContent}
      </MobileGameContainer>
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      {gameContent}
      {enableDebug && <GameDiagnostics gameState={gameState} />}
    </div>
  )
}
