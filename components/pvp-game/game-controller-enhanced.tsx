"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Play, Pause, Square, RotateCcw, Settings, Users, Zap, Monitor, Smartphone, Gamepad2 } from "lucide-react"
import { usePlatform } from "@/contexts/platform-context"
import { cn } from "@/lib/utils"

interface GameStats {
  score: number
  level: number
  lives: number
  time: number
  multiplier: number
}

interface GameControllerEnhancedProps {
  gameId: string
  onGameStart: () => void
  onGamePause: () => void
  onGameStop: () => void
  onGameReset: () => void
  gameStats?: GameStats
  isPlaying?: boolean
  isPaused?: boolean
  className?: string
}

export default function GameControllerEnhanced({
  gameId,
  onGameStart,
  onGamePause,
  onGameStop,
  onGameReset,
  gameStats = { score: 0, level: 1, lives: 3, time: 0, multiplier: 1 },
  isPlaying = false,
  isPaused = false,
  className,
}: GameControllerEnhancedProps) {
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected")
  const [playersOnline, setPlayersOnline] = useState(0)
  const { platformType } = usePlatform()
  const gameLoopRef = useRef<NodeJS.Timeout>()

  // Simulate connection status
  useEffect(() => {
    if (isPlaying) {
      setConnectionStatus("connecting")
      const timer = setTimeout(() => {
        setConnectionStatus("connected")
        setPlayersOnline(Math.floor(Math.random() * 50) + 10)
      }, 1500)
      return () => clearTimeout(timer)
    } else {
      setConnectionStatus("disconnected")
      setPlayersOnline(0)
    }
  }, [isPlaying])

  // Game loop for time tracking
  useEffect(() => {
    if (isPlaying && !isPaused) {
      gameLoopRef.current = setInterval(() => {
        // Game loop logic would go here
      }, 100)
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [isPlaying, isPaused])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-500"
      case "connecting":
        return "text-yellow-500"
      default:
        return "text-red-500"
    }
  }

  const getPlatformControls = () => {
    if (platformType === "desktop") {
      return {
        primary: "WASD + Mouse",
        secondary: "Space/Enter",
        special: "Shift/Ctrl",
        hint: "Use keyboard and mouse for precise control",
      }
    } else {
      return {
        primary: "Touch & Drag",
        secondary: "Tap",
        special: "Long Press",
        hint: "Touch controls optimized for mobile",
      }
    }
  }

  const controls = getPlatformControls()

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-4", className)}>
      {/* Main Control Panel */}
      <Card className="bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-primary" />
              Game Controller
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "flex items-center gap-1",
                  platformType === "desktop"
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
                )}
              >
                {platformType === "desktop" ? (
                  <>
                    <Monitor className="w-3 h-3" />
                    Desktop
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3 h-3" />
                    Mobile
                  </>
                )}
              </Badge>
              <Badge variant="outline" className={getConnectionColor()}>
                <div className="w-2 h-2 rounded-full bg-current mr-1" />
                {connectionStatus}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Game Controls */}
          <div className="flex flex-wrap gap-3">
            {!isPlaying ? (
              <Button onClick={onGameStart} className="bg-green-600 hover:bg-green-700 text-white" size="lg">
                <Play className="w-4 h-4 mr-2" />
                Start Game
              </Button>
            ) : (
              <>
                <Button
                  onClick={isPaused ? onGameStart : onGamePause}
                  variant={isPaused ? "default" : "secondary"}
                  size="lg"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  )}
                </Button>
                <Button onClick={onGameStop} variant="destructive" size="lg">
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </>
            )}

            <Button onClick={onGameReset} variant="outline" size="lg">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          <Separator />

          {/* Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{gameStats.score.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{gameStats.level}</div>
              <div className="text-sm text-muted-foreground">Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{gameStats.lives}</div>
              <div className="text-sm text-muted-foreground">Lives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formatTime(gameStats.time)}</div>
              <div className="text-sm text-muted-foreground">Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{gameStats.multiplier}x</div>
              <div className="text-sm text-muted-foreground">Multiplier</div>
            </div>
          </div>

          <Separator />

          {/* Platform-Specific Controls Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-primary" />
              <span className="font-semibold">Controls ({platformType})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-foreground">Movement</div>
                <div className="text-muted-foreground">{controls.primary}</div>
              </div>
              <div>
                <div className="font-medium text-foreground">Action</div>
                <div className="text-muted-foreground">{controls.secondary}</div>
              </div>
              <div>
                <div className="font-medium text-foreground">Special</div>
                <div className="text-muted-foreground">{controls.special}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground italic">{controls.hint}</div>
          </div>

          {/* Online Status */}
          {connectionStatus === "connected" && (
            <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Online Players: {playersOnline}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600">Connected</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
