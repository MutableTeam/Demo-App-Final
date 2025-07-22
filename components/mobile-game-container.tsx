"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { gameInputHandler } from "@/utils/game-input-handler"
import { logger } from "@/utils/logger"
import { useMediaQuery } from "@/hooks/use-responsive"
import { Orbitron } from "next/font/google"

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
})

interface MobileGameContainerProps {
  children: React.ReactNode
}

export function MobileGameContainer({ children }: MobileGameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const movementJoystickRef = useRef<HTMLDivElement>(null)
  const aimingJoystickRef = useRef<HTMLDivElement>(null)
  const isPortrait = useMediaQuery("(orientation: portrait)")

  // Track active touches
  const movementTouchId = useRef<number | null>(null)
  const aimingTouchId = useRef<number | null>(null)

  // Joystick state
  const movementCenter = useRef({ x: 0, y: 0 })
  const aimingCenter = useRef({ x: 0, y: 0 })

  // Debug state
  const [debugInfo, setDebugInfo] = useState({
    movement: { x: 0, y: 0, angle: 0 },
    aiming: { x: 0, y: 0, angle: 0, active: false },
    actions: { shoot: false, dash: false, special: false, explosiveArrow: false },
  })

  // Initialize joystick positions
  useEffect(() => {
    if (!containerRef.current || !movementJoystickRef.current || !aimingJoystickRef.current) return

    const updateJoystickPositions = () => {
      if (!containerRef.current || !movementJoystickRef.current || !aimingJoystickRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const movementRect = movementJoystickRef.current.getBoundingClientRect()
      const aimingRect = aimingJoystickRef.current.getBoundingClientRect()

      movementCenter.current = {
        x: movementRect.left + movementRect.width / 2 - containerRect.left,
        y: movementRect.top + movementRect.height / 2 - containerRect.top,
      }

      aimingCenter.current = {
        x: aimingRect.left + aimingRect.width / 2 - containerRect.left,
        y: aimingRect.top + aimingRect.height / 2 - containerRect.top,
      }
    }

    // Initial position
    updateJoystickPositions()

    // Update on resize
    window.addEventListener("resize", updateJoystickPositions)

    return () => {
      window.removeEventListener("resize", updateJoystickPositions)
    }
  }, [isPortrait])

  // Handle touch events
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()

      const containerRect = container.getBoundingClientRect()
      const touchX = e.touches[0].clientX - containerRect.left
      const touchY = e.touches[0].clientY - containerRect.top

      // Check if touch is on left or right side of screen
      const isLeftSide = touchX < containerRect.width / 2

      if (isLeftSide && movementTouchId.current === null) {
        // Left side - movement joystick
        movementTouchId.current = e.touches[0].identifier

        // Update movement joystick position to touch point
        const movementJoystick = movementJoystickRef.current
        if (movementJoystick) {
          movementCenter.current = { x: touchX, y: touchY }
          movementJoystick.style.left = `${touchX}px`
          movementJoystick.style.top = `${touchY}px`
        }
      } else if (!isLeftSide && aimingTouchId.current === null) {
        // Right side - aiming joystick
        aimingTouchId.current = e.touches[0].identifier

        // Update aiming joystick position to touch point
        const aimingJoystick = aimingJoystickRef.current
        if (aimingJoystick) {
          aimingCenter.current = { x: touchX, y: touchY }
          aimingJoystick.style.left = `${touchX}px`
          aimingJoystick.style.top = `${touchY}px`
        }

        // Start aiming
        gameInputHandler.updateAiming(true, 0, 0)
        logger.info("Aiming started", "TOUCH")
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()

      const containerRect = container.getBoundingClientRect()

      // Process all touches
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i]
        const touchX = touch.clientX - containerRect.left
        const touchY = touch.clientY - containerRect.top

        // Movement joystick
        if (touch.identifier === movementTouchId.current) {
          const dx = touchX - movementCenter.current.x
          const dy = touchY - movementCenter.current.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const maxDistance = 50 // Maximum joystick movement

          // Normalize direction vector
          const normalizedDx = dx / (distance || 1)
          const normalizedDy = dy / (distance || 1)

          // Calculate movement direction
          const threshold = 0.3
          const up = normalizedDy < -threshold
          const down = normalizedDy > threshold
          const left = normalizedDx < -threshold
          const right = normalizedDx > threshold

          // Update game input state
          gameInputHandler.updateMovement(
            up,
            down,
            left,
            right,
            normalizedDx,
            normalizedDy,
            Math.min(distance / maxDistance, 1),
          )

          // Update debug info
          setDebugInfo((prev) => ({
            ...prev,
            movement: {
              x: normalizedDx,
              y: normalizedDy,
              angle: Math.atan2(normalizedDy, normalizedDx),
            },
          }))
        }

        // Aiming joystick
        if (touch.identifier === aimingTouchId.current) {
          const dx = touchX - aimingCenter.current.x
          const dy = touchY - aimingCenter.current.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const maxDistance = 50 // Maximum joystick movement

          // Calculate angle (in radians)
          const angle = Math.atan2(dy, dx)

          // Calculate power (0-1)
          const power = Math.min(distance / maxDistance, 1)

          // Update game input state
          gameInputHandler.updateAiming(true, angle, power)

          // Update debug info
          setDebugInfo((prev) => ({
            ...prev,
            aiming: {
              x: dx / maxDistance,
              y: dy / maxDistance,
              angle,
              active: true,
            },
          }))

          // If distance exceeds minimum threshold, trigger shoot
          // This prevents accidental shots from small movements
          if (distance > 5) {
            gameInputHandler.triggerShoot()
            setDebugInfo((prev) => ({
              ...prev,
              actions: { ...prev.actions, shoot: true },
            }))
          }
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()

      // Check if the movement touch ended
      if (movementTouchId.current !== null) {
        let movementTouchEnded = true

        for (let i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier === movementTouchId.current) {
            movementTouchEnded = false
            break
          }
        }

        if (movementTouchEnded) {
          movementTouchId.current = null
          gameInputHandler.updateMovement(false, false, false, false, 0, 0, 0)

          // Update debug info
          setDebugInfo((prev) => ({
            ...prev,
            movement: { x: 0, y: 0, angle: 0 },
          }))
        }
      }

      // Check if the aiming touch ended
      if (aimingTouchId.current !== null) {
        let aimingTouchEnded = true

        for (let i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier === aimingTouchId.current) {
            aimingTouchEnded = false
            break
          }
        }

        if (aimingTouchEnded) {
          aimingTouchId.current = null
          gameInputHandler.updateAiming(false, 0, 0)

          // Update debug info
          setDebugInfo((prev) => ({
            ...prev,
            aiming: { x: 0, y: 0, angle: 0, active: false },
            actions: { ...prev.actions, shoot: false },
          }))

          logger.info("Aiming ended", "TOUCH")
        }
      }
    }

    // Add event listeners
    container.addEventListener("touchstart", handleTouchStart, { passive: false })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd, { passive: false })
    container.addEventListener("touchcancel", handleTouchEnd, { passive: false })

    return () => {
      // Remove event listeners
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
      container.removeEventListener("touchcancel", handleTouchEnd)
    }
  }, [])

  // Handle action button clicks
  const handleActionButton = (action: "dash" | "special" | "explosiveArrow") => {
    gameInputHandler.updateAction(action, true)

    // Reset after a short delay
    setTimeout(() => {
      gameInputHandler.updateAction(action, false)
    }, 200)

    // Update debug info
    setDebugInfo((prev) => ({
      ...prev,
      actions: { ...prev.actions, [action]: true },
    }))

    setTimeout(() => {
      setDebugInfo((prev) => ({
        ...prev,
        actions: { ...prev.actions, [action]: false },
      }))
    }, 200)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden touch-none"
      style={{ touchAction: "none" }}
    >
      {/* Game content */}
      <div className="w-full h-full">{children}</div>

      {/* Movement joystick */}
      <div
        ref={movementJoystickRef}
        className="absolute left-16 bottom-32 w-32 h-32 rounded-full border-2 border-white/30 bg-black/20 pointer-events-none"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <div className="absolute left-1/2 top-1/2 w-16 h-16 rounded-full bg-white/30 -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Aiming joystick */}
      <div
        ref={aimingJoystickRef}
        className="absolute right-16 bottom-32 w-32 h-32 rounded-full border-2 border-white/30 bg-black/20 pointer-events-none"
        style={{ transform: "translate(50%, -50%)" }}
      >
        <div className="absolute left-1/2 top-1/2 w-16 h-16 rounded-full bg-white/30 -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Action buttons */}
      <div
        className={`absolute ${isPortrait ? "right-4 bottom-64 flex flex-col gap-2" : "right-32 top-32 flex flex-row gap-2"}`}
      >
        <button
          className="w-12 h-12 rounded-full bg-red-500/80 text-white text-sm font-bold shadow-lg"
          onClick={() => handleActionButton("dash")}
        >
          X
        </button>
        <button
          className="w-12 h-12 rounded-full bg-green-500/80 text-white text-sm font-bold shadow-lg"
          onClick={() => handleActionButton("special")}
        >
          Y
        </button>
        <button
          className="w-12 h-12 rounded-full bg-blue-500/80 text-white text-sm font-bold shadow-lg"
          onClick={() => handleActionButton("explosiveArrow")}
        >
          B
        </button>
      </div>

      {/* Debug overlay - only shown in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-2 left-2 bg-black/50 text-white p-2 text-xs rounded">
          <div>
            Movement: x={debugInfo.movement.x.toFixed(2)} y={debugInfo.movement.y.toFixed(2)}
          </div>
          <div>
            Aiming: {debugInfo.aiming.active ? "active" : "inactive"} angle={debugInfo.aiming.angle.toFixed(2)}
          </div>
          <div>
            Actions:
            {debugInfo.actions.shoot ? " SHOOT" : ""}
            {debugInfo.actions.dash ? " DASH" : ""}
            {debugInfo.actions.special ? " SPECIAL" : ""}
            {debugInfo.actions.explosiveArrow ? " EXPLOSIVE" : ""}
          </div>
        </div>
      )}
    </div>
  )
}
