"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Joystick } from "react-joystick-component"
import { cn } from "@/lib/utils"
import type { IJoystickUpdateEvent } from "react-joystick-component/build/lib/Joystick"

interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
  onJoystickMove?: (direction: { x: number; y: number }) => void
  onActionPress?: (action: string, pressed: boolean) => void
}

interface ActionButtonProps {
  label: string
  action: string
  onPress: (action: string, pressed: boolean) => void
  className?: string
  size?: "small" | "medium" | "large"
}

function ActionButton({ label, action, onPress, className, size = "medium" }: ActionButtonProps) {
  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    onPress(action, true)
  }
  const handleEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    onPress(action, false)
  }

  const sizeClasses = {
    small: "w-12 h-12 text-xs",
    medium: "w-14 h-14 text-sm",
    large: "w-16 h-16 text-base",
  }

  return (
    <button
      className={cn(
        "rounded-full border-2 font-bold transition-all duration-150",
        "touch-none select-none active:scale-95",
        "bg-gray-600/80 border-gray-400/70 text-white active:bg-gray-500/90",
        "shadow-[2px_2px_0px_rgba(0,0,0,0.5)] active:shadow-none",
        sizeClasses[size],
        className,
      )}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      {label}
    </button>
  )
}

function DirectionalPad({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-3 gap-1 w-[72px]", className)}>
      <div />
      <div className="w-6 h-6 bg-gray-600/60 border border-gray-400/50 rounded-sm" />
      <div />
      <div className="w-6 h-6 bg-gray-600/60 border border-gray-400/50 rounded-sm" />
      <div className="w-6 h-6 bg-gray-600/60 border border-gray-400/50 rounded-sm" />
      <div className="w-6 h-6 bg-gray-600/60 border border-gray-400/50 rounded-sm" />
      <div />
      <div className="w-6 h-6 bg-gray-600/60 border border-gray-400/50 rounded-sm" />
      <div />
    </div>
  )
}

export default function MobileGameContainer({
  children,
  className,
  onJoystickMove = () => {},
  onActionPress = () => {},
}: MobileGameContainerProps) {
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight)
    }
    checkOrientation()
    window.addEventListener("resize", checkOrientation)
    return () => window.removeEventListener("resize", checkOrientation)
  }, [])

  const handleJoystickMove = (event: IJoystickUpdateEvent) => {
    const normalizedX = event.x ? event.x / 50 : 0
    const normalizedY = event.y ? -event.y / 50 : 0 // Invert Y-axis
    onJoystickMove({ x: normalizedX, y: normalizedY })
  }

  const handleJoystickStop = () => {
    onJoystickMove({ x: 0, y: 0 })
  }

  // Portrait Layout - Accurately matching the desired design
  if (!isLandscape) {
    return (
      <div className={cn("w-full h-screen bg-[#2d2d2d] flex flex-col p-2", className)}>
        <div className="w-full h-full bg-[#424242] rounded-2xl p-2 flex flex-col">
          {/* Game Screen Area */}
          <div className="flex-1 flex items-center justify-center bg-black rounded-lg border-2 border-gray-800/50 overflow-hidden">
            {children}
          </div>

          {/* Control Panel Area */}
          <div className="h-[180px] flex items-center justify-between px-4 pt-4">
            {/* Left Controls */}
            <div className="flex flex-col items-center space-y-2">
              <Joystick
                size={80}
                sticky={false}
                baseColor="#5a5a5a"
                stickColor="#424242"
                move={handleJoystickMove}
                stop={handleJoystickStop}
                throttle={50}
              />
              <DirectionalPad />
              <div className="text-xs text-gray-400 font-mono tracking-wider">MOVE</div>
            </div>

            {/* Right Controls */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative w-28 h-28">
                <ActionButton
                  label="Y"
                  action="actionY"
                  onPress={onActionPress}
                  className="absolute top-0 left-1/2 -translate-x-1/2"
                />
                <ActionButton
                  label="X"
                  action="actionX"
                  onPress={onActionPress}
                  className="absolute top-1/2 left-0 -translate-y-1/2"
                />
                <ActionButton
                  label="A"
                  action="actionA"
                  onPress={onActionPress}
                  className="absolute top-1/2 right-0 -translate-y-1/2"
                />
                <ActionButton
                  label="B"
                  action="actionB"
                  onPress={onActionPress}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2"
                />
              </div>
              <div className="text-xs text-gray-400 font-mono tracking-wider">ACTIONS</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Landscape Layout
  return (
    <div className={cn("w-full h-screen bg-[#2d2d2d] flex items-center p-2", className)}>
      <div className="w-full h-full bg-[#424242] rounded-2xl p-2 flex">
        {/* Left Controls */}
        <div className="w-[150px] flex flex-col items-center justify-center space-y-4">
          <Joystick
            size={100}
            sticky={false}
            baseColor="#5a5a5a"
            stickColor="#424242"
            move={handleJoystickMove}
            stop={handleJoystickStop}
            throttle={50}
          />
          <DirectionalPad />
        </div>

        {/* Game Screen Area */}
        <div className="flex-1 h-full bg-black rounded-lg border-2 border-gray-800/50 overflow-hidden">{children}</div>

        {/* Right Controls */}
        <div className="w-[150px] flex items-center justify-center">
          <div className="relative w-28 h-28">
            <ActionButton
              label="Y"
              action="actionY"
              onPress={onActionPress}
              className="absolute top-0 left-1/2 -translate-x-1/2"
            />
            <ActionButton
              label="X"
              action="actionX"
              onPress={onActionPress}
              className="absolute top-1/2 left-0 -translate-y-1/2"
            />
            <ActionButton
              label="A"
              action="actionA"
              onPress={onActionPress}
              className="absolute top-1/2 right-0 -translate-y-1/2"
            />
            <ActionButton
              label="B"
              action="actionB"
              onPress={onActionPress}
              className="absolute bottom-0 left-1/2 -translate-x-1/2"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
