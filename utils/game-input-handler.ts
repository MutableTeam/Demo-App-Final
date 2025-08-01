import type { EventData } from "nipplejs"
import type { React } from "react"

export interface GameInputState {
  movement: {
    up: boolean
    down: boolean
    left: boolean
    right: boolean
  }
  aiming: {
    active: boolean
    angle: number
    power: number
  }
  actions: {
    shoot: boolean
    dash: boolean
    special: boolean
    explosiveArrow: boolean
  }
}

class GameInputHandler {
  private state: GameInputState = {
    movement: { up: false, down: false, left: false, right: false },
    aiming: { active: false, angle: 0, power: 0 },
    actions: { shoot: false, dash: false, special: false, explosiveArrow: false },
  }

  private callbacks: { onStateChange?: (state: GameInputState) => void } = {}

  setCallbacks(callbacks: { onStateChange?: (state: GameInputState) => void }) {
    this.callbacks = callbacks
  }

  private notifyStateChange() {
    if (this.callbacks.onStateChange) {
      // Create a deep copy to prevent unintended mutations
      const stateCopy = JSON.parse(JSON.stringify(this.state))
      this.callbacks.onStateChange(stateCopy)
    }
  }

  // NippleJS Movement Handlers
  handleNippleMovement(data: EventData) {
    if (data.angle) {
      const angle = data.angle.degree
      const movement = { up: false, down: false, left: false, right: false }

      // 8-way direction detection
      if (angle > 337.5 || angle <= 22.5) {
        // Right
        movement.right = true
      } else if (angle > 22.5 && angle <= 67.5) {
        // Up-Right
        movement.up = true
        movement.right = true
      } else if (angle > 67.5 && angle <= 112.5) {
        // Up
        movement.up = true
      } else if (angle > 112.5 && angle <= 157.5) {
        // Up-Left
        movement.up = true
        movement.left = true
      } else if (angle > 157.5 && angle <= 202.5) {
        // Left
        movement.left = true
      } else if (angle > 202.5 && angle <= 247.5) {
        // Down-Left
        movement.down = true
        movement.left = true
      } else if (angle > 247.5 && angle <= 292.5) {
        // Down
        movement.down = true
      } else if (angle > 292.5 && angle <= 337.5) {
        // Down-Right
        movement.down = true
        movement.right = true
      }
      this.state.movement = movement
    }
    this.notifyStateChange()
  }

  handleNippleMovementEnd() {
    this.state.movement = { up: false, down: false, left: false, right: false }
    this.notifyStateChange()
  }

  // NippleJS Aiming Handlers
  handleNippleAimingStart() {
    this.state.aiming.active = true
    this.state.actions.shoot = true // Start charging the bow
    this.notifyStateChange()
  }

  handleNippleAiming(data: EventData) {
    if (data.angle) {
      // Invert Y-axis by negating the angle in radians for correct aiming
      this.state.aiming.angle = -data.angle.radian
      this.state.aiming.power = Math.min(data.force, 1.0) // Cap power at 1
    }
    this.notifyStateChange()
  }

  handleNippleAimingEnd() {
    // The game engine will handle firing the arrow on shoot=false
    this.state.aiming.active = false
    this.state.actions.shoot = false
    this.notifyStateChange()
  }

  // Action Button Handlers
  handleButtonPress(action: "dash" | "special" | "shoot" | "explosiveArrow") {
    console.log(`[GameInputHandler] Button pressed: ${action}`)
    if (this.state.actions[action] !== undefined) {
      this.state.actions[action] = true
      this.notifyStateChange()
    }
  }

  handleButtonRelease(action: "dash" | "special" | "shoot" | "explosiveArrow") {
    console.log(`[GameInputHandler] Button released: ${action}`)
    if (this.state.actions[action] !== undefined) {
      this.state.actions[action] = false
      this.notifyStateChange()
    }
  }

  // Add destroy method for cleanup
  destroy() {
    this.callbacks = {}
    this.state = {
      movement: { up: false, down: false, left: false, right: false },
      aiming: { active: false, angle: 0, power: 0 },
      actions: { shoot: false, dash: false, special: false, explosiveArrow: false },
    }
  }
}

export const gameInputHandler = new GameInputHandler()

// Desktop input handlers setup function
export function setupGameInputHandlers({
  playerId,
  gameStateRef,
  componentIdRef,
}: {
  playerId: string
  gameStateRef: React.MutableRefObject<any>
  componentIdRef: React.MutableRefObject<string>
}) {
  const handleKeyDown = (e: KeyboardEvent) => {
    const player = gameStateRef.current.players[playerId]
    if (!player || !player.controls) return

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
      case "q":
        player.controls.special = true
        break
      case " ":
        e.preventDefault()
        player.controls.shoot = true
        break
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    const player = gameStateRef.current.players[playerId]
    if (!player || !player.controls) return

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
      case "q":
        player.controls.special = false
        break
      case " ":
        e.preventDefault()
        player.controls.shoot = false
        break
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    const player = gameStateRef.current.players[playerId]
    const canvas = document.querySelector("canvas")
    if (!player || !canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const mouseX = (e.clientX - rect.left) * scaleX
    const mouseY = (e.clientY - rect.top) * scaleY

    player.rotation = Math.atan2(mouseY - player.position.y, mouseX - player.position.x)
  }

  const handleMouseDown = (e: MouseEvent) => {
    const player = gameStateRef.current.players[playerId]
    if (!player || !player.controls) return
    if (e.button === 0) player.controls.shoot = true
    if (e.button === 2) player.controls.special = true
  }

  const handleMouseUp = (e: MouseEvent) => {
    const player = gameStateRef.current.players[playerId]
    if (!player || !player.controls) return
    if (e.button === 0) player.controls.shoot = false
    if (e.button === 2) player.controls.special = false
  }

  const handleContextMenu = (e: MouseEvent) => e.preventDefault()

  window.addEventListener("keydown", handleKeyDown)
  window.addEventListener("keyup", handleKeyUp)
  window.addEventListener("mousemove", handleMouseMove)
  window.addEventListener("mousedown", handleMouseDown)
  window.addEventListener("mouseup", handleMouseUp)
  window.addEventListener("contextmenu", handleContextMenu)

  return () => {
    window.removeEventListener("keydown", handleKeyDown)
    window.removeEventListener("keyup", handleKeyUp)
    window.removeEventListener("mousemove", handleMouseMove)
    window.removeEventListener("mousedown", handleMouseDown)
    window.removeEventListener("mouseup", handleMouseUp)
    window.removeEventListener("contextmenu", handleContextMenu)
  }
}
