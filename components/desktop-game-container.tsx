"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { X, Maximize2, Minimize2, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import EnhancedGameRenderer from "@/components/pvp-game/enhanced-game-renderer"
import { useIsMobile } from "@/components/ui/use-mobile"

interface DesktopGameContainerProps {
  gameId: string
  playerId: string
  playerName: string
  isHost: boolean
  gameMode: string
  onGameEnd: () => void
  joystickInput?: { x: number; y: number }
  actionInput?: { action: string; pressed: boolean } | null
  children?: React.ReactNode
}

export default function DesktopGameContainer({
  gameId,
  playerId,
  playerName,
  isHost,
  gameMode,
  onGameEnd,
  joystickInput,
  actionInput,
  children,
}: DesktopGameContainerProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"
  const isMobile = useIsMobile()

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
  }, [isMuted])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const containerClass = cn(
    "relative w-full h-screen overflow-hidden",
    isCyberpunk
      ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      : "bg-gradient-to-br from-blue-50 to-indigo-100",
  )

  const headerClass = cn(
    "absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4",
    isCyberpunk ? "bg-black/80 border-b border-cyan-500/30" : "bg-white/90 border-b border-gray-200",
  )

  const titleClass = cn("text-xl font-bold font-mono", isCyberpunk ? "text-cyan-400" : "text-gray-900")

  const buttonClass = cn(
    "p-2 rounded-lg transition-all duration-200",
    isCyberpunk
      ? "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50"
      : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300",
  )

  return (
    <div ref={containerRef} className={containerClass}>
      {/* Header */}
      <div className={headerClass}>
        <div className="flex items-center gap-4">
          <h1 className={titleClass}>{gameId === "archer-arena" ? "Archer Arena" : gameId}</h1>
          <div
            className={cn(
              "px-2 py-1 rounded text-sm font-mono",
              isCyberpunk ? "bg-cyan-500/20 text-cyan-300" : "bg-blue-100 text-blue-800",
            )}
          >
            {isMobile ? "MOBILE MODE" : "DESKTOP MODE"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleMute} className={buttonClass}>
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </Button>

          <Button variant="ghost" size="sm" onClick={toggleFullscreen} className={buttonClass}>
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onGameEnd}
            className={cn(buttonClass, "hover:bg-red-500/20 hover:text-red-400")}
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Game Content */}
      <div className="absolute inset-0 pt-16">
        {children || (
          <EnhancedGameRenderer
            gameId={gameId}
            playerId={playerId}
            playerName={playerName}
            isHost={isHost}
            gameMode={gameMode}
            onGameEnd={onGameEnd}
            joystickInput={joystickInput}
            actionInput={actionInput}
            isMuted={isMuted}
          />
        )}
      </div>

      {/* Demo Watermark */}
      <div className="absolute bottom-4 left-4 z-50">
        <div
          className={cn(
            "px-3 py-1 rounded text-xs font-mono opacity-70",
            isCyberpunk
              ? "bg-black/60 text-cyan-400 border border-cyan-500/30"
              : "bg-white/80 text-gray-600 border border-gray-300",
          )}
        >
          DEMO GAME : DOES NOT REPRESENT FINAL PRODUCT
        </div>
      </div>
    </div>
  )
}
