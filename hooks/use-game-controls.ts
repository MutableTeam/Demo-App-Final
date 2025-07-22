"use client"

import { useState, useEffect, useCallback } from "react"
import { gameInputHandler, type ControlState, type AimingState, type ActionState } from "@/utils/game-input-handler"

export function useGameControls() {
  const [controlState, setControlState] = useState<ControlState>({
    movement: { up: false, down: false, left: false, right: false },
    aiming: { active: false, angle: 0, power: 0 },
    actions: { shoot: false, dash: false, special: false },
  })

  useEffect(() => {
    const handleStateChange = (newState: ControlState) => {
      setControlState(newState)
    }

    gameInputHandler.subscribe(handleStateChange)

    return () => {
      gameInputHandler.unsubscribe(handleStateChange)
    }
  }, [])

  const getMovementVector = useCallback((): { x: number; y: number } => {
    const { up, down, left, right } = controlState.movement
    let x = 0
    let y = 0
    if (up) y -= 1
    if (down) y += 1
    if (left) x -= 1
    if (right) x += 1

    // Normalize vector for consistent speed
    if (x !== 0 || y !== 0) {
      const magnitude = Math.sqrt(x * x + y * y)
      x /= magnitude
      y /= magnitude
    }

    return { x, y }
  }, [controlState.movement])

  const isShooting = useCallback((): boolean => {
    return controlState.actions.shoot
  }, [controlState.actions.shoot])

  const getAimingState = useCallback((): AimingState => {
    return controlState.aiming
  }, [controlState.aiming])

  const getActionState = useCallback((): ActionState => {
    return controlState.actions
  }, [controlState.actions])

  return {
    controlState,
    getMovementVector,
    isShooting,
    getAimingState,
    getActionState,
  }
}
