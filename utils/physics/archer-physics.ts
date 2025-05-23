import { MatterPhysicsEngine } from "./matter-engine"
import { logger } from "../logger"
import type Matter from "matter-js"

// Define collision categories for filtering
export const CollisionCategories = {
  PLAYER: 0x0001,
  ARROW: 0x0002,
  OBSTACLE: 0x0004,
  BOUNDARY: 0x0008,
  POWERUP: 0x0010,
}

// Define physics properties for game entities
export const PhysicsProperties = {
  PLAYER: {
    friction: 0.05,
    restitution: 0.2,
    density: 0.002,
    collisionFilter: {
      category: CollisionCategories.PLAYER,
      mask:
        CollisionCategories.PLAYER |
        CollisionCategories.OBSTACLE |
        CollisionCategories.BOUNDARY |
        CollisionCategories.POWERUP,
    },
  },
  ARROW: {
    friction: 0.01,
    restitution: 0.1,
    density: 0.0005,
    collisionFilter: {
      category: CollisionCategories.ARROW,
      mask: CollisionCategories.PLAYER | CollisionCategories.OBSTACLE | CollisionCategories.BOUNDARY,
    },
  },
  OBSTACLE: {
    friction: 0.8,
    restitution: 0.1,
    density: 0.01,
    collisionFilter: {
      category: CollisionCategories.OBSTACLE,
      mask: CollisionCategories.PLAYER | CollisionCategories.ARROW | CollisionCategories.BOUNDARY,
    },
  },
}

/**
 * ArcherPhysics - Specialized physics handler for the Archer Arena game
 * This class provides game-specific physics functionality built on top of the Matter.js engine
 */
export class ArcherPhysics {
  private engine: MatterPhysicsEngine
  private playerBodies: Map<string, Matter.Body> = new Map()
  private arrowBodies: Map<string, Matter.Body> = new Map()
  private obstacleBodies: Map<string, Matter.Body> = new Map()
  private powerupBodies: Map<string, Matter.Body> = new Map()

  constructor(width: number, height: number) {
    // Initialize the physics engine with appropriate gravity for an archer game
    this.engine = new MatterPhysicsEngine({
      gravity: { x: 0, y: 0.2 }, // Light gravity for arrows
      enableSleeping: true,
      timeScale: 1,
    })

    // Create boundaries
    this.createArenaLimits(width, height)

    logger.info("ArcherPhysics initialized with arena size:", { width, height })
  }

  /**
   * Start the physics simulation
   */
  start(): void {
    this.engine.start()
  }

  /**
   * Stop the physics simulation
   */
  stop(): void {
    this.engine.stop()
  }

  /**
   * Update the physics simulation manually
   * @param delta - Time delta in milliseconds
   */
  update(delta: number): void {
    this.engine.update(delta)
  }

  /**
   * Create the arena boundaries
   * @param width - Width of the arena
   * @param height - Height of the arena
   */
  private createArenaLimits(width: number, height: number): void {
    const thickness = 50

    // Create boundaries with specific collision filtering
    const boundaryOptions = {
      isStatic: true,
      collisionFilter: {
        category: CollisionCategories.BOUNDARY,
        mask: CollisionCategories.PLAYER | CollisionCategories.ARROW | CollisionCategories.OBSTACLE,
      },
    }

    // Top boundary
    this.engine.createRectangle({
      x: width / 2,
      y: -thickness / 2,
      width: width,
      height: thickness,
      label: "boundary-top",
      ...boundaryOptions,
    })

    // Bottom boundary
    this.engine.createRectangle({
      x: width / 2,
      y: height + thickness / 2,
      width: width,
      height: thickness,
      label: "boundary-bottom",
      ...boundaryOptions,
    })

    // Left boundary
    this.engine.createRectangle({
      x: -thickness / 2,
      y: height / 2,
      width: thickness,
      height: height,
      label: "boundary-left",
      ...boundaryOptions,
    })

    // Right boundary
    this.engine.createRectangle({
      x: width + thickness / 2,
      y: height / 2,
      width: thickness,
      height: height,
      label: "boundary-right",
      ...boundaryOptions,
    })
  }

  /**
   * Create a player physics body
   * @param id - Unique player ID
   * @param x - Initial X position
   * @param y - Initial Y position
   * @param radius - Player collision radius
   * @returns The created body
   */
  createPlayer(id: string, x: number, y: number, radius: number): Matter.Body {
    const body = this.engine.createCircle({
      x,
      y,
      radius,
      label: `player-${id}`,
      ...PhysicsProperties.PLAYER,
    })

    this.playerBodies.set(id, body)

    // Set up player-specific collision handling
    this.engine.onCollision(`player-${id}`, (playerBody, otherBody) => {
      if (otherBody.label?.startsWith("arrow-")) {
        // Handle player hit by arrow
        const arrowId = otherBody.label.replace("arrow-", "")
        logger.debug("Player hit by arrow:", { playerId: id, arrowId })

        // Emit player hit event (to be implemented)
      } else if (otherBody.label?.startsWith("powerup-")) {
        // Handle player collecting powerup
        const powerupId = otherBody.label.replace("powerup-", "")
        logger.debug("Player collected powerup:", { playerId: id, powerupId })

        // Emit powerup collection event (to be implemented)
      }
    })

    return body
  }

