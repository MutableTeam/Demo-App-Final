"use client"

import type React from "react"
import { useEffect, useState, useMemo } from "react"
import { Joystick } from "react-joystick-component"
import { cn } from "@/lib/utils"
import type { IJoystickUpdateEvent } from "react-joystick-component/build/lib/Joystick"

interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
  onJoystickMove?: (direction: { x: number; y: number }) => void
  onActionPress?: (action: string, pressed: boolean) => void
}

interface ActionButtonProps {
  label: string
  action: string
  onPress: (action: string, pressed: boolean) => void
  className?: string
}

function ActionButton({ label, action, onPress, className }: ActionButtonProps) {
  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    onPress(action, true)
  }
  const handleEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    onPress(action, false)
  }

  return (
    <button
      className={cn(
        "w-16 h-16 rounded-full border-2 font-bold transition-all duration-150",
        "touch-none select-none active:scale-95 flex items-center justify-center",
        "bg-[#3a3a3a] border-[#2a2a2a] text-gray-300 active:bg-[#4a4a4a]",
        "shadow-[2px_2px_5px_rgba(0,0,0,0.5)] active:shadow-inner",
        className,
      )}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      {label}
    </button>
  )
}

function DirectionalPad({ onMove, onStop }: { onMove: (x: number, y: number) => void; onStop: () => void }) {
  const DPadButton = ({ x, y, children }: { x: number; y: number; children: React.ReactNode }) => {
    const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      onMove(x, y)
    }
    const handleEnd = (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      onStop()
    }
    return (
      <div
        className="w-12 h-12 bg-[#3a3a3a] border-2 border-[#2a2a2a] rounded-md flex items-center justify-center active:bg-[#4a4a4a] cursor-pointer"
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        {children}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-1 w-[156px] justify-items-center">
      <div />
      <DPadButton x={0} y={-1}>
        ▲
      </DPadButton>
      <div />
      <DPadButton x={-1} y={0}>
        ◀
      </DPadButton>
      <div className="w-12 h-12" />
      <DPadButton x={1} y={0}>
        ▶
      </DPadButton>
      <div />
      <DPadButton x={0} y={1}>
        ▼
      </DPadButton>
      <div />
    </div>
  )
}

function ControlLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-gray-400 font-mono tracking-widest select-none">{children}</div>
}

export default function MobileGameContainer({
  children,
  className,
  onJoystickMove = () => {},
  onActionPress = () => {},
}: MobileGameContainerProps) {
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      // Use a simple width > height check for orientation
      setIsLandscape(window.innerWidth > window.innerHeight)
    }
    checkOrientation()
    // Use ResizeObserver for more reliable updates on orientation change
    const resizeObserver = new ResizeObserver(checkOrientation)
    resizeObserver.observe(document.documentElement)
    return () => resizeObserver.disconnect()
  }, [])

  const handleJoystickMove = (event: IJoystickUpdateEvent) => {
    const normalizedX = event.x ? event.x / 50 : 0
    const normalizedY = event.y ? -event.y / 50 : 0 // Invert Y-axis for standard game coordinates
    onJoystickMove({ x: normalizedX, y: normalizedY })
  }

  const handleJoystickStop = () => {
    onJoystickMove({ x: 0, y: 0 })
  }

  const handleDPadMove = (x: number, y: number) => {
    onJoystickMove({ x, y })
  }

  const handleDPadStop = () => {
    onJoystickMove({ x: 0, y: 0 })
  }

  const actionButtons = useMemo(
    () => (
      <div className="flex flex-col items-center space-y-4">
        <ControlLabel>ACTIONS</ControlLabel>
        <div className="relative w-40 h-40">
          <ActionButton
            label="Y"
            action="actionY"
            onPress={onActionPress}
            className="absolute top-0 left-1/2 -translate-x-1/2"
          />
          <ActionButton
            label="X"
            action="actionX"
            onPress={onActionPress}
            className="absolute top-1/2 left-0 -translate-y-1/2"
          />
          <ActionButton
            label="A"
            action="actionA"
            onPress={onActionPress}
            className="absolute top-1/2 right-0 -translate-y-1/2"
          />
          <ActionButton
            label="B"
            action="actionB"
            onPress={onActionPress}
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
          />
        </div>
      </div>
    ),
    [onActionPress],
  )

  // Portrait Layout
  if (!isLandscape) {
    return (
      <div className={cn("w-full h-screen bg-[#121212] flex items-center justify-center p-2", className)}>
        <div className="w-full h-full max-w-md max-h-[800px] bg-[#212121] rounded-3xl p-4 flex flex-col shadow-2xl">
          {/* Game Screen Area */}
          <div className="flex-grow w-full bg-black rounded-lg border-2 border-gray-800/50 overflow-hidden flex items-center justify-center">
            <div className="w-full h-full">{children}</div>
          </div>

          {/* Control Panel Area */}
          <div className="h-[220px] flex items-center justify-between px-4 pt-4">
            {/* Left Controls */}
            <div className="flex flex-col items-center space-y-2">
              <DirectionalPad onMove={handleDPadMove} onStop={handleDPadStop} />
              <ControlLabel>MOVE</ControlLabel>
            </div>

            {/* Right Controls */}
            {actionButtons}
          </div>
        </div>
      </div>
    )
  }

  // Landscape Layout
  return (
    <div className={cn("w-full h-screen bg-[#121212] flex items-center justify-center p-2", className)}>
      <div className="w-full h-full max-h-[480px] max-w-[900px] bg-[#212121] rounded-3xl p-4 flex items-center shadow-2xl">
        {/* Left Controls */}
        <div className="w-[200px] flex flex-col items-center justify-center space-y-4">
          <ControlLabel>MOVEMENT</ControlLabel>
          <Joystick
            size={120}
            sticky={false}
            baseColor="#3a3a3a"
            stickColor="#2a2a2a"
            move={handleJoystickMove}
            stop={handleJoystickStop}
            throttle={50}
          />
          <ControlLabel>ANALOG</ControlLabel>
        </div>

        {/* Game Screen Area */}
        <div className="flex-1 h-full bg-black rounded-lg border-2 border-gray-800/50 overflow-hidden flex items-center justify-center">
          <div className="w-full h-full">{children}</div>
        </div>

        {/* Right Controls */}
        <div className="w-[200px] flex items-center justify-center">{actionButtons}</div>
      </div>
    </div>
  )
}
