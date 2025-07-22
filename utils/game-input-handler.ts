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
  isCharging: boolean // New charging state
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
    onShoot?: (angle: number, power: number) => void
  }
  private shootTimeout: NodeJS.Timeout | null = null
  private maxPowerAchieved = 0 // Track the maximum power during charging
  private hasStartedCharging = false // Track if we've started a charging cycle

  constructor() {
    this.state = {
      aiming: { angle: 0, power: 0, active: false, isCharging: false },
      movement: { up: false, down: false, left: false, right: false },
      actions: { shoot: false, dash: false, special: false, explosiveArrow: false },
    }
    this.callbacks = {}
    debugManager.logInfo("INPUT", "GameInputHandler initialized for joystick controls.")
  }

  setCallbacks(callbacks: {
    onStateChange?: (state: GameInputState) => void
    onShoot?: (angle: number, power: number) => void
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
    // On 'stop', type is 'stop', so newState remains all false, correctly stopping movement.

    this.state.movement = newState
    this.notifyStateChange()
  }

  handleAimingJoystick(event: IJoystickUpdateEvent) {
    const chargingThreshold = 0.2 // Power threshold to start/stop charging
    const distance = event ? event.distance : 0

    // Calculate power based on distance (normalize to 0-1 range)
    const maxDistance = 50 // Assuming max joystick distance
    const currentPower = Math.min(distance / maxDistance, 1)

    // Update angle if we have valid coordinates
    if (event.x !== null && event.y !== null && distance > 0) {
      // Calculate the firing angle (opposite to joystick pull direction)
      const joystickAngle = Math.atan2(event.y, event.x)
      this.state.aiming.angle = joystickAngle + Math.PI
    }

    // Update power
    this.state.aiming.power = currentPower

    console.log(
      `[INPUT_HANDLER] Power: ${currentPower.toFixed(3)}, IsCharging: ${this.state.aiming.isCharging}, HasStarted: ${this.hasStartedCharging}, MaxPower: ${this.maxPowerAchieved.toFixed(3)}`,
    )

    // Charging Logic
    if (currentPower > chargingThreshold) {
      // Power is above threshold
      if (!this.state.aiming.isCharging && !this.hasStartedCharging) {
        // Start charging for the first time
        this.state.aiming.isCharging = true
        this.state.aiming.active = true
        this.hasStartedCharging = true
        this.maxPowerAchieved = currentPower
        console.log("[INPUT_HANDLER] Started charging - Power:", currentPower.toFixed(3))
      } else if (this.state.aiming.isCharging) {
        // Continue charging - update max power achieved
        this.maxPowerAchieved = Math.max(this.maxPowerAchieved, currentPower)
        this.state.aiming.active = true
      }
    } else {
      // Power is below threshold
      if (this.state.aiming.isCharging && this.hasStartedCharging) {
        // We were charging and now power dropped - FIRE!
        console.log(
          "[INPUT_HANDLER] Firing shot - MaxPower:",
          this.maxPowerAchieved.toFixed(3),
          "Angle:",
          this.state.aiming.angle.toFixed(3),
        )

        if (this.callbacks.onShoot) {
          this.callbacks.onShoot(this.state.aiming.angle, this.maxPowerAchieved)
        }

        // Reset all charging states
        this.state.aiming.isCharging = false
        this.state.aiming.active = false
        this.hasStartedCharging = false
        this.maxPowerAchieved = 0
      } else if (!this.hasStartedCharging) {
        // Power is low and we haven't started charging yet - just update states
        this.state.aiming.isCharging = false
        this.state.aiming.active = false
      }
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
      // Create a deep copy to avoid mutation issues in React state
      const stateCopy = JSON.parse(JSON.stringify(this.state))
      this.callbacks.onStateChange(stateCopy)
    }
  }

  destroy() {
    if (this.shootTimeout) {
      clearTimeout(this.shootTimeout)
      this.shootTimeout = null
    }
    this.state = {
      aiming: { angle: 0, power: 0, active: false, isCharging: false },
      movement: { up: false, down: false, left: false, right: false },
      actions: { shoot: false, dash: false, special: false, explosiveArrow: false },
    }
    this.callbacks = {}
    this.maxPowerAchieved = 0
    this.hasStartedCharging = false
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
    if (e.button === 0) {
      player.controls.shoot = true
      // Start drawing bow immediately for desktop
      if (!player.isDrawingBow && player.cooldown <= 0) {
        player.isDrawingBow = true
        player.drawStartTime = Date.now() / 1000
      }
    } else if (e.button === 2) {
      player.controls.special = true
    }
  }

  const handleMouseUp = (e: MouseEvent) => {
    const player = getPlayer()
    if (!player) return
    if (e.button === 0) {
      player.controls.shoot = false
    } else if (e.button === 2) {
      player.controls.special = false
    }
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
