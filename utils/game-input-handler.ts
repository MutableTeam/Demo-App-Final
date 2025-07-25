"use client"

import { debugManager } from "./debug-utils"
import type React from "react"
import transitionDebugger from "@/utils/transition-debug"

// --- Interfaces for NippleJS Data ---
interface NippleData {
  angle: {
    radian: number
    degree: number
  }
  force: number
}

// --- Interfaces for Game Input State ---
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
      actions: { shoot: false, dash: false, explosiveArrow: false },
    }
    this.callbacks = {}
    debugManager.logInfo("INPUT", "GameInputHandler initialized.")
  }

  setCallbacks(callbacks: { onStateChange?: (state: GameInputState) => void }) {
    this.callbacks = callbacks
  }

  // --- NippleJS Handlers ---
  handleNippleMovement(data: NippleData) {
    const { force, angle } = data
    const newState: MovementState = { up: false, down: false, left: false, right: false }

    if (force > 0.1) {
      // deadzone
      const degree = angle.degree
      if (degree >= 45 && degree < 135) newState.up = true
      if (degree >= 225 && degree < 315) newState.down = true
      if (degree >= 135 && degree < 225) newState.left = true
      if (degree >= 315 || degree < 45) newState.right = true
    }

    this.state.movement = newState
    this.notifyStateChange()
  }

  handleNippleAimingStart() {
    this.state.actions.shoot = true
    this.state.aiming.active = true
    this.notifyStateChange()
  }

  handleNippleAimingMove(data: NippleData) {
    const { angle, force } = data
    this.state.aiming.angle = angle.radian
    this.state.aiming.power = force
    this.state.aiming.active = true
    this.state.actions.shoot = true // Keep shoot active while aiming
    this.notifyStateChange()
  }

  handleNippleAimingEnd() {
    this.state.actions.shoot = false // Signal to fire
    this.state.aiming.active = false
    this.state.aiming.power = 0
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
      // Deep copy to prevent mutations from propagating unexpectedly.
      const stateCopy = JSON.parse(JSON.stringify(this.state))
      this.callbacks.onStateChange(stateCopy)
    }
  }

  destroy() {
    this.state = {
      aiming: { angle: 0, power: 0, active: false },
      movement: { up: false, down: false, left: false, right: false },
      actions: { shoot: false, dash: false, explosiveArrow: false },
    }
    this.callbacks = {}
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
    // Scale mouse coordinates to match canvas resolution
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const mouseX = (e.clientX - rect.left) * scaleX
    const mouseY = (e.clientY - rect.top) * scaleY

    player.rotation = Math.atan2(mouseY - player.position.y, mouseX - player.position.x)
  }

  const handleMouseDown = (e: MouseEvent) => {
    const player = getPlayer()
    if (!player) return
    if (e.button === 0) player.controls.shoot = true
  }

  const handleMouseUp = (e: MouseEvent) => {
    const player = getPlayer()
    if (!player) return
    if (e.button === 0) player.controls.shoot = false
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
