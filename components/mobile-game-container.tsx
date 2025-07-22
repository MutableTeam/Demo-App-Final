"use client"

import type React from "react"
import { useRef } from "react"
import { Joystick } from "react-joystick-component"
import { gameInputHandler } from "@/utils/game-input-handler"
import { usePlatform } from "@/contexts/platform-context"
import { cn } from "@/lib/utils"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"

interface MobileGameContainerProps {
  children: React.ReactNode
  gameId?: string
}

export default function MobileGameContainer({ children, gameId }: MobileGameContainerProps) {
  const { platform } = usePlatform()
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"
  const containerRef = useRef<HTMLDivElement>(null)

  // Only show mobile controls on mobile platform
  if (platform !== "mobile") {
    return <div className="w-full h-full">{children}</div>
  }

  const ActionButton = ({
    label,
    action,
    className = "",
  }: {
    label: string
    action: () => void
    className?: string
  }) => (
    <button
      onTouchStart={(e) => {
        e.preventDefault()
        action()
      }}
      onTouchEnd={(e) => {
        e.preventDefault()
      }}
      className={cn(
        "flex items-center justify-center rounded-full font-bold text-sm transition-all duration-75 select-none touch-manipulation",
        "active:scale-95 active:opacity-80",
        "w-12 h-12 md:w-14 md:h-14",
        isCyberpunk
          ? "bg-cyan-500/20 border-2 border-cyan-400/60 text-cyan-300 shadow-[0_0_10px_rgba(0,255,255,0.3)] active:shadow-[0_0_15px_rgba(0,255,255,0.5)]"
          : "bg-amber-400 border-2 border-amber-600 text-amber-900 shadow-lg active:shadow-xl",
        className,
      )}
    >
      {label}
    </button>
  )

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* Game Content */}
      <div className="absolute inset-0">{children}</div>

      {/* Mobile Controls Overlay */}
      <div className="absolute inset-0 pointer-events-none z-50">
        <div className="relative w-full h-full">
          {/* Portrait Layout */}
          <div className="portrait:flex portrait:flex-col portrait:h-full hidden">
            {/* Game Area - Top 60% */}
            <div className="flex-1 pointer-events-auto">{/* Game content is rendered here */}</div>

            {/* Controls Area - Bottom 40% */}
            <div className="h-[40%] bg-black/20 backdrop-blur-sm pointer-events-auto">
              <div className="flex items-center justify-between h-full px-4 py-2">
                {/* Left Side - Movement Joystick */}
                <div className="flex items-center justify-center">
                  <Joystick
                    size={80}
                    sticky={false}
                    baseColor={isCyberpunk ? "rgba(0, 255, 255, 0.2)" : "rgba(245, 158, 11, 0.3)"}
                    stickColor={isCyberpunk ? "rgba(0, 255, 255, 0.8)" : "rgba(245, 158, 11, 0.9)"}
                    move={(data) => gameInputHandler.handleMovementJoystick(data)}
                    stop={() => gameInputHandler.handleMovementJoystickStop()}
                  />
                </div>

                {/* Center - Action Buttons */}
                <div className="flex flex-col gap-2">
                  <ActionButton
                    label="⚡"
                    action={() => {
                      gameInputHandler.handleActionPress("special")
                      setTimeout(() => gameInputHandler.handleActionRelease("special"), 100)
                    }}
                  />
                  <ActionButton
                    label="🔄"
                    action={() => {
                      gameInputHandler.handleActionPress("reload")
                      setTimeout(() => gameInputHandler.handleActionRelease("reload"), 100)
                    }}
                  />
                </div>

                {/* Right Side - Aiming Joystick */}
                <div className="flex items-center justify-center">
                  <Joystick
                    size={80}
                    sticky={false}
                    baseColor={isCyberpunk ? "rgba(255, 0, 255, 0.2)" : "rgba(239, 68, 68, 0.3)"}
                    stickColor={isCyberpunk ? "rgba(255, 0, 255, 0.8)" : "rgba(239, 68, 68, 0.9)"}
                    start={() => gameInputHandler.handleAimingJoystickStart()}
                    move={(data) => gameInputHandler.handleAimingJoystick(data)}
                    stop={() => gameInputHandler.handleAimingJoystickStop()}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Landscape Layout */}
          <div className="landscape:flex landscape:h-full portrait:hidden">
            {/* Left Side - Movement Joystick */}
            <div className="w-32 flex items-center justify-center pointer-events-auto">
              <div className="flex flex-col items-center gap-4">
                <Joystick
                  size={100}
                  sticky={false}
                  baseColor={isCyberpunk ? "rgba(0, 255, 255, 0.2)" : "rgba(245, 158, 11, 0.3)"}
                  stickColor={isCyberpunk ? "rgba(0, 255, 255, 0.8)" : "rgba(245, 158, 11, 0.9)"}
                  move={(data) => gameInputHandler.handleMovementJoystick(data)}
                  stop={() => gameInputHandler.handleMovementJoystickStop()}
                />
                <div className="text-xs text-center font-mono opacity-70">
                  <div className={isCyberpunk ? "text-cyan-300" : "text-amber-700"}>MOVE</div>
                </div>
              </div>
            </div>

            {/* Center - Game Area */}
            <div className="flex-1 pointer-events-auto">{/* Game content is rendered here */}</div>

            {/* Right Side - Aiming Joystick & Actions */}
            <div className="w-32 flex items-center justify-center pointer-events-auto">
              <div className="flex flex-col items-center gap-4">
                <Joystick
                  size={100}
                  sticky={false}
                  baseColor={isCyberpunk ? "rgba(255, 0, 255, 0.2)" : "rgba(239, 68, 68, 0.3)"}
                  stickColor={isCyberpunk ? "rgba(255, 0, 255, 0.8)" : "rgba(239, 68, 68, 0.9)"}
                  start={() => gameInputHandler.handleAimingJoystickStart()}
                  move={(data) => gameInputHandler.handleAimingJoystick(data)}
                  stop={() => gameInputHandler.handleAimingJoystickStop()}
                />
                <div className="text-xs text-center font-mono opacity-70">
                  <div className={isCyberpunk ? "text-cyan-300" : "text-amber-700"}>AIM & SHOOT</div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 mt-4">
                  <ActionButton
                    label="⚡"
                    action={() => {
                      gameInputHandler.handleActionPress("special")
                      setTimeout(() => gameInputHandler.handleActionRelease("special"), 100)
                    }}
                    className="w-10 h-10"
                  />
                  <ActionButton
                    label="🔄"
                    action={() => {
                      gameInputHandler.handleActionPress("reload")
                      setTimeout(() => gameInputHandler.handleActionRelease("reload"), 100)
                    }}
                    className="w-10 h-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
