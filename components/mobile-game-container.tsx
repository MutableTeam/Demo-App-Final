"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { usePlatform } from "@/contexts/platform-context"
import { gameInputHandler } from "@/utils/game-input-handler"
import { Button } from "@/components/ui/button"
import { Zap, ChevronsRight } from "lucide-react"
import type nipplejs from "nipplejs"
import { RotateCw } from "lucide-react"
import { Orbitron } from "next/font/google"
import { cn } from "@/lib/utils"

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
}

export default function MobileGameContainer({ children }: MobileGameContainerProps) {
  const { isUiActive } = usePlatform()
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape")
  const movementZoneRef = useRef<HTMLDivElement>(null)
  const aimingZoneRef = useRef<HTMLDivElement>(null)
  const moveManagerRef = useRef<nipplejs.JoystickManager | null>(null)
  const aimManagerRef = useRef<nipplejs.JoystickManager | null>(null)

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
    if (isUiActive || orientation === "portrait") {
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
  }, [isUiActive, orientation])

  if (orientation === "portrait") {
    return <PortraitWarning />
  }

  return (
    <div className={cn("fixed inset-0 bg-black w-screen h-screen overflow-hidden")} style={{ touchAction: "none" }}>
      {children}
      {!isUiActive && (
        <>
          {/* Touch Zones for Joysticks */}
          <div ref={movementZoneRef} className="absolute top-0 left-0 w-1/2 h-full z-10" />
          <div ref={aimingZoneRef} className="absolute top-0 right-0 w-1/2 h-full z-10" />

          {/* Action Buttons */}
          <div className="absolute bottom-6 right-5 flex flex-col items-center gap-4 z-20">
            <Button
              className="w-20 h-20 rounded-full bg-blue-500/50 text-white backdrop-blur-sm"
              onTouchStart={() => gameInputHandler.handleButtonPress("dash")}
              onTouchEnd={() => gameInputHandler.handleButtonRelease("dash")}
            >
              <ChevronsRight size={40} />
            </Button>
            <Button
              className="w-20 h-20 rounded-full bg-red-500/50 text-white backdrop-blur-sm"
              onTouchStart={() => gameInputHandler.handleButtonPress("special")}
              onTouchEnd={() => gameInputHandler.handleButtonRelease("special")}
            >
              <Zap size={40} />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
