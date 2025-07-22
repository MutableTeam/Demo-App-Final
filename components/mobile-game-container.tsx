"use client"

import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import { Joystick } from "react-joystick-component"
import { cn } from "@/lib/utils"
import type { IJoystickUpdateEvent } from "react-joystick-component"
import { gameInputHandler, type GameInputState } from "@/utils/game-input-handler"

interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
}

interface ActionButtonProps {
  label: string
  action: keyof GameInputState["actions"]
  className?: string
  title?: string
}

function ActionButton({ label, action, className, title }: ActionButtonProps) {
  const handleInteractionStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      gameInputHandler.handleActionPress(action, true)
    },
    [action],
  )

  const handleInteractionEnd = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      gameInputHandler.handleActionPress(action, false)
    },
    [action],
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

export default function MobileGameContainer({ children, className }: MobileGameContainerProps) {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape")
  const aimPadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOrientationChange = () => {
      const currentOrientation = window.matchMedia("(orientation: landscape)").matches ? "landscape" : "portrait"
      setOrientation(currentOrientation)
    }
    handleOrientationChange()
    window.addEventListener("resize", handleOrientationChange)
    return () => window.removeEventListener("resize", handleOrientationChange)
  }, [])

  const handleJoystickMove = useCallback((event: IJoystickUpdateEvent) => {
    gameInputHandler.handleJoystickMove(event.x ?? 0, event.y ?? 0)
  }, [])

  const handleJoystickStop = useCallback(() => {
    gameInputHandler.handleJoystickStop()
  }, [])

  const handleAimTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    gameInputHandler.handleAimTouchStart(e)
  }, [])

  const handleAimTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    gameInputHandler.handleAimTouchMove(e)
  }, [])

  const handleAimTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    gameInputHandler.handleAimTouchEnd(e)
  }, [])

  const isLandscape = orientation === "landscape"

  if (isLandscape) {
    // Landscape Layout: Movement | Game Screen | Actions & Aiming
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
                  throttle={16}
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

          {/* Action & Aiming Controls - Right Side */}
          <div
            ref={aimPadRef}
            className="w-1/4 h-full flex flex-col items-center justify-end p-4"
            onTouchStart={handleAimTouchStart}
            onTouchMove={handleAimTouchMove}
            onTouchEnd={handleAimTouchEnd}
            onTouchCancel={handleAimTouchEnd}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="grid grid-cols-2 gap-3 w-[140px] h-[140px] place-items-center">
                <ActionButton label="Y" action="special" title="Special Attack" />
                <ActionButton label="X" action="dash" title="Dash" />
                <ActionButton label="B" action="explosiveArrow" title="Explosive Arrow" />
              </div>
              <span className="text-xs text-zinc-500">Drag to Aim & Shoot</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Portrait Layout
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
        <div className="w-full h-1/3 flex flex-row items-center justify-between px-4">
          {/* Movement Controls - Bottom Left */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <span className="text-xs tracking-widest font-bold text-zinc-300">MOVE</span>
            <div className="relative">
              <Joystick
                size={100}
                sticky={false}
                baseColor="rgba(63, 63, 70, 0.8)"
                stickColor="rgba(113, 113, 122, 0.9)"
                move={handleJoystickMove}
                stop={handleJoystickStop}
                throttle={16}
              />
            </div>
          </div>

          {/* Action & Aiming Controls - Bottom Right */}
          <div
            ref={aimPadRef}
            className="w-1/2 h-full flex flex-col items-end justify-center"
            onTouchStart={handleAimTouchStart}
            onTouchMove={handleAimTouchMove}
            onTouchEnd={handleAimTouchEnd}
            onTouchCancel={handleAimTouchEnd}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="grid grid-cols-2 gap-3 w-[120px] h-[120px] place-items-center">
                <ActionButton label="Y" action="special" title="Special Attack" />
                <ActionButton label="X" action="dash" title="Dash" />
                <ActionButton label="B" action="explosiveArrow" title="Explosive Arrow" />
              </div>
              <span className="text-xs text-zinc-500">Drag to Aim & Shoot</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
