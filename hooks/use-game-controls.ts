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
        // This is the core of the fix. It ensures mobile inputs directly
        // modify the same `player.controls` object as the desktop handlers.

        // Movement
        player.controls.up = inputState.movement.up
        player.controls.down = inputState.movement.down
        player.controls.left = inputState.movement.left
        player.controls.right = inputState.movement.right

        // Actions
        player.controls.dash = inputState.actions.dash
        player.controls.special = inputState.actions.special
        player.controls.explosiveArrow = inputState.actions.explosiveArrow

        // Aiming
        // The game engine is responsible for the logic of what happens when these states change.
        if (inputState.aiming.active) {
          if (!player.isDrawingBow) {
            // The input system signals the *intent* to start drawing.
            player.isDrawingBow = true
            player.drawStartTime = Date.now() / 1000
          }
          player.rotation = inputState.aiming.angle
        } else {
          // If aiming is not active, but the player was drawing, this signals a release.
          // The game engine will see this change and fire an arrow.
          if (player.isDrawingBow) {
            player.isDrawingBow = false
          }
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
