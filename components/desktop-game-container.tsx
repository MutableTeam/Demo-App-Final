"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Maximize2, Minimize2, Volume2, VolumeX, Monitor, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import EnhancedGameRenderer from "@/components/pvp-game/enhanced-game-renderer"
import { useIsMobile } from "@/components/ui/use-mobile"
import { usePlatform } from "@/contexts/platform-context"
import GameErrorBoundary from "@/components/game-error-boundary"

interface DesktopGameContainerProps {
  gameId: string
  playerId: string
  playerName: string
  isHost: boolean
  gameMode: string
  onGameEnd: (winner?: string | null) => void
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
  const { platformType } = usePlatform()
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
    isCyberpunk
      ? "bg-black/80 border-b border-cyan-500/30 backdrop-blur-sm"
      : "bg-white/90 border-b border-gray-200 backdrop-blur-sm",
  )

  const titleClass = cn("text-xl font-bold font-mono", isCyberpunk ? "text-cyan-400" : "text-gray-900")

  const buttonClass = cn(
    "p-2 rounded-lg transition-all duration-200",
    isCyberpunk
      ? "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50"
      : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300",
  )

  const badgeClass = cn(
    "flex items-center gap-1",
    isCyberpunk ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50" : "bg-blue-100 text-blue-800 border-blue-300",
  )

  const getGameTitle = (gameId: string) => {
    switch (gameId) {
      case "archer-arena":
        return "Archer Arena"
      case "last-stand":
        return "Last Stand"
      case "pixel-pool":
        return "Pixel Pool"
      case "top-down-shooter":
        return "Top Down Shooter"
      default:
        return gameId.charAt(0).toUpperCase() + gameId.slice(1)
    }
  }

  return (
    <div ref={containerRef} className={containerClass}>
      {/* Header */}
      <div className={headerClass}>
        <div className="flex items-center gap-4">
          <h1 className={titleClass}>{getGameTitle(gameId)}</h1>
          <Badge variant="outline" className={badgeClass}>
            {platformType === "desktop" ? (
              <>
                <Monitor className="h-3 w-3" />
                Desktop Mode
              </>
            ) : (
              <>
                <Smartphone className="h-3 w-3" />
                Mobile Mode
              </>
            )}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleMute} className={buttonClass}>
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </Button>

          {!isMobile && (
            <Button variant="ghost" size="sm" onClick={toggleFullscreen} className={buttonClass}>
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onGameEnd(null)}
            className={cn(buttonClass, "hover:bg-red-500/20 hover:text-red-400")}
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Demo Banner */}
      <div className="absolute top-16 left-0 right-0 z-40">
        <div
          className={cn(
            "w-full text-center py-2 text-sm font-mono font-bold",
            isCyberpunk
              ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border-b border-cyan-500/30"
              : "bg-yellow-100 text-yellow-800 border-b border-yellow-300",
          )}
        >
          DEMO GAME : DOES NOT REPRESENT FINAL PRODUCT
        </div>
      </div>

      {/* Game Content */}
      <div className="absolute inset-0 pt-24">
        <GameErrorBoundary>
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
        </GameErrorBoundary>
      </div>
    </div>
  )
}

// Export as named export for compatibility
export { DesktopGameContainer }
