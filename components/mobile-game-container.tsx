"use client"

import type React from "react"
import { useEffect, useState } from "react"
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

  return <div className="relative w-full h-full">{children}</div>
}
