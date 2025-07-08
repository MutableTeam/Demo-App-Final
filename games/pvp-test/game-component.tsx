"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gamepad2 } from "lucide-react"

interface PvPTestGameComponentProps {
  playerId: string
  playerName: string
  gameMode: string
  onGameEnd: (winner: string | null) => void
}

export default function PvPTestGameComponent({ playerId, playerName, gameMode, onGameEnd }: PvPTestGameComponentProps) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-gray-900 text-white">
      <Card className="bg-gray-800 border-gray-700 text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Gamepad2 /> PvP Test Game
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder for an external PvP game engine.</p>
          <p className="mt-2">
            Player: <span className="font-bold text-yellow-400">{playerName}</span>
          </p>
          <p>
            Mode: <span className="font-bold text-yellow-400">{gameMode}</span>
          </p>
          <button
            className="mt-4 px-4 py-2 bg-green-500 rounded hover:bg-green-600"
            onClick={() => onGameEnd(playerId)}
          >
            Simulate Win
          </button>
          <button
            className="mt-4 ml-2 px-4 py-2 bg-red-500 rounded hover:bg-red-600"
            onClick={() => onGameEnd("some-other-player")}
          >
            Simulate Loss
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