  /**
   * Create an arrow physics body
   * @param id - Unique arrow ID
   * @param x - Initial X position
   * @param y - Initial Y position
   * @param angle - Arrow angle in radians
   * @param velocity - Initial velocity
   * @returns The created body
   */
  createArrow(id: string, x: number, y: number, angle: number, velocity: { x: number; y: number }): Matter.Body {
    // Create a rectangle for the arrow (better for collision than a circle)
    const body = this.engine.createRectangle({
      x,
      y,
      width: 30, // Arrow length
      height: 5, // Arrow thickness
      angle,
      label: `arrow-${id}`,
      ...PhysicsProperties.ARROW,
    })

    // Set initial velocity
    this.engine.setVelocity(body, velocity)

    this.arrowBodies.set(id, body)

    // Set up arrow-specific collision handling
    this.engine.onCollision(`arrow-${id}`, (arrowBody, otherBody) => {
      if (otherBody.label?.startsWith("player-")) {
        // Handle arrow hitting player
        const playerId = otherBody.label.replace("player-", "")
        logger.debug("Arrow hit player:", { arrowId: id, playerId })

        // Emit arrow hit event (to be implemented)
      } else if (otherBody.label?.startsWith("obstacle-") || otherBody.label?.startsWith("boundary-")) {
        // Handle arrow hitting obstacle or boundary
        logger.debug("Arrow hit obstacle or boundary:", { arrowId: id })

        // Emit arrow hit obstacle event (to be implemented)
      }
    })

    return body
  }

  /**
   * Create an obstacle physics body
   * @param id - Unique obstacle ID
   * @param x - X position
   * @param y - Y position
   * @param width - Obstacle width
   * @param height - Obstacle height
   * @param isStatic - Whether the obstacle is static
   * @returns The created body
   */
  createObstacle(id: string, x: number, y: number, width: number, height: number, isStatic = true): Matter.Body {
    const body = this.engine.createRectangle({
      x,
      y,
      width,
      height,
      isStatic,
      label: `obstacle-${id}`,
      ...PhysicsProperties.OBSTACLE,
    })

    this.obstacleBodies.set(id, body)
    return body
  }

  /**
   * Create a powerup physics body
   * @param id - Unique powerup ID
   * @param x - X position
   * @param y - Y position
   * @param radius - Powerup radius
   * @returns The created body
   */
  createPowerup(id: string, x: number, y: number, radius: number): Matter.Body {
    const body = this.engine.createCircle({
      x,
      y,
      radius,
      isStatic: true,
      label: `powerup-${id}`,
      collisionFilter: {
        category: CollisionCategories.POWERUP,
        mask: CollisionCategories.PLAYER,
      },
    })

    this.powerupBodies.set(id, body)
    return body
  }

  /**
   * Update player position and rotation
   * @param id - Player ID
   * @param position - New position
   * @param angle - New angle in radians
   */
  updatePlayer(id: string, position: { x: number; y: number }, angle?: number): void {
    const body = this.playerBodies.get(id)
    if (body) {
      this.engine.setPosition(body, position)
      if (angle !== undefined) {
        this.engine.setAngle(body, angle)
      }
    }
  }

  /**
   * Apply force to player (for movement)
   * @param id - Player ID
   * @param force - Force vector
   */
  applyPlayerForce(id: string, force: { x: number; y: number }): void {
    const body = this.playerBodies.get(id)
    if (body) {
      this.engine.applyForce(body, force)
    }
  }

  /**
   * Set player velocity directly
   * @param id - Player ID
   * @param velocity - Velocity vector
   */
  setPlayerVelocity(id: string, velocity: { x: number; y: number }): void {
    const body = this.playerBodies.get(id)
    if (body) {
      this.engine.setVelocity(body, velocity)
    }
  }

  /**
   * Get player position and angle
   * @param id - Player ID
   * @returns Position and angle or undefined if player not found
   */
  getPlayerPhysicsState(id: string): { position: { x: number; y: number }; angle: number } | undefined {
    const body = this.playerBodies.get(id)
    if (body) {
      return {
        position: { x: body.position.x, y: body.position.y },
        angle: body.angle,
      }
    }
    return undefined
  }

  /**
   * Get arrow position and angle
   * @param id - Arrow ID
   * @returns Position and angle or undefined if arrow not found
   */
  getArrowPhysicsState(id: string): { position: { x: number; y: number }; angle: number } | undefined {
    const body = this.arrowBodies.get(id)
    if (body) {
      return {
        position: { x: body.position.x, y: body.position.y },
        angle: body.angle,
      }
    }
    return undefined
  }

  /**
   * Remove a player from the physics simulation
   * @param id - Player ID
   */
  removePlayer(id: string): void {
    const body = this.playerBodies.get(id)
    if (body) {
      this.engine.removeBody(body)
      this.playerBodies.delete(id)
    }
  }

  /**
   * Remove an arrow from the physics simulation
   * @param id - Arrow ID
   */
  removeArrow(id: string): void {
    const body = this.arrowBodies.get(id)
    if (body) {
      this.engine.removeBody(body)
      this.arrowBodies.delete(id)
    }
  }

  /**
   * Remove an obstacle from the physics simulation
   * @param id - Obstacle ID
   */
  removeObstacle(id: string): void {
    const body = this.obstacleBodies.get(id)
    if (body) {
      this.engine.removeBody(body)
      this.obstacleBodies.delete(id)
    }
  }

  /**
   * Remove a powerup from the physics simulation
   * @param id - Powerup ID
   */
  removePowerup(id: string): void {
    const body = this.powerupBodies.get(id)
    if (body) {
      this.engine.removeBody(body)
      this.powerupBodies.delete(id)
    }
  }

  /**
   * Clear all entities from the physics simulation
   */
  clear(): void {
    this.engine.clearWorld()
    this.playerBodies.clear()
    this.arrowBodies.clear()
    this.obstacleBodies.clear()
    this.powerupBodies.clear()
  }
}
