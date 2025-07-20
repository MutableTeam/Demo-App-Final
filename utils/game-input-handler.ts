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

export class GameInputHandler {
  constructor() {}

  destroy() {
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
