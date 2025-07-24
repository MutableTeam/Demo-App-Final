import {
  type LastStandGameState,
  type Player,
  type Arrow,
  type VisualEffect,
  createEnemy,
  generateWave,
  getRandomSpawnPosition,
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
  return distance < entity1.size / 2 + entity2.size / 2
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

function createEffect(
  state: LastStandGameState,
  type: "explosion" | "stomp",
  position: Vector2D,
  radius: number,
  damage: number,
  duration: number,
): LastStandGameState {
  const effect: VisualEffect = {
    id: `${type}-${Date.now()}-${Math.random()}`,
    type,
    position,
    radius,
    damage,
    duration,
    life: duration,
  }
  state.effects.push(effect)
  if (type === "explosion") {
    try {
      audioManager.playSound("explosion")
    } catch (error) {
      console.error("Failed to play explosion sound:", error)
    }
  }
  return state
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

  // Update player state
  if (newState.player.stunTimer > 0) {
    newState.player.stunTimer -= deltaTime
    if (newState.player.stunTimer <= 0) {
      newState.player.isStunned = false
    }
  }

  if (!newState.player.isStunned) {
    // Update player cooldowns
    if (newState.player.dashCooldown > 0) newState.player.dashCooldown -= deltaTime
    if (newState.player.specialAttackCooldown > 0) newState.player.specialAttackCooldown -= deltaTime

    // Handle player dash
    if (newState.player.controls.dash && newState.player.dashCooldown <= 0 && !newState.player.isDashing) {
      newState.player.isDashing = true
      newState.player.dashStartTime = Date.now() / 1000
      newState.player.dashVelocity = calculateDashVelocity(newState.player)
      newState.player.dashCooldown = 1.5
      newState.player.animationState = "dash"
      newState.player.lastAnimationChange = Date.now()
      try {
        audioManager.playSound("dash")
      } catch (error) {
        console.error("Failed to play dash sound:", error)
      }
    }
  }

  if (newState.player.isInvulnerable) {
    newState.player.invulnerabilityTimer -= deltaTime
    if (newState.player.invulnerabilityTimer <= 0) {
      newState.player.isInvulnerable = false
    }
  }

  if (newState.player.isDashing && newState.player.dashStartTime !== null) {
    const dashDuration = 0.15
    if (Date.now() / 1000 - newState.player.dashStartTime >= dashDuration) {
      newState.player.isDashing = false
    } else if (newState.player.dashVelocity) {
      newState.player.position.x += newState.player.dashVelocity.x * deltaTime
      newState.player.position.y += newState.player.dashVelocity.y * deltaTime
    }
  } else if (!newState.player.isStunned) {
    // Normal movement
    const speed = 200 * newState.player.moveSpeedMultiplier
    const movementMultiplier = newState.player.isDrawingBow ? 0.4 : 1.0
    newState.player.velocity = { x: 0, y: 0 }
    if (newState.player.controls.up) newState.player.velocity.y = -speed * movementMultiplier
    if (newState.player.controls.down) newState.player.velocity.y = speed * movementMultiplier
    if (newState.player.controls.left) newState.player.velocity.x = -speed * movementMultiplier
    if (newState.player.controls.right) newState.player.velocity.x = speed * movementMultiplier

    if (newState.player.velocity.x !== 0 && newState.player.velocity.y !== 0) {
      const magnitude = Math.hypot(newState.player.velocity.x, newState.player.velocity.y)
      newState.player.velocity.x = (newState.player.velocity.x / magnitude) * speed * movementMultiplier
      newState.player.velocity.y = (newState.player.velocity.y / magnitude) * speed * movementMultiplier
    }
    newState.player.position.x += newState.player.velocity.x * deltaTime
    newState.player.position.y += newState.player.velocity.y * deltaTime
  }

  // Handle bow drawing and shooting
  if (!newState.player.isStunned) {
    if (newState.player.controls.shoot && !newState.player.isDrawingBow) {
      newState.player.isDrawingBow = true
      newState.player.drawStartTime = Date.now() / 1000
      newState.player.animationState = "fire"
    } else if (
      !newState.player.controls.shoot &&
      newState.player.isDrawingBow &&
      newState.player.drawStartTime !== null
    ) {
      const drawTime = Date.now() / 1000 - newState.player.drawStartTime
      const isWeakShot = drawTime < newState.player.minDrawTime
      const damage = calculateArrowDamage(drawTime, newState.player, isWeakShot)
      const speed = calculateArrowSpeed(drawTime, newState.player.maxDrawTime)
      const numArrows = 1 + (newState.player.multiShot || 0) * 2
      const spreadAngle = 0.15
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
          explosionRadius: 80,
          isFrost: newState.player.frostArrows,
          isHoming: newState.player.homingArrows,
          lifespan: newState.player.homingArrows ? 2.5 : undefined,
        }
        newState.arrows.push(arrow)
      }
      newState.playerStats.shotsFired += numArrows
      newState.player.isDrawingBow = false
      newState.player.drawStartTime = null
    }
  }

  // Keep player within arena bounds
  const { width, height } = newState.arenaSize
  newState.player.position.x = Math.max(
    newState.player.size / 2,
    Math.min(width - newState.player.size / 2, newState.player.position.x),
  )
  newState.player.position.y = Math.max(
    newState.player.size / 2,
    Math.min(height - newState.player.size / 2, newState.player.position.y),
  )

  // --- Spawning Logic ---
  const wave = newState.currentWave
  if (!wave.isComplete && wave.remainingEnemies > 0) {
    const canSpawn =
      newState.gameTime - wave.lastSpawnTime >= (wave.isSpawningBurst ? wave.bursts.delay : wave.spawnDelay)

    if (canSpawn) {
      wave.isSpawningBurst = true
      wave.lastSpawnTime = newState.gameTime

      const enemyType = wave.enemyPool[Math.floor(Math.random() * wave.enemyPool.length)]
      const spawnPosition = getRandomSpawnPosition(newState.arenaSize)
      const enemy = createEnemy(enemyType, spawnPosition, wave.number)
      newState.enemies.push(enemy)

      wave.remainingEnemies--
      wave.enemiesSpawnedInBurst++

      if (wave.enemiesSpawnedInBurst >= wave.bursts.count || wave.remainingEnemies === 0) {
        wave.isSpawningBurst = false
        wave.enemiesSpawnedInBurst = 0
      }
    }
  }

  // Check for wave completion
  if (
    newState.currentWave.remainingEnemies === 0 &&
    newState.enemies.length === 0 &&
    !newState.currentWave.isComplete
  ) {
    newState.currentWave.isComplete = true
    newState.completedWaves++
    newState.playerStats.wavesCompleted++
    newState.currentWave = generateWave(newState.currentWave.number + 1, newState.arenaSize)
  }

  // Update enemies
  newState.enemies.forEach((enemy) => {
    const dx = newState.player.position.x - enemy.position.x
    const dy = newState.player.position.y - enemy.position.y
    const distance = Math.hypot(dx, dy)
    enemy.rotation = Math.atan2(dy, dx)

    switch (enemy.type) {
      case "wraith":
        enemy.phaseTimer = (enemy.phaseTimer || 5) - deltaTime
        if (enemy.phaseTimer <= 0) {
          enemy.isPhased = !enemy.isPhased
          enemy.phaseTimer = enemy.isPhased ? 2 : 5
        }
        break
      case "goblin_sapper":
        if (distance < 50 && !enemy.isChargingAttack) {
          enemy.isChargingAttack = true
          enemy.chargeTimer = 1.0
        }
        break
      case "behemoth":
        if (distance < 150 && !enemy.isChargingAttack && (enemy.attackCooldown || 0) <= 0) {
          enemy.isChargingAttack = true
          enemy.chargeTimer = 1.5
        }
        break
    }

    if (enemy.isChargingAttack) {
      enemy.chargeTimer = (enemy.chargeTimer || 0) - deltaTime
      if (enemy.chargeTimer <= 0) {
        if (enemy.type === "goblin_sapper") {
          newState = createEffect(newState, "explosion", enemy.position, 100, enemy.damage, 0.5)
          enemy.health = 0
        } else if (enemy.type === "behemoth") {
          newState = createEffect(newState, "stomp", enemy.position, 120, 0, 0.4)
          enemy.attackCooldown = 4
        }
        enemy.isChargingAttack = false
      }
    } else {
      if (enemy.slowTimer > 0) enemy.slowTimer -= deltaTime
      const speedMultiplier = enemy.slowTimer > 0 ? 0.5 : 1
      if (!enemy.isPhased) {
        enemy.position.x += (dx / distance) * enemy.speed * speedMultiplier * deltaTime
        enemy.position.y += (dy / distance) * enemy.speed * speedMultiplier * deltaTime
      }
    }

    if (checkCircleCollision(enemy, newState.player) && (enemy.attackCooldown || 0) <= 0) {
      if (!newState.player.isInvulnerable) {
        newState.player.health -= enemy.damage
        newState.player.isInvulnerable = true
        newState.player.invulnerabilityTimer = 0.5
      }
      enemy.attackCooldown = 2.0
    }
    if (enemy.attackCooldown) enemy.attackCooldown -= deltaTime
  })

  // Update arrows
  const nextArrows: Arrow[] = []
  for (const arrow of newState.arrows) {
    let alive = true
    if (arrow.lifespan !== undefined) {
      arrow.lifespan -= deltaTime
      if (arrow.lifespan <= 0) alive = false
    }
    if (!alive) continue

    arrow.position.x += arrow.velocity.x * deltaTime
    arrow.position.y += arrow.velocity.y * deltaTime

    for (const enemy of newState.enemies) {
      if (enemy.health <= 0 || enemy.isPhased) continue
      if (checkCircleCollision(arrow, enemy)) {
        enemy.health -= arrow.damage
        if (arrow.isExplosive) {
          newState = createEffect(newState, "explosion", arrow.position, arrow.explosionRadius || 80, arrow.damage, 0.5)
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
      alive = false
    }

    if (alive) nextArrows.push(arrow)
  }
  newState.arrows = nextArrows

  // Update effects
  const activeEffects: VisualEffect[] = []
  for (const effect of newState.effects) {
    effect.life -= deltaTime
    if (effect.life > 0) {
      activeEffects.push(effect)
      if (effect.type === "explosion") {
        for (const enemy of newState.enemies) {
          if (checkCircleCollision({ position: effect.position, size: effect.radius * 2 }, enemy)) {
            enemy.health -= (effect.damage || 0) * deltaTime * 2
          }
        }
      } else if (effect.type === "stomp") {
        if (checkCircleCollision({ position: effect.position, size: effect.radius * 2 }, newState.player)) {
          if (!newState.player.isInvulnerable) {
            newState.player.isStunned = true
            newState.player.stunTimer = 1.0
          }
        }
      }
    }
  }
  newState.effects = activeEffects

  // Remove dead enemies
  const deadEnemies = newState.enemies.filter((e) => e.health <= 0)
  if (deadEnemies.length > 0) {
    newState.enemies = newState.enemies.filter((e) => e.health > 0)
    for (const deadEnemy of deadEnemies) {
      newState.player.xp += deadEnemy.xpValue * newState.player.xpMultiplier
      newState.playerStats.kills++
      newState.playerStats.score += deadEnemy.value
    }
    newState = checkForLevelUp(newState)
  }

  // Check for game over
  if (newState.player.health <= 0 && !newState.isGameOver) {
    newState.isGameOver = true
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
  if (player.controls.up) dashVelocity.y -= 1
  if (player.controls.down) dashVelocity.y += 1
  if (player.controls.left) dashVelocity.x -= 1
  if (player.controls.right) dashVelocity.x += 1
  const magnitude = Math.hypot(dashVelocity.x, dashVelocity.y)
  if (magnitude > 0) {
    return { x: (dashVelocity.x / magnitude) * DASH_SPEED, y: (dashVelocity.y / magnitude) * DASH_SPEED }
  }
  return { x: Math.cos(player.rotation) * DASH_SPEED, y: Math.sin(player.rotation) * DASH_SPEED }
}

interface Vector2D {
  x: number
  y: number
}
