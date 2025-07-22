import transitionDebugger from "@/utils/transition-debug"
import type { IJoystickUpdateEvent } from "react-joystick-component"
import type { MutableRefObject } from "react"

// --- Interfaces for Mobile Input ---
export interface GameInputState {
  movement: {
    up: boolean
    down: boolean
    left: boolean
    right: boolean
    vectorX: number // Normalized vector (-1 to 1)
    vectorY: number // Normalized vector (-1 to 1)
    magnitude: number // 0 to 1
  }
  aiming: {
    active: boolean
    angle: number // In radians
    power: number // 0 to 1
  }
  actions: {
    shoot: boolean
    dash: boolean
    special: boolean
    explosiveArrow: boolean
  }
}

// --- Mobile Input Handler Class ---
class GameInputHandler {
  private inputState: GameInputState
  private callbacks: {
    onStateChange?: (state: GameInputState) => void
  }
  private touchIdentifiers: Record<string, number> = {}
  private shootingTimeout: NodeJS.Timeout | null = null
  private debugEnabled = true

  constructor() {
    this.inputState = {
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
    this.callbacks = {}
    this.logDebug("INPUT", "GameInputHandler initialized for joystick controls.")
  }

  // Simple debug logger
  private logDebug(category: string, message: string) {
    if (this.debugEnabled) {
      console.log(`[${category}] ${message}`)
    }
  }

  // Reset the input state
  reset() {
    this.inputState = JSON.parse(JSON.stringify(this.inputState))
    this.notifyStateChange()
  }

  setCallbacks(callbacks: { onStateChange?: (state: GameInputState) => void }) {
    this.callbacks = callbacks
  }

  // --- Joystick Handlers ---
  handleMovementJoystick(event: IJoystickUpdateEvent) {
    const { type, x, y, distance } = event
    const newState: GameInputState["movement"] = {
      up: false,
      down: false,
      left: false,
      right: false,
      vectorX: 0,
      vectorY: 0,
      magnitude: 0,
    }

    if (type === "move" && x != null && y != null && distance != null) {
      const magnitude = Math.min(1, Math.sqrt(x * x + y * y))
      const normalizedX = magnitude > 0 ? x / magnitude : 0
      const normalizedY = magnitude > 0 ? y / magnitude : 0

      newState.vectorX = normalizedX
      newState.vectorY = normalizedY
      newState.magnitude = magnitude

      const threshold = 0.2
      newState.up = normalizedY < -threshold
      newState.down = normalizedY > threshold
      newState.left = normalizedX < -threshold
      newState.right = normalizedX > threshold
    }

    this.inputState.movement = newState
    this.notifyStateChange()
  }

  handleAimingJoystick(event: IJoystickUpdateEvent) {
    const { type, x, y, distance } = event

    // Add debugging
    this.logDebug("AIMING", `Joystick event: ${type}, distance: ${distance}, active: ${this.inputState.aiming.active}`)

    if (type === "stop") {
      // If the joystick was active, trigger a shot on release.
      if (this.inputState.aiming.active) {
        this.logDebug("AIMING", "Triggering shot on joystick release")
        this.inputState.actions.shoot = true
      }
      this.inputState.aiming = { active: false, angle: 0, power: 0 }
      this.notifyStateChange()

      // Reset the shoot action after a longer delay to ensure it's processed
      setTimeout(() => {
        if (this.inputState.actions.shoot) {
          this.inputState.actions.shoot = false
          this.logDebug("AIMING", "Resetting shoot action")
          this.notifyStateChange()
        }
      }, 100) // Increased from 50ms to 100ms
    } else if (type === "start" || (type === "move" && x != null && y != null && distance != null)) {
      // Only process if we have valid coordinates and distance
      if (distance > 5) {
        // Add minimum distance threshold to prevent jitter
        const angle = Math.atan2(y, x)
        const power = Math.min(distance / 50, 1) // Assuming joystick size of 100, so radius is 50.

        this.logDebug("AIMING", `Setting aim: angle=${angle.toFixed(2)}, power=${power.toFixed(2)}`)
        this.inputState.aiming = { active: true, angle, power }
        this.notifyStateChange()
      }
    }
  }

  // --- Action Button Handlers (Retained for other actions) ---
  handleActionPress(action: keyof GameInputState["actions"], pressed: boolean) {
    if (this.inputState.actions[action] !== pressed) {
      this.inputState.actions[action] = pressed
      this.notifyStateChange()
    }
  }

  private notifyStateChange() {
    if (this.callbacks.onStateChange) {
      // Create a deep copy to avoid mutation issues in React state
      const stateCopy = JSON.parse(JSON.stringify(this.inputState))
      this.callbacks.onStateChange(stateCopy)
    }
  }

  destroy() {
    if (this.shootingTimeout) {
      clearTimeout(this.shootingTimeout)
      this.shootingTimeout = null
    }
    this.callbacks = {}
    this.logDebug("INPUT", "Game input handler destroyed and callbacks cleared.")
  }
}

export const gameInputHandler = new GameInputHandler()

// --- Desktop Input Handler Function (Retained for compatibility) ---
export interface InputHandlerOptions {
  playerId: string
  gameStateRef: MutableRefObject<any>
  componentIdRef: MutableRefObject<string>
}

export function setupGameInputHandlers({ playerId, gameStateRef, componentIdRef }: InputHandlerOptions) {
  const getPlayer = () => gameStateRef.current?.players?.[playerId]

  const handleMouseMove = (e: MouseEvent) => {
    const player = getPlayer()
    const canvas = document.querySelector("canvas")
    if (!player || !canvas) return
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    player.rotation = Math.atan2(mouseY - player.position.y, mouseX - player.position.x)
  }

  const handleMouseDown = (e: MouseEvent) => {
    const player = getPlayer()
    if (!player) return
    if (e.button === 0) player.controls.shoot = true
    else if (e.button === 2) player.controls.special = true
  }

  const handleMouseUp = (e: MouseEvent) => {
    const player = getPlayer()
    if (!player) return
    if (e.button === 0) player.controls.shoot = false
    else if (e.button === 2) player.controls.special = false
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const player = getPlayer()
    if (!player) return
    switch (e.key.toLowerCase()) {
      case "w":
      case "arrowup":
        player.controls.up = true
        break
      case "s":
      case "arrowdown":
        player.controls.down = true
        break
      case "a":
      case "arrowleft":
        player.controls.left = true
        break
      case "d":
      case "arrowright":
        player.controls.right = true
        break
      case "shift":
        player.controls.dash = true
        break
      case "e":
        player.controls.explosiveArrow = true
        break
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    const player = getPlayer()
    if (!player) return
    switch (e.key.toLowerCase()) {
      case "w":
      case "arrowup":
        player.controls.up = false
        break
      case "s":
      case "arrowdown":
        player.controls.down = false
        break
      case "a":
      case "arrowleft":
        player.controls.left = false
        break
      case "d":
      case "arrowright":
        player.controls.right = false
        break
      case "shift":
        player.controls.dash = false
        break
      case "e":
        player.controls.explosiveArrow = false
        break
    }
  }

  const handleContextMenu = (e: MouseEvent) => e.preventDefault()

  const eventMap = {
    mousemove: handleMouseMove,
    mousedown: handleMouseDown,
    mouseup: handleMouseUp,
    keydown: handleKeyDown,
    keyup: handleKeyUp,
    contextmenu: handleContextMenu,
  }

  Object.entries(eventMap).forEach(([event, handler]) => {
    const target = event.includes("key") ? window : document
    transitionDebugger.safeAddEventListener(target, event, handler, undefined, `${componentIdRef.current}-${event}`)
  })

  return () => {
    Object.keys(eventMap).forEach((event) => {
      transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-${event}`)
    })
  }
}
