"use client"

import { useEffect, useState, useCallback } from "react"
import { gameInputHandler, type InputState } from "@/utils/game-input-handler"
import { usePlatform } from "@/contexts/platform-context"

export interface GameControls {
  // Movement
  moveUp: boolean
  moveDown: boolean
  moveLeft: boolean
  moveRight: boolean
  dash: boolean

  // Aiming and shooting
  isAiming: boolean
  aimAngle: number
  aimPower: number
  shoot: boolean

  // Actions
  special: boolean
  reload: boolean

  // Utility
  resetControls: () => void
}

export function useGameControls(): GameControls {
  const { platform } = usePlatform()
  const [inputState, setInputState] = useState<InputState>(gameInputHandler.getInputState())

  useEffect(() => {
    // Subscribe to input state changes
    const unsubscribe = gameInputHandler.subscribe(setInputState)

    // Set up keyboard listeners for desktop
    if (platform === "desktop") {
      const handleKeyDown = (event: KeyboardEvent) => {
        // Prevent default for game keys to avoid browser shortcuts
        if (
          ["w", "a", "s", "d", " ", "shift", "r", "q"].includes(event.key.toLowerCase()) ||
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
        ) {
          event.preventDefault()
        }
        gameInputHandler.handleKeyDown(event.key)
      }

      const handleKeyUp = (event: KeyboardEvent) => {
        gameInputHandler.handleKeyUp(event.key)
      }

      window.addEventListener("keydown", handleKeyDown)
      window.addEventListener("keyup", handleKeyUp)

      return () => {
        window.removeEventListener("keydown", handleKeyDown)
        window.removeEventListener("keyup", handleKeyUp)
        unsubscribe()
      }
    }

    return unsubscribe
  }, [platform])

  const resetControls = useCallback(() => {
    gameInputHandler.reset()
  }, [])

  return {
    // Movement
    moveUp: inputState.movement.up,
    moveDown: inputState.movement.down,
    moveLeft: inputState.movement.left,
    moveRight: inputState.movement.right,
    dash: inputState.movement.dash,

    // Aiming and shooting
    isAiming: inputState.aiming.active,
    aimAngle: inputState.aiming.angle,
    aimPower: inputState.aiming.power,
    shoot: inputState.actions.shoot,

    // Actions
    special: inputState.actions.special,
    reload: inputState.actions.reload,

    // Utility
    resetControls,
  }
}
