import { ArcherPhysicsEngine } from "./matter-physics-engine"
import type { GameState } from "../../components/pvp-game/game-engine"

// Physics integration manager for Archer Arena
export class PhysicsIntegration {
  private physicsEngine: ArcherPhysicsEngine
  private isInitialized = false
  private debugMode: boolean

  constructor(debugMode = false) {
    this.physicsEngine = new ArcherPhysicsEngine(debugMode)
    this.debugMode = debugMode
  }

  // Initialize physics with current game state
  public initialize(gameState: GameState): void {
    if (this.isInitialized) {
      this.physicsEngine.destroy()
    }

    this.physicsEngine.initializeWorld(gameState.players, gameState.walls, gameState.arenaSize)

    // Add existing arrows
    gameState.arrows.forEach((arrow) => {
      this.physicsEngine.addArrow(arrow)
    })

    this.isInitialized = true

    if (this.debugMode) {
      console.log("Physics integration initialized with game state:", {
        players: Object.keys(gameState.players).length,
        arrows: gameState.arrows.length,
        walls: gameState.walls.length,
      })
    }
  }

  // Update physics and apply changes to game state
  public update(gameState: GameState, deltaTime: number): GameState {
    if (!this.isInitialized) {
      return gameState
    }

    // Create a copy of the game state to avoid mutation
    const newState = { ...gameState }

    // Process player controls and apply forces
    Object.entries(newState.players).forEach(([playerId, player]) => {
      // Skip dead players
      if (player.health <= 0) return

      // Calculate movement force based on controls
      const movementForce = { x: 0, y: 0 }
      const forceMultiplier = player.isDrawingBow ? 0.4 : 1.0 // Reduced force when drawing bow
      const baseForce = 0.005 // Base force value (will need tuning)

      if (player.controls.up) movementForce.y -= baseForce * forceMultiplier
      if (player.controls.down) movementForce.y += baseForce * forceMultiplier
      if (player.controls.left) movementForce.x -= baseForce * forceMultiplier
      if (player.controls.right) movementForce.x += baseForce * forceMultiplier

      // Apply dash if active
      if (player.isDashing && player.dashVelocity) {
        this.physicsEngine.setPlayerVelocity(playerId, {
          x: player.dashVelocity.x * 0.05, // Scale down for Matter.js
          y: player.dashVelocity.y * 0.05,
        })
      }
      // Apply normal movement force
      else if (movementForce.x !== 0 || movementForce.y !== 0) {
        this.physicsEngine.applyForceToPlayer(playerId, movementForce)
      }
    })

    // Update physics simulation
    this.physicsEngine.update(deltaTime)

    // Get updated positions
    const { players: updatedPlayers, arrows: updatedArrows } = this.physicsEngine.getUpdatedPositions()

    // Apply updated positions to game state
    Object.entries(updatedPlayers).forEach(([playerId, data]) => {
      if (newState.players[playerId]) {
        newState.players[playerId].position = data.position
        // Only update rotation if it's from player input, not physics
      }
    })

    // Apply updated arrow positions
    Object.entries(updatedArrows).forEach(([arrowId, data]) => {
      const arrow = newState.arrows.find((a) => a.id === arrowId)
      if (arrow) {
        arrow.position = data.position
        arrow.rotation = data.rotation
      }
    })

    // Check for collisions
    const { arrowHits, playerWallCollisions } = this.physicsEngine.checkCollisions()

    // Process arrow hits
    arrowHits.forEach((hit) => {
      const arrow = newState.arrows.find((a) => a.id === hit.arrowId)
      const player = newState.players[hit.targetId]

      if (arrow && player) {
        // Apply damage to player
        if (player.health > 0 && player.invulnerableTime <= 0) {
          player.health -= arrow.damage || 10
          player.lastDamageFrom = arrow.ownerId
          player.invulnerableTime = 0.1 // Brief invulnerability

          // Set hit animation
          if (player.animationState !== "death") {
            player.animationState = "hit"
            player.lastAnimationChange = Date.now()
            player.hitAnimationTimer = 0.5
          }

          // Check for death
          if (player.health <= 0) {
            player.health = 0
            player.animationState = "death"
            player.lastAnimationChange = Date.now()
            player.deaths += 1

            // Award kill to the player who fired the arrow
            if (arrow.ownerId && newState.players[arrow.ownerId]) {
              newState.players[arrow.ownerId].kills += 1
              newState.players[arrow.ownerId].score += 100
            }
          }
        }

        // Remove the arrow
        newState.arrows = newState.arrows.filter((a) => a.id !== hit.arrowId)
        this.physicsEngine.removeArrow(hit.arrowId)
      }
    })

    // Process player-wall collisions (already handled by Matter.js physics)

    return newState
  }

  // Add a new arrow to the physics world
  public addArrow(arrow: any): void {
    if (this.isInitialized) {
      this.physicsEngine.addArrow(arrow)
    }
  }

  // Clean up resources
  public destroy(): void {
    if (this.isInitialized) {
      this.physicsEngine.destroy()
      this.isInitialized = false
    }
  }
}

// Create a singleton instance for global use
export const physicsIntegration = new PhysicsIntegration(false)
