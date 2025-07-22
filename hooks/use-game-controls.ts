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

        // --- Map standard controls ---
        player.controls.up = inputState.movement.up
        player.controls.down = inputState.movement.down
        player.controls.left = inputState.movement.left
        player.controls.right = inputState.movement.right
        player.controls.dash = inputState.actions.dash
        player.controls.special = inputState.actions.special
        player.controls.explosiveArrow = inputState.actions.explosiveArrow

        // --- Map aiming and shooting logic ---
        player.rotation = inputState.aiming.angle
        player.controls.shoot = inputState.actions.shoot

        // Manage the `isDrawingBow` state carefully.
        // If the input handler says we are aiming, then we are drawing.
        if (inputState.aiming.active) {
          player.isDrawingBow = true
        }
        // If a shoot command is issued, it implies a release, but we must keep
        // `isDrawingBow` true for this frame so the engine can process the shot.
        // The game engine will be responsible for setting `isDrawingBow` to false after firing.
        // Only set `isDrawingBow` to false if we are explicitly not aiming AND not shooting.
        else if (!inputState.actions.shoot) {
          player.isDrawingBow = false
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
