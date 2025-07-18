"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

interface JoystickProps {
  onMove: (x: number, y: number) => void
  onStop: () => void
  className?: string
  size?: number
}

function Joystick({ onMove, onStop, className, size = 120 }: JoystickProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const joystickRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!joystickRef.current) return

      setIsDragging(true)
      const rect = joystickRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = clientX - centerX
      const deltaY = clientY - centerY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const maxDistance = size / 2 - 20

      if (distance <= maxDistance) {
        setPosition({ x: deltaX, y: deltaY })
        onMove(deltaX / maxDistance, deltaY / maxDistance)
      } else {
        const angle = Math.atan2(deltaY, deltaX)
        const x = Math.cos(angle) * maxDistance
        const y = Math.sin(angle) * maxDistance
        setPosition({ x, y })
        onMove(x / maxDistance, y / maxDistance)
      }
    },
    [onMove, size],
  )

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging || !joystickRef.current) return

      const rect = joystickRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = clientX - centerX
      const deltaY = clientY - centerY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const maxDistance = size / 2 - 20

      if (distance <= maxDistance) {
        setPosition({ x: deltaX, y: deltaY })
        onMove(deltaX / maxDistance, deltaY / maxDistance)
      } else {
        const angle = Math.atan2(deltaY, deltaX)
        const x = Math.cos(angle) * maxDistance
        const y = Math.sin(angle) * maxDistance
        setPosition({ x, y })
        onMove(x / maxDistance, y / maxDistance)
      }
    },
    [isDragging, onMove, size],
  )

  const handleEnd = useCallback(() => {
    setIsDragging(false)
    setPosition({ x: 0, y: 0 })
    onStop()
  }, [onStop])

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientX, e.clientY)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY)
    },
    [handleMove],
  )

  const handleMouseUp = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      if (touch) {
        handleMove(touch.clientX, touch.clientY)
      }
    },
    [handleMove],
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      handleEnd()
    },
    [handleEnd],
  )

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
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  return (
    <div
      ref={joystickRef}
      className={cn("relative rounded-full bg-black/30 border-2 border-white/20 touch-none select-none", className)}
      style={{ width: size, height: size }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div
        ref={knobRef}
        className="absolute w-8 h-8 bg-white/80 rounded-full border-2 border-white/40 transition-transform duration-75"
        style={{
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
        }}
      />
    </div>
  )
}

interface ActionButtonProps {
  onPress: () => void
  onRelease: () => void
  children: React.ReactNode
  className?: string
  size?: number
}

function ActionButton({ onPress, onRelease, children, className, size = 60 }: ActionButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleStart = useCallback(() => {
    setIsPressed(true)
    onPress()
  }, [onPress])

  const handleEnd = useCallback(() => {
    setIsPressed(false)
    onRelease()
  }, [onRelease])

  return (
    <button
      className={cn(
        "rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white font-bold touch-none select-none transition-all duration-75",
        isPressed && "bg-white/40 scale-95",
        className,
      )}
      style={{ width: size, height: size }}
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

interface MobileTouchControlsProps {
  onMove: (x: number, y: number) => void
  onStopMove: () => void
  onShoot: () => void
  onStopShoot: () => void
  onSpecial?: () => void
  className?: string
}

export default function MobileTouchControls({
  onMove,
  onStopMove,
  onShoot,
  onStopShoot,
  onSpecial,
  className,
}: MobileTouchControlsProps) {
  return (
    <div className={cn("fixed inset-0 pointer-events-none z-50", className)}>
      {/* Movement Joystick - Bottom Left */}
      <div className="absolute bottom-8 left-8 pointer-events-auto">
        <Joystick onMove={onMove} onStop={onStopMove} size={120} />
        <div className="text-white/60 text-xs text-center mt-2 font-mono">MOVE</div>
      </div>

      {/* Action Buttons - Bottom Right */}
      <div className="absolute bottom-8 right-8 pointer-events-auto">
        <div className="flex flex-col items-center gap-4">
          {onSpecial && (
            <ActionButton
              onPress={onSpecial}
              onRelease={() => {}}
              size={50}
              className="bg-yellow-500/30 border-yellow-400/60"
            >
              ⚡
            </ActionButton>
          )}
          <ActionButton onPress={onShoot} onRelease={onStopShoot} size={70} className="bg-red-500/30 border-red-400/60">
            🎯
          </ActionButton>
        </div>
        <div className="text-white/60 text-xs text-center mt-2 font-mono">SHOOT</div>
      </div>
    </div>
  )
}

export { Joystick, ActionButton }
