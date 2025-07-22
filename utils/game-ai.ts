// Basic player type
export interface Player {
  id: string
  name: string
  position: { x: number; y: number }
  color: string
  health: number
  score: number
  isActive: boolean
  lives: number // Added for AI targeting logic
  rotation: number // Added for AI aiming logic
  velocity: { x: number; y: number } // Added for AI aiming logic
  isDrawingBow: boolean // Added for AI shooting logic
  drawStartTime: number | null // Added for AI shooting logic
  minDrawTime: number // Added for AI shooting logic
  maxDrawTime: number // Added for AI shooting logic
  dashCooldown: number // Added for AI movement logic
  specialAttackCooldown: number // Added for AI special attack logic
  size: number // Added for AI dodging logic
}

// Game state interface
export interface GameState {
  players: Record<string, Player>
  projectiles: any[]
  powerUps: any[]
  gameTime: number
  isGameOver: boolean
  winner: string | null
  arrows: any[] // Added for AI dangerous arrow tracking
  walls: any[] // Added for AI line of sight checking
}

// Create a new player
export function createPlayer(id: string, name: string, position: { x: number; y: number }, color: string): Player {
  return {
    id,
    name,
    position,
    color,
    health: 100,
    score: 0,
    isActive: true,
    lives: 3, // Default lives for AI targeting logic
    rotation: 0, // Default rotation for AI aiming logic
    velocity: { x: 0, y: 0 }, // Default velocity for AI aiming logic
    isDrawingBow: false, // Default bow drawing state for AI shooting logic
    drawStartTime: null, // Default draw start time for AI shooting logic
    minDrawTime: 0.2, // Default minimum draw time for AI shooting logic
    maxDrawTime: 1.2, // Default maximum draw time for AI shooting logic
    dashCooldown: 0, // Default dash cooldown for AI movement logic
    specialAttackCooldown: 0, // Default special attack cooldown for AI special attack logic
    size: 20, // Default size for AI dodging logic
  }
}

// Create initial game state
export function createInitialGameState(): GameState {
  return {
    players: {},
    projectiles: [],
    powerUps: [],
    gameTime: 0,
    isGameOver: false,
    winner: null,
    arrows: [], // Added for AI dangerous arrow tracking
    walls: [], // Added for AI line of sight checking
  }
}

// Update game state (would be more complex in a real implementation)
export function updateGameState(state: GameState, deltaTime: number): GameState {
  // Update game time
  const updatedState = {
    ...state,
    gameTime: state.gameTime + deltaTime,
  }

  // Check for game over conditions
  const activePlayers = Object.values(updatedState.players).filter((player) => player.isActive)

  if (activePlayers.length <= 1 && Object.keys(updatedState.players).length > 1) {
    updatedState.isGameOver = true
    updatedState.winner = activePlayers.length === 1 ? activePlayers[0].id : null
  }

  return updatedState
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

// Advanced AI for archer arena game
import type { Player, GameObject, Vector2D } from "../components/pvp-game/game-engine"

// AI difficulty levels
export enum AIDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
  EXPERT = "expert",
}

// AI personality traits to create varied behavior
interface AIPersonality {
  aggression: number // 0-1: How aggressively the AI pursues players
  patience: number // 0-1: How long the AI will draw the bow
  mobility: number // 0-1: How much the AI moves around
  accuracy: number // 0-1: Base accuracy for shots
  dodging: number // 0-1: Tendency to dodge incoming arrows
  specialUse: number // 0-1: How often the AI uses special abilities
  adaptability: number // 0-1: How well the AI adapts to the situation
  targeting: number // 0-1: How well the AI prioritizes targets
}

// AI state to track decision-making
interface AIState {
  targetId: string | null
  lastDecisionTime: number
  decisionInterval: number
  lastShotTime: number
  consecutiveHits: number
  consecutiveMisses: number
  lastSeenEnemies: Record<string, { position: Vector2D; time: number }>
  dangerousArrows: GameObject[]
  preferredDistance: number
  lastPosition: Vector2D
  stuckTime: number
  currentBehavior: "hunt" | "flee" | "patrol" | "ambush"
  behaviorTimer: number
}

