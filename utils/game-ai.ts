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

export interface AIState {
  targetId: string | null
  currentBehavior: "seek" | "attack" | "evade" | "idle"
  lastDecisionTime: number
  bowDrawStartTime: number
  lastShotTime: number
  pathfindingTarget: { x: number; y: number } | null
}

export class AIController {
  private playerId: string
  private state: AIState
  private lastDecision: AIDecision

  constructor(playerId: string) {
    this.playerId = playerId
    this.state = {
      targetId: null,
      currentBehavior: "idle",
      lastDecisionTime: 0,
      bowDrawStartTime: 0,
      lastShotTime: 0,
      pathfindingTarget: null,
    }
    this.lastDecision = {
      moveUp: false,
      moveDown: false,
      moveLeft: false,
      moveRight: false,
      shoot: false,
      drawBow: false,
      specialAttack: false,
    }
  }

  update(gameState: GameState, deltaTime: number): void {
    const aiPlayer = gameState.players[this.playerId]
    if (!aiPlayer || aiPlayer.health <= 0) return

    const now = Date.now()

    // Update decision every 100ms for responsiveness
    if (now - this.state.lastDecisionTime < 100) return

    this.state.lastDecisionTime = now

    // Find target (prioritize human players)
    this.findTarget(gameState, aiPlayer)

    // Update behavior based on current situation
    this.updateBehavior(gameState, aiPlayer)

    // Make decision based on current behavior
    this.makeDecision(gameState, aiPlayer, deltaTime)
  }

  private findTarget(gameState: GameState, aiPlayer: Player): void {
    const enemies = Object.values(gameState.players).filter((p) => p.id !== this.playerId && p.health > 0)

    if (enemies.length === 0) {
      this.state.targetId = null
      return
    }

    // Prioritize human players (non-AI)
    const humanEnemies = enemies.filter((p) => !p.id.startsWith("ai_"))
    const targetPool = humanEnemies.length > 0 ? humanEnemies : enemies

    // Find closest enemy
    let closestEnemy = targetPool[0]
    let closestDistance = this.getDistance(aiPlayer.position, closestEnemy.position)

    for (const enemy of targetPool) {
      const distance = this.getDistance(aiPlayer.position, enemy.position)
      if (distance < closestDistance) {
        closestDistance = distance
        closestEnemy = enemy
      }
    }

    this.state.targetId = closestEnemy.id
  }

  private updateBehavior(gameState: GameState, aiPlayer: Player): void {
    if (!this.state.targetId) {
      this.state.currentBehavior = "idle"
      return
    }

    const target = gameState.players[this.state.targetId]
    if (!target) {
      this.state.currentBehavior = "idle"
      return
    }

    const distance = this.getDistance(aiPlayer.position, target.position)

    // Behavior logic
    if (distance > 300) {
      this.state.currentBehavior = "seek"
    } else if (distance > 150) {
      this.state.currentBehavior = "attack"
    } else if (aiPlayer.health < 30) {
      this.state.currentBehavior = "evade"
    } else {
      this.state.currentBehavior = "attack"
    }
  }

  private makeDecision(gameState: GameState, aiPlayer: Player, deltaTime: number): void {
    // Reset decision
    this.lastDecision = {
      moveUp: false,
      moveDown: false,
      moveLeft: false,
      moveRight: false,
      shoot: false,
      drawBow: false,
      specialAttack: false,
    }

    if (!this.state.targetId) return

    const target = gameState.players[this.state.targetId]
    if (!target) return

    const now = Date.now()
    const distance = this.getDistance(aiPlayer.position, target.position)

    // Calculate direction to target
    const dx = target.position.x - aiPlayer.position.x
    const dy = target.position.y - aiPlayer.position.y
    const targetAngle = Math.atan2(dy, dx)

    // Set target rotation for aiming
    this.lastDecision.targetRotation = targetAngle

    switch (this.state.currentBehavior) {
      case "seek":
        this.handleSeekBehavior(dx, dy, distance)
        break

      case "attack":
        this.handleAttackBehavior(gameState, aiPlayer, target, dx, dy, distance, now)
        break

      case "evade":
        this.handleEvadeBehavior(dx, dy)
        break

      case "idle":
        // Random movement when idle
        if (Math.random() < 0.1) {
          this.lastDecision.moveUp = Math.random() < 0.5
          this.lastDecision.moveDown = Math.random() < 0.5
          this.lastDecision.moveLeft = Math.random() < 0.5
          this.lastDecision.moveRight = Math.random() < 0.5
        }
        break
    }
  }

