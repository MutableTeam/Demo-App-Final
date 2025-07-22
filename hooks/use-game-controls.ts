"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { gameInputHandler, setupGameInputHandlers, type GameInputState } from "@/utils/game-input-handler"
import type { PlatformType } from "@/contexts/platform-context"
import { debugManager } from "@/utils/debug-manager"

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

        // Add debugging for shooting
        if (inputState.actions.shoot !== player.controls.shoot) {
          debugManager.logInfo("MOBILE_INPUT", `Shoot state changed: ${inputState.actions.shoot}`)
        }

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

        // Aiming from Joystick
        if (inputState.aiming.active) {
          if (!player.isDrawingBow) {
            player.isDrawingBow = true
            player.drawStartTime = Date.now() / 1000
            debugManager.logInfo("MOBILE_INPUT", "Started drawing bow")
          }
          // The angle from the joystick is already in radians, pointing away from the center.
          // We need to adjust it because the game engine expects rotation relative to the player's 'forward' direction.
          // The joystick gives an angle where 0 is right. We'll use this directly for player rotation.
          player.rotation = inputState.aiming.angle
        } else {
          // If aiming is not active, but the player was drawing, this signals a release.
          if (player.isDrawingBow) {
            player.isDrawingBow = false
            debugManager.logInfo("MOBILE_INPUT", "Stopped drawing bow")
          }
        }

        // Shooting from Joystick
        // The game engine will check for `player.controls.shoot` being true.
        player.controls.shoot = inputState.actions.shoot
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
