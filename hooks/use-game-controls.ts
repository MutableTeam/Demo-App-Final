"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { gameInputHandler, setupGameInputHandlers, type GameInputState } from "@/utils/game-input-handler"
import type { PlatformType } from "@/contexts/platform-context"

interface UseGameControlsProps {
  playerId: string
  gameStateRef: React.MutableRefObject<any> // Using `any` for reusability
  platformType: PlatformType
  isEnabled: boolean
}

export function useGameControls({ playerId, gameStateRef, platformType, isEnabled }: UseGameControlsProps) {
  const componentIdRef = useRef(`use-game-controls-${Date.now()}`)

  useEffect(() => {
    if (!isEnabled) return

    let cleanup: () => void = () => {}

    if (platformType === "desktop") {
      cleanup = setupGameInputHandlers({
        playerId,
        gameStateRef,
        componentIdRef,
      })
    } else {
      const handleMobileInput = (inputState: GameInputState) => {
        const player = gameStateRef.current?.players?.[playerId]
        if (!player) return

        // --- Direct State Mapping for movement and actions ---
        player.controls.up = inputState.movement.up
        player.controls.down = inputState.movement.down
        player.controls.left = inputState.movement.left
        player.controls.right = inputState.movement.right
        player.controls.dash = inputState.actions.dash
        player.controls.special = inputState.actions.special
        player.controls.explosiveArrow = inputState.actions.explosiveArrow

        // --- Aiming & Charging Logic ---
        if (inputState.aiming.active) {
          // Joystick is being held down for aiming
          if (!player.isDrawingBow) {
            // This is the first frame of the draw. Set start time.
            player.isDrawingBow = true
            player.drawStartTime = Date.now() / 1000
            console.log(`[GAME_CONTROLS] Charge started at ${player.drawStartTime}`)
          }

          // Update aim angle continuously while drawing the bow
          player.rotation = inputState.aiming.angle
        } else if (player.isDrawingBow && !inputState.actions.shoot) {
          // If we were drawing the bow but not anymore, and we're not shooting,
          // reset the bow state (this handles cases where the joystick returns to center)
          player.isDrawingBow = false
          player.drawStartTime = null
        }

        // --- Shooting Logic (on release) ---
        // Only set shoot to true when the input handler sends a shoot action
        if (inputState.actions.shoot && !player.controls.shoot) {
          player.controls.shoot = true
          console.log("[GAME_CONTROLS] Shoot command sent to game engine.")
        } else if (!inputState.actions.shoot && player.controls.shoot) {
          // Reset the shoot control when the input handler resets it
          player.controls.shoot = false
        }
      }

      gameInputHandler.setCallbacks({
        onStateChange: handleMobileInput,
      })

      cleanup = () => gameInputHandler.destroy()
    }

    return () => {
      cleanup()
    }
  }, [platformType, playerId, gameStateRef, isEnabled])
}
