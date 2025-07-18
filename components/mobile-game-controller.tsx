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

interface ActionState {
  active: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
  distance: number
  angle: number
  power: number
}

interface MobileGameControllerProps {
  onMovement: (deltaX: number, deltaY: number) => void
  onAction: (active: boolean, angle: number, power: number) => void
  onSpecialAction: (type: "dash" | "special") => void
  containerRef: React.RefObject<HTMLElement>
  disabled?: boolean
}

export function MobileGameController({
  onMovement,
  onAction,
  onSpecialAction,
  containerRef,
  disabled = false,
}: MobileGameControllerProps) {
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
  const actionRef = useRef<ActionState>({
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    distance: 0,
    angle: 0,
    power: 0,
  })

  const [joystickVisible, setJoystickVisible] = useState(false)
  const [actionVisible, setActionVisible] = useState(false)
  const [scale, setScale] = useState(1)

  // Constants for touch controls
  const JOYSTICK_MAX_DISTANCE = 80
  const ACTION_MAX_DISTANCE = 120
  const TOUCH_DEAD_ZONE = 15
  const DOUBLE_TAP_TIME = 300
  const LONG_PRESS_TIME = 500

  // Calculate responsive scale
  const calculateScale = useCallback(() => {
    if (!containerRef.current) return 1

    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const baseWidth = 800
    const baseHeight = 600

    const scaleX = containerWidth / baseWidth
    const scaleY = containerHeight / baseHeight
    return Math.min(scaleX, scaleY, 1)
  }, [containerRef])

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
      if (!containerRef.current) return { x: screenX, y: screenY }

      const container = containerRef.current
      const rect = container.getBoundingClientRect()

      const gameX = (screenX - rect.left) / scale
      const gameY = (screenY - rect.top) / scale

      return { x: gameX, y: gameY }
    },
    [scale, containerRef],
  )

  // Update joystick state
  const updateJoystick = useCallback(
    (touch: TouchPoint) => {
      const joystick = joystickRef.current

      if (!joystick.active) {
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

  // Update action state
  const updateAction = useCallback(
    (touch: TouchPoint) => {
      const action = actionRef.current

      if (!action.active) {
        action.active = true
        action.startX = touch.startX
        action.startY = touch.startY
        action.currentX = touch.x
        action.currentY = touch.y
        setActionVisible(true)
      } else {
        action.currentX = touch.x
        action.currentY = touch.y
      }

      // Calculate distance and angle
      const deltaX = action.currentX - action.startX
      const deltaY = action.currentY - action.startY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      action.distance = Math.min(distance, ACTION_MAX_DISTANCE)
      action.angle = Math.atan2(-deltaY, -deltaX) // Opposite direction
      action.power = Math.min(action.distance / ACTION_MAX_DISTANCE, 1)

      // Only activate if minimum distance is reached
      if (action.distance > TOUCH_DEAD_ZONE) {
        onAction(true, action.angle, action.power)
      }
    },
    [onAction],
  )

  // Reset joystick
  const resetJoystick = useCallback(() => {
    joystickRef.current.active = false
    setJoystickVisible(false)
    onMovement(0, 0)
  }, [onMovement])

  // Reset action
  const resetAction = useCallback(() => {
    const action = actionRef.current
    if (action.active && action.distance > TOUCH_DEAD_ZONE) {
      onAction(false, action.angle, action.power)
    }
    action.active = false
    setActionVisible(false)
  }, [onAction])

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

        // Determine touch zone
        const screenWidth = window.innerWidth
        if (touch.clientX < screenWidth * 0.4) {
          // Left side - movement joystick
          updateJoystick(touchPoint)
        } else if (touch.clientX > screenWidth * 0.6) {
          // Right side - action
          updateAction(touchPoint)
        }
      })
    },
    [disabled, isMobile, screenToGameCoords, updateJoystick, updateAction],
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

        // Update appropriate control
        const screenWidth = window.innerWidth
        if (existingTouch.startX < (screenWidth * 0.4) / scale) {
          updateJoystick(updatedTouch)
        } else if (existingTouch.startX > (screenWidth * 0.6) / scale) {
          updateAction(updatedTouch)
        }
      })
    },
    [disabled, isMobile, screenToGameCoords, updateJoystick, updateAction, scale],
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
          // Quick tap - special actions
          if (existingTouch.startX < (screenWidth * 0.3) / scale) {
            onSpecialAction("dash")
          } else if (existingTouch.startX > (screenWidth * 0.7) / scale) {
            onSpecialAction("special")
          }
        }

        // Reset appropriate control
        if (existingTouch.startX < (screenWidth * 0.4) / scale) {
          resetJoystick()
        } else if (existingTouch.startX > (screenWidth * 0.6) / scale) {
          resetAction()
        }

        touchesRef.current.delete(touch.identifier)
      })
    },
    [disabled, isMobile, onSpecialAction, resetJoystick, resetAction, scale],
  )

  // Set up touch event listeners
  useEffect(() => {
    if (!isMobile || !containerRef.current) return

    const container = containerRef.current

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
  }, [isMobile, handleTouchStart, handleTouchMove, handleTouchEnd, containerRef])

  // Render touch control overlays
  if (!isMobile || disabled) return null

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Movement Joystick */}
      {joystickVisible && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${joystickRef.current.centerX * scale - 40}px`,
            top: `${joystickRef.current.centerY * scale - 40}px`,
            width: "80px",
            height: "80px",
          }}
        >
          {/* Joystick base */}
          <div className="absolute inset-0 rounded-full border-2 border-white/40 bg-black/30 backdrop-blur-sm" />

          {/* Joystick knob */}
          <div
            className="absolute w-8 h-8 rounded-full bg-white/80 border-2 border-white/90 transition-transform shadow-lg"
            style={{
              left: `${(joystickRef.current.deltaX / JOYSTICK_MAX_DISTANCE) * 20 + 36}px`,
              top: `${(joystickRef.current.deltaY / JOYSTICK_MAX_DISTANCE) * 20 + 36}px`,
            }}
          />
        </div>
      )}

      {/* Action Indicator */}
      {actionVisible && (
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
              x1={actionRef.current.startX * scale}
              y1={actionRef.current.startY * scale}
              x2={actionRef.current.currentX * scale}
              y2={actionRef.current.currentY * scale}
              stroke="rgba(255, 255, 255, 0.8)"
              strokeWidth="3"
              strokeDasharray="8,4"
            />

            {/* Trajectory preview */}
            <line
              x1={actionRef.current.startX * scale}
              y1={actionRef.current.startY * scale}
              x2={
                (actionRef.current.startX + Math.cos(actionRef.current.angle) * 120 * actionRef.current.power) * scale
              }
              y2={
                (actionRef.current.startY + Math.sin(actionRef.current.angle) * 120 * actionRef.current.power) * scale
              }
              stroke="rgba(255, 204, 51, 0.7)"
              strokeWidth="4"
            />
          </svg>

          {/* Power indicator */}
          <div
            className="absolute bg-yellow-400 rounded-full shadow-lg"
            style={{
              left: `${actionRef.current.startX * scale - 6}px`,
              top: `${actionRef.current.startY * scale - 6}px`,
              width: `${12 + actionRef.current.power * 24}px`,
              height: `${12 + actionRef.current.power * 24}px`,
              opacity: 0.8,
            }}
          />
        </div>
      )}

      {/* Control hints */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none">
        <div className="bg-black/60 text-white text-xs px-3 py-2 rounded-full backdrop-blur-sm">Left: Move</div>
        <div className="bg-black/60 text-white text-xs px-3 py-2 rounded-full backdrop-blur-sm">Right: Aim & Fire</div>
      </div>

      {/* Special action hints */}
      <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
        <div className="bg-black/60 text-white text-xs px-3 py-2 rounded-full backdrop-blur-sm">Quick Tap: Dash</div>
        <div className="bg-black/60 text-white text-xs px-3 py-2 rounded-full backdrop-blur-sm">Quick Tap: Special</div>
      </div>
    </div>
  )
}
