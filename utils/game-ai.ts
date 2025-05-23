// Advanced AI for archer arena game
import type { GameState, Player, GameObject, Vector2D } from "../components/pvp-game/game-engine"

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
  fleeingFrom: string | null
  fleeingUntil: number
  patrolPoint: Vector2D | null
  patrolUntil: number
  lastShotTime: number
  consecutiveHits: number
  consecutiveMisses: number
  lastSeenEnemies: Record<string, { position: Vector2D; time: number }>
  dangerousArrows: GameObject[]
  preferredDistance: number
  lastPosition: Vector2D
  stuckTime: number
  ambushUntil: number
  ambushPosition: Vector2D | null
}

// Create a new AI controller
export function createAIController(difficulty: AIDifficulty = AIDifficulty.MEDIUM): {
  personality: AIPersonality
  state: AIState
  update: (playerId: string, gameState: GameState, deltaTime: number) => { controls: any; targetRotation: number }
} {
  // Create personality based on difficulty
  const personality = createPersonality(difficulty)

  // Initialize AI state
  const state: AIState = {
    targetId: null,
    lastDecisionTime: 0,
    decisionInterval: 0.5, // Make decisions every 0.5 seconds
    fleeingFrom: null,
    fleeingUntil: 0,
    patrolPoint: null,
    patrolUntil: 0,
    lastShotTime: 0,
    consecutiveHits: 0,
    consecutiveMisses: 0,
    lastSeenEnemies: {},
    dangerousArrows: [],
    preferredDistance: 200 + Math.random() * 100, // Each AI has a preferred fighting distance
    lastPosition: { x: 0, y: 0 },
    stuckTime: 0,
    ambushUntil: 0,
    ambushPosition: null,
  }

  // Return the AI controller
  return {
    personality,
    state,
    update: (playerId: string, gameState: GameState, deltaTime: number) =>
      updateAI(playerId, gameState, deltaTime, personality, state),
  }
}

// Create AI personality based on difficulty
function createPersonality(difficulty: AIDifficulty): AIPersonality {
  // Base randomness for personality traits
  const randomize = (base: number, variance: number) =>
    Math.max(0, Math.min(1, base + (Math.random() * variance * 2 - variance)))

  // Default medium difficulty
  const personality: AIPersonality = {
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
      personality.aggression = randomize(0.3, 0.2)
      personality.patience = randomize(0.3, 0.2)
      personality.mobility = randomize(0.3, 0.2)
      personality.accuracy = randomize(0.3, 0.2)
      personality.dodging = randomize(0.2, 0.1)
      personality.specialUse = randomize(0.2, 0.1)
      personality.adaptability = randomize(0.2, 0.1)
      personality.targeting = randomize(0.3, 0.1)
      break

    case AIDifficulty.HARD:
      personality.aggression = randomize(0.7, 0.2)
      personality.patience = randomize(0.7, 0.2)
      personality.mobility = randomize(0.7, 0.2)
      personality.accuracy = randomize(0.7, 0.2)
      personality.dodging = randomize(0.7, 0.2)
      personality.specialUse = randomize(0.7, 0.2)
      personality.adaptability = randomize(0.7, 0.2)
      personality.targeting = randomize(0.7, 0.2)
      break

    case AIDifficulty.EXPERT:
      personality.aggression = randomize(0.9, 0.1)
      personality.patience = randomize(0.9, 0.1)
      personality.mobility = randomize(0.9, 0.1)
      personality.accuracy = randomize(0.9, 0.1)
      personality.dodging = randomize(0.9, 0.1)
      personality.specialUse = randomize(0.9, 0.1)
      personality.adaptability = randomize(0.9, 0.1)
      personality.targeting = randomize(0.9, 0.1)
      break
  }

  return personality
}

