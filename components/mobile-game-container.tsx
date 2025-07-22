"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { gameInputHandler } from "@/utils/game-input-handler"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { Orbitron } from "next/font/google"
import type { GameInputState } from "@/types/game-input-state" // Declare or import GameInputState

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
})

interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
}

interface ActionButtonProps {
  label: string
  action: keyof GameInputState["actions"]
  className?: string
  title?: string
}

function ActionButton({ label, action, className, title }: ActionButtonProps) {
  const handleInteractionStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      gameInputHandler.handleActionPress(action, true)
    },
    [action],
  )

  const handleInteractionEnd = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      gameInputHandler.handleActionPress(action, false)
    },
    [action],
  )

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        className={cn(
          "w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-75",
          "touch-none select-none active:scale-95 active:brightness-125",
          "bg-gray-800/80 border-cyan-400/50 text-cyan-300 shadow-[0_0_8px_rgba(0,255,255,0.3)] backdrop-blur-sm",
          "hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-cyan-400/50",
          orbitron.className,
          className,
        )}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
        onTouchCancel={handleInteractionEnd}
        onMouseDown={handleInteractionStart}
        onMouseUp={handleInteractionEnd}
        onMouseLeave={handleInteractionEnd}
        style={{
          WebkitUserSelect: "none",
          userSelect: "none",
          WebkitTouchCallout: "none",
          WebkitTapHighlightColor: "transparent",
        }}
        data-action-button="true"
        data-action={action}
      >
        {label}
      </button>
      {title && <span className="text-xs text-cyan-400/80 font-semibold tracking-wider">{title}</span>}
    </div>
  )
}

