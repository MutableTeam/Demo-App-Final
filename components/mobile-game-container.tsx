"use client"

import type React from "react"
import { Joystick } from "react-joystick-component"
import { cn } from "@/lib/utils"
import { useOrientation } from "@/hooks/use-orientation"
import { Zap, Shield, Wind } from "lucide-react"

interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
  onJoystickMove?: (direction: { x: number; y: number }) => void
  onActionPress?: (action: string, pressed: boolean) => void
}

interface ActionButtonProps {
  action: string
  onPress: (action: string, pressed: boolean) => void
  className?: string
  children: React.ReactNode
  variant?: "primary" | "secondary"
}

function ActionButton({ action, onPress, className, children, variant = "primary" }: ActionButtonProps) {
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
        "w-16 h-16 rounded-full border-2 font-bold text-sm transition-all duration-150",
        "touch-none select-none active:scale-95 active:brightness-125",
        "flex items-center justify-center",
        "shadow-[0_0_15px_rgba(0,255,255,0.3)]",
        variant === "primary"
          ? "bg-cyan-500/20 border-cyan-400/70 text-cyan-300"
          : "bg-purple-500/20 border-purple-400/70 text-purple-300",
        className,
      )}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      {children}
    </button>
  )
}

const PortraitControls = ({
  onJoystickMove,
  onActionPress,
}: {
  onJoystickMove: (direction: { x: number; y: number }) => void
  onActionPress: (action: string, pressed: boolean) => void
}) => (
  <>
    {/* Left Side: Joystick */}
    <div className="flex-1 flex items-center justify-center">
      <div className="relative">
        <Joystick
          size={120}
          sticky={false}
          baseColor="rgba(30, 41, 59, 0.8)"
          stickColor="rgba(0, 255, 255, 0.9)"
          move={(e) => onJoystickMove({ x: e.x / 50, y: -e.y / 50 })}
          stop={() => onJoystickMove({ x: 0, y: 0 })}
          throttle={20}
        />
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-cyan-300/70">Move</div>
      </div>
    </div>

    {/* Right Side: Action Buttons */}
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col gap-3">
        <ActionButton action="shoot" onPress={onActionPress} variant="primary">
          <Zap size={24} />
        </ActionButton>
        <ActionButton action="dash" onPress={onActionPress} variant="secondary">
          <Wind size={24} />
        </ActionButton>
        <ActionButton action="special" onPress={onActionPress} variant="primary">
          <Shield size={24} />
        </ActionButton>
      </div>
    </div>
  </>
)

export default function MobileGameContainer({
  children,
  className,
  onJoystickMove = () => {},
  onActionPress = () => {},
}: MobileGameContainerProps) {
  const orientation = useOrientation()

  if (orientation === "landscape") {
    // Horizontal Layout: [Joystick | Game | Action Buttons]
    return (
      <div className={cn("w-full h-screen bg-black flex flex-row overflow-hidden", className)}>
        {/* Left Controls - Joystick */}
        <div className="w-[20vw] min-w-[140px] h-full flex items-center justify-center bg-slate-900/80 backdrop-blur-sm border-r border-cyan-500/30">
          <div className="relative">
            <Joystick
              size={100}
              sticky={false}
              baseColor="rgba(30, 41, 59, 0.8)"
              stickColor="rgba(0, 255, 255, 0.9)"
              move={(e) => onJoystickMove({ x: e.x / 50, y: -e.y / 50 })}
              stop={() => onJoystickMove({ x: 0, y: 0 })}
              throttle={20}
            />
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-cyan-300/70">Move</div>
          </div>
        </div>

        {/* Game Area - Takes remaining space */}
        <div className="flex-1 h-full relative overflow-hidden">{children}</div>

        {/* Right Controls - Action Buttons */}
        <div className="w-[20vw] min-w-[140px] h-full flex items-center justify-center bg-slate-900/80 backdrop-blur-sm border-l border-cyan-500/30">
          <div className="flex flex-col gap-4">
            <ActionButton action="shoot" onPress={onActionPress} variant="primary" className="w-14 h-14">
              <Zap size={20} />
            </ActionButton>
            <ActionButton action="dash" onPress={onActionPress} variant="secondary" className="w-14 h-14">
              <Wind size={20} />
            </ActionButton>
            <ActionButton action="special" onPress={onActionPress} variant="primary" className="w-14 h-14">
              <Shield size={20} />
            </ActionButton>
          </div>
        </div>
      </div>
    )
  }

  // Portrait Layout: [Game / Controls]
  return (
    <div className={cn("w-full h-screen bg-black flex flex-col overflow-hidden", className)}>
      {/* Game Area - Takes most of the screen */}
      <div className="w-full flex-1 relative overflow-hidden">{children}</div>

      {/* Controls Area - Fixed height at bottom */}
      <div className="w-full h-[200px] bg-slate-900/80 backdrop-blur-sm flex flex-row p-4 border-t border-cyan-500/30">
        <PortraitControls onJoystickMove={onJoystickMove} onActionPress={onActionPress} />
      </div>
    </div>
  )
}
