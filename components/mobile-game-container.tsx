"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
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

export default function MobileGameContainer({ children, className }: MobileGameContainerProps) {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerWidth > window.innerHeight ? "landscape" : "portrait")
    }

    handleOrientationChange()
    window.addEventListener("resize", handleOrientationChange)
    return () => window.removeEventListener("resize", handleOrientationChange)
  }, [])

  const isLandscape = orientation === "landscape"

  return (
    <div
      className={cn(
        "fixed inset-0 bg-zinc-900 flex items-center justify-center p-2 sm:p-4 font-mono text-zinc-400",
        className,
      )}
    >
      <div className="bg-zinc-800/50 rounded-2xl border border-zinc-700/50 w-full h-full flex items-center justify-center p-4">
        <div className="bg-black/70 border border-dashed border-zinc-600 rounded-lg flex items-center justify-center relative w-full h-full">
          {children}
        </div>
      </div>
    </div>
  )
}
