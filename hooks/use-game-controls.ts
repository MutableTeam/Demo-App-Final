"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { gameInputHandler, setupGameInputHandlers, type GameInputState } from "@/utils/game-input-handler"
import type { PlatformType } from "@/contexts/platform-context"
import { logger } from "@/utils/logger"

interface UseGameControlsProps {
  playerId: string
  gameStateRef: React.MutableRefObject<any> // Using `any` for reusability
  platformType: PlatformType
  isEnabled: boolean
}

export function useGameControls({ playerId, gameStateRef, platformType, isEnabled }: UseGameControlsProps) {
  const componentIdRef = useRef(`use-game-controls-${Date.now()}`)
  const previousInputRef = useRef<GameInputState | null>(null)
  const drawStartTimeRef = useRef<number | null>(null)

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

        // --- Direct State Mapping for movement and action buttons ---
        player.controls.up = inputState.movement.up
        player.controls.down = inputState.movement.down
        player.controls.left = inputState.movement.left
        player.controls.right = inputState.movement.right
        player.controls.dash = inputState.actions.dash
        player.controls.special = inputState.actions.special
        player.controls.explosiveArrow = inputState.actions.explosiveArrow

        // --- Aiming & Charging Logic ---
        if (inputState.aiming.active) {
          // Joystick is being held down
          if (!player.isDrawingBow) {
            // First time pulling the joystick - start drawing the bow
            player.isDrawingBow = true
            player.drawStartTime = Date.now() / 1000
            drawStartTimeRef.current = player.drawStartTime
            logger.info("GAME_CONTROLS", `Charge started at ${player.drawStartTime}`)
          }

          // Update aim angle continuously without resetting the charge
          player.rotation = inputState.aiming.angle
        } else if (player.isDrawingBow && !inputState.aiming.active) {
          // Joystick was released after drawing - fire the arrow
          player.isDrawingBow = false
          player.controls.shoot = true
          drawStartTimeRef.current = null
          logger.info("GAME_CONTROLS", "Firing arrow on joystick release")
        }

        previousInputRef.current = JSON.parse(JSON.stringify(inputState))
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
