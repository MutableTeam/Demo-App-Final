"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Star, Clock, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface LeaderboardScreenProps {
  onContinue: () => void
  onBack: () => void
  isCyberpunk?: boolean
  isMobile?: boolean
}

interface HighScore {
  id: number
  player_name: string
  score: number
  wave: number
  play_duration: number
  created_at: string
}

export default function LeaderboardScreen({ onContinue, onBack, isCyberpunk, isMobile }: LeaderboardScreenProps) {
  const [highScores, setHighScores] = useState<HighScore[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadHighScores = async () => {
      try {
        const limit = isMobile ? 5 : 10
        const response = await fetch(`/api/galactic-vanguard-highscores?limit=${limit}`)
        if (response.ok) {
          const data = await response.json()
          setHighScores(data.highScores || [])
        }
      } catch (error) {
        console.error("Error loading high scores:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHighScores()
  }, [isMobile])

  const getRankIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (position === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (position === 3) return <Medal className="w-5 h-5 text-orange-600" />
    return <Star className="w-4 h-4 text-gray-500" />
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (isMobile) {
    return (
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-30 flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-4 pt-6 pb-4 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent leading-tight">
            TOP PILOTS
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {highScores.length > 0 ? "Current top performers" : "Be the first to set a record!"}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 px-4 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">Loading leaderboard...</div>
          ) : highScores.length === 0 ? (
            <div className="text-center text-gray-400 py-8 space-y-2">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-lg font-semibold">No scores yet!</p>
              <p className="text-sm">Be the first pilot to make it onto the leaderboard.</p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {highScores.map((highScore, index) => (
                <div
                  key={highScore.id}
                  className={cn(
                    "bg-black/40 rounded-lg border p-3",
                    index < 3 ? "border-cyan-500/30" : "border-gray-700/30",
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {getRankIcon(index + 1)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-300 truncate text-sm">{highScore.player_name}</div>
                      <div className="text-xs text-gray-500">{new Date(highScore.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs">
                    <div className="text-center">
                      <div className="font-bold text-cyan-400">{highScore.score.toLocaleString()}</div>
                      <div className="text-gray-500">SCORE</div>
                    </div>

                    <div className="text-center">
                      <div className="font-bold text-purple-400 flex items-center justify-center gap-1">
                        <Zap className="w-3 h-3" />
                        {highScore.wave}
                      </div>
                      <div className="text-gray-500">WAVE</div>
                    </div>

                    <div className="text-center">
                      <div className="font-bold text-green-400 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(highScore.play_duration)}
                      </div>
                      <div className="text-gray-500">TIME</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fixed Footer Buttons */}
        <div className="flex-shrink-0 p-4 space-y-3">
          <Button
            onClick={onContinue}
            className="w-full py-3 text-base bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/30 transition-all duration-300"
          >
            CONTINUE
          </Button>

          <Button
            onClick={onBack}
            className="w-full py-3 text-base bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all duration-300"
          >
            BACK
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-30 p-8">
      <Card className="bg-gradient-to-b from-gray-900 to-black border-cyan-500 border-2 shadow-2xl shadow-cyan-500/20 max-w-4xl w-full">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            TOP PILOTS LEADERBOARD
          </CardTitle>
          <p className="text-gray-400 text-lg">
            {highScores.length > 0 ? "Current top performers" : "Be the first to set a record!"}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="text-center text-gray-500 py-12 text-xl">Loading leaderboard...</div>
          ) : highScores.length === 0 ? (
            <div className="text-center text-gray-400 py-12 space-y-4">
              <Trophy className="w-20 h-20 text-gray-600 mx-auto mb-6" />
              <p className="text-2xl font-semibold">No scores yet!</p>
              <p className="text-lg">Be the first pilot to make it onto the leaderboard.</p>
            </div>
          ) : (
            <div className="grid gap-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent pr-2">
              {highScores.map((highScore, index) => (
                <div
                  key={highScore.id}
                  className={cn(
                    "flex items-center justify-between bg-black/40 rounded-lg border p-4 hover:bg-black/60 transition-colors",
                    index < 3 ? "border-cyan-500/30" : "border-gray-700/30",
                  )}
                >
                  <div className="flex items-center gap-4">
                    {getRankIcon(index + 1)}
                    <div>
                      <div className="font-medium text-gray-300 text-lg">{highScore.player_name}</div>
                      <div className="text-sm text-gray-500">{new Date(highScore.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="font-bold text-cyan-400 text-xl">{highScore.score.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">SCORE</div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-purple-400 text-xl flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        {highScore.wave}
                      </div>
                      <div className="text-sm text-gray-500">WAVE</div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-green-400 text-xl flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatDuration(highScore.play_duration)}
                      </div>
                      <div className="text-sm text-gray-500">TIME</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4 pt-6">
            <Button
              onClick={onContinue}
              className="flex-1 py-3 text-lg bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/30 transition-all duration-300"
            >
              CONTINUE TO GAME
            </Button>

            <Button
              onClick={onBack}
              className="flex-1 py-3 text-lg bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all duration-300"
            >
              BACK TO MODES
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
