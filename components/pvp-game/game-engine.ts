export interface Player {
  id: string
  name: string
  position: { x: number; y: number }
  velocity: { x: number; y: number }
  rotation: number
  health: number
  maxHealth: number
  size: number
  color: string
  controls: {
    up: boolean
    down: boolean
    left: boolean
    right: boolean
    shoot: boolean
    special: boolean
    dash: boolean
    explosiveArrow?: boolean
  }
  animationState: "idle" | "run" | "fire" | "draw" | "hit" | "death" | "dash" | "special"
  lastAnimationChange: number
  isDrawingBow: boolean
  drawStartTime?: number
  maxDrawTime: number
  isDashing: boolean
  dashCooldown?: number
  dashDuration?: number
  dashSpeed: number
  isChargingSpecial: boolean
  specialChargeStartTime?: number
  specialChargeDuration: number
  explosiveArrowCooldown?: number
  lastShotTime?: number
  shotCooldown: number
}

export interface Arrow {
  id: string
  position: { x: number; y: number }
  velocity: { x: number; y: number }
  rotation: number
  damage: number
  playerId: string
  isExplosive?: boolean
  createdAt: number
}

export interface Wall {
  x: number
  y: number
  width: number
  height: number
}

export interface GameState {
  players: Record<string, Player>
  arrows: Arrow[]
  walls: Wall[]
  pickups: any[]
  gameTime: number
  isGameOver: boolean
  winner: string | null
  lastUpdate: number
}

export function createPlayer(id: string, name: string, position: { x: number; y: number }, color: string): Player {
  return {
    id,
    name,
    position: { ...position },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    health: 100,
    maxHealth: 100,
    size: 20,
    color,
    controls: {
      up: false,
      down: false,
      left: false,
      right: false,
      shoot: false,
      special: false,
      dash: false,
      explosiveArrow: false,
    },
    animationState: "idle",
    lastAnimationChange: Date.now(),
    isDrawingBow: false,
    drawStartTime: undefined,
    maxDrawTime: 2.0,
    isDashing: false,
    dashCooldown: 0,
    dashDuration: 0.3,
    dashSpeed: 400,
    isChargingSpecial: false,
    specialChargeStartTime: undefined,
    specialChargeDuration: 1.5,
    explosiveArrowCooldown: 0,
    lastShotTime: 0,
    shotCooldown: 0.3,
  }
}

export function createInitialGameState(): GameState {
  return {
    players: {},
    arrows: [],
    walls: [
      // Arena boundaries
      { x: 0, y: 0, width: 800, height: 20 }, // Top wall
      { x: 0, y: 580, width: 800, height: 20 }, // Bottom wall
      { x: 0, y: 0, width: 20, height: 600 }, // Left wall
      { x: 780, y: 0, width: 20, height: 600 }, // Right wall

      // Interior obstacles
      { x: 200, y: 150, width: 60, height: 60 },
      { x: 540, y: 150, width: 60, height: 60 },
      { x: 200, y: 390, width: 60, height: 60 },
      { x: 540, y: 390, width: 60, height: 60 },
      { x: 370, y: 270, width: 60, height: 60 },
    ],
    pickups: [],
    gameTime: 0,
    isGameOver: false,
    winner: null,
    lastUpdate: Date.now(),
  }
}

function updatePlayerMovement(player: Player, deltaTime: number): void {
  const speed = 200 // pixels per second
  let moveX = 0
  let moveY = 0

  // Calculate movement direction based on controls
  if (player.controls.up) moveY -= 1
  if (player.controls.down) moveY += 1
  if (player.controls.left) moveX -= 1
  if (player.controls.right) moveX += 1

  // Normalize diagonal movement
  if (moveX !== 0 && moveY !== 0) {
    const length = Math.sqrt(moveX * moveX + moveY * moveY)
    moveX /= length
    moveY /= length
  }

  // Apply dash speed multiplier if dashing
  const currentSpeed = player.isDashing ? player.dashSpeed : speed

  // Set velocity
  player.velocity.x = moveX * currentSpeed
  player.velocity.y = moveY * currentSpeed

  // Update position
  player.position.x += player.velocity.x * deltaTime
  player.position.y += player.velocity.y * deltaTime

  // Keep player within bounds (with some padding for the player size)
  const padding = player.size
  player.position.x = Math.max(padding, Math.min(800 - padding, player.position.x))
  player.position.y = Math.max(padding, Math.min(600 - padding, player.position.y))
}

