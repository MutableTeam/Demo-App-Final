"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { usePlatform } from "@/contexts/platform-context"
import { gameInputHandler } from "@/utils/game-input-handler"
import type nipplejs from "nipplejs"
import { RotateCw, Info, X, Minimize2 } from "lucide-react"
import { Orbitron } from "next/font/google"
import { cn } from "@/lib/utils"
import MobileControlsTutorial from "./mobile-controls-tutorial"
import SoundButton from "./sound-button"
import { withClickSound } from "@/utils/sound-utils"

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
})

function PortraitWarning() {
  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center text-white p-4">
      <RotateCw className="w-12 h-12 mb-6 text-cyan-400 animate-spin" />
      <h2 className={`text-xl sm:text-2xl text-center font-bold text-cyan-300 mb-2 ${orbitron.className}`}>
        Please Rotate Your Device
      </h2>
      <p className="text-base sm:text-lg text-center text-cyan-400/80 max-w-sm">
        This game is designed for landscape mode for the best experience.
      </p>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">Turn your device sideways to continue</p>
      </div>
    </div>
  )
}

interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
  onClose?: () => void // Added onClose prop for closing the game
}

export default function MobileGameContainer({ children, className, onClose }: MobileGameContainerProps) {
  const { isUiActive } = usePlatform()
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape")
  const [showTutorial, setShowTutorial] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isOrientationStable, setIsOrientationStable] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false) // Added minimize state
  const movementZoneRef = useRef<HTMLDivElement>(null)
  const aimingZoneRef = useRef<HTMLDivElement>(null)
  const moveManagerRef = useRef<nipplejs.JoystickManager | null>(null)
  const aimManagerRef = useRef<nipplejs.JoystickManager | null>(null)
  const orientationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastOrientationChangeRef = useRef<number>(0)

  useEffect(() => {
    setIsMounted(true)

    const tutorialShown = sessionStorage.getItem("mobileTutorialShown")
    if (tutorialShown !== "true") {
      setShowTutorial(true)
    }

    const handleOrientationChange = () => {
      console.log("[v0] Orientation change detected")

      if (orientationTimeoutRef.current) {
        clearTimeout(orientationTimeoutRef.current)
      }

      setIsOrientationStable(false)
      lastOrientationChangeRef.current = Date.now()

      orientationTimeoutRef.current = setTimeout(() => {
        const isLandscape =
          window.matchMedia("(orientation: landscape)").matches || window.innerWidth > window.innerHeight

        const newOrientation = isLandscape ? "landscape" : "portrait"
        console.log("[v0] Setting orientation to:", newOrientation)

        setOrientation(newOrientation)

        setTimeout(() => {
          setIsOrientationStable(true)
          console.log("[v0] Orientation stabilized")
        }, 300)
      }, 500)
    }

    handleOrientationChange()
    window.addEventListener("resize", handleOrientationChange)
    window.addEventListener("orientationchange", handleOrientationChange)

    return () => {
      window.removeEventListener("resize", handleOrientationChange)
      window.removeEventListener("orientationchange", handleOrientationChange)
      if (orientationTimeoutRef.current) {
        clearTimeout(orientationTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isMounted || isUiActive || orientation === "portrait" || showTutorial || !isOrientationStable) {
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
        console.log("[v0] Initializing joysticks after orientation stabilized")

        const nippleModule = await import("nipplejs")
        const nipplejs = nippleModule.default

        if (movementZoneRef.current && !moveManagerRef.current) {
          const moveManager = nipplejs.create({
            zone: movementZoneRef.current,
            mode: "dynamic",
            position: { left: "50%", top: "50%" },
            color: "rgba(0, 255, 255, 0.5)",
            size: Math.min(150, window.innerWidth * 0.2),
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
            size: Math.min(150, window.innerWidth * 0.2),
          })
          aimManager.on("start", () => gameInputHandler.handleNippleAimingStart())
          aimManager.on("move", (_, data) => gameInputHandler.handleNippleAiming(data))
          aimManager.on("end", () => gameInputHandler.handleNippleAimingEnd())
          aimManagerRef.current = aimManager
        }

        console.log("[v0] Joysticks initialized successfully")
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
  }, [isMounted, isUiActive, orientation, showTutorial, isOrientationStable])

  const handleCloseTutorial = () => {
    setShowTutorial(false)
    sessionStorage.setItem("mobileTutorialShown", "true")
  }

  const handleMinimize = () => {
    setIsMinimized(true)
  }

  const handleMaximize = () => {
    setIsMinimized(false)
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  if (!isMounted) {
    return null
  }

  if (orientation === "portrait") {
    return <PortraitWarning />
  }

  if (!isOrientationStable) {
    return (
      <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center text-white p-4">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className={`text-lg text-center text-cyan-400 ${orbitron.className}`}>Preparing Game...</p>
      </div>
    )
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[10000] bg-black/90 border-2 border-cyan-500 rounded-lg p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="text-cyan-400 font-mono text-sm">Game Minimized</div>
          <SoundButton
            variant="outline"
            size="icon"
            className="h-8 w-8 border-2 border-cyan-500 bg-black hover:bg-gray-900 text-cyan-400"
            onClick={withClickSound(handleMaximize)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
            <span className="sr-only">Maximize</span>
          </SoundButton>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn("fixed inset-0 bg-black w-screen h-screen overflow-hidden z-[10000]", className)}
      style={{ touchAction: "none" }}
    >
      <MobileControlsTutorial isOpen={showTutorial} onClose={handleCloseTutorial} />

      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <SoundButton
          variant="outline"
          size="icon"
          className="h-10 w-10 border-2 border-cyan-500 bg-black/80 hover:bg-gray-900 text-cyan-400 backdrop-blur-sm"
          onClick={withClickSound(handleMinimize)}
        >
          <Minimize2 size={16} />
          <span className="sr-only">Minimize</span>
        </SoundButton>
        {onClose && (
          <SoundButton
            variant="outline"
            size="icon"
            className="h-10 w-10 border-2 border-cyan-500 bg-black/80 hover:bg-gray-900 text-cyan-400 backdrop-blur-sm"
            onClick={withClickSound(handleClose)}
          >
            <X size={16} />
            <span className="sr-only">Close</span>
          </SoundButton>
        )}
      </div>

      {children}

      {!isUiActive && !showTutorial && (
        <>
          <div
            className={cn(
              "absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-20 bg-black/50 text-white/70 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs flex items-center gap-1 sm:gap-2",
              orbitron.className,
            )}
          >
            <Info className="w-3 h-3" />
            <span className="hidden sm:inline">Demo game: does not represent final product.</span>
            <span className="sm:hidden">Demo game</span>
          </div>

          <div ref={movementZoneRef} className="absolute top-0 left-0 w-1/2 h-full z-10" />
          <div ref={aimingZoneRef} className="absolute top-0 right-0 w-1/2 h-full z-10" />

          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20">
            <button
              className={cn(
                "w-16 h-10 sm:w-20 sm:h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg",
                "flex items-center justify-center border-2 border-yellow-400/50",
                "shadow-lg shadow-yellow-500/30 transition-all duration-200",
                "active:scale-95 active:shadow-yellow-500/50 focus:outline-none",
                "min-h-[44px] min-w-[44px]",
                orbitron.className,
              )}
              onTouchStart={() => gameInputHandler.handleButtonPress("dash")}
              onTouchEnd={() => gameInputHandler.handleButtonRelease("dash")}
              aria-label="Dash"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <span className="text-gray-900 font-bold text-xs sm:text-sm">DASH</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
