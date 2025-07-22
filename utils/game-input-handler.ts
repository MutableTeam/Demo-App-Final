import { debugManager } from "./debug-utils"
import type React from "react"
import transitionDebugger from "@/utils/transition-debug"

// --- Interfaces for Mobile Input ---
export interface AimingState {
  angle: number // radians
  power: number // 0 to 1
  active: boolean
  touchId: number | null
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
    onShoot?: (angle: number, power: number) => void
  }
  private aimStartPos: { x: number; y: number } | null = null

  constructor() {
    this.state = {
      aiming: { angle: 0, power: 0, active: false, touchId: null },
      movement: { up: false, down: false, left: false, right: false },
      actions: { dash: false, special: false, explosiveArrow: false },
    }
    this.callbacks = {}
    debugManager.logInfo("INPUT", "GameInputHandler initialized for mobile touch controls.")
  }

  setCallbacks(callbacks: {
    onStateChange?: (state: GameInputState) => void
    onShoot?: (angle: number, power: number) => void
  }) {
    this.callbacks = callbacks
  }

  handleJoystickMove(x: number, y: number) {
    const deadzone = 0.2
    const normalizedX = Math.max(-1, Math.min(1, x / 50))
    const normalizedY = Math.max(-1, Math.min(1, -y / 50)) // Y is inverted
    const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY)

    if (distance < deadzone) {
      this.state.movement = { up: false, down: false, left: false, right: false }
    } else {
      const threshold = 0.3
      this.state.movement = {
        up: normalizedY > threshold,
        down: normalizedY < -threshold,
        left: normalizedX < -threshold,
        right: normalizedX > threshold,
      }
    }
    this.notifyStateChange()
  }

  handleJoystickStop() {
    this.state.movement = { up: false, down: false, left: false, right: false }
    this.notifyStateChange()
  }

  handleAimTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    e.preventDefault()
    const touch = e.changedTouches[0]
    if (!touch || this.state.aiming.active) return

    this.state.aiming = { angle: 0, power: 0, active: true, touchId: touch.identifier }
    this.aimStartPos = { x: touch.clientX, y: touch.clientY }
    debugManager.logDebug("INPUT", "Aiming started", { touchId: touch.identifier })
    this.notifyStateChange()
  }

  handleAimTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    e.preventDefault()
    if (!this.state.aiming.active || this.state.aiming.touchId === null || !this.aimStartPos) return

    const touch = Array.from(e.touches).find((t) => t.identifier === this.state.aiming.touchId)
    if (!touch) return

    const deltaX = this.aimStartPos.x - touch.clientX
    const deltaY = this.aimStartPos.y - touch.clientY

    const angle = Math.atan2(deltaY, deltaX)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const maxDistance = 100 // pixels
    const power = Math.min(distance / maxDistance, 1)

    this.state.aiming.angle = angle
    this.state.aiming.power = power
    this.notifyStateChange()
  }

  handleAimTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    e.preventDefault()
    if (!this.state.aiming.active || this.state.aiming.touchId === null) return

    const touch = Array.from(e.changedTouches).find((t) => t.identifier === this.state.aiming.touchId)
    if (!touch) return

    if (this.callbacks.onShoot && this.state.aiming.power > 0.1) {
      this.callbacks.onShoot(this.state.aiming.angle, this.state.aiming.power)
    }

    this.state.aiming = { angle: 0, power: 0, active: false, touchId: null }
    this.aimStartPos = null
    debugManager.logDebug("INPUT", "Shot fired via touch")
    this.notifyStateChange()
  }

  handleActionPress(action: keyof GameInputState["actions"], pressed: boolean) {
    this.state.actions[action] = pressed
    debugManager.logDebug("INPUT", `Action button: ${action}, pressed: ${pressed}`)
    this.notifyStateChange()
  }

  private notifyStateChange() {
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.state)
    }
  }

  destroy() {
    this.state = {
      aiming: { angle: 0, power: 0, active: false, touchId: null },
      movement: { up: false, down: false, left: false, right: false },
      actions: { dash: false, special: false, explosiveArrow: false },
    }
    this.callbacks = {}
    this.aimStartPos = null
    debugManager.logInfo("INPUT", "Game input handler destroyed")
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
