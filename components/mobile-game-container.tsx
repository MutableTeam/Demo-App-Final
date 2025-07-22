"use client"

import type React from "react"
import { Joystick } from "react-joystick-component"
import { gameInputHandler } from "@/utils/game-input-handler"
import { Button } from "@/components/ui/button"
import { Zap, ChevronsRight } from "lucide-react"

interface MobileGameContainerProps {
  children: React.ReactNode
}

export function MobileGameContainer({ children }: MobileGameContainerProps) {
  return (
    <div className="relative w-full h-full flex flex-col bg-black">
      <div className="flex-grow w-full h-full">{children}</div>

      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end pointer-events-none">
        {/* Left Joystick for Movement */}
        <div className="pointer-events-auto">
          <Joystick
            size={100}
            baseColor="rgba(255, 255, 255, 0.2)"
            stickColor="rgba(255, 255, 255, 0.5)"
            move={(e) => gameInputHandler.handleMovementJoystick(e)}
            stop={(e) => gameInputHandler.handleMovementJoystick(e)}
          />
        </div>

        {/* Action Buttons and Right Joystick */}
        <div className="flex items-end gap-16">
          {/* Action Buttons */}
          <div className="flex flex-col gap-4 pointer-events-auto">
            <Button
              variant="outline"
              size="icon"
              className="w-16 h-16 rounded-full bg-cyan-500/20 border-cyan-400 text-cyan-400 backdrop-blur-sm"
              onPointerDown={() => gameInputHandler.setAction("special", true)}
              onPointerUp={() => gameInputHandler.setAction("special", false)}
            >
              <Zap size={32} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="w-16 h-16 rounded-full bg-rose-500/20 border-rose-400 text-rose-400 backdrop-blur-sm"
              onPointerDown={() => gameInputHandler.setAction("dash", true)}
              onPointerUp={() => gameInputHandler.setAction("dash", false)}
            >
              <ChevronsRight size={32} />
            </Button>
          </div>

          {/* Right Joystick for Aiming/Shooting */}
          <div className="pointer-events-auto">
            <Joystick
              size={100}
              baseColor="rgba(255, 255, 255, 0.2)"
              stickColor="rgba(255, 255, 255, 0.5)"
              move={(e) => gameInputHandler.handleAimingJoystick(e)}
              stop={(e) => gameInputHandler.handleAimingJoystick(e)}
              start={(e) => gameInputHandler.handleAimingJoystick(e)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