// Create a new AI controller
export function createAIController(difficulty: AIDifficulty = AIDifficulty.MEDIUM): {
  personality: AIPersonality
  state: AIState
  update: (playerId: string, gameState: any, deltaTime: number) => { controls: any; targetRotation: number }
} {
  // Create personality based on difficulty
  const personality = createPersonality(difficulty)

  // Initialize AI state
  const state: AIState = {
    targetId: null,
    lastDecisionTime: 0,
    decisionInterval: 0.3, // Make decisions every 0.3 seconds for more responsiveness
    lastShotTime: 0,
    consecutiveHits: 0,
    consecutiveMisses: 0,
    lastSeenEnemies: {},
    dangerousArrows: [],
    preferredDistance: 150 + Math.random() * 100, // Each AI has a preferred fighting distance
    lastPosition: { x: 0, y: 0 },
    stuckTime: 0,
    currentBehavior: "hunt",
    behaviorTimer: 0,
  }

  // Return the AI controller
  return {
    personality,
    state,
    update: (playerId: string, gameState: any, deltaTime: number) =>
      updateAI(playerId, gameState, deltaTime, personality, state),
  }
}

// Create AI personality based on difficulty
function createPersonality(difficulty: AIDifficulty): AIPersonality {
  // Base randomness for personality traits
  const randomize = (base: number, variance: number) =>
    Math.max(0, Math.min(1, base + (Math.random() * variance * 2 - variance)))

  // Default medium difficulty
  let personality: AIPersonality = {
    aggression: randomize(0.5, 0.2),
    patience: randomize(0.5, 0.2),
    mobility: randomize(0.5, 0.2),
    accuracy: randomize(0.5, 0.2),
    dodging: randomize(0.5, 0.2),
    specialUse: randomize(0.5, 0.2),
    adaptability: randomize(0.5, 0.2),
    targeting: randomize(0.5, 0.2),
  }

  // Adjust based on difficulty
  switch (difficulty) {
    case AIDifficulty.EASY:
      personality = {
        aggression: randomize(0.4, 0.1),
        patience: randomize(0.3, 0.1),
        mobility: randomize(0.4, 0.1),
        accuracy: randomize(0.3, 0.1),
        dodging: randomize(0.3, 0.1),
        specialUse: randomize(0.2, 0.1),
        adaptability: randomize(0.3, 0.1),
        targeting: randomize(0.4, 0.1),
      }
      break

    case AIDifficulty.HARD:
      personality = {
        aggression: randomize(0.7, 0.1),
        patience: randomize(0.7, 0.1),
        mobility: randomize(0.7, 0.1),
        accuracy: randomize(0.7, 0.1),
        dodging: randomize(0.7, 0.1),
        specialUse: randomize(0.6, 0.1),
        adaptability: randomize(0.7, 0.1),
        targeting: randomize(0.7, 0.1),
      }
      break

    case AIDifficulty.EXPERT:
      personality = {
        aggression: randomize(0.9, 0.05),
        patience: randomize(0.8, 0.1),
        mobility: randomize(0.8, 0.1),
        accuracy: randomize(0.9, 0.05),
        dodging: randomize(0.8, 0.1),
        specialUse: randomize(0.7, 0.1),
        adaptability: randomize(0.9, 0.05),
        targeting: randomize(0.9, 0.05),
      }
      break
  }

  return personality
}

