import {
  type LastStandGameState,
  type Player,
  type Arrow,
  type Enemy,
  createEnemy,
  generateWave,
  getRandomSpawnPosition,
  getEnemyTypeForWave,
  calculateXpForLevel,
} from "./game-state"
import { audioManager } from "@/utils/audio-manager"
import { UPGRADES } from "./upgrades"

// A more explicit collision check function
function checkCircleCollision(
  entity1: { position: Vector2D; size: number },
  entity2: { position: Vector2D; size: number },
): boolean {
  const dx = entity1.position.x - entity2.position.x
  const dy = entity1.position.y - entity2.position.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance < entity1.size + entity2.size
}

function applyUpgrade(state: LastStandGameState, upgradeId: string): LastStandGameState {
  const upgrade = UPGRADES.find((u) => u.id === upgradeId)
  if (!upgrade) return state

  const newPlayerState = upgrade.apply(state.player)
  const newUpgrades = { ...state.player.upgrades }
  newUpgrades[upgrade.id] = (newUpgrades[upgrade.id] || 0) + 1

  return {
    ...state,
    player: {
      ...state.player,
      ...newPlayerState,
      upgrades: newUpgrades,
    },
    isLevelingUp: false,
    isPaused: false,
  }
}

function checkForLevelUp(state: LastStandGameState): LastStandGameState {
  const newState = { ...state }
  while (newState.player.xp >= newState.player.xpToNextLevel) {
    newState.player.xp -= newState.player.xpToNextLevel
    newState.player.level++
    newState.player.xpToNextLevel = calculateXpForLevel(newState.player.level)

    // Trigger level up screen
    newState.isLevelingUp = true
    newState.isPaused = true

    // Get 3 random upgrades
    const available = UPGRADES.filter((u) => {
      const currentLevel = newState.player.upgrades[u.id] || 0
      return !u.maxLevel || currentLevel < u.maxLevel
    })

    const shuffled = available.sort(() => 0.5 - Math.random())
    newState.availableUpgrades = shuffled.slice(0, 3)

    // Heal player on level up
    newState.player.health = Math.min(newState.player.maxHealth, newState.player.health + 25)
  }
  return newState
}

