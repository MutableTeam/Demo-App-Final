"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Settings,
  Users,
  Zap,
  Monitor,
  Smartphone,
  Gamepad2,
  Volume2,
  VolumeX,
} from "lucide-react"
import GameControllerEnhanced from "@/components/pvp-game/game-controller-enhanced"
import type { PlatformType } from "@/contexts/platform-context"
import { cn } from "@/lib/utils"

interface GameStats {
  score: number
  level: number
  lives: number
  time: number
  multiplier: number
}

interface DesktopGameContainerProps {
  gameId: string
  playerId: string
  playerName: string
  isHost: boolean
  gameMode: string
  onGameEnd: (winner?: string | null) => void
  platformType?: PlatformType
  className?: string
}

export default function DesktopGameContainer({
  gameId,
  playerId,
  playerName,
  isHost,
  gameMode,
  onGameEnd,
  platformType = "desktop",
  className,
}: DesktopGameContainerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    level: 1,
    lives: 3,
    time: 0,
    multiplier: 1,
  })

  const handleGameStart = useCallback(() => {
    setIsPlaying(true)
    setIsPaused(false)
  }, [])

  const handleGamePause = useCallback(() => {
    setIsPaused(!isPaused)
  }, [isPaused])

  const handleGameStop = useCallback(() => {
    setIsPlaying(false)
    setIsPaused(false)
    onGameEnd()
  }, [onGameEnd])

  const handleGameReset = useCallback(() => {
    setIsPlaying(false)
    setIsPaused(false)
    setGameStats({
      score: 0,
      level: 1,
      lives: 3,
      time: 0,
      multiplier: 1,
    })
  }, [])

  const handleGameEnd = useCallback(
    (winner?: string | null) => {
      setIsPlaying(false)
      setIsPaused(false)
      onGameEnd(winner)
    },
    [onGameEnd],
  )

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
  }, [isMuted])

  return (
    <div
      className={cn(
        "w-full h-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
        className,
      )}
    >
      {/* Header */}
      <Card className="m-4 bg-black/20 border-cyan-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-3 text-cyan-400">
              <Gamepad2 className="w-6 h-6" />
              Archer Arena - {gameMode.toUpperCase()}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                <Users className="w-3 h-3 mr-1" />
                Online
              </Badge>
              {platformType === "mobile" && (
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                  <Smartphone className="w-3 h-3 mr-1" />
                  Mobile
                </Badge>
              )}
              {platformType === "desktop" && (
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                  <Monitor className="w-3 h-3 mr-1" />
                  Desktop
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Game Stats */}
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-2xl text-cyan-400">{gameStats.score}</div>
              <div className="text-gray-400">Score</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-green-400">{gameStats.level}</div>
              <div className="text-gray-400">Level</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-red-400">{gameStats.lives}</div>
              <div className="text-gray-400">Lives</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-yellow-400">
                {Math.floor(gameStats.time / 60)}:{(gameStats.time % 60).toString().padStart(2, "0")}
              </div>
              <div className="text-gray-400">Time</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-purple-400 flex items-center justify-center gap-1">
                <Zap className="w-5 h-5" />
                {gameStats.multiplier}x
              </div>
              <div className="text-gray-400">Multiplier</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Controls */}
      <Card className="mx-4 mb-4 bg-black/20 border-cyan-500/30">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={isPlaying ? handleGamePause : handleGameStart}
                variant={isPlaying ? "secondary" : "default"}
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    {isPaused ? "Resume" : "Pause"}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Game
                  </>
                )}
              </Button>

              <Button onClick={handleGameStop} variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700">
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>

              <Button
                onClick={handleGameReset}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={toggleMute}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Area */}
      <div className="mx-4 mb-4">
        <Card className="bg-black/40 border-cyan-500/30 overflow-hidden">
          <CardContent className="p-0">
            <GameControllerEnhanced
              gameId={gameId}
              playerId={playerId}
              playerName={playerName}
              isHost={isHost}
              gameMode={gameMode}
              onGameEnd={handleGameEnd}
              platformType={platformType}
            />
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      {platformType === "desktop" && (
        <Card className="mx-4 bg-black/20 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-cyan-400">Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <h4 className="font-semibold text-cyan-400 mb-2">Movement</h4>
                <ul className="space-y-1">
                  <li>• WASD or Arrow Keys - Move</li>
                  <li>• Mouse - Aim</li>
                  <li>• Shift - Dash</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-cyan-400 mb-2">Combat</h4>
                <ul className="space-y-1">
                  <li>• Left Click - Shoot Arrow</li>
                  <li>• Right Click - Special Attack</li>
                  <li>• E - Explosive Arrow</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {platformType === "mobile" && (
        <Card className="mx-4 bg-black/20 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-cyan-400">Mobile Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-300 space-y-2">
              <p>• Use the left joystick to move your archer</p>
              <p>• Touch and drag on the right side to aim</p>
              <p>• Use action buttons for special abilities</p>
              <p>• Controls are optimized for touch input</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
