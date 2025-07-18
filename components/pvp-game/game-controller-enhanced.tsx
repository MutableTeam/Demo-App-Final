"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, RotateCcw, Zap, Heart, Gamepad2, Monitor, Smartphone } from "lucide-react"
import { usePlatform } from "@/contexts/platform-context"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import GameContainer from "@/components/game-container"

interface GameStats {
  health: number
  maxHealth: number
  energy: number
  maxEnergy: number
  score: number
  level: number
}

interface GameControllerEnhancedProps {
  gameId: string
  onGameStart?: () => void
  onGamePause?: () => void
  onGameReset?: () => void
  stats?: GameStats
  isPlaying?: boolean
}

export default function GameControllerEnhanced({
  gameId,
  onGameStart,
  onGamePause,
  onGameReset,
  stats = {
    health: 100,
    maxHealth: 100,
    energy: 75,
    maxEnergy: 100,
    score: 1250,
    level: 3,
  },
  isPlaying = false,
}: GameControllerEnhancedProps) {
  const { platformType, isDesktop, isMobile } = usePlatform()
  const { styleMode } = useCyberpunkTheme()
  const gameCanvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused">("idle")

  const isCyberpunk = styleMode === "cyberpunk"

  // Platform-specific control setup
  useEffect(() => {
    if (!gameCanvasRef.current) return

    const canvas = gameCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Platform-specific event listeners
    if (isDesktop) {
      // Desktop: Keyboard and mouse controls
      const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key.toLowerCase()) {
          case "w":
          case "arrowup":
            // Move up
            break
          case "s":
          case "arrowdown":
            // Move down
            break
          case "a":
          case "arrowleft":
            // Move left
            break
          case "d":
          case "arrowright":
            // Move right
            break
          case " ":
            e.preventDefault()
            // Shoot/Action
            break
        }
      }

      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        // Handle mouse movement for aiming
      }

      const handleMouseClick = (e: MouseEvent) => {
        // Handle shooting/actions
      }

      window.addEventListener("keydown", handleKeyDown)
      canvas.addEventListener("mousemove", handleMouseMove)
      canvas.addEventListener("click", handleMouseClick)

      return () => {
        window.removeEventListener("keydown", handleKeyDown)
        canvas.removeEventListener("mousemove", handleMouseMove)
        canvas.removeEventListener("click", handleMouseClick)
      }
    } else {
      // Mobile: Touch controls
      const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault()
        const touch = e.touches[0]
        const rect = canvas.getBoundingClientRect()
        const x = touch.clientX - rect.left
        const y = touch.clientY - rect.top
        // Handle touch start
      }

      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        const touch = e.touches[0]
        const rect = canvas.getBoundingClientRect()
        const x = touch.clientX - rect.left
        const y = touch.clientY - rect.top
        // Handle touch movement
      }

      const handleTouchEnd = (e: TouchEvent) => {
        e.preventDefault()
        // Handle touch end
      }

      canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
      canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
      canvas.addEventListener("touchend", handleTouchEnd, { passive: false })

      return () => {
        canvas.removeEventListener("touchstart", handleTouchStart)
        canvas.removeEventListener("touchmove", handleTouchMove)
        canvas.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [isDesktop, isMobile])

  const handleGameStart = () => {
    setGameState("playing")
    onGameStart?.()
  }

  const handleGamePause = () => {
    setGameState("paused")
    onGamePause?.()
  }

  const handleGameReset = () => {
    setGameState("idle")
    onGameReset?.()
  }

  return (
    <GameContainer title={`Game: ${gameId}`}>
      <div className="w-full h-full flex flex-col">
        {/* Game Stats Header */}
        <div
          className={`p-4 border-b ${
            isCyberpunk
              ? "bg-gradient-to-r from-slate-900/90 to-purple-900/90 border-cyan-500/30"
              : "bg-muted/50 border-border"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Heart className={`h-5 w-5 ${isCyberpunk ? "text-red-400" : "text-red-500"}`} />
                <div className="space-y-1">
                  <div className={`text-sm font-medium ${isCyberpunk ? "text-cyan-300 font-mono" : "text-foreground"}`}>
                    Health
                  </div>
                  <Progress
                    value={(stats.health / stats.maxHealth) * 100}
                    className={`w-20 h-2 ${isCyberpunk ? "bg-slate-700" : "bg-muted"}`}
                  />
                </div>
                <span className={`text-sm ${isCyberpunk ? "text-cyan-300 font-mono" : "text-muted-foreground"}`}>
                  {stats.health}/{stats.maxHealth}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Zap className={`h-5 w-5 ${isCyberpunk ? "text-yellow-400" : "text-yellow-500"}`} />
                <div className="space-y-1">
                  <div className={`text-sm font-medium ${isCyberpunk ? "text-cyan-300 font-mono" : "text-foreground"}`}>
                    Energy
                  </div>
                  <Progress
                    value={(stats.energy / stats.maxEnergy) * 100}
                    className={`w-20 h-2 ${isCyberpunk ? "bg-slate-700" : "bg-muted"}`}
                  />
                </div>
                <span className={`text-sm ${isCyberpunk ? "text-cyan-300 font-mono" : "text-muted-foreground"}`}>
                  {stats.energy}/{stats.maxEnergy}
                </span>
              </div>
            </div>

            {/* Right Stats */}
            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className={`${
                  isCyberpunk
                    ? "border-cyan-500/50 text-cyan-400 bg-cyan-500/10 font-mono"
                    : "border-primary/20 text-primary bg-primary/10"
                }`}
              >
                Level {stats.level}
              </Badge>
              <div className={`text-lg font-bold ${isCyberpunk ? "text-cyan-400 font-mono" : "text-foreground"}`}>
                Score: {stats.score.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="flex-1 relative bg-black">
          <canvas ref={gameCanvasRef} className="w-full h-full" style={{ minHeight: "400px" }} />

          {/* Game State Overlay */}
          {gameState !== "playing" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Card
                className={`${
                  isCyberpunk
                    ? "bg-gradient-to-br from-slate-900/90 to-purple-900/90 border-cyan-500/30"
                    : "bg-card border-border"
                }`}
              >
                <CardHeader className="text-center">
                  <CardTitle
                    className={`flex items-center justify-center gap-2 ${
                      isCyberpunk ? "text-cyan-400 font-mono" : "text-foreground"
                    }`}
                  >
                    <Gamepad2 className="h-6 w-6" />
                    {gameState === "idle" ? "Ready to Play" : "Game Paused"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    {gameState === "idle" ? (
                      <Button onClick={handleGameStart} className="flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        Start Game
                      </Button>
                    ) : (
                      <Button onClick={handleGameStart} className="flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    <Button onClick={handleGameReset} variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Control Hints */}
        <div
          className={`p-3 border-t ${
            isCyberpunk
              ? "bg-gradient-to-r from-slate-900/90 to-purple-900/90 border-cyan-500/30"
              : "bg-muted/50 border-border"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isDesktop ? (
                <>
                  <Monitor className={`h-4 w-4 ${isCyberpunk ? "text-cyan-400" : "text-primary"}`} />
                  <span className={`text-sm ${isCyberpunk ? "text-cyan-300 font-mono" : "text-muted-foreground"}`}>
                    WASD/Arrows: Move • Mouse: Aim • Click: Shoot • Space: Action
                  </span>
                </>
              ) : (
                <>
                  <Smartphone className={`h-4 w-4 ${isCyberpunk ? "text-cyan-400" : "text-primary"}`} />
                  <span className={`text-sm ${isCyberpunk ? "text-cyan-300 font-mono" : "text-muted-foreground"}`}>
                    Touch: Move • Tap: Shoot • Hold: Aim
                  </span>
                </>
              )}
            </div>

            {gameState === "playing" && (
              <Button onClick={handleGamePause} variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            )}
          </div>
        </div>
      </div>
    </GameContainer>
  )
}
