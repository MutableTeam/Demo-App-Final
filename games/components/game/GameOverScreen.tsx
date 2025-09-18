"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Star } from "lucide-react"

export default function GameOverScreen({ score, wave, onRestart, isMobile }) {
  const [highScores, setHighScores] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [rank, setRank] = useState(null)

  const loadHighScores = useCallback(async () => {
    try {
      const response = await fetch("/api/highscores?limit=10&gameType=galactic-vanguard")
      if (response.ok) {
        const data = await response.json()
        setHighScores(data.highScores)

        const currentRank = data.highScores.findIndex((s) => s.score < score) + 1
        setRank(currentRank === 0 ? data.highScores.length + 1 : currentRank)
      }
    } catch (error) {
      console.error("Error loading high scores:", error)
    } finally {
      setIsLoading(false)
    }
  }, [score])

  useEffect(() => {
    loadHighScores()
  }, [loadHighScores])

  const getRankIcon = (position) => {
    if (position === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (position === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (position === 3) return <Medal className="w-5 h-5 text-orange-600" />
    return <Star className="w-4 h-4 text-gray-500" />
  }

  return (
    <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-30 p-4">
      <Card
        className={`bg-gradient-to-b from-gray-900 to-black border-red-500 border-2 shadow-2xl shadow-red-500/20 ${
          isMobile ? "w-full max-w-sm p-5" : "max-w-lg w-full p-6"
        }`}
      >
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className={`font-bold text-red-400 ${isMobile ? "text-2xl" : "text-3xl"}`}>MISSION FAILED</h1>
            <p className="text-gray-400">Your ship has been destroyed</p>
          </div>

          <div className="bg-black/60 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Final Score:</span>
              <span className={`font-bold text-cyan-400 ${isMobile ? "text-xl" : "text-2xl"}`}>
                {score.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Wave Reached:</span>
              <span className={`font-bold text-purple-400 ${isMobile ? "text-lg" : "text-xl"}`}>{wave}</span>
            </div>
            {rank && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Global Rank:</span>
                <span className={`font-bold text-green-400 ${isMobile ? "text-lg" : "text-xl"}`}>#{rank}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className={`font-semibold text-gray-300 ${isMobile ? "text-base" : "text-lg"}`}>Leaderboard</h3>
            {isLoading ? (
              <div className="text-gray-500">Loading scores...</div>
            ) : (
              <div className={`space-y-2 overflow-y-auto ${isMobile ? "max-h-32" : "max-h-40"}`}>
                {highScores.slice(0, 5).map((highScore, index) => (
                  <div key={highScore.id} className="flex items-center justify-between bg-black/40 rounded px-3 py-2">
                    <div className="flex items-center gap-2">
                      {getRankIcon(index + 1)}
                      <span className={`text-gray-300 font-medium ${isMobile ? "text-xs" : "text-sm"}`}>
                        {highScore.player_name}
                      </span>
                    </div>
                    <div className={`flex items-center gap-3 ${isMobile ? "text-xs" : "text-sm"}`}>
                      <span className="text-cyan-400">{highScore.score.toLocaleString()}</span>
                      <span className="text-purple-400">W{highScore.wave}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={onRestart}
            className={`w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              isMobile ? "py-4 text-lg" : "py-3"
            }`}
          >
            Try Again
          </Button>
        </div>
      </Card>
    </div>
  )
}
