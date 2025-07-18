"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
  onJoystickMove?: (direction: { x: number; y: number }) => void
  onActionPress?: (action: string, pressed: boolean) => void
}

interface JoystickProps {
  onMove: (direction: { x: number; y: number }) => void
  className?: string
}

function VirtualJoystick({ onMove, className }: JoystickProps) {
  const joystickRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const centerX = useRef(0)
  const centerY = useRef(0)
  const maxDistance = 40 // Maximum distance from center

  useEffect(() => {
    const joystick = joystickRef.current
    const knob = knobRef.current
    if (!joystick || !knob) return

    const updateCenter = () => {
      const rect = joystick.getBoundingClientRect()
      centerX.current = rect.width / 2
      centerY.current = rect.height / 2
    }

    const handleStart = (clientX: number, clientY: number) => {
      isDragging.current = true
      updateCenter()
      joystick.style.opacity = "1"
    }

    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging.current) return

      const rect = joystick.getBoundingClientRect()
      const x = clientX - rect.left - centerX.current
      const y = clientY - rect.top - centerY.current

      const distance = Math.sqrt(x * x + y * y)
      const angle = Math.atan2(y, x)

      const constrainedDistance = Math.min(distance, maxDistance)
      const knobX = Math.cos(angle) * constrainedDistance
      const knobY = Math.sin(angle) * constrainedDistance

      knob.style.transform = `translate(${knobX}px, ${knobY}px)`

      // Normalize values between -1 and 1
      const normalizedX = knobX / maxDistance
      const normalizedY = knobY / maxDistance

      onMove({ x: normalizedX, y: normalizedY })
    }

    const handleEnd = () => {
      isDragging.current = false
      knob.style.transform = "translate(0px, 0px)"
      joystick.style.opacity = "0.7"
      onMove({ x: 0, y: 0 })
    }

    // Touch events
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      handleStart(touch.clientX, touch.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      handleMove(touch.clientX, touch.clientY)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      handleEnd()
    }

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault()
      handleStart(e.clientX, e.clientY)
    }

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      handleMove(e.clientX, e.clientY)
    }

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      handleEnd()
    }

    // Add event listeners
    joystick.addEventListener("touchstart", handleTouchStart, { passive: false })
    joystick.addEventListener("mousedown", handleMouseDown)

    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd, { passive: false })
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      joystick.removeEventListener("touchstart", handleTouchStart)
      joystick.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [onMove])

  return (
    <div
      ref={joystickRef}
      className={cn(
        "relative w-24 h-24 rounded-full border-2 border-cyan-400/50 bg-slate-800/80 backdrop-blur-sm",
        "shadow-[0_0_15px_rgba(0,255,255,0.3)] opacity-70 transition-opacity duration-200",
        "touch-none select-none",
        className,
      )}
    >
      <div
        ref={knobRef}
        className="absolute top-1/2 left-1/2 w-8 h-8 -mt-4 -ml-4 rounded-full bg-cyan-400 shadow-lg transition-transform duration-75 ease-out"
        style={{ transform: "translate(0px, 0px)" }}
      />
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
}: MobileGameContainerProps) {
  return (
    <div className={cn("w-full h-screen bg-black flex landscape:flex-row portrait:flex-col", className)}>
      {/* Left Controls - Joystick */}
      <div className="landscape:w-32 landscape:h-full portrait:w-full portrait:h-32 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
        <VirtualJoystick onMove={onJoystickMove} />
      </div>

      {/* Game Area - Centered and scaled to fit */}
      <div className="flex-1 flex items-center justify-center p-2">
        <div className="w-full h-full max-w-full max-h-full overflow-hidden rounded-lg border border-cyan-500/30 shadow-[0_0_20px_rgba(0,255,255,0.2)]">
          {children}
        </div>
      </div>

      {/* Right Controls - Action Buttons */}
      <div className="landscape:w-32 landscape:h-full portrait:w-full portrait:h-32 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
        <div className="flex landscape:flex-col portrait:flex-row gap-4">
          <ActionButton label="FIRE" action="shoot" onPress={onActionPress} variant="primary" />
          <ActionButton label="SPEC" action="special" onPress={onActionPress} variant="secondary" />
          <ActionButton label="DASH" action="dash" onPress={onActionPress} variant="primary" />
        </div>
      </div>
    </div>
  )
}
