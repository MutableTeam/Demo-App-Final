"use client"

import { useState, useEffect } from "react"
import GameControllerEnhanced from "@/components/pvp-game/game-controller-enhanced"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { PlatformType } from "@/contexts/platform-context"

interface GameStats {
  score: number
  level: number
  lives: number
  time: number
  multiplier: number
}

interface TopDownShooterGameProps {
  playerId?: string
  playerName?: string
  platformType?: PlatformType
  gameMode?: string
  onGameEnd?: (winner: string | null) => void
}

export default function TopDownShooterGame({
  playerId = "player-1",
  playerName = "Player",
  platformType = "desktop",
  gameMode = "duel",
  onGameEnd,
}: TopDownShooterGameProps) {
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    level: 1,
    lives: 3,
    time: 0,
    multiplier: 1,
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [gameId] = useState(() => `game-${Date.now()}`)

  const handleGameStart = () => {
    setIsPlaying(true)
    setIsPaused(false)
  }

  const handleGamePause = () => {
    setIsPaused(!isPaused)
  }

  const handleGameStop = () => {
    setIsPlaying(false)
    setIsPaused(false)
    setGameStats({
      score: 0,
      level: 1,
      lives: 3,
      time: 0,
      multiplier: 1,
    })
  }

  const handleGameReset = () => {
    handleGameStop()
    setTimeout(() => {
      handleGameStart()
    }, 100)
  }

  const handleGameEnd = (winner: string | null) => {
    setIsPlaying(false)
    if (onGameEnd) {
      onGameEnd(winner)
    }
  }

  useEffect(() => {
    if (isPlaying && !isPaused) {
      const timer = setInterval(() => {
        setGameStats((prev) => ({
          ...prev,
          time: prev.time + 1,
        }))
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isPlaying, isPaused])

  return (
    <div className="w-full h-full min-h-[600px] bg-gray-900 relative">
      {/* Game Header */}
      <div className="absolute top-4 left-4 z-20">
        <Card className="bg-black/50 border-cyan-400/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-cyan-400 text-lg">Top-Down Shooter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-cyan-400 border-cyan-400/50">
                {gameMode.toUpperCase()}
              </Badge>
              <Badge variant={isPlaying ? "default" : "secondary"}>
                {isPlaying ? (isPaused ? "PAUSED" : "PLAYING") : "STOPPED"}
              </Badge>
            </div>
            <div className="text-sm text-white/80">
              <div>Score: {gameStats.score.toLocaleString()}</div>
              <div>Level: {gameStats.level}</div>
              <div>Lives: {gameStats.lives}</div>
              <div>
                Time: {Math.floor(gameStats.time / 60)}:{(gameStats.time % 60).toString().padStart(2, "0")}
              </div>
              {gameStats.multiplier > 1 && <div className="text-yellow-400">Multiplier: x{gameStats.multiplier}</div>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Controls */}
      <div className="absolute top-4 right-4 z-20">
        <div className="flex gap-2">
          {!isPlaying ? (
            <Button onClick={handleGameStart} className="bg-green-600 hover:bg-green-700">
              Start Game
            </Button>
          ) : (
            <>
              <Button onClick={handleGamePause} variant="outline">
                {isPaused ? "Resume" : "Pause"}
              </Button>
              <Button onClick={handleGameStop} variant="destructive">
                Stop
              </Button>
            </>
          )}
          <Button onClick={handleGameReset} variant="secondary">
            Reset
          </Button>
        </div>
      </div>

      {/* Game Controller */}
      <GameControllerEnhanced
        playerId={playerId}
        playerName={playerName}
        isHost={true}
        gameMode={gameMode}
        onGameEnd={handleGameEnd}
        useEnhancedPhysics={true}
        platformType={platformType}
        gameId={gameId}
        onGameStart={handleGameStart}
        onGamePause={handleGamePause}
        onGameStop={handleGameStop}
        onGameReset={handleGameReset}
        gameStats={gameStats}
        isPlaying={isPlaying}
        isPaused={isPaused}
        className="w-full h-full"
      />

      {/* Platform-specific instructions */}
      {platformType === "desktop" && (
        <div className="absolute bottom-4 left-4 z-20">
          <Card className="bg-black/50 border-white/20">
            <CardContent className="p-3">
              <div className="text-xs text-white/60">
                <div>WASD: Move</div>
                <div>Mouse: Aim & Shoot</div>
                <div>Space: Dash</div>
                <div>Shift: Special</div>
                <div>E: Explosive Arrow</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {platformType === "mobile" && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <Card className="bg-black/50 border-white/20">
            <CardContent className="p-3">
              <div className="text-xs text-white/60 text-center">
                <div>Left Joystick: Move</div>
                <div>Right Joystick: Aim & Shoot</div>
                <div>Action Buttons: Special Abilities</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
