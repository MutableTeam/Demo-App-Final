"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"

interface PvETestGameComponentProps {
  playerName: string
  gameMode: string
  onGameEnd: (stats: { score: number }) => void
}

export default function PvETestGameComponent({ playerName, gameMode, onGameEnd }: PvETestGameComponentProps) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-gray-900 text-white">
      <Card className="bg-gray-800 border-gray-700 text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Trophy /> PvE Test Game
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder for an external PvE game engine.</p>
          <p className="mt-2">
            Player: <span className="font-bold text-yellow-400">{playerName}</span>
          </p>
          <p>
            Challenge: <span className="font-bold text-yellow-400">{gameMode}</span>
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
            onClick={() => onGameEnd({ score: Math.floor(Math.random() * 10000) })}
          >
            Simulate Game End & Submit Score
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
