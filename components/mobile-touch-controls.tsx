"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface TouchControlsProps {
  onMove: (direction: { x: number; y: number }) => void
  onAction: (action: string) => void
  className?: string
}

export default function MobileTouchControls({ onMove, onAction, className }: TouchControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [joystickCenter, setJoystickCenter] = useState({ x: 0, y: 0 })
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 })

  const joystickRadius = 50
  const knobRadius = 20

  const updateJoystickCenter = useCallback(() => {
    if (joystickRef.current) {
      const rect = joystickRef.current.getBoundingClientRect()
      setJoystickCenter({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      })
    }
  }, [])

  useEffect(() => {
    updateJoystickCenter()
    window.addEventListener("resize", updateJoystickCenter)
    return () => window.removeEventListener("resize", updateJoystickCenter)
  }, [updateJoystickCenter])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      setIsDragging(true)
      updateJoystickCenter()
    },
    [updateJoystickCenter],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return
      e.preventDefault()

      const touch = e.touches[0]
      const deltaX = touch.clientX - joystickCenter.x
      const deltaY = touch.clientY - joystickCenter.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      let newX = deltaX
      let newY = deltaY

      if (distance > joystickRadius - knobRadius) {
        const angle = Math.atan2(deltaY, deltaX)
        newX = Math.cos(angle) * (joystickRadius - knobRadius)
        newY = Math.sin(angle) * (joystickRadius - knobRadius)
      }

      setKnobPosition({ x: newX, y: newY })

      // Normalize the movement values
      const normalizedX = newX / (joystickRadius - knobRadius)
      const normalizedY = newY / (joystickRadius - knobRadius)

      onMove({ x: normalizedX, y: normalizedY })
    },
    [isDragging, joystickCenter, onMove],
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      setIsDragging(false)
      setKnobPosition({ x: 0, y: 0 })
      onMove({ x: 0, y: 0 })
    },
    [onMove],
  )

  const handleMouseStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      updateJoystickCenter()
    },
    [updateJoystickCenter],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return
      e.preventDefault()

      const deltaX = e.clientX - joystickCenter.x
      const deltaY = e.clientY - joystickCenter.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      let newX = deltaX
      let newY = deltaY

      if (distance > joystickRadius - knobRadius) {
        const angle = Math.atan2(deltaY, deltaX)
        newX = Math.cos(angle) * (joystickRadius - knobRadius)
        newY = Math.sin(angle) * (joystickRadius - knobRadius)
      }

      setKnobPosition({ x: newX, y: newY })

      const normalizedX = newX / (joystickRadius - knobRadius)
      const normalizedY = newY / (joystickRadius - knobRadius)

      onMove({ x: normalizedX, y: normalizedY })
    },
    [isDragging, joystickCenter, onMove],
  )

  const handleMouseEnd = useCallback(() => {
    setIsDragging(false)
    setKnobPosition({ x: 0, y: 0 })
    onMove({ x: 0, y: 0 })
  }, [onMove])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseEnd)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseEnd)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseEnd])

  return (
    <div
      className={cn("fixed bottom-4 left-0 right-0 flex justify-between items-end px-4 pointer-events-none", className)}
    >
      {/* Virtual Joystick */}
      <div className="pointer-events-auto">
        <div
          ref={joystickRef}
          className="relative w-24 h-24 bg-black/30 border-2 border-white/50 rounded-full flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseStart}
        >
          <div
            ref={knobRef}
            className="absolute w-10 h-10 bg-white/80 rounded-full shadow-lg transition-transform"
            style={{
              transform: `translate(${knobPosition.x}px, ${knobPosition.y}px)`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-white/60 rounded-full" />
          </div>
        </div>
        <div className="text-center mt-2 text-white/70 text-xs font-mono">MOVE</div>
      </div>

      {/* Action Buttons */}
      <div className="pointer-events-auto flex flex-col gap-3">
        <button
          className="w-16 h-16 bg-red-600/80 border-2 border-white/50 rounded-full flex items-center justify-center text-white font-bold shadow-lg active:scale-95 transition-transform"
          onTouchStart={(e) => {
            e.preventDefault()
            onAction("shoot")
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            onAction("shoot")
          }}
        >
          🏹
        </button>
        <button
          className="w-14 h-14 bg-blue-600/80 border-2 border-white/50 rounded-full flex items-center justify-center text-white font-bold shadow-lg active:scale-95 transition-transform"
          onTouchStart={(e) => {
            e.preventDefault()
            onAction("special")
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            onAction("special")
          }}
        >
          ⚡
        </button>
        <div className="text-center mt-1 text-white/70 text-xs font-mono">ACTION</div>
      </div>
    </div>
  )
}
