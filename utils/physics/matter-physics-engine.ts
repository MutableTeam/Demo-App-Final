import Matter from "matter-js"
import type { GameObject, Player, Vector2D } from "../../components/pvp-game/game-engine"

// Main physics engine class for Archer Arena
export class ArcherPhysicsEngine {
  // Matter.js modules
  private engine: Matter.Engine
  private world: Matter.World
  private bodies: Record<string, Matter.Body> = {}
  private walls: Matter.Body[] = []
  private arrows: Record<string, Matter.Body> = {}

  // Configuration
  private config = {
    gravity: { x: 0, y: 0 }, // No gravity by default (top-down game)
    airFriction: 0.05,
    restitution: 0.7, // Bounciness
    arrowDensity: 0.2,
    playerDensity: 0.8,
    wallDensity: 1.0,
    debugMode: false,
  }

  constructor(debugMode = false) {
    // Create engine
    this.engine = Matter.Engine.create({
      gravity: this.config.gravity,
    })

    this.world = this.engine.world
    this.config.debugMode = debugMode

    // Set global properties
    Matter.World.add(this.world, [])
  }

  // Initialize physics world with game objects
  public initializeWorld(
    players: Record<string, Player>,
    walls: GameObject[],
    arenaSize: { width: number; height: number },
  ): void {
    // Clear existing bodies
    Matter.World.clear(this.world, false)
    this.bodies = {}
    this.walls = []
    this.arrows = {}

    // Add arena boundaries
    this.addArenaBoundaries(arenaSize)

    // Add walls
    walls.forEach((wall) => {
      this.addWall(wall)
    })

    // Add players
    Object.values(players).forEach((player) => {
      this.addPlayer(player)
    })

    // Log initialization
    if (this.config.debugMode) {
      console.log("Physics world initialized with:", {
        players: Object.keys(players).length,
        walls: walls.length,
        arenaSize,
      })
    }
  }

  // Add arena boundaries as static bodies
  private addArenaBoundaries({ width, height }: { width: number; height: number }): void {
    const thickness = 50 // Thick invisible walls

    // Create boundaries
    const ground = Matter.Bodies.rectangle(width / 2, height + thickness / 2, width, thickness, {
      isStatic: true,
      label: "boundary-bottom",
    })

    const ceiling = Matter.Bodies.rectangle(width / 2, -thickness / 2, width, thickness, {
      isStatic: true,
      label: "boundary-top",
    })

    const leftWall = Matter.Bodies.rectangle(-thickness / 2, height / 2, thickness, height, {
      isStatic: true,
      label: "boundary-left",
    })

    const rightWall = Matter.Bodies.rectangle(width + thickness / 2, height / 2, thickness, height, {
      isStatic: true,
      label: "boundary-right",
    })

    // Add boundaries to world
    Matter.World.add(this.world, [ground, ceiling, leftWall, rightWall])

    // Store for later reference
    this.walls.push(ground, ceiling, leftWall, rightWall)
  }

  // Add a player to the physics world
  public addPlayer(player: Player): void {
    // Create circular body for player
    const body = Matter.Bodies.circle(player.position.x, player.position.y, player.size, {
      density: this.config.playerDensity,
      frictionAir: this.config.airFriction,
      restitution: this.config.restitution * 0.5, // Players bounce less
      label: `player-${player.id}`,
    })

    // Add to world
    Matter.World.add(this.world, [body])

    // Store reference
    this.bodies[player.id] = body

    if (this.config.debugMode) {
      console.log(`Added player ${player.id} to physics world at position:`, player.position)
    }
  }

  // Add a wall to the physics world
  public addWall(wall: GameObject): void {
    // Create rectangular body for wall
    const body = Matter.Bodies.rectangle(
      wall.position.x,
      wall.position.y,
      wall.size * 2, // Width
      wall.size * 2, // Height
      {
        isStatic: true,
        density: this.config.wallDensity,
        restitution: this.config.restitution * 0.3, // Walls bounce less
        label: `wall-${wall.id}`,
      },
    )

    // Add to world
    Matter.World.add(this.world, [body])

    // Store reference
    this.walls.push(body)
  }