// Main AI update function
function updateAI(
  playerId: string,
  gameState: any,
  deltaTime: number,
  personality: AIPersonality,
  state: AIState,
): { controls: any; targetRotation: number } {
  // Get the AI player
  const player = gameState.players[playerId]
  if (!player) {
    return { controls: {}, targetRotation: 0 }
  }

  // Initialize controls
  const controls = {
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false,
    dash: false,
    special: false,
  }

  // Update timers
  state.lastDecisionTime += deltaTime
  state.behaviorTimer += deltaTime

  // Track current position to detect if stuck
  if (state.lastPosition.x === player.position.x && state.lastPosition.y === player.position.y) {
    state.stuckTime += deltaTime
  } else {
    state.stuckTime = 0
    state.lastPosition = { ...player.position }
  }

  // Find potential targets (prioritize human players)
  const potentialTargets = Object.values(gameState.players).filter(
    (p) => p.id !== player.id && p.health > 0 && p.lives > 0,
  )

  // Always try to target the closest enemy
  if (potentialTargets.length > 0) {
    let closestTarget = null
    let closestDistance = Number.POSITIVE_INFINITY

    for (const target of potentialTargets) {
      const distance = calculateDistance(player.position, target.position)
      if (distance < closestDistance) {
        closestDistance = distance
        closestTarget = target
      }
    }

    if (closestTarget) {
      state.targetId = closestTarget.id
      state.currentBehavior = "hunt"
    }
  }

  // Update decision making at intervals
  if (state.lastDecisionTime >= state.decisionInterval) {
    state.lastDecisionTime = 0
    makeStrategicDecisions(player, gameState, personality, state)
  }

  // Track dangerous arrows
  trackDangerousArrows(player, gameState, state)

  // Determine movement and actions
  const movementControls = determineMovement(player, gameState, personality, state)
  Object.assign(controls, movementControls)

  // Determine combat actions
  const combatControls = determineCombatActions(player, gameState, personality, state)
  Object.assign(controls, combatControls)

  // Calculate target rotation (where to aim)
  const targetRotation = calculateTargetRotation(player, gameState, personality, state)

  return { controls, targetRotation }
}

// Make strategic decisions about targets and behavior
function makeStrategicDecisions(player: Player, gameState: any, personality: AIPersonality, state: AIState): void {
  // If we have low health, consider fleeing
  if (player.health < 30 && personality.aggression < 0.6) {
    state.currentBehavior = "flee"
    state.behaviorTimer = 0
    return
  }

  // If we've been in the same behavior for too long, switch
  if (state.behaviorTimer > 5) {
    const behaviors: Array<"hunt" | "patrol" | "ambush"> = ["hunt", "patrol", "ambush"]
    state.currentBehavior = behaviors[Math.floor(Math.random() * behaviors.length)]
    state.behaviorTimer = 0
  }

  // Prioritize hunting if we have a target
  if (state.targetId && gameState.players[state.targetId]) {
    state.currentBehavior = "hunt"
  }
}

// Track arrows that might hit the AI
function trackDangerousArrows(player: Player, gameState: any, state: AIState): void {
  state.dangerousArrows = []

  // Find arrows that might hit us
  for (const arrow of gameState.arrows || []) {
    // Skip our own arrows
    if (arrow.ownerId === player.id) continue

    // Calculate if arrow is heading towards us
    const dx = player.position.x - arrow.position.x
    const dy = player.position.y - arrow.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Skip arrows too far away
    if (distance > 200) continue

    // Calculate arrow's direction vector
    const arrowDirX = Math.cos(arrow.rotation)
    const arrowDirY = Math.sin(arrow.rotation)

    // Calculate dot product to see if arrow is heading towards us
    const dotProduct = dx * arrowDirX + dy * arrowDirY

    // If dot product is positive, arrow is heading towards us
    if (dotProduct > 0) {
      // Calculate perpendicular distance to arrow's path
      const perpDistance = Math.abs(dx * arrowDirY - dy * arrowDirX)

      // If arrow might hit us, add to dangerous arrows
      if (perpDistance < player.size * 2) {
        state.dangerousArrows.push(arrow)
      }
    }
  }
}

