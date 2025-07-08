import {
  type LastStandGameState,
  type Player,
  type Arrow,
  createEnemy,
  generateWave,
  getRandomSpawnPosition,
  getEnemyTypeForWave,
} from "./game-state"
import { audioManager } from "@/utils/audio-manager"

// Update game state
export function updateLastStandGameState(state: LastStandGameState, deltaTime: number): LastStandGameState {
  // If game is over or paused, don't update
  if (state.isGameOver || state.isPaused) {
    return state
  }

  // Create a deep copy of the state to avoid mutation issues
  const newState = {
    ...state,
    player: { ...state.player },
    enemies: [...state.enemies],
    arrows: [...state.arrows],
    currentWave: { ...state.currentWave },
    playerStats: { ...state.playerStats },
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
    const speed = 200 // pixels per second

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
  if (newState.player.controls.shoot) {
    if (!newState.player.isDrawingBow) {
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
    }
  } else if (newState.player.isDrawingBow && newState.player.drawStartTime !== null) {
    // Release arrow
    const currentTime = Date.now() / 1000
    const drawTime = currentTime - newState.player.drawStartTime

    // Check if this is a weak shot (less than 30% draw)
    const minDrawTime = newState.player.minDrawTime
    const isWeakShot = drawTime < minDrawTime

    // Calculate damage and speed based on draw time
    const damage = calculateArrowDamage(drawTime, newState.player.maxDrawTime, isWeakShot)
    const arrowSpeed = calculateArrowSpeed(drawTime, newState.player.maxDrawTime)

    // Adjust arrow properties based on draw strength
    let finalArrowSpeed = arrowSpeed
    let arrowRange = 800 // Default range

    if (isWeakShot) {
      // Weak shots move slower and fall to ground quickly
      finalArrowSpeed = arrowSpeed * 0.3
      arrowRange = 200 // Much shorter range
    }

    const arrowVelocity = {
      x: Math.cos(newState.player.rotation) * finalArrowSpeed,
      y: Math.sin(newState.player.rotation) * finalArrowSpeed,
    }

    const arrowPosition = {
      x: newState.player.position.x + Math.cos(newState.player.rotation) * (newState.player.size + 5),
      y: newState.player.position.y + Math.sin(newState.player.rotation) * (newState.player.size + 5),
    }

    // Create the arrow
    const arrow: Arrow = {
      id: `arrow-${Date.now()}-${Math.random()}`,
      position: { ...arrowPosition },
      velocity: { ...arrowVelocity },
      rotation: newState.player.rotation,
      size: 5,
      damage: damage,
      ownerId: newState.player.id,
      isWeakShot: isWeakShot,
      distanceTraveled: 0,
      range: arrowRange,
    }

    newState.arrows.push(arrow)
    newState.playerStats.shotsFired++

    // Play shoot sound
    try {
      audioManager.playSound("shoot")
    } catch (error) {
      console.error("Failed to play shoot sound:", error)
    }

    // Reset bow state
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
  newState.enemies = newState.enemies.map((enemy) => {
    // Create a deep copy of the enemy
    const updatedEnemy = {
      ...enemy,
      position: { ...enemy.position },
      velocity: { ...enemy.velocity },
    }

    // Update enemy movement - move towards player
    const dx = newState.player.position.x - updatedEnemy.position.x
    const dy = newState.player.position.y - updatedEnemy.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Set rotation to face player
    updatedEnemy.rotation = Math.atan2(dy, dx)

    // Move towards player if not in attack range
    const attackRange = updatedEnemy.size + newState.player.size + 10

    if (distance > attackRange) {
      // Move towards player
      const speed = updatedEnemy.speed
      const dirX = dx / distance
      const dirY = dy / distance

      updatedEnemy.velocity.x = dirX * speed
      updatedEnemy.velocity.y = dirY * speed
      updatedEnemy.animationState = "walk"

      // Apply velocity
      updatedEnemy.position.x += updatedEnemy.velocity.x * deltaTime
      updatedEnemy.position.y += updatedEnemy.velocity.y * deltaTime
    } else {
      // In attack range, stop moving and attack
      updatedEnemy.velocity.x = 0
      updatedEnemy.velocity.y = 0
      updatedEnemy.animationState = "attack"

      // Attack player if cooldown is complete
      if (updatedEnemy.attackCooldown <= 0) {
        // Only damage player if not invulnerable
        if (!newState.player.isInvulnerable) {
          newState.player.health -= updatedEnemy.damage
          newState.player.isInvulnerable = true
          newState.player.invulnerabilityTimer = 0.5 // 0.5 seconds of invulnerability
          newState.player.animationState = "hit"
          newState.player.hitAnimationTimer = 0.3
          newState.player.lastAnimationChange = Date.now()

          // Play hit sound
          try {
            audioManager.playSound("hit")
          } catch (error) {
            console.error("Failed to play hit sound:", error)
          }
        }

        // Reset attack cooldown
        updatedEnemy.attackCooldown = 1.0 // 1 second between attacks
      } else {
        // Reduce attack cooldown
        updatedEnemy.attackCooldown -= deltaTime
      }
    }

    return updatedEnemy
  })

  // Update arrows
  newState.arrows = newState.arrows.filter((arrow) => {
    // Move arrow
    arrow.position.x += arrow.velocity.x * deltaTime
    arrow.position.y += arrow.velocity.y * deltaTime

    // Update distance traveled
    arrow.distanceTraveled =
      (arrow.distanceTraveled || 0) +
      Math.sqrt(Math.pow(arrow.velocity.x * deltaTime, 2) + Math.pow(arrow.velocity.y * deltaTime, 2))

    // Check if arrow is out of bounds
    if (
      arrow.position.x < -50 ||
      arrow.position.x > width + 50 ||
      arrow.position.y < -50 ||
      arrow.position.y > height + 50
    ) {
      return false
    }

    // Check for weak shot range limit
    if (arrow.isWeakShot && arrow.distanceTraveled > (arrow.range || 200)) {
      return false
    }

    // Check collision with enemies
    for (let i = 0; i < newState.enemies.length; i++) {
      const enemy = newState.enemies[i]

      const dx = arrow.position.x - enemy.position.x
      const dy = arrow.position.y - enemy.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < arrow.size + enemy.size) {
        // Hit enemy
        const damage = arrow.damage || 10
        enemy.health -= damage

        // Play hit sound
        try {
          audioManager.playSound("hit")
        } catch (error) {
          console.error("Failed to play hit sound:", error)
        }

        // Check if enemy is dead
        if (enemy.health <= 0) {
          // Remove enemy
          newState.enemies.splice(i, 1)

          // Add score
          newState.playerStats.score += enemy.value
          newState.playerStats.kills++

          // Play death sound
          try {
            audioManager.playSound("death")
          } catch (error) {
            console.error("Failed to play death sound:", error)
          }
        }

        // Count as hit for accuracy
        newState.playerStats.shotsHit++

        // Calculate accuracy
        if (newState.playerStats.shotsFired > 0) {
          newState.playerStats.accuracy = (newState.playerStats.shotsHit / newState.playerStats.shotsFired) * 100
        }

        // Arrow is consumed
        return false
      }
    }

    return true
  })

  // Check if player is dead
  if (newState.player.health <= 0 && !newState.isGameOver) {
    newState.isGameOver = true
    newState.player.animationState = "death"
    newState.player.lastAnimationChange = Date.now()

    // Submit score to leaderboard
    // This would normally call an API to submit the score
    const leaderboardEntry = {
      id: newState.player.id,
      playerName: newState.player.name,
      score: newState.playerStats.score,
      wavesCompleted: newState.playerStats.wavesCompleted,
      timeAlive: newState.playerStats.timeAlive,
    }

    // For now, just add to local leaderboard
    newState.leaderboard.push(leaderboardEntry)
  }

  return newState
}

// Helper functions
function calculateArrowDamage(drawTime: number, maxDrawTime: number, isWeakShot: boolean): number {
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

function calculateArrowSpeed(drawTime: number, maxDrawTime: number): number {
  // Minimum speed is 300, max is 600 based on draw time
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
