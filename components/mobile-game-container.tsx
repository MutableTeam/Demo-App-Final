"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { gameInputHandler } from "@/utils/game-input-handler"
import { cn } from "@/lib/utils"

interface JoystickProps {
  onMove: (x: number, y: number, distance: number, angle: number, isActive: boolean) => void
  className?: string
  size?: number
}

function Joystick({ onMove, className, size = 80 }: JoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 })

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true)
    updateKnobPosition(clientX, clientY)
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return
    updateKnobPosition(clientX, clientY)
  }

  const handleEnd = () => {
    setIsDragging(false)
    setKnobPosition({ x: 0, y: 0 })
    onMove(0, 0, 0, 0, false)
  }

  const updateKnobPosition = (clientX: number, clientY: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = clientX - centerX
    const deltaY = clientY - centerY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const maxDistance = size / 2 - 10

    let x = deltaX
    let y = deltaY

    if (distance > maxDistance) {
      const ratio = maxDistance / distance
      x = deltaX * ratio
      y = deltaY * ratio
    }

    setKnobPosition({ x, y })

    const normalizedX = x / maxDistance
    const normalizedY = y / maxDistance
    const normalizedDistance = Math.min(distance / maxDistance, 1)
    const angle = Math.atan2(y, x)

    onMove(normalizedX, normalizedY, normalizedDistance, angle, normalizedDistance > 0.1)
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    handleEnd()
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    if (touch) {
      handleMove(touch.clientX, touch.clientY)
    }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault()
    handleEnd()
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleTouchEnd, { passive: false })
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isDragging])

  return (
    <div
      ref={containerRef}
      className={cn("relative rounded-full border-2 border-white/30 bg-black/20 backdrop-blur-sm", className)}
      style={{ width: size, height: size }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div
        ref={knobRef}
        className="absolute w-6 h-6 bg-white/80 rounded-full border border-white/50 transition-all duration-75"
        style={{
          left: `calc(50% + ${knobPosition.x}px - 12px)`,
          top: `calc(50% + ${knobPosition.y}px - 12px)`,
          transform: isDragging ? "scale(1.1)" : "scale(1)",
        }}
      />
    </div>
  )
}

interface ActionButtonProps {
  onPress: (pressed: boolean) => void
  children: React.ReactNode
  className?: string
}

function ActionButton({ onPress, children, className }: ActionButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleStart = () => {
    setIsPressed(true)
    onPress(true)
  }

  const handleEnd = () => {
    setIsPressed(false)
    onPress(false)
  }

  return (
    <button
      className={cn(
        "w-12 h-12 rounded-full border-2 border-white/30 bg-black/20 backdrop-blur-sm",
        "flex items-center justify-center text-white font-bold text-sm",
        "active:scale-95 transition-all duration-75",
        isPressed && "bg-white/30 scale-95",
        className,
      )}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
    >
      {children}
    </button>
  )
}

interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
}

export default function MobileGameContainer({ children, className }: MobileGameContainerProps) {
  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth)
    }

    checkOrientation()
    window.addEventListener("resize", checkOrientation)
    window.addEventListener("orientationchange", checkOrientation)

    return () => {
      window.removeEventListener("resize", checkOrientation)
      window.removeEventListener("orientationchange", checkOrientation)
    }
  }, [])

  const handleMovementJoystick = (x: number, y: number, distance: number, angle: number, isActive: boolean) => {
    gameInputHandler.updateMovementJoystick(x, y, distance, angle, isActive)
  }

  const handleAimingJoystick = (x: number, y: number, distance: number, angle: number, isActive: boolean) => {
    gameInputHandler.updateAimingJoystick(x, y, distance, angle, isActive)
  }

  const handleActionButton = (button: "dash" | "special" | "explosiveArrow", pressed: boolean) => {
    gameInputHandler.updateActionButton(button, pressed)
  }

  if (isPortrait) {
    return (
      <div className={cn("relative w-full h-full flex flex-col", className)}>
        {/* Game area */}
        <div className="flex-1 relative">{children}</div>

        {/* Controls area */}
        <div className="h-48 bg-black/10 backdrop-blur-sm border-t border-white/20 p-4">
          <div className="flex justify-between items-center h-full">
            {/* Movement joystick */}
            <div className="flex flex-col items-center">
              <Joystick onMove={handleMovementJoystick} size={80} />
              <span className="text-white/60 text-xs mt-1">Move</span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <ActionButton onPress={(pressed) => handleActionButton("dash", pressed)}>DASH</ActionButton>
              <ActionButton onPress={(pressed) => handleActionButton("special", pressed)}>SPEC</ActionButton>
              <ActionButton onPress={(pressed) => handleActionButton("explosiveArrow", pressed)}>EXPL</ActionButton>
            </div>

            {/* Aiming joystick */}
            <div className="flex flex-col items-center">
              <Joystick onMove={handleAimingJoystick} size={80} />
              <span className="text-white/60 text-xs mt-1">Aim</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative w-full h-full", className)}>
      {children}

      {/* Landscape controls overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Movement joystick - bottom left */}
        <div className="absolute bottom-4 left-4 pointer-events-auto">
          <Joystick onMove={handleMovementJoystick} size={100} />
        </div>

        {/* Aiming joystick - bottom right */}
        <div className="absolute bottom-4 right-4 pointer-events-auto">
          <Joystick onMove={handleAimingJoystick} size={100} />
        </div>

        {/* Action buttons - right side */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 pointer-events-auto">
          <ActionButton onPress={(pressed) => handleActionButton("dash", pressed)}>DASH</ActionButton>
          <ActionButton onPress={(pressed) => handleActionButton("special", pressed)}>SPEC</ActionButton>
          <ActionButton onPress={(pressed) => handleActionButton("explosiveArrow", pressed)}>EXPL</ActionButton>
        </div>
      </div>
    </div>
  )
}
