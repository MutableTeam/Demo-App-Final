"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { usePlatform } from "@/contexts/platform-context"
import { gameInputHandler } from "@/utils/game-input-handler"
import type nipplejs from "nipplejs"
import { RotateCw, Info } from "lucide-react"
import { Orbitron } from "next/font/google"
import { cn } from "@/lib/utils"
import MobileControlsTutorial from "./mobile-controls-tutorial"

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

interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
}

export default function MobileGameContainer({ children, className }: MobileGameContainerProps) {
  const { isUiActive } = usePlatform()
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape")
  const [showTutorial, setShowTutorial] = useState(false)
  const movementZoneRef = useRef<HTMLDivElement>(null)
  const aimingZoneRef = useRef<HTMLDivElement>(null)
  const moveManagerRef = useRef<nipplejs.JoystickManager | null>(null)
  const aimManagerRef = useRef<nipplejs.JoystickManager | null>(null)

  useEffect(() => {
    const tutorialShown = sessionStorage.getItem("mobileTutorialShown")
    if (tutorialShown !== "true") {
      setShowTutorial(true)
    }

    const handleOrientationChange = () => {
      const isLandscape = window.matchMedia("(orientation: landscape)").matches
      setOrientation(isLandscape ? "landscape" : "portrait")
    }
    handleOrientationChange()
    window.addEventListener("resize", handleOrientationChange)
    return () => window.removeEventListener("resize", handleOrientationChange)
  }, [])

  useEffect(() => {
    if (isUiActive || orientation === "portrait" || showTutorial) {
      if (moveManagerRef.current) {
        moveManagerRef.current.destroy()
        moveManagerRef.current = null
      }
      if (aimManagerRef.current) {
        aimManagerRef.current.destroy()
        aimManagerRef.current = null
      }
      return
    }

    const initializeJoysticks = async () => {
      try {
        const nippleModule = await import("nipplejs")
        const nipplejs = nippleModule.default

        if (movementZoneRef.current && !moveManagerRef.current) {
          const moveManager = nipplejs.create({
            zone: movementZoneRef.current,
            mode: "dynamic",
            position: { left: "50%", top: "50%" },
            color: "rgba(0, 255, 255, 0.5)",
            size: 150,
          })
          moveManager.on("move", (_, data) => gameInputHandler.handleNippleMovement(data))
          moveManager.on("end", () => gameInputHandler.handleNippleMovementEnd())
          moveManagerRef.current = moveManager
        }

        if (aimingZoneRef.current && !aimManagerRef.current) {
          const aimManager = nipplejs.create({
            zone: aimingZoneRef.current,
            mode: "dynamic",
            position: { left: "50%", top: "50%" },
            color: "rgba(255, 165, 0, 0.5)",
            size: 150,
          })
          aimManager.on("start", () => gameInputHandler.handleNippleAimingStart())
          aimManager.on("move", (_, data) => gameInputHandler.handleNippleAiming(data))
          aimManager.on("end", () => gameInputHandler.handleNippleAimingEnd())
          aimManagerRef.current = aimManager
        }
      } catch (error) {
        console.error("Failed to initialize joysticks:", error)
      }
    }

    initializeJoysticks()

    return () => {
      if (moveManagerRef.current) {
        moveManagerRef.current.destroy()
        moveManagerRef.current = null
      }
      if (aimManagerRef.current) {
        aimManagerRef.current.destroy()
        aimManagerRef.current = null
      }
    }
  }, [isUiActive, orientation, showTutorial])

  const handleCloseTutorial = () => {
    setShowTutorial(false)
    sessionStorage.setItem("mobileTutorialShown", "true")
  }

  if (orientation === "portrait") {
    return <PortraitWarning />
  }

  return (
    <div
      className={cn("fixed inset-0 bg-black w-screen h-screen overflow-hidden", className)}
      style={{ touchAction: "none" }}
    >
      <MobileControlsTutorial isOpen={showTutorial} onClose={handleCloseTutorial} />

      {children}

      {!isUiActive && !showTutorial && (
        <>
          {/* Disclaimer Text - Bottom Left */}
          <div
            className={cn(
              "absolute bottom-4 left-4 z-20 bg-black/50 text-white/70 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2",
              orbitron.className,
            )}
          >
            <Info className="w-3 h-3" />
            <span>Demo game: does not represent final product.</span>
          </div>

          {/* Touch Zones for Joysticks */}
          <div ref={movementZoneRef} className="absolute top-0 left-0 w-1/2 h-full z-10" />
          <div ref={aimingZoneRef} className="absolute top-0 right-0 w-1/2 h-full z-10" />

          {/* Dash Button */}
          <div className="absolute bottom-6 right-6 z-20">
            <button
              className={cn(
                "w-20 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg",
                "flex items-center justify-center border-2 border-yellow-400/50",
                "shadow-lg shadow-yellow-500/30 transition-all duration-200",
                "active:scale-95 active:shadow-yellow-500/50 focus:outline-none",
                orbitron.className,
              )}
              onTouchStart={() => gameInputHandler.handleButtonPress("dash")}
              onTouchEnd={() => gameInputHandler.handleButtonRelease("dash")}
              aria-label="Dash"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <span className="text-black font-bold text-sm">DASH</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
