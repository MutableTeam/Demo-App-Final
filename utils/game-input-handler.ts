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
  private lastShootTime = 0
  private readonly SHOOT_COOLDOWN = 100 // Minimum time between shots in ms

  setCallbacks(callbacks: GameInputCallbacks) {
    this.callbacks = callbacks
  }

  private notifyStateChange() {
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange({ ...this.state })
    }
  }

  handleMovementJoystick(event: any) {
    if (!event) {
      // Reset movement when joystick is released
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
      return
    }

    const { x, y } = event
    const deadzone = 0.2
    const threshold = 0.2

    // Calculate magnitude
    const magnitude = Math.sqrt(x * x + y * y)

    if (magnitude < deadzone) {
      // Within deadzone - no movement
      this.state.movement = {
        up: false,
        down: false,
        left: false,
        right: false,
        vectorX: 0,
        vectorY: 0,
        magnitude: 0,
      }
    } else {
      // Outside deadzone - calculate 8-directional movement
      const normalizedX = x / magnitude
      const normalizedY = y / magnitude

      this.state.movement = {
        up: normalizedY < -threshold,
        down: normalizedY > threshold,
        left: normalizedX < -threshold,
        right: normalizedX > threshold,
        vectorX: normalizedX,
        vectorY: normalizedY,
        magnitude: Math.min(magnitude, 1),
      }
    }

    this.notifyStateChange()
  }

  handleAimingJoystick(event: any) {
    const now = Date.now()

    if (!event) {
      // Joystick released - trigger shot if we were aiming
      if (this.state.aiming.active && now - this.lastShootTime > this.SHOOT_COOLDOWN) {
        console.log("[JOYSTICK] Aiming joystick released - triggering shot")
        this.state.actions.shoot = true
        this.lastShootTime = now

        // Reset shoot action after a short delay
        if (this.shootTimeout) {
          clearTimeout(this.shootTimeout)
        }
        this.shootTimeout = setTimeout(() => {
          this.state.actions.shoot = false
          this.notifyStateChange()
        }, 100)
      }

      // Reset aiming state
      this.state.aiming = {
        active: false,
        angle: 0,
        power: 0,
      }
      this.notifyStateChange()
      return
    }

    const { x, y } = event
    const distance = Math.sqrt(x * x + y * y)
    const minDistance = 0.1 // Minimum distance to register as active aiming

    if (distance > minDistance) {
      const angle = Math.atan2(y, x)
      const power = Math.min(distance, 1)

      this.state.aiming = {
        active: true,
        angle,
        power,
      }

      console.log(`[JOYSTICK] Aiming: angle=${((angle * 180) / Math.PI).toFixed(1)}°, power=${power.toFixed(2)}`)
    } else {
      this.state.aiming = {
        active: false,
        angle: 0,
        power: 0,
      }
    }

    this.notifyStateChange()
  }

  handleActionPress(action: keyof GameInputState["actions"], pressed: boolean) {
    this.state.actions[action] = pressed
    console.log(`[ACTION] ${action}: ${pressed}`)
    this.notifyStateChange()
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
