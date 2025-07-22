"use client"

import type React from "react"
import { useCallback, useState } from "react"
import { cn } from "@/lib/utils"
import { gameInputHandler, type GameInputState } from "@/utils/game-input-handler"
import { Orbitron } from "next/font/google"
import { Joystick } from "react-joystick-component"
import { useOrientation } from "@/hooks/use-responsive"

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
  holdAction?: boolean
}

function ActionButton({ label, action, className, title, holdAction = false }: ActionButtonProps) {
  const [isActive, setIsActive] = useState(false)

  const handleInteractionStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      gameInputHandler.handleActionPress(action, true)
      if (holdAction) setIsActive(true)
    },
    [action, holdAction],
  )

  const handleInteractionEnd = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      gameInputHandler.handleActionPress(action, false)
      if (holdAction) setIsActive(false)
    },
    [action, holdAction],
  )

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        className={cn(
          "w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-75",
          "touch-none select-none active:scale-95 active:brightness-125",
          "bg-gray-800/80 border-cyan-400/50 text-cyan-300 shadow-[0_0_8px_rgba(0,255,255,0.3)] backdrop-blur-sm",
          "hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-cyan-400/50",
          isActive && "bg-cyan-700/80 border-cyan-300 text-white",
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
  const orientation = useOrientation()
  const isPortrait = orientation === "portrait"

  const controlsBaseClasses = "flex flex-col items-center justify-center space-y-3"
  const labelClasses = `text-sm tracking-widest font-bold text-cyan-300 uppercase ${orbitron.className}`
  const subLabelClasses = "text-xs text-cyan-400/60"

  // Invert Y-axis at the source for correct movement
  const handleMovement = (e: any) => gameInputHandler.handleMovementJoystick(e ? { ...e, y: -e.y } : null)

  // Handle aiming joystick - only for aiming, not shooting
  const handleAiming = (e: any) => {
    if (e) {
      // Invert Y-axis and pass to handler
      gameInputHandler.handleAimingJoystick({ ...e, y: -e.y })
    } else {
      // Joystick released
      gameInputHandler.handleAimingJoystick(null)
    }
  }

  if (isPortrait) {
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
                move={handleMovement}
                stop={() => handleMovement(null)}
              />
            </div>

            {/* Center: Actions */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <span className={labelClasses}>Actions</span>
              <div className="flex flex-col gap-2">
                <ActionButton label="X" action="dash" title="Dash" />
                <ActionButton label="Y" action="special" title="Special" />
                <ActionButton
                  label="🏹"
                  action="shoot"
                  title="Shoot"
                  className="bg-red-800/80 border-red-400/50 text-red-100"
                  holdAction={true}
                />
              </div>
            </div>

            {/* Bottom Right: Aiming Joystick */}
            <div className={controlsBaseClasses}>
              <span className={labelClasses}>Aim</span>
              <Joystick
                size={100}
                baseColor="rgba(255, 0, 255, 0.2)"
                stickColor="rgba(255, 0, 255, 0.7)"
                move={handleAiming}
                stop={() => handleAiming(null)}
              />
              <span className={subLabelClasses}>Aim direction</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Landscape Layout
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
              move={handleMovement}
              stop={() => handleMovement(null)}
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
          <div className="flex flex-col items-center justify-center space-y-3 mb-6">
            <span className={labelClasses}>Aim</span>
            <Joystick
              size={120}
              baseColor="rgba(255, 0, 255, 0.2)"
              stickColor="rgba(255, 0, 255, 0.7)"
              move={handleAiming}
              stop={() => handleAiming(null)}
            />
            <span className={subLabelClasses}>Aim direction</span>
          </div>

          <div className="flex flex-col gap-2 items-center">
            <div className="flex gap-3">
              <ActionButton label="X" action="dash" title="Dash" />
              <ActionButton label="Y" action="special" title="Special" />
            </div>
            <ActionButton
              label="🏹"
              action="shoot"
              title="Hold to charge, release to fire"
              className="w-16 h-16 bg-red-800/80 border-red-400/50 text-red-100 text-lg"
              holdAction={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