function updatePlayerActions(player: Player, deltaTime: number, gameState: GameState): void {
  const currentTime = Date.now() / 1000

  // Update cooldowns
  if (player.dashCooldown && player.dashCooldown > 0) {
    player.dashCooldown -= deltaTime
  }
  if (player.explosiveArrowCooldown && player.explosiveArrowCooldown > 0) {
    player.explosiveArrowCooldown -= deltaTime
  }

  // Handle dash
  if (player.controls.dash && !player.isDashing && (player.dashCooldown || 0) <= 0) {
    player.isDashing = true
    player.dashDuration = 0.3
    player.dashCooldown = 2.0 // 2 second cooldown
    player.animationState = "dash"
    player.lastAnimationChange = Date.now()
    console.log(`Player ${player.id} started dashing`)
  }

  // Update dash duration
  if (player.isDashing) {
    player.dashDuration = (player.dashDuration || 0) - deltaTime
    if ((player.dashDuration || 0) <= 0) {
      player.isDashing = false
      player.controls.dash = false
      console.log(`Player ${player.id} finished dashing`)
    }
  }

  // Handle bow drawing and shooting
  if (player.controls.shoot && !player.isDrawingBow) {
    player.isDrawingBow = true
    player.drawStartTime = currentTime
    player.animationState = "draw"
    player.lastAnimationChange = Date.now()
    console.log(`Player ${player.id} started drawing bow`)
  }

  if (!player.controls.shoot && player.isDrawingBow) {
    // Release arrow
    const drawTime = currentTime - (player.drawStartTime || currentTime)
    const power = Math.min(drawTime / player.maxDrawTime, 1.0)

    // Check shot cooldown
    const timeSinceLastShot = currentTime - (player.lastShotTime || 0)
    if (timeSinceLastShot >= player.shotCooldown) {
      createArrow(player, power, gameState)
      player.lastShotTime = currentTime
    }

    player.isDrawingBow = false
    player.drawStartTime = undefined
    player.animationState = "fire"
    player.lastAnimationChange = Date.now()
    console.log(`Player ${player.id} released arrow with power ${power}`)
  }

  // Handle special attack
  if (player.controls.special && !player.isChargingSpecial) {
    player.isChargingSpecial = true
    player.specialChargeStartTime = currentTime
    player.animationState = "special"
    player.lastAnimationChange = Date.now()
    console.log(`Player ${player.id} started charging special`)
  }

  if (!player.controls.special && player.isChargingSpecial) {
    const chargeTime = currentTime - (player.specialChargeStartTime || currentTime)
    if (chargeTime >= 0.5) {
      // Minimum charge time
      // Fire special arrow
      createSpecialArrow(player, gameState)
    }
    player.isChargingSpecial = false
    player.specialChargeStartTime = undefined
    console.log(`Player ${player.id} released special attack`)
  }

  // Handle explosive arrow
  if (player.controls.explosiveArrow && (player.explosiveArrowCooldown || 0) <= 0) {
    createExplosiveArrow(player, gameState)
    player.explosiveArrowCooldown = 5.0 // 5 second cooldown
    player.controls.explosiveArrow = false
    console.log(`Player ${player.id} fired explosive arrow`)
  }
}

function createArrow(player: Player, power: number, gameState: GameState): void {
  const speed = 300 + power * 200 // Base speed + power bonus
  const arrow: Arrow = {
    id: `arrow-${Date.now()}-${Math.random()}`,
    position: { ...player.position },
    velocity: {
      x: Math.cos(player.rotation) * speed,
      y: Math.sin(player.rotation) * speed,
    },
    rotation: player.rotation,
    damage: 20 + power * 10,
    playerId: player.id,
    createdAt: Date.now(),
  }
  gameState.arrows.push(arrow)
}

