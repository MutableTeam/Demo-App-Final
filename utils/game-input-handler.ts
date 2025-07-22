import { debugManager } from "./debug-utils"
import type React from "react"
import transitionDebugger from "@/utils/transition-debug"
import type { IJoystickUpdateEvent } from "react-joystick-component"

// --- Interfaces for Mobile Input ---
export interface AimingState {
  angle: number // radians
  power: number // 0 to 1
  active: boolean
}

export interface MovementState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

export interface GameInputState {
  aiming: AimingState
  movement: MovementState
  actions: {
    shoot: boolean // Added for joystick release shooting
    dash: boolean
    special: boolean
    explosiveArrow: boolean
  }
}

// --- Mobile Input Handler Class ---
class GameInputHandler {
  private state: GameInputState
  private callbacks: {
    onStateChange?: (state: GameInputState) => void
  }

  constructor() {
    this.state = {
      aiming: { angle: 0, power: 0, active: false },
      movement: { up: false, down: false, left: false, right: false },
      actions: { shoot: false, dash: false, special: false, explosiveArrow: false },
    }
    this.callbacks = {}
    debugManager.logInfo("INPUT", "GameInputHandler initialized for joystick controls.")
  }

  setCallbacks(callbacks: { onStateChange?: (state: GameInputState) => void }) {
    this.callbacks = callbacks
  }

  // --- Joystick Handlers ---
  handleMovementJoystick(event: IJoystickUpdateEvent) {
    const { type, direction } = event
    const newState: MovementState = { up: false, down: false, left: false, right: false }

    if (type === "move" && direction) {
      if (direction === "FORWARD") newState.up = true
      if (direction === "BACKWARD") newState.down = true
      if (direction === "LEFT") newState.left = true
      if (direction === "RIGHT") newState.right = true
    }
    // On 'stop', newState remains all false, correctly stopping movement.

    this.state.movement = newState
    this.notifyStateChange()
  }

  handleAimingJoystick(event: IJoystickUpdateEvent) {
    const { type, x, y, distance } = event

    // Add debugging
    debugManager.logInfo(
      "AIMING",
      `Joystick event: ${type}, distance: ${distance}, active: ${this.state.aiming.active}`,
    )

    if (type === "stop") {
      // If the joystick was active, trigger a shot on release.
      if (this.state.aiming.active) {
        debugManager.logInfo("AIMING", "Triggering shot on joystick release")
        this.state.actions.shoot = true
      }
      this.state.aiming = { active: false, angle: 0, power: 0 }
      this.notifyStateChange()

      // Reset the shoot action after a longer delay to ensure it's processed
      setTimeout(() => {
        if (this.state.actions.shoot) {
          this.state.actions.shoot = false
          debugManager.logInfo("AIMING", "Resetting shoot action")
          this.notifyStateChange()
        }
      }, 100) // Increased from 50ms to 100ms
    } else if (type === "start" || (type === "move" && x != null && y != null && distance != null)) {
      // Only process if we have valid coordinates and distance
      if (distance > 5) {
        // Add minimum distance threshold to prevent jitter
        const angle = Math.atan2(y, x)
        const power = Math.min(distance / 50, 1) // Assuming joystick size of 100, so radius is 50.

        debugManager.logInfo("AIMING", `Setting aim: angle=${angle.toFixed(2)}, power=${power.toFixed(2)}`)
        this.state.aiming = { active: true, angle, power }
        this.notifyStateChange()
      }
    }
  }

  // --- Action Button Handlers (Retained for other actions) ---
  handleActionPress(action: keyof GameInputState["actions"], pressed: boolean) {
    if (this.state.actions[action] !== pressed) {
      this.state.actions[action] = pressed
      this.notifyStateChange()
    }
  }

  private notifyStateChange() {
    if (this.callbacks.onStateChange) {
      // Create a deep copy to avoid mutation issues in React state
      const stateCopy = JSON.parse(JSON.stringify(this.state))
      this.callbacks.onStateChange(stateCopy)
    }
  }

  destroy() {
    this.state = {
      aiming: { angle: 0, power: 0, active: false },
      movement: { up: false, down: false, left: false, right: false },
      actions: { shoot: false, dash: false, special: false, explosiveArrow: false },
    }
    this.callbacks = {}
    debugManager.logInfo("INPUT", "Game input handler destroyed and callbacks cleared.")
  }
}

export const gameInputHandler = new GameInputHandler()

// --- Desktop Input Handler Function (Retained for compatibility) ---
export interface InputHandlerOptions {
  playerId: string
  gameStateRef: React.MutableRefObject<any>
  componentIdRef: React.MutableRefObject<string>
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
