"use client"

import { useState } from "react"
import GameControllerEnhanced from "@/components/pvp-game/game-controller-enhanced"
import { usePlatform } from "@/contexts/platform-context"

interface TopDownShooterProps {
  gameId?: string
  playerId?: string
}

export default function TopDownShooter({ gameId = "top-down-shooter", playerId = "player-1" }: TopDownShooterProps) {
  const { platformType } = usePlatform()
  const [gameEnded, setGameEnded] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)

  const handleGameEnd = (result: any) => {
    console.log("Game ended:", result)
    setWinner(result?.winner || null)
    setGameEnded(true)
  }

  const restartGame = () => {
    setGameEnded(false)
    setWinner(null)
  }

  if (gameEnded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white">
        <div className="text-center font-mono">
          <h2 className="text-4xl font-bold mb-4 text-cyan-400">{winner === playerId ? "VICTORY!" : "GAME OVER"}</h2>
          <p className="text-xl mb-8 text-gray-300">{winner ? `Winner: ${winner}` : "Match Complete"}</p>
          <button
            onClick={restartGame}
            className="px-8 py-4 bg-cyan-500 text-black font-bold text-lg rounded-lg hover:bg-cyan-400 transition-colors border-2 border-cyan-400"
          >
            PLAY AGAIN
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <GameControllerEnhanced
        gameId={gameId}
        playerId={playerId}
        onGameEnd={handleGameEnd}
        debugMode={false}
        initialGameState={{
          arenaSize: { width: 800, height: 600 },
          gameStatus: "playing",
        }}
      />
    </div>
  )
}
