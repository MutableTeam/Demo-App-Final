import type React from "react"
import transitionDebugger from "@/utils/transition-debug"
import { audioManager } from "@/utils/audio-manager"
import { debugManager } from "./debug-utils"

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

export interface TouchPoint {
  id: number
  x: number
  y: number
  startX: number
  startY: number
  startTime: number
}

export interface JoystickState {
  x: number // -1 to 1
  y: number // -1 to 1
  active: boolean
}

export interface AimingState {
  angle: number // radians
  power: number // 0 to 1
  active: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
}

export interface GameInputState {
  joystick: JoystickState
  aiming: AimingState
  actions: {
    dash: boolean
    special: boolean
    shoot: boolean
  }
  touchPoints: Map<number, TouchPoint>
}

export class GameInputHandler {
  private state: GameInputState
  private callbacks: {
    onJoystickMove?: (state: JoystickState) => void
    onAiming?: (state: AimingState) => void
    onAction?: (action: string, pressed: boolean) => void
    onShoot?: () => void
  }

  constructor() {
    this.state = {
      joystick: { x: 0, y: 0, active: false },
      aiming: { angle: 0, power: 0, active: false, startX: 0, startY: 0, currentX: 0, currentY: 0 },
      actions: { dash: false, special: false, shoot: false },
      touchPoints: new Map(),
    }
    this.callbacks = {}
  }

  setCallbacks(callbacks: {
    onJoystickMove?: (state: JoystickState) => void
    onAiming?: (state: AimingState) => void
    onAction?: (action: string, pressed: boolean) => void
    onShoot?: () => void
  }) {
    this.callbacks = callbacks
  }

  // Handle joystick input from react-joystick-component
  handleJoystickMove(event: any) {
    if (event) {
      // Normalize the joystick values (-100 to 100) to (-1 to 1)
      const normalizedX = event.x ? event.x / 100 : 0
      const normalizedY = event.y ? event.y / 100 : 0

      this.state.joystick = {
        x: normalizedX,
        y: normalizedY,
        active: Math.abs(normalizedX) > 0.1 || Math.abs(normalizedY) > 0.1,
      }

      if (this.callbacks.onJoystickMove) {
        this.callbacks.onJoystickMove(this.state.joystick)
      }

      debugManager.logDebug("INPUT", "Joystick moved", {
        x: normalizedX,
        y: normalizedY,
        active: this.state.joystick.active,
      })
    }
  }

  handleJoystickStop() {
    this.state.joystick = { x: 0, y: 0, active: false }

    if (this.callbacks.onJoystickMove) {
      this.callbacks.onJoystickMove(this.state.joystick)
    }

    debugManager.logDebug("INPUT", "Joystick stopped")
  }

