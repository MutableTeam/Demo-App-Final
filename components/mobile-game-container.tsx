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
      <div
        className={cn(
          "bg-zinc-800/50 rounded-2xl border border-zinc-700/50 w-full h-full flex",
          isLandscape ? "flex-row items-center p-4 gap-4" : "flex-col items-center p-2 gap-2",
        )}
      >
        {/* Left/Top Controls for Landscape/Portrait */}
        {isLandscape && (
          <div className="flex flex-col items-center justify-center w-1/4 h-full space-y-2">
            <span className="text-xs tracking-widest">MOVEMENT</span>
            <Joystick
              size={100}
              sticky={false}
              baseColor="#4a4a4a"
              stickColor="#333333"
              move={handleJoystickUpdate}
              stop={handleJoystickStop}
              throttle={50}
            />
          </div>
        )}

        {/* Game Screen */}
        <div
          className={cn(
            "bg-black/70 border border-dashed border-zinc-600 rounded-lg flex items-center justify-center relative",
            isLandscape ? "w-1/2 h-full" : "w-full h-3/5",
          )}
        >
          {children}
        </div>

        {/* Bottom/Right Controls */}
        <div
          className={cn(
            "flex items-center",
            isLandscape ? "w-1/4 h-full flex-col justify-center space-y-2" : "w-full h-2/5 justify-between px-4",
          )}
        >
          {!isLandscape && (
            <div className="flex flex-col items-center justify-center space-y-2">
              <Joystick
                size={100}
                sticky={false}
                baseColor="#4a4a4a"
                stickColor="#333333"
                move={handleJoystickUpdate}
                stop={handleJoystickStop}
                throttle={50}
              />
              <span className="text-xs tracking-widest">MOVE</span>
            </div>
          )}

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="grid grid-cols-2 gap-4 w-[160px] h-[160px] place-items-center">
              <ActionButton label="Y" action="actionY" onPress={onActionPress} className="col-start-1" />
              <ActionButton label="X" action="actionX" onPress={onActionPress} className="col-start-2" />
              <ActionButton label="B" action="actionB" onPress={onActionPress} className="col-start-1" />
              <ActionButton label="A" action="actionA" onPress={onActionPress} className="col-start-2" />
            </div>
            <span className="text-xs tracking-widest">ACTIONS</span>
          </div>
        </div>
      </div>
    </div>
  )
}