function createSpecialArrow(player: Player, gameState: GameState): void {
  const speed = 400
  const arrow: Arrow = {
    id: `special-arrow-${Date.now()}-${Math.random()}`,
    position: { ...player.position },
    velocity: {
      x: Math.cos(player.rotation) * speed,
      y: Math.sin(player.rotation) * speed,
    },
    rotation: player.rotation,
    damage: 50,
    playerId: player.id,
    createdAt: Date.now(),
  }
  gameState.arrows.push(arrow)
}

function createExplosiveArrow(player: Player, gameState: GameState): void {
  const speed = 250
  const arrow: Arrow = {
    id: `explosive-arrow-${Date.now()}-${Math.random()}`,
    position: { ...player.position },
    velocity: {
      x: Math.cos(player.rotation) * speed,
      y: Math.sin(player.rotation) * speed,
    },
    rotation: player.rotation,
    damage: 35,
    playerId: player.id,
    isExplosive: true,
    createdAt: Date.now(),
  }
  gameState.arrows.push(arrow)
}

function updateArrows(gameState: GameState, deltaTime: number): void {
  gameState.arrows = gameState.arrows.filter((arrow) => {
    // Update arrow position
    arrow.position.x += arrow.velocity.x * deltaTime
    arrow.position.y += arrow.velocity.y * deltaTime

    // Check bounds
    if (arrow.position.x < 0 || arrow.position.x > 800 || arrow.position.y < 0 || arrow.position.y > 600) {
      return false
    }

    // Check wall collisions
    for (const wall of gameState.walls) {
      if (
        arrow.position.x >= wall.x &&
        arrow.position.x <= wall.x + wall.width &&
        arrow.position.y >= wall.y &&
        arrow.position.y <= wall.y + wall.height
      ) {
        return false
      }
    }

    // Check player collisions
    for (const player of Object.values(gameState.players)) {
      if (player.id !== arrow.playerId) {
        const dx = arrow.position.x - player.position.x
        const dy = arrow.position.y - player.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < player.size) {
          player.health -= arrow.damage
          if (player.health <= 0) {
            player.animationState = "death"
            player.lastAnimationChange = Date.now()
          } else {
            player.animationState = "hit"
            player.lastAnimationChange = Date.now()
          }
          return false
        }
      }
    }

    return true
  })
}

export function updateGameState(gameState: GameState, deltaTime: number): GameState {
  const newState = JSON.parse(JSON.stringify(gameState)) as GameState

  // Update game time
  newState.gameTime += deltaTime

  // Update each player
  for (const player of Object.values(newState.players)) {
    updatePlayerMovement(player, deltaTime)
    updatePlayerActions(player, deltaTime, newState)

    // Update animation states
    const timeSinceAnimation = Date.now() - player.lastAnimationChange
    if (player.animationState === "fire" && timeSinceAnimation > 300) {
      const isMoving = player.controls.up || player.controls.down || player.controls.left || player.controls.right
      player.animationState = isMoving ? "run" : "idle"
      player.lastAnimationChange = Date.now()
    }
    if (player.animationState === "hit" && timeSinceAnimation > 200) {
      const isMoving = player.controls.up || player.controls.down || player.controls.left || player.controls.right
      player.animationState = isMoving ? "run" : "idle"
      player.lastAnimationChange = Date.now()
    }
  }

  // Update arrows
  updateArrows(newState, deltaTime)

  // Check win condition
  const alivePlayers = Object.values(newState.players).filter((p) => p.health > 0)
  if (alivePlayers.length <= 1 && Object.keys(newState.players).length > 1) {
    newState.isGameOver = true
    newState.winner = alivePlayers.length === 1 ? alivePlayers[0].id : null
  }

  return newState
}
