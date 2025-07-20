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
}

function ActionButton({ label, action, onPress, className }: ActionButtonProps) {
  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    onPress(action, true)
  }
  const handleEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    onPress(action, false)
  }

  return (
    <button
      className={cn(
        "w-16 h-16 rounded-full border-2 font-bold text-sm transition-all duration-150",
        "touch-none select-none active:scale-95",
        "bg-gray-700/80 border-gray-500/70 text-white active:bg-gray-600/90",
        "shadow-[3px_3px_0px_rgba(0,0,0,0.4)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5",
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
    <div className={cn("grid grid-cols-3 gap-1 w-[78px]", className)}>
      <div />
      <div className="w-6 h-6 bg-gray-600/70 border border-gray-500/60 rounded-sm" />
      <div />
      <div className="w-6 h-6 bg-gray-600/70 border border-gray-500/60 rounded-sm" />
      <div className="w-6 h-6 bg-gray-600/70 border border-gray-500/60 rounded-sm" />
      <div className="w-6 h-6 bg-gray-600/70 border border-gray-500/60 rounded-sm" />
      <div />
      <div className="w-6 h-6 bg-gray-600/70 border border-gray-500/60 rounded-sm" />
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
    const normalizedY = event.y ? -event.y / 50 : 0 // Y-axis is often inverted in game engines
    onJoystickMove({ x: normalizedX, y: normalizedY })
  }

  const handleJoystickStop = () => {
    onJoystickMove({ x: 0, y: 0 })
  }

  // Portrait Layout - Accurately matching the desired handheld console design
  if (!isLandscape) {
    return (
      <div className={cn("w-full h-screen bg-[#202020] flex flex-col p-2", className)}>
        <div className="w-full h-full bg-[#333333] rounded-2xl p-2 flex flex-col shadow-2xl">
          {/* Game Screen Area */}
          <div className="flex-1 flex items-center justify-center bg-black rounded-lg border-2 border-black/50 overflow-hidden mb-2">
            {children}
          </div>

          {/* Control Panel Area */}
          <div className="h-[200px] flex items-center justify-between px-4">
            {/* Left Controls */}
            <div className="flex flex-col items-center space-y-3">
              <Joystick
                size={90}
                sticky={false}
                baseColor="#4a4a4a"
                stickColor="#2d2d2d"
                move={handleJoystickMove}
                stop={handleJoystickStop}
                throttle={50}
              />
              <DirectionalPad />
              <div className="text-xs text-gray-400 font-mono tracking-wider">MOVE</div>
            </div>

            {/* Right Controls */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative w-32 h-32">
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
    <div className={cn("w-full h-screen bg-[#202020] flex items-center p-2", className)}>
      <div className="w-full h-full bg-[#333333] rounded-2xl p-2 flex shadow-2xl">
        {/* Left Controls */}
        <div className="w-[180px] flex flex-col items-center justify-center space-y-6">
          <Joystick
            size={100}
            sticky={false}
            baseColor="#4a4a4a"
            stickColor="#2d2d2d"
            move={handleJoystickMove}
            stop={handleJoystickStop}
            throttle={50}
          />
          <DirectionalPad />
        </div>

        {/* Game Screen Area */}
        <div className="flex-1 h-full bg-black rounded-lg border-2 border-black/50 overflow-hidden">{children}</div>

        {/* Right Controls */}
        <div className="w-[180px] flex items-center justify-center">
          <div className="relative w-32 h-32">
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
