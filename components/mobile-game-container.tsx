"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Joystick } from "react-joystick-component"
import { cn } from "@/lib/utils"
import type { IJoystickUpdateEvent } from "react-joystick-component"

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
  title?: string
}

function ActionButton({ label, action, onPress, className, title }: ActionButtonProps) {
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onPress(action, true)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onPress(action, false)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onPress(action, true)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onPress(action, false)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onPress(action, false)
  }

  return (
    <button
      className={cn(
        "w-16 h-16 rounded-full border-2 flex items-center justify-center font-mono text-sm font-bold transition-all duration-150",
        "touch-none select-none active:scale-95 user-select-none",
        "bg-zinc-700/90 border-zinc-500/70 text-zinc-200 active:bg-zinc-600/90 shadow-lg",
        className,
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      title={title}
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "transparent",
      }}
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
    window.addEventListener("orientationchange", handleOrientationChange)

    return () => {
      window.removeEventListener("resize", handleOrientationChange)
      window.removeEventListener("orientationchange", handleOrientationChange)
    }
  }, [])

  // Handle joystick movement - ONLY for player movement
  const handleJoystickMove = (event: IJoystickUpdateEvent) => {
    console.log("Joystick move event:", event)

    const deadzone = 0.2
    const x = event.x ?? 0
    const y = event.y ?? 0

    // Normalize values from -100 to 100 range to -1 to 1
    const normalizedX = Math.max(-1, Math.min(1, x / 100))
    const normalizedY = Math.max(-1, Math.min(1, -y / 100)) // Invert Y-axis for standard game coordinates

    // Apply deadzone
    const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY)
    if (distance < deadzone) {
      console.log("Joystick in deadzone, sending zero movement")
      onJoystickMove({ x: 0, y: 0 })
      return
    }

    console.log("Joystick sending movement:", { x: normalizedX, y: normalizedY })
    onJoystickMove({ x: normalizedX, y: normalizedY })
  }

  // Handle joystick stop - reset movement
  const handleJoystickStop = () => {
    console.log("Joystick stopped, sending zero movement")
    onJoystickMove({ x: 0, y: 0 })
  }

  const isLandscape = orientation === "landscape"

  return (
    <div
      className={cn(
        "fixed inset-0 bg-zinc-900 flex items-center justify-center p-2 sm:p-4 font-mono text-zinc-400",
        className,
      )}
      style={{
        touchAction: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
    >
      <div
        className={cn(
          "bg-zinc-800/50 rounded-2xl border border-zinc-700/50 w-full h-full flex",
          isLandscape ? "flex-row items-center p-4 gap-4" : "flex-col items-center p-2 gap-2",
        )}
      >
        {/* Movement Controls - Left side for landscape */}
        {isLandscape && (
          <div className="flex flex-col items-center justify-center w-1/4 h-full space-y-3">
            <span className="text-xs tracking-widest text-zinc-300 font-bold">MOVEMENT</span>
            <div className="relative bg-zinc-700/30 rounded-full p-2" style={{ touchAction: "none" }}>
              <Joystick
                size={120}
                sticky={false}
                baseColor="rgba(75, 85, 99, 0.9)"
                stickColor="rgba(156, 163, 175, 1)"
                move={handleJoystickMove}
                stop={handleJoystickStop}
                throttle={50}
                disabled={false}
              />
            </div>
            <span className="text-xs text-zinc-400">Move to walk</span>
          </div>
        )}

        {/* Game Screen */}
        <div
          className={cn(
            "bg-black/70 border border-dashed border-zinc-600 rounded-lg flex items-center justify-center relative overflow-hidden",
            isLandscape ? "w-1/2 h-full" : "w-full h-3/5",
          )}
        >
          {children}
        </div>

        {/* Action Controls */}
        <div
          className={cn(
            "flex items-center",
            isLandscape ? "w-1/4 h-full flex-col justify-center space-y-4" : "w-full h-2/5 justify-between px-4",
          )}
        >
          {/* Movement joystick for portrait mode */}
          {!isLandscape && (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="relative bg-zinc-700/30 rounded-full p-2" style={{ touchAction: "none" }}>
                <Joystick
                  size={120}
                  sticky={false}
                  baseColor="rgba(75, 85, 99, 0.9)"
                  stickColor="rgba(156, 163, 175, 1)"
                  move={handleJoystickMove}
                  stop={handleJoystickStop}
                  throttle={50}
                  disabled={false}
                />
              </div>
              <span className="text-xs tracking-widest text-zinc-300 font-bold">MOVEMENT</span>
              <span className="text-xs text-zinc-400">Move to walk</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="grid grid-cols-2 gap-4 w-[150px] h-[150px] place-items-center">
              <ActionButton
                label="🏹"
                action="shoot"
                onPress={onActionPress}
                className="col-start-1 row-start-1"
                title="Shoot Arrow"
              />
              <ActionButton
                label="⚡"
                action="special"
                onPress={onActionPress}
                className="col-start-2 row-start-1"
                title="Special Attack"
              />
              <ActionButton
                label="💨"
                action="dash"
                onPress={onActionPress}
                className="col-start-1 row-start-2"
                title="Dash"
              />
              <ActionButton
                label="💥"
                action="explosive"
                onPress={onActionPress}
                className="col-start-2 row-start-2"
                title="Explosive Arrow"
              />
            </div>
            <span className="text-xs tracking-widest text-zinc-300 font-bold">ACTIONS</span>
            <span className="text-xs text-zinc-400">Tap for combat</span>
          </div>
        </div>
      </div>
    </div>
  )
}
