"use client"

import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import { gameInputHandler, type GameInputState } from "@/utils/game-input-handler"
import { Orbitron } from "next/font/google"
import { RotateCw } from "lucide-react"
import nipplejs from "nipplejs"
import type { JoystickManager } from "nipplejs"
import { usePlatform } from "@/contexts/platform-context"

interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
}

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
})

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
  const { isUiActive } = usePlatform()
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape")
  const leftZoneRef = useRef<HTMLDivElement>(null)
  const rightZoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOrientationChange = () => {
      const isLandscape = window.matchMedia("(orientation: landscape)").matches
      setOrientation(isLandscape ? "landscape" : "portrait")
    }
    handleOrientationChange()
    window.addEventListener("resize", handleOrientationChange)
    return () => window.removeEventListener("resize", handleOrientationChange)
  }, [])

  useEffect(() => {
    if (orientation !== "landscape" || isUiActive) {
      return
    }

    let moveManager: JoystickManager | undefined
    let aimManager: JoystickManager | undefined

    const timer = setTimeout(() => {
      if (leftZoneRef.current && rightZoneRef.current) {
        moveManager = nipplejs.create({
          zone: leftZoneRef.current,
          mode: "dynamic",
          position: { left: "50%", top: "50%" },
          color: "rgba(0, 255, 255, 0.5)",
          size: 150,
        })
        moveManager.on("move", (_, data) => gameInputHandler.handleNippleMovement(data))
        moveManager.on("end", () =>
          gameInputHandler.handleNippleMovement({
            force: 0,
            angle: { radian: 0, degree: 0 },
            distance: 0,
            position: { x: 0, y: 0 },
            identifier: 0,
          }),
        )

        aimManager = nipplejs.create({
          zone: rightZoneRef.current,
          mode: "dynamic",
          position: { left: "50%", top: "50%" },
          color: "rgba(255, 0, 255, 0.5)",
          size: 150,
          threshold: 0.1,
        })
        aimManager.on("start", () => gameInputHandler.handleNippleAimingStart())
        aimManager.on("move", (_, data) => gameInputHandler.handleNippleAimingMove(data))
        aimManager.on("end", () => gameInputHandler.handleNippleAimingEnd())
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      moveManager?.destroy()
      aimManager?.destroy()
    }
  }, [orientation, isUiActive])

  if (orientation === "portrait") {
    return <PortraitWarning />
  }

  return (
    <div className={cn("fixed inset-0 bg-black w-screen h-screen overflow-hidden", className)}>
      <div className="absolute inset-0 z-0">{children}</div>

      {!isUiActive && (
        <>
          <div ref={leftZoneRef} className="absolute top-0 left-0 w-1/2 h-full z-10" />
          <div ref={rightZoneRef} className="absolute top-0 right-0 w-1/2 h-full z-10" />
          <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 z-20 pointer-events-none">
            <div className="pointer-events-auto flex flex-col items-center gap-4">
              <ActionButton label="X" action="dash" title="Dash" />
              <ActionButton label="Y" action="special" title="Special" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
