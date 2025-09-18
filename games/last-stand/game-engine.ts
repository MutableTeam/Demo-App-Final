import {
  type LastStandGameState,
  type Player,
  type Arrow,
  type Enemy,
  type Companion,
  type VisualEffect,
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

  // Reset controls and velocity to prevent sticky movement after unpausing
  newPlayerState.controls = {
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false,
    dash: false,
    special: false,
  }
  newPlayerState.velocity = { x: 0, y: 0 }
  newPlayerState.animationState = "idle" // Reset to idle state

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
  let newState = JSON.parse(JSON.stringify(state))

  // Process actions first. This can change the paused state.
  for (const action of actions) {
    if (action.type === "SELECT_UPGRADE") {
      newState = applyUpgrade(newState, action.payload)
    }
  }

  // If after processing actions, we are still paused or the game is over, do nothing else.
  if (newState.isGameOver || newState.isPaused) {
    return newState
  }

  // Update game time
  newState.gameTime += deltaTime
  newState.playerStats.timeAlive = newState.gameTime

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
    newState.player.isDashing = true
    newState.player.dashStartTime = Date.now() / 1000
    newState.player.dashVelocity = calculateDashVelocity(newState.player)
    newState.player.dashCooldown = newState.player.dashCooldownTime
    newState.player.animationState = "dash"
    newState.player.lastAnimationChange = Date.now()
    newState.player.controls.dash = false
    try {
      audioManager.playSound("dash")
    } catch (error) {
      console.error("Failed to play dash sound:", error)
    }
  }

  if (newState.player.isDashing && newState.player.dashStartTime !== null) {
    const currentTime = Date.now() / 1000
    const dashDuration = 0.15

    if (currentTime - newState.player.dashStartTime >= dashDuration) {
      newState.player.isDashing = false
      newState.player.dashStartTime = null
      newState.player.dashVelocity = null
      if (newState.player.velocity.x !== 0 || newState.player.velocity.y !== 0) {
        newState.player.animationState = "run"
      } else {
        newState.player.animationState = "idle"
      }
      newState.player.lastAnimationChange = Date.now()
    } else if (newState.player.dashVelocity) {
      newState.player.position.x += newState.player.dashVelocity.x * deltaTime
      newState.player.position.y += newState.player.dashVelocity.y * deltaTime
    }
  } else {
    // Normal movement
    const speed = 200 * newState.player.moveSpeedMultiplier
    const movementMultiplier = newState.player.isDrawingBow ? 0.4 : 1.0
    newState.player.velocity.x = 0
    newState.player.velocity.y = 0

    if (newState.player.controls.up) newState.player.velocity.y = -speed * movementMultiplier
    if (newState.player.controls.down) newState.player.velocity.y = speed * movementMultiplier
    if (newState.player.controls.left) newState.player.velocity.x = -speed * movementMultiplier
    if (newState.player.controls.right) newState.player.velocity.x = speed * movementMultiplier

    if (newState.player.velocity.x !== 0 && newState.player.velocity.y !== 0) {
      const magnitude = Math.sqrt(
        newState.player.velocity.x * newState.player.velocity.x +
          newState.player.velocity.y * newState.player.velocity.y,
      )
      newState.player.velocity.x = (newState.player.velocity.x / magnitude) * speed * movementMultiplier
      newState.player.velocity.y = (newState.player.velocity.y / magnitude) * speed * movementMultiplier
    }

    newState.player.position.x += newState.player.velocity.x * deltaTime
    newState.player.position.y += newState.player.velocity.y * deltaTime

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
    newState.player.drawStartTime = Date.now() / 1000
    newState.player.animationState = "fire"
    newState.player.lastAnimationChange = Date.now()
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

    const spreadAngle = 0.15
    const numArrows = 1 + (newState.player.multiShot || 0)
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
        lifetime: 6,
        isWeakShot,
        piercingLeft: newState.player.piercing || 0,
        bouncesLeft: newState.player.ricochet || 0,
        isExplosive: newState.player.explosiveArrows,
        isFrost: newState.player.frostArrows,
        isHoming: newState.player.homingArrows,
        homingTargetId: null,
      }
      newState.arrows.push(arrow)
    }
    newState.playerStats.shotsFired += numArrows
    newState.player.isDrawingBow = false
    newState.player.drawStartTime = null
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
    if (
      newState.currentWave.remainingEnemies > 0 &&
      newState.gameTime - newState.currentWave.lastSpawnTime >= newState.currentWave.spawnDelay
    ) {
      const spawnPosition = getRandomSpawnPosition(newState.arenaSize)
      const enemyType = getEnemyTypeForWave(newState.currentWave.number)
      const enemy = createEnemy(enemyType, spawnPosition, newState.currentWave.number)
      newState.enemies.push(enemy)
      newState.currentWave.remainingEnemies--
      newState.currentWave.lastSpawnTime = newState.gameTime
    }

    if (newState.currentWave.remainingEnemies === 0 && newState.enemies.length === 0) {
      newState.currentWave.isComplete = true
      newState.completedWaves++
      newState.playerStats.wavesCompleted++
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
      if (enemy.attackCooldown <= 0) {
        if (!newState.player.isInvulnerable) {
          newState.player.health -= enemy.damage
          newState.player.isInvulnerable = true
          newState.player.invulnerabilityTimer = 0.5
        }
        enemy.attackCooldown = 1.0
      }
    } else {
      enemy.position.x += (dx / distance) * enemy.speed * speedMultiplier * deltaTime
      enemy.position.y += (dy / distance) * enemy.speed * speedMultiplier * deltaTime
    }
    if (enemy.attackCooldown > 0) {
      enemy.attackCooldown -= deltaTime
    }
  })

  // Handle wolf companion
  if (newState.player.hasWolf && !newState.companions.some((c) => c.type === "wolf")) {
    const wolf: Companion = {
      id: `wolf-${newState.player.id}`,
      type: "wolf",
      position: { x: newState.player.position.x - 30, y: newState.player.position.y },
      target: null,
      attackCooldown: 0,
      speed: 150,
      damage: 10,
    }
    newState.companions.push(wolf)
  }

  // Update companions
  newState.companions.forEach((companion) => {
    if (companion.type === "wolf") {
      if (!companion.target || companion.target.health <= 0) {
        let closestEnemy: Enemy | null = null
        let minDistance = 300
        newState.enemies.forEach((enemy) => {
          const d = Math.hypot(enemy.position.x - companion.position.x, enemy.position.y - companion.position.y)
          if (d < minDistance) {
            minDistance = d
            closestEnemy = enemy
          }
        })
        companion.target = closestEnemy
      }

      if (companion.target) {
        const dx = companion.target.position.x - companion.position.x
        const dy = companion.target.position.y - companion.position.y
        const distance = Math.hypot(dx, dy)

        if (distance < 25) {
          if (companion.attackCooldown <= 0) {
            companion.target.health -= companion.damage
            companion.attackCooldown = 1.0
          }
        } else {
          companion.position.x += (dx / distance) * companion.speed * deltaTime
          companion.position.y += (dy / distance) * companion.speed * deltaTime
        }
      } else {
        const dx = newState.player.position.x - companion.position.x
        const dy = newState.player.position.y - companion.position.y
        const distance = Math.hypot(dx, dy)
        if (distance > 50) {
          companion.position.x += (dx / distance) * companion.speed * 0.8 * deltaTime
          companion.position.y += (dy / distance) * companion.speed * 0.8 * deltaTime
        }
      }

      if (companion.attackCooldown > 0) {
        companion.attackCooldown -= deltaTime
      }
    }
  })

  // Update arrows
  const nextArrows: Arrow[] = []
  for (const arrow of newState.arrows) {
    arrow.lifetime -= deltaTime
    if (arrow.lifetime <= 0) {
      continue
    }

    if (arrow.isHoming) {
      let targetEnemy = newState.enemies.find((e) => e.id === arrow.homingTargetId)

      if (!targetEnemy || targetEnemy.health <= 0) {
        let closestEnemy: Enemy | null = null
        let minDistance = 400 // Search radius
        for (const enemy of newState.enemies) {
          if (enemy.health > 0) {
            const d = Math.hypot(enemy.position.x - arrow.position.x, enemy.position.y - arrow.position.y)
            if (d < minDistance) {
              minDistance = d
              closestEnemy = enemy
            }
          }
        }
        arrow.homingTargetId = closestEnemy ? closestEnemy.id : null
        targetEnemy = closestEnemy || undefined
      }

      if (targetEnemy) {
        const targetVector = {
          x: targetEnemy.position.x - arrow.position.x,
          y: targetEnemy.position.y - arrow.position.y,
        }
        const magnitude = Math.hypot(targetVector.x, targetVector.y)
        if (magnitude > 0) {
          const desiredVel = { x: (targetVector.x / magnitude) * 600, y: (targetVector.y / magnitude) * 600 }
          arrow.velocity.x = arrow.velocity.x * 0.95 + desiredVel.x * 0.05
          arrow.velocity.y = arrow.velocity.y * 0.95 + desiredVel.y * 0.05
          arrow.rotation = Math.atan2(arrow.velocity.y, arrow.velocity.x)
        }
      }
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
          const explosion: VisualEffect = {
            id: `explosion-${Date.now()}`,
            type: "explosion",
            position: { ...arrow.position },
            radius: 75,
            duration: 0.3,
            life: 0.3,
          }
          newState.effects.push(explosion)

          newState.enemies.forEach((e) => {
            if (e.id !== enemy.id) {
              const dist = Math.hypot(e.position.x - explosion.position.x, e.position.y - explosion.position.y)
              if (dist < explosion.radius + e.size) {
                e.health -= 15
              }
            }
          })
          alive = false
          break
        }

        arrow.piercingLeft--
        if (arrow.piercingLeft < 0) {
          alive = false
          break
        }
      }
    }

    if (!alive) continue

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

  // Update and remove visual effects
  newState.effects = newState.effects
    .map((effect) => ({
      ...effect,
      life: effect.life - deltaTime,
    }))
    .filter((effect) => effect.life > 0)

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

function calculateDashVelocity(player: Player): Vector2D {
  const DASH_SPEED = 800
  const dashVelocity: Vector2D = { x: 0, y: 0 }

  if (player.controls.up || player.controls.down || player.controls.left || player.controls.right) {
    if (player.controls.up) dashVelocity.y -= 1
    if (player.controls.down) dashVelocity.y += 1
    if (player.controls.left) dashVelocity.x -= 1
    if (player.controls.right) dashVelocity.x += 1

    const magnitude = Math.sqrt(dashVelocity.x * dashVelocity.x + dashVelocity.y * dashVelocity.y)
    if (magnitude > 0) {
      dashVelocity.x = (dashVelocity.x / magnitude) * DASH_SPEED
      dashVelocity.y = (dashVelocity.y / magnitude) * DASH_SPEED
    }
  } else {
    dashVelocity.x = Math.cos(player.rotation) * DASH_SPEED
    dashVelocity.y = Math.sin(player.rotation) * DASH_SPEED
  }

  return dashVelocity
}

interface Vector2D {
  x: number
  y: number
}
