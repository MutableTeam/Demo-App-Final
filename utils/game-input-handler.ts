import { debugManager } from "./debug-utils"
import type React from "react"
import transitionDebugger from "@/utils/transition-debug"
import { audioManager } from "@/utils/audio-manager"

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

  // Called by the Joystick component
  handleJoystickMove(x: number, y: number) {
    const deadzone = 0.2
    const normalizedX = Math.max(-1, Math.min(1, x / 50))
    const normalizedY = Math.max(-1, Math.min(1, y / 50))
    const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY)

    if (distance < deadzone) {
      this.state.movement = { ...this.state.movement, up: false, down: false, left: false, right: false }
    } else {
      const threshold = 0.3
      this.state.movement = {
        ...this.state.movement,
        up: normalizedY > threshold,
        down: normalizedY < -threshold,
        left: normalizedX < -threshold,
        right: normalizedX > threshold,
      }
    }
    this.notifyStateChange()
  }

  handleJoystickStop() {
    this.state.movement = { ...this.state.movement, up: false, down: false, left: false, right: false }
    this.notifyStateChange()
  }

  // Called by the invisible aiming pad
  handleAimTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    e.preventDefault()
    const touch = e.changedTouches[0]
    if (!touch || this.state.aiming.active) return

    this.state.aiming = {
      angle: 0,
      power: 0,
      active: true,
      touchId: touch.identifier,
    }
    debugManager.logDebug("INPUT", "Aiming started", { touchId: touch.identifier })
    this.notifyStateChange()
  }

  handleAimTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    e.preventDefault()
    if (!this.state.aiming.active || this.state.aiming.touchId === null) return

    const touch = Array.from(e.touches).find((t) => t.identifier === this.state.aiming.touchId)
    const startTouch = Array.from(e.targetTouches).find((t) => t.identifier === this.state.aiming.touchId)

    if (!touch || !startTouch) return

    // Dragging back from start position
    const deltaX = startTouch.clientX - touch.clientX
    const deltaY = startTouch.clientY - touch.clientY

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

    // Fire the shot
    if (this.callbacks.onShoot && this.state.aiming.power > 0.1) {
      this.callbacks.onShoot(this.state.aiming.angle, this.state.aiming.power)
    }

    // Reset aiming state
    this.state.aiming = { angle: 0, power: 0, active: false, touchId: null }
    debugManager.logDebug("INPUT", "Shot fired via touch")
    this.notifyStateChange()
  }

  // Called by action buttons
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

  public getState = (): GameInputState => {
    return this.state
  }

  destroy() {
    this.state = {
      aiming: { angle: 0, power: 0, active: false, touchId: null },
      movement: { up: false, down: false, left: false, right: false },
      actions: { dash: false, special: false, explosiveArrow: false },
    }
    this.callbacks = {}
    debugManager.logInfo("INPUT", "Game input handler destroyed")
  }
}

export const gameInputHandler = new GameInputHandler()

// --- Desktop Input Handler Function (Restored) ---
export interface InputHandlerOptions {
  playerId: string
  gameStateRef: React.MutableRefObject<any>
  componentIdRef: React.MutableRefObject<string>
  onMouseMove?: (e: MouseEvent, player: any) => void
  onMouseDown?: (e: MouseEvent, player: any) => void
  onMouseUp?: (e: MouseEvent, player: any) => void
  onKeyDown?: (e: KeyboardEvent, player: any) => void
  onKeyUp?: (e: KeyboardEvent, player: any) => void
}

export function setupGameInputHandlers({
  playerId,
  gameStateRef,
  componentIdRef,
  onMouseMove,
  onMouseDown,
  onMouseUp,
  onKeyDown,
  onKeyUp,
}: InputHandlerOptions) {
  const defaultMouseMove = (e: MouseEvent) => {
    if (!gameStateRef.current?.players?.[playerId]) return
    const player = gameStateRef.current.players[playerId]
    const canvas = document.querySelector("canvas")
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const dx = mouseX - player.position.x
    const dy = mouseY - player.position.y
    player.rotation = Math.atan2(dy, dx)
    if (onMouseMove) onMouseMove(e, player)
  }

  const defaultMouseDown = (e: MouseEvent) => {
    if (!gameStateRef.current?.players?.[playerId]) return
    const player = gameStateRef.current.players[playerId]
    if (e.button === 0) player.controls.shoot = true
    else if (e.button === 2) player.controls.special = true
    if (onMouseDown) onMouseDown(e, player)
  }

  const defaultMouseUp = (e: MouseEvent) => {
    if (!gameStateRef.current?.players?.[playerId]) return
    const player = gameStateRef.current.players[playerId]
    if (e.button === 0) player.controls.shoot = false
    else if (e.button === 2) player.controls.special = false
    if (onMouseUp) onMouseUp(e, player)
  }

  const defaultKeyDown = (e: KeyboardEvent) => {
    if (!gameStateRef.current?.players?.[playerId]) return
    const player = gameStateRef.current.players[playerId]
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
    }
    if (onKeyDown) onKeyDown(e, player)
  }

  const defaultKeyUp = (e: KeyboardEvent) => {
    if (!gameStateRef.current?.players?.[playerId]) return
    const player = gameStateRef.current.players[playerId]
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
    }
    if (onKeyUp) onKeyUp(e, player)
  }

  const handleContextMenu = (e: MouseEvent) => e.preventDefault()

  transitionDebugger.safeAddEventListener(
    window,
    "keydown",
    defaultKeyDown,
    undefined,
    `${componentIdRef.current}-game-keydown`,
  )
  transitionDebugger.safeAddEventListener(
    window,
    "keyup",
    defaultKeyUp,
    undefined,
    `${componentIdRef.current}-game-keyup`,
  )
  transitionDebugger.safeAddEventListener(
    document,
    "mousemove",
    defaultMouseMove,
    undefined,
    `${componentIdRef.current}-mousemove`,
  )
  transitionDebugger.safeAddEventListener(
    document,
    "mousedown",
    defaultMouseDown,
    undefined,
    `${componentIdRef.current}-mousedown`,
  )
  transitionDebugger.safeAddEventListener(
    document,
    "mouseup",
    defaultMouseUp,
    undefined,
    `${componentIdRef.current}-mouseup`,
  )
  transitionDebugger.safeAddEventListener(
    document,
    "contextmenu",
    handleContextMenu,
    undefined,
    `${componentIdRef.current}-contextmenu`,
  )

  const resumeAudio = () => audioManager.resumeAudioContext()
  transitionDebugger.safeAddEventListener(
    document,
    "click",
    resumeAudio,
    undefined,
    `${componentIdRef.current}-resume-audio`,
  )

  return () => {
    transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-game-keydown`)
    transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-game-keyup`)
    transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-mousemove`)
    transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-mousedown`)
    transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-mouseup`)
    transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-contextmenu`)
    transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-resume-audio`)
  }
}
