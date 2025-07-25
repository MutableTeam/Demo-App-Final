import type { EventData } from "nipplejs"

export interface GameInputState {
  movement: {
    up: boolean
    down: boolean
    left: boolean
    right: boolean
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
  }
}

class GameInputHandler {
  private state: GameInputState = {
    movement: { up: false, down: false, left: false, right: false },
    aiming: { active: false, angle: 0, power: 0 },
    actions: { shoot: false, dash: false, special: false },
  }

  private callbacks: { onStateChange?: (state: GameInputState) => void } = {}

  setCallbacks(callbacks: { onStateChange?: (state: GameInputState) => void }) {
    this.callbacks = callbacks
  }

  private notifyStateChange() {
    if (this.callbacks.onStateChange) {
      // Create a deep copy to prevent unintended mutations
      const stateCopy = JSON.parse(JSON.stringify(this.state))
      this.callbacks.onStateChange(stateCopy)
    }
  }

  // NippleJS Movement Handlers
  handleNippleMovement(data: EventData) {
    if (data.angle) {
      const angle = data.angle.degree
      const movement = { up: false, down: false, left: false, right: false }

      // 8-way direction detection
      if (angle > 337.5 || angle <= 22.5) {
        // Right
        movement.right = true
      } else if (angle > 22.5 && angle <= 67.5) {
        // Up-Right
        movement.up = true
        movement.right = true
      } else if (angle > 67.5 && angle <= 112.5) {
        // Up
        movement.up = true
      } else if (angle > 112.5 && angle <= 157.5) {
        // Up-Left
        movement.up = true
        movement.left = true
      } else if (angle > 157.5 && angle <= 202.5) {
        // Left
        movement.left = true
      } else if (angle > 202.5 && angle <= 247.5) {
        // Down-Left
        movement.down = true
        movement.left = true
      } else if (angle > 247.5 && angle <= 292.5) {
        // Down
        movement.down = true
      } else if (angle > 292.5 && angle <= 337.5) {
        // Down-Right
        movement.down = true
        movement.right = true
      }
      this.state.movement = movement
    }
    this.notifyStateChange()
  }

  handleNippleMovementEnd() {
    this.state.movement = { up: false, down: false, left: false, right: false }
    this.notifyStateChange()
  }

  // NippleJS Aiming Handlers
  handleNippleAimingStart() {
    this.state.aiming.active = true
    this.state.actions.shoot = true // Start charging the bow
    this.notifyStateChange()
  }

  handleNippleAiming(data: EventData) {
    if (data.angle) {
      // Invert Y-axis by negating the angle in radians for correct aiming
      this.state.aiming.angle = -data.angle.radian
      this.state.aiming.power = Math.min(data.force, 1.0) // Cap power at 1
    }
    this.notifyStateChange()
  }

  handleNippleAimingEnd() {
    // The game engine will handle firing the arrow on shoot=false
    this.state.aiming.active = false
    this.state.actions.shoot = false
    this.notifyStateChange()
  }

  // Action Button Handlers
  handleButtonPress(action: "dash" | "special" | "shoot") {
    if (this.state.actions[action] !== undefined) {
      this.state.actions[action] = true
      this.notifyStateChange()
    }
  }

  handleButtonRelease(action: "dash" | "special" | "shoot") {
    if (this.state.actions[action] !== undefined) {
      this.state.actions[action] = false
      this.notifyStateChange()
    }
  }
}

export const gameInputHandler = new GameInputHandler()
