"use client"

import type React from "react"

import { useState, useEffect, useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { X, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileGameContainerProps {
  children: ReactNode
  onJoystickMove: (direction: { x: number; y: number }) => void
  onActionPress: (action: string, pressed: boolean) => void
  onExit?: () => void
  className?: string
}

export default function MobileGameContainer({
  children,
  onJoystickMove,
  onActionPress,
  onExit,
  className,
}: MobileGameContainerProps) {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const joystickRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

  // Handle joystick movement
  const handleJoystickStart = (clientX: number, clientY: number) => {
    setIsDragging(true)
    updateJoystickPosition(clientX, clientY)
  }

  const handleJoystickMove = (clientX: number, clientY: number) => {
    if (!isDragging) return
    updateJoystickPosition(clientX, clientY)
  }

  const handleJoystickEnd = () => {
    setIsDragging(false)
    setJoystickPosition({ x: 0, y: 0 })
    onJoystickMove({ x: 0, y: 0 })
  }

  const updateJoystickPosition = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return

    const rect = joystickRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = clientX - centerX
    const deltaY = clientY - centerY

    const maxDistance = rect.width / 2 - 20 // Account for knob size
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    let normalizedX = deltaX / maxDistance
    let normalizedY = deltaY / maxDistance

    if (distance > maxDistance) {
      normalizedX = (deltaX / distance) * (maxDistance / maxDistance)
      normalizedY = (deltaY / distance) * (maxDistance / maxDistance)
    }

    // Clamp values between -1 and 1
    normalizedX = Math.max(-1, Math.min(1, normalizedX))
    normalizedY = Math.max(-1, Math.min(1, normalizedY))

    setJoystickPosition({ x: normalizedX, y: normalizedY })
    onJoystickMove({ x: normalizedX, y: -normalizedY }) // Invert Y for game coordinates
  }

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleJoystickStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleJoystickMove(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    handleJoystickEnd()
  }

  // Mouse event handlers for testing on desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleJoystickStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault()
    handleJoystickMove(e.clientX, e.clientY)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault()
    handleJoystickEnd()
  }

  // Action button handlers
  const handleActionDown = (action: string) => {
    onActionPress(action, true)
  }

  const handleActionUp = (action: string) => {
    onActionPress(action, false)
  }

  const isLandscape = orientation === "landscape"

  return (
    <div
      ref={containerRef}
      className={cn("fixed inset-0 bg-gray-900 flex flex-col overflow-hidden", "touch-none select-none", className)}
      style={{
        height: "100vh",
        width: "100vw",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      {/* Header Controls */}
      <div className="flex justify-between items-center p-2 bg-gray-800/50 backdrop-blur-sm z-50">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="text-white hover:bg-white/20"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>

        <div className="text-white text-sm font-mono">ARCHER ARENA</div>

        {onExit && (
          <Button variant="ghost" size="sm" onClick={onExit} className="text-white hover:bg-white/20">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Game Content Area */}
      <div className={cn("flex-1 relative overflow-hidden", isLandscape ? "flex" : "flex flex-col")}>
        {/* Main Game Display */}
        <div
          className={cn(
            "bg-black border-2 border-gray-600 relative overflow-hidden",
            isLandscape ? "flex-1 mx-4 my-2 rounded-lg" : "mx-4 mt-2 mb-4 aspect-[4/3] rounded-lg",
          )}
        >
          <div className="absolute inset-2 border border-dashed border-gray-500 rounded">
            <div className="w-full h-full flex items-center justify-center text-green-400 font-mono text-center">
              <div className="space-y-2">
                <div className="text-lg">GAME SCREEN</div>
                <div className="text-sm opacity-75">[Main Display Area]</div>
                <div className="text-xs opacity-50">{isLandscape ? "~500x300px" : "400x300px"}</div>
              </div>
            </div>
          </div>

          {/* Game content goes here */}
          <div className="absolute inset-0">{children}</div>
        </div>

        {/* Controls Area */}
        <div
          className={cn(
            "flex justify-between items-end p-4",
            isLandscape ? "flex-col h-full w-32" : "flex-row h-32 w-full",
          )}
        >
          {/* Movement Controls */}
          <div className={cn("flex flex-col items-center", isLandscape ? "mb-8" : "ml-4")}>
            <div className="text-gray-400 text-xs font-mono mb-2 tracking-wider">
              {isLandscape ? "MOVEMENT" : "MOVE"}
            </div>

            {isLandscape ? (
              // Landscape: Analog stick
              <div
                ref={joystickRef}
                className="relative w-24 h-24 bg-gray-800 rounded-full border-2 border-gray-600 cursor-pointer"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={isDragging ? handleMouseMove : undefined}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div
                  className="absolute w-8 h-8 bg-gray-400 rounded-full border border-gray-300 transition-transform"
                  style={{
                    left: `calc(50% - 16px + ${joystickPosition.x * 32}px)`,
                    top: `calc(50% - 16px + ${joystickPosition.y * 32}px)`,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-gray-600 rounded-full" />
                </div>
              </div>
            ) : (
              // Portrait: D-pad style
              <div className="grid grid-cols-3 gap-1">
                <div />
                <Button
                  variant="ghost"
                  className="w-12 h-12 bg-gray-800 border border-gray-600 text-white hover:bg-gray-700"
                  onTouchStart={() => onJoystickMove({ x: 0, y: 1 })}
                  onTouchEnd={() => onJoystickMove({ x: 0, y: 0 })}
                  onMouseDown={() => onJoystickMove({ x: 0, y: 1 })}
                  onMouseUp={() => onJoystickMove({ x: 0, y: 0 })}
                >
                  ↑
                </Button>
                <div />

                <Button
                  variant="ghost"
                  className="w-12 h-12 bg-gray-800 border border-gray-600 text-white hover:bg-gray-700"
                  onTouchStart={() => onJoystickMove({ x: -1, y: 0 })}
                  onTouchEnd={() => onJoystickMove({ x: 0, y: 0 })}
                  onMouseDown={() => onJoystickMove({ x: -1, y: 0 })}
                  onMouseUp={() => onJoystickMove({ x: 0, y: 0 })}
                >
                  ←
                </Button>
                <div className="w-12 h-12 bg-gray-700 border border-gray-600 rounded" />
                <Button
                  variant="ghost"
                  className="w-12 h-12 bg-gray-800 border border-gray-600 text-white hover:bg-gray-700"
                  onTouchStart={() => onJoystickMove({ x: 1, y: 0 })}
                  onTouchEnd={() => onJoystickMove({ x: 0, y: 0 })}
                  onMouseDown={() => onJoystickMove({ x: 1, y: 0 })}
                  onMouseUp={() => onJoystickMove({ x: 0, y: 0 })}
                >
                  →
                </Button>

                <div />
                <Button
                  variant="ghost"
                  className="w-12 h-12 bg-gray-800 border border-gray-600 text-white hover:bg-gray-700"
                  onTouchStart={() => onJoystickMove({ x: 0, y: -1 })}
                  onTouchEnd={() => onJoystickMove({ x: 0, y: 0 })}
                  onMouseDown={() => onJoystickMove({ x: 0, y: -1 })}
                  onMouseUp={() => onJoystickMove({ x: 0, y: 0 })}
                >
                  ↓
                </Button>
                <div />
              </div>
            )}

            {isLandscape && <div className="text-gray-500 text-xs font-mono mt-1">ANALOG</div>}
          </div>

          {/* Action Buttons */}
          <div className={cn("flex flex-col items-center", isLandscape ? "mt-8" : "mr-4")}>
            <div className="text-gray-400 text-xs font-mono mb-2 tracking-wider">ACTIONS</div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                className="w-12 h-12 bg-gray-700 border border-gray-500 rounded-full text-white font-bold hover:bg-gray-600"
                onTouchStart={() => handleActionDown("Y")}
                onTouchEnd={() => handleActionUp("Y")}
                onMouseDown={() => handleActionDown("Y")}
                onMouseUp={() => handleActionUp("Y")}
              >
                Y
              </Button>
              <Button
                variant="ghost"
                className="w-12 h-12 bg-gray-700 border border-gray-500 rounded-full text-white font-bold hover:bg-gray-600"
                onTouchStart={() => handleActionDown("X")}
                onTouchEnd={() => handleActionUp("X")}
                onMouseDown={() => handleActionDown("X")}
                onMouseUp={() => handleActionUp("X")}
              >
                X
              </Button>
              <Button
                variant="ghost"
                className="w-12 h-12 bg-gray-700 border border-gray-500 rounded-full text-white font-bold hover:bg-gray-600"
                onTouchStart={() => handleActionDown("B")}
                onTouchEnd={() => handleActionUp("B")}
                onMouseDown={() => handleActionDown("B")}
                onMouseUp={() => handleActionUp("B")}
              >
                B
              </Button>
              <Button
                variant="ghost"
                className="w-12 h-12 bg-gray-700 border border-gray-500 rounded-full text-white font-bold hover:bg-gray-600"
                onTouchStart={() => handleActionDown("A")}
                onTouchEnd={() => handleActionUp("A")}
                onMouseDown={() => handleActionDown("A")}
                onMouseUp={() => handleActionUp("A")}
              >
                A
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
