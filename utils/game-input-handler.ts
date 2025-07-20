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
  aiming: AimingState
  actions: {
    shoot: boolean
    dash: boolean
    special: boolean
    explosiveArrow: boolean
  }
  touchPoints: Map<number, TouchPoint>
}

class GameInputHandler {
  private state: GameInputState
  private callbacks: {
    onAiming?: (state: AimingState) => void
    onAction?: (action: string, pressed: boolean) => void
    onShoot?: () => void
  }

  constructor() {
    this.state = {
      aiming: { angle: 0, power: 0, active: false, startX: 0, startY: 0, currentX: 0, currentY: 0 },
      actions: {
        shoot: false,
        dash: false,
        special: false,
        explosiveArrow: false,
      },
      touchPoints: new Map(),
    }
    this.callbacks = {}
    debugManager.logInfo("INPUT", "GameInputHandler created (no joystick support)")
  }

  public handleActionPress = (action: string, pressed: boolean) => {
    debugManager.logDebug("INPUT", `Action button: ${action}, pressed: ${pressed}`)
    switch (action) {
      case "shoot":
        this.state.actions.shoot = pressed
        break
      case "dash":
        this.state.actions.dash = pressed
        break
      case "special":
        this.state.actions.special = pressed
        break
      case "explosive":
        this.state.actions.explosiveArrow = pressed
        break
    }
    if (this.callbacks.onAction) {
      this.callbacks.onAction(action, pressed)
    }
  }

  setCallbacks(callbacks: {
    onAiming?: (state: AimingState) => void
    onAction?: (action: string, pressed: boolean) => void
    onShoot?: () => void
  }) {
    this.callbacks = callbacks
  }

  handleTouchStart(e: TouchEvent, element: HTMLElement) {
    e.preventDefault()
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      const rect = element.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      const touchPoint: TouchPoint = { id: touch.identifier, x, y, startX: x, startY: y, startTime: Date.now() }
      this.state.touchPoints.set(touch.identifier, touchPoint)
      if (this.state.touchPoints.size === 1) {
        this.state.aiming = { angle: 0, power: 0, active: true, startX: x, startY: y, currentX: x, currentY: y }
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
      touchPoint.x = x
      touchPoint.y = y
      if (this.state.aiming.active && this.state.touchPoints.size === 1) {
        this.state.aiming.currentX = x
        this.state.aiming.currentY = y
        const deltaX = x - this.state.aiming.startX
        const deltaY = y - this.state.aiming.startY
        const angle = Math.atan2(deltaY, deltaX)
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        const maxDistance = 100
        const power = Math.min(distance / maxDistance, 1)
        this.state.aiming.angle = angle
        this.state.aiming.power = power
        if (this.callbacks.onAiming) {
          this.callbacks.onAiming(this.state.aiming)
        }
      }
    }
  }

  handleTouchEnd(e: TouchEvent) {
    e.preventDefault()
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      const touchPoint = this.state.touchPoints.get(touch.identifier)
      if (!touchPoint) continue
      if (this.state.aiming.active && this.state.touchPoints.size === 1) {
        if (this.callbacks.onShoot) {
          this.callbacks.onShoot()
        }
        this.state.aiming.active = false
        debugManager.logDebug("INPUT", "Shot fired")
      }
      this.state.touchPoints.delete(touch.identifier)
    }
  }

  public getControls() {
    return { ...this.state.actions }
  }

  public getState = (): GameInputState => {
    return this.state
  }

  destroy() {
    this.state.touchPoints.clear()
    this.callbacks = {}
    debugManager.logInfo("INPUT", "Game input handler destroyed")
  }
}

export const gameInputHandler = new GameInputHandler()

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
