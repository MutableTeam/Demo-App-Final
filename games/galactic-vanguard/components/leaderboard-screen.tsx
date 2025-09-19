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

  const lightButtonStyle =
    "bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"

  return (
    <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-30 p-4 overflow-hidden">
      <Card
        className={cn(
          "bg-gradient-to-b from-gray-900 to-black border-cyan-500 border-2 shadow-2xl shadow-cyan-500/20",
          isMobile ? "w-full max-w-sm max-h-[85vh] flex flex-col my-8" : "max-w-2xl w-full p-6",
        )}
      >
        <CardHeader className={cn("text-center space-y-4 flex-shrink-0", isMobile ? "py-4" : "")}>
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle
            className={cn(
              "font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent",
              isMobile ? "text-xl" : "text-2xl",
            )}
          >
            TOP PILOTS LEADERBOARD
          </CardTitle>
          <p className="text-gray-400 text-sm">
            {highScores.length > 0 ? "Current top performers" : "Be the first to set a record!"}
          </p>
        </CardHeader>

        <CardContent className={cn("space-y-4", isMobile ? "flex-1 overflow-hidden px-4 pb-4" : "")}>
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">Loading leaderboard...</div>
          ) : highScores.length === 0 ? (
            <div className="text-center text-gray-400 py-8 space-y-2">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-lg font-semibold">No scores yet!</p>
              <p className="text-sm">Be the first pilot to make it onto the leaderboard.</p>
            </div>
          ) : (
            <div
              className={cn(
                "space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent",
                isMobile ? "flex-1 pr-2" : "max-h-80",
              )}
            >
              {highScores.map((highScore, index) => (
                <div
                  key={highScore.id}
                  className={cn(
                    "flex items-center bg-black/40 rounded-lg p-3 border",
                    index < 3 ? "border-cyan-500/30" : "border-gray-700/30",
                    isMobile ? "flex-col gap-2" : "justify-between",
                  )}
                >
                  <div className={cn("flex items-center gap-3", isMobile ? "w-full" : "")}>
                    {getRankIcon(index + 1)}
                    <div className={cn("flex-1", isMobile ? "min-w-0" : "")}>
                      <div className={cn("font-medium text-gray-300 truncate", isMobile ? "text-sm" : "text-base")}>
                        {highScore.player_name}
                      </div>
                      <div className="text-xs text-gray-500">{new Date(highScore.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "flex text-right",
                      isMobile ? "flex-col gap-1 w-full items-center" : "items-center gap-4",
                    )}
                  >
                    <div className={cn("flex items-center gap-1", isMobile ? "text-xs" : "flex-col items-end")}>
                      <div className={cn("font-bold text-cyan-400", isMobile ? "text-xs" : "text-base")}>
                        {highScore.score.toLocaleString()}
                      </div>
                      {!isMobile && <div className="text-xs text-gray-500">SCORE</div>}
                      {isMobile && <span className="text-gray-500">pts</span>}
                    </div>

                    <div className={cn("flex items-center gap-1", isMobile ? "text-xs" : "flex-col items-end")}>
                      <Zap className="w-3 h-3" />
                      <div className={cn("font-bold text-purple-400", isMobile ? "text-xs" : "text-base")}>
                        {highScore.wave}
                      </div>
                      {!isMobile && <div className="text-xs text-gray-500">WAVE</div>}
                      {isMobile && <span className="text-gray-500">wave</span>}
                    </div>

                    <div className={cn("flex items-center gap-1", isMobile ? "text-xs" : "flex-col items-end")}>
                      <Clock className="w-3 h-3" />
                      <div className={cn("font-bold text-green-400", isMobile ? "text-xs" : "text-base")}>
                        {formatDuration(highScore.play_duration)}
                      </div>
                      {!isMobile && <div className="text-xs text-gray-500">TIME</div>}
                      {isMobile && <span className="text-gray-500">time</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={cn("flex gap-3 pt-4 flex-shrink-0", isMobile ? "flex-col-reverse mt-4" : "flex-row")}>
            <Button
              onClick={onContinue}
              className={cn(
                "flex-1 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/30 transition-all duration-300",
                isMobile ? "py-3 text-base" : "py-2",
              )}
            >
              CONTINUE
            </Button>

            <Button
              onClick={onBack}
              className={cn(
                "flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all duration-300",
                isMobile ? "py-3 text-base" : "py-2",
              )}
            >
              BACK
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
