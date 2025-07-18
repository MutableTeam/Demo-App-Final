"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Joystick } from "react-joystick-component"
import { cn } from "@/lib/utils"
import { useOrientation } from "@/hooks/use-orientation"
import { Zap, Shield, Wind } from "lucide-react"

interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
  onJoystickMove?: (direction: { x: number; y: number }) => void
  onActionPress?: (action: string, pressed: boolean) => void
}

interface ActionButtonProps {
  action: string
  onPress: (action: string, pressed: boolean) => void
  className?: string
  children: React.ReactNode
  variant?: "primary" | "secondary"
}

function ActionButton({ action, onPress, className, children, variant = "primary" }: ActionButtonProps) {
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onPress(action, true)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onPress(action, false)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onPress(action, true)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onPress(action, false)
  }

  return (
    <button
      className={cn(
        "w-16 h-16 rounded-full border-2 font-bold text-sm transition-all duration-150",
        "touch-none select-none active:scale-95 active:brightness-125",
        "flex items-center justify-center",
        "shadow-[0_0_15px_rgba(0,255,255,0.3)]",
        variant === "primary"
          ? "bg-cyan-500/20 border-cyan-400/70 text-cyan-300"
          : "bg-purple-500/20 border-purple-400/70 text-purple-300",
        className,
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {children}
    </button>
  )
}

export default function MobileGameContainer({
  children,
  className,
  onJoystickMove = () => {},
  onActionPress = () => {},
}: MobileGameContainerProps) {
  const orientation = useOrientation()
  const [isJoystickActive, setIsJoystickActive] = useState(false)

  // Debug logging
  useEffect(() => {
    console.log("MobileGameContainer mounted, orientation:", orientation)
  }, [orientation])

  const handleJoystickMove = (event: any) => {
    if (event) {
      const normalizedX = event.x ? event.x / 100 : 0
      const normalizedY = event.y ? -event.y / 100 : 0 // Invert Y axis

      console.log("Joystick move:", { x: normalizedX, y: normalizedY })
      setIsJoystickActive(Math.abs(normalizedX) > 0.1 || Math.abs(normalizedY) > 0.1)
      onJoystickMove({ x: normalizedX, y: normalizedY })
    }
  }

  const handleJoystickStop = () => {
    console.log("Joystick stopped")
    setIsJoystickActive(false)
    onJoystickMove({ x: 0, y: 0 })
  }

  const handleActionPress = (action: string, pressed: boolean) => {
    console.log("Action button:", action, pressed)
    onActionPress(action, pressed)
  }

  if (orientation === "landscape") {
    // Horizontal Layout: [Joystick | Game | Action Buttons]
    return (
      <div className={cn("w-full h-screen bg-black flex flex-row overflow-hidden", className)}>
        {/* Left Side - Joystick */}
        <div className="w-[150px] h-full flex items-center justify-center bg-slate-900/80 backdrop-blur-sm border-r border-cyan-500/30">
          <div className="flex flex-col items-center gap-2">
            <Joystick
              size={100}
              sticky={false}
              baseColor="rgba(30, 41, 59, 0.8)"
              stickColor="rgba(0, 255, 255, 0.9)"
              move={handleJoystickMove}
              stop={handleJoystickStop}
              throttle={50}
            />
            <div className="text-xs text-cyan-300/70 font-medium">Move</div>
          </div>
        </div>

        {/* Center - Game Area */}
        <div className="flex-1 h-full relative overflow-hidden">{children}</div>

        {/* Right Side - Action Buttons */}
        <div className="w-[150px] h-full flex items-center justify-center bg-slate-900/80 backdrop-blur-sm border-l border-cyan-500/30">
          <div className="flex flex-col items-center gap-4">
            <div className="text-xs text-cyan-300/70 font-medium mb-2">Actions</div>
            <ActionButton action="shoot" onPress={handleActionPress} variant="primary" className="w-14 h-14">
              <Zap size={20} />
            </ActionButton>
            <ActionButton action="dash" onPress={handleActionPress} variant="secondary" className="w-14 h-14">
              <Wind size={20} />
            </ActionButton>
            <ActionButton action="special" onPress={handleActionPress} variant="primary" className="w-14 h-14">
              <Shield size={20} />
            </ActionButton>
          </div>
        </div>
      </div>
    )
  }

  // Portrait Layout: [Game] / [Controls]
  return (
    <div className={cn("w-full h-screen bg-black flex flex-col overflow-hidden", className)}>
      {/* Top - Game Area */}
      <div className="w-full flex-1 relative overflow-hidden min-h-0">{children}</div>

      {/* Bottom - Controls Area */}
      <div className="w-full h-[200px] bg-slate-900/80 backdrop-blur-sm flex flex-row border-t border-cyan-500/30">
        {/* Left Side - Joystick */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Joystick
              size={120}
              sticky={false}
              baseColor="rgba(30, 41, 59, 0.8)"
              stickColor="rgba(0, 255, 255, 0.9)"
              move={handleJoystickMove}
              stop={handleJoystickStop}
              throttle={50}
            />
            <div className="text-xs text-cyan-300/70 font-medium">Move</div>
          </div>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="text-xs text-cyan-300/70 font-medium">Actions</div>
            <ActionButton action="shoot" onPress={handleActionPress} variant="primary">
              <Zap size={24} />
            </ActionButton>
            <ActionButton action="dash" onPress={handleActionPress} variant="secondary">
              <Wind size={24} />
            </ActionButton>
            <ActionButton action="special" onPress={handleActionPress} variant="primary">
              <Shield size={24} />
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  )
}