// Determine movement based on current situation
function determineMovement(
  player: Player,
  gameState: any,
  personality: AIPersonality,
  state: AIState,
): { up: boolean; down: boolean; left: boolean; right: boolean; dash: boolean } {
  const controls = {
    up: false,
    down: false,
    left: false,
    right: false,
    dash: false,
  }

  // If stuck, try to move in a random direction
  if (state.stuckTime > 1.0) {
    const randomDir = Math.floor(Math.random() * 4)
    if (randomDir === 0) controls.up = true
    else if (randomDir === 1) controls.down = true
    else if (randomDir === 2) controls.left = true
    else controls.right = true

    // Try to dash if stuck for too long
    if (state.stuckTime > 2.0 && player.dashCooldown <= 0) {
      controls.dash = true
    }

    return controls
  }

  // Dodge dangerous arrows with high priority
  if (state.dangerousArrows.length > 0) {
    const closestArrow = state.dangerousArrows[0]

    // Calculate dodge direction (perpendicular to arrow direction)
    const arrowDirX = Math.cos(closestArrow.rotation)
    const arrowDirY = Math.sin(closestArrow.rotation)

    // Choose dodge direction
    const dodgeLeft = Math.random() < 0.5

    if (dodgeLeft) {
      controls.left = arrowDirY > 0
      controls.right = arrowDirY < 0
      controls.up = arrowDirX > 0
      controls.down = arrowDirX < 0
    } else {
      controls.left = arrowDirY < 0
      controls.right = arrowDirY > 0
      controls.up = arrowDirX < 0
      controls.down = arrowDirX > 0
    }

    // Dash to dodge if arrow is very close
    const distance = calculateDistance(player.position, closestArrow.position)
    if (distance < 80 && player.dashCooldown <= 0) {
      controls.dash = true
    }

    return controls
  }

  // Movement based on current behavior and target
  if (state.targetId && gameState.players[state.targetId]) {
    const target = gameState.players[state.targetId]
    const dx = target.position.x - player.position.x
    const dy = target.position.y - player.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    switch (state.currentBehavior) {
      case "hunt":
        // Move towards target if too far, away if too close, strafe if at good distance
        if (distance > state.preferredDistance * 1.3) {
          // Approach target
          controls.left = dx < -10
          controls.right = dx > 10
          controls.up = dy < -10
          controls.down = dy > 10
        } else if (distance < state.preferredDistance * 0.7) {
          // Retreat from target
          controls.left = dx > 10
          controls.right = dx < -10
          controls.up = dy > 10
          controls.down = dy < -10
        } else {
          // Strafe around target
          const strafeLeft = Math.sin(gameState.gameTime * 2) > 0
          if (strafeLeft) {
            controls.left = dy > 0
            controls.right = dy < 0
            controls.up = dx < 0
            controls.down = dx > 0
          } else {
            controls.left = dy < 0
            controls.right = dy > 0
            controls.up = dx > 0
            controls.down = dx < 0
          }
        }
        break

      case "flee":
        // Move away from target
        controls.left = dx > 0
        controls.right = dx < 0
        controls.up = dy > 0
        controls.down = dy < 0

        // Dash away if target is close
        if (distance < 100 && player.dashCooldown <= 0) {
          controls.dash = true
        }
        break

      case "patrol":
        // Random movement
        const time = gameState.gameTime
        controls.left = Math.sin(time * 0.7) < -0.3
        controls.right = Math.sin(time * 0.7) > 0.3
        controls.up = Math.cos(time * 0.5) < -0.3
        controls.down = Math.cos(time * 0.5) > 0.3
        break

      case "ambush":
        // Stay mostly still, small movements
        if (Math.random() < 0.1) {
          const randomDir = Math.floor(Math.random() * 4)
          if (randomDir === 0) controls.up = true
          else if (randomDir === 1) controls.down = true
          else if (randomDir === 2) controls.left = true
          else controls.right = true
        }
        break
    }

    // Occasional dash for mobility
    if (player.dashCooldown <= 0 && Math.random() < personality.mobility * 0.1) {
      controls.dash = true
    }
  }

  return controls
}

// Determine combat actions (shooting, special attacks)
function determineCombatActions(
  player: Player,
  gameState: any,
  personality: AIPersonality,
  state: AIState,
): { shoot: boolean; special: boolean } {
  const controls = {
    shoot: false,
    special: false,
  }

  // If no target, don't shoot
  if (!state.targetId || !gameState.players[state.targetId]) {
    return controls
  }

  const target = gameState.players[state.targetId]
  const dx = target.position.x - player.position.x
  const dy = target.position.y - player.position.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Check if we have a clear shot
  const hasLineOfSight = checkLineOfSight(player, target, gameState)

  // Use special attack occasionally
  if (
    player.specialAttackCooldown <= 0 &&
    Math.random() < personality.specialUse * 0.2 &&
    hasLineOfSight &&
    distance < 250
  ) {
    controls.special = true
    return controls
  }

  // Shooting logic
  if (hasLineOfSight && distance < 400) {
    const timeSinceLastShot = gameState.gameTime - state.lastShotTime

    // If already drawing bow, decide whether to release
    if (player.isDrawingBow && player.drawStartTime !== null) {
      const currentTime = gameState.gameTime
      const drawTime = currentTime - player.drawStartTime

      // Calculate optimal draw time based on distance and personality
      const minDrawTime = player.minDrawTime || 0.2
      const maxDrawTime = player.maxDrawTime || 1.2

      // Adjust draw time based on distance and accuracy
      const distanceFactor = Math.min(1, distance / 300)
      const optimalDrawTime =
        minDrawTime + (maxDrawTime - minDrawTime) * (personality.patience * 0.6 + distanceFactor * 0.4)

      // Release when we've drawn long enough or randomly based on impatience
      if (drawTime >= optimalDrawTime || (drawTime > minDrawTime && Math.random() < (1 - personality.patience) * 0.3)) {
        controls.shoot = false // Release the bow
        state.lastShotTime = gameState.gameTime
      } else {
        controls.shoot = true // Keep drawing
      }
    } else {
      // Start drawing if enough time has passed since last shot
      const waitTime = 0.3 + (1 - personality.aggression) * 0.7

      if (timeSinceLastShot > waitTime) {
        controls.shoot = true // Start drawing
      }
    }
  }

  return controls
}

