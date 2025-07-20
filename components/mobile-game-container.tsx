"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"

interface JoystickProps {
  onMove: (direction: { x: number; y: number }) => void
  size?: number
  className?: string
}

function Joystick({ onMove, size = 80, className }: JoystickProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const joystickRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true)
    if (joystickRef.current) {
      const rect = joystickRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      updatePosition(clientX - centerX, clientY - centerY)
    }
  }, [])

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging || !joystickRef.current) return

      const rect = joystickRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      updatePosition(clientX - centerX, clientY - centerY)
    },
    [isDragging],
  )

  const handleEnd = useCallback(() => {
    setIsDragging(false)
    setPosition({ x: 0, y: 0 })
    onMove({ x: 0, y: 0 })
  }, [onMove])

  const updatePosition = useCallback(
    (deltaX: number, deltaY: number) => {
      const maxDistance = size / 2 - 10
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      if (distance <= maxDistance) {
        setPosition({ x: deltaX, y: deltaY })
        onMove({
          x: deltaX / maxDistance,
          y: -deltaY / maxDistance,
        })
      } else {
        const angle = Math.atan2(deltaY, deltaX)
        const x = Math.cos(angle) * maxDistance
        const y = Math.sin(angle) * maxDistance
        setPosition({ x, y })
        onMove({
          x: x / maxDistance,
          y: -y / maxDistance,
        })
      }
    },
    [size, onMove],
  )

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
      className={cn("relative rounded-full border-4 border-gray-600 bg-gray-800 select-none touch-none", className)}
      style={{ width: size, height: size }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div
        ref={knobRef}
        className="absolute w-6 h-6 bg-gray-400 rounded-full border-2 border-gray-500 transition-all duration-75"
        style={{
          left: `calc(50% + ${position.x}px - 12px)`,
          top: `calc(50% + ${position.y}px - 12px)`,
          transform: isDragging ? "scale(1.1)" : "scale(1)",
        }}
      />
    </div>
  )
}

interface ActionButtonProps {
  label: string
  onPress: (pressed: boolean) => void
  size?: number
  className?: string
}

function ActionButton({ label, onPress, size = 50, className }: ActionButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleStart = () => {
    setIsPressed(true)
    onPress(true)
  }

  const handleEnd = () => {
    setIsPressed(false)
    onPress(false)
  }

  return (
    <button
      className={cn(
        "rounded-full border-4 border-gray-600 bg-gray-700 text-white font-bold text-lg select-none touch-none transition-all duration-75 active:scale-95",
        isPressed && "bg-gray-600 scale-95",
        className,
      )}
      style={{ width: size, height: size }}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
    >
      {label}
    </button>
  )
}

interface DirectionalPadProps {
  onPress: (direction: string, pressed: boolean) => void
  size?: number
}

function DirectionalPad({ onPress, size = 40 }: DirectionalPadProps) {
  return (
    <div className="relative" style={{ width: size * 3, height: size * 3 }}>
      {/* Up */}
      <ActionButton
        label="↑"
        onPress={(pressed) => onPress("up", pressed)}
        size={size}
        className="absolute top-0 left-1/2 transform -translate-x-1/2"
      />
      {/* Left */}
      <ActionButton
        label="←"
        onPress={(pressed) => onPress("left", pressed)}
        size={size}
        className="absolute top-1/2 left-0 transform -translate-y-1/2"
      />
      {/* Right */}
      <ActionButton
        label="→"
        onPress={(pressed) => onPress("right", pressed)}
        size={size}
        className="absolute top-1/2 right-0 transform -translate-y-1/2"
      />
      {/* Down */}
      <ActionButton
        label="↓"
        onPress={(pressed) => onPress("down", pressed)}
        size={size}
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
      />
    </div>
  )
}

interface MobileGameContainerProps {
  children: React.ReactNode
  onJoystickMove: (direction: { x: number; y: number }) => void
  onActionPress: (action: string, pressed: boolean) => void
}

