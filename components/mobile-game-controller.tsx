"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface MobileGameControllerProps {
  onMovement: (deltaX: number, deltaY: number) => void
  onAction: (active: boolean, angle: number, power: number) => void
  onSpecialAction: (type: "dash" | "special") => void
  containerRef: React.RefObject<HTMLDivElement>
  disabled?: boolean
}

interface JoystickData {
  x: number
  y: number
  angle: number
  force: number
  active: boolean
}

export function MobileGameController({
  onMovement,
  onAction,
  onSpecialAction,
  containerRef,
  disabled = false,
}: MobileGameControllerProps) {
  const joystickRef = useRef<HTMLDivElement>(null)
  const actionAreaRef = useRef<HTMLDivElement>(null)
  const [joystickData, setJoystickData] = useState<JoystickData>({
    x: 0,
    y: 0,
    angle: 0,
    force: 0,
    active: false,
  })
  const [actionData, setActionData] = useState({
    active: false,
    angle: 0,
    power: 0,
  })

  // Joystick handling
  const handleJoystickStart = useCallback(
    (clientX: number, clientY: number) => {
      if (disabled || !joystickRef.current) return

      const rect = joystickRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = clientX - centerX
      const deltaY = clientY - centerY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const maxDistance = rect.width / 2 - 10 // Account for knob size

      const force = Math.min(distance / maxDistance, 1)
      const angle = Math.atan2(deltaY, deltaX)

      const normalizedX = Math.cos(angle) * force
      const normalizedY = Math.sin(angle) * force

      const newData = {
        x: normalizedX,
        y: normalizedY,
        angle,
        force,
        active: true,
      }

      setJoystickData(newData)
      onMovement(normalizedX, normalizedY)
    },
    [disabled, onMovement],
  )

  const handleJoystickEnd = useCallback(() => {
    const newData = {
      x: 0,
      y: 0,
      angle: 0,
      force: 0,
      active: false,
    }
    setJoystickData(newData)
    onMovement(0, 0)
  }, [onMovement])

  // Action area handling (bow aiming)
  const handleActionStart = useCallback(
    (clientX: number, clientY: number) => {
      if (disabled || !actionAreaRef.current) return

      const rect = actionAreaRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = clientX - centerX
      const deltaY = clientY - centerY
      const angle = Math.atan2(deltaY, deltaX)

      const newData = {
        active: true,
        angle,
        power: 0.1, // Start with minimum power
      }

      setActionData(newData)
      onAction(true, angle, 0.1)
    },
    [disabled, onAction],
  )

  const handleActionMove = useCallback(
    (clientX: number, clientY: number) => {
      if (disabled || !actionData.active || !actionAreaRef.current) return

      const rect = actionAreaRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = clientX - centerX
      const deltaY = clientY - centerY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const maxDistance = Math.min(rect.width, rect.height) / 2

      const power = Math.min(distance / maxDistance, 1)
      const angle = Math.atan2(deltaY, deltaX)

      const newData = {
        ...actionData,
        angle,
        power: Math.max(power, 0.1),
      }

      setActionData(newData)
      onAction(true, angle, newData.power)
    },
    [disabled, actionData, onAction],
  )

  const handleActionEnd = useCallback(() => {
    if (!actionData.active) return

    onAction(false, actionData.angle, actionData.power)
    setActionData({
      active: false,
      angle: 0,
      power: 0,
    })
  }, [actionData, onAction])

  // Touch event handlers
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      const target = e.target as HTMLElement

      if (target.closest(".joystick-area")) {
        handleJoystickStart(touch.clientX, touch.clientY)
      } else if (target.closest(".action-area")) {
        handleActionStart(touch.clientX, touch.clientY)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      const target = e.target as HTMLElement

      if (joystickData.active && target.closest(".joystick-area")) {
        handleJoystickStart(touch.clientX, touch.clientY)
      } else if (actionData.active) {
        handleActionMove(touch.clientX, touch.clientY)
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      const target = e.target as HTMLElement

      if (target.closest(".joystick-area")) {
        handleJoystickEnd()
      } else if (target.closest(".action-area")) {
        handleActionEnd()
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("touchstart", handleTouchStart, { passive: false })
      container.addEventListener("touchmove", handleTouchMove, { passive: false })
      container.addEventListener("touchend", handleTouchEnd, { passive: false })
      container.addEventListener("touchcancel", handleTouchEnd, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart)
        container.removeEventListener("touchmove", handleTouchMove)
        container.removeEventListener("touchend", handleTouchEnd)
        container.removeEventListener("touchcancel", handleTouchEnd)
      }
    }
  }, [
    containerRef,
    joystickData.active,
    actionData.active,
    handleJoystickStart,
    handleJoystickEnd,
    handleActionStart,
    handleActionMove,
    handleActionEnd,
  ])

  if (disabled) return null

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Movement Joystick */}
      <div className="absolute bottom-4 left-4 pointer-events-auto joystick-area">
        <div
          ref={joystickRef}
          className="relative w-24 h-24 bg-white/10 rounded-full border-2 border-white/30 backdrop-blur-sm"
        >
          <div
            className={cn(
              "absolute w-8 h-8 bg-white/80 rounded-full transition-all duration-75",
              "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
              joystickData.active && "bg-cyan-400",
            )}
            style={{
              transform: `translate(-50%, -50%) translate(${joystickData.x * 32}px, ${joystickData.y * 32}px)`,
            }}
          />
          <div className="absolute bottom-[-24px] left-1/2 transform -translate-x-1/2 text-white/60 text-xs font-mono">
            MOVE
          </div>
        </div>
      </div>

      {/* Action Area (Bow Aiming) */}
      <div className="absolute bottom-4 right-4 pointer-events-auto action-area">
        <div
          ref={actionAreaRef}
          className="relative w-32 h-32 bg-red-500/10 rounded-full border-2 border-red-500/30 backdrop-blur-sm"
        >
          {actionData.active && (
            <>
              {/* Aim line */}
              <div
                className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-red-400 origin-left"
                style={{
                  transform: `translate(-50%, -50%) rotate(${actionData.angle}rad)`,
                }}
              />
              {/* Power indicator */}
              <div
                className="absolute top-1/2 left-1/2 w-4 h-4 bg-red-400 rounded-full"
                style={{
                  transform: `translate(-50%, -50%) translate(${Math.cos(actionData.angle) * actionData.power * 48}px, ${Math.sin(actionData.angle) * actionData.power * 48}px)`,
                }}
              />
            </>
          )}
          <div className="absolute bottom-[-24px] left-1/2 transform -translate-x-1/2 text-white/60 text-xs font-mono">
            AIM & SHOOT
          </div>
        </div>
      </div>

      {/* Special Action Buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-auto">
        <button
          className="w-12 h-12 bg-purple-600/80 hover:bg-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg backdrop-blur-sm border border-purple-400/30"
          onTouchStart={(e) => {
            e.preventDefault()
            onSpecialAction("special")
          }}
          onClick={(e) => {
            e.preventDefault()
            onSpecialAction("special")
          }}
        >
          ⚡
        </button>
        <button
          className="w-12 h-12 bg-blue-600/80 hover:bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg backdrop-blur-sm border border-blue-400/30"
          onTouchStart={(e) => {
            e.preventDefault()
            onSpecialAction("dash")
          }}
          onClick={(e) => {
            e.preventDefault()
            onSpecialAction("dash")
          }}
        >
          💨
        </button>
      </div>

      {/* Control Instructions */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-2 text-white/80 text-xs font-mono pointer-events-none">
        <div>Left: Move</div>
        <div>Right: Aim & Shoot</div>
        <div>Top Right: Special Actions</div>
      </div>
    </div>
  )
}
