"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { X, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MobileGameContainerProps {
  children: React.ReactNode
  onJoystickMove: (direction: { x: number; y: number }) => void
  onActionPress: (action: string, pressed: boolean) => void
  onExit?: () => void
}

export default function MobileGameContainer({
  children,
  onJoystickMove,
  onActionPress,
  onExit,
}: MobileGameContainerProps) {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")
  const [isPaused, setIsPaused] = useState(false)
  const joystickRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const [joystickActive, setJoystickActive] = useState(false)
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 })

  // Detect orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      const isLandscape = window.innerWidth > window.innerHeight
      setOrientation(isLandscape ? "landscape" : "portrait")
    }

    handleOrientationChange()
    window.addEventListener("resize", handleOrientationChange)
    window.addEventListener("orientationchange", handleOrientationChange)

    return () => {
      window.removeEventListener("resize", handleOrientationChange)
      window.removeEventListener("orientationchange", handleOrientationChange)
    }
  }, [])

  // Joystick handling
  const handleJoystickStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!joystickRef.current) return

      setJoystickActive(true)
      const rect = joystickRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const updateJoystick = (x: number, y: number) => {
        const deltaX = x - centerX
        const deltaY = y - centerY
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        const maxDistance = rect.width / 2 - 20 // Account for knob size

        let normalizedX = deltaX / maxDistance
        let normalizedY = deltaY / maxDistance

        if (distance > maxDistance) {
          normalizedX = (deltaX / distance) * 1
          normalizedY = (deltaY / distance) * 1
        }

        // Clamp values between -1 and 1
        normalizedX = Math.max(-1, Math.min(1, normalizedX))
        normalizedY = Math.max(-1, Math.min(1, normalizedY))

        setJoystickPosition({ x: normalizedX, y: normalizedY })
        onJoystickMove({ x: normalizedX, y: normalizedY })
      }

      updateJoystick(clientX, clientY)
    },
    [onJoystickMove],
  )

  const handleJoystickMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!joystickActive || !joystickRef.current) return

      const rect = joystickRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = clientX - centerX
      const deltaY = clientY - centerY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const maxDistance = rect.width / 2 - 20

      let normalizedX = deltaX / maxDistance
      let normalizedY = deltaY / maxDistance

      if (distance > maxDistance) {
        normalizedX = (deltaX / distance) * 1
        normalizedY = (deltaY / distance) * 1
      }

      normalizedX = Math.max(-1, Math.min(1, normalizedX))
      normalizedY = Math.max(-1, Math.min(1, normalizedY))

      setJoystickPosition({ x: normalizedX, y: normalizedY })
      onJoystickMove({ x: normalizedX, y: normalizedY })
    },
    [joystickActive, onJoystickMove],
  )

  const handleJoystickEnd = useCallback(() => {
    setJoystickActive(false)
    setJoystickPosition({ x: 0, y: 0 })
    onJoystickMove({ x: 0, y: 0 })
  }, [onJoystickMove])

  // Touch event handlers
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (joystickActive && e.touches.length > 0) {
        e.preventDefault()
        const touch = e.touches[0]
        handleJoystickMove(touch.clientX, touch.clientY)
      }
    }

    const handleTouchEnd = () => {
      if (joystickActive) {
        handleJoystickEnd()
      }
    }

    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd)

    return () => {
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [joystickActive, handleJoystickMove, handleJoystickEnd])

  // Action button handlers
  const handleActionStart = (action: string) => {
    onActionPress(action, true)
  }

  const handleActionEnd = (action: string) => {
    onActionPress(action, false)
  }

  const ActionButton = ({ action, label, className }: { action: string; label: string; className?: string }) => (
    <button
      className={cn(
        "w-16 h-16 rounded-full bg-gray-700/80 border-2 border-gray-500 text-white font-bold text-sm",
        "active:bg-gray-600 active:scale-95 transition-all duration-100",
        "flex items-center justify-center select-none touch-manipulation",
        className,
      )}
      onTouchStart={(e) => {
        e.preventDefault()
        handleActionStart(action)
      }}
      onTouchEnd={(e) => {
        e.preventDefault()
        handleActionEnd(action)
      }}
      onMouseDown={() => handleActionStart(action)}
      onMouseUp={() => handleActionEnd(action)}
      onMouseLeave={() => handleActionEnd(action)}
    >
      {label}
    </button>
  )

  const JoystickComponent = () => (
    <div className="relative">
      <div
        ref={joystickRef}
        className="w-24 h-24 rounded-full bg-gray-800/60 border-2 border-gray-600 relative select-none touch-manipulation"
        onTouchStart={(e) => {
          e.preventDefault()
          const touch = e.touches[0]
          handleJoystickStart(touch.clientX, touch.clientY)
        }}
        onMouseDown={(e) => {
          e.preventDefault()
          handleJoystickStart(e.clientX, e.clientY)
        }}
      >
        <div
          ref={knobRef}
          className="w-8 h-8 rounded-full bg-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-100"
          style={{
            transform: `translate(-50%, -50%) translate(${joystickPosition.x * 32}px, ${joystickPosition.y * 32}px)`,
          }}
        />
      </div>
      <div className="text-xs text-gray-400 text-center mt-1 font-mono">MOVE</div>
    </div>
  )

  if (orientation === "landscape") {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between p-2 bg-gray-800/50 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsPaused(!isPaused)}
              className="text-white hover:bg-gray-700"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          </div>
          <div className="text-white font-mono text-sm">ARCHER ARENA</div>
          <Button size="sm" variant="ghost" onClick={onExit} className="text-white hover:bg-gray-700">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Main game area */}
        <div className="flex-1 flex">
          {/* Left controls */}
          <div className="w-32 flex flex-col items-center justify-center bg-gray-800/30 border-r border-gray-700">
            <div className="text-xs text-gray-400 mb-2 font-mono">MOVEMENT</div>
            <JoystickComponent />
            <div className="text-xs text-gray-400 mt-2 font-mono">ANALOG</div>
          </div>

          {/* Game content */}
          <div className="flex-1 relative bg-black">
            <div className="absolute inset-4 border-2 border-dashed border-gray-600 rounded">
              <div className="w-full h-full flex items-center justify-center">{children}</div>
            </div>
          </div>

          {/* Right controls */}
          <div className="w-32 flex flex-col items-center justify-center bg-gray-800/30 border-l border-gray-700">
            <div className="text-xs text-gray-400 mb-4 font-mono">ACTIONS</div>
            <div className="grid grid-cols-2 gap-3">
              <ActionButton action="special" label="Y" className="bg-yellow-600/80 border-yellow-500" />
              <ActionButton action="dash" label="X" className="bg-blue-600/80 border-blue-500" />
              <ActionButton action="ready" label="B" className="bg-red-600/80 border-red-500" />
              <ActionButton action="shoot" label="A" className="bg-green-600/80 border-green-500" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Portrait orientation
  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between p-3 bg-gray-800/50 border-b border-gray-700">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsPaused(!isPaused)}
          className="text-white hover:bg-gray-700"
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </Button>
        <div className="text-white font-mono text-sm">ARCHER ARENA</div>
        <Button size="sm" variant="ghost" onClick={onExit} className="text-white hover:bg-gray-700">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Game content area */}
      <div className="flex-1 relative bg-black">
        <div className="absolute inset-4 border-2 border-dashed border-gray-600 rounded">
          <div className="w-full h-full flex items-center justify-center">{children}</div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="h-40 bg-gray-800/30 border-t border-gray-700 flex items-center justify-between px-8">
        {/* Left side - Movement controls */}
        <div className="flex flex-col items-center">
          <JoystickComponent />
        </div>

        {/* Right side - Action buttons */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-gray-400 mb-2 font-mono">ACTIONS</div>
          <div className="grid grid-cols-2 gap-3">
            <ActionButton action="special" label="Y" className="bg-yellow-600/80 border-yellow-500" />
            <ActionButton action="dash" label="X" className="bg-blue-600/80 border-blue-500" />
            <ActionButton action="ready" label="B" className="bg-red-600/80 border-red-500" />
            <ActionButton action="shoot" label="A" className="bg-green-600/80 border-green-500" />
          </div>
        </div>
      </div>
    </div>
  )
}
