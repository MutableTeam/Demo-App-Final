export interface AIDecision {
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
  targetRotation: number
}

export interface AIController {
  update: (playerId: string, gameState: any, deltaTime: number) => AIDecision
}

export function createAIController(): AIController {
  const lastTargetId: string | null = null
  let lastShootTime = 0
  const lastMoveTime = 0
  const moveDirection = { x: 0, y: 0 }
  let behaviorState = "seek" // seek, attack, evade
  let stateTimer = 0

  const update = (playerId: string, gameState: any, deltaTime: number): AIDecision => {
    const aiPlayer = gameState.players[playerId]
    if (!aiPlayer || aiPlayer.health <= 0) {
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
        targetRotation: 0,
      }
    }

    stateTimer += deltaTime

    // Find closest enemy (prioritize human players)
    const enemies = Object.values(gameState.players).filter((p: any) => p.id !== playerId && p.health > 0) as any[]

    if (enemies.length === 0) {
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
        targetRotation: aiPlayer.rotation,
      }
    }

    // Sort enemies by distance, prioritizing human players
    enemies.sort((a, b) => {
      const aIsHuman = !a.id.startsWith("ai-")
      const bIsHuman = !b.id.startsWith("ai-")

      if (aIsHuman && !bIsHuman) return -1
      if (!aIsHuman && bIsHuman) return 1

      const distA = Math.sqrt(
        Math.pow(a.position.x - aiPlayer.position.x, 2) + Math.pow(a.position.y - aiPlayer.position.y, 2),
      )
      const distB = Math.sqrt(
        Math.pow(b.position.x - aiPlayer.position.x, 2) + Math.pow(b.position.y - aiPlayer.position.y, 2),
      )

      return distA - distB
    })

    const target = enemies[0]
    const distanceToTarget = Math.sqrt(
      Math.pow(target.position.x - aiPlayer.position.x, 2) + Math.pow(target.position.y - aiPlayer.position.y, 2),
    )

    // Calculate angle to target
    const angleToTarget = Math.atan2(target.position.y - aiPlayer.position.y, target.position.x - aiPlayer.position.x)

    // Behavior state machine
    if (behaviorState === "seek" && distanceToTarget < 200) {
      behaviorState = "attack"
      stateTimer = 0
    } else if (behaviorState === "attack" && (distanceToTarget > 300 || aiPlayer.health < 30)) {
      behaviorState = "evade"
      stateTimer = 0
    } else if (behaviorState === "evade" && stateTimer > 2 && aiPlayer.health > 50) {
      behaviorState = "seek"
      stateTimer = 0
    }

    // Movement logic
    let moveUp = false
    let moveDown = false
    let moveLeft = false
    let moveRight = false

    if (behaviorState === "seek" || behaviorState === "attack") {
      // Move towards target with some randomness
      const moveToX = target.position.x + (Math.random() - 0.5) * 50
      const moveToY = target.position.y + (Math.random() - 0.5) * 50

      if (aiPlayer.position.x < moveToX - 20) moveRight = true
      if (aiPlayer.position.x > moveToX + 20) moveLeft = true
      if (aiPlayer.position.y < moveToY - 20) moveDown = true
      if (aiPlayer.position.y > moveToY + 20) moveUp = true
    } else if (behaviorState === "evade") {
      // Move away from target
      if (aiPlayer.position.x < target.position.x) moveLeft = true
      else moveRight = true
      if (aiPlayer.position.y < target.position.y) moveUp = true
      else moveDown = true
    }

    // Shooting logic
    const currentTime = Date.now() / 1000
    let shouldShoot = false

    if (behaviorState === "attack" && distanceToTarget < 250 && currentTime - lastShootTime > 1.5) {
      // Check if we have a clear shot (simplified line of sight)
      const angleDiff = Math.abs(angleToTarget - aiPlayer.rotation)
      const normalizedAngleDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff)

      if (normalizedAngleDiff < 0.3) {
        // Within 17 degrees
        shouldShoot = true
        lastShootTime = currentTime
      }
    }

    // Special attack logic
    let shouldSpecial = false
    if (distanceToTarget < 150 && aiPlayer.specialAttackCooldown <= 0 && Math.random() < 0.1) {
      shouldSpecial = true
    }

    // Dash logic
    let shouldDash = false
    if (behaviorState === "evade" && Math.random() < 0.05) {
      shouldDash = true
    }

    return {
      controls: {
        up: moveUp,
        down: moveDown,
        left: moveLeft,
        right: moveRight,
        shoot: shouldShoot,
        dash: shouldDash,
        special: shouldSpecial,
        explosiveArrow: false,
      },
      targetRotation: angleToTarget,
    }
  }

  return { update }
}
