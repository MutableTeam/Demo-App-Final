"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

// Import the rc-joystick component
// Note: This would normally be installed via npm install rc-joystick
// For now, we'll create a compatible interface
interface JoystickProps {
  size?: number
  baseColor?: string
  stickColor?: string
  throttle?: number
  disabled?: boolean
  move?: (data: { x: number; y: number; direction: string; distance: number }) => void
  stop?: () => void
  start?: () => void
}

// Temporary joystick component that mimics rc-joystick behavior
function RCJoystick({
  size = 100,
  baseColor = "#ddd",
  stickColor = "#999",
  move,
  stop,
  start,
  throttle = 50,
}: JoystickProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })

  const radius = size / 2
  const stickRadius = size / 6

  const handleStart = useCallback(
    (clientX: number, clientY: number, rect: DOMRect) => {
      const centerX = rect.left + radius
      const centerY = rect.top + radius
      setStartPos({ x: centerX, y: centerY })
      setIsDragging(true)
      if (start) start()
    },
    [radius, start],
  )

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return

      const deltaX = clientX - startPos.x
      const deltaY = clientY - startPos.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const maxDistance = radius - stickRadius

      let x = deltaX
      let y = deltaY

      if (distance > maxDistance) {
        const angle = Math.atan2(deltaY, deltaX)
        x = Math.cos(angle) * maxDistance
        y = Math.sin(angle) * maxDistance
      }

      setPosition({ x, y })

      // Calculate normalized values (-1 to 1)
      const normalizedX = x / maxDistance
      const normalizedY = y / maxDistance
      const normalizedDistance = Math.min(distance / maxDistance, 1)

      // Determine direction
      let direction = "C" // Center
      if (normalizedDistance > 0.3) {
        const angle = Math.atan2(-normalizedY, normalizedX) * (180 / Math.PI)
        if (angle >= -22.5 && angle < 22.5) direction = "E"
        else if (angle >= 22.5 && angle < 67.5) direction = "NE"
        else if (angle >= 67.5 && angle < 112.5) direction = "N"
        else if (angle >= 112.5 && angle < 157.5) direction = "NW"
        else if (angle >= 157.5 || angle < -157.5) direction = "W"
        else if (angle >= -157.5 && angle < -112.5) direction = "SW"
        else if (angle >= -112.5 && angle < -67.5) direction = "S"
        else if (angle >= -67.5 && angle < -22.5) direction = "SE"
      }

      if (move) {
        move({
          x: normalizedX,
          y: -normalizedY, // Invert Y for standard game coordinates
          direction,
          distance: normalizedDistance,
        })
      }
    },
    [isDragging, startPos, radius, stickRadius, move],
  )

  const handleEnd = useCallback(() => {
    setIsDragging(false)
    setPosition({ x: 0, y: 0 })
    if (stop) stop()
  }, [stop])

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    handleStart(e.clientX, e.clientY, rect)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    handleStart(touch.clientX, touch.clientY, rect)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    handleEnd()
  }

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY)
      const handleGlobalMouseUp = () => handleEnd()
      const handleGlobalTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        const touch = e.touches[0]
        if (touch) handleMove(touch.clientX, touch.clientY)
      }
      const handleGlobalTouchEnd = (e: TouchEvent) => {
        e.preventDefault()
        handleEnd()
      }

      document.addEventListener("mousemove", handleGlobalMouseMove)
      document.addEventListener("mouseup", handleGlobalMouseUp)
      document.addEventListener("touchmove", handleGlobalTouchMove, { passive: false })
      document.addEventListener("touchend", handleGlobalTouchEnd, { passive: false })

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove)
        document.removeEventListener("mouseup", handleGlobalMouseUp)
        document.removeEventListener("touchmove", handleGlobalTouchMove)
        document.removeEventListener("touchend", handleGlobalTouchEnd)
      }
    }
  }, [isDragging, handleMove, handleEnd])

  return (
    <div
      className="relative select-none touch-none"
      style={{
        width: size,
        height: size,
        backgroundColor: baseColor,
        borderRadius: "50%",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="absolute rounded-full transition-all duration-75"
        style={{
          width: stickRadius * 2,
          height: stickRadius * 2,
          backgroundColor: stickColor,
          left: radius - stickRadius + position.x,
          top: radius - stickRadius + position.y,
          pointerEvents: "none",
        }}
      />
    </div>
  )
}

interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
  onMovementChange?: (movement: { up: boolean; down: boolean; left: boolean; right: boolean }) => void
  onActionPress?: (action: string, pressed: boolean) => void
}

