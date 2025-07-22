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
            console.log("[GAME_CONTROLS] Started drawing bow")
          }
          // Set player rotation to the OPPOSITE of the joystick direction for firing
          player.rotation = inputState.aiming.angle + Math.PI
        } else {
          if (player.isDrawingBow) {
            player.isDrawingBow = false
            console.log("[GAME_CONTROLS] Stopped drawing bow")
          }
        }

        // Shooting from Joystick
        player.controls.shoot = inputState.actions.shoot
        if (player.controls.shoot) {
          console.log("[GAME_CONTROLS] Shoot command received by player object.")
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
