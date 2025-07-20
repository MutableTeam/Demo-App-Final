"use client"

import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"

// Import the rc-joystick component
// Note: This would normally be installed via npm install rc-joystick
// For now, we'll create a compatible interface
interface JoystickProps {
  size?: number
  baseColor?: string
  stickColor?: string
  throttle?: number
  disabled?: boolean
  move?: (data: { x: number; y: number; direction: string; distance: number }) => void
  stop?: () => void
  start?: () => void
}

// Enhanced joystick component that mimics rc-joystick behavior
function RCJoystick({
  size = 100,
  baseColor = "#ddd",
  stickColor = "#999",
  move,
  stop,
  start,
  throttle = 50,
}: JoystickProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const lastMoveTime = useRef<number>(0)

  const radius = size / 2
  const stickRadius = size / 6

  const handleStart = useCallback(
    (clientX: number, clientY: number, rect: DOMRect) => {
      console.log("🕹️ RC Joystick - Start interaction")
      const centerX = rect.left + radius
      const centerY = rect.top + radius
      setStartPos({ x: centerX, y: centerY })
      setIsDragging(true)
      if (start) start()
    },
    [radius, start],
  )

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return

      // Throttle move events
      const now = Date.now()
      if (now - lastMoveTime.current < throttle) return
      lastMoveTime.current = now

      const deltaX = clientX - startPos.x
      const deltaY = clientY - startPos.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const maxDistance = radius - stickRadius

      let x = deltaX
      let y = deltaY

      if (distance > maxDistance) {
        const angle = Math.atan2(deltaY, deltaX)
        x = Math.cos(angle) * maxDistance
        y = Math.sin(angle) * maxDistance
      }

      setPosition({ x, y })

      // Calculate normalized values (-1 to 1)
      const normalizedX = x / maxDistance
      const normalizedY = y / maxDistance
      const normalizedDistance = Math.min(distance / maxDistance, 1)

      // Determine direction
      let direction = "C" // Center
      if (normalizedDistance > 0.3) {
        const angle = Math.atan2(-normalizedY, normalizedX) * (180 / Math.PI)
        if (angle >= -22.5 && angle < 22.5) direction = "E"
        else if (angle >= 22.5 && angle < 67.5) direction = "NE"
        else if (angle >= 67.5 && angle < 112.5) direction = "N"
        else if (angle >= 112.5 && angle < 157.5) direction = "NW"
        else if (angle >= 157.5 || angle < -157.5) direction = "W"
        else if (angle >= -157.5 && angle < -112.5) direction = "SW"
        else if (angle >= -112.5 && angle < -67.5) direction = "S"
        else if (angle >= -67.5 && angle < -22.5) direction = "SE"
      }

      console.log("🕹️ RC Joystick - Move data:", {
        raw: { deltaX, deltaY, distance },
        normalized: { x: normalizedX, y: -normalizedY, distance: normalizedDistance },
        direction,
      })

      if (move) {
        move({
          x: normalizedX,
          y: -normalizedY, // Invert Y for standard game coordinates
          direction,
          distance: normalizedDistance,
        })
      }
    },
    [isDragging, startPos, radius, stickRadius, move, throttle],
  )

  const handleEnd = useCallback(() => {
    console.log("🕹️ RC Joystick - End interaction")
    setIsDragging(false)
    setPosition({ x: 0, y: 0 })
    if (stop) stop()
  }, [stop])

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const rect = e.currentTarget.getBoundingClientRect()
      handleStart(e.clientX, e.clientY, rect)
    },
    [handleStart],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      handleMove(e.clientX, e.clientY)
    },
    [handleMove],
  )

  // Touch event handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const touch = e.touches[0]
      const rect = e.currentTarget.getBoundingClientRect()
      handleStart(touch.clientX, touch.clientY, rect)
    },
    [handleStart],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const touch = e.touches[0]
      if (touch) handleMove(touch.clientX, touch.clientY)
    },
    [handleMove],
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
      handleEnd()
    },
    [handleEnd],
  )

  // Global event handlers for drag continuation
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        e.preventDefault()
        handleMove(e.clientX, e.clientY)
      }
      const handleGlobalMouseUp = (e: MouseEvent) => {
        e.preventDefault()
        handleEnd()
      }
      const handleGlobalTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        const touch = e.touches[0]
        if (touch) handleMove(touch.clientX, touch.clientY)
      }
      const handleGlobalTouchEnd = (e: TouchEvent) => {
        e.preventDefault()
        handleEnd()
      }

      document.addEventListener("mousemove", handleGlobalMouseMove, { passive: false })
      document.addEventListener("mouseup", handleGlobalMouseUp, { passive: false })
      document.addEventListener("touchmove", handleGlobalTouchMove, { passive: false })
      document.addEventListener("touchend", handleGlobalTouchEnd, { passive: false })

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove)
        document.removeEventListener("mouseup", handleGlobalMouseUp)
        document.removeEventListener("touchmove", handleGlobalTouchMove)
        document.removeEventListener("touchend", handleGlobalTouchEnd)
      }
    }
  }, [isDragging, handleMove, handleEnd])

  return (
    <div
      ref={containerRef}
      className="relative select-none touch-none"
      style={{
        width: size,
        height: size,
        backgroundColor: baseColor,
        borderRadius: "50%",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="absolute rounded-full transition-all duration-75"
        style={{
          width: stickRadius * 2,
          height: stickRadius * 2,
          backgroundColor: stickColor,
          left: radius - stickRadius + position.x,
          top: radius - stickRadius + position.y,
          pointerEvents: "none",
        }}
      />
    </div>
  )
}

interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
  onMovementChange?: (movement: { up: boolean; down: boolean; left: boolean; right: boolean }) => void
  onActionPress?: (action: string, pressed: boolean) => void
}

interface ActionButtonProps {
  label: string
  action: string
  onPress: (action: string, pressed: boolean) => void
  className?: string
  title?: string
}

function ActionButton({ label, action, onPress, className, title }: ActionButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const pressTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleInteractionStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      console.log(`🎯 Action button ${action} - START interaction`)
      setIsPressed(true)
      onPress(action, true)

      // Clear any existing timeout
      if (pressTimeoutRef.current) {
        clearTimeout(pressTimeoutRef.current)
        pressTimeoutRef.current = null
      }
    },
    [action, onPress],
  )

  const handleInteractionEnd = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      console.log(`🎯 Action button ${action} - END interaction`)
      setIsPressed(false)
      onPress(action, false)

      // Clear any existing timeout
      if (pressTimeoutRef.current) {
        clearTimeout(pressTimeoutRef.current)
        pressTimeoutRef.current = null
      }
    },
    [action, onPress],
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pressTimeoutRef.current) {
        clearTimeout(pressTimeoutRef.current)
      }
    }
  }, [])

  return (
    <button
      className={cn(
        "w-16 h-16 rounded-full border-2 flex items-center justify-center font-mono text-lg font-bold transition-all duration-100",
        "touch-none select-none",
        isPressed ? "scale-95 bg-zinc-600/90" : "scale-100 bg-zinc-700/90",
        "border-zinc-500/70 text-zinc-200 shadow-lg backdrop-blur-sm",
        "hover:bg-zinc-600/80 focus:outline-none focus:ring-2 focus:ring-zinc-400/50",
        className,
      )}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      onTouchCancel={handleInteractionEnd}
      onMouseDown={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd}
      title={title}
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {label}
    </button>
  )
}

export default function MobileGameContainer({
  children,
  className,
  onMovementChange = () => {},
  onActionPress = () => {},
}: MobileGameContainerProps) {
  const [\