  // Add an arrow to the physics world
  public addArrow(arrow: GameObject): void {
    // Calculate arrow dimensions based on size
    const arrowLength = arrow.size * 6
    const arrowWidth = arrow.size

    // Create a rectangle for the arrow
    const body = Matter.Bodies.rectangle(arrow.position.x, arrow.position.y, arrowLength, arrowWidth, {
      density: this.config.arrowDensity,
      frictionAir: this.config.airFriction * 0.5, // Arrows have less air friction
      restitution: this.config.restitution,
      angle: arrow.rotation, // Set initial rotation
      label: `arrow-${arrow.id}`,
    })

    // Set velocity
    Matter.Body.setVelocity(body, {
      x: arrow.velocity.x,
      y: arrow.velocity.y,
    })

    // Add to world
    Matter.World.add(this.world, [body])

    // Store reference
    this.arrows[arrow.id] = body
  }

  // Remove an arrow from the physics world
  public removeArrow(arrowId: string): void {
    const body = this.arrows[arrowId]
    if (body) {
      Matter.World.remove(this.world, body)
      delete this.arrows[arrowId]
    }
  }

  // Apply force to a player (for movement)
  public applyForceToPlayer(playerId: string, force: Vector2D): void {
    const body = this.bodies[playerId]
    if (body) {
      Matter.Body.applyForce(body, body.position, force)
    }
  }

  // Set velocity directly (for teleports, dashes, etc.)
  public setPlayerVelocity(playerId: string, velocity: Vector2D): void {
    const body = this.bodies[playerId]
    if (body) {
      Matter.Body.setVelocity(body, velocity)
    }
  }

  // Update the physics world
  public update(deltaTime: number): void {
    // Run the engine update
    Matter.Engine.update(this.engine, deltaTime * 1000) // Convert to ms
  }

  // Get updated positions for game objects
  public getUpdatedPositions(): {
    players: Record<string, { position: Vector2D; rotation: number }>
    arrows: Record<string, { position: Vector2D; rotation: number }>
  } {
    const players: Record<string, { position: Vector2D; rotation: number }> = {}
    const arrows: Record<string, { position: Vector2D; rotation: number }> = {}

    // Update player positions
    Object.entries(this.bodies).forEach(([id, body]) => {
      players[id] = {
        position: { x: body.position.x, y: body.position.y },
        rotation: body.angle,
      }
    })

    // Update arrow positions
    Object.entries(this.arrows).forEach(([id, body]) => {
      arrows[id] = {
        position: { x: body.position.x, y: body.position.y },
        rotation: body.angle,
      }
    })

    return { players, arrows }
  }

  // Check collisions between objects
  public checkCollisions(): {
    arrowHits: Array<{ arrowId: string; targetId: string; point: Vector2D }>
    playerWallCollisions: Array<{ playerId: string; wallId: string }>
  } {
    const arrowHits: Array<{ arrowId: string; targetId: string; point: Vector2D }> = []
    const playerWallCollisions: Array<{ playerId: string; wallId: string }> = []

    // Get all collisions
    const collisions = Matter.Query.collides(
      [...Object.values(this.arrows)],
      [...Object.values(this.bodies), ...this.walls],
    )

    // Process collisions
    collisions.forEach((collision) => {
      const bodyA = collision.bodyA
      const bodyB = collision.bodyB

      // Extract IDs from labels
      const labelA = bodyA.label || ""
      const labelB = bodyB.label || ""

      // Arrow hit player
      if (labelA.startsWith("arrow-") && labelB.startsWith("player-")) {
        const arrowId = labelA.replace("arrow-", "")
        const playerId = labelB.replace("player-", "")

        arrowHits.push({
          arrowId,
          targetId: playerId,
          point: collision.collision.supports[0] || bodyB.position,
        })
      }
      // Player hit arrow
      else if (labelA.startsWith("player-") && labelB.startsWith("arrow-")) {
        const playerId = labelA.replace("player-", "")
        const arrowId = labelB.replace("arrow-", "")

        arrowHits.push({
          arrowId,
          targetId: playerId,
          point: collision.collision.supports[0] || bodyA.position,
        })
      }
      // Player hit wall
      else if (labelA.startsWith("player-") && (labelB.startsWith("wall-") || labelB.startsWith("boundary-"))) {
        const playerId = labelA.replace("player-", "")
        const wallId = labelB

        playerWallCollisions.push({
          playerId,
          wallId,
        })
      }
      // Wall hit player
      else if (labelA.startsWith("wall-") || (labelA.startsWith("boundary-") && labelB.startsWith("player-"))) {
        const wallId = labelA
        const playerId = labelB.replace("player-", "")

        playerWallCollisions.push({
          playerId,
          wallId,
        })
      }
    })

    return { arrowHits, playerWallCollisions }
  }

  // Clean up resources
  public destroy(): void {
    Matter.World.clear(this.world, false)
    Matter.Engine.clear(this.engine)
  }
}