export default function MobileGameContainer({ children, className }: MobileGameContainerProps) {
  const { isMobile, isPortrait } = useMobile()
  const [debugInfo, setDebugInfo] = useState<string>("")
  const debugEnabled = useRef(true)

  // References for the joystick elements
  const movementJoystickRef = useRef<HTMLDivElement>(null)
  const movementKnobRef = useRef<HTMLDivElement>(null)
  const aimingJoystickRef = useRef<HTMLDivElement>(null)
  const aimingKnobRef = useRef<HTMLDivElement>(null)

  // Track touch identifiers to handle multi-touch
  const touchIdentifiers = useRef<Record<string, number>>({
    movement: -1,
    aiming: -1,
  })

  // Simple debug logger
  const logDebug = (message: string) => {
    if (debugEnabled.current) {
      setDebugInfo((prev) => `${message}\n${prev.split("\n").slice(0, 5).join("\n")}`)
    }
  }

  // Handle joystick movement
  const handleJoystickMove = (
    type: "movement" | "aiming",
    joystickEl: HTMLDivElement | null,
    knobEl: HTMLDivElement | null,
    clientX: number,
    clientY: number,
    isActive: boolean,
  ) => {
    if (!joystickEl || !knobEl) return

    const rect = joystickEl.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Calculate the distance from center
    const deltaX = clientX - centerX
    const deltaY = clientY - centerY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const maxDistance = rect.width / 2 - knobEl.offsetWidth / 2

    // Normalize the distance (0 to 1)
    const normalizedDistance = Math.min(distance / maxDistance, 1)

    // Calculate the normalized position (-1 to 1)
    const normalizedX = deltaX / maxDistance
    const normalizedY = deltaY / maxDistance

    // Position the knob
    if (isActive) {
      // Constrain the knob within the joystick
      const angle = Math.atan2(deltaY, deltaX)
      const constrainedDistance = Math.min(distance, maxDistance)
      const knobX = Math.cos(angle) * constrainedDistance
      const knobY = Math.sin(angle) * constrainedDistance

      knobEl.style.transform = `translate(${knobX}px, ${knobY}px)`
    } else {
      // Reset the knob position
      knobEl.style.transform = "translate(0px, 0px)"
    }

    // Update the input state based on joystick type
    if (type === "movement") {
      gameInputHandler.processMovementJoystick(normalizedX, normalizedY, isActive)
    } else {
      gameInputHandler.processAimingJoystick(normalizedX, normalizedY, isActive)

      // Debug aiming
      if (isActive) {
        const angle = Math.atan2(normalizedY, normalizedX) * (180 / Math.PI)
        logDebug(`Aim: ${angle.toFixed(0)}° Power: ${normalizedDistance.toFixed(2)}`)
      }
    }
  }

  // Handle touch events
  useEffect(() => {
    if (!isMobile) return

    const handleTouchStart = (e: TouchEvent) => {
      // Prevent default to avoid scrolling
      e.preventDefault()

      // Process each touch
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]
        const { clientX, clientY, identifier } = touch

        // Check if touch is in movement joystick area
        if (movementJoystickRef.current && touchIdentifiers.current.movement === -1) {
          const rect = movementJoystickRef.current.getBoundingClientRect()
          if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
            touchIdentifiers.current.movement = identifier
            handleJoystickMove("movement", movementJoystickRef.current, movementKnobRef.current, clientX, clientY, true)
            continue
          }
        }

        // Check if touch is in aiming joystick area
        if (aimingJoystickRef.current && touchIdentifiers.current.aiming === -1) {
          const rect = aimingJoystickRef.current.getBoundingClientRect()
          if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
            touchIdentifiers.current.aiming = identifier
            handleJoystickMove("aiming", aimingJoystickRef.current, aimingKnobRef.current, clientX, clientY, true)
            continue
          }
        }

        // Check if touch is on action buttons
        const actionButtons = document.querySelectorAll('[data-action-button="true"]')
        actionButtons.forEach((button) => {
          const rect = button.getBoundingClientRect()
          if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
            const action = button.getAttribute("data-action")
            if (action) {
              gameInputHandler.setActionButton(action as any, true)
            }
          }
        })
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()

      // Process each touch
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]
        const { clientX, clientY, identifier } = touch

        // Update movement joystick
        if (identifier === touchIdentifiers.current.movement) {
          handleJoystickMove("movement", movementJoystickRef.current, movementKnobRef.current, clientX, clientY, true)
        }

        // Update aiming joystick
        if (identifier === touchIdentifiers.current.aiming) {
          handleJoystickMove("aiming", aimingJoystickRef.current, aimingKnobRef.current, clientX, clientY, true)
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()

      // Process each touch
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]
        const { identifier } = touch

        // Reset movement joystick
        if (identifier === touchIdentifiers.current.movement) {
          touchIdentifiers.current.movement = -1
          handleJoystickMove("movement", movementJoystickRef.current, movementKnobRef.current, 0, 0, false)
        }

        // Reset aiming joystick
        if (identifier === touchIdentifiers.current.aiming) {
          touchIdentifiers.current.aiming = -1
          handleJoystickMove("aiming", aimingJoystickRef.current, aimingKnobRef.current, 0, 0, false)
        }

        // Reset action buttons
        const actionButtons = document.querySelectorAll('[data-action-button="true"]')
        actionButtons.forEach((button) => {
          const action = button.getAttribute("data-action")
          if (action) {
            gameInputHandler.setActionButton(action as any, false)
          }
        })
      }
    }

    // Add event listeners
    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    })
    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd, { passive: false })

    // Clean up
    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isMobile])

  // If not mobile, just render the children
  if (!isMobile) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Game content */}
      <div className="w-full h-full">{children}</div>

      {/* Mobile controls overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Movement joystick (left side) */}
        <div
          ref={movementJoystickRef}
          className="absolute bottom-8 left-8 w-32 h-32 rounded-full bg-black/20 border-2 border-white/30 pointer-events-auto"
        >
          <div
            ref={movementKnobRef}
            className="absolute top-1/2 left-1/2 w-16 h-16 -mt-8 -ml-8 rounded-full bg-white/30 border-2 border-white/50"
          />
        </div>

        {/* Action buttons (right side in landscape, bottom in portrait) */}
        <div
          className={cn(
            "absolute flex gap-2",
            isPortrait
              ? "bottom-8 right-8 flex-col" // Vertical in portrait
              : "bottom-8 right-8 flex-row", // Horizontal in landscape
          )}
        >
          {/* X Button */}
          <ActionButton label="X" action="dash" title="Dash" />

          {/* Y Button */}
          <ActionButton label="Y" action="special" title="Special" />

          {/* B Button */}
          <ActionButton label="B" action="explosiveArrow" title="Explode" />
        </div>

        {/* Aiming joystick (right side) */}
        <div
          ref={aimingJoystickRef}
          className={cn(
            "absolute w-32 h-32 rounded-full bg-black/20 border-2 border-white/30 pointer-events-auto",
            isPortrait
              ? "bottom-44 right-8" // Position above action buttons in portrait
              : "top-8 right-8", // Position at top-right in landscape
          )}
        >
          <div
            ref={aimingKnobRef}
            className="absolute top-1/2 left-1/2 w-16 h-16 -mt-8 -ml-8 rounded-full bg-white/30 border-2 border-white/50"
          />
        </div>

        {/* Debug info */}
        {debugEnabled.current && (
          <div className="absolute top-2 left-2 bg-black/50 text-white p-2 text-xs max-w-[200px] whitespace-pre-wrap">
            {debugInfo}
          </div>
        )}
      </div>
    </div>
  )
}