export default function MobileGameContainer({ children, onJoystickMove, onActionPress }: MobileGameContainerProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")

  useEffect(() => {
    const checkOrientation = () => {
      const newOrientation = window.innerHeight > window.innerWidth ? "portrait" : "landscape"
      setOrientation(newOrientation)
    }

    checkOrientation()
    window.addEventListener("resize", checkOrientation)
    window.addEventListener("orientationchange", checkOrientation)

    return () => {
      window.removeEventListener("resize", checkOrientation)
      window.removeEventListener("orientationchange", checkOrientation)
    }
  }, [])

  if (orientation === "portrait") {
    return (
      <div className="w-full h-screen bg-gray-800 flex flex-col overflow-hidden">
        {/* Game Screen Area */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div
            className="w-full max-w-md bg-black border-4 border-gray-600 rounded-lg overflow-hidden"
            style={{ aspectRatio: "4/3" }}
          >
            {children}
          </div>
        </div>

        {/* Control Panel */}
        <div className="h-48 bg-gray-900 border-t-4 border-gray-600 flex items-center justify-between px-8 py-4">
          {/* Left Side - Movement Controls */}
          <div className="flex flex-col items-center space-y-2">
            <Joystick onMove={onJoystickMove} size={70} />
            <DirectionalPad onPress={onActionPress} size={25} />
            <span className="text-gray-400 text-xs font-mono">MOVE</span>
          </div>

          {/* Right Side - Action Buttons */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative" style={{ width: 120, height: 120 }}>
              {/* Y Button (Top) */}
              <ActionButton
                label="Y"
                onPress={(pressed) => onActionPress("Y", pressed)}
                size={45}
                className="absolute top-0 left-1/2 transform -translate-x-1/2"
              />
              {/* X Button (Left) */}
              <ActionButton
                label="X"
                onPress={(pressed) => onActionPress("X", pressed)}
                size={45}
                className="absolute top-1/2 left-0 transform -translate-y-1/2"
              />
              {/* A Button (Right) */}
              <ActionButton
                label="A"
                onPress={(pressed) => onActionPress("A", pressed)}
                size={45}
                className="absolute top-1/2 right-0 transform -translate-y-1/2"
              />
              {/* B Button (Bottom) */}
              <ActionButton
                label="B"
                onPress={(pressed) => onActionPress("B", pressed)}
                size={45}
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
              />
            </div>
            <span className="text-gray-400 text-xs font-mono">ACTIONS</span>
          </div>
        </div>
      </div>
    )
  }

  // Landscape Layout
  return (
    <div className="w-full h-screen bg-gray-800 flex overflow-hidden">
      {/* Left Controls */}
      <div className="w-32 bg-gray-900 border-r-4 border-gray-600 flex flex-col items-center justify-center space-y-4">
        <Joystick onMove={onJoystickMove} size={60} />
        <DirectionalPad onPress={onActionPress} size={20} />
      </div>

      {/* Game Screen */}
      <div className="flex-1 bg-black flex items-center justify-center">{children}</div>

      {/* Right Controls */}
      <div className="w-32 bg-gray-900 border-l-4 border-gray-600 flex items-center justify-center">
        <div className="relative" style={{ width: 100, height: 100 }}>
          <ActionButton
            label="Y"
            onPress={(pressed) => onActionPress("Y", pressed)}
            size={35}
            className="absolute top-0 left-1/2 transform -translate-x-1/2"
          />
          <ActionButton
            label="X"
            onPress={(pressed) => onActionPress("X", pressed)}
            size={35}
            className="absolute top-1/2 left-0 transform -translate-y-1/2"
          />
          <ActionButton
            label="A"
            onPress={(pressed) => onActionPress("A", pressed)}
            size={35}
            className="absolute top-1/2 right-0 transform -translate-y-1/2"
          />
          <ActionButton
            label="B"
            onPress={(pressed) => onActionPress("B", pressed)}
            size={35}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
          />
        </div>
      </div>
    </div>
  )
}
