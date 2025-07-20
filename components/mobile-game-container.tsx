"use client"

import type React from "react"
import { useState, useEffect, type ReactNode } from "react"
import { Joystick } from "react-joystick-component"
import type { IJoystickUpdateEvent } from "react-joystick-component/build/lib/Joystick"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { usePlatform } from "@/contexts/platform-context"
import { Gamepad2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"

interface MobileGameContainerProps {
  children: ReactNode
  onMove: (event: IJoystickUpdateEvent) => void
  onAction: (action: string) => void
}

const ActionButton = ({
  label,
  onClick,
  className,
}: {
  label: string
  onClick: () => void
  className?: string
}) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={cn(
      "w-16 h-16 rounded-full bg-gray-700 text-white font-bold text-lg flex items-center justify-center border-2 border-gray-600 shadow-md",
      className,
    )}
  >
    {label}
  </motion.button>
)

const DPadButton = ({
  icon: Icon,
  className,
}: {
  icon: React.ElementType
  className?: string
}) => (
  <div
    className={cn(
      "w-10 h-10 bg-gray-700 flex items-center justify-center rounded-sm border-2 border-gray-600",
      className,
    )}
  >
    <Icon className="w-6 h-6 text-gray-400" />
  </div>
)

export function MobileGameContainer({ children, onMove, onAction }: MobileGameContainerProps) {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")
  const { platformType } = usePlatform()

  useEffect(() => {
    const handleResize = () => {
      const newOrientation = window.innerWidth > window.innerHeight ? "landscape" : "portrait"
      if (newOrientation !== orientation) {
        setOrientation(newOrientation)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [orientation])

  if (platformType !== "mobile") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white">
        Please view on a mobile device.
      </div>
    )
  }

  const renderPortraitLayout = () => (
    <div className="w-full h-full flex flex-col bg-[#2d2d2d] text-white font-mono">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full aspect-[4/3] bg-black border-4 border-gray-500 rounded-md overflow-hidden">
          {children}
        </div>
      </div>
      <div className="h-48 bg-gray-800 border-t-4 border-gray-600 p-4 flex justify-between items-center">
        {/* Left Controls */}
        <div className="flex items-center gap-4">
          <Joystick size={70} baseColor="#4a4a4a" stickColor="#6b6b6b" move={onMove} />
          <div className="grid grid-cols-3 grid-rows-3 w-32 h-32">
            <DPadButton icon={ArrowUp} className="col-start-2" />
            <DPadButton icon={ArrowLeft} className="row-start-2" />
            <div className="w-10 h-10 bg-gray-800 flex items-center justify-center row-start-2 col-start-2">
              <Gamepad2 className="w-6 h-6 text-gray-500" />
            </div>
            <DPadButton icon={ArrowRight} className="row-start-2 col-start-3" />
            <DPadButton icon={ArrowDown} className="row-start-3 col-start-2" />
          </div>
        </div>
        {/* Right Controls */}
        <div className="grid grid-cols-3 grid-rows-3 w-48 h-48">
          <ActionButton label="Y" onClick={() => onAction("Y")} className="col-start-2" />
          <ActionButton label="X" onClick={() => onAction("X")} className="row-start-2" />
          <ActionButton label="A" onClick={() => onAction("A")} className="row-start-2 col-start-3" />
          <ActionButton label="B" onClick={() => onAction("B")} className="row-start-3 col-start-2" />
        </div>
      </div>
    </div>
  )

  const renderLandscapeLayout = () => (
    <div className="w-full h-full flex bg-[#2d2d2d] text-white font-mono">
      {/* Left Controls */}
      <div className="w-48 bg-gray-800 border-r-4 border-gray-600 p-4 flex flex-col justify-center items-center gap-4">
        <Joystick size={100} baseColor="#4a4a4a" stickColor="#6b6b6b" move={onMove} />
        <div className="grid grid-cols-3 grid-rows-2 w-32">
          <DPadButton icon={ArrowLeft} className="row-start-2" />
          <DPadButton icon={ArrowUp} className="col-start-2" />
          <DPadButton icon={ArrowDown} className="col-start-2 row-start-2" />
          <DPadButton icon={ArrowRight} className="col-start-3 row-start-2" />
        </div>
      </div>
      {/* Game Screen */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full h-full bg-black border-4 border-gray-500 rounded-md overflow-hidden">{children}</div>
      </div>
      {/* Right Controls */}
      <div className="w-48 bg-gray-800 border-l-4 border-gray-600 p-4 flex flex-col justify-center items-center">
        <div className="grid grid-cols-3 grid-rows-3 w-48 h-48">
          <ActionButton label="Y" onClick={() => onAction("Y")} className="col-start-2" />
          <ActionButton label="X" onClick={() => onAction("X")} className="row-start-2" />
          <ActionButton label="A" onClick={() => onAction("A")} className="row-start-2 col-start-3" />
          <ActionButton label="B" onClick={() => onAction("B")} className="row-start-3 col-start-2" />
        </div>
      </div>
    </div>
  )

  return orientation === "portrait" ? renderPortraitLayout() : renderLandscapeLayout()
}

export default MobileGameContainer
