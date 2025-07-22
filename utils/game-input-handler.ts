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
    shoot: boolean
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
      shoot: false,
      dash: false,
      special: false,
      explosiveArrow: false,
    },
  }

  private callbacks: GameInputCallbacks = {}
  private shootTimeout: NodeJS.Timeout | null = null
  private isAiming = false // Track aiming state internally

  setCallbacks(callbacks: GameInputCallbacks) {
    this.callbacks = callbacks
  }

  private notifyStateChange() {
    if (this.callbacks.onStateChange) {
      // Deep copy to prevent mutation issues
      this.callbacks.onStateChange(JSON.parse(JSON.stringify(this.state)))
    }
  }

  handleMovementJoystick(event: any) {
    const deadzone = 0.15
    const threshold = 0.3

    if (!event || event.distance < deadzone) {
      // Reset movement when joystick is released or in deadzone
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
    const magnitude = Math.min(distance / 50, 1) // Assuming joystick size of 100 (radius 50)

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

  private isAiming = false // This will track the entire "touch" duration

  handleAimingJoystick(event: any) {
    // Case 1: Joystick is released (event is null)
    if (!event) {
      if (this.isAiming) {
        // We were aiming, so now we shoot (mouseup)
        console.log("[INPUT_HANDLER] Joystick released. Firing shot.")
        this.state.actions.shoot = true

        // Reset the aiming state completely
        this.isAiming = false
        this.state.aiming.active = false
        this.state.aiming.power = 0

        // Reset the shoot pulse after a short delay
        if (this.shootTimeout) clearTimeout(this.shootTimeout)
        this.shootTimeout = setTimeout(() => {
          if (this.state.actions.shoot) {
            this.state.actions.shoot = false
            this.notifyStateChange()
            console.log("[INPUT_HANDLER] Shoot action pulse reset.")
          }
        }, 100)
      }
      this.notifyStateChange()
      return
    }

    // Case 2: Joystick is active (event is not null)
    const { x, y, distance } = event
    const minDistance = 15 // Deadzone

    // If we aren't already aiming, check if we should start.
    // This is the "mousedown" event. It only happens once per touch.
    if (!this.isAiming && distance > minDistance) {
      console.log("[INPUT_HANDLER] Joystick pulled. Starting aim/charge.")
      this.isAiming = true
    }

    // If we are in an aiming state, update the aiming properties.
    // This happens continuously as the user moves the stick.
    if (this.isAiming) {
      this.state.aiming.active = true
      this.state.aiming.angle = Math.atan2(y, x)
      this.state.aiming.power = Math.min(distance / 50, 1)
    } else {
      // Not aiming yet, keep state clean.
      this.state.aiming.active = false
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
    if (this.shootTimeout) {
      clearTimeout(this.shootTimeout)
      this.shootTimeout = null
    }
    this.callbacks = {}
  }
}

export const gameInputHandler = new GameInputHandler()

// Desktop keyboard input setup function
export function setupGameInputHandlers({
  playerId,
  gameStateRef,
  componentIdRef,
}: {
  playerId: string
  gameStateRef: React.MutableRefObject<any>
  componentIdRef: React.MutableRefObject<string>
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
        player.controls.shoot = true
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
        player.controls.shoot = false
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
