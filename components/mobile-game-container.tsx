"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

// --- Helper Components for Controls ---

// ActionButton: A single pressable button for actions like Y, X, B, A.
interface ActionButtonProps {
  label: string
  onPress: (pressed: boolean) => void
  className?: string
  style?: React.CSSProperties
}

const ActionButton = ({ label, onPress, className, style }: ActionButtonProps) => {
  const handlePress = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    onPress(true)
  }
  const handleRelease = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    onPress(false)
  }

  return (
    <div
      className={cn(
        "w-16 h-16 rounded-full bg-[#3a3a3a] border-2 border-[#2a2a2a] flex items-center justify-center select-none touch-none transition-all duration-100 active:bg-[#4a4a4a] active:scale-95",
        className,
      )}
      style={style}
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      onMouseLeave={handleRelease}
      onTouchStart={handlePress}
      onTouchEnd={handleRelease}
    >
      <span className="font-mono text-xl text-gray-300 font-bold">{label}</span>
    </div>
  )
}

// DPad: Directional pad for portrait mode.
interface DPadProps {
  onMove: (direction: { x: number; y: number }) => void
}

const DPad = ({ onMove }: DPadProps) => {
  const DPadButton = ({
    direction,
    className,
  }: { direction: "up" | "down" | "left" | "right"; className?: string }) => {
    const vectors = {
      up: { x: 0, y: 1 },
      down: { x: 0, y: -1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    }
    return (
      <div
        className={cn(
          "w-12 h-12 bg-[#3a3a3a] border-2 border-[#2a2a2a] rounded-md transition-all active:bg-[#4a4a4a]",
          className,
        )}
        onMouseDown={() => onMove(vectors[direction])}
        onMouseUp={() => onMove({ x: 0, y: 0 })}
        onMouseLeave={() => onMove({ x: 0, y: 0 })}
        onTouchStart={() => onMove(vectors[direction])}
        onTouchEnd={() => onMove({ x: 0, y: 0 })}
      />
    )
  }

  return (
    <div className="grid grid-cols-3 grid-rows-3 w-[156px] h-[156px] gap-1">
      <div />
      <DPadButton direction="up" className="col-start-2" />
      <div />
      <DPadButton direction="left" className="row-start-2" />
      <div className="w-12 h-12" />
      <DPadButton direction="right" className="row-start-2 col-start-3" />
      <div />
      <DPadButton direction="down" className="row-start-3 col-start-2" />
      <div />
    </div>
  )
}

// Joystick: Analog-style joystick for landscape mode.
interface JoystickProps {
  onMove: (direction: { x: number; y: number }) => void
  size?: number
}

const Joystick = ({ onMove, size = 120 }: JoystickProps) => {
  const baseRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleInteractionStart = useCallback(() => setIsDragging(true), [])
  const handleInteractionEnd = useCallback(() => {
    setIsDragging(false)
    setPosition({ x: 0, y: 0 })
    onMove({ x: 0, y: 0 })
  }, [onMove])

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging || !baseRef.current) return
      const rect = baseRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaX = clientX - centerX
      const deltaY = clientY - centerY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const maxDistance = size / 2 - 20 // 20 is stick radius

      let x = deltaX
      let y = deltaY

      if (distance > maxDistance) {
        const angle = Math.atan2(deltaY, deltaX)
        x = Math.cos(angle) * maxDistance
        y = Math.sin(angle) * maxDistance
      }

      setPosition({ x, y })
      onMove({
        x: Number.parseFloat((x / maxDistance).toFixed(2)),
        y: Number.parseFloat((-y / maxDistance).toFixed(2)), // Invert Y for standard game coords
      })
    },
    [isDragging, onMove, size],
  )

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY)

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove)
      window.addEventListener("mouseup", handleInteractionEnd)
      window.addEventListener("touchmove", onTouchMove)
      window.addEventListener("touchend", handleInteractionEnd)
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", handleInteractionEnd)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", handleInteractionEnd)
    }
  }, [isDragging, handleMove, handleInteractionEnd])

  return (
    <div
      ref={baseRef}
      className="relative rounded-full bg-[#2a2a2a] flex items-center justify-center"
      style={{ width: size, height: size }}
      onMouseDown={handleInteractionStart}
      onTouchStart={handleInteractionStart}
    >
      <div
        className="absolute w-16 h-16 rounded-full bg-[#3a3a3a] border-2 border-[#202020] transition-transform duration-75"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      />
    </div>
  )
}

