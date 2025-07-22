"use client"

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
    shoot: boolean
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
  private isAiming = false // Tracks if the joystick is pulled past the threshold

  constructor() {
    this.state = {
      aiming: { angle: 0, power: 0, active: false },
      movement: { up: false, down: false, left: false, right: false },
      actions: { shoot: false, dash: false, special: false, explosiveArrow: false },
    }
    this.callbacks = {}
    debugManager.logInfo("INPUT", "GameInputHandler initialized for joystick controls.")
  }

  setCallbacks(callbacks: {
    onStateChange?: (state: GameInputState) => void
  }) {
    this.callbacks = callbacks
  }

  // --- Joystick Handlers ---
  handleMovementJoystick(event: IJoystickUpdateEvent) {
    const { type, x, y } = event
    const threshold = 0.3 // A deadzone for movement detection

    const newState: MovementState = { up: false, down: false, left: false, right: false }

    if (type === "move" && x !== null && y !== null) {
      // Note: react-joystick-component has y-axis with up as positive.
      if (y > threshold) newState.up = true
      if (y < -threshold) newState.down = true
      if (x < -threshold) newState.left = true
      if (x > threshold) newState.right = true
    }

    this.state.movement = newState
    this.notifyStateChange()
  }

  handleAimingJoystick(event: IJoystickUpdateEvent) {
    const threshold = 0.2 // 20% power threshold
    const distance = event ? event.distance : 0
    const maxDistance = 50 // Assumed max radius of joystick
    const currentPower = Math.min(distance / maxDistance, 1)

    if (currentPower > threshold) {
      // Joystick is pulled back - INITIATE SHOT
      if (!this.isAiming) {
        this.isAiming = true
        this.state.actions.shoot = true // Mimics mouse down
        console.log("[InputHandler] Joystick pulled: Initiating shot (shoot: true)")
      }

      // Update aiming angle and power
      if (event.x !== null && event.y !== null) {
        const joystickAngle = Math.atan2(event.y, event.x)
        this.state.aiming.angle = joystickAngle + Math.PI // Fire opposite to pull
      }
      this.state.aiming.power = currentPower
      this.state.aiming.active = true
    } else {
      // Joystick is released - FIRE SHOT
      if (this.isAiming) {
        this.isAiming = false
        this.state.actions.shoot = false // Mimics mouse up
        console.log("[InputHandler] Joystick released: Firing shot (shoot: false)")
      }
      this.state.aiming.active = false
      this.state.aiming.power = 0
    }

    this.notifyStateChange()
  }

  // --- Action Button Handlers ---
  handleActionPress(action: keyof GameInputState["actions"], pressed: boolean) {
    if (this.state.actions[action] !== pressed) {
      this.state.actions[action] = pressed
      this.notifyStateChange()
    }
  }

  private notifyStateChange() {
    if (this.callbacks.onStateChange) {
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
    this.isAiming = false
    debugManager.logInfo("INPUT", "Game input handler destroyed and callbacks cleared.")
  }
}

export const gameInputHandler = new GameInputHandler()

// --- Desktop Input Handler Function ---
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
