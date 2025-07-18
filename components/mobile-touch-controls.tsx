"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
import { motion, useMotionValue } from "framer-motion"
import { Zap, Shield } from "lucide-react"

interface MobileTouchControlsProps {
  onMovement: (x: number, y: number) => void
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
  const joystickTouchId = useRef<number | null>(null)
  const joystickBase = useMotionValue({ x: 0, y: 0 })
  const joystickKnob = useMotionValue({ x: 0, y: 0 })
  const [showJoystick, setShowJoystick] = useState(false)

  const aimTouchId = useRef<number | null>(null)
  const aimStartPos = useRef<{ x: number; y: number } | null>(null)
  const [isAiming, setIsAiming] = useState(false)
  const [aimPower, setAimPower] = useState(0)
  const [aimAngle, setAimAngle] = useState(0)

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled) return
      e.preventDefault()
      for (const touch of Array.from(e.changedTouches)) {
        const touchX = touch.clientX
        const touchY = touch.clientY

        if (touchX < window.innerWidth / 2 && joystickTouchId.current === null) {
          joystickTouchId.current = touch.identifier
          joystickBase.set({ x: touchX, y: touchY })
          joystickKnob.set({ x: touchX, y: touchY })
          setShowJoystick(true)
        } else if (touchX >= window.innerWidth / 2 && aimTouchId.current === null) {
          aimTouchId.current = touch.identifier
          aimStartPos.current = { x: touchX, y: touchY }
          setIsAiming(true)
          onBowDraw(true, 0, 0)
        }
      }
    },
    [disabled, onBowDraw, joystickBase, joystickKnob],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled) return
      e.preventDefault()
      for (const touch of Array.from(e.changedTouches)) {
        if (touch.identifier === joystickTouchId.current) {
          const basePos = joystickBase.get()
          const dx = touch.clientX - basePos.x
          const dy = touch.clientY - basePos.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const maxDistance = 60
          const clampedDistance = Math.min(distance, maxDistance)
          const angle = Math.atan2(dy, dx)

          const knobX = basePos.x + Math.cos(angle) * clampedDistance
          const knobY = basePos.y + Math.sin(angle) * clampedDistance
          joystickKnob.set({ x: knobX, y: knobY })

          const moveX = (Math.cos(angle) * clampedDistance) / maxDistance
          const moveY = (Math.sin(angle) * clampedDistance) / maxDistance
          onMovement(moveX, moveY)
        } else if (touch.identifier === aimTouchId.current && aimStartPos.current) {
          const dx = touch.clientX - aimStartPos.current.x
          const dy = touch.clientY - aimStartPos.current.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const power = Math.min(distance / 100, 1)
          const angle = Math.atan2(dy, dx)

          setAimPower(power)
          setAimAngle(angle)
          onBowDraw(true, angle, power)
        }
      }
    },
    [disabled, onMovement, onBowDraw, joystickBase, joystickKnob],
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (disabled) return
      e.preventDefault()
      for (const touch of Array.from(e.changedTouches)) {
        if (touch.identifier === joystickTouchId.current) {
          joystickTouchId.current = null
          setShowJoystick(false)
          onMovement(0, 0)
        } else if (touch.identifier === aimTouchId.current) {
          aimTouchId.current = null
          setIsAiming(false)
          onBowDraw(false, aimAngle, aimPower)
          setAimPower(0)
          setAimAngle(0)
        }
      }
    },
    [disabled, onMovement, onBowDraw, aimAngle, aimPower],
  )

  useEffect(() => {
    const element = document.body

    element.addEventListener("touchstart", handleTouchStart, { passive: false })
    element.addEventListener("touchmove", handleTouchMove, { passive: false })
    element.addEventListener("touchend", handleTouchEnd, { passive: false })
    element.addEventListener("touchcancel", handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener("touchstart", handleTouchStart)
      element.removeEventListener("touchmove", handleTouchMove)
      element.removeEventListener("touchend", handleTouchEnd)
      element.removeEventListener("touchcancel", handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const joystickBasePos = joystickBase.get()
  const joystickKnobPos = joystickKnob.get()

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {showJoystick && (
        <div
          className="absolute"
          style={{ left: joystickBasePos.x, top: joystickBasePos.y, transform: "translate(-50%, -50%)" }}
        >
          <div className="w-32 h-32 bg-white/10 rounded-full border-2 border-white/20" />
          <motion.div
            className="absolute w-16 h-16 bg-white/30 rounded-full border-2 border-white/50 top-1/2 left-1/2"
            style={{
              x: joystickKnobPos.x - joystickBasePos.x - 32,
              y: joystickKnobPos.y - joystickBasePos.y - 32,
            }}
          />
        </div>
      )}

      <div className="absolute bottom-6 right-6 flex flex-col items-center gap-4 pointer-events-auto">
        <button
          onTouchStart={onDash}
          disabled={disabled}
          className="w-20 h-20 rounded-full bg-cyber-blue/50 text-white font-bold border-2 border-cyber-blue-light active:bg-cyber-blue flex items-center justify-center"
        >
          <Shield size={32} />
        </button>
        <button
          onTouchStart={onSpecialAttack}
          disabled={disabled}
          className="w-24 h-24 rounded-full bg-cyber-magenta/50 text-white font-bold border-2 border-cyber-magenta-light active:bg-cyber-magenta flex items-center justify-center"
        >
          <Zap size={40} />
        </button>
      </div>
    </div>
  )
}
