"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Maximize2, X, Volume2, VolumeX } from "lucide-react"
import { gameInputHandler } from "@/utils/game-input-handler"
import type { IJoystickUpdateEvent } from "react-joystick-component"
import { usePlatform } from "@/contexts/platform-context"

interface MobileGameContainerProps {
  children: React.ReactNode
  title?: string
  onClose?: () => void
  showControls?: boolean
}

interface JoystickProps {
  onMove: (x: number, y: number, power: number) => void
  onRelease: () => void
  size?: number
  label?: string
  className?: string
}

interface ActionButtonProps {
  action: string
  label: string
  onPress: () => void
  onRelease: () => void
  className?: string
}

// Joystick Component
function CustomJoystick({ onMove, onRelease, size = 80, label, className = "" }: JoystickProps) {
  const joystickRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleStart = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return
    setIsDragging(true)
    updatePosition(clientX, clientY)
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !joystickRef.current) return
    updatePosition(clientX, clientY)
  }

  const handleEnd = () => {
    setIsDragging(false)
    setPosition({ x: 0, y: 0 })
    onRelease()
  }

  const updatePosition = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return

    const rect = joystickRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    let deltaX = clientX - centerX
    let deltaY = clientY - centerY

    const maxDistance = size / 2 - 10
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    if (distance > maxDistance) {
      deltaX = (deltaX / distance) * maxDistance
      deltaY = (deltaY / distance) * maxDistance
    }

    const power = Math.min(distance / maxDistance, 1)
    setPosition({ x: deltaX, y: deltaY })
    onMove(deltaX / maxDistance, deltaY / maxDistance, power)
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
    <div className={`flex flex-col items-center ${className}`}>
      {label && <span className="text-xs text-cyan-400 mb-2 font-mono">{label}</span>}
      <div
        ref={joystickRef}
        className="relative bg-gray-800 rounded-full border-2 border-cyan-500 shadow-lg"
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div
          ref={knobRef}
          className="absolute bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full shadow-md transition-all duration-75"
          style={{
            width: size / 3,
            height: size / 3,
            left: size / 2 - size / 6 + position.x,
            top: size / 2 - size / 6 + position.y,
          }}
        />
      </div>
    </div>
  )
}

// Action Button Component
function ActionButton({ action, label, onPress, onRelease, className = "" }: ActionButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleStart = () => {
    setIsPressed(true)
    onPress()
  }

  const handleEnd = () => {
    setIsPressed(false)
    onRelease()
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        className={`w-16 h-16 rounded-full border-2 border-cyan-500 bg-gray-800 text-cyan-400 font-bold text-lg shadow-lg transition-all duration-75 ${
          isPressed ? "bg-cyan-500 text-gray-900 scale-95" : "hover:bg-gray-700"
        }`}
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
      >
        {action.toUpperCase()}
      </button>
      <span className="text-xs text-cyan-400 mt-1 font-mono">{label}</span>
    </div>
  )
}

