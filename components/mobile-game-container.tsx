"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { gameInputHandler, type GameInputState } from "@/utils/game-input-handler"
import { Orbitron } from "next/font/google"
import { Joystick } from "react-joystick-component"

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
})

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
    <div className="flex flex-col items-center gap-1">
      <button
        className={cn(
          "w-16 h-16 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all duration-75",
          "touch-none select-none active:scale-95 active:brightness-125",
          "bg-gray-800/80 border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(0,255,255,0.3)] backdrop-blur-sm",
          "hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-cyan-400/50",
          orbitron.className,
          className,
        )}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
        onTouchCancel={handleInteractionEnd}
        onMouseDown={handleInteractionStart}
        onMouseUp={handleInteractionEnd}
        onMouseLeave={handleInteractionEnd}
        style={{
          WebkitUserSelect: "none",
          userSelect: "none",
          WebkitTouchCallout: "none",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {label}
      </button>
      {title && <span className="text-xs text-cyan-400/80 font-semibold tracking-wider">{title}</span>}
    </div>
  )
}

export default function MobileGameContainer({ children, className }: MobileGameContainerProps) {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape")

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

  const controlsBaseClasses = "flex flex-col items-center justify-center space-y-3"
  const labelClasses = `text-sm tracking-widest font-bold text-cyan-300 uppercase ${orbitron.className}`
  const subLabelClasses = "text-xs text-cyan-400/60"

  if (isLandscape) {
    return (
      <div
        className={cn("fixed inset-0 bg-gray-900 flex items-center justify-center font-sans text-gray-300", className)}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(10,40,60,0.5),_transparent_70%)]"></div>
        <div className="w-full h-full flex flex-row items-center p-4 gap-4 z-10">
          {/* Left: Movement Joystick */}
          <div className="w-[25%] h-full flex items-center justify-center pointer-events-auto">
            <div className={controlsBaseClasses}>
              <span className={labelClasses}>Movement</span>
              <Joystick
                size={120}
                baseColor="rgba(0, 255, 255, 0.2)"
                stickColor="rgba(0, 255, 255, 0.7)"
                move={(e) => gameInputHandler.handleMovementJoystick(e)}
                stop={(e) => gameInputHandler.handleMovementJoystick(e)}
              />
              <span className={subLabelClasses}>Move Player</span>
            </div>
          </div>

          {/* Center: Game Screen */}
          <div className="w-[50%] h-full flex items-center justify-center">
            <div className="w-full h-full bg-black/50 border-2 border-cyan-700/50 rounded-lg relative overflow-hidden shadow-[0_0_20px_rgba(0,255,255,0.2)]">
              {children}
            </div>
          </div>

          {/* Right: Aiming Joystick & Actions */}
          <div className="w-[25%] h-full flex flex-col items-center justify-center p-4 pointer-events-auto">
            {/* Aiming Joystick - Centered */}
            <div className="flex flex-col items-center justify-center space-y-3 mb-8">
              <span className={labelClasses}>Aim & Shoot</span>
              <Joystick
                size={120}
                baseColor="rgba(255, 0, 255, 0.2)"
                stickColor="rgba(255, 0, 255, 0.7)"
                move={(e) => gameInputHandler.handleAimingJoystick(e)}
                stop={(e) => gameInputHandler.handleAimingJoystick(e)}
                start={(e) => gameInputHandler.handleAimingJoystick(e)}
              />
              <span className={subLabelClasses}>Pull to charge, release to fire</span>
            </div>

            {/* Action Buttons - Below joystick */}
            <div className="flex flex-col gap-3 items-center">
              <div className="flex gap-4">
                <ActionButton label="X" action="dash" title="Dash" />
                <ActionButton label="Y" action="special" title="Special" />
              </div>
              <ActionButton label="B" action="explosiveArrow" title="Explode" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Portrait Layout
  return (
    <div
      className={cn("fixed inset-0 bg-gray-900 flex items-center justify-center font-sans text-gray-300", className)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(10,40,60,0.5),_transparent_70%)]"></div>
      <div className="w-full h-full flex flex-col items-center p-2 gap-2 z-10">
        {/* Top: Game Screen */}
        <div className="w-full h-3/5 flex items-center justify-center">
          <div className="w-full h-full bg-black/50 border-2 border-cyan-700/50 rounded-lg relative overflow-hidden shadow-[0_0_20px_rgba(0,255,255,0.2)] max-w-md">
            {children}
          </div>
        </div>

        {/* Bottom: Controls */}
        <div className="w-full h-2/5 flex flex-row items-center justify-between px-4 pointer-events-auto">
          {/* Bottom Left: Movement Joystick */}
          <div className={controlsBaseClasses}>
            <span className={labelClasses}>Move</span>
            <Joystick
              size={100}
              baseColor="rgba(0, 255, 255, 0.2)"
              stickColor="rgba(0, 255, 255, 0.7)"
              move={(e) => gameInputHandler.handleMovementJoystick(e)}
              stop={(e) => gameInputHandler.handleMovementJoystick(e)}
            />
          </div>

          {/* Center: Actions */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <span className={labelClasses}>Actions</span>
            <div className="flex gap-3">
              <ActionButton label="X" action="dash" />
              <ActionButton label="Y" action="special" />
              <ActionButton label="B" action="explosiveArrow" />
            </div>
          </div>

          {/* Bottom Right: Aiming Joystick */}
          <div className={controlsBaseClasses}>
            <span className={labelClasses}>Aim</span>
            <Joystick
              size={100}
              baseColor="rgba(255, 0, 255, 0.2)"
              stickColor="rgba(255, 0, 255, 0.7)"
              move={(e) => gameInputHandler.handleAimingJoystick(e)}
              stop={(e) => gameInputHandler.handleAimingJoystick(e)}
              start={(e) => gameInputHandler.handleAimingJoystick(e)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
