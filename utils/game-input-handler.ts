export interface JoystickState {
  x: number
  y: number
  distance: number
  angle: number
  isActive: boolean
}

export interface InputState {
  movement: JoystickState
  aiming: JoystickState
  actionButtons: {
    dash: boolean
    special: boolean
    explosiveArrow: boolean
  }
}

export class GameInputHandler {
  private canvas: HTMLCanvasElement | null = null
  private movementJoystick: JoystickState = { x: 0, y: 0, distance: 0, angle: 0, isActive: false }
  private aimingJoystick: JoystickState = { x: 0, y: 0, distance: 0, angle: 0, isActive: false }
  private actionButtons = { dash: false, special: false, explosiveArrow: false }
  private listeners: ((state: InputState) => void)[] = []

  constructor(canvas?: HTMLCanvasElement) {
    if (canvas) {
      this.setCanvas(canvas)
    }
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  subscribe(callback: (state: InputState) => void) {
    this.listeners.push(callback)
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners() {
    const state: InputState = {
      movement: { ...this.movementJoystick },
      aiming: { ...this.aimingJoystick },
      actionButtons: { ...this.actionButtons },
    }
    this.listeners.forEach((listener) => listener(state))
  }

  updateMovementJoystick(x: number, y: number, distance: number, angle: number, isActive: boolean) {
    this.movementJoystick = { x, y: -y, distance, angle, isActive } // Invert Y for movement
    this.notifyListeners()
  }

  updateAimingJoystick(x: number, y: number, distance: number, angle: number, isActive: boolean) {
    this.aimingJoystick = { x, y, distance, angle, isActive }
    this.notifyListeners()
  }

  updateActionButton(button: keyof typeof this.actionButtons, pressed: boolean) {
    this.actionButtons[button] = pressed
    this.notifyListeners()
  }

  getCurrentState(): InputState {
    return {
      movement: { ...this.movementJoystick },
      aiming: { ...this.aimingJoystick },
      actionButtons: { ...this.actionButtons },
    }
  }

  reset() {
    this.movementJoystick = { x: 0, y: 0, distance: 0, angle: 0, isActive: false }
    this.aimingJoystick = { x: 0, y: 0, distance: 0, angle: 0, isActive: false }
    this.actionButtons = { dash: false, special: false, explosiveArrow: false }
    this.notifyListeners()
  }
}

export const gameInputHandler = new GameInputHandler()
