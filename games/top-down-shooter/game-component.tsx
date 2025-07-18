"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { GameEngine } from "./game-engine"
import { GameInstructions } from "./instructions"
import { usePlatform } from "@/contexts/platform-context"
import { MobileOptimizedContainer } from "@/components/mobile-optimized-container"
import { MousePointer, TouchpadIcon } from "lucide-react"

interface GameComponentProps {
  gameId: string
}

export default function TopDownShooterGame({ gameId }: GameComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameEngineRef = useRef<GameEngine | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const { platform } = usePlatform()
  const isMobile = platform === "mobile"

  const handleGameUpdate = useCallback((newScore: number, isGameOver: boolean) => {
    setScore(newScore)
    setGameOver(isGameOver)
  }, [])

  useEffect(() => {
    if (canvasRef.current) {
      gameEngineRef.current = new GameEngine(canvasRef.current, handleGameUpdate)
      gameEngineRef.current.init()
    }

    return () => {
      gameEngineRef.current?.destroy()
    }
  }, [handleGameUpdate])

  const startGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.startGame()
      setGameStarted(true)
      setGameOver(false)
      setScore(0)
    }
  }

  const resetGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.resetGame()
      setGameStarted(false)
      setGameOver(false)
      setScore(0)
    }
  }

  const renderGameContent = () => (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full bg-black" />
      {!gameStarted && !gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-4">
          <h2 className="text-3xl font-bold mb-4">Archer Arena</h2>
          <GameInstructions platform={platform || "desktop"} /> {/* Pass platform to instructions */}
          <button
            onClick={startGame}
            className="mt-8 px-6 py-3 bg-green-500 text-white rounded-lg text-xl font-semibold hover:bg-green-600 transition-colors"
          >
            Start Game
          </button>
        </div>
      )}
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4">
          <h2 className="text-4xl font-bold mb-4 text-red-500">Game Over!</h2>
          <p className="text-2xl mb-6">Final Score: {score}</p>
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg text-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
      {gameStarted && !gameOver && (
        <div className="absolute top-4 left-4 text-white text-xl font-bold">Score: {score}</div>
      )}
      {/* Display current platform controls hint */}
      <div className="absolute bottom-4 right-4 text-white text-sm flex items-center gap-2">
        {platform === "desktop" ? (
          <>
            <MousePointer className="h-4 w-4" /> Keyboard & Mouse
          </>
        ) : (
          <>
            <TouchpadIcon className="h-4 w-4" /> Touch Controls
          </>
        )}
      </div>
    </div>
  )

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      {isMobile ? <MobileOptimizedContainer>{renderGameContent()}</MobileOptimizedContainer> : renderGameContent()}
    </div>
  )
}
