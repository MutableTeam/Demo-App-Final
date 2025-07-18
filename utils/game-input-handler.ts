class GameInputHandler {
  private static instance: GameInputHandler
  private movementInput = { x: 0, y: 0 }
  private shootPressed = false
  private dashPressed = false
  private specialPressed = false
  private mobileJoystick = { x: 0, y: 0 }
  private mobileActions = {
    shoot: false,
    dash: false,
    special: false,
  }

  static getInstance(): GameInputHandler {
    if (!GameInputHandler.instance) {
      GameInputHandler.instance = new GameInputHandler()
    }
    return GameInputHandler.instance
  }

  // Movement input methods
  setMovementInput(x: number, y: number) {
    this.movementInput.x = x
    this.movementInput.y = y
  }

  getMovementInput() {
    return { ...this.movementInput }
  }

  // Action input methods
  setShootPressed(pressed: boolean) {
    this.shootPressed = pressed
  }

  setDashPressed(pressed: boolean) {
    this.dashPressed = pressed
  }

  setSpecialPressed(pressed: boolean) {
    this.specialPressed = pressed
  }

  isShootPressed(): boolean {
    return this.shootPressed
  }

  isDashPressed(): boolean {
    return this.dashPressed
  }

  isSpecialPressed(): boolean {
    return this.specialPressed
  }

  // Mobile-specific methods
  setMobileJoystick(x: number, y: number) {
    this.mobileJoystick.x = x
    this.mobileJoystick.y = y
    this.setMovementInput(x, y)
  }

  getMobileJoystick() {
    return { ...this.mobileJoystick }
  }

  setMobileAction(action: "shoot" | "dash" | "special", pressed: boolean) {
    this.mobileActions[action] = pressed

    switch (action) {
      case "shoot":
        this.setShootPressed(pressed)
        break
      case "dash":
        this.setDashPressed(pressed)
        break
      case "special":
        this.setSpecialPressed(pressed)
        break
    }
  }

  getMobileActions() {
    return { ...this.mobileActions }
  }

  // Reset all inputs
  reset() {
    this.movementInput = { x: 0, y: 0 }
    this.shootPressed = false
    this.dashPressed = false
    this.specialPressed = false
    this.mobileJoystick = { x: 0, y: 0 }
    this.mobileActions = {
      shoot: false,
      dash: false,
      special: false,
    }
  }

  // Get current input state
  getCurrentState() {
    return {
      movement: this.getMovementInput(),
      actions: {
        shoot: this.isShootPressed(),
        dash: this.isDashPressed(),
        special: this.isSpecialPressed(),
      },
      mobile: {
        joystick: this.getMobileJoystick(),
        actions: this.getMobileActions(),
      },
    }
  }
}

export const gameInputHandler = GameInputHandler.getInstance()
