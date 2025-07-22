import type { GameState, Player } from "../components/pvp-game/game-engine"

export interface AIDecision {
  moveUp: boolean
  moveDown: boolean
  moveLeft: boolean
  moveRight: boolean
  shoot: boolean
  drawBow: boolean
  specialAttack: boolean
  targetRotation?: number
}

export interface AIInternalState {
  targetId: string | null
  currentBehavior: "seek" | "attack" | "evade" | "idle"
  lastDecisionTime: number
  bowDrawStartTime: number
  lastShotTime: number
  pathfindingTarget: { x: number; y: number } | null
}

export interface AIController {
  update(gameState: GameState, deltaTime: number): void
  getDecision(): AIDecision
  getState(): AIInternalState
}

// Factory function to create a new AI controller
export function createAIController(playerId: string): AIController {
  const state: AIInternalState = {
    targetId: null,
    currentBehavior: "idle",
    lastDecisionTime: 0,
    bowDrawStartTime: 0,
    lastShotTime: 0,
    pathfindingTarget: null,
  }

  let lastDecision: AIDecision = {
    moveUp: false,
    moveDown: false,
    moveLeft: false,
    moveRight: false,
    shoot: false,
    drawBow: false,
    specialAttack: false,
  }

  const getDistance = (pos1: { x: number; y: number }, pos2: { x: number; y: number }): number => {
    const dx = pos2.x - pos1.x
    const dy = pos2.y - pos1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  const hasLineOfSight = (
    gameState: GameState,
    from: { x: number; y: number },
    to: { x: number; y: number },
  ): boolean => {
    const distance = getDistance(from, to)
    return distance < 400 // Simplified: Max shooting range
  }

  const findTarget = (gameState: GameState, aiPlayer: Player): void => {
    const enemies = Object.values(gameState.players).filter((p) => p.id !== playerId && p.health > 0)
    if (enemies.length === 0) {
      state.targetId = null
      return
    }
    const humanEnemies = enemies.filter((p) => !p.id.startsWith("ai_"))
    const targetPool = humanEnemies.length > 0 ? humanEnemies : enemies
    let closestEnemy = targetPool[0]
    let closestDistance = getDistance(aiPlayer.position, closestEnemy.position)
    for (const enemy of targetPool) {
      const distance = getDistance(aiPlayer.position, enemy.position)
      if (distance < closestDistance) {
        closestDistance = distance
        closestEnemy = enemy
      }
    }
    state.targetId = closestEnemy.id
  }

  const updateBehavior = (gameState: GameState, aiPlayer: Player): void => {
    if (!state.targetId) {
      state.currentBehavior = "idle"
      return
    }
    const target = gameState.players[state.targetId]
    if (!target) {
      state.currentBehavior = "idle"
      return
    }
    const distance = getDistance(aiPlayer.position, target.position)
    if (distance > 300) {
      state.currentBehavior = "seek"
    } else if (distance > 150) {
      state.currentBehavior = "attack"
    } else if (aiPlayer.health < 30) {
      state.currentBehavior = "evade"
    } else {
      state.currentBehavior = "attack"
    }
  }

  const makeDecision = (gameState: GameState, aiPlayer: Player): void => {
    lastDecision = {
      moveUp: false,
      moveDown: false,
      moveLeft: false,
      moveRight: false,
      shoot: false,
      drawBow: false,
      specialAttack: false,
    }
    if (!state.targetId) return
    const target = gameState.players[state.targetId]
    if (!target) return

    const now = Date.now()
    const distance = getDistance(aiPlayer.position, target.position)
    const dx = target.position.x - aiPlayer.position.x
    const dy = target.position.y - aiPlayer.position.y
    const targetAngle = Math.atan2(dy, dx)
    lastDecision.targetRotation = targetAngle

    switch (state.currentBehavior) {
      case "seek":
        if (Math.abs(dx) > 10) {
          lastDecision.moveRight = dx > 0
          lastDecision.moveLeft = dx < 0
        }
        if (Math.abs(dy) > 10) {
          lastDecision.moveDown = dy > 0
          lastDecision.moveUp = dy < 0
        }
        break
      case "attack":
        if (distance < 150) {
          lastDecision.moveLeft = dx > 0
          lastDecision.moveRight = dx < 0
          lastDecision.moveUp = dy > 0
          lastDecision.moveDown = dy < 0
        } else if (distance > 250) {
          lastDecision.moveRight = dx > 0
          lastDecision.moveLeft = dx < 0
          lastDecision.moveDown = dy > 0
          lastDecision.moveUp = dy < 0
        } else {
          const perpAngle = Math.atan2(dy, dx) + Math.PI / 2
          const strafeX = Math.cos(perpAngle)
          const strafeY = Math.sin(perpAngle)
          lastDecision.moveRight = strafeX > 0
          lastDecision.moveLeft = strafeX < 0
          lastDecision.moveDown = strafeY > 0
          lastDecision.moveUp = strafeY < 0
        }
        const timeSinceLastShot = now - state.lastShotTime
        if (hasLineOfSight(gameState, aiPlayer.position, target.position) && timeSinceLastShot > 1000) {
          if (!aiPlayer.isDrawingBow && state.bowDrawStartTime === 0) {
            lastDecision.drawBow = true
            state.bowDrawStartTime = now
          } else if (aiPlayer.isDrawingBow && now - state.bowDrawStartTime > 800) {
            lastDecision.drawBow = false
            lastDecision.shoot = true
            state.lastShotTime = now
            state.bowDrawStartTime = 0
          } else if (aiPlayer.isDrawingBow) {
            lastDecision.drawBow = true
          }
        }
        if (distance < 100 && aiPlayer.specialAttackCooldown <= 0 && Math.random() < 0.3) {
          lastDecision.specialAttack = true
        }
        break
      case "evade":
        lastDecision.moveLeft = dx > 0
        lastDecision.moveRight = dx < 0
        lastDecision.moveUp = dy > 0
        lastDecision.moveDown = dy < 0
        break
      case "idle":
        if (Math.random() < 0.1) {
          lastDecision.moveUp = Math.random() < 0.5
          lastDecision.moveDown = Math.random() < 0.5
          lastDecision.moveLeft = Math.random() < 0.5
          lastDecision.moveRight = Math.random() < 0.5
        }
        break
    }
  }

  return {
    update(gameState: GameState, deltaTime: number): void {
      const aiPlayer = gameState.players[playerId]
      if (!aiPlayer || aiPlayer.health <= 0) return
      const now = Date.now()
      if (now - state.lastDecisionTime < 100) return
      state.lastDecisionTime = now
      findTarget(gameState, aiPlayer)
      updateBehavior(gameState, aiPlayer)
      makeDecision(gameState, aiPlayer)
    },
    getDecision(): AIDecision {
      return { ...lastDecision }
    },
    getState(): AIInternalState {
      return { ...state }
    },
  }
}
