"use client"

import type React from "react"

import { useEffect, useRef, useCallback } from "react"
import { gameInputHandler, type GameInputState } from "@/utils/game-input-handler"
import { usePlatform } from "@/contexts/platform-context"
import { setupGameInputHandlers } from "@/utils/game-input-handler"

interface UseGameControlsOptions {
  playerId: string
  gameStateRef: React.MutableRefObject<any>
  onControlsUpdate?: (controls: any) => void
}

export function useGameControls({ playerId, gameStateRef, onControlsUpdate }: UseGameControlsOptions) {
  const { platform } = usePlatform()
  const componentIdRef = useRef(`game-controls-${Date.now()}`)
  const isMobile = platform === "mobile"

  // Handle mobile input state changes
  const handleMobileInputChange = useCallback(
    (inputState: GameInputState) => {
      const player = gameStateRef.current?.players?.[playerId]
      if (!player) return

      // Update movement controls
      player.controls.up = inputState.movement.up
      player.controls.down = inputState.movement.down
      player.controls.left = inputState.movement.left
      player.controls.right = inputState.movement.right

      // Update aiming controls
      if (inputState.aiming.active) {
        player.rotation = inputState.aiming.angle
        player.bowCharge = Math.min(inputState.aiming.power, 1)
      }

      // Update action controls
      player.controls.shoot = inputState.actions.shoot
      player.controls.dash = inputState.actions.dash
      player.controls.special = inputState.actions.special
      player.controls.explosiveArrow = inputState.actions.explosiveArrow

      // Notify parent component of control updates
      if (onControlsUpdate) {
        onControlsUpdate({
          movement: inputState.movement,
          aiming: inputState.aiming,
          actions: inputState.actions,
        })
      }
    },
    [playerId, gameStateRef, onControlsUpdate],
  )

  useEffect(() => {
    if (isMobile) {
      // Set up mobile input handler
      gameInputHandler.setCallbacks({
        onStateChange: handleMobileInputChange,
      })

      return () => {
        gameInputHandler.destroy()
      }
    } else {
      // Set up desktop input handlers
      const cleanup = setupGameInputHandlers({
        playerId,
        gameStateRef,
        componentIdRef,
      })

      return cleanup
    }
  }, [isMobile, playerId, gameStateRef, handleMobileInputChange])

  // Return current input state for debugging or UI purposes
  const getCurrentInputState = useCallback(() => {
    if (isMobile) {
      const player = gameStateRef.current?.players?.[playerId]
      return player?.controls || null
    }
    return null
  }, [isMobile, playerId, gameStateRef])

  return {
    getCurrentInputState,
    isMobile,
  }
}