  // Handle touch-based aiming
  handleTouchStart(e: TouchEvent, element: HTMLElement) {
    e.preventDefault()

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      const rect = element.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      const touchPoint: TouchPoint = {
        id: touch.identifier,
        x,
        y,
        startX: x,
        startY: y,
        startTime: Date.now(),
      }

      this.state.touchPoints.set(touch.identifier, touchPoint)

      // Start aiming if this is the first touch
      if (this.state.touchPoints.size === 1) {
        this.state.aiming = {
          angle: 0,
          power: 0,
          active: true,
          startX: x,
          startY: y,
          currentX: x,
          currentY: y,
        }

        debugManager.logDebug("INPUT", "Aiming started", { x, y })
      }
    }
  }

  handleTouchMove(e: TouchEvent, element: HTMLElement) {
    e.preventDefault()

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      const touchPoint = this.state.touchPoints.get(touch.identifier)

      if (!touchPoint) continue

      const rect = element.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      // Update touch point
      touchPoint.x = x
      touchPoint.y = y

      // Update aiming if this is the active touch
      if (this.state.aiming.active && this.state.touchPoints.size === 1) {
        this.state.aiming.currentX = x
        this.state.aiming.currentY = y

        // Calculate angle and power
        const deltaX = x - this.state.aiming.startX
        const deltaY = y - this.state.aiming.startY
        const angle = Math.atan2(deltaY, deltaX)
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        const maxDistance = 100 // Maximum aiming distance
        const power = Math.min(distance / maxDistance, 1)

        this.state.aiming.angle = angle
        this.state.aiming.power = power

        if (this.callbacks.onAiming) {
          this.callbacks.onAiming(this.state.aiming)
        }

        debugManager.logDebug("INPUT", "Aiming updated", {
          angle: angle * (180 / Math.PI), // Convert to degrees for logging
          power,
          distance,
        })
      }
    }
  }

  handleTouchEnd(e: TouchEvent) {
    e.preventDefault()

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      const touchPoint = this.state.touchPoints.get(touch.identifier)

      if (!touchPoint) continue

      // Check if this was an aiming touch
      if (this.state.aiming.active && this.state.touchPoints.size === 1) {
        // Fire the shot
        if (this.callbacks.onShoot) {
          this.callbacks.onShoot()
        }

        this.state.aiming.active = false
        debugManager.logDebug("INPUT", "Shot fired", {
          angle: this.state.aiming.angle * (180 / Math.PI),
          power: this.state.aiming.power,
        })
      }

      // Remove touch point
      this.state.touchPoints.delete(touch.identifier)
    }
  }

  // Handle action button presses
  handleActionPress(action: string, pressed: boolean) {
    switch (action) {
      case "dash":
        this.state.actions.dash = pressed
        break
      case "special":
        this.state.actions.special = pressed
        break
      case "shoot":
        this.state.actions.shoot = pressed
        break
    }

    if (this.callbacks.onAction) {
      this.callbacks.onAction(action, pressed)
    }

    debugManager.logDebug("INPUT", "Action button", { action, pressed })
  }

  // Get current input state
  getState(): GameInputState {
    return { ...this.state }
  }

  // Convert input state to game controls
  toGameControls() {
    return {
      up: this.state.joystick.y < -0.3,
      down: this.state.joystick.y > 0.3,
      left: this.state.joystick.x < -0.3,
      right: this.state.joystick.x > 0.3,
      shoot: this.state.actions.shoot,
      special: this.state.actions.special,
      dash: this.state.actions.dash,
      rotation: this.state.aiming.angle,
      drawPower: this.state.aiming.power,
      isDrawingBow: this.state.aiming.active,
    }
  }

  // Clean up
  destroy() {
    this.state.touchPoints.clear()
    this.callbacks = {}
    debugManager.logInfo("INPUT", "Game input handler destroyed")
  }
}

// Export a singleton instance
export const gameInputHandler = new GameInputHandler()

// Legacy function for backward compatibility
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
  // Default handlers
  const defaultMouseMove = (e: MouseEvent) => {
    if (!gameStateRef.current?.players?.[playerId]) return

    const player = gameStateRef.current.players[playerId]
    const canvas = document.querySelector("canvas")
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()

    // Calculate mouse position relative to canvas
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Calculate angle between player and mouse
    const dx = mouseX - player.position.x
    const dy = mouseY - player.position.y
    player.rotation = Math.atan2(dy, dx)

    // Call custom handler if provided
    if (onMouseMove) {
      onMouseMove(e, player)
    }
  }

  const defaultMouseDown = (e: MouseEvent) => {
    if (!gameStateRef.current?.players?.[playerId]) return

    const player = gameStateRef.current.players[playerId]

    if (e.button === 0) {
      // Left click - start drawing bow
      player.controls.shoot = true
    } else if (e.button === 2) {
      // Right click - start charging special attack
      player.controls.special = true
    }

    // Call custom handler if provided
    if (onMouseDown) {
      onMouseDown(e, player)
    }
  }

  const defaultMouseUp = (e: MouseEvent) => {
    if (!gameStateRef.current?.players?.[playerId]) return

    const player = gameStateRef.current.players[playerId]

    if (e.button === 0) {
      // Left click release - fire arrow
      player.controls.shoot = false
    } else if (e.button === 2) {
      // Right click release - fire special attack
      player.controls.special = false
    }

    // Call custom handler if provided
    if (onMouseUp) {
      onMouseUp(e, player)
    }
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

    // Call custom handler if provided
    if (onKeyDown) {
      onKeyDown(e, player)
    }
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

    // Call custom handler if provided
    if (onKeyUp) {
      onKeyUp(e, player)
    }
  }

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault() // Prevent context menu on right click
  }

  // Add event listeners using our safe methods
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

  // Resume audio context on user interaction
  const resumeAudio = () => {
    audioManager.resumeAudioContext()
  }
  transitionDebugger.safeAddEventListener(
    document,
    "click",
    resumeAudio,
    undefined,
    `${componentIdRef.current}-resume-audio`,
  )

  // Return cleanup function
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
