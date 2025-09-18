"use client"

import { useRef, useState, useEffect, useCallback } from "react"

export default function MobileControls({ onInputChange }) {
  const containerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 })
  const touchStartPos = useRef({ x: 0, y: 0 })
  const joystickRadius = 100

  const handleTouchStart = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()

      const touch = e.touches[0]
      const rect = containerRef.current.getBoundingClientRect()

      // Position joystick where user touches
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      setJoystickPosition({ x, y })
      touchStartPos.current = { x, y }
      setIsDragging(true)

      onInputChange({ x: 0, y: 0, magnitude: 0 })
    },
    [onInputChange],
  )

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging) return
      e.preventDefault()
      e.stopPropagation()

      const touch = e.touches[0]
      const rect = containerRef.current.getBoundingClientRect()

      const touchX = touch.clientX - rect.left
      const touchY = touch.clientY - rect.top

      // Calculate distance from joystick center
      const deltaX = touchX - joystickPosition.x
      const deltaY = touchY - joystickPosition.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      let normalizedX, normalizedY, magnitude

      if (distance <= joystickRadius) {
        // Within joystick area
        normalizedX = deltaX / joystickRadius
        normalizedY = deltaY / joystickRadius
        magnitude = distance / joystickRadius
      } else {
        // Outside joystick area - constrain to edge
        const angle = Math.atan2(deltaY, deltaX)
        normalizedX = Math.cos(angle)
        normalizedY = Math.sin(angle)
        magnitude = 1
      }

      onInputChange({ x: normalizedX, y: normalizedY, magnitude })
    },
    [isDragging, joystickPosition, onInputChange],
  )

  const handleTouchEnd = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()

      setIsDragging(false)
      onInputChange({ x: 0, y: 0, magnitude: 0 })
    },
    [onInputChange],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("touchstart", handleTouchStart, { passive: false })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd, { passive: false })
    container.addEventListener("touchcancel", handleTouchEnd, { passive: false })

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
      container.removeEventListener("touchcancel", handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return (
    <>
      {/* Full screen invisible touch area */}
      <div
        ref={containerRef}
        className="absolute inset-0 z-10 pointer-events-auto bg-transparent"
        style={{ touchAction: "none" }}
      />

      {/* Simple touch hint when not active */}
      {!isDragging && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-black/40 border border-cyan-500/30 rounded-lg px-3 py-1 backdrop-blur-sm">
            <div className="text-cyan-400/60 text-xs font-medium text-center">Touch anywhere to move</div>
          </div>
        </div>
      )}
    </>
  )
}
