export interface MovementState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  dash: boolean
}

export interface AimingState {
  active: boolean
  angle: number
  power: number
}

export interface ActionState {
  shoot: boolean
  special: boolean
  reload: boolean
}

export interface InputState {
  movement: MovementState
  aiming: AimingState
  actions: ActionState
}

class GameInputHandler {
  private inputState: InputState = {
    movement: {
      up: false,
      down: false,
      left: false,
      right: false,
      dash: false,
    },
    aiming: {
      active: false,
      angle: 0,
      power: 0,
    },
    actions: {
      shoot: false,
      special: false,
      reload: false,
    },
  }

  private listeners: Array<(state: InputState) => void> = []

  // Subscribe to input state changes
  subscribe(callback: (state: InputState) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback)
    }
  }

  // Notify all listeners of state changes
  private notifyListeners() {
    this.listeners.forEach((listener) => listener({ ...this.inputState }))
  }

  // Get current input state
  getInputState(): InputState {
    return { ...this.inputState }
  }

  // Movement joystick handlers
  handleMovementJoystick(data: { x: number; y: number; distance: number }) {
    const threshold = 0.3 // Minimum distance to register movement
    const normalizedDistance = Math.min(data.distance / 50, 1) // Normalize to 0-1

    if (normalizedDistance < threshold) {
      // Joystick is in dead zone
      this.inputState.movement.up = false
      this.inputState.movement.down = false
      this.inputState.movement.left = false
      this.inputState.movement.right = false
    } else {
      // Convert joystick position to directional booleans
      const angle = Math.atan2(-data.y, data.x) // Negative y because screen coordinates are inverted
      const angleDegrees = ((angle * 180) / Math.PI + 360) % 360

      // Reset all directions
      this.inputState.movement.up = false
      this.inputState.movement.down = false
      this.inputState.movement.left = false
      this.inputState.movement.right = false

      // Set directions based on angle (with 45-degree zones)
      if (angleDegrees >= 315 || angleDegrees < 45) {
        this.inputState.movement.right = true
      }
      if (angleDegrees >= 45 && angleDegrees < 135) {
        this.inputState.movement.up = true
      }
      if (angleDegrees >= 135 && angleDegrees < 225) {
        this.inputState.movement.left = true
      }
      if (angleDegrees >= 225 && angleDegrees < 315) {
        this.inputState.movement.down = true
      }

      // Handle diagonal movement
      if ((angleDegrees >= 315 || angleDegrees < 45) && (angleDegrees >= 315 || angleDegrees < 90)) {
        if (angleDegrees > 315 || angleDegrees < 45) {
          this.inputState.movement.right = true
          if (angleDegrees > 315) this.inputState.movement.down = true
          if (angleDegrees < 45) this.inputState.movement.up = true
        }
      }
    }

    this.notifyListeners()
  }

  handleMovementJoystickStop() {
    this.inputState.movement.up = false
    this.inputState.movement.down = false
    this.inputState.movement.left = false
    this.inputState.movement.right = false
    this.notifyListeners()
  }

  // Aiming joystick handlers
  handleAimingJoystick(data: { x: number; y: number; distance: number }) {
    const normalizedDistance = Math.min(data.distance / 50, 1) // Normalize to 0-1
    const angle = Math.atan2(-data.y, data.x) // Negative y because screen coordinates are inverted

    this.inputState.aiming.active = true
    this.inputState.aiming.angle = angle
    this.inputState.aiming.power = normalizedDistance

    this.notifyListeners()
  }

  handleAimingJoystickStart() {
    this.inputState.aiming.active = true
    this.notifyListeners()
  }

  handleAimingJoystickStop() {
    // When aiming joystick is released, trigger a shot
    if (this.inputState.aiming.active && this.inputState.aiming.power > 0.1) {
      this.inputState.actions.shoot = true
      // Reset shoot action after a brief moment
      setTimeout(() => {
        this.inputState.actions.shoot = false
        this.notifyListeners()
      }, 50)
    }

    this.inputState.aiming.active = false
    this.inputState.aiming.power = 0
    this.notifyListeners()
  }

  // Action button handlers
  handleActionPress(action: keyof ActionState) {
    this.inputState.actions[action] = true
    this.notifyListeners()
  }

  handleActionRelease(action: keyof ActionState) {
    this.inputState.actions[action] = false
    this.notifyListeners()
  }

  // Movement button handlers (for fallback/accessibility)
  handleMovementPress(direction: keyof Omit<MovementState, "dash">) {
    this.inputState.movement[direction] = true
    this.notifyListeners()
  }

  handleMovementRelease(direction: keyof Omit<MovementState, "dash">) {
    this.inputState.movement[direction] = false
    this.notifyListeners()
  }

  // Keyboard handlers for desktop
  handleKeyDown(key: string) {
    switch (key.toLowerCase()) {
      case "w":
      case "arrowup":
        this.inputState.movement.up = true
        break
      case "s":
      case "arrowdown":
        this.inputState.movement.down = true
        break
      case "a":
      case "arrowleft":
        this.inputState.movement.left = true
        break
      case "d":
      case "arrowright":
        this.inputState.movement.right = true
        break
      case " ":
        this.inputState.actions.shoot = true
        break
      case "shift":
        this.inputState.movement.dash = true
        break
      case "r":
        this.inputState.actions.reload = true
        break
      case "q":
        this.inputState.actions.special = true
        break
    }
    this.notifyListeners()
  }

  handleKeyUp(key: string) {
    switch (key.toLowerCase()) {
      case "w":
      case "arrowup":
        this.inputState.movement.up = false
        break
      case "s":
      case "arrowdown":
        this.inputState.movement.down = false
        break
      case "a":
      case "arrowleft":
        this.inputState.movement.left = false
        break
      case "d":
      case "arrowright":
        this.inputState.movement.right = false
        break
      case " ":
        this.inputState.actions.shoot = false
        break
      case "shift":
        this.inputState.movement.dash = false
        break
      case "r":
        this.inputState.actions.reload = false
        break
      case "q":
        this.inputState.actions.special = false
        break
    }
    this.notifyListeners()
  }

  // Mouse handlers for desktop aiming
  handleMouseMove(x: number, y: number, canvasRect: DOMRect) {
    const centerX = canvasRect.width / 2
    const centerY = canvasRect.height / 2
    const deltaX = x - centerX
    const deltaY = y - centerY
    const angle = Math.atan2(deltaY, deltaX)

    this.inputState.aiming.angle = angle
    this.notifyListeners()
  }

  handleMouseDown() {
    this.inputState.aiming.active = true
    this.notifyListeners()
  }

  handleMouseUp() {
    if (this.inputState.aiming.active) {
      this.inputState.actions.shoot = true
      setTimeout(() => {
        this.inputState.actions.shoot = false
        this.notifyListeners()
      }, 50)
    }
    this.inputState.aiming.active = false
    this.notifyListeners()
  }

  // Reset all input states
  reset() {
    this.inputState = {
      movement: {
        up: false,
        down: false,
        left: false,
        right: false,
        dash: false,
      },
      aiming: {
        active: false,
        angle: 0,
        power: 0,
      },
      actions: {
        shoot: false,
        special: false,
        reload: false,
      },
    }
    this.notifyListeners()
  }
}

// Export singleton instance
export const gameInputHandler = new GameInputHandler()
