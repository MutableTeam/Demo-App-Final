"use client"

import type React from "react"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Monitor, Smartphone, Settings, X } from "lucide-react"
import { usePlatform } from "@/contexts/platform-context"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { PlatformSelector } from "@/components/platform-selector"

interface GameContainerProps {
  children: React.ReactNode
  title?: string
  showPlatformInfo?: boolean
}

export default function GameContainer({ children, title = "Game", showPlatformInfo = true }: GameContainerProps) {
  const { platformType, isDesktop, isMobile } = usePlatform()
  const { styleMode } = useCyberpunkTheme()
  const [showSettings, setShowSettings] = useState(false)

  const isCyberpunk = styleMode === "cyberpunk"

  if (showSettings) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl">
          <Button
            onClick={() => setShowSettings(false)}
            variant="outline"
            size="icon"
            className="absolute -top-12 right-0 z-10"
          >
            <X className="h-4 w-4" />
          </Button>
          <PlatformSelector onPlatformSelected={() => setShowSettings(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      {/* Platform Info Banner */}
      {showPlatformInfo && (
        <div
          className={`flex items-center justify-between p-3 border-b ${
            isCyberpunk
              ? "bg-gradient-to-r from-slate-900/90 to-purple-900/90 border-cyan-500/30"
              : "bg-muted/50 border-border"
          }`}
        >
          <div className="flex items-center gap-3">
            {isDesktop ? (
              <Monitor className={`h-5 w-5 ${isCyberpunk ? "text-cyan-400" : "text-primary"}`} />
            ) : (
              <Smartphone className={`h-5 w-5 ${isCyberpunk ? "text-cyan-400" : "text-primary"}`} />
            )}
            <span className={`text-sm font-medium ${isCyberpunk ? "text-cyan-300 font-mono" : "text-foreground"}`}>
              {platformType.charAt(0).toUpperCase() + platformType.slice(1)} Mode
            </span>
            <Badge
              variant="outline"
              className={`text-xs ${
                isCyberpunk
                  ? "border-cyan-500/50 text-cyan-400 bg-cyan-500/10"
                  : "border-primary/20 text-primary bg-primary/10"
              }`}
            >
              {isDesktop ? "Keyboard + Mouse" : "Touch Controls"}
            </Badge>
          </div>

          <Button
            onClick={() => setShowSettings(true)}
            variant="ghost"
            size="sm"
            className={`text-xs ${
              isCyberpunk
                ? "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings className="h-4 w-4 mr-1" />
            Change Platform
          </Button>
        </div>
      )}

      {/* Game Content */}
      <div className="w-full h-full">{children}</div>
    </div>
  )
}
