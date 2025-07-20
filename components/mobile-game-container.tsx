"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Joystick } from "react-joystick-component"
import { cn } from "@/lib/utils"
import { gameInputHandler } from "@/utils/game-input-handler"

interface ActionButtonProps {
  label: string
  action: string
  className?: string
  title?: string
}

function ActionButton({ label, action, className, title }: ActionButtonProps) {
  const handlePress = (pressed: boolean) => {
    gameInputHandler.handleActionPress(action, pressed)
  }

  const handleInteractionStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handlePress(true)
  }

  const handleInteractionEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handlePress(false)
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

export default function MobileGameContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
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

  const layoutStyles = {
    portrait: {
      container: "flex-col",
      left: "w-full h-1/3 flex-row",
      game: "w-full h-1/3",
      right: "w-full h-1/3 flex-row",
    },
    landscape: {
      container: "flex-row",
      left: "w-1/4 h-full flex-col",
      game: "w-1/2 h-full",
      right: "w-1/4 h-full flex-col",
    },
  }

  const styles = isLandscape ? layoutStyles.landscape : layoutStyles.portrait

  return (
    <div
      className={cn("fixed inset-0 bg-zinc-900 flex items-center justify-center font-mono text-zinc-400", className)}
    >
      <div className={cn("w-full h-full flex", styles.container)}>
        {/* Left Side (Movement) */}
        <div className={cn("flex items-center justify-center p-4", styles.left)}>
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-sm tracking-widest font-bold text-zinc-300">MOVEMENT</span>
            <Joystick
              size={150}
              sticky={false}
              baseColor="rgba(39, 39, 42, 0.7)"
              stickColor="rgba(113, 113, 122, 0.8)"
              move={gameInputHandler.handleJoystickMove}
              stop={gameInputHandler.handleJoystickStop}
              throttle={30}
            />
            <span className="text-xs text-zinc-500">Move to walk</span>
          </div>
        </div>

        {/* Game Screen (Middle) */}
        <div className={cn("flex items-center justify-center", styles.game)}>
          <div className="w-full h-full bg-black/70 border-y-2 sm:border-x-2 sm:border-y-0 border-zinc-700 relative overflow-hidden">
            {children}
          </div>
        </div>

        {/* Right Side (Actions) */}
        <div className={cn("flex items-center justify-center p-4", styles.right)}>
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-sm tracking-widest font-bold text-zinc-300">ACTIONS</span>
            <div className="grid grid-cols-2 gap-4">
              <ActionButton label="🏹" action="shoot" title="Shoot Arrow" />
              <ActionButton label="⚡" action="special" title="Special Attack" />
              <ActionButton label="💨" action="dash" title="Dash" />
              <ActionButton label="💥" action="explosive" title="Explosive Arrow" />
            </div>
            <span className="text-xs text-zinc-500">Tap for combat</span>
          </div>
        </div>
      </div>
    </div>
  )
}
