import type { GameState, Player, Vector2D } from "../components/pvp-game/game-engine"

// AI difficulty levels, kept for compatibility with the game controller
export enum AIDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
  EXPERT = "expert",
}

// A simplified state for each AI instance
interface AIState {
  targetId: string | null
  lastDecisionTime: number
  decisionInterval: number
  action: "attacking" | "patrolling"
  patrolTarget: Vector2D | null
  lastShotTime: number
  isDrawing: boolean
  drawStartTime: number
  shotCooldown: number
  actionCooldown: number // Time until next major action can be taken
  lastMovementControls: { up: boolean; down: boolean; left: boolean; right: boolean }
}

/**
 * Creates a new AI controller.
 * This function initializes an AI with a simple state and returns an object
 * with an `update` method to be called in the game loop.
 * @param difficulty - The difficulty level for the AI.
 */
export function createAIController(difficulty: AIDifficulty = AIDifficulty.MEDIUM) {
  const state: AIState = {
    targetId: null,
    lastDecisionTime: 0,
    decisionInterval: 1.5, // Re-evaluate target every 1.5 seconds by default
    action: "patrolling",
    patrolTarget: null,
    lastShotTime: 0,
    isDrawing: false,
    drawStartTime: 0,
    shotCooldown: 0,
    actionCooldown: 0,
    lastMovementControls: { up: false, down: false, left: false, right: false },
  }

  // Adjust parameters based on difficulty
  switch (difficulty) {
    case AIDifficulty.EASY:
      state.decisionInterval = 3
      break
    case AIDifficulty.HARD:
      state.decisionInterval = 1
      break
    case AIDifficulty.EXPERT:
      state.decisionInterval = 0.8
      break
  }

  const update = (
    playerId: string,
    gameState: GameState,
    deltaTime: number,
  ): { controls: any; targetRotation: number } => {
    return updateAI(playerId, gameState, deltaTime, state)
  }

  return {
    update,
    // The following are returned for signature compatibility with the original implementation
    personality: {},
    state: state,
  }
}

/**
 * The core AI update logic function.
 * @param playerId - The ID of the AI player to update.
 * @param gameState - The current state of the game.
 * @param deltaTime - The time elapsed since the last frame.
 * @param state - The internal state of the AI.
 */
function updateAI(
  playerId: string,
  gameState: GameState,
  deltaTime: number,
  state: AIState,
): { controls: any; targetRotation: number } {
  const player = gameState.players[playerId]
  if (!player || player.health <= 0 || player.lives <= 0 || player.animationState === "death") {
    return {
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
      targetRotation: player?.rotation || 0,
    }
  }

  // Update timers
  state.lastDecisionTime += deltaTime
  if (state.shotCooldown > 0) {
    state.shotCooldown -= deltaTime
  }
  if (state.actionCooldown > 0) {
    state.actionCooldown -= deltaTime
  }

  // 1. Decision Making: Re-evaluate targets periodically
  if (state.lastDecisionTime > state.decisionInterval) {
    state.lastDecisionTime = 0
    findTarget(player, gameState, state)
  }

  // 2. Action: Execute the current behavior (patrolling or attacking)
  return executeAction(player, gameState, state, deltaTime)
}

/**
 * Finds a target for the AI to attack.
 * If no targets are available, it sets the AI to patrol.
 */
function findTarget(player: Player, gameState: GameState, state: AIState): void {
  const potentialTargets = Object.values(gameState.players).filter(
    (p) => p.id !== player.id && p.health > 0 && p.lives > 0 && p.animationState !== "death",
  )

  if (potentialTargets.length > 0) {
    // Simple logic: find the closest target
    let closestTarget: Player | null = null
    let minDistance = Number.POSITIVE_INFINITY

    for (const target of potentialTargets) {
      const distance = calculateDistance(player.position, target.position)
      if (distance < minDistance) {
        minDistance = distance
        closestTarget = target
      }
    }

    if (closestTarget) {
      state.targetId = closestTarget.id
      state.action = "attacking"
    }
  } else {
    // No targets, switch to patrolling
    state.targetId = null
    state.action = "patrolling"
    if (!state.patrolTarget) {
      state.patrolTarget = {
        x: Math.random() * (gameState.arenaSize.width - 100) + 50,
        y: Math.random() * (gameState.arenaSize.height - 100) + 50,
      }
    }
  }
}

/**
 * Executes the AI's current action (attacking or patrolling).
 * This function determines movement, aiming, and shooting controls.
 */