// --- Main MobileGameContainer Component ---

interface MobileGameContainerProps {
  children: React.ReactNode
  onMove?: (direction: { x: number; y: number }) => void
  onAction?: (action: string, pressed: boolean) => void
}

export default function MobileGameContainer({
  children,
  onMove = () => {},
  onAction = () => {},
}: MobileGameContainerProps) {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerWidth > window.innerHeight ? "landscape" : "portrait")
    }
    checkOrientation()
    window.addEventListener("resize", checkOrientation)
    return () => window.removeEventListener("resize", checkOrientation)
  }, [])

  const handleAction = (action: string, pressed: boolean) => {
    onAction(action, pressed)
  }

  const renderPortraitLayout = () => (
    <div className="w-full h-full bg-[#1e1e1e] flex items-center justify-center p-4">
      <div className="w-full max-w-sm h-full max-h-[800px] bg-[#2d2d2d] rounded-3xl p-4 flex flex-col border-4 border-[#252525] shadow-2xl">
        {/* Screen Area */}
        <div className="flex-1 bg-black rounded-lg flex items-center justify-center border-2 border-black mb-4">
          <div className="w-[400px] h-[300px]">{children}</div>
        </div>
        {/* Controls Area */}
        <div className="h-[220px] flex justify-between items-center px-2">
          {/* Left Controls */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#3a3a3a] border-2 border-[#2a2a2a]" />
            <DPad onMove={onMove} />
            <span className="font-mono text-sm text-gray-400">MOVE</span>
          </div>
          {/* Right Controls */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative w-40 h-40">
              <ActionButton
                label="Y"
                onPress={(p) => handleAction("Y", p)}
                className="absolute top-0 left-1/2 -translate-x-1/2"
              />
              <ActionButton
                label="X"
                onPress={(p) => handleAction("X", p)}
                className="absolute top-1/2 right-0 -translate-y-1/2"
              />
              <ActionButton
                label="B"
                onPress={(p) => handleAction("B", p)}
                className="absolute bottom-0 left-1/2 -translate-x-1/2"
              />
              <ActionButton
                label="A"
                onPress={(p) => handleAction("A", p)}
                className="absolute top-1/2 left-0 -translate-y-1/2"
              />
            </div>
            <span className="font-mono text-sm text-gray-400">ACTIONS</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderLandscapeLayout = () => (
    <div className="w-full h-full bg-[#1e1e1e] flex items-center justify-center p-4">
      <div className="w-full max-w-[900px] h-full max-h-[500px] bg-[#2d2d2d] rounded-3xl p-4 flex items-center border-4 border-[#252525] shadow-2xl">
        {/* Left Controls */}
        <div className="w-[200px] h-full flex flex-col items-center justify-center space-y-2">
          <span className="font-mono text-sm text-gray-400">MOVEMENT</span>
          <Joystick onMove={onMove} />
          <span className="font-mono text-sm text-gray-400">ANALOG</span>
        </div>
        {/* Screen Area */}
        <div className="flex-1 h-full bg-black rounded-lg flex items-center justify-center border-2 border-black">
          <div className="w-full h-full max-w-[500px] max-h-[300px]">{children}</div>
        </div>
        {/* Right Controls */}
        <div className="w-[200px] h-full flex flex-col items-center justify-center space-y-2">
          <span className="font-mono text-sm text-gray-400">ACTIONS</span>
          <div className="relative w-40 h-40">
            <ActionButton
              label="Y"
              onPress={(p) => handleAction("Y", p)}
              className="absolute top-0 left-1/2 -translate-x-1/2"
            />
            <ActionButton
              label="X"
              onPress={(p) => handleAction("X", p)}
              className="absolute top-1/2 right-0 -translate-y-1/2"
            />
            <ActionButton
              label="B"
              onPress={(p) => handleAction("B", p)}
              className="absolute bottom-0 left-1/2 -translate-x-1/2"
            />
            <ActionButton
              label="A"
              onPress={(p) => handleAction("A", p)}
              className="absolute top-1/2 left-0 -translate-y-1/2"
            />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-screen h-screen overflow-hidden">
      {orientation === "portrait" ? renderPortraitLayout() : renderLandscapeLayout()}
    </div>
  )
}
