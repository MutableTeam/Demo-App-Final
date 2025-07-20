"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { Joystick } from "react-joystick-component"
import { cn } from "@/lib/utils"
import type { IJoystickUpdateEvent } from "react-joystick-component"

interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
  onMovementChange?: (movement: { up: boolean; down: boolean; left: boolean; right: boolean }) => void
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
  const handleInteractionStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onPress(action, true)
    },
    [action, onPress],
  )

  const handleInteractionEnd = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onPress(action, false)
    },
    [action, onPress],
  )

  return (
    <button
      className={cn(
        "w-16 h-16 rounded-full border-2 flex items-center justify-center font-mono text-lg font-bold transition-all duration-100",
        "touch-none select-none active:scale-95",
        "bg-zinc-700/90 border-zinc-500/70 text-zinc-200 active:bg-zinc-600/90 shadow-lg backdrop-blur-sm",
        "hover:bg-zinc-600/80 focus:outline-none focus:ring-2 focus:ring-zinc-400/50",
        className,
      )}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      onTouchCancel={handleInteractionEnd}
      onMouseDown={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd}
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
  onMovementChange = () => {},
  onActionPress = () => {},
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

  // Handle joystick movement - ONLY for player movement, NOT shooting
  const handleJoystickMove = useCallback(
    (event: IJoystickUpdateEvent) => {
      if (!onMovementChange) {
        console.warn("onMovementChange not provided to MobileGameContainer")
        return
      }

      const deadzone = 0.2
      const x = event.x ?? 0
      const y = event.y ?? 0

      const normalizedX = Math.max(-1, Math.min(1, x / 50))
      const normalizedY = Math.max(-1, Math.min(1, -y / 50))

      const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY)

      if (distance < deadzone) {
        onMovementChange({ up: false, down: false, left: false, right: false })
        return
      }

      const threshold = 0.3
      const movement = {
        up: normalizedY > threshold,
        down: normalizedY < -threshold,
        left: normalizedX < -threshold,
        right: normalizedX > threshold,
      }

      console.log("Joystick movement:", {
        raw: { x, y },
        normalized: { x: normalizedX, y: normalizedY },
        distance,
        movement,
      })

      onMovementChange(movement)
    },
    [onMovementChange],
  )

  // Handle joystick stop - ensure movement stops
  const handleJoystickStop = useCallback(() => {
    if (!onMovementChange) {
      console.warn("onMovementChange not provided to MobileGameContainer")
      return
    }

    console.log("Joystick stopped - clearing all movement")
    onMovementChange({ up: false, down: false, left: false, right: false })
  }, [onMovementChange])

  const isLandscape = orientation === "landscape"

  if (isLandscape) {
    // Landscape Layout: Movement | Game Screen | Actions
    return (
      <div
        className={cn("fixed inset-0 bg-zinc-900 flex items-center justify-center font-mono text-zinc-400", className)}
      >
        <div className="w-full h-full flex flex-row items-center p-4 gap-4">
          {/* Movement Controls - Left Side */}
          <div className="w-1/4 h-full flex flex-col items-center justify-center space-y-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <span className="text-xs tracking-widest font-bold text-zinc-300">MOVEMENT</span>
              <div className="relative">
                <Joystick
                  size={120}
                  sticky={false}
                  baseColor="rgba(63, 63, 70, 0.8)"
                  stickColor="rgba(113, 113, 122, 0.9)"
                  move={handleJoystickMove}
                  stop={handleJoystickStop}
                  throttle={16} // ~60fps updates
                  disabled={false}
                />
              </div>
              <span className="text-xs text-zinc-500">Move Player</span>
            </div>
          </div>

          {/* Game Screen - Center */}
          <div className="w-1/2 h-full flex items-center justify-center">
            <div className="w-full h-full bg-black/70 border-2 border-zinc-700 rounded-lg relative overflow-hidden">
              {children}
            </div>
          </div>

          {/* Action Controls - Right Side */}
          <div className="w-1/4 h-full flex flex-col items-center justify-center space-y-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <span className="text-xs tracking-widest font-bold text-zinc-300">ACTIONS</span>
              <div className="grid grid-cols-2 gap-3 w-[140px] h-[140px] place-items-center">
                <ActionButton label="Y" action="special" onPress={onActionPress} title="Special Attack" />
                <ActionButton label="X" action="dash" onPress={onActionPress} title="Dash" />
                <ActionButton label="B" action="explosive" onPress={onActionPress} title="Explosive Arrow" />
                <ActionButton label="A" action="shoot" onPress={onActionPress} title="Shoot Arrow" />
              </div>
              <span className="text-xs text-zinc-500">Combat Actions</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Portrait Layout: Game Screen on top, Controls on bottom
  return (
    <div
      className={cn("fixed inset-0 bg-zinc-900 flex items-center justify-center font-mono text-zinc-400", className)}
    >
      <div className="w-full h-full flex flex-col items-center p-4 gap-4">
        {/* Game Screen - Top */}
        <div className="w-full h-2/3 flex items-center justify-center">
          <div className="w-full h-full bg-black/70 border-2 border-zinc-700 rounded-lg relative overflow-hidden max-w-md">
            {children}
          </div>
        </div>

        {/* Controls - Bottom */}
        <div className="w-full h-1/3 flex flex-row items-center justify-between px-8">
          {/* Movement Controls - Bottom Left */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <span className="text-xs tracking-widest font-bold text-zinc-300">MOVEMENT</span>
            <div className="relative">
              <Joystick
                size={100}
                sticky={false}
                baseColor="rgba(63, 63, 70, 0.8)"
                stickColor="rgba(113, 113, 122, 0.9)"
                move={handleJoystickMove}
                stop={handleJoystickStop}
                throttle={16} // ~60fps updates
                disabled={false}
              />
            </div>
            <span className="text-xs text-zinc-500">Move Player</span>
          </div>

          {/* Action Controls - Bottom Right */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <span className="text-xs tracking-widest font-bold text-zinc-300">ACTIONS</span>
            <div className="grid grid-cols-2 gap-3 w-[120px] h-[120px] place-items-center">
              <ActionButton label="Y" action="special" onPress={onActionPress} title="Special Attack" />
              <ActionButton label="X" action="dash" onPress={onActionPress} title="Dash" />
              <ActionButton label="B" action="explosive" onPress={onActionPress} title="Explosive Arrow" />
              <ActionButton label="A" action="shoot" onPress={onActionPress} title="Shoot Arrow" />
            </div>
            <span className="text-xs text-zinc-500">Combat Actions</span>
          </div>
        </div>
      </div>
    </div>
  )
}
