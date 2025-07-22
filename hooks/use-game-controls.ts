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

        // Aiming from Joystick - simulate mouse behavior
        if (inputState.aiming.active) {
          if (!player.isDrawingBow) {
            // Start drawing bow (like mouse down)
            player.isDrawingBow = true
            player.drawStartTime = Date.now() / 1000
            console.log("[GAME_CONTROLS] Started drawing bow (mouse down simulation)")
          }
          // Set player rotation based on joystick direction
          player.rotation = inputState.aiming.angle
        } else {
          if (player.isDrawingBow) {
            // Stop drawing bow but don't fire here - that's handled by shoot action
            player.isDrawingBow = false
            console.log("[GAME_CONTROLS] Stopped drawing bow")
          }
        }

        // Shooting from Joystick - this is the "mouse up" event
        if (inputState.actions.shoot) {
          console.log("[GAME_CONTROLS] Shoot command received (mouse up simulation).")
          player.controls.shoot = true
        } else {
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
