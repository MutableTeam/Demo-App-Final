"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
  onActionPress: (action: string, pressed: boolean) => void
}

interface ActionButtonProps {
  label: string
  action: string
  onPress: (action: string, pressed: boolean) => void
  className?: string
  title?: string
}

function ActionButton({ label, action, onPress, className, title }: ActionButtonProps) {
  const handleInteractionStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onPress(action, true)
  }

  const handleInteractionEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onPress(action, false)
  }

  return (
    <button
      className={cn(
        "w-20 h-20 rounded-full border-2 flex items-center justify-center font-mono text-3xl font-bold transition-all duration-150",
        "touch-none select-none active:scale-95",
        "bg-zinc-800/80 border-zinc-600/90 text-zinc-200 active:bg-zinc-700/90 shadow-lg backdrop-blur-sm",
        className,
      )}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      onMouseDown={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd}
      title={title}
      style={{ WebkitUserSelect: "none", userSelect: "none" }}
    >
      {label}
    </button>
  )
}

export default function MobileGameContainer({ children, className, onActionPress }: MobileGameContainerProps) {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")

  useEffect(() => {
    const handleOrientationChange = () => {
      const currentOrientation = window.matchMedia("(orientation: landscape)").matches ? "landscape" : "portrait"
      setOrientation(currentOrientation)
    }
    handleOrientationChange()
    window.addEventListener("resize", handleOrientationChange)
    return () => window.removeEventListener("resize", handleOrientationChange)
  }, [])

  const isLandscape = orientation === "landscape"

  return (
    <div
      className={cn("fixed inset-0 bg-zinc-900 flex items-center justify-center font-mono text-zinc-400", className)}
    >
      <div className={cn("w-full h-full flex", isLandscape ? "flex-row" : "flex-col")}>
        {/* Game Screen - takes up most of the space */}
        <div className={cn("flex items-center justify-center", isLandscape ? "w-3/4 h-full" : "w-full h-3/4")}>
          <div className="w-full h-full bg-black/70 border-2 border-zinc-700 relative overflow-hidden">{children}</div>
        </div>

        {/* Action Controls */}
        <div className={cn("flex items-center justify-center p-4", isLandscape ? "w-1/4 h-full" : "w-full h-1/4")}>
          <div className="flex flex-col items-center justify-center gap-4">
            <span className="text-sm tracking-widest font-bold text-zinc-300">ACTIONS</span>
            <div className="grid grid-cols-2 gap-4">
              <ActionButton label="🏹" action="shoot" onPress={onActionPress} title="Shoot Arrow" />
              <ActionButton label="⚡" action="special" onPress={onActionPress} title="Special Attack" />
              <ActionButton label="💨" action="dash" onPress={onActionPress} title="Dash" />
              <ActionButton label="💥" action="explosive" onPress={onActionPress} title="Explosive Arrow" />
            </div>
            <span className="text-xs text-zinc-500">Tap for combat</span>
          </div>
        </div>
      </div>
    </div>
  )
}
