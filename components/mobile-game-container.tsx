"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
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

interface TouchAimingProps {
  onAiming: (angle: number, power: number) => void
  onShoot: () => void
  className?: string
}

function TouchAiming({ onAiming, onShoot, className }: TouchAimingProps) {
  const aimingRef = useRef<HTMLDivElement>(null)
  const [isAiming, setIsAiming] = useState(false)
  const [aimStart, setAimStart] = useState({ x: 0, y: 0 })
  const [aimCurrent, setAimCurrent] = useState({ x: 0, y: 0 })
  const [touchId, setTouchId] = useState<number | null>(null)

  useEffect(() => {
    const aimingArea = aimingRef.current
    if (!aimingArea) return

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      if (!touch) return

      setTouchId(touch.identifier)
      const rect = aimingArea.getBoundingClientRect()
      const startX = touch.clientX - rect.left
      const startY = touch.clientY - rect.top

      setAimStart({ x: startX, y: startY })
      setAimCurrent({ x: startX, y: startY })
      setIsAiming(true)
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (!isAiming || touchId === null) return

      // Find the touch with matching identifier
      const touch = Array.from(e.touches).find((t) => t.identifier === touchId)
      if (!touch) return

      const rect = aimingArea.getBoundingClientRect()
      const currentX = touch.clientX - rect.left
      const currentY = touch.clientY - rect.top

      setAimCurrent({ x: currentX, y: currentY })

      // Calculate angle and power
      const deltaX = currentX - aimStart.x
      const deltaY = currentY - aimStart.y
      const angle = Math.atan2(deltaY, deltaX)
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const maxDistance = 100 // Maximum aiming distance
      const power = Math.min(distance / maxDistance, 1)

      onAiming(angle, power)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      if (!isAiming || touchId === null) return

      // Check if the released touch matches our tracking touch
      const releasedTouch = Array.from(e.changedTouches).find((t) => t.identifier === touchId)
      if (!releasedTouch) return

      setIsAiming(false)
      setTouchId(null)
      onShoot()
    }

    // Add event listeners
    aimingArea.addEventListener("touchstart", handleTouchStart, { passive: false })
    aimingArea.addEventListener("touchmove", handleTouchMove, { passive: false })
    aimingArea.addEventListener("touchend", handleTouchEnd, { passive: false })

    return () => {
      aimingArea.removeEventListener("touchstart", handleTouchStart)
      aimingArea.removeEventListener("touchmove", handleTouchMove)
      aimingArea.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isAiming, touchId, aimStart, onAiming, onShoot])

  const renderAimingLine = () => {
    if (!isAiming) return null

    const deltaX = aimCurrent.x - aimStart.x
    const deltaY = aimCurrent.y - aimStart.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const maxDistance = 100

    // Limit the line length
    const limitedDistance = Math.min(distance, maxDistance)
    const angle = Math.atan2(deltaY, deltaX)
    const endX = aimStart.x + Math.cos(angle) * limitedDistance
    const endY = aimStart.y + Math.sin(angle) * limitedDistance

    return (
      <svg className="absolute inset-0 pointer-events-none" style={{ width: "100%", height: "100%" }}>
        {/* Aiming line */}
        <line
          x1={aimStart.x}
          y1={aimStart.y}
          x2={endX}
          y2={endY}
          stroke="#00ffff"
          strokeWidth="3"
          strokeDasharray="5,5"
        />
        {/* Start point */}
        <circle cx={aimStart.x} cy={aimStart.y} r="8" fill="#00ffff" fillOpacity="0.7" />
        {/* End point */}
        <circle cx={endX} cy={endY} r="6" fill="#ff00ff" fillOpacity="0.8" />
        {/* Power indicator */}
        <circle
          cx={aimStart.x}
          cy={aimStart.y}
          r={8 + (limitedDistance / maxDistance) * 20}
          fill="none"
          stroke="#00ffff"
          strokeWidth="2"
          strokeOpacity="0.5"
        />
      </svg>
    )
  }

  return (
    <div
      ref={aimingRef}
      className={cn(
        "relative w-full h-full bg-slate-900/30 backdrop-blur-sm",
        "border border-cyan-500/30 rounded-lg",
        "flex items-center justify-center",
        "touch-none select-none",
        className,
      )}
    >
      {renderAimingLine()}
      <div className="text-cyan-300 text-sm font-medium opacity-70 pointer-events-none">
        {isAiming ? "Release to Shoot" : "Touch & Drag to Aim"}
      </div>
    </div>
  )
}

interface ActionButtonProps {
  label: string
  action: string
  onPress: (action: string, pressed: boolean) => void
  className?: string
  variant?: "primary" | "secondary"
}

function ActionButton({ label, action, onPress, className, variant = "primary" }: ActionButtonProps) {
  const handleStart = () => onPress(action, true)
  const handleEnd = () => onPress(action, false)

  return (
    <button
      className={cn(
        "w-16 h-16 rounded-full border-2 font-bold text-sm transition-all duration-150",
        "touch-none select-none active:scale-95",
        "shadow-[0_0_10px_rgba(0,255,255,0.3)]",
        variant === "primary"
          ? "border-cyan-400/70 bg-cyan-500/20 text-cyan-300 active:bg-cyan-500/40"
          : "border-purple-400/70 bg-purple-500/20 text-purple-300 active:bg-purple-500/40",
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

export default function MobileGameContainer({
  children,
  className,
  onJoystickMove = () => {},
  onActionPress = () => {},
  onAiming = () => {},
  onShoot = () => {},
}: MobileGameContainerProps) {
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 })

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

  return (
    <div className={cn("w-full h-screen bg-black flex landscape:flex-row portrait:flex-col", className)}>
      {/* Left Controls - Joystick */}
      <div className="landscape:w-40 landscape:h-full portrait:w-full portrait:h-40 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
        <div className="relative">
          <Joystick
            size={120}
            sticky={false}
            baseColor="#1e293b"
            stickColor="#00ffff"
            move={handleJoystickMove}
            stop={handleJoystickStop}
            throttle={50}
            baseShape="circle"
            stickShape="circle"
            controlPlaneShape="circle"
          />
          {/* Movement indicator */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-cyan-300 opacity-70">
            Move
          </div>
        </div>
      </div>

      {/* Game Area - Centered and scaled to fit */}
      <div className="flex-1 flex items-center justify-center p-2">
        <div className="w-full h-full max-w-full max-h-full overflow-hidden rounded-lg border border-cyan-500/30 shadow-[0_0_20px_rgba(0,255,255,0.2)]">
          {children}
        </div>
      </div>

      {/* Right Controls - Aiming Area */}
      <div className="landscape:w-40 landscape:h-full portrait:w-full portrait:h-40 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm gap-4">
        {/* Aiming Area */}
        <div className="flex-1 w-full max-w-32 max-h-32 landscape:max-w-full landscape:max-h-full">
          <TouchAiming onAiming={onAiming} onShoot={onShoot} className="w-full h-full" />
        </div>

        {/* Action Buttons */}
        <div className="flex landscape:flex-col portrait:flex-row gap-2">
          <ActionButton
            label="DASH"
            action="dash"
            onPress={onActionPress}
            variant="secondary"
            className="w-12 h-12 text-xs"
          />
          <ActionButton
            label="SPEC"
            action="special"
            onPress={onActionPress}
            variant="primary"
            className="w-12 h-12 text-xs"
          />
        </div>
      </div>
    </div>
  )
}
