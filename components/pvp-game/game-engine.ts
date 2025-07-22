// Basic game engine for top-down shooter
export interface Vector2D {
  x: number
  y: number
}

export interface GameObject {
  id: string
  position: Vector2D
  velocity: Vector2D
  rotation: number
  size: number
  health: number
  color: string
  type: "player" | "arrow" | "wall" | "pickup"
  ownerId?: string
  damage?: number // Added damage property for arrows
}

// Update the PlayerAnimationState type to match available animations
export type PlayerAnimationState = "idle" | "run" | "fire" | "hit" | "death" | "walk" | "attack" | "dash" | "special"

export interface Player extends GameObject {
  name: string
  score: number
  kills: number
  deaths: number
  lives: number // Added lives property
  cooldown: number
  // NEW DASH SYSTEM
  dashCooldown: number
  isDashing: boolean
  dashStartTime: number | null
  dashVelocity: Vector2D | null
  // Bow mechanics
  isDrawingBow: boolean
  drawStartTime: number | null
  maxDrawTime: number
  minDrawTime: number // Added minimum draw time property
  // Special attack
  isChargingSpecial: boolean
  specialChargeStartTime: number | null
  specialAttackCooldown: number
  specialAttackReady: boolean
  // Animation state
  animationState: PlayerAnimationState
  lastAnimationChange: number
  // State timers
  hitAnimationTimer: number
  respawnTimer: number
  // Track who last damaged this player
  lastDamageFrom: string | null
  // Controls
  controls: {
    up: boolean
    down: boolean
    left: boolean
    right: boolean
    shoot: boolean
    dash: boolean
    special: boolean
    explosiveArrow: boolean
  }
  invulnerableTime: number // Time in seconds of invulnerability after being hit
  explosiveArrowCooldown: number
  isUsingExplosiveArrow: boolean
  lastHitByWeakShot?: boolean // Flag to track if player was hit by a weak shot
  wasShooting?: boolean
}

// Update the GameState interface to include maxGameTime and gameMode
export interface GameState {
  players: Record<string, Player>
  arrows: GameObject[]
  walls: GameObject[]
  pickups: GameObject[]
  arenaSize: { width: number; height: number }
  gameTime: number
  maxGameTime: number
  isGameOver: boolean
  winner: string | null
  gameMode: string // Added gameMode property
  explosions: Array<{
    position: Vector2D
    radius: number
    time: number
    maxTime: number
  }>
}

// Available colors for players
export const playerColors = ["red", "blue", "green", "yellow", "purple", "brown", "black"]

// Update the createInitialGameState function to include maxGameTime
export const createInitialGameState = (): GameState => {
  return {
    players: {},
    arrows: [],
    walls: generateWalls(),
    pickups: [],
    arenaSize: { width: 800, height: 600 },
    gameTime: 0,
    maxGameTime: 120, // 2 minutes in seconds
    isGameOver: false,
    winner: null,
    gameMode: "ffa", // Default game mode
    explosions: [],
  }
}

export const createPlayer = (id: string, name: string, position: Vector2D, color: string): Player => {
  return {
    id,
    name,
    position: { ...position }, // Create a new object to avoid reference issues
    velocity: { x: 0, y: 0 },
    rotation: 0,
    size: 24, // Increased size to better match sprite size
    health: 100,
    color,
    type: "player",
    score: 0,
    kills: 0,
    deaths: 0,
    lives: 3, // Default lives
    cooldown: 0,
    // NEW DASH SYSTEM
    dashCooldown: 0,
    isDashing: false,
    dashStartTime: null,
    dashVelocity: null,
    // Bow mechanics
    isDrawingBow: false,
    drawStartTime: null,
    maxDrawTime: 1.5, // 1.5 seconds for max draw
    minDrawTime: 0.45, // 30% of max draw time
    // Special attack
    isChargingSpecial: false,
    specialChargeStartTime: null,
    specialAttackCooldown: 0,
    specialAttackReady: false,
    // Animation state
    animationState: "idle",
    lastAnimationChange: Date.now(),
    // State timers
    hitAnimationTimer: 0,
    respawnTimer: 0,
    lastDamageFrom: null,
    // Controls
    controls: {
      up: false,
      down: false,
      left: false,
      right: false,
      shoot: false,
      dash: false,
      special: false,
      explosiveArrow: false,
    },
    invulnerableTime: 0,
    explosiveArrowCooldown: 0,
    isUsingExplosiveArrow: false,
  }
}

