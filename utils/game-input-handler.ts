import type React from "react"
// This is a simplified version of the game input handler
// It handles both keyboard/mouse input for desktop and touch input for mobile

import { logger } from "./logger"

export interface GameInputState {
  movement: {
    up: boolean
    down: boolean
    left: boolean
    right: boolean
    vectorX: number
    vectorY: number
    magnitude: number
  }
  aiming: {
    active: boolean
    angle: number
    power: number
  }
  actions: {
    shoot: boolean
    dash: boolean
    special: boolean
    explosiveArrow: boolean
  }
}

interface GameInputHandlerOptions {
  playerId: string
  gameStateRef: React.MutableRefObject<any>
  componentIdRef: React.MutableRefObject<string>
}

// Singleton for mobile input handling
class GameInputHandler {
  private callbacks: {
    onStateChange?: (state: GameInputState) => void
  } = {}

  private inputState: GameInputState = {
    movement: {
      up: false,
      down: false,
      left: false,
      right: false,
      vectorX: 0,
      vectorY: 0,
      magnitude: 0,
    },
    aiming: {
      active: false,
      angle: 0,
      power: 0,
    },
    actions: {
      shoot: false,
      dash: false,
      special: false,
      explosiveArrow: false,
    },
  }

  private shootTimeout: NodeJS.Timeout | null = null
  private lastShootTime = 0
  private minShootInterval = 300 // ms

  constructor() {
    // Initialize with default state
  }

  setCallbacks(callbacks: { onStateChange?: (state: GameInputState) => void }) {
    this.callbacks = callbacks
  }

  updateMovement(up: boolean, down: boolean, left: boolean, right: boolean, vectorX = 0, vectorY = 0, magnitude = 0) {
    this.inputState.movement = {
      up,
      down,
      left,
      right,
      vectorX,
      vectorY,
      magnitude,
    }
    this.notifyStateChange()
  }

  updateAiming(active: boolean, angle: number, power: number) {
    this.inputState.aiming = {
      active,
      angle,
      power,
    }
    this.notifyStateChange()
  }

  triggerShoot() {
    const now = Date.now()
    // Prevent rapid firing by enforcing a minimum interval
    if (now - this.lastShootTime < this.minShootInterval) {
      return
    }

    this.lastShootTime = now
    logger.info("Triggering shoot", "GAME_INPUT")

    // Set shoot to true
    this.inputState.actions.shoot = true
    this.notifyStateChange()

    // Reset shoot after a short delay
    if (this.shootTimeout) {
      clearTimeout(this.shootTimeout)
    }

    this.shootTimeout = setTimeout(() => {
      this.inputState.actions.shoot = false
      this.notifyStateChange()
      logger.info("Reset shoot state", "GAME_INPUT")
    }, 100) // Increased timeout to ensure the game engine processes the shoot action
  }

  updateAction(action: "dash" | "special" | "explosiveArrow", active: boolean) {
    this.inputState.actions[action] = active
    this.notifyStateChange()
  }

  private notifyStateChange() {
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.inputState)
    }
  }

  destroy() {
    if (this.shootTimeout) {
      clearTimeout(this.shootTimeout)
    }
    this.callbacks = {}
  }
}

export const gameInputHandler = new GameInputHandler()

export function setupGameInputHandlers({
  playerId,
  gameStateRef,
  componentIdRef,
}: GameInputHandlerOptions): () => void {
  // Desktop input handling implementation
  // This is a simplified version that would be expanded in a real implementation

  const handleKeyDown = (e: KeyboardEvent) => {
    const player = gameStateRef.current?.players?.[playerId]
    if (!player) return

    switch (e.key) {
      case "w":
      case "ArrowUp":
        player.controls.up = true
        break
      case "s":
      case "ArrowDown":
        player.controls.down = true
        break
      case "a":
      case "ArrowLeft":
        player.controls.left = true
        break
      case "d":
      case "ArrowRight":
        player.controls.right = true
        break
      case " ":
        player.controls.shoot = true
        break
      case "Shift":
        player.controls.dash = true
        break
      case "q":
        player.controls.special = true
        break
      case "e":
        player.controls.explosiveArrow = true
        break
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    const player = gameStateRef.current?.players?.[playerId]
    if (!player) return

    switch (e.key) {
      case "w":
      case "ArrowUp":
        player.controls.up = false
        break
      case "s":
      case "ArrowDown":
        player.controls.down = false
        break
      case "a":
      case "ArrowLeft":
        player.controls.left = false
        break
      case "d":
      case "ArrowRight":
        player.controls.right = false
        break
      case " ":
        player.controls.shoot = false
        break
      case "Shift":
        player.controls.dash = false
        break
      case "q":
        player.controls.special = false
        break
      case "e":
        player.controls.explosiveArrow = false
        break
    }
  }

  window.addEventListener("keydown", handleKeyDown)
  window.addEventListener("keyup", handleKeyUp)

  return () => {
    window.removeEventListener("keydown", handleKeyDown)
    window.removeEventListener("keyup", handleKeyUp)
  }
}
