"use client"

import type React from "react"

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
    dash: boolean
    special: boolean
    explosiveArrow: boolean
  }
}

interface GameInputCallbacks {
  onStateChange?: (state: GameInputState) => void
}

class GameInputHandler {
  private state: GameInputState = {
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
      dash: false,
      special: false,
      explosiveArrow: false,
    },
  }

  private callbacks: GameInputCallbacks = {}

  setCallbacks(callbacks: GameInputCallbacks) {
    this.callbacks = callbacks
  }

  private notifyStateChange() {
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(JSON.parse(JSON.stringify(this.state)))
    }
  }

  handleMovementJoystick(event: any) {
    const deadzone = 0.15
    const threshold = 0.3

    if (!event || event.distance < deadzone) {
      if (this.state.movement.magnitude > 0) {
        this.state.movement = {
          up: false,
          down: false,
          left: false,
          right: false,
          vectorX: 0,
          vectorY: 0,
          magnitude: 0,
        }
        this.notifyStateChange()
      }
      return
    }

    const { x, y, distance } = event
    const magnitude = Math.min(distance / 50, 1)

    this.state.movement = {
      up: y > threshold,
      down: y < -threshold,
      left: x < -threshold,
      right: x > threshold,
      vectorX: x / 50,
      vectorY: y / 50,
      magnitude: magnitude,
    }
    this.notifyStateChange()
  }

  handleAimingJoystick(event: any) {
    const minDistance = 15 // Deadzone

    if (event && event.distance > minDistance) {
      this.state.aiming = {
        active: true,
        angle: Math.atan2(event.y, event.x),
        power: Math.min(event.distance / 50, 1),
      }
    } else {
      this.state.aiming = {
        active: false,
        angle: this.state.aiming.angle, // Keep last angle for reference
        power: 0,
      }
    }
    this.notifyStateChange()
  }

  handleActionPress(action: keyof GameInputState["actions"], pressed: boolean) {
    if (this.state.actions[action] !== pressed) {
      this.state.actions[action] = pressed
      this.notifyStateChange()
    }
  }

  destroy() {
    this.callbacks = {}
  }
}

export const gameInputHandler = new GameInputHandler()

// Desktop keyboard input setup function
export function setupGameInputHandlers({
  playerId,
  gameStateRef,
}: {
  playerId: string
  gameStateRef: React.MutableRefObject<any>
}) {
  const handleKeyDown = (e: KeyboardEvent) => {
    const player = gameStateRef.current?.players?.[playerId]
    if (!player) return

    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
        player.controls.up = true
        break
      case "KeyS":
      case "ArrowDown":
        player.controls.down = true
        break
      case "KeyA":
      case "ArrowLeft":
        player.controls.left = true
        break
      case "KeyD":
      case "ArrowRight":
        player.controls.right = true
        break
      case "Space":
        e.preventDefault()
        if (!player.isDrawingBow) {
          player.isDrawingBow = true
          player.drawStartTime = Date.now() / 1000
        }
        break
      case "ShiftLeft":
        player.controls.dash = true
        break
      case "KeyE":
        player.controls.special = true
        break
      case "KeyQ":
        player.controls.explosiveArrow = true
        break
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    const player = gameStateRef.current?.players?.[playerId]
    if (!player) return

    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
        player.controls.up = false
        break
      case "KeyS":
      case "ArrowDown":
        player.controls.down = false
        break
      case "KeyA":
      case "ArrowLeft":
        player.controls.left = false
        break
      case "KeyD":
      case "ArrowRight":
        player.controls.right = false
        break
      case "Space":
        if (player.isDrawingBow) {
          player.controls.shoot = true
        }
        break
      case "ShiftLeft":
        player.controls.dash = false
        break
      case "KeyE":
        player.controls.special = false
        break
      case "KeyQ":
        player.controls.explosiveArrow = false
        break
    }
  }

  document.addEventListener("keydown", handleKeyDown)
  document.addEventListener("keyup", handleKeyUp)

  return () => {
    document.removeEventListener("keydown", handleKeyDown)
    document.removeEventListener("keyup", handleKeyUp)
  }
}