// Calculate where to aim
function calculateTargetRotation(player: Player, gameState: any, personality: AIPersonality, state: AIState): number {
  // Default: face movement direction
  let targetRotation = player.rotation || 0

  // If we have a target, aim at them
  if (state.targetId && gameState.players[state.targetId]) {
    const target = gameState.players[state.targetId]

    // Basic direction to target
    const dx = target.position.x - player.position.x
    const dy = target.position.y - player.position.y
    targetRotation = Math.atan2(dy, dx)

    // Advanced aiming: predict target movement
    if (personality.accuracy > 0.4) {
      const targetSpeed = Math.sqrt(target.velocity.x * target.velocity.x + target.velocity.y * target.velocity.y)

      // Only predict if target is moving
      if (targetSpeed > 20) {
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Calculate arrow speed based on current draw time
        let arrowSpeed = 400 // Default arrow speed
        if (player.isDrawingBow && player.drawStartTime !== null) {
          const drawTime = gameState.gameTime - player.drawStartTime
          arrowSpeed = 250 + Math.min(drawTime * 300, 400) // Max speed cap
        }

        // Calculate time for arrow to reach target
        const timeToTarget = distance / arrowSpeed

        // Predict target position
        const predictedX = target.position.x + target.velocity.x * timeToTarget
        const predictedY = target.position.y + target.velocity.y * timeToTarget

        // Calculate direction to predicted position
        const predictedDx = predictedX - player.position.x
        const predictedDy = predictedY - player.position.y
        const predictedRotation = Math.atan2(predictedDy, predictedDx)

        // Blend between current and predicted rotation based on accuracy
        const blendFactor = personality.accuracy * 0.7
        targetRotation = targetRotation * (1 - blendFactor) + predictedRotation * blendFactor
      }
    }

    // Add some randomness based on inverse of accuracy
    const randomFactor = (1 - personality.accuracy) * 0.15
    targetRotation += (Math.random() - 0.5) * randomFactor
  }

  return targetRotation
}

// Check if there's a clear line of sight to target
function checkLineOfSight(player: Player, target: Player, gameState: any): boolean {
  // For now, assume clear line of sight unless there are walls
  if (!gameState.walls || gameState.walls.length === 0) {
    return true
  }

  // Direction vector
  const dx = target.position.x - player.position.x
  const dy = target.position.y - player.position.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Normalized direction
  const dirX = dx / distance
  const dirY = dy / distance

  // Check for walls along the line
  for (const wall of gameState.walls) {
    // Calculate perpendicular distance from wall to line of sight
    const wallDx = wall.position.x - player.position.x
    const wallDy = wall.position.y - player.position.y
    const perpDistance = Math.abs(wallDx * dirY - wallDy * dirX)

    // If perpendicular distance is less than wall size, line of sight is blocked
    if (perpDistance < wall.size) {
      // Calculate intersection point
      const t = wallDx * dirX + wallDy * dirY

      // If intersection point is between player and target, line of sight is blocked
      if (t > 0 && t < distance) {
        return false
      }
    }
  }

  return true
}

// Helper function to calculate distance between two points
function calculateDistance(point1: Vector2D, point2: Vector2D): number {
  const dx = point2.x - point1.x
  const dy = point2.y - point1.y
  return Math.sqrt(dx * dx + dy * dy)
}
