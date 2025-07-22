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
    shootCharging: boolean // New state to track if shoot button is being held
    dash: boolean
    special: boolean
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
      shootCharging: false,
      dash: false,
      special: false,
    },
  }

  private callbacks: GameInputCallbacks = {}
  private shootTimeout: NodeJS.Timeout | null = null

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

  // Modified to only handle aiming, not shooting
  handleAimingJoystick(event: any) {
    const deadzone = 0.15

    // If joystick is released or in deadzone
    if (!event || event.distance < deadzone) {
      if (this.state.aiming.active) {
        this.state.aiming.active = false
        this.state.aiming.power = 0
        this.notifyStateChange()
      }
      return
    }

    // Joystick is active
    const { x, y, distance } = event

    // Update aiming state
    this.state.aiming.active = true
    this.state.aiming.angle = Math.atan2(y, x)
    this.state.aiming.power = Math.min(distance / 50, 1)

    this.notifyStateChange()
  }

  // New method to handle shoot button press/release
  handleShootButton(pressed: boolean) {
    if (pressed) {
      // Start charging the shot
      console.log("[INPUT_HANDLER] Shoot button pressed. Charging shot.")
      this.state.actions.shootCharging = true
      this.notifyStateChange()
    } else if (this.state.actions.shootCharging) {
      // Release the shot
      console.log("[INPUT_HANDLER] Shoot button released. Firing shot.")
      this.state.actions.shootCharging = false
      this.state.actions.shoot = true
      this.notifyStateChange()

      // Reset the shoot action after a short delay
      if (this.shootTimeout) clearTimeout(this.shootTimeout)
      this.shootTimeout = setTimeout(() => {
        this.state.actions.shoot = false
        this.notifyStateChange()
        console.log("[INPUT_HANDLER] Shoot action pulse reset.")
      }, 100)
    }
  }

  handleActionPress(action: keyof GameInputState["actions"], pressed: boolean) {
    if (action === "shoot") {
      this.handleShootButton(pressed)
      return
    }

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
        player.isDrawingBow = true
        player.drawStartTime = Date.now() / 1000
        break
      case "ShiftLeft":
        player.controls.dash = true
        break
      case "KeyE":
        player.controls.special = true
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
        // Release arrow if we were drawing the bow
        if (player.isDrawingBow) {
          player.controls.shoot = false
        }
        break
      case "ShiftLeft":
        player.controls.dash = false
        break
      case "KeyE":
        player.controls.special = false
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
