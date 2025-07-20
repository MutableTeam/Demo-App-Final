"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Joystick } from "react-joystick-component"
import { cn } from "@/lib/utils"
import type { IJoystickUpdateEvent } from "react-joystick-component"

interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
  onJoystickMove: (direction: { x: number; y: number }) => void
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

export default function MobileGameContainer({
  children,
  className,
  onJoystickMove,
  onActionPress,
}: MobileGameContainerProps) {
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

  const handleMove = (event: IJoystickUpdateEvent) => {
    const deadzone = 0.2
    const x = event.x ?? 0
    const y = event.y ?? 0

    const normalizedX = Math.max(-1, Math.min(1, x / 100))
    const normalizedY = Math.max(-1, Math.min(1, -y / 100))

    const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY)
    if (distance < deadzone) {
      onJoystickMove({ x: 0, y: 0 })
      return
    }
    onJoystickMove({ x: normalizedX, y: normalizedY })
  }

  const handleStop = () => {
    onJoystickMove({ x: 0, y: 0 })
  }

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
        <div className={cn("flex items-center justify-center p-4", styles.left)}>
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-sm tracking-widest font-bold text-zinc-300">MOVEMENT</span>
            <Joystick
              size={150}
              sticky={false}
              baseColor="rgba(39, 39, 42, 0.7)"
              stickColor="rgba(113, 113, 122, 0.8)"
              move={handleMove}
              stop={handleStop}
              throttle={30}
            />
            <span className="text-xs text-zinc-500">Move to walk</span>
          </div>
        </div>
        <div className={cn("flex items-center justify-center", styles.game)}>
          <div className="w-full h-full bg-black/70 border-y-2 sm:border-x-2 sm:border-y-0 border-zinc-700 relative overflow-hidden">
            {children}
          </div>
        </div>
        <div className={cn("flex items-center justify-center p-4", styles.right)}>
          <div className="flex flex-col items-center justify-center gap-2">
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
