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
}

function ActionButton({ label, action, onPress, className }: ActionButtonProps) {
  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onPress(action, true)
  }

  const handleEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onPress(action, false)
  }

  return (
    <button
      className={cn(
        "w-16 h-16 rounded-full border-2 flex items-center justify-center font-mono text-2xl font-bold transition-all duration-150",
        "touch-none select-none active:scale-95 user-select-none",
        "bg-zinc-700/90 border-zinc-500/70 text-zinc-200 active:bg-zinc-600/90 shadow-lg",
        className,
      )}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
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
      setOrientation(window.innerWidth > window.innerHeight ? "landscape" : "portrait")
    }

    handleOrientationChange()
    window.addEventListener("resize", handleOrientationChange)
    return () => window.removeEventListener("resize", handleOrientationChange)
  }, [])

  const handleMove = (event: IJoystickUpdateEvent) => {
    const deadzone = 0.15
    const x = event.x ?? 0
    const y = event.y ?? 0

    // Normalize values from -50 to 50 range to -1 to 1
    const normalizedX = x / 50
    const normalizedY = -y / 50 // Invert Y-axis for standard game coordinates

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

  return (
    <div
      className={cn(
        "fixed inset-0 bg-zinc-900 flex items-center justify-center p-2 sm:p-4 font-mono text-zinc-400",
        className,
      )}
    >
      <div
        className={cn(
          "bg-zinc-800/50 rounded-2xl border border-zinc-700/50 w-full h-full flex",
          isLandscape ? "flex-row items-center p-4 gap-4" : "flex-col items-center p-2 gap-2",
        )}
      >
        {/* Left/Top Controls for Landscape/Portrait */}
        <div
          className={cn(
            "flex items-center justify-center",
            isLandscape ? "w-1/4 h-full flex-col space-y-2" : "w-full h-2/5 flex-row justify-between px-4",
          )}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <span className="text-xs tracking-widest">MOVEMENT</span>
            <Joystick
              size={100}
              baseColor="rgba(75, 85, 99, 0.8)"
              stickColor="rgba(156, 163, 175, 0.9)"
              move={handleMove}
              stop={handleStop}
              throttle={16}
            />
          </div>
          {!isLandscape && (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="grid grid-cols-2 gap-3 w-[140px] h-[140px] place-items-center">
                <ActionButton label="🏹" action="shoot" onPress={onActionPress} />
                <ActionButton label="⚡" action="special" onPress={onActionPress} />
                <ActionButton label="💨" action="dash" onPress={onActionPress} />
                <ActionButton label="💥" action="explosive" onPress={onActionPress} />
              </div>
              <span className="text-xs tracking-widest">ACTIONS</span>
            </div>
          )}
        </div>

        {/* Game Screen */}
        <div
          className={cn(
            "bg-black/70 border border-dashed border-zinc-600 rounded-lg flex items-center justify-center relative",
            isLandscape ? "w-1/2 h-full" : "w-full h-3/5",
          )}
        >
          {children}
        </div>

        {/* Right Controls for Landscape */}
        {isLandscape && (
          <div className="flex w-1/4 h-full flex-col items-center justify-center space-y-2">
            <div className="grid grid-cols-2 gap-3 w-[140px] h-[140px] place-items-center">
              <ActionButton label="🏹" action="shoot" onPress={onActionPress} />
              <ActionButton label="⚡" action="special" onPress={onActionPress} />
              <ActionButton label="💨" action="dash" onPress={onActionPress} />
              <ActionButton label="💥" action="explosive" onPress={onActionPress} />
            </div>
            <span className="text-xs tracking-widest">ACTIONS</span>
          </div>
        )}
      </div>
    </div>
  )
}
