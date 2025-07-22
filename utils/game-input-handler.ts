import { debugManager } from "./debug-utils"
import type React from "react"
import transitionDebugger from "@/utils/transition-debug"
import type { IJoystickUpdateEvent } from "react-joystick-component"

// --- Interfaces for Mobile Input ---
export interface AimingState {
  angle: number // degrees
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
      actions: { dash: false, special: false, explosiveArrow: false },
    }
    this.callbacks = {}
    debugManager.logInfo("INPUT", "GameInputHandler initialized.")
  }

  setCallbacks(callbacks: { onStateChange?: (state: GameInputState) => void }) {
    this.callbacks = callbacks
  }

  // --- Joystick Handlers ---
  handleMovement(event: IJoystickUpdateEvent) {
    const newMovementState: MovementState = {
      up: event.direction === "FORWARD",
      down: event.direction === "BACKWARD",
      left: event.direction === "LEFT",
      right: event.direction === "RIGHT",
    }
    if (JSON.stringify(this.state.movement) !== JSON.stringify(newMovementState)) {
      this.state.movement = newMovementState
      this.notifyStateChange()
    }
  }

  handleMovementStop() {
    this.state.movement = { up: false, down: false, left: false, right: false }
    this.notifyStateChange()
  }

  handleAim(event: IJoystickUpdateEvent) {
    if (event.x === null || event.y === null || event.distance === null) return
    // Convert joystick coords to angle in degrees
    const angle = Math.atan2(event.y, event.x) * (180 / Math.PI)
    const power = Math.min(event.distance / 50, 1) // 50 is half the joystick size

    this.state.aiming = {
      angle: angle,
      power: power,
      active: true,
    }
    this.notifyStateChange()
  }

  handleAimStart() {
    this.state.aiming.active = true
    this.notifyStateChange()
  }

  handleAimStop() {
    this.state.aiming.active = false
    this.notifyStateChange()
  }

  // --- Action Button Handler ---
  handleActionPress(action: keyof GameInputState["actions"], pressed: boolean) {
    if (this.state.actions[action] !== pressed) {
      this.state.actions[action] = pressed
      this.notifyStateChange()
    }
  }

  private notifyStateChange() {
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange({ ...this.state })
    }
  }

  destroy() {
    this.state = {
      aiming: { angle: 0, power: 0, active: false },
      movement: { up: false, down: false, left: false, right: false },
      actions: { dash: false, special: false, explosiveArrow: false },
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