export default function MobileGameContainer({
  children,
  title = "Game",
  onClose,
  showControls = true,
}: MobileGameContainerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { platformType } = usePlatform()
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight)
    }
    checkOrientation()
    window.addEventListener("resize", checkOrientation)
    return () => window.removeEventListener("resize", checkOrientation)
  }, [])

  useEffect(() => {
    if (showControls) {
      gameInputHandler.initialize()
      return () => gameInputHandler.destroy()
    }
  }, [showControls])

  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error("Fullscreen error:", error)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    // TODO: Implement actual audio muting
  }

  const handleMovementJoystick = (x: number, y: number, power: number) => {
    gameInputHandler.updateMovement({
      up: y < -0.3,
      down: y > 0.3,
      left: x < -0.3,
      right: x > 0.3,
    })
  }

  const handleMovementRelease = () => {
    gameInputHandler.updateMovement({
      up: false,
      down: false,
      left: false,
      right: false,
    })
  }

  const handleAimingJoystick = (x: number, y: number, power: number) => {
    const angle = Math.atan2(y, x)
    const isAiming = power > 0.2 // 20% threshold for aiming
    const isShooting = power > 0.2 // Start shooting when pulled back > 20%

    gameInputHandler.updateAiming({
      active: isAiming,
      angle: angle,
      power: power,
    })

    gameInputHandler.updateActions({
      shoot: isShooting,
    })
  }

  const handleAimingRelease = () => {
    // Release the shot when joystick is released
    gameInputHandler.updateAiming({
      active: false,
      angle: 0,
      power: 0,
    })

    gameInputHandler.updateActions({
      shoot: false,
    })
  }

  const handleActionPress = (action: string) => {
    gameInputHandler.updateActions({
      [action]: true,
    })
  }

  const handleActionRelease = (action: string) => {
    gameInputHandler.updateActions({
      [action]: false,
    })
  }

  const handleMove = (event: IJoystickUpdateEvent) => {
    gameInputHandler.updateMovement(event)
  }

  const handleAim = (event: IJoystickUpdateEvent) => {
    gameInputHandler.updateAiming(event)
  }

  const handleShootStart = () => {
    gameInputHandler.updateAction("drawBow", true)
  }

  const handleShootEnd = () => {
    gameInputHandler.updateAction("drawBow", false)
  }

  const handleSpecialAttack = () => {
    gameInputHandler.updateAction("specialAttack", true)
    setTimeout(() => gameInputHandler.updateAction("specialAttack", false), 50)
  }

  const joystickBaseColor = "rgba(255, 255, 255, 0.2)"
  const joystickStickColor = "rgba(255, 255, 255, 0.5)"

  if (platformType !== "mobile") {
    return <>{children}</>
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-gray-900 text-white relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-gradient-to-b from-gray-900/80 to-transparent">
        <h1 className="text-xl font-bold text-cyan-400">{title}</h1>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="text-cyan-400 hover:text-white hover:bg-gray-800"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-cyan-400 hover:text-white hover:bg-gray-800"
          >
            <Maximize2 size={20} />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-cyan-400 hover:text-white hover:bg-gray-800"
            >
              <X size={20} />
            </Button>
          )}
        </div>
      </div>

      {/* Game Content */}
      <div className="w-full h-full">{children}</div>

      {/* Mobile Controls */}
      {showControls && (
        <>
          {/* Landscape Layout */}
          <div className="absolute inset-0 pointer-events-none landscape:flex portrait:hidden">
            {/* Left Side - Movement */}
            <div className="flex-1 flex items-center justify-start pl-8 pointer-events-auto">
              <div className="flex flex-col items-center space-y-4">
                <CustomJoystick
                  onMove={handleMovementJoystick}
                  onRelease={handleMovementRelease}
                  size={120}
                  label="MOVEMENT"
                  className="pointer-events-auto"
                />
                <span className="text-xs text-cyan-400 font-mono">Move Player</span>
              </div>
            </div>

            {/* Right Side - Aiming and Actions (Centered) */}
            <div className="flex-1 flex items-center justify-center pr-8 pointer-events-auto">
              <div className="flex flex-col items-center space-y-6">
                {/* Centered Aim & Shoot Joystick */}
                <div className="flex flex-col items-center">
                  <CustomJoystick
                    onMove={handleAimingJoystick}
                    onRelease={handleAimingRelease}
                    size={140}
                    label="AIM & SHOOT"
                    className="pointer-events-auto"
                  />
                  <span className="text-xs text-cyan-400 font-mono mt-2">Pull to charge, release to fire</span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pointer-events-auto">
                  <ActionButton
                    action="X"
                    label="Dash"
                    onPress={() => handleActionPress("dash")}
                    onRelease={() => handleActionRelease("dash")}
                  />
                  <ActionButton
                    action="Y"
                    label="Special"
                    onPress={() => handleActionPress("special")}
                    onRelease={() => handleActionRelease("special")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Portrait Layout */}
          <div className="absolute inset-0 pointer-events-none portrait:flex landscape:hidden flex-col">
            {/* Top Section - Aiming */}
            <div className="flex-1 flex items-center justify-center pt-16 pointer-events-auto">
              <div className="flex flex-col items-center">
                <CustomJoystick
                  onMove={handleAimingJoystick}
                  onRelease={handleAimingRelease}
                  size={100}
                  label="AIM & SHOOT"
                  className="pointer-events-auto"
                />
                <span className="text-xs text-cyan-400 font-mono mt-2">Pull to charge, release to fire</span>
              </div>
            </div>

            {/* Bottom Section - Movement and Actions */}
            <div className="flex justify-between items-end p-6 pb-8 pointer-events-auto">
              {/* Movement Joystick */}
              <div className="flex flex-col items-center">
                <CustomJoystick
                  onMove={handleMovementJoystick}
                  onRelease={handleMovementRelease}
                  size={100}
                  label="MOVEMENT"
                  className="pointer-events-auto"
                />
                <span className="text-xs text-cyan-400 font-mono mt-2">Move Player</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3 pointer-events-auto">
                <ActionButton
                  action="Y"
                  label="Special"
                  onPress={() => handleActionPress("special")}
                  onRelease={() => handleActionRelease("special")}
                />
                <ActionButton
                  action="X"
                  label="Dash"
                  onPress={() => handleActionPress("dash")}
                  onRelease={() => handleActionRelease("dash")}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Joystick and Action Buttons for Mobile */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Movement Joystick */}
        <div
          className={`absolute ${
            isLandscape ? "left-8 bottom-8" : "left-1/2 -translate-x-1/2 bottom-32"
          } pointer-events-auto`}
        >
          <CustomJoystick
            size={100}
            baseColor={joystickBaseColor}
            stickColor={joystickStickColor}
            move={handleMove}
            stop={handleMove}
          />
        </div>

        {/* Aiming Joystick */}
        <div
          className={`absolute ${
            isLandscape ? "right-8 bottom-8" : "left-1/2 -translate-x-1/2 bottom-8"
          } pointer-events-auto`}
        >
          <CustomJoystick
            size={100}
            baseColor={joystickBaseColor}
            stickColor={joystickStickColor}
            move={handleAim}
            stop={handleAim}
          />
        </div>

        {/* Action Buttons */}
        <div
          className={`absolute ${
            isLandscape ? "right-32 bottom-8" : "right-8 bottom-32"
          } flex flex-col space-y-4 pointer-events-auto`}
        >
          <button
            className="w-16 h-16 rounded-full bg-red-500/50 border-2 border-red-300/80 text-white font-bold"
            onMouseDown={handleShootStart}
            onMouseUp={handleShootEnd}
            onTouchStart={handleShootStart}
            onTouchEnd={handleShootEnd}
          >
            SHOOT
          </button>
          <button
            onClick={handleSpecialAttack}
            className="w-16 h-16 rounded-full bg-purple-500/50 border-2 border-purple-300/80 text-white font-bold"
          >
            SPECIAL
          </button>
        </div>
      </div>
    </div>
  )
}
