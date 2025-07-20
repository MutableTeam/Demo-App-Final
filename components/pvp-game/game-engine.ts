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
const calculateArrowDamage = (drawTime: number, maxDrawTime: number, isWeakShot: boolean): number => {
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
const calculateArrowSpeed = (drawTime: number, maxDrawTime: number): number => {
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
export const updateGameState = (
  state: GameState,
  deltaTime: number,
  onPlayerDeath?: (playerId: string) => void,
): GameState => {
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

      // Skip players with no lives left
      if (player.lives <= 0) {
        return
      }

      // Handle invulnerability timer - add this line to fix the issue
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
        if (player.hitAnimationTimer <= 0 && player.animationState === "hit" && player.health > 0) {
          // Transition back to idle or run
          if (player.velocity.x !== 0 || player.velocity.y !== 0) {
            player.animationState = "run"
          } else {
            player.animationState = "idle"
          }
          player.lastAnimationChange = Date.now()
        }
      }

      // Handle respawn timer
      if (player.respawnTimer > 0) {
        player.respawnTimer -= deltaTime
        if (player.respawnTimer <= 0 && player.health <= 0) {
          // Only respawn if player has lives left
          if (player.lives > 0) {
            // Respawn player
            player.health = 100
            player.animationState = "idle"
            player.lastAnimationChange = Date.now()

            // Respawn at random position
            player.position = {
              x: Math.random() * (newState.arenaSize.width - 100) + 50,
              y: Math.random() * (newState.arenaSize.height - 100) + 50,
            }
          }
        }
      }

      // Update animation state based on player actions
      const now = Date.now()
      const timeSinceLastAnimChange = now - player.lastAnimationChange

      // Priority order: death > hit > fire > dash > run > idle
      if (player.health <= 0 && player.animationState !== "death") {
        player.animationState = "death"
        player.lastAnimationChange = now
        // Set respawn timer
        player.respawnTimer = 1.0 // 1 second
      } else if (player.isDrawingBow || player.controls.shoot) {
        if (player.animationState !== "fire") {
          player.animationState = "fire"
          player.lastAnimationChange = now
        }
      } else if (player.isDashing && player.animationState !== "dash") {
        player.animationState = "dash"
        player.lastAnimationChange = now
      } else if ((player.velocity.x !== 0 || player.velocity.y !== 0) && player.animationState !== "run") {
        // Only change to run if we're not already in a higher priority animation
        if (
          player.animationState !== "hit" &&
          player.animationState !== "death" &&
          player.animationState !== "fire" &&
          player.animationState !== "dash"
        ) {
          player.animationState = "run"
          player.lastAnimationChange = now
        }
      } else if (
        player.animationState !== "idle" &&
        player.animationState !== "death" &&
        player.animationState !== "hit" &&
        player.animationState !== "fire" &&
        player.animationState !== "dash" &&
        player.velocity.x === 0 &&
        player.velocity.y === 0
      ) {
        // Only transition to idle if we're not in a higher priority animation
        // and we're not moving
        player.animationState = "idle"
        player.lastAnimationChange = now
      }

      // COMPLETELY NEW DASH IMPLEMENTATION
      // Handle dash initiation
      if (player.controls.dash && !player.isDashing && player.dashCooldown <= 0) {
        // Start a new dash
        player.isDashing = true
        player.dashStartTime = Date.now() / 1000 // Current time in seconds
        player.dashVelocity = calculateDashVelocity(player)
        player.dashCooldown = 1.5 // 1.5 second cooldown
        player.animationState = "dash"
        player.lastAnimationChange = now
      }

      // Handle active dash
      if (player.isDashing && player.dashStartTime !== null) {
        const currentTime = Date.now() / 1000
        const dashDuration = 0.15 // 150ms dash

        // Check if dash should end
        if (currentTime - player.dashStartTime >= dashDuration) {
          // End dash
          player.isDashing = false
          player.dashStartTime = null
          player.dashVelocity = null

          // Return to appropriate animation
          if (player.velocity.x !== 0 || player.velocity.y !== 0) {
            player.animationState = "run"
          } else {
            player.animationState = "idle"
          }
          player.lastAnimationChange = now
        } else if (player.dashVelocity) {
          // Apply dash movement
          player.position.x += player.dashVelocity.x * deltaTime
          player.position.y += player.dashVelocity.y * deltaTime
        }
      } else {
        // Normal movement (only if not dashing)
        const speed = 200 // pixels per second

        // Apply movement penalty when drawing bow
        const movementMultiplier = player.isDrawingBow ? 0.4 : 1.0 // 40% speed when drawing bow

        // If using boolean controls (keyboard), update velocity
        if (player.controls.up || player.controls.down || player.controls.left || player.controls.right) {
          player.velocity.x = 0
          player.velocity.y = 0
          if (player.controls.up) player.velocity.y = -speed * movementMultiplier
          if (player.controls.down) player.velocity.y = speed * movementMultiplier
          if (player.controls.left) player.velocity.x = -speed * movementMultiplier
          if (player.controls.right) player.velocity.x = speed * movementMultiplier

          // Normalize diagonal movement
          if (player.velocity.x !== 0 && player.velocity.y !== 0) {
            const magnitude = Math.sqrt(player.velocity.x * player.velocity.x + player.velocity.y * player.velocity.y)
            player.velocity.x = (player.velocity.x / magnitude) * speed * movementMultiplier
            player.velocity.y = (player.velocity.y / magnitude) * speed * movementMultiplier
          }
        }
        // Note: For joystick, velocity is set directly in the controller.

        // Apply velocity
        player.position.x += player.velocity.x * deltaTime
        player.position.y += player.velocity.y * deltaTime
      }

      // Handle bow drawing
      if (player.controls.shoot) {
        if (!player.isDrawingBow) {
          player.isDrawingBow = true
          player.drawStartTime = Date.now() / 1000 // Convert to seconds

          // Set animation to fire when starting to draw bow
          player.animationState = "fire"
          player.lastAnimationChange = Date.now()
        }
      } else if (player.isDrawingBow && player.drawStartTime !== null) {
        // Release arrow
        const currentTime = Date.now() / 1000
        const drawTime = currentTime - player.drawStartTime

        // Check if this is a weak shot (less than 30% draw)
        const minDrawTime = player.maxDrawTime * 0.3
        const isWeakShot = drawTime < minDrawTime

        // Calculate damage and speed based on draw time
        const damage = calculateArrowDamage(drawTime, player.maxDrawTime, isWeakShot)
        const arrowSpeed = calculateArrowSpeed(drawTime, player.maxDrawTime)

        // Adjust arrow properties based on draw strength
        let finalArrowSpeed = arrowSpeed
        let arrowRange = 800 // Default range

        if (isWeakShot) {
          // Weak shots move slower and fall to ground quickly
          finalArrowSpeed = arrowSpeed * 0.3
          arrowRange = 200 // Much shorter range
        }

        const arrowVelocity = {
          x: Math.cos(player.rotation) * finalArrowSpeed,
          y: Math.sin(player.rotation) * finalArrowSpeed,
        }

        const arrowPosition = {
          x: player.position.x + Math.cos(player.rotation) * (player.size + 5),
          y: player.position.y + Math.sin(player.rotation) * (player.size + 5),
        }

        // Create the arrow with additional properties
        const arrow = createArrow(arrowPosition, arrowVelocity, player.rotation, player.id, damage)

        // Add custom properties for weak shots
        if (isWeakShot) {
          arrow.color = "#5D4037" // Darker brown for weak shots
          // @ts-ignore - Adding custom property
          arrow.isWeakShot = true
          // @ts-ignore - Adding custom property
          arrow.range = arrowRange
        }

        newState.arrows.push(arrow)

        // Reset bow state
        player.isDrawingBow = false
        player.drawStartTime = null
        player.cooldown = 0.2 // Small cooldown between shots
      }

      // Handle special attack charging
      if (player.controls.special) {
        if (!player.isChargingSpecial && player.specialAttackCooldown <= 0) {
          player.isChargingSpecial = true
          player.specialChargeStartTime = Date.now() / 1000

          // Set animation to fire when charging special
          player.animationState = "fire"
          player.lastAnimationChange = Date.now()
        }
      } else if (player.isChargingSpecial && player.specialChargeStartTime !== null) {
        // Release special attack (3 arrows in quick succession)
        const currentTime = Date.now() / 1000
        const chargeTime = currentTime - player.specialChargeStartTime

        // Only trigger if charged for at least 0.5 seconds
        if (chargeTime >= 0.5) {
          const arrowSpeed = 500 // Fixed speed for special attack
          const spreadAngle = 0.1 // Small spread between arrows

          // Fire 3 arrows with slight spread
          for (let i = -1; i <= 1; i++) {
            const angle = player.rotation + i * spreadAngle
            const arrowVelocity = {
              x: Math.cos(angle) * arrowSpeed,
              y: Math.sin(angle) * arrowSpeed,
            }

            const arrowPosition = {
              x: player.position.x + Math.cos(angle) * (player.size + 5),
              y: player.position.y + Math.sin(angle) * (player.size + 5),
            }

            newState.arrows.push(createArrow(arrowPosition, arrowVelocity, angle, player.id, 15))
          }

          // Set cooldown for special attack
          player.specialAttackCooldown = 5 // 5 seconds cooldown
          player.specialAttackReady = false
        }

        // Reset special attack state
        player.isChargingSpecial = false
        player.specialChargeStartTime = null
      }

      // Handle explosive arrow cooldown
      if (player.explosiveArrowCooldown > 0) {
        player.explosiveArrowCooldown -= deltaTime
      }

      // Handle explosive arrow firing (using 'e' key or right-click + shift)
      if (player.controls.explosiveArrow && player.explosiveArrowCooldown <= 0 && !player.isDrawingBow) {
        // Fire explosive arrow
        const arrowSpeed = 400 // Slightly slower than regular arrows
        const arrowVelocity = {
          x: Math.cos(player.rotation) * arrowSpeed,
          y: Math.sin(player.rotation) * arrowSpeed,
        }

        const arrowPosition = {
          x: player.position.x + Math.cos(player.rotation) * (player.size + 5),
          y: player.position.y + Math.sin(player.rotation) * (player.size + 5),
        }

        // Create the explosive arrow
        const explosiveArrow = createArrow(arrowPosition, arrowVelocity, player.rotation, player.id, 20)

        // Add custom properties for explosive arrow
        // @ts-ignore - Adding custom property
        explosiveArrow.isExplosive = true
        // @ts-ignore - Custom property
        explosiveArrow.explosionRadius = 100
        // @ts-ignore - Custom property
        explosiveArrow.explosionDamage = 40
        // Change color to indicate explosive arrow
        explosiveArrow.color = "#FF5722" // Orange-red color

        newState.arrows.push(explosiveArrow)

        // Set cooldown
        player.explosiveArrowCooldown = 30 // 30 seconds cooldown
        player.isUsingExplosiveArrow = false
      }

      // Collision with walls
      newState.walls.forEach((wall) => {
        const dx = player.position.x - wall.position.x
        const dy = player.position.y - wall.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const minDistance = player.size + wall.size

        if (distance < minDistance) {
          // Push player away from wall
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
      // Move arrow
      arrow.position.x += arrow.velocity.x * deltaTime
      arrow.position.y += arrow.velocity.y * deltaTime

      // Check if arrow is out of bounds
      const { width, height } = newState.arenaSize
      if (arrow.position.x < 0 || arrow.position.x > width || arrow.position.y < 0 || arrow.position.y > height) {
        return false
      }

      // Check for weak shot range limit
      // @ts-ignore - Custom property
      if (arrow.isWeakShot) {
        // @ts-ignore - Custom property
        const range = arrow.range || 200
        // @ts-ignore - Custom property
        arrow.distanceTraveled =
          (arrow.distanceTraveled || 0) +
          Math.sqrt(Math.pow(arrow.velocity.x * deltaTime, 2) + Math.pow(arrow.velocity.y * deltaTime, 2))

        // @ts-ignore - Custom property
        if (arrow.distanceTraveled > range) {
          return false
        }
      }

      // Check collision with walls
      for (const wall of newState.walls) {
        const dx = arrow.position.x - wall.position.x
        const dy = arrow.position.y - wall.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < arrow.size + wall.size) {
          // @ts-ignore - Custom property
          if (arrow.isExplosive) {
            // Create explosion
            createExplosion(newState, arrow)
          }
          return false
        }
      }

      // Check collision with players
      for (const playerId in newState.players) {
        const player = newState.players[playerId]

        // Don't hit the player who fired the arrow or players with no lives
        // Add a debug log to help diagnose the issue
        if (arrow.ownerId === player.id || player.lives <= 0) {
          continue
        }

        // Add separate check for invulnerability with debug logging
        if (player.invulnerableTime > 0) {
          // Debug log to see invulnerability values
          // console.log(`Player ${playerId} is invulnerable for ${player.invulnerableTime.toFixed(3)} more seconds`);
          continue
        }

        const dx = arrow.position.x - player.position.x
        const dy = arrow.position.y - player.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < arrow.size + player.size) {
          // Hit player
          const damage = arrow.damage || 10
          player.health -= damage

          // Track who hit this player
          player.lastDamageFrom = arrow.ownerId

          // Set hit animation
          if (player.animationState !== "death") {
            player.animationState = "hit"
            player.lastAnimationChange = Date.now()
            player.hitAnimationTimer = 0.5 // 0.5 seconds
          }

          // Add invulnerability frames to prevent multiple hits from same arrow
          player.invulnerableTime = 0.1 // 100ms of invulnerability

          // Debug log to confirm hit registered
          // console.log(`Player ${playerId} hit! Health: ${player.health}, Invulnerable for: ${player.invulnerableTime}s`);

          // Check if player is dead
          if (player.health <= 0) {
            player.health = 0 // Ensure health doesn't go negative
            player.animationState = "death"
            player.lastAnimationChange = Date.now()
            player.deaths += 1

            // Award kill to the player who fired the arrow
            if (arrow.ownerId && newState.players[arrow.ownerId]) {
              newState.players[arrow.ownerId].kills += 1
              newState.players[arrow.ownerId].score += 100
            }

            // Call the onPlayerDeath callback if provided
            if (onPlayerDeath) {
              onPlayerDeath(playerId)
            }
          }

          // @ts-ignore - Custom property
          if (arrow.isExplosive) {
            // Create explosion
            createExplosion(newState, arrow)
          }

          return false // Remove the arrow
        }
      }

      return true
    })

    // Check for game over conditions
    if (!newState.isGameOver) {
      if (newState.gameMode === "duel") {
        // For duel mode, check if only one player has lives left
        const playersWithLives = Object.values(newState.players).filter((p) => p.lives > 0)
        if (playersWithLives.length <= 1 && Object.keys(newState.players).length > 1) {
          newState.isGameOver = true
          newState.winner = playersWithLives.length === 1 ? playersWithLives[0].id : null
        }
      } else {
        // For FFA mode, check if only one player is active or if someone reached 10 kills
        const activePlayers = Object.values(newState.players).filter((p) => p.lives > 0)
        const topKiller = Object.values(newState.players).reduce(
          (top, p) => (p.kills > (top?.kills || 0) ? p : top),
          null,
        )

        if (activePlayers.length <= 1 && Object.keys(newState.players).length > 1) {
          newState.isGameOver = true
          newState.winner = activePlayers.length === 1 ? activePlayers[0].id : null
        } else if (topKiller && topKiller.kills >= 10) {
          newState.isGameOver = true
          newState.winner = topKiller.id
        }
      }
    }

    // Update explosions
    if (newState.explosions && newState.explosions.length > 0) {
      newState.explosions = newState.explosions.filter((explosion) => {
        explosion.time += deltaTime
        return explosion.time < explosion.maxTime
      })
    }

    return newState
  } catch (error) {
    console.error("Error in updateGameState:", error)
    // Return the original state if there's an error
    return state
  }
}

// Handle player input
export function handlePlayerInput(state: GameState, playerId: string, input: any): GameState {
  const player = state.players[playerId]
  if (!player || !player.isActive) return state

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
