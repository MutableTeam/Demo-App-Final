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

        // --- Aiming Logic ---
        if (inputState.aiming.active) {
          // Update aim angle continuously while the joystick is active
          player.rotation = inputState.aiming.angle
        }

        // --- Shooting Logic ---
        // Handle charging (button press)
        if (inputState.actions.shootCharging && !player.isDrawingBow) {
          player.isDrawingBow = true
          player.drawStartTime = Date.now() / 1000
          console.log(`[GAME_CONTROLS] Charge started at ${player.drawStartTime}`)
        }

        // Handle release (button up)
        if (inputState.actions.shoot && player.isDrawingBow) {
          player.controls.shoot = true
          console.log("[GAME_CONTROLS] Shoot command sent to game engine.")
        } else if (!inputState.actions.shootCharging && player.isDrawingBow && !player.controls.shoot) {
          // If the shoot button is released but we haven't fired yet, fire now
          player.controls.shoot = true
          console.log("[GAME_CONTROLS] Shoot command sent from button release.")
        } else if (!inputState.actions.shootCharging && !inputState.actions.shoot) {
          // Reset shooting state when neither charging nor shooting
          player.controls.shoot = false
          if (!player.isDrawingBow) {
            player.drawStartTime = null
          }
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
