"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { gameInputHandler, setupGameInputHandlers, type GameInputState } from "@/utils/game-input-handler"
import type { PlatformType } from "@/contexts/platform-context"

interface UseGameControlsProps {
  playerId: string
  gameStateRef: React.MutableRefObject<any> // Using `any` for reusability across different game state types
  platformType: PlatformType
  isEnabled: boolean
}

/**
 * A plug-and-play hook to handle game controls for both desktop and mobile.
 * It abstracts away the input source and directly manipulates the player's
 * control state within the provided gameStateRef.
 *
 * @param {UseGameControlsProps} props - The properties for the hook.
 * @param {string} props.playerId - The ID of the player to control.
 * @param {React.MutableRefObject<any>} props.gameStateRef - A ref to the current game state.
 * @param {PlatformType} props.platformType - The current platform ('desktop' or 'mobile').
 * @param {boolean} props.isEnabled - A flag to enable or disable the controls.
 */
export function useGameControls({ playerId, gameStateRef, platformType, isEnabled }: UseGameControlsProps) {
  const componentIdRef = useRef(`use-game-controls-${Date.now()}`)

  useEffect(() => {
    if (!isEnabled) return

    let cleanup: () => void = () => {}

    if (platformType === "desktop") {
      // For desktop, use the existing keyboard and mouse handler setup.
      cleanup = setupGameInputHandlers({
        playerId,
        gameStateRef,
        componentIdRef,
      })
    } else {
      // For mobile, subscribe to the global gameInputHandler.
      const handleMobileInput = (inputState: GameInputState) => {
        const player = gameStateRef.current?.players?.[playerId]
        if (!player) return

        // --- Direct State Mapping ---
        // Movement
        player.controls.up = inputState.movement.up
        player.controls.down = inputState.movement.down
        player.controls.left = inputState.movement.left
        player.controls.right = inputState.movement.right

        // Actions
        player.controls.dash = inputState.actions.dash
        player.controls.special = inputState.actions.special
        player.controls.explosiveArrow = inputState.actions.explosiveArrow

        // Aiming & Shooting
        if (inputState.aiming.active) {
          // Player is actively aiming with the joystick
          player.controls.shoot = true // Indicates aiming/charging
          // Convert degrees from joystick to radians for game engine
          player.rotation = inputState.aiming.angle * (Math.PI / 180)
          // You could also use inputState.aiming.power to influence shot strength
        } else {
          // Player has released the aiming joystick
          player.controls.shoot = false
        }
      }

      // Subscribe to the input handler's state changes.
      gameInputHandler.setCallbacks({
        onStateChange: handleMobileInput,
      })

      // The cleanup function will destroy the input handler's callbacks.
      cleanup = () => gameInputHandler.destroy()
    }

    return () => {
      cleanup()
    }
  }, [platformType, playerId, gameStateRef, isEnabled])
}
