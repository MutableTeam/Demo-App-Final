"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Square, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"

interface GameContainerProps {
  gameId: string
  playerId: string
  playerName: string
  isHost: boolean
  gameMode: string
  onGameEnd: () => void
  children: React.ReactNode
}

export function GameContainer({
  gameId,
  playerId,
  playerName,
  isHost,
  gameMode,
  onGameEnd,
  children,
}: GameContainerProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize game container
    setIsPlaying(true)
  }, [gameId, playerId])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleStop = () => {
    setIsPlaying(false)
    onGameEnd()
  }

  const handleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full min-h-[600px] rounded-lg border-2 overflow-hidden",
        isCyberpunk
          ? "bg-black/90 border-cyan-500/50 shadow-[0_0_20px_rgba(0,255,255,0.3)]"
          : "bg-white border-amber-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      )}
    >
      {/* Game Header */}
      <div
        className={cn(
          "flex items-center justify-between p-4 border-b-2",
          isCyberpunk ? "bg-black/80 border-cyan-500/30 text-cyan-300" : "bg-[#FFD54F] border-black text-black",
        )}
      >
        <div className="flex items-center gap-4">
          <Badge
            variant="outline"
            className={cn(
              "font-mono",
              isCyberpunk ? "border-cyan-500/50 text-cyan-400 bg-black/50" : "border-black bg-white text-black",
            )}
          >
            {gameId.toUpperCase()}
          </Badge>
          <span className="font-mono text-sm">
            {playerName} {isHost && "(Host)"}
          </span>
          <Badge
            className={cn(
              "font-mono",
              isCyberpunk ? "bg-purple-500/30 text-purple-300" : "bg-orange-200 text-orange-800",
            )}
          >
            {gameMode.toUpperCase()}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlayPause}
            className={cn(
              "h-8 w-8 p-0",
              isCyberpunk ? "text-cyan-400 hover:bg-cyan-500/20" : "text-black hover:bg-amber-200",
            )}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleStop}
            className={cn(
              "h-8 w-8 p-0",
              isCyberpunk ? "text-red-400 hover:bg-red-500/20" : "text-red-600 hover:bg-red-100",
            )}
          >
            <Square className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleMute}
            className={cn(
              "h-8 w-8 p-0",
              isCyberpunk ? "text-cyan-400 hover:bg-cyan-500/20" : "text-black hover:bg-amber-200",
            )}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleFullscreen}
            className={cn(
              "h-8 w-8 p-0",
              isCyberpunk ? "text-cyan-400 hover:bg-cyan-500/20" : "text-black hover:bg-amber-200",
            )}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Game Content */}
      <div
        className={cn(
          "relative w-full h-full min-h-[500px] overflow-hidden",
          isCyberpunk
            ? "bg-gradient-to-br from-slate-900 to-purple-900"
            : "bg-gradient-to-br from-amber-50 to-orange-100",
        )}
      >
        {children}
      </div>
    </div>
  )
}
