"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { gameInputHandler, type GameInputState } from "@/utils/game-input-handler"
import { Orbitron } from "next/font/google"
import { Joystick } from "react-joystick-component"
import { RotateCw } from "lucide-react"

interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
}

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
})

/**
 * A warning component to display when the device is in portrait mode,
 * instructing the user to rotate to landscape.
 */
function PortraitWarning() {
  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center text-white p-4">
      <RotateCw className="w-12 h-12 mb-6 text-cyan-400 animate-spin" />
      <h2 className={`text-2xl text-center font-bold text-cyan-300 ${orbitron.className}`}>
        Please Rotate Your Device
      </h2>
      <p className="mt-2 text-lg text-center text-cyan-400/80">This game is designed for landscape mode.</p>
    </div>
  )
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
          "bg-gray-800/70 border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(0,255,255,0.3)] backdrop-blur-sm",
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
      const isLandscape = window.matchMedia("(orientation: landscape)").matches
      setOrientation(isLandscape ? "landscape" : "portrait")
    }
    handleOrientationChange()
    window.addEventListener("resize", handleOrientationChange)
    return () => window.removeEventListener("resize", handleOrientationChange)
  }, [])

  if (orientation === "portrait") {
    return <PortraitWarning />
  }

  // Landscape Fullscreen Layout
  return (
    <div className={cn("fixed inset-0 bg-black w-screen h-screen overflow-hidden", className)}>
      {/* Game Canvas takes up the full screen */}
      <div className="absolute inset-0 z-0">{children}</div>

      {/* Controls Overlay */}
      <div className="absolute inset-0 z-10 flex justify-between items-end p-6 sm:p-8 pointer-events-none">
        {/* Left Controls: Movement Joystick */}
        <div className="pointer-events-auto">
          <div className="flex flex-col items-center gap-2">
            <Joystick
              size={120}
              baseColor="rgba(0, 255, 255, 0.15)"
              stickColor="rgba(0, 255, 255, 0.6)"
              move={(e) => gameInputHandler.handleMovementJoystick(e)}
              stop={(e) => gameInputHandler.handleMovementJoystick(e)}
            />
            <span className={`text-sm font-bold text-cyan-300/80 uppercase ${orbitron.className}`}>Move</span>
          </div>
        </div>

        {/* Right Controls: Actions and Aiming */}
        <div className="pointer-events-auto">
          <div className="flex flex-col items-center gap-6">
            <div className="grid grid-cols-2 gap-4">
              <ActionButton label="X" action="dash" title="Dash" />
              <ActionButton label="Y" action="special" title="Special" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <Joystick
                size={120}
                baseColor="rgba(255, 0, 255, 0.15)"
                stickColor="rgba(255, 0, 255, 0.6)"
                move={(e) => gameInputHandler.handleAimingJoystick(e)}
                stop={(e) => gameInputHandler.handleAimingJoystick(e)}
                start={(e) => gameInputHandler.handleAimingJoystick(e)}
              />
              <span className={`text-sm font-bold text-pink-300/80 uppercase ${orbitron.className}`}>Aim & Shoot</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
