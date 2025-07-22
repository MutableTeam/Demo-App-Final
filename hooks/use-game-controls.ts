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

        // --- Direct State Mapping for other actions ---
        player.controls.up = inputState.movement.up
        player.controls.down = inputState.movement.down
        player.controls.left = inputState.movement.left
        player.controls.right = inputState.movement.right
        player.controls.dash = inputState.actions.dash
        player.controls.special = inputState.actions.special
        player.controls.explosiveArrow = inputState.actions.explosiveArrow

        // --- Aiming & Charging Logic ---
        if (inputState.aiming.active) {
          // Joystick is being held down.
          if (!player.isDrawingBow) {
            // This is the first frame of the draw. Set start time.
            player.isDrawingBow = true
            player.drawStartTime = Date.now() / 1000
            console.log(`[GAME_CONTROLS] Charge started at ${player.drawStartTime}`)
          }
          // Update aim angle continuously. This will NOT reset the charge.
          // The player's rotation is set to the joystick's angle for aiming.
          player.rotation = inputState.aiming.angle
        }
        // Note: There is no 'else' block. The game engine is responsible for setting
        // player.isDrawingBow to false after a shot is fired, ensuring the charge
        // time is correctly calculated.

        // --- Shooting Logic (on release) ---
        // The game engine will see this 'shoot' flag and fire the arrow.
        player.controls.shoot = inputState.actions.shoot
        if (player.controls.shoot) {
          console.log("[GAME_CONTROLS] Shoot command sent to game engine.")
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
