"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Joystick } from "react-joystick-component"
import { cn } from "@/lib/utils"

interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
  onJoystickMove?: (direction: { x: number; y: number }) => void
  onActionPress?: (action: string, pressed: boolean) => void
  onAiming?: (angle: number, power: number) => void
  onShoot?: () => void
}

interface ActionButtonProps {
  label: string
  action: string
  onPress: (action: string, pressed: boolean) => void
  className?: string
  variant?: "primary" | "secondary"
  size?: "small" | "medium" | "large"
}

function ActionButton({ label, action, onPress, className, variant = "primary", size = "medium" }: ActionButtonProps) {
  const handleStart = () => onPress(action, true)
  const handleEnd = () => onPress(action, false)

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
        "shadow-[0_0_10px_rgba(0,255,255,0.3)]",
        "bg-gray-600/80 border-gray-400/70 text-white active:bg-gray-500/90",
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
    <div className={cn("grid grid-cols-3 gap-1", className)}>
      {/* Top row */}
      <div></div>
      <div className="w-6 h-6 bg-gray-600/60 border border-gray-400/50 rounded-sm"></div>
      <div></div>

      {/* Middle row */}
      <div className="w-6 h-6 bg-gray-600/60 border border-gray-400/50 rounded-sm"></div>
      <div className="w-6 h-6 bg-gray-600/60 border border-gray-400/50 rounded-sm"></div>
      <div className="w-6 h-6 bg-gray-600/60 border border-gray-400/50 rounded-sm"></div>

      {/* Bottom row */}
      <div></div>
      <div className="w-6 h-6 bg-gray-600/60 border border-gray-400/50 rounded-sm"></div>
      <div></div>
    </div>
  )
}

export default function MobileGameContainer({
  children,
  className,
  onJoystickMove = () => {},
  onActionPress = () => {},
  onAiming = () => {},
  onShoot = () => {},
}: MobileGameContainerProps) {
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 })
  const [isLandscape, setIsLandscape] = useState(false)

  // Detect orientation changes
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight)
    }

    checkOrientation()
    window.addEventListener("resize", checkOrientation)
    window.addEventListener("orientationchange", checkOrientation)

    return () => {
      window.removeEventListener("resize", checkOrientation)
      window.removeEventListener("orientationchange", checkOrientation)
    }
  }, [])

  const handleJoystickMove = (event: any) => {
    if (event) {
      // Normalize the joystick values (-100 to 100) to (-1 to 1)
      const normalizedX = event.x ? event.x / 100 : 0
      const normalizedY = event.y ? event.y / 100 : 0

      setJoystickPosition({ x: normalizedX, y: normalizedY })
      onJoystickMove({ x: normalizedX, y: normalizedY })
    }
  }

  const handleJoystickStop = () => {
    setJoystickPosition({ x: 0, y: 0 })
    onJoystickMove({ x: 0, y: 0 })
  }

  // Portrait Layout - Matching the desired image exactly
  if (!isLandscape) {
    return (
      <div className={cn("w-full h-screen bg-gray-800 flex flex-col relative overflow-hidden", className)}>
        {/* Game Area - Centered with proper aspect ratio */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md aspect-[4/3] bg-black border-2 border-gray-600 rounded-lg overflow-hidden shadow-lg">
            {children}
          </div>
        </div>

        {/* Bottom Controls Area - Fixed height to match image proportions */}
        <div className="h-40 relative bg-gray-800 flex items-center justify-between px-8 pb-4">
          {/* Left Side - Movement Controls */}
          <div className="flex flex-col items-center space-y-3">
            {/* Joystick */}
            <div className="relative">
              <Joystick
                size={70}
                sticky={false}
                baseColor="#4B5563"
                stickColor="#6B7280"
                move={handleJoystickMove}
                stop={handleJoystickStop}
                throttle={50}
                baseShape="circle"
                stickShape="circle"
                controlPlaneShape="circle"
              />
            </div>

            {/* Directional Pad */}
            <DirectionalPad />

            {/* Label */}
            <div className="text-xs text-gray-400 font-medium tracking-wider">MOVE</div>
          </div>

          {/* Right Side - Action Controls */}
          <div className="flex flex-col items-center space-y-3">
            {/* Action Buttons in Diamond Formation */}
            <div className="relative w-24 h-24">
              {/* Top Button - Y */}
              <ActionButton
                label="Y"
                action="special"
                onPress={onActionPress}
                size="medium"
                className="absolute top-0 left-1/2 transform -translate-x-1/2"
              />

              {/* Left Button - X */}
              <ActionButton
                label="X"
                action="dash"
                onPress={onActionPress}
                size="medium"
                className="absolute top-1/2 left-0 transform -translate-y-1/2"
              />

              {/* Right Button - A */}
              <ActionButton
                label="A"
                action="shoot"
                onPress={onActionPress}
                size="medium"
                className="absolute top-1/2 right-0 transform -translate-y-1/2"
              />

              {/* Bottom Button - B */}
              <ActionButton
                label="B"
                action="aim"
                onPress={onActionPress}
                size="medium"
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
              />
            </div>

            {/* Label */}
            <div className="text-xs text-gray-400 font-medium tracking-wider">ACTIONS</div>
          </div>
        </div>
      </div>
    )
  }

  // Landscape Layout - Simplified for now
  return (
    <div className={cn("w-full h-screen bg-gray-800 flex flex-row relative", className)}>
      {/* Left Controls */}
      <div className="w-32 h-full flex flex-col items-center justify-center bg-gray-900/50 space-y-4">
        <div className="relative">
          <Joystick
            size={80}
            sticky={false}
            baseColor="#4B5563"
            stickColor="#6B7280"
            move={handleJoystickMove}
            stop={handleJoystickStop}
            throttle={50}
            baseShape="circle"
            stickShape="circle"
            controlPlaneShape="circle"
          />
        </div>
        <DirectionalPad />
        <div className="text-xs text-gray-400 font-medium">MOVE</div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full h-full bg-black border-2 border-gray-600 rounded-lg overflow-hidden">{children}</div>
      </div>

      {/* Right Controls */}
      <div className="w-32 h-full flex flex-col items-center justify-center bg-gray-900/50 space-y-4">
        <div className="relative w-20 h-20">
          <ActionButton
            label="Y"
            action="special"
            onPress={onActionPress}
            size="small"
            className="absolute top-0 left-1/2 transform -translate-x-1/2"
          />
          <ActionButton
            label="X"
            action="dash"
            onPress={onActionPress}
            size="small"
            className="absolute top-1/2 left-0 transform -translate-y-1/2"
          />
          <ActionButton
            label="A"
            action="shoot"
            onPress={onActionPress}
            size="small"
            className="absolute top-1/2 right-0 transform -translate-y-1/2"
          />
          <ActionButton
            label="B"
            action="aim"
            onPress={onActionPress}
            size="small"
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
          />
        </div>
        <div className="text-xs text-gray-400 font-medium">ACTIONS</div>
      </div>
    </div>
  )
}