interface ActionButtonProps {
  label: string
  action: string
  onPress: (action: string, pressed: boolean) => void
  className?: string
  title?: string
}

function ActionButton({ label, action, onPress, className, title }: ActionButtonProps) {
  const handleInteractionStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      console.log(`Action button ${action} pressed`)
      onPress(action, true)
    },
    [action, onPress],
  )

  const handleInteractionEnd = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      console.log(`Action button ${action} released`)
      onPress(action, false)
    },
    [action, onPress],
  )

  return (
    <button
      className={cn(
        "w-16 h-16 rounded-full border-2 flex items-center justify-center font-mono text-lg font-bold transition-all duration-100",
        "touch-none select-none active:scale-95",
        "bg-zinc-700/90 border-zinc-500/70 text-zinc-200 active:bg-zinc-600/90 shadow-lg backdrop-blur-sm",
        "hover:bg-zinc-600/80 focus:outline-none focus:ring-2 focus:ring-zinc-400/50",
        className,
      )}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      onTouchCancel={handleInteractionEnd}
      onMouseDown={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd}
      title={title}
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {label}
    </button>
  )
}

export default function MobileGameContainer({
  children,
  className,
  onMovementChange = () => {},
  onActionPress = () => {},
}: MobileGameContainerProps) {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")

  useEffect(() => {
    const handleOrientationChange = () => {
      const currentOrientation = window.matchMedia("(orientation: landscape)").matches ? "landscape" : "portrait"
      setOrientation(currentOrientation)
    }
    handleOrientationChange()
    window.addEventListener("resize", handleOrientationChange)
    return () => window.removeEventListener("resize", handleOrientationChange)
  }, [])

  // Handle joystick movement - ONLY for player movement, NOT shooting
  const handleJoystickMove = useCallback(
    (data: { x: number; y: number; direction: string; distance: number }) => {
      console.log("RC Joystick move:", data)

      if (!onMovementChange) {
        console.warn("onMovementChange not provided to MobileGameContainer")
        return
      }

      const deadzone = 0.2 // Deadzone threshold
      const { x, y, distance } = data

      if (distance < deadzone) {
        console.log("Joystick in deadzone - stopping movement")
        onMovementChange({ up: false, down: false, left: false, right: false })
        return
      }

      // Convert analog input to digital movement controls
      const threshold = 0.3
      const movement = {
        up: y > threshold,
        down: y < -threshold,
        left: x < -threshold,
        right: x > threshold,
      }

      console.log("RC Joystick movement applied:", {
        raw: { x, y, distance, direction: data.direction },
        movement,
      })

      onMovementChange(movement)
    },
    [onMovementChange],
  )

  // Handle joystick stop - ensure movement stops
  const handleJoystickStop = useCallback(() => {
    console.log("RC Joystick stopped - clearing all movement")

    if (!onMovementChange) {
      console.warn("onMovementChange not provided to MobileGameContainer")
      return
    }

    onMovementChange({ up: false, down: false, left: false, right: false })
  }, [onMovementChange])

  const handleJoystickStart = useCallback(() => {
    console.log("RC Joystick started")
  }, [])

  const isLandscape = orientation === "landscape"

  if (isLandscape) {
    // Landscape Layout: Movement | Game Screen | Actions
    return (
      <div
        className={cn("fixed inset-0 bg-zinc-900 flex items-center justify-center font-mono text-zinc-400", className)}
      >
        <div className="w-full h-full flex flex-row items-center p-4 gap-4">
          {/* Movement Controls - Left Side */}
          <div className="w-1/4 h-full flex flex-col items-center justify-center space-y-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <span className="text-xs tracking-widest font-bold text-zinc-300">MOVEMENT</span>
              <div className="relative">
                <RCJoystick
                  size={120}
                  baseColor="rgba(63, 63, 70, 0.8)"
                  stickColor="rgba(113, 113, 122, 0.9)"
                  move={handleJoystickMove}
                  stop={handleJoystickStop}
                  start={handleJoystickStart}
                  throttle={16} // ~60fps updates
                />
              </div>
              <span className="text-xs text-zinc-500">Move Player</span>
            </div>
          </div>

          {/* Game Screen - Center */}
          <div className="w-1/2 h-full flex items-center justify-center">
            <div className="w-full h-full bg-black/70 border-2 border-zinc-700 rounded-lg relative overflow-hidden">
              {children}
            </div>
          </div>

          {/* Action Controls - Right Side */}
          <div className="w-1/4 h-full flex flex-col items-center justify-center space-y-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <span className="text-xs tracking-widest font-bold text-zinc-300">ACTIONS</span>
              <div className="grid grid-cols-2 gap-3 w-[140px] h-[140px] place-items-center">
                <ActionButton label="Y" action="special" onPress={onActionPress} title="Special Attack" />
                <ActionButton label="X" action="dash" onPress={onActionPress} title="Dash" />
                <ActionButton label="B" action="explosive" onPress={onActionPress} title="Explosive Arrow" />
                <ActionButton label="A" action="shoot" onPress={onActionPress} title="Shoot Arrow" />
              </div>
              <span className="text-xs text-zinc-500">Combat Actions</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Portrait Layout: Game Screen on top, Controls on bottom
  return (
    <div
      className={cn("fixed inset-0 bg-zinc-900 flex items-center justify-center font-mono text-zinc-400", className)}
    >
      <div className="w-full h-full flex flex-col items-center p-4 gap-4">
        {/* Game Screen - Top */}
        <div className="w-full h-2/3 flex items-center justify-center">
          <div className="w-full h-full bg-black/70 border-2 border-zinc-700 rounded-lg relative overflow-hidden max-w-md">
            {children}
          </div>
        </div>

        {/* Controls - Bottom */}
        <div className="w-full h-1/3 flex flex-row items-center justify-between px-8">
          {/* Movement Controls - Bottom Left */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <span className="text-xs tracking-widest font-bold text-zinc-300">MOVEMENT</span>
            <div className="relative">
              <RCJoystick
                size={100}
                baseColor="rgba(63, 63, 70, 0.8)"
                stickColor="rgba(113, 113, 122, 0.9)"
                move={handleJoystickMove}
                stop={handleJoystickStop}
                start={handleJoystickStart}
                throttle={16} // ~60fps updates
              />
            </div>
            <span className="text-xs text-zinc-500">Move Player</span>
          </div>

          {/* Action Controls - Bottom Right */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <span className="text-xs tracking-widest font-bold text-zinc-300">ACTIONS</span>
            <div className="grid grid-cols-2 gap-3 w-[120px] h-[120px] place-items-center">
              <ActionButton label="Y" action="special" onPress={onActionPress} title="Special Attack" />
              <ActionButton label="X" action="dash" onPress={onActionPress} title="Dash" />
              <ActionButton label="B" action="explosive" onPress={onActionPress} title="Explosive Arrow" />
              <ActionButton label="A" action="shoot" onPress={onActionPress} title="Shoot Arrow" />
            </div>
            <span className="text-xs text-zinc-500">Combat Actions</span>
          </div>
        </div>
      </div>
    </div>
  )
}
