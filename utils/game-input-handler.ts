"use client"

export interface GameInputState \{
  movement: \{
    up: boolean
    down: boolean
    left: boolean
    right: boolean
    vectorX: number
    vectorY: number
    magnitude: number
\}
  aiming: \
{
  active: boolean
  angle: number
  power: number
  \
}
actions:
\
{
  shoot: boolean
  dash: boolean
  special: boolean
  explosiveArrow: boolean
  \
}
\}

interface GameInputCallbacks \{
  onStateChange?: (state: GameInputState) => void
\}

class GameInputHandler \{\
  private state: GameInputState = \{\
    movement: \{\
      up: false,\
      down: false,\
      left: false,\
      right: false,\
      vectorX: 0,\
      vectorY: 0,\
      magnitude: 0,\
    \}
,
    aiming: \
{
  active: false,\
  angle: 0,\
  power: 0,\
  \
}
,
    actions: \
{
  shoot: false,\
  dash: false,\
  special: false,\
  explosiveArrow: false,\
  \
}
,
  \}

  private callbacks: GameInputCallbacks = \
{
  \
}
\
  private shootTimeout: NodeJS.Timeout | null = null
  private isChargingShot = false // Internal state to manage charge cycle

  setCallbacks(callbacks: GameInputCallbacks) \
{
  this.callbacks = callbacks
  \
}
\
  private notifyStateChange() \
{
  if (this.callbacks.onStateChange)
  \
  // Deep copy to prevent mutation issues
  this.callbacks.onStateChange(JSON.parse(JSON.stringify(this.state)))
  \
  \
}
\
  handleMovementJoystick(event: any) \
{
  const deadzone = 0.15
  const threshold = 0.3

  if (!event || event.distance < deadzone)
  \
  // Reset movement when joystick is released or in deadzone
  if (this.state.movement.magnitude > 0)
  \
  \
        this.state.movement = \
  up: false,\
  down: false,\
  left: false,\
  right: false,\
  vectorX: 0,\
  vectorY: 0,\
  magnitude: 0,
        \
  this.notifyStateChange()
  \
  return
  \
  \
  const \{ x, y, distance \} = event
  const magnitude = Math.min(distance / 50, 1) // Assuming joystick size of 100 (radius 50)
  \
    this.state.movement = \
  up: y > threshold,\
  down: y < -threshold, left
  : x < -threshold,
      right: x > threshold,
      vectorX: x / 50,
      vectorY: y / 50,
      magnitude: magnitude,
    \
  this.notifyStateChange()
  \
}

handleAimingJoystick(event: any)
\
{
  const deadzone = 0.2
  const distance = event ? event.distance : 0

  if (distance >= deadzone)
  \
  // Joystick is pulled back
  if (!this.isChargingShot)
  \
  // Start a new charge cycle
  this.isChargingShot = true
  this.state.aiming.active = true
  console.log("[INPUT_HANDLER] Started charging shot.")
  \
  // Continuously update aiming details
  this.state.aiming.angle = Math.atan2(event.y, event.x)
  this.state.aiming.power = Math.min(distance / 50, 1) // Assuming joystick radius of 50
  \
  else \
  // Joystick is in the deadzone or released
  if (this.isChargingShot)
  \
  // If we were charging, fire the shot
  console.log("[INPUT_HANDLER] Joystick released. Firing shot.")
  this.state.actions.shoot = true

  // Pulse the shoot action to be a single-frame event
  if (this.shootTimeout) clearTimeout(this.shootTimeout)
  this.shootTimeout = setTimeout(() => \{
          if (this.state.actions.shoot) \{
            this.state.actions.shoot = false
            this.notifyStateChange()
            console.log("[INPUT_HANDLER] Shoot action pulse reset.")
          \}
        \}, 50)
  \
  // Reset for the next charge cycle
  this.isChargingShot = false
  this.state.aiming.active = false
  this.state.aiming.power = 0
  \

  this.notifyStateChange()
  \
}

handleActionPress(action: keyof GameInputState["actions"], pressed: boolean)
\
{
  if (this.state.actions[action] !== pressed)
  \
  this.state.actions[action] = pressed
  this.notifyStateChange()
  \
  \
}

destroy()
\
{
  if (this.shootTimeout)
  \
  clearTimeout(this.shootTimeout)
  this.shootTimeout = null
  \
  this.callbacks = \
  \
  \
}
\}

export const gameInputHandler = new GameInputHandler()

// Desktop keyboard input setup function
export function setupGameInputHandlers(\{
  playerId,
  gameStateRef,
  componentIdRef,
\}: \
{
  playerId: string
  gameStateRef: React.MutableRefObject<any>
  componentIdRef: React.MutableRefObject<string>
  \
}
) \
{
  const handleKeyDown = (e: KeyboardEvent) => \{
    const player = gameStateRef.current?.players?.[playerId]
    if (!player) return

    switch (e.code) \{
      case "KeyW":
      case "ArrowUp":
        player.controls.up = true
        break
      case "KeyS":
      case "ArrowDown":
        player.controls.down = true
        break
      case "KeyA":
      case "ArrowLeft":
        player.controls.left = true
        break
      case "KeyD":
      case "ArrowRight":
        player.controls.right = true
        break
      case "Space":
        e.preventDefault()
        player.controls.shoot = true
        break
      case "ShiftLeft":
        player.controls.dash = true
        break
      case "KeyE":
        player.controls.special = true
        break
      case "KeyQ":
        player.controls.explosiveArrow = true
        break
    \}
  \}

  const handleKeyUp = (e: KeyboardEvent) => \{
    const player = gameStateRef.current?.players?.[playerId]
    if (!player) return

    switch (e.code) \{
      case "KeyW":
      case "ArrowUp":
        player.controls.up = false
        break
      case "KeyS":
      case "ArrowDown":
        player.controls.down = false
        break
      case "KeyA":
      case "ArrowLeft":
        player.controls.left = false
        break
      case "KeyD":
      case "ArrowRight":
        player.controls.right = false
        break
      case "Space":
        player.controls.shoot = false
        break
      case "ShiftLeft":
        player.controls.dash = false
        break
      case "KeyE":
        player.controls.special = false
        break
      case "KeyQ":
        player.controls.explosiveArrow = false
        break
    \}
  \}

  document.addEventListener("keydown", handleKeyDown)
  document.addEventListener("keyup", handleKeyUp)

  return () => \{
    document.removeEventListener("keydown", handleKeyDown)
    document.removeEventListener("keyup", handleKeyUp)
  \}
\}