  private handleSeekBehavior(dx: number, dy: number, distance: number): void {
    // Move towards target
    if (Math.abs(dx) > 10) {
      this.lastDecision.moveRight = dx > 0
      this.lastDecision.moveLeft = dx < 0
    }
    if (Math.abs(dy) > 10) {
      this.lastDecision.moveDown = dy > 0
      this.lastDecision.moveUp = dy < 0
    }
  }

  private handleAttackBehavior(
    gameState: GameState,
    aiPlayer: Player,
    target: Player,
    dx: number,
    dy: number,
    distance: number,
    now: number,
  ): void {
    // Maintain optimal distance (150-250 units)
    if (distance < 150) {
      // Too close, back away
      this.lastDecision.moveLeft = dx > 0
      this.lastDecision.moveRight = dx < 0
      this.lastDecision.moveUp = dy > 0
      this.lastDecision.moveDown = dy < 0
    } else if (distance > 250) {
      // Too far, move closer
      this.lastDecision.moveRight = dx > 0
      this.lastDecision.moveLeft = dx < 0
      this.lastDecision.moveDown = dy > 0
      this.lastDecision.moveUp = dy < 0
    } else {
      // Good distance, strafe around target
      const perpAngle = Math.atan2(dy, dx) + Math.PI / 2
      const strafeX = Math.cos(perpAngle)
      const strafeY = Math.sin(perpAngle)

      this.lastDecision.moveRight = strafeX > 0
      this.lastDecision.moveLeft = strafeX < 0
      this.lastDecision.moveDown = strafeY > 0
      this.lastDecision.moveUp = strafeY < 0
    }

    // Shooting logic
    const timeSinceLastShot = now - this.state.lastShotTime
    const hasLineOfSight = this.hasLineOfSight(gameState, aiPlayer.position, target.position)

    if (hasLineOfSight && timeSinceLastShot > 1000) {
      // 1 second between shots
      if (!aiPlayer.isDrawingBow && this.state.bowDrawStartTime === 0) {
        // Start drawing bow
        this.lastDecision.drawBow = true
        this.state.bowDrawStartTime = now
      } else if (aiPlayer.isDrawingBow && now - this.state.bowDrawStartTime > 800) {
        // Release after 0.8 seconds of drawing
        this.lastDecision.drawBow = false
        this.lastDecision.shoot = true
        this.state.lastShotTime = now
        this.state.bowDrawStartTime = 0
      } else if (aiPlayer.isDrawingBow) {
        // Continue drawing
        this.lastDecision.drawBow = true
      }
    }

    // Special attack if close and available
    if (distance < 100 && aiPlayer.specialAttackCooldown <= 0 && Math.random() < 0.3) {
      this.lastDecision.specialAttack = true
    }
  }

  private handleEvadeBehavior(dx: number, dy: number): void {
    // Move away from target
    this.lastDecision.moveLeft = dx > 0
    this.lastDecision.moveRight = dx < 0
    this.lastDecision.moveUp = dy > 0
    this.lastDecision.moveDown = dy < 0
  }

  private getDistance(pos1: { x: number; y: number }, pos2: { x: number; y: number }): number {
    const dx = pos2.x - pos1.x
    const dy = pos2.y - pos1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  private hasLineOfSight(gameState: GameState, from: { x: number; y: number }, to: { x: number; y: number }): boolean {
    // Simplified line of sight - just check distance and basic obstacles
    const distance = this.getDistance(from, to)
    return distance < 400 // Max shooting range
  }

  getDecision(): AIDecision {
    return { ...this.lastDecision }
  }

  getState(): AIState {
    return { ...this.state }
  }
}
