"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Joystick } from "react-joystick-component"
import { cn } from "@/lib/utils"
import type { IJoystickUpdateEvent } from "react-joystick-component/build/lib/Joystick"

interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
  onJoystickMove?: (direction: { x: number; y: number }) => void
  onActionPress?: (action: string, pressed: boolean) => void
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
    onPress(action, true)
  }
  const handleEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    onPress(action, false)
  }

  return (
    <button
      className={cn(
        "w-16 h-16 rounded-full border-2 flex items-center justify-center font-mono text-lg font-bold transition-all duration-150",
        "touch-none select-none active:scale-95",
        "bg-zinc-700/80 border-zinc-500/70 text-zinc-300 active:bg-zinc-600/90",
        className,
      )}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      {label}
    </button>
  )
}

export default function MobileGameContainer({
  children,
  className,
  onJoystickMove = () => {},
  onActionPress = () => {},
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

  const handleJoystickUpdate = (event: IJoystickUpdateEvent) => {
    const deadzone = 0.1
    const x = event.x ?? 0
    const y = event.y ?? 0
    const distance = Math.sqrt(x * x + y * y)

    if (distance < deadzone * 50) {
      // 50 is the joystick's internal scale
      onJoystickMove({ x: 0, y: 0 })
      return
    }

    const normalizedX = x / 50
    const normalizedY = -y / 50 // Invert Y-axis for standard game coordinates
    onJoystickMove({ x: normalizedX, y: normalizedY })
  }

  const handleJoystickStop = () => {
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
      <div className="bg-zinc-800/50 rounded-2xl border border-zinc-700/50 w-full h-full flex items-center justify-center p-4 relative">
        {/* Game Screen - takes up most of the space */}
        <div className="bg-black/70 border border-dashed border-zinc-600 rounded-lg flex items-center justify-center relative w-full h-full">
          {children}
        </div>

        {/* Right Side Controls - positioned absolutely on the right */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-4">
          {/* Joystick at the top */}
          <div className="flex flex-col items-center space-y-2">
            <Joystick
              size={80}
              sticky={false}
              baseColor="#4a4a4a"
              stickColor="#333333"
              move={handleJoystickUpdate}
              stop={handleJoystickStop}
              throttle={50}
            />
            <span className="text-xs tracking-widest text-center">MOVE</span>
          </div>

          {/* Action buttons below joystick */}
          <div className="flex flex-col items-center space-y-2">
            <div className="flex flex-col space-y-3">
              <ActionButton label="Y" action="actionY" onPress={onActionPress} />
              <ActionButton label="X" action="actionX" onPress={onActionPress} />
              <ActionButton label="B" action="actionB" onPress={onActionPress} />
              <ActionButton label="A" action="actionA" onPress={onActionPress} />
            </div>
            <span className="text-xs tracking-widest text-center">ACTIONS</span>
          </div>
        </div>
      </div>
    </div>
  )
}