function executeAction(
  player: Player,
  gameState: GameState,
  state: AIState,
  deltaTime: number,
): { controls: any; targetRotation: number } {
  const controls = {
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false,
    dash: false,
    special: false,
    explosiveArrow: false,
  }
  let targetRotation = player.rotation

  // If we are in an action cooldown, continue previous movement to avoid jitter
  if (state.actionCooldown > 0) {
    Object.assign(controls, state.lastMovementControls)
  }

  if (state.action === "attacking" && state.targetId) {
    const target = gameState.players[state.targetId]
    if (target && target.health > 0 && target.animationState !== "death") {
      const distance = calculateDistance(player.position, target.position)
      const preferredDistance = 250

      // Aiming: Always aim at the target
      const dx = target.position.x - player.position.x
      const dy = target.position.y - player.position.y
      targetRotation = Math.atan2(dy, dx)

      // Movement logic (only if not in cooldown)
      if (state.actionCooldown <= 0) {
        if (distance > preferredDistance + 80) {
          moveTowards(controls, player.position, target.position)
        } else if (distance < preferredDistance - 50) {
          moveAway(controls, player.position, target.position)
        } else {
          strafe(controls, player.position, target.position)
        }
      }

      // Shooting Logic
      const canShoot = hasLineOfSight(player, target, gameState) && distance < 400 && state.shotCooldown <= 0
      if (canShoot && state.actionCooldown <= 0) {
        if (!state.isDrawing) {
          controls.shoot = true
          state.isDrawing = true
          state.drawStartTime = gameState.gameTime
        } else {
          const drawTime = gameState.gameTime - state.drawStartTime
          const optimalDrawTime = 0.8
          if (drawTime >= optimalDrawTime) {
            controls.shoot = false
            state.isDrawing = false
            state.lastShotTime = gameState.gameTime
            state.shotCooldown = 1.5 + Math.random()
            state.actionCooldown = 0.3 // Brief pause after shooting
          } else {
            controls.shoot = true
          }
        }
      } else if (state.isDrawing) {
        // If target is lost or can't shoot, cancel draw
        controls.shoot = false
        state.isDrawing = false
      }

      // Dash logic
      if (player.dashCooldown <= 0 && Math.random() < 0.01 && state.actionCooldown <= 0) {
        controls.dash = true
        state.actionCooldown = 0.5 // Pause after dashing
      }
    } else {
      state.targetId = null
      state.action = "patrolling"
    }
  }

  if (state.action === "patrolling" && state.actionCooldown <= 0) {
    if (!state.patrolTarget || calculateDistance(player.position, state.patrolTarget) < 80) {
      state.patrolTarget = {
        x: Math.random() * (gameState.arenaSize.width - 100) + 50,
        y: Math.random() * (gameState.arenaSize.height - 100) + 50,
      }
    }
    moveTowards(controls, player.position, state.patrolTarget)
    const dx = state.patrolTarget.x - player.position.x
    const dy = state.patrolTarget.y - player.position.y
    if (dx !== 0 || dy !== 0) {
      targetRotation = Math.atan2(dy, dx)
    }
  }

  // Store movement for next frame's potential cooldown
  state.lastMovementControls = {
    up: controls.up,
    down: controls.down,
    left: controls.left,
    right: controls.right,
  }

  return { controls, targetRotation }
}

// --- Helper Functions ---

function calculateDistance(pos1: Vector2D, pos2: Vector2D): number {
  const dx = pos1.x - pos2.x
  const dy = pos1.y - pos2.y
  return Math.sqrt(dx * dx + dy * dy)
}

function moveTowards(controls: any, currentPos: Vector2D, targetPos: Vector2D) {
  const threshold = 15
  if (targetPos.y < currentPos.y - threshold) controls.up = true
  if (targetPos.y > currentPos.y + threshold) controls.down = true
  if (targetPos.x < currentPos.x - threshold) controls.left = true
  if (targetPos.x > currentPos.x + threshold) controls.right = true
}

function moveAway(controls: any, currentPos: Vector2D, targetPos: Vector2D) {
  const threshold = 10
  if (targetPos.y < currentPos.y - threshold) controls.down = true
  if (targetPos.y > currentPos.y + threshold) controls.up = true
  if (targetPos.x < currentPos.x - threshold) controls.right = true
  if (targetPos.x > currentPos.x + threshold) controls.left = true
}

function strafe(controls: any, currentPos: Vector2D, targetPos: Vector2D) {
  const dx = targetPos.x - currentPos.x
  const dy = targetPos.y - currentPos.y

  // Strafe perpendicular to the line between AI and target
  if (Math.random() > 0.5) {
    // Strafe left relative to target
    controls.up = dx > 0
    controls.down = dx < 0
    controls.left = dy < 0
    controls.right = dy > 0
  } else {
    // Strafe right
    controls.up = dx < 0
    controls.down = dx > 0
    controls.left = dy > 0
    controls.right = dy < 0
  }
}

function hasLineOfSight(player: Player, target: Player, gameState: GameState): boolean {
  const dx = target.position.x - player.position.x
  const dy = target.position.y - player.position.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  if (distance === 0) return true

  const dirX = dx / distance
  const dirY = dy / distance

  // Check for walls blocking the line of sight
  for (const wall of gameState.walls) {
    const wallDx = wall.position.x - player.position.x
    const wallDy = wall.position.y - player.position.y
    const wallDistance = Math.sqrt(wallDx * wallDx + wallDy * wallDy)

    // Skip walls that are too far away
    if (wallDistance > distance + wall.size) {
      continue
    }

    const t = wallDx * dirX + wallDy * dirY

    if (t > 0 && t < distance) {
      const perpDistance = Math.abs(wallDx * dirY - wallDy * dirX)
      if (perpDistance < wall.size + player.size) {
        return false // Blocked by a wall
      }
    }
  }
  return true // No obstructions
}
