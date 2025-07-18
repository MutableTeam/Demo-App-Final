"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { useIsMobile } from "@/components/ui/use-mobile"

interface TouchPoint {
  id: number
  x: number
  y: number
  startX: number
  startY: number
  timestamp: number
}

interface JoystickState {
  active: boolean
  centerX: number
  centerY: number
  currentX: number
  currentY: number
  deltaX: number
  deltaY: number
  distance: number
  angle: number
}

interface BowDrawState {
  active: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
  drawDistance: number
  angle: number
  power: number
}

interface MobileTouchControlsProps {
  onMovement: (deltaX: number, deltaY: number) => void
  onBowDraw: (active: boolean, angle: number, power: number) => void
  onDash: () => void
  onSpecialAttack: () => void
  canvasRef: React.RefObject<HTMLCanvasElement>
  disabled?: boolean
}

export default function MobileTouchControls({
  onMovement,
  onBowDraw,
  onDash,
  onSpecialAttack,
  canvasRef,
  disabled = false,
}: MobileTouchControlsProps) {
  const isMobile = useIsMobile()
  const touchesRef = useRef<Map<number, TouchPoint>>(new Map())
  const joystickRef = useRef<JoystickState>({
    active: false,
    centerX: 0,
    centerY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    distance: 0,
    angle: 0,
  })
  const bowDrawRef = useRef<BowDrawState>({
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    drawDistance: 0,
    angle: 0,
    power: 0,
  })

  const [joystickVisible, setJoystickVisible] = useState(false)
  const [bowDrawVisible, setBowDrawVisible] = useState(false)
  const [scale, setScale] = useState(1)

  // Constants for touch controls
  const JOYSTICK_MAX_DISTANCE = 60
  const BOW_DRAW_MAX_DISTANCE = 120
  const TOUCH_DEAD_ZONE = 10
  const DOUBLE_TAP_TIME = 300
  const LONG_PRESS_TIME = 500

  // Calculate responsive scale based on screen size
  const calculateScale = useCallback(() => {
    if (!canvasRef.current) return 1

    const canvas = canvasRef.current
    const container = canvas.parentElement
    if (!container) return 1

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const gameWidth = 800 // Game's native width
    const gameHeight = 600 // Game's native height

    // Calculate scale to fit game in container while maintaining aspect ratio
    const scaleX = containerWidth / gameWidth
    const scaleY = containerHeight / gameHeight
    const scale = Math.min(scaleX, scaleY, 1) // Don't scale up beyond 1:1

    return scale
  }, [canvasRef])

  // Update scale on resize
  useEffect(() => {
    const updateScale = () => {
      setScale(calculateScale())
    }

    updateScale()
    window.addEventListener("resize", updateScale)
    window.addEventListener("orientationchange", updateScale)

    return () => {
      window.removeEventListener("resize", updateScale)
      window.removeEventListener("orientationchange", updateScale)
    }
  }, [calculateScale])

  // Convert screen coordinates to game coordinates
  const screenToGameCoords = useCallback(
    (screenX: number, screenY: number) => {
      if (!canvasRef.current) return { x: screenX, y: screenY }

      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()

      // Account for canvas scaling and positioning
      const gameX = (screenX - rect.left) / scale
      const gameY = (screenY - rect.top) / scale

      return { x: gameX, y: gameY }
    },
    [scale],
  )

  // Update joystick state
  const updateJoystick = useCallback(
    (touch: TouchPoint) => {
      const joystick = joystickRef.current

      if (!joystick.active) {
        // Initialize joystick at touch position
        joystick.active = true
        joystick.centerX = touch.startX
        joystick.centerY = touch.startY
        joystick.currentX = touch.x
        joystick.currentY = touch.y
        setJoystickVisible(true)
      } else {
        joystick.currentX = touch.x
        joystick.currentY = touch.y
      }

      // Calculate delta and constrain to max distance
      const deltaX = joystick.currentX - joystick.centerX
      const deltaY = joystick.currentY - joystick.centerY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      if (distance > JOYSTICK_MAX_DISTANCE) {
        const angle = Math.atan2(deltaY, deltaX)
        joystick.currentX = joystick.centerX + Math.cos(angle) * JOYSTICK_MAX_DISTANCE
        joystick.currentY = joystick.centerY + Math.sin(angle) * JOYSTICK_MAX_DISTANCE
        joystick.distance = JOYSTICK_MAX_DISTANCE
      } else {
        joystick.distance = distance
      }

      joystick.deltaX = joystick.currentX - joystick.centerX
      joystick.deltaY = joystick.currentY - joystick.centerY
      joystick.angle = Math.atan2(joystick.deltaY, joystick.deltaX)

      // Normalize movement values (-1 to 1)
      const normalizedX = joystick.deltaX / JOYSTICK_MAX_DISTANCE
      const normalizedY = joystick.deltaY / JOYSTICK_MAX_DISTANCE

      // Apply dead zone
      if (joystick.distance > TOUCH_DEAD_ZONE) {
        onMovement(normalizedX, normalizedY)
      } else {
        onMovement(0, 0)
      }
    },
    [onMovement],
  )

  // Update bow draw state
  const updateBowDraw = useCallback(
    (touch: TouchPoint) => {
      const bowDraw = bowDrawRef.current

      if (!bowDraw.active) {
        bowDraw.active = true
        bowDraw.startX = touch.startX
        bowDraw.startY = touch.startY
        bowDraw.currentX = touch.x
        bowDraw.currentY = touch.y
        setBowDrawVisible(true)
      } else {
        bowDraw.currentX = touch.x
        bowDraw.currentY = touch.y
      }

      // Calculate draw distance and angle
      const deltaX = bowDraw.currentX - bowDraw.startX
      const deltaY = bowDraw.currentY - bowDraw.startY
      const drawDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      // Constrain draw distance
      bowDraw.drawDistance = Math.min(drawDistance, BOW_DRAW_MAX_DISTANCE)

      // Calculate angle (opposite direction of draw)
      bowDraw.angle = Math.atan2(-deltaY, -deltaX)

      // Calculate power (0 to 1)
      bowDraw.power = Math.min(bowDraw.drawDistance / BOW_DRAW_MAX_DISTANCE, 1)

      // Only activate bow draw if minimum distance is reached
      if (bowDraw.drawDistance > TOUCH_DEAD_ZONE) {
        onBowDraw(true, bowDraw.angle, bowDraw.power)
      }
    },
    [onBowDraw],
  )

  // Reset joystick
  const resetJoystick = useCallback(() => {
    joystickRef.current.active = false
    setJoystickVisible(false)
    onMovement(0, 0)
  }, [onMovement])

  // Reset bow draw
  const resetBowDraw = useCallback(() => {
    const bowDraw = bowDrawRef.current
    if (bowDraw.active && bowDraw.drawDistance > TOUCH_DEAD_ZONE) {
      // Fire the arrow
      onBowDraw(false, bowDraw.angle, bowDraw.power)
    }
    bowDraw.active = false
    setBowDrawVisible(false)
  }, [onBowDraw])

  // Handle touch start
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || !isMobile) return

      e.preventDefault()

      Array.from(e.changedTouches).forEach((touch) => {
        const gameCoords = screenToGameCoords(touch.clientX, touch.clientY)
        const touchPoint: TouchPoint = {
          id: touch.identifier,
          x: gameCoords.x,
          y: gameCoords.y,
          startX: gameCoords.x,
          startY: gameCoords.y,
          timestamp: Date.now(),
        }

        touchesRef.current.set(touch.identifier, touchPoint)

        // Determine if this is a movement or bow draw touch
        // Left side of screen for movement, right side for bow draw
        const screenWidth = window.innerWidth
        if (touch.clientX < screenWidth * 0.5) {
          // Left side - movement joystick
          updateJoystick(touchPoint)
        } else {
          // Right side - bow draw
          updateBowDraw(touchPoint)
        }
      })
    },
    [disabled, isMobile, screenToGameCoords, updateJoystick, updateBowDraw],
  )

  // Handle touch move
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || !isMobile) return

      e.preventDefault()

      Array.from(e.changedTouches).forEach((touch) => {
        const existingTouch = touchesRef.current.get(touch.identifier)
        if (!existingTouch) return

        const gameCoords = screenToGameCoords(touch.clientX, touch.clientY)
        const updatedTouch: TouchPoint = {
          ...existingTouch,
          x: gameCoords.x,
          y: gameCoords.y,
        }

        touchesRef.current.set(touch.identifier, updatedTouch)

        // Update appropriate control based on which side the touch started
        const screenWidth = window.innerWidth
        if (existingTouch.startX < (screenWidth * 0.5) / scale) {
          updateJoystick(updatedTouch)
        } else {
          updateBowDraw(updatedTouch)
        }
      })
    },
    [disabled, isMobile, screenToGameCoords, updateJoystick, updateBowDraw, scale],
  )

  // Handle touch end
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (disabled || !isMobile) return

      e.preventDefault()

      Array.from(e.changedTouches).forEach((touch) => {
        const existingTouch = touchesRef.current.get(touch.identifier)
        if (!existingTouch) return

        const touchDuration = Date.now() - existingTouch.timestamp
        const screenWidth = window.innerWidth

        // Check for special gestures
        if (touchDuration < DOUBLE_TAP_TIME) {
          // Quick tap - could be dash or special attack
          if (existingTouch.startX < (screenWidth * 0.3) / scale) {
            onDash()
          } else if (existingTouch.startX > (screenWidth * 0.7) / scale) {
            onSpecialAttack()
          }
        }

        // Reset appropriate control
        if (existingTouch.startX < (screenWidth * 0.5) / scale) {
          resetJoystick()
        } else {
          resetBowDraw()
        }

        touchesRef.current.delete(touch.identifier)
      })
    },
    [disabled, isMobile, onDash, onSpecialAttack, resetJoystick, resetBowDraw, scale],
  )

  // Set up touch event listeners
  useEffect(() => {
    if (!isMobile || !canvasRef.current) return

    const canvas = canvasRef.current

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false })
    canvas.addEventListener("touchcancel", handleTouchEnd, { passive: false })

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
      canvas.removeEventListener("touchcancel", handleTouchEnd)
    }
  }, [isMobile, handleTouchStart, handleTouchMove, handleTouchEnd])

  // Render touch control overlays
  if (!isMobile || disabled) return null

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Movement Joystick */}
      {joystickVisible && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${joystickRef.current.centerX * scale - 30}px`,
            top: `${joystickRef.current.centerY * scale - 30}px`,
            width: "60px",
            height: "60px",
          }}
        >
          {/* Joystick base */}
          <div className="absolute inset-0 rounded-full border-2 border-white/30 bg-black/20" />

          {/* Joystick knob */}
          <div
            className="absolute w-6 h-6 rounded-full bg-white/70 border border-white/90 transition-transform"
            style={{
              left: `${(joystickRef.current.deltaX / JOYSTICK_MAX_DISTANCE) * 15 + 27}px`,
              top: `${(joystickRef.current.deltaY / JOYSTICK_MAX_DISTANCE) * 15 + 27}px`,
            }}
          />
        </div>
      )}

      {/* Bow Draw Indicator */}
      {bowDrawVisible && (
        <div className="absolute pointer-events-none">
          {/* Draw line */}
          <svg
            className="absolute"
            style={{
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <line
              x1={bowDrawRef.current.startX * scale}
              y1={bowDrawRef.current.startY * scale}
              x2={bowDrawRef.current.currentX * scale}
              y2={bowDrawRef.current.currentY * scale}
              stroke="rgba(255, 255, 255, 0.8)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Arrow trajectory preview */}
            <line
              x1={bowDrawRef.current.startX * scale}
              y1={bowDrawRef.current.startY * scale}
              x2={
                (bowDrawRef.current.startX + Math.cos(bowDrawRef.current.angle) * 100 * bowDrawRef.current.power) *
                scale
              }
              y2={
                (bowDrawRef.current.startY + Math.sin(bowDrawRef.current.angle) * 100 * bowDrawRef.current.power) *
                scale
              }
              stroke="rgba(255, 204, 51, 0.6)"
              strokeWidth="3"
            />
          </svg>

          {/* Power indicator */}
          <div
            className="absolute bg-yellow-400 rounded-full"
            style={{
              left: `${bowDrawRef.current.startX * scale - 5}px`,
              top: `${bowDrawRef.current.startY * scale - 5}px`,
              width: `${10 + bowDrawRef.current.power * 20}px`,
              height: `${10 + bowDrawRef.current.power * 20}px`,
              opacity: 0.7,
            }}
          />
        </div>
      )}

      {/* Touch control hints */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none">
        <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">Left: Move</div>
        <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">Right: Draw Bow</div>
      </div>
    </div>
  )
}