// Update game state
export function updateLastStandGameState(
  state: LastStandGameState,
  deltaTime: number,
  actions: { type: "SELECT_UPGRADE"; payload: string }[] = [],
): LastStandGameState {
  let newState = { ...state }

  // Process actions first
  for (const action of actions) {
    if (action.type === "SELECT_UPGRADE") {
      newState = applyUpgrade(newState, action.payload)
    }
  }

  if (newState.isGameOver || newState.isPaused) {
    return newState
  }

  // Create a deep copy of the state to avoid mutation issues
  newState = {
    ...newState,
    player: { ...newState.player },
    enemies: [...newState.enemies],
    arrows: [...newState.arrows],
    currentWave: { ...newState.currentWave },
    playerStats: { ...newState.playerStats },
    effects: [...newState.effects],
  }

  // Update game time
  newState.gameTime += deltaTime
  newState.playerStats.timeAlive = newState.gameTime

  // Update player position and velocity
  newState.player.position = { ...newState.player.position }
  newState.player.velocity = { ...newState.player.velocity }
  if (newState.player.dashVelocity) {
    newState.player.dashVelocity = { ...newState.player.dashVelocity }
  }

  // Update player cooldowns
  if (newState.player.dashCooldown > 0) {
    newState.player.dashCooldown -= deltaTime
  }

  if (newState.player.specialAttackCooldown > 0) {
    newState.player.specialAttackCooldown -= deltaTime
  }

  if (newState.player.hitAnimationTimer > 0) {
    newState.player.hitAnimationTimer -= deltaTime
  }

  if (newState.player.isInvulnerable) {
    newState.player.invulnerabilityTimer -= deltaTime
    if (newState.player.invulnerabilityTimer <= 0) {
      newState.player.isInvulnerable = false
    }
  }

  // Handle player dash
  if (newState.player.controls.dash && newState.player.dashCooldown <= 0 && !newState.player.isDashing) {
    // Start dash
    newState.player.isDashing = true
    newState.player.dashStartTime = Date.now() / 1000
    newState.player.dashVelocity = calculateDashVelocity(newState.player)
    newState.player.dashCooldown = 1.5 // 1.5 second cooldown
    newState.player.animationState = "dash"
    newState.player.lastAnimationChange = Date.now()

    // Play dash sound
    try {
      audioManager.playSound("dash")
    } catch (error) {
      console.error("Failed to play dash sound:", error)
    }
  }

  if (newState.player.isDashing && newState.player.dashStartTime !== null) {
    const currentTime = Date.now() / 1000
    const dashDuration = 0.15 // 150ms dash

    // Check if dash should end
    if (currentTime - newState.player.dashStartTime >= dashDuration) {
      // End dash
      newState.player.isDashing = false
      newState.player.dashStartTime = null
      newState.player.dashVelocity = null

      // Return to appropriate animation
      if (newState.player.velocity.x !== 0 || newState.player.velocity.y !== 0) {
        newState.player.animationState = "run"
      } else {
        newState.player.animationState = "idle"
      }
      newState.player.lastAnimationChange = Date.now()
    } else if (newState.player.dashVelocity) {
      // Apply dash movement
      newState.player.position.x += newState.player.dashVelocity.x * deltaTime
      newState.player.position.y += newState.player.dashVelocity.y * deltaTime
    }
  } else {
    // Normal movement (only if not dashing)
    const speed = 200 * newState.player.moveSpeedMultiplier // pixels per second

    // Apply movement penalty when drawing bow
    const movementMultiplier = newState.player.isDrawingBow ? 0.4 : 1.0 // 40% speed when drawing bow

    // Reset velocity
    newState.player.velocity.x = 0
    newState.player.velocity.y = 0

    // Apply controls to velocity
    if (newState.player.controls.up) newState.player.velocity.y = -speed * movementMultiplier
    if (newState.player.controls.down) newState.player.velocity.y = speed * movementMultiplier
    if (newState.player.controls.left) newState.player.velocity.x = -speed * movementMultiplier
    if (newState.player.controls.right) newState.player.velocity.x = speed * movementMultiplier

    // Normalize diagonal movement
    if (newState.player.velocity.x !== 0 && newState.player.velocity.y !== 0) {
      const magnitude = Math.sqrt(
        newState.player.velocity.x * newState.player.velocity.x +
          newState.player.velocity.y * newState.player.velocity.y,
      )
      newState.player.velocity.x = (newState.player.velocity.x / magnitude) * speed * movementMultiplier
      newState.player.velocity.y = (newState.player.velocity.y / magnitude) * speed * movementMultiplier
    }

    // Apply velocity
    newState.player.position.x += newState.player.velocity.x * deltaTime
    newState.player.position.y += newState.player.velocity.y * deltaTime

    // Update animation state based on movement
    if (newState.player.hitAnimationTimer <= 0) {
      if (newState.player.velocity.x !== 0 || newState.player.velocity.y !== 0) {
        if (newState.player.animationState !== "run" && !newState.player.isDrawingBow) {
          newState.player.animationState = "run"
          newState.player.lastAnimationChange = Date.now()
        }
      } else if (newState.player.animationState !== "idle" && !newState.player.isDrawingBow) {
        newState.player.animationState = "idle"
        newState.player.lastAnimationChange = Date.now()
      }
    }
  }

  // Handle bow drawing
  if (newState.player.controls.shoot && !newState.player.isDrawingBow) {
    newState.player.isDrawingBow = true
    newState.player.drawStartTime = Date.now() / 1000 // Convert to seconds

    // Set animation to fire when starting to draw bow
    newState.player.animationState = "fire"
    newState.player.lastAnimationChange = Date.now()

    // Play draw sound
    try {
      audioManager.playSound("draw")
    } catch (error) {
      console.error("Failed to play draw sound:", error)
    }
  } else if (
    !newState.player.controls.shoot &&
    newState.player.isDrawingBow &&
    newState.player.drawStartTime !== null
  ) {
    const drawTime = Date.now() / 1000 - newState.player.drawStartTime
    const isWeakShot = drawTime < newState.player.minDrawTime
    const damage = calculateArrowDamage(drawTime, newState.player, isWeakShot)
    const speed = calculateArrowSpeed(drawTime, newState.player.maxDrawTime)

    const spreadAngle = 0.15 // Angle for multi-shot
    const numArrows = 1 + (newState.player.multiShot || 0) * 2
    const startAngle = newState.player.rotation - (spreadAngle * (numArrows - 1)) / 2

    for (let i = 0; i < numArrows; i++) {
      const angle = startAngle + i * spreadAngle
      const arrow: Arrow = {
        id: `arrow-${Date.now()}-${Math.random()}`,
        position: {
          x: newState.player.position.x + Math.cos(angle) * (newState.player.size + 5),
          y: newState.player.position.y + Math.sin(angle) * (newState.player.size + 5),
        },
        velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        rotation: angle,
        size: 5,
        damage: damage,
        ownerId: newState.player.id,
        isWeakShot,
        piercingLeft: newState.player.piercing || 0,
        bouncesLeft: newState.player.ricochet || 0,
        isExplosive: newState.player.explosiveArrows,
        isFrost: newState.player.frostArrows,
        isHoming: newState.player.homingArrows,
      }
      newState.arrows.push(arrow)
    }
    newState.playerStats.shotsFired += numArrows
    newState.player.isDrawingBow = false
    newState.player.drawStartTime = null
  }

  // Handle special attack
  if (newState.player.controls.special) {
    if (!newState.player.isChargingSpecial && newState.player.specialAttackCooldown <= 0) {
      newState.player.isChargingSpecial = true
      newState.player.specialChargeStartTime = Date.now() / 1000

      // Set animation to fire when charging special
      newState.player.animationState = "fire"
      newState.player.lastAnimationChange = Date.now()
    }
  } else if (newState.player.isChargingSpecial && newState.player.specialChargeStartTime !== null) {
    // Release special attack (3 arrows in quick succession)
    const currentTime = Date.now() / 1000
    const chargeTime = currentTime - newState.player.specialChargeStartTime

    // Only trigger if charged for at least 0.5 seconds
    if (chargeTime >= 0.5) {
      const arrowSpeed = 500 // Fixed speed for special attack
      const spreadAngle = 0.1 // Small spread between arrows

      // Fire 3 arrows with slight spread
      for (let i = -1; i <= 1; i++) {
        const angle = newState.player.rotation + i * spreadAngle
        const arrowVelocity = {
          x: Math.cos(angle) * arrowSpeed,
          y: Math.sin(angle) * arrowSpeed,
        }

        const arrowPosition = {
          x: newState.player.position.x + Math.cos(angle) * (newState.player.size + 5),
          y: newState.player.position.y + Math.sin(angle) * (newState.player.size + 5),
        }

        const arrow: Arrow = {
          id: `arrow-special-${Date.now()}-${Math.random()}-${i}`,
          position: { ...arrowPosition },
          velocity: { ...arrowVelocity },
          rotation: angle,
          size: 5,
          damage: 15,
          ownerId: newState.player.id,
          isWeakShot: false,
          distanceTraveled: 0,
          range: 800,
          piercingLeft: 0,
          bouncesLeft: 0,
          isExplosive: false,
          isFrost: false,
          isHoming: false,
        }

        newState.arrows.push(arrow)
      }

      newState.playerStats.shotsFired += 3

      // Play special attack sound
      try {
        audioManager.playSound("special")
      } catch (error) {
        console.error("Failed to play special sound:", error)
      }

      // Set cooldown for special attack
      newState.player.specialAttackCooldown = 5 // 5 seconds cooldown
    }

    // Reset special attack state
    newState.player.isChargingSpecial = false
    newState.player.specialChargeStartTime = null
  }

  // Keep player within arena bounds
  const { width, height } = newState.arenaSize
  newState.player.position.x = Math.max(
    newState.player.size,
    Math.min(width - newState.player.size, newState.player.position.x),
  )
  newState.player.position.y = Math.max(
    newState.player.size,
    Math.min(height - newState.player.size, newState.player.position.y),
  )

  // Update wave spawning
  if (!newState.currentWave.isComplete) {
    // Check if it's time to spawn a new enemy
    if (
      newState.currentWave.remainingEnemies > 0 &&
      newState.gameTime - newState.currentWave.lastSpawnTime >= newState.currentWave.spawnDelay
    ) {
      // Spawn a new enemy
      const spawnPosition = getRandomSpawnPosition(newState.arenaSize)
      const enemyType = getEnemyTypeForWave(newState.currentWave.number)
      const enemy = createEnemy(enemyType, spawnPosition, newState.currentWave.number)

      newState.enemies.push(enemy)
      newState.currentWave.remainingEnemies--
      newState.currentWave.lastSpawnTime = newState.gameTime
    }

    // Check if wave is complete
    if (newState.currentWave.remainingEnemies === 0 && newState.enemies.length === 0) {
      // Wave complete
      newState.currentWave.isComplete = true
      newState.completedWaves++
      newState.playerStats.wavesCompleted++

      // Generate next wave
      newState.currentWave = generateWave(newState.currentWave.number + 1, newState.arenaSize)
    }
  }

  // Update enemies
  newState.enemies.forEach((enemy) => {
    if (enemy.slowTimer > 0) {
      enemy.slowTimer -= deltaTime
      if (enemy.slowTimer <= 0) enemy.isSlowed = false
    }
    const speedMultiplier = enemy.isSlowed ? 0.5 : 1
    const dx = newState.player.position.x - enemy.position.x
    const dy = newState.player.position.y - enemy.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    enemy.rotation = Math.atan2(dy, dx)

    if (checkCircleCollision(enemy, newState.player)) {
      // Attack player
      if (enemy.attackCooldown <= 0) {
        if (!newState.player.isInvulnerable) {
          newState.player.health -= enemy.damage
          newState.player.isInvulnerable = true
          newState.player.invulnerabilityTimer = 0.5
        }
        enemy.attackCooldown = 1.0
      }
    } else {
      // Move towards player
      enemy.position.x += (dx / distance) * enemy.speed * speedMultiplier * deltaTime
      enemy.position.y += (dy / distance) * enemy.speed * speedMultiplier * deltaTime
    }
    if (enemy.attackCooldown > 0) {
      enemy.attackCooldown -= deltaTime
    }
  })

  // OPTIMIZED ARROW LOGIC
  const nextArrows: Arrow[] = []
  for (const arrow of newState.arrows) {
    // Homing logic
    if (arrow.isHoming && (!arrow.homingTarget || arrow.homingTarget.health <= 0)) {
      let closestEnemy: Enemy | null = null
      let minDistance = Number.POSITIVE_INFINITY
      for (const enemy of newState.enemies) {
        const d = Math.hypot(enemy.position.x - arrow.position.x, enemy.position.y - arrow.position.y)
        if (d < minDistance) {
          minDistance = d
          closestEnemy = enemy
        }
      }
      arrow.homingTarget = closestEnemy || undefined
    }

    if (arrow.isHoming && arrow.homingTarget) {
      const targetVector = {
        x: arrow.homingTarget.position.x - arrow.position.x,
        y: arrow.homingTarget.position.y - arrow.position.y,
      }
      const magnitude = Math.hypot(targetVector.x, targetVector.y)
      const desiredVel = { x: (targetVector.x / magnitude) * 600, y: (targetVector.y / magnitude) * 600 }
      arrow.velocity.x = arrow.velocity.x * 0.95 + desiredVel.x * 0.05
      arrow.velocity.y = arrow.velocity.y * 0.95 + desiredVel.y * 0.05
      arrow.rotation = Math.atan2(arrow.velocity.y, arrow.velocity.x)
    }

    arrow.position.x += arrow.velocity.x * deltaTime
    arrow.position.y += arrow.velocity.y * deltaTime

    let alive = true
    const hitEnemiesThisFrame = new Set<string>()

    for (const enemy of newState.enemies) {
      if (hitEnemiesThisFrame.has(enemy.id) || enemy.health <= 0) continue

      if (checkCircleCollision(arrow, enemy)) {
        hitEnemiesThisFrame.add(enemy.id)
        enemy.health -= arrow.damage
        if (arrow.isFrost) {
          enemy.isSlowed = true
          enemy.slowTimer = 2
        }

        if (arrow.isExplosive) {
          // Explosion logic here
        }

        arrow.piercingLeft--
        if (arrow.piercingLeft < 0) {
          alive = false
          break
        }
      }
    }

    if (!alive) continue

    // Wall bouncing
    if (arrow.position.x < 0 || arrow.position.x > width || arrow.position.y < 0 || arrow.position.y > height) {
      if (arrow.bouncesLeft > 0) {
        arrow.bouncesLeft--
        if (arrow.position.x < 0 || arrow.position.x > width) arrow.velocity.x *= -1
        if (arrow.position.y < 0 || arrow.position.y > height) arrow.velocity.y *= -1
        arrow.rotation = Math.atan2(arrow.velocity.y, arrow.velocity.x)
      } else {
        alive = false
      }
    }

    if (alive) {
      nextArrows.push(arrow)
    }
  }
  newState.arrows = nextArrows

  // Remove dead enemies and grant XP
  const deadEnemies = newState.enemies.filter((e) => e.health <= 0)
  if (deadEnemies.length > 0) {
    newState.enemies = newState.enemies.filter((e) => e.health > 0)
    for (const deadEnemy of deadEnemies) {
      const xpGain = Math.floor(deadEnemy.xpValue * newState.player.xpMultiplier)
      newState.player.xp += xpGain
      newState.playerStats.kills++
      newState.playerStats.score += deadEnemy.value
    }
    newState = checkForLevelUp(newState)
  }

  // Check if player is dead
  if (newState.player.health <= 0 && !newState.isGameOver) {
    newState.isGameOver = true
    newState.player.animationState = "death"
    newState.player.lastAnimationChange = Date.now()
  }

  return newState
}

// Helper functions
function calculateArrowDamage(drawTime: number, player: Player, isWeakShot: boolean): number {
  if (isWeakShot) return 1
  const minDamage = 5
  const maxDamage = 25
  const drawPercentage = Math.min(drawTime / player.maxDrawTime, 1)
  const baseDamage = minDamage + drawPercentage * (maxDamage - minDamage)
  return baseDamage * player.damageMultiplier
}

function calculateArrowSpeed(drawTime: number, maxDrawTime: number): number {
  const minSpeed = 300
  const maxSpeed = 600
  const drawPercentage = Math.min(drawTime / maxDrawTime, 1)
  return minSpeed + drawPercentage * (maxSpeed - minSpeed)
}

// Calculate dash velocity based on input or facing direction
function calculateDashVelocity(player: Player): Vector2D {
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

// Define Vector2D interface
interface Vector2D {
  x: number
  y: number
}
