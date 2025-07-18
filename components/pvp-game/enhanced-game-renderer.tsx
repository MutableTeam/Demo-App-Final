"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { usePlatform } from "@/hooks/use-platform"
import MobileGameContainer from "@/components/mobile-game-container"

interface EnhancedGameRendererProps {
  CANVAS_WIDTH: number
  CANVAS_HEIGHT: number
  className?: string
  onTouchControl?: (action: string, pressed: boolean) => void
  gameLoop: (canvas: HTMLCanvasElement) => void
}

const EnhancedGameRenderer: React.FC<EnhancedGameRendererProps> = ({
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  className,
  onTouchControl,
  gameLoop,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const platformType = usePlatform()

  useEffect(() => {
    if (canvasRef.current) {
      gameLoop(canvasRef.current)
    }
  }, [gameLoop])

  if (platformType === "mobile") {
    return (
      <MobileGameContainer
        onJoystickMove={(direction) => {
          if (onTouchControl) {
            onTouchControl("up", direction.y < -0.3)
            onTouchControl("down", direction.y > 0.3)
            onTouchControl("left", direction.x < -0.3)
            onTouchControl("right", direction.x > 0.3)
          }
        }}
        onActionPress={(action, pressed) => {
          if (onTouchControl) {
            onTouchControl(action as any, pressed)
          }
        }}
        className={className}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full object-contain bg-slate-900"
          style={{
            imageRendering: "pixelated",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        />
      </MobileGameContainer>
    )
  }

  return (
    <div className={cn("relative w-full max-w-4xl mx-auto", className)}>
      {/* Existing desktop canvas and controls */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full border border-gray-600 rounded-lg bg-slate-900"
        style={{ imageRendering: "pixelated" }}
      />
      {/* Existing desktop touch controls if any */}
    </div>
  )
}

export default EnhancedGameRenderer
