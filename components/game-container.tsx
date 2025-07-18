"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Monitor, Smartphone, Maximize2, Minimize2, RotateCcw } from "lucide-react"
import { usePlatform } from "@/contexts/platform-context"
import { cn } from "@/lib/utils"
import type { GameInterface } from "@/types/game-interface"

interface GameContainerProps {
  game: GameInterface
  onClose?: () => void
  className?: string
}

export default function GameContainer({ game, onClose, className }: GameContainerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const { platformType } = usePlatform()

  useEffect(() => {
    // Simulate game loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  const handleReset = () => {
    setIsLoading(true)
    // Simulate game reset
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div
      ref={containerRef}
      className={cn("w-full max-w-6xl mx-auto", isFullscreen && "fixed inset-0 z-50 max-w-none", className)}
    >
      <Card
        className={cn(
          "overflow-hidden transition-all duration-300",
          isFullscreen ? "h-screen rounded-none" : "min-h-[600px]",
          "bg-gradient-to-br from-background to-muted/30",
        )}
      >
        <CardHeader
          className={cn(
            "flex flex-row items-center justify-between space-y-0 pb-4",
            "bg-gradient-to-r from-primary/10 to-primary/5 border-b",
          )}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img
                src={game.thumbnail || "/placeholder.svg"}
                alt={game.title}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <CardTitle className="text-xl font-bold">{game.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {game.category}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs flex items-center gap-1",
                      platformType === "desktop"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                    )}
                  >
                    {platformType === "desktop" ? (
                      <>
                        <Monitor className="w-3 h-3" />
                        Desktop Mode
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-3 h-3" />
                        Mobile Mode
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="h-8 bg-transparent">
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>

            <Button variant="outline" size="sm" onClick={toggleFullscreen} className="h-8 bg-transparent">
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 mr-1" />
                  Exit
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 mr-1" />
                  Fullscreen
                </>
              )}
            </Button>

            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose} className="h-8 bg-transparent">
                Close
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className={cn("p-0 relative", isFullscreen ? "h-[calc(100vh-80px)]" : "min-h-[500px]")}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="space-y-2">
                  <p className="text-lg font-semibold">Loading {game.title}...</p>
                  <p className="text-sm text-muted-foreground">Optimizing for {platformType} experience</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full">
              {/* Game component will be rendered here */}
              <game.component
                platformType={platformType}
                isFullscreen={isFullscreen}
                onGameStateChange={(state) => {
                  console.log("Game state changed:", state)
                }}
              />
            </div>
          )}

          {/* Platform-specific controls overlay */}
          {!isLoading && (
            <div className="absolute bottom-4 right-4 z-10">
              <Card className="bg-background/80 backdrop-blur-sm border-primary/20">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">
                    {platformType === "desktop" ? (
                      <div className="space-y-1">
                        <div>WASD: Move</div>
                        <div>Mouse: Aim</div>
                        <div>Space: Action</div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div>Tap: Move/Shoot</div>
                        <div>Hold: Aim</div>
                        <div>Swipe: Special</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