export const createArrow = (
  position: Vector2D,
  velocity: Vector2D,
  rotation: number,
  ownerId: string,
  damage = 10,
): GameObject => {
  return {
    id: `arrow-${Date.now()}-${Math.random()}`,
    position: { ...position },
    velocity: { ...velocity },
    rotation,
    size: 5,
    health: 1,
    color: "#8B4513", // Brown color for arrows
    type: "arrow",
    ownerId,
    damage,
  }
}

export const generateWalls = (): GameObject[] => {
  const walls: GameObject[] = []

  // Arena boundaries
  const thickness = 20
  const width = 800
  const height = 600

  // Top wall
  walls.push({
    id: "wall-top",
    position: { x: width / 2, y: thickness / 2 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    size: thickness,
    health: Number.POSITIVE_INFINITY,
    color: "#333333",
    type: "wall",
  })

  // Bottom wall
  walls.push({
    id: "wall-bottom",
    position: { x: width / 2, y: height - thickness / 2 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    size: thickness,
    health: Number.POSITIVE_INFINITY,
    color: "#333333",
    type: "wall",
  })

  // Left wall
  walls.push({
    id: "wall-left",
    position: { x: thickness / 2, y: height / 2 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    size: thickness,
    health: Number.POSITIVE_INFINITY,
    color: "#333333",
    type: "wall",
  })

  // Right wall
  walls.push({
    id: "wall-right",
    position: { x: width - thickness / 2, y: height / 2 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    size: thickness,
    health: Number.POSITIVE_INFINITY,
    color: "#333333",
    type: "wall",
  })

  // Add some obstacles
  walls.push({
    id: "obstacle-1",
    position: { x: width / 2, y: height / 2 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    size: 40,
    health: Number.POSITIVE_INFINITY,
    color: "#555555",
    type: "wall",
  })

  walls.push({
    id: "obstacle-2",
    position: { x: width / 4, y: height / 4 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    size: 30,
    health: Number.POSITIVE_INFINITY,
    color: "#555555",
    type: "wall",
  })

  walls.push({
    id: "obstacle-3",
    position: { x: (width / 4) * 3, y: (height / 4) * 3 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    size: 30,
    health: Number.POSITIVE_INFINITY,
    color: "#555555",
    type: "wall",
  })

  return walls
}

// Update the calculateArrowDamage function to handle weak shots
export const calculateArrowDamage = (drawTime: number, maxDrawTime: number, isWeakShot: boolean): number => {
  // Weak shots always do 1 damage
  if (isWeakShot) {
    return 1
  }

  // Normal damage calculation for regular shots
  const minDamage = 5
  const maxDamage = 25
  const drawPercentage = Math.min(drawTime / maxDrawTime, 1)
  return minDamage + drawPercentage * (maxDamage - minDamage)
}

// Calculate arrow speed based on draw time
export const calculateArrowSpeed = (drawTime: number, maxDrawTime: number): number => {
  // Minimum speed is 300, max is 600 based on draw time
  const minSpeed = 300
  const maxSpeed = 600
  const drawPercentage = Math.min(drawTime / maxDrawTime, 1)
  return minSpeed + drawPercentage * (maxSpeed - minSpeed)
}

// COMPLETELY NEW DASH IMPLEMENTATION
// Calculate dash velocity based on input or facing direction
const calculateDashVelocity = (player: Player): Vector2D => {
  const DASH_SPEED = 800 // Fixed dash speed
  const dashVelocity: Vector2D = { x: 0, y: 0 }

  // First try to use movement input direction
  if (player.controls.up || player.controls.down || player.controls.left || player.controls.right) {
    if (player.controls.up) dashVelocity.y -= 1
    if (player.controls.down) dashVelocity.y += 1
    if (player.controls.left) dashVelocity.x -= 1
    if (player.controls.right) dashVelocity.x += 1

    // Normalize the direction vector
    const magnitude = Math.sqrt(dashVelocity.x * dashVelocity.x + dashVelocity.y * dashVelocity.y)
    if (magnitude > 0) {
      dashVelocity.x = (dashVelocity.x / magnitude) * DASH_SPEED
      dashVelocity.y = (dashVelocity.y / magnitude) * DASH_SPEED
    }
  } else {
    // If no movement input, use facing direction
    dashVelocity.x = Math.cos(player.rotation) * DASH_SPEED
    dashVelocity.y = Math.sin(player.rotation) * DASH_SPEED
  }

  return dashVelocity
}

// Update the updateGameState function to check for time limit and update animation states
export const updateGameState = (state: GameState, deltaTime: number): GameState => {
  try {
    // Create a deep copy of the state to avoid mutation issues
    const newState = {
      ...state,
      players: { ...state.players },
      arrows: [...state.arrows],
      walls: [...state.walls],
      pickups: [...state.pickups],
      explosions: Array.isArray(state.explosions) ? [...state.explosions] : [],
    }

    // Make deep copies of each player to avoid reference issues
    Object.keys(newState.players).forEach((playerId) => {
      newState.players[playerId] = {
        ...newState.players[playerId],
        position: { ...newState.players[playerId].position },
        velocity: { ...newState.players[playerId].velocity },
        controls: { ...newState.players[playerId].controls },
        dashVelocity: newState.players[playerId].dashVelocity ? { ...newState.players[playerId].dashVelocity } : null,
      }
    })

    // Validate animation states
    Object.values(newState.players).forEach((player) => {
      // Ensure animation state is valid
      if (
        !["idle", "run", "fire", "hit", "death", "walk", "attack", "dash", "special"].includes(player.animationState)
      ) {
        console.warn(`Invalid animation state: ${player.animationState}, defaulting to idle`)
        player.animationState = "idle"
      }
    })

    newState.gameTime += deltaTime

    // Check if time limit is reached
    if (newState.gameTime >= newState.maxGameTime && !newState.isGameOver) {
      newState.isGameOver = true

      // Determine winner based on kills/score
      let highestScore = -1
      let winner: string | null = null

      Object.entries(newState.players).forEach(([playerId, player]) => {
        if (player.kills > highestScore) {
          highestScore = player.kills
          winner = playerId
        } else if (player.kills === highestScore && winner !== null) {
          // In case of a tie, check score
          if (player.score > (newState.players[winner]?.score || 0)) {
            winner = playerId
          }
        }
      })

      newState.winner = winner
      return newState
    }

    // Update players
    Object.keys(newState.players).forEach((playerId) => {
      const player = newState.players[playerId]

      // If player is in death animation, don't process movement or actions
      if (player.animationState === "death") {
        if (player.respawnTimer > 0) {
          player.respawnTimer -= deltaTime
          if (player.respawnTimer <= 0) {
            // Respawn player if they have lives left
            if (player.lives > 0) {
              player.health = 100
              player.animationState = "idle"
              player.lastAnimationChange = Date.now()
              player.position = {
                x: Math.random() * (newState.arenaSize.width - 100) + 50,
                y: Math.random() * (newState.arenaSize.height - 100) + 50,
              }
              player.invulnerableTime = 2.0 // 2 seconds of invulnerability after respawn
            }
          }
        }
        return // Skip the rest of the update for this player
      }

      // Skip players with no lives left
      if (player.lives <= 0) {
        return
      }

      // Handle invulnerability timer
      if (player.invulnerableTime > 0) {
        player.invulnerableTime -= deltaTime
      }

      // Handle cooldowns
      if (player.cooldown > 0) {
        player.cooldown -= deltaTime
      }

      if (player.dashCooldown > 0) {
        player.dashCooldown -= deltaTime
      }

      if (player.specialAttackCooldown > 0) {
        player.specialAttackCooldown -= deltaTime
        if (player.specialAttackCooldown <= 0) {
          player.specialAttackReady = true
        }
      }

      // Handle hit animation timer
      if (player.hitAnimationTimer > 0) {
        player.hitAnimationTimer -= deltaTime
        if (player.hitAnimationTimer <= 0 && player.animationState === "hit") {
          player.animationState = "idle"
          player.lastAnimationChange = Date.now()
        }
      }

      // Update animation state based on player actions
      const now = Date.now()

      // Priority order: death > hit > fire > dash > run > idle
      if (player.isDrawingBow && player.animationState !== "fire") {
        player.animationState = "fire"
        player.lastAnimationChange = now
      } else if (player.isDashing && player.animationState !== "dash") {
        player.animationState = "dash"
        player.lastAnimationChange = now
      } else if ((player.velocity.x !== 0 || player.velocity.y !== 0) && player.animationState !== "run") {
        if (!["hit", "fire", "dash"].includes(player.animationState)) {
          player.animationState = "run"
          player.lastAnimationChange = now
        }
      } else if (
        player.velocity.x === 0 &&
        player.velocity.y === 0 &&
        !["idle", "hit", "fire", "dash"].includes(player.animationState)
      ) {
        player.animationState = "idle"
        player.lastAnimationChange = now
      }

      // Handle dash initiation
      if (player.controls.dash && !player.isDashing && player.dashCooldown <= 0) {
        player.isDashing = true
        player.dashStartTime = Date.now() / 1000
        player.dashVelocity = calculateDashVelocity(player)
        player.dashCooldown = 1.5
        player.animationState = "dash"
        player.lastAnimationChange = now
      }

      // Handle active dash
      if (player.isDashing && player.dashStartTime !== null) {
        const currentTime = Date.now() / 1000
        const dashDuration = 0.15

        if (currentTime - player.dashStartTime >= dashDuration) {
          player.isDashing = false
          player.dashStartTime = null
          player.dashVelocity = null
          player.animationState = "idle"
          player.lastAnimationChange = now
        } else if (player.dashVelocity) {
          player.position.x += player.dashVelocity.x * deltaTime
          player.position.y += player.dashVelocity.y * deltaTime
        }
      } else {
        // Normal movement (only if not dashing)
        const speed = 200
        const movementMultiplier = player.isDrawingBow ? 0.4 : 1.0

        player.velocity.x = 0
        player.velocity.y = 0

        if (player.controls.up) player.velocity.y = -speed * movementMultiplier
        if (player.controls.down) player.velocity.y = speed * movementMultiplier
        if (player.controls.left) player.velocity.x = -speed * movementMultiplier
        if (player.controls.right) player.velocity.x = speed * movementMultiplier

        if (player.velocity.x !== 0 && player.velocity.y !== 0) {
          const magnitude = Math.sqrt(player.velocity.x * player.velocity.x + player.velocity.y * player.velocity.y)
          player.velocity.x = (player.velocity.x / magnitude) * speed * movementMultiplier
          player.velocity.y = (player.velocity.y / magnitude) * speed * movementMultiplier
        }

        player.position.x += player.velocity.x * deltaTime
        player.position.y += player.velocity.y * deltaTime
      }

      // Shooting Logic
      if (player.controls.shoot && !player.wasShooting && player.cooldown <= 0 && !player.isDrawingBow) {
        player.isDrawingBow = true
        player.drawStartTime = Date.now() / 1000
      } else if (!player.controls.shoot && player.wasShooting && player.isDrawingBow) {
        const currentTime = Date.now() / 1000
        const drawTime = player.drawStartTime ? currentTime - player.drawStartTime : 0

        const isWeakShot = drawTime < player.minDrawTime
        const damage = calculateArrowDamage(drawTime, player.maxDrawTime, isWeakShot)
        const arrowSpeed = calculateArrowSpeed(drawTime, player.maxDrawTime)

        const arrowVelocity = {
          x: Math.cos(player.rotation) * arrowSpeed,
          y: Math.sin(player.rotation) * arrowSpeed,
        }
        const arrowPosition = {
          x: player.position.x + Math.cos(player.rotation) * (player.size + 5),
          y: player.position.y + Math.sin(player.rotation) * (player.size + 5),
        }

        const arrow = createArrow(arrowPosition, arrowVelocity, player.rotation, player.id, damage)
        if (isWeakShot) {
          // @ts-ignore
          arrow.isWeakShot = true
        }
        newState.arrows.push(arrow)

        player.isDrawingBow = false
        player.drawStartTime = null
        player.cooldown = 0.2
      }

      player.wasShooting = player.controls.shoot

      // Collision with walls
      newState.walls.forEach((wall) => {
        const dx = player.position.x - wall.position.x
        const dy = player.position.y - wall.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const minDistance = player.size + wall.size

        if (distance < minDistance) {
          const angle = Math.atan2(dy, dx)
          const pushDistance = minDistance - distance
          player.position.x += Math.cos(angle) * pushDistance
          player.position.y += Math.sin(angle) * pushDistance
        }
      })

      // Keep player within arena bounds
      const { width, height } = newState.arenaSize
      player.position.x = Math.max(player.size, Math.min(width - player.size, player.position.x))
      player.position.y = Math.max(player.size, Math.min(height - player.size, player.position.y))
    })

    // Update arrows
    newState.arrows = newState.arrows.filter((arrow) => {
      arrow.position.x += arrow.velocity.x * deltaTime
      arrow.position.y += arrow.velocity.y * deltaTime

      const { width, height } = newState.arenaSize
      if (arrow.position.x < 0 || arrow.position.x > width || arrow.position.y < 0 || arrow.position.y > height) {
        return false
      }

      for (const wall of newState.walls) {
        const dx = arrow.position.x - wall.position.x
        const dy = arrow.position.y - wall.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < arrow.size + wall.size) {
          return false
        }
      }

      for (const playerId in newState.players) {
        const player = newState.players[playerId]

        if (arrow.ownerId === player.id || player.lives <= 0 || player.animationState === "death") {
          continue
        }

        if (player.invulnerableTime > 0) {
          continue
        }

        const dx = arrow.position.x - player.position.x
        const dy = arrow.position.y - player.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < arrow.size + player.size) {
          const damage = arrow.damage || 10
          player.health -= damage
          player.lastDamageFrom = arrow.ownerId

          if (player.health > 0) {
            player.animationState = "hit"
            player.lastAnimationChange = Date.now()
            player.hitAnimationTimer = 0.5
            player.invulnerableTime = 0.1
          } else {
            player.health = 0
            player.animationState = "death"
            player.lastAnimationChange = Date.now()
            player.deaths += 1
            player.lives -= 1

            if (arrow.ownerId && newState.players[arrow.ownerId]) {
              newState.players[arrow.ownerId].kills += 1
              newState.players[arrow.ownerId].score += 100
            }

            if (player.lives > 0) {
              player.respawnTimer = 3.0
            }
          }
          return false
        }
      }
      return true
    })

    // Check for game over conditions
    if (!newState.isGameOver) {
      const playersWithLives = Object.values(newState.players).filter((p) => p.lives > 0)
      if (playersWithLives.length <= 1 && Object.keys(newState.players).length > 1) {
        newState.isGameOver = true
        newState.winner = playersWithLives.length === 1 ? playersWithLives[0].id : null
      } else {
        const topKiller = Object.values(newState.players).find((p) => p.kills >= 10)
        if (topKiller) {
          newState.isGameOver = true
          newState.winner = topKiller.id
        }
      }
    }

    return newState
  } catch (error) {
    console.error("Error in updateGameState:", error)
    return state
  }
}

// Handle player input
export function handlePlayerInput(state: GameState, playerId: string, input: any): GameState {
  const player = state.players[playerId]
  if (!player || player.isActive) return state

  // Clone the state to avoid mutations
  const newState = { ...state }
  const updatedPlayer = { ...player }

  // Update player position based on input
  if (input.movement) {
    updatedPlayer.position = {
      x: updatedPlayer.position.x + input.movement.x,
      y: updatedPlayer.position.y + input.movement.y,
    }
  }

  // Add projectile if player is shooting
  if (input.shooting) {
    // In a real implementation, this would create a projectile
  }

  // Update the player in the state
  newState.players = {
    ...newState.players,
    [playerId]: updatedPlayer,
  }

  return newState
}

// Handle player death
export function handlePlayerDeath(state: GameState, playerId: string): GameState {
  const newState = { ...state }
  const player = { ...newState.players[playerId] }

  // Reduce lives
  player.lives -= 1

  // Check if player is out of lives
  if (player.lives <= 0) {
    player.isActive = false

    // In duel mode, end the game immediately
    if (newState.gameMode === "duel") {
      newState.isGameOver = true
      // Find the other player and set them as winner
      const winner = Object.values(newState.players).find((p) => p.id !== playerId)
      newState.winner = winner ? winner.id : null
    }
  }

  // Update player in state
  newState.players[playerId] = player

  return newState
}

// Helper function to play hit sound
export const playHitSound = () => {
  // This would be implemented in the audio manager
  console.log("Hit sound played")
}

// Helper function to play dash sound
export const playDashSound = () => {
  // This would be implemented in the audio manager
  console.log("Dash sound played")
}

// Helper function to create an explosion and damage nearby players
function createExplosion(state: GameState, arrow: GameObject): void {
  // Ensure explosions array exists
  if (!state.explosions) {
    state.explosions = []
  }

  // @ts-ignore - Custom property
  const explosionRadius = arrow.explosionRadius || 100
  // @ts-ignore - Custom property
  const explosionDamage = arrow.explosionDamage || 40

  // Check all players in explosion radius
  Object.keys(state.players).forEach((playerId) => {
    const player = state.players[playerId]

    // Skip players with no lives
    if (player.lives <= 0) return

    const dx = player.position.x - arrow.position.x
    const dy = player.position.y - arrow.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // If player is within explosion radius
    if (distance <= explosionRadius) {
      // Calculate damage based on distance (more damage closer to center)
      const damageMultiplier = 1 - distance / explosionRadius
      const damage = Math.round(explosionDamage * damageMultiplier)

      // Apply damage
      if (damage > 0) {
        player.health -= damage

        // Track who hit this player
        player.lastDamageFrom = arrow.ownerId

        // Set hit animation
        if (player.animationState !== "death") {
          player.animationState = "hit"
          player.lastAnimationChange = Date.now()
          player.hitAnimationTimer = 0.5 // 0.5 seconds
        }

        // Check if player is dead
        if (player.health <= 0) {
          player.health = 0
          player.animationState = "death"
          player.lastAnimationChange = Date.now()
          player.deaths += 1

          // Award kill to the player who fired the arrow
          if (arrow.ownerId && state.players[arrow.ownerId]) {
            state.players[arrow.ownerId].kills += 1
            state.players[arrow.ownerId].score += 100
          }
        }
      }
    }
  })

  // Add explosion particles
  // This would be handled by the renderer, but we can add a flag to the game state
  state.explosions.push({
    position: { x: arrow.position.x, y: arrow.position.y },
    radius: explosionRadius,
    time: 0,
    maxTime: 0.5, // 0.5 seconds explosion animation
  })
}