// Main AI update function
function updateAI(
  playerId: string,
  gameState: GameState,
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

  // Track current position to detect if stuck
  if (state.lastPosition.x === player.position.x && state.lastPosition.y === player.position.y) {
    state.stuckTime += deltaTime
  } else {
    state.stuckTime = 0
    state.lastPosition = { ...player.position }
  }

  // Update decision making at intervals
  state.lastDecisionTime += deltaTime
  if (state.lastDecisionTime >= state.decisionInterval) {
    state.lastDecisionTime = 0

    // Make strategic decisions
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
function makeStrategicDecisions(
  player: Player,
  gameState: GameState,
  personality: AIPersonality,
  state: AIState,
): void {
  // Find potential targets
  const potentialTargets = Object.values(gameState.players).filter(
    (p) => p.id !== player.id && p.health > 0 && p.lives > 0,
  )

  // No targets? Go into patrol mode
  if (potentialTargets.length === 0) {
    if (!state.patrolPoint || state.patrolUntil <= gameState.gameTime) {
      // Set a new patrol point
      state.patrolPoint = {
        x: 50 + Math.random() * (gameState.arenaSize.width - 100),
        y: 50 + Math.random() * (gameState.arenaSize.height - 100),
      }
      state.patrolUntil = gameState.gameTime + 3 + Math.random() * 5
    }
    state.targetId = null
    return
  }

  // Decide whether to change targets
  const shouldChangeTarget =
    !state.targetId ||
    !gameState.players[state.targetId] ||
    gameState.players[state.targetId].health <= 0 ||
    gameState.players[state.targetId].lives <= 0 ||
    Math.random() < 0.1 * personality.adaptability // Occasionally switch targets based on adaptability

  if (shouldChangeTarget) {
    // Target selection logic based on multiple factors
    let bestTarget = null
    let bestScore = Number.NEGATIVE_INFINITY

    for (const target of potentialTargets) {
      // Calculate distance
      const distance = calculateDistance(player.position, target.position)

      // Calculate health advantage (positive if we have more health)
      const healthAdvantage = player.health - target.health

      // Calculate if target is engaged with someone else
      const isEngaged = Object.values(gameState.players).some(
        (p) => p.id !== player.id && p.id !== target.id && calculateDistance(p.position, target.position) < 150,
      )

      // Calculate if target recently hit us
      const recentlyHitUs = target.id === player.lastDamageFrom

      // Calculate target score
      let score = 0

      // Distance factor - prefer targets at our preferred distance
      const distanceFactor = 1 - Math.abs(distance - state.preferredDistance) / 400
      score += distanceFactor * 2

      // Health factor - prefer weaker targets if aggressive, stronger if defensive
      const healthFactor =
        personality.aggression > 0.5
          ? (100 - target.health) / 100
          : // Aggressive: prefer low health targets
            healthAdvantage / 100 // Defensive: prefer targets we have advantage over
      score += healthFactor * 3

      // Engagement factor - opportunistic AIs prefer engaged targets
      if (isEngaged) {
        score += (1 - personality.aggression) * 2 // Less aggressive AIs are more opportunistic
      }

      // Revenge factor - target players who hit us
      if (recentlyHitUs) {
        score += personality.aggression * 4
      }

      // Update best target
      if (score > bestScore) {
        bestScore = score
        bestTarget = target
      }
    }

    // Set new target
    state.targetId = bestTarget ? bestTarget.id : null
  }

  // Decide whether to ambush
  const shouldAmbush = personality.adaptability > 0.7 && Math.random() < 0.05 && state.ambushUntil <= gameState.gameTime

  if (shouldAmbush) {
    // Find a good ambush position near walls or corners
    const possiblePositions = [
      { x: 100, y: 100 },
      { x: gameState.arenaSize.width - 100, y: 100 },
      { x: 100, y: gameState.arenaSize.height - 100 },
      { x: gameState.arenaSize.width - 100, y: gameState.arenaSize.height - 100 },
      // Add more strategic positions
      { x: gameState.arenaSize.width / 2, y: 100 },
      { x: gameState.arenaSize.width / 2, y: gameState.arenaSize.height - 100 },
      { x: 100, y: gameState.arenaSize.height / 2 },
      { x: gameState.arenaSize.width - 100, y: gameState.arenaSize.height / 2 },
    ]

    // Pick a random position
    const randomIndex = Math.floor(Math.random() * possiblePositions.length)
    state.ambushPosition = possiblePositions[randomIndex]
    state.ambushUntil = gameState.gameTime + 5 + Math.random() * 10
  }
}

// Track arrows that might hit the AI
function trackDangerousArrows(player: Player, gameState: GameState, state: AIState): void {
  // Clear old dangerous arrows
  state.dangerousArrows = []

  // Find arrows that might hit us
  for (const arrow of gameState.arrows) {
    // Skip our own arrows
    if (arrow.ownerId === player.id) continue

    // Calculate if arrow is heading towards us
    const dx = player.position.x - arrow.position.x
    const dy = player.position.y - arrow.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Skip arrows too far away
    if (distance > 300) continue

    // Calculate arrow's direction vector
    const arrowDirX = Math.cos(arrow.rotation)
    const arrowDirY = Math.sin(arrow.rotation)

    // Calculate dot product to see if arrow is heading towards us
    const dotProduct = dx * arrowDirX + dy * arrowDirY

    // If dot product is positive, arrow is heading towards us
    if (dotProduct > 0) {
      // Calculate perpendicular distance to arrow's path
      const perpDistance =
        Math.abs(dx * arrowDirY - dy * arrowDirX) / Math.sqrt(arrowDirX * arrowDirX + arrowDirY * arrowDirY)

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
  gameState: GameState,
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
  if (state.stuckTime > 0.5) {
    const randomDir = Math.floor(Math.random() * 4)
    if (randomDir === 0) controls.up = true
    else if (randomDir === 1) controls.down = true
    else if (randomDir === 2) controls.left = true
    else controls.right = true

    // Try to dash if stuck for too long
    if (state.stuckTime > 1.5 && player.dashCooldown <= 0) {
      controls.dash = true
    }

    return controls
  }

  // Dodge dangerous arrows
  if (state.dangerousArrows.length > 0 && Math.random() < personality.dodging) {
    // Get the closest dangerous arrow
    const closestArrow = state.dangerousArrows.reduce(
      (closest, arrow) => {
        const distance = calculateDistance(player.position, arrow.position)
        if (!closest || distance < calculateDistance(player.position, closest.position)) {
          return arrow
        }
        return closest
      },
      null as GameObject | null,
    )

    if (closestArrow) {
      // Calculate dodge direction (perpendicular to arrow direction)
      const arrowDirX = Math.cos(closestArrow.rotation)
      const arrowDirY = Math.sin(closestArrow.rotation)

      // Choose dodge direction (left or right of arrow path)
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
      if (distance < 100 && player.dashCooldown <= 0 && Math.random() < personality.dodging * 0.8) {
        controls.dash = true
      }

      return controls
    }
  }

  // If in ambush mode, move to ambush position
  if (state.ambushPosition && state.ambushUntil > gameState.gameTime) {
    const dx = state.ambushPosition.x - player.position.x
    const dy = state.ambushPosition.y - player.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // If close enough to ambush position, stop moving
    if (distance < 20) {
      return controls
    }

    // Move towards ambush position
    controls.left = dx < -10
    controls.right = dx > 10
    controls.up = dy < -10
    controls.down = dy > 10

    return controls
  }

  // If we have a target, move based on target
  if (state.targetId && gameState.players[state.targetId]) {
    const target = gameState.players[state.targetId]
    const dx = target.position.x - player.position.x
    const dy = target.position.y - player.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Determine if we should approach, maintain distance, or retreat
    if (distance > state.preferredDistance * 1.2) {
      // Too far, approach
      controls.left = dx < -10
      controls.right = dx > 10
      controls.up = dy < -10
      controls.down = dy > 10
    } else if (distance < state.preferredDistance * 0.8) {
      // Too close, retreat
      controls.left = dx > 10
      controls.right = dx < -10
      controls.up = dy > 10
      controls.down = dy < -10
    } else {
      // Good distance, strafe
      const strafeLeft = Math.random() < 0.5
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

    // Occasionally dash towards or away from target
    if (player.dashCooldown <= 0 && Math.random() < personality.mobility * 0.2) {
      // Dash towards target if aggressive and far, away if defensive and close
      if (
        (personality.aggression > 0.6 && distance > state.preferredDistance) ||
        (personality.aggression < 0.4 && distance < state.preferredDistance * 0.7)
      ) {
        controls.dash = true
      }
    }

    return controls
  }

  // If we have a patrol point, move towards it
  if (state.patrolPoint) {
    const dx = state.patrolPoint.x - player.position.x
    const dy = state.patrolPoint.y - player.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // If close enough to patrol point, stop moving
    if (distance < 20) {
      return controls
    }

    // Move towards patrol point
    controls.left = dx < -10
    controls.right = dx > 10
    controls.up = dy < -10
    controls.down = dy > 10

    return controls
  }

  // Default: random movement
  if (Math.random() < personality.mobility * 0.3) {
    const randomDir = Math.floor(Math.random() * 4)
    if (randomDir === 0) controls.up = true
    else if (randomDir === 1) controls.down = true
    else if (randomDir === 2) controls.left = true
    else controls.right = true
  }

  return controls
}

// Determine combat actions (shooting, special attacks)
function determineCombatActions(
  player: Player,
  gameState: GameState,
  personality: AIPersonality,
  state: AIState,
): { shoot: boolean; special: boolean } {
  const controls = {
    shoot: false,
    special: false,
  }

  // If no target, don't shoot
  if (!state.targetId || !gameState.players[state.targetId]) {
    // Stop drawing bow if we were
    if (player.isDrawingBow) {
      controls.shoot = false
    }
    return controls
  }

  const target = gameState.players[state.targetId]
  const dx = target.position.x - player.position.x
  const dy = target.position.y - player.position.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Calculate if we have a clear shot
  const hasLineOfSight = checkLineOfSight(player, target, gameState)

  // Decide whether to use special attack
  if (
    player.specialAttackCooldown <= 0 &&
    Math.random() < personality.specialUse * 0.3 &&
    hasLineOfSight &&
    distance < 300
  ) {
    controls.special = true
    return controls
  }

  // Decide whether to shoot
  if (hasLineOfSight && distance < 400) {
    // If already drawing bow, decide whether to release
    if (player.isDrawingBow && player.drawStartTime !== null) {
      const currentTime = gameState.gameTime
      const drawTime = currentTime - player.drawStartTime

      // Calculate optimal draw time based on personality and distance
      const minDrawTime = player.minDrawTime || 0.3
      const maxDrawTime = player.maxDrawTime || 1.5

      // Expert AIs draw longer for distant targets
      const distanceFactor = Math.min(1, distance / 300)
      const optimalDrawTime =
        minDrawTime + (maxDrawTime - minDrawTime) * (personality.patience * 0.5 + distanceFactor * 0.2)

      // Release when we've drawn long enough
      if (drawTime >= optimalDrawTime) {
        controls.shoot = false // Release the bow
        state.lastShotTime = gameState.gameTime
      } else {
        controls.shoot = true // Keep drawing
      }
    } else {
      // Start drawing if enough time has passed since last shot
      const timeSinceLastShot = gameState.gameTime - state.lastShotTime

      // More aggressive shooting - reduced wait time
      const waitTime = 0.2 + (1 - personality.aggression) * 0.8

      // Increase chance of shooting based on aggression
      if (timeSinceLastShot > waitTime || Math.random() < personality.aggression * 0.3) {
        controls.shoot = true // Start drawing
      }
    }
  } else {
    // No clear shot, stop drawing
    if (player.isDrawingBow) {
      controls.shoot = false
    }
  }

  return controls
}

// Calculate where to aim
function calculateTargetRotation(
  player: Player,
  gameState: GameState,
  personality: AIPersonality,
  state: AIState,
): number {
  // Default: aim where we're moving
  let targetRotation = 0
  if (player.velocity.x !== 0 || player.velocity.y !== 0) {
    targetRotation = Math.atan2(player.velocity.y, player.velocity.x)
  }

  // If we have a target, aim at them
  if (state.targetId && gameState.players[state.targetId]) {
    const target = gameState.players[state.targetId]

    // Basic direction to target
    const dx = target.position.x - player.position.x
    const dy = target.position.y - player.position.y
    targetRotation = Math.atan2(dy, dx)

    // Advanced aiming: predict target movement
    if (personality.accuracy > 0.5) {
      // Calculate target velocity
      const targetSpeed = Math.sqrt(target.velocity.x * target.velocity.x + target.velocity.y * target.velocity.y)

      // Only predict if target is moving
      if (targetSpeed > 10) {
        // Calculate distance and time for arrow to reach target
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Calculate arrow speed based on draw time
        let arrowSpeed = 450 // Default arrow speed
        if (player.isDrawingBow && player.drawStartTime !== null) {
          const drawTime = gameState.gameTime - player.drawStartTime
          arrowSpeed = 300 + drawTime * 200 // Adjust based on draw time
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
        const blendFactor = personality.accuracy * 0.8
        targetRotation = targetRotation * (1 - blendFactor) + predictedRotation * blendFactor

        // Add some randomness based on inverse of accuracy
        const randomFactor = (1 - personality.accuracy) * 0.2
        targetRotation += (Math.random() - 0.5) * randomFactor
      }
    } else {
      // Less accurate AIs have more random aim
      const randomFactor = (1 - personality.accuracy) * 0.3
      targetRotation += (Math.random() - 0.5) * randomFactor
    }
  }

  return targetRotation
}

// Check if there's a clear line of sight to target
function checkLineOfSight(player: Player, target: Player, gameState: GameState): boolean {
  // Direction vector
  const dx = target.position.x - player.position.x
  const dy = target.position.y - player.position.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Normalized direction
  const dirX = dx / distance
  const dirY = dy / distance

  // Check for walls along the line
  for (const wall of gameState.walls) {
    // Skip walls that are too far away
    const wallDx = wall.position.x - player.position.x
    const wallDy = wall.position.y - player.position.y
    const wallDistance = Math.sqrt(wallDx * wallDx + wallDy * wallDy)

    if (wallDistance > distance + wall.size) {
      continue // Wall is farther than target
    }

    // Calculate perpendicular distance from wall to line of sight
    const perpDistance = Math.abs(wallDx * dirY - wallDy * dirX)

    // If perpendicular distance is less than wall size, line of sight is blocked
    if (perpDistance < wall.size) {
      // Calculate intersection point
      const t = (wallDx * dirX + wallDy * dirY) / (dirX * dirX + dirY * dirY)

      // If intersection point is between player and target, line of sight is blocked
      if (t > 0 && t < distance) {
        return false
      }
    }
  }

  // No walls blocking line of sight
  return true
}

// Helper function to calculate distance between two points
function calculateDistance(point1: Vector2D, point2: Vector2D): number {
  const dx = point2.x - point1.x
  const dy = point2.y - point1.y
  return Math.sqrt(dx * dx + dy * dy)
}
