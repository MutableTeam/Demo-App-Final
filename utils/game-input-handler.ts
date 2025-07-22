import type { IJoystickUpdateEvent } from "react-joystick-component"

export interface MovementState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

export interface AimingState {
  active: boolean
  angle: number
  power: number
}

export interface ActionState {
  shoot: boolean
  dash: boolean
  special: boolean
}

export type ControlState = {
  movement: MovementState
  aiming: AimingState
  actions: ActionState
}

type ControlStateListener = (state: ControlState) => void

class GameInputHandler {
  private static instance: GameInputHandler
  private controlState: ControlState = {
    movement: { up: false, down: false, left: false, right: false },
    aiming: { active: false, angle: 0, power: 0 },
    actions: { shoot: false, dash: false, special: false },
  }
  private listeners: ControlStateListener[] = []

  private constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", this.handleKeyDown.bind(this))
      window.addEventListener("keyup", this.handleKeyUp.bind(this))
    }
  }

  public static getInstance(): GameInputHandler {
    if (!GameInputHandler.instance) {
      GameInputHandler.instance = new GameInputHandler()
    }
    return GameInputHandler.instance
  }

  public subscribe(listener: ControlStateListener) {
    this.listeners.push(listener)
    listener(this.controlState) // Immediately notify with current state
  }

  public unsubscribe(listener: ControlStateListener) {
    this.listeners = this.listeners.filter((l) => l !== listener)
  }

  private notifyListeners() {
    const stateCopy = JSON.parse(JSON.stringify(this.controlState))
    this.listeners.forEach((listener) => listener(stateCopy))
  }

  private handleKeyDown(event: KeyboardEvent) {
    let changed = false
    switch (event.key.toLowerCase()) {
      case "w":
      case "arrowup":
        if (!this.controlState.movement.up) {
          this.controlState.movement.up = true
          changed = true
        }
        break
      case "s":
      case "arrowdown":
        if (!this.controlState.movement.down) {
          this.controlState.movement.down = true
          changed = true
        }
        break
      case "a":
      case "arrowleft":
        if (!this.controlState.movement.left) {
          this.controlState.movement.left = true
          changed = true
        }
        break
      case "d":
      case "arrowright":
        if (!this.controlState.movement.right) {
          this.controlState.movement.right = true
          changed = true
        }
        break
      case " ": // Space bar
        if (!this.controlState.actions.shoot) {
          this.controlState.actions.shoot = true
          changed = true
        }
        break
    }
    if (changed) this.notifyListeners()
  }

  private handleKeyUp(event: KeyboardEvent) {
    let changed = false
    switch (event.key.toLowerCase()) {
      case "w":
      case "arrowup":
        if (this.controlState.movement.up) {
          this.controlState.movement.up = false
          changed = true
        }
        break
      case "s":
      case "arrowdown":
        if (this.controlState.movement.down) {
          this.controlState.movement.down = false
          changed = true
        }
        break
      case "a":
      case "arrowleft":
        if (this.controlState.movement.left) {
          this.controlState.movement.left = false
          changed = true
        }
        break
      case "d":
      case "arrowright":
        if (this.controlState.movement.right) {
          this.controlState.movement.right = false
          changed = true
        }
        break
      case " ": // Space bar
        if (this.controlState.actions.shoot) {
          this.controlState.actions.shoot = false
          changed = true
        }
        break
    }
    if (changed) this.notifyListeners()
  }

  public handleMovementJoystick(event: IJoystickUpdateEvent) {
    const { direction } = event
    const newState: MovementState = { up: false, down: false, left: false, right: false }
    if (direction) {
      if (direction === "FORWARD") newState.up = true
      if (direction === "BACKWARD") newState.down = true
      if (direction === "LEFT") newState.left = true
      if (direction === "RIGHT") newState.right = true
    }
    this.controlState.movement = newState
    this.notifyListeners()
  }

  public handleAimingJoystick(event: IJoystickUpdateEvent) {
    const { type, x, y, distance } = event
    if (type === "stop") {
      if (this.controlState.aiming.active) {
        this.controlState.actions.shoot = true // Trigger shot on release
      }
      this.controlState.aiming = { active: false, angle: 0, power: 0 }
      this.notifyListeners()
      // Reset shoot state shortly after
      setTimeout(() => {
        this.controlState.actions.shoot = false
        this.notifyListeners()
      }, 50)
    } else if (x !== null && y !== null && distance !== null) {
      const angle = Math.atan2(y, x) * (180 / Math.PI)
      const power = Math.min(distance / 50, 1) // Assuming joystick size of 100, so radius is 50
      this.controlState.aiming = { active: true, angle, power }
      this.notifyListeners()
    }
  }

  public setAction(action: keyof ActionState, value: boolean) {
    if (this.controlState.actions[action] !== value) {
      this.controlState.actions[action] = value
      this.notifyListeners()
    }
  }
}

export const gameInputHandler = GameInputHandler.getInstance()
