"use client"

import type React from "react"

import { useEffect, useState, useRef, type ReactNode } from "react"
import { gameInputHandler } from "@/utils/game-input-handler"
import { useOrientation } from "@/hooks/use-orientation"
import { cn } from "@/lib/utils"

interface MobileGameContainerProps {
  children: ReactNode
  className?: string
}

interface JoystickProps {
  onMove: (direction: { x: number; y: number }) => void
  size?: number
}

function Joystick({ onMove, size = 120 }: JoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true)
    updatePosition(clientX, clientY)
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return
    updatePosition(clientX, clientY)
  }

  const handleEnd = () => {
    setIsDragging(false)
    setPosition({ x: 0, y: 0 })
    onMove({ x: 0, y: 0 })
  }

  const updatePosition = (clientX: number, clientY: number) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = clientX - centerX
    const deltaY = clientY - centerY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const maxDistance = size / 2 - 20

    let x = deltaX
    let y = deltaY

    if (distance > maxDistance) {
      x = (deltaX / distance) * maxDistance
      y = (deltaY / distance) * maxDistance
    }

    setPosition({ x, y })

    // Normalize to -1 to 1 range
    const normalizedX = x / maxDistance
    const normalizedY = y / maxDistance

    onMove({ x: normalizedX, y: normalizedY })
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
    <div className={cn("relative flex flex-col items-center gap-2")}>
      <div className="text-xs text-center text-cyan-400 font-mono font-bold">MOVE</div>
      <div
        ref={containerRef}
        className="relative flex items-center justify-center bg-gray-900/80 border-2 border-cyan-400/50 rounded-full backdrop-blur-sm"
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div
          ref={knobRef}
          className="absolute w-8 h-8 bg-cyan-400 border-2 border-cyan-300 rounded-full shadow-lg shadow-cyan-400/50 transition-transform"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        />
        {/* Center dot */}
        <div className="w-2 h-2 bg-cyan-400/30 rounded-full pointer-events-none" />
      </div>
    </div>
  )
}

interface ActionButtonProps {
  label: string
  onPress: (pressed: boolean) => void
  size?: number
  variant?: "primary" | "secondary"
}

function ActionButton({ label, onPress, size = 60, variant = "primary" }: ActionButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleStart = () => {
    setIsPressed(true)
    onPress(true)
  }

  const handleEnd = () => {
    setIsPressed(false)
    onPress(false)
  }

  const baseClasses =
    "flex items-center justify-center rounded-full border-2 font-mono font-bold text-xs select-none cursor-pointer transition-all duration-75"
  const variantClasses =
    variant === "primary"
      ? "border-cyan-400/70 bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-400/20"
      : "border-purple-400/70 bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-400/20"
  const pressedClasses = isPressed ? "scale-95 brightness-125" : "hover:brightness-110"

  return (
    <div
      className={cn(baseClasses, variantClasses, pressedClasses)}
      style={{ width: size, height: size }}
      onMouseDown={(e) => {
        e.preventDefault()
        handleStart()
      }}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => {
        e.preventDefault()
        handleStart()
      }}
      onTouchEnd={(e) => {
        e.preventDefault()
        handleEnd()
      }}
    >
      {label}
    </div>
  )
}

export default function MobileGameContainer({ children, className }: MobileGameContainerProps) {
  const { orientation, isLandscape } = useOrientation()

  const handleJoystickMove = (direction: { x: number; y: number }) => {
    gameInputHandler.setMovementInput(direction.x, direction.y)
  }

  const handleShootPress = (pressed: boolean) => {
    gameInputHandler.setShootPressed(pressed)
  }

  const handleDashPress = (pressed: boolean) => {
    gameInputHandler.setDashPressed(pressed)
  }

  const handleSpecialPress = (pressed: boolean) => {
    gameInputHandler.setSpecialPressed(pressed)
  }

  if (isLandscape) {
    // Landscape layout: joystick left, game center, actions right
    return (
      <div className={cn("w-full h-full flex bg-black", className)}>
        {/* Left controls */}
        <div className="w-[160px] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm border-r border-cyan-400/30">
          <Joystick onMove={handleJoystickMove} size={100} />
        </div>

        {/* Game area */}
        <div className="flex-1 min-w-0">{children}</div>

        {/* Right controls */}
        <div className="w-[160px] flex flex-col items-center justify-center gap-4 p-4 bg-gray-900/50 backdrop-blur-sm border-l border-cyan-400/30">
          <div className="text-cyan-400 text-xs font-mono font-bold mb-2">ACTIONS</div>
          <ActionButton label="SHOOT" onPress={handleShootPress} size={50} variant="primary" />
          <ActionButton label="DASH" onPress={handleDashPress} size={50} variant="secondary" />
          <ActionButton label="SPEC" onPress={handleSpecialPress} size={50} variant="primary" />
        </div>
      </div>
    )
  }

  // Portrait layout: game top, controls bottom
  return (
    <div className={cn("w-full h-full flex flex-col bg-black", className)}>
      {/* Game area */}
      <div className="flex-1 min-h-0">{children}</div>

      {/* Bottom controls */}
      <div className="h-[200px] flex items-center justify-between p-4 bg-gray-900/80 backdrop-blur-sm border-t border-cyan-400/30">
        {/* Left side - Joystick */}
        <div className="flex flex-col items-center">
          <Joystick onMove={handleJoystickMove} size={120} />
        </div>

        {/* Right side - Action buttons */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-cyan-400 text-xs font-mono font-bold">ACTIONS</div>
          <div className="flex flex-col gap-2">
            <ActionButton label="SHOOT" onPress={handleShootPress} size={55} variant="primary" />
            <div className="flex gap-2">
              <ActionButton label="DASH" onPress={handleDashPress} size={50} variant="secondary" />
              <ActionButton label="SPEC" onPress={handleSpecialPress} size={50} variant="primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
