"use client"

import { useState, useEffect } from "react"
import { gameRegistry } from "@/types/game-registry"
import { useToast } from "@/hooks/use-toast"
import GameErrorBoundary from "@/components/game-error-boundary"
import { debugManager } from "@/utils/debug-utils"
import GameControllerEnhanced from "@/components/pvp-game/game-controller-enhanced"

interface GameContainerProps {
  gameId: string
  playerId: string
  playerName: string
  isHost: boolean
  gameMode: string
  onGameEnd: (winner: string | null) => void
}

export function GameContainer({ gameId, playerId, playerName, isHost, gameMode, onGameEnd }: GameContainerProps) {
  const [gameState, setGameState] = useState<"loading" | "playing" | "ended">("loading")
  const { toast } = useToast()

  // Get the game from registry
  const game = gameRegistry.getGame(gameId)

  useEffect(() => {
    // Log initialization for debugging
    debugManager.logInfo("GameContainer", "Initializing game container", {
      gameId,
      playerId,
      playerName,
      isHost,
      gameMode,
    })

    // Set game to playing state after a short delay to ensure proper initialization
    const timer = setTimeout(() => {
      setGameState("playing")
      debugManager.logInfo("GameContainer", "Game state set to playing")
    }, 500)

    return () => clearTimeout(timer)
  }, [gameId, playerId, playerName, isHost, gameMode])

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xl font-semibold text-gray-700">Game not found</p>
      </div>
    )
  }

  const GameComponent = game.GameComponent

  const handleError = (error: Error) => {
    console.error("Game error:", error)
    toast({
      title: "System Error",
      description: error.message,
      variant: "destructive",
    })
  }

  // Initialize game state
  const initialGameState = game.initializeGameState({
    playerId,
    playerName,
    isHost,
    gameMode,
    players: [
      { id: playerId, name: playerName, isHost },
      // Mock players for testing
      { id: "ai-1", name: "AI Player 1", isHost: false },
      { id: "ai-2", name: "AI Player 2", isHost: false },
      { id: "ai-3", name: "AI Player 3", isHost: false },
    ],
  })

  // Loading state
  if (gameState === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-lg font-medium text-gray-700">Loading Game...</p>
      </div>
    )
  }

  // Game container
  return (
    <div className="relative w-full h-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Development Banner */}
      <div className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-center py-2 mb-2">
        DEMO GAME - DOES NOT REPRESENT FINAL PRODUCT
      </div>

      <GameErrorBoundary>
        {game.id === "archer-arena" || game.id === "last-stand" ? (
          <GameControllerEnhanced
            playerId={playerId}
            playerName={playerName}
            isHost={isHost}
            gameMode={gameMode}
            onGameEnd={onGameEnd}
          />
        ) : (
          <GameComponent
            playerId={playerId}
            playerName={playerName}
            isHost={isHost}
            gameMode={gameMode}
            initialGameState={initialGameState}
            onGameEnd={onGameEnd}
            onError={handleError}
          />
        )}
      </GameErrorBoundary>
    </div>
  )
}
