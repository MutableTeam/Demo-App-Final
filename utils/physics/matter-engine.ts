import * as Matter from "matter-js"
import { logger } from "../logger"

/**
 * MatterPhysicsEngine - A wrapper around Matter.js for physics simulation
 * This class handles the physics simulation for the Archer Arena game
 */
export class MatterPhysicsEngine {
  private engine: Matter.Engine
  private world: Matter.World
  private runner: Matter.Runner
  private bodies: Map<string, Matter.Body> = new Map()
  private collisionCallbacks: Map<string, (bodyA: Matter.Body, bodyB: Matter.Body) => void> = new Map()
  private isRunning = false

  constructor(
    options: {
      gravity?: { x: number; y: number }
      enableSleeping?: boolean
      timeScale?: number
    } = {},
  ) {
    // Create a Matter.js engine
    this.engine = Matter.Engine.create({
      gravity: options.gravity || { x: 0, y: 0.5 },
      enableSleeping: options.enableSleeping !== undefined ? options.enableSleeping : true,
      timing: {
        timeScale: options.timeScale || 1,
      },
    })

    this.world = this.engine.world
    this.runner = Matter.Runner.create()

    // Set up collision event handling
    Matter.Events.on(this.engine, "collisionStart", (event) => {
      const pairs = event.pairs

      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i]
        const bodyA = pair.bodyA
        const bodyB = pair.bodyB

        // Check if either body has a collision callback
        if (bodyA.label && this.collisionCallbacks.has(bodyA.label)) {
          this.collisionCallbacks.get(bodyA.label)!(bodyA, bodyB)
        }

        if (bodyB.label && this.collisionCallbacks.has(bodyB.label)) {
          this.collisionCallbacks.get(bodyB.label)!(bodyB, bodyA)
        }
      }
    })

    logger.info("MatterPhysicsEngine initialized")
  }

  /**
   * Start the physics simulation
   */
  start(): void {
    if (!this.isRunning) {
      Matter.Runner.run(this.runner, this.engine)
      this.isRunning = true
      logger.info("Physics engine started")
    }
  }

  /**
   * Stop the physics simulation
   */
  stop(): void {
    if (this.isRunning) {
      Matter.Runner.stop(this.runner)
      this.isRunning = false
      logger.info("Physics engine stopped")
    }
  }

  /**
   * Update the physics simulation manually (if not using the runner)
   * @param delta - Time delta in milliseconds
   */
  update(delta: number): void {
    Matter.Engine.update(this.engine, delta)
  }

  /**
   * Create a rectangular body
   * @param options - Body creation options
   * @returns The created body
   */
  createRectangle(options: {
    x: number
    y: number
    width: number
    height: number
    isStatic?: boolean
    label?: string
    angle?: number
    friction?: number
    restitution?: number
    density?: number
    collisionFilter?: Matter.ICollisionFilter
  }): Matter.Body {
    const body = Matter.Bodies.rectangle(options.x, options.y, options.width, options.height, {
      isStatic: options.isStatic || false,
      label: options.label,
      angle: options.angle || 0,
      friction: options.friction !== undefined ? options.friction : 0.1,
      restitution: options.restitution !== undefined ? options.restitution : 0.6,
      density: options.density !== undefined ? options.density : 0.001,
      collisionFilter: options.collisionFilter,
    })

    Matter.Composite.add(this.world, body)

    if (options.label) {
      this.bodies.set(options.label, body)
    }

    return body
  }

  /**
   * Create a circular body
   * @param options - Body creation options
   * @returns The created body
   */
  createCircle(options: {
    x: number
    y: number
    radius: number
    isStatic?: boolean
    label?: string
    friction?: number
    restitution?: number
    density?: number
    collisionFilter?: Matter.ICollisionFilter
  }): Matter.Body {
    const body = Matter.Bodies.circle(options.x, options.y, options.radius, {
      isStatic: options.isStatic || false,
      label: options.label,
      friction: options.friction !== undefined ? options.friction : 0.1,
      restitution: options.restitution !== undefined ? options.restitution : 0.6,
      density: options.density !== undefined ? options.density : 0.001,
      collisionFilter: options.collisionFilter,
    })

    Matter.Composite.add(this.world, body)

    if (options.label) {
      this.bodies.set(options.label, body)
    }

    return body
  }

  /**
   * Create a polygon body
   * @param options - Body creation options
   * @returns The created body
   */
  createPolygon(options: {
    x: number
    y: number
    sides: number
    radius: number
    isStatic?: boolean
    label?: string
    angle?: number
    friction?: number
    restitution?: number
    density?: number
    collisionFilter?: Matter.ICollisionFilter
  }): Matter.Body {
    const body = Matter.Bodies.polygon(options.x, options.y, options.sides, options.radius, {
      isStatic: options.isStatic || false,
      label: options.label,
      angle: options.angle || 0,
      friction: options.friction !== undefined ? options.friction : 0.1,
      restitution: options.restitution !== undefined ? options.restitution : 0.6,
      density: options.density !== undefined ? options.density : 0.001,
      collisionFilter: options.collisionFilter,
    })

    Matter.Composite.add(this.world, body)

    if (options.label) {
      this.bodies.set(options.label, body)
    }

    return body
  }

  /**
   * Create a composite body from multiple parts
   * @param bodies - Array of bodies to compose
   * @param options - Composite options
   * @returns The created composite
   */
  createComposite(
    bodies: Matter.Body[],
    options: {
      label?: string
    } = {},
  ): Matter.Composite {
    const composite = Matter.Composite.create({
      label: options.label,
    })

    Matter.Composite.add(composite, bodies)
    Matter.Composite.add(this.world, composite)

    return composite
  }

  /**
   * Apply force to a body
   * @param body - The body to apply force to
   * @param force - The force vector
   */
  applyForce(body: Matter.Body, force: { x: number; y: number }): void {
    Matter.Body.applyForce(body, body.position, force)
  }

  /**
   * Set the position of a body
   * @param body - The body to position
   * @param position - The new position
   */
  setPosition(body: Matter.Body, position: { x: number; y: number }): void {
    Matter.Body.setPosition(body, position)
  }

  /**
   * Set the velocity of a body
   * @param body - The body to set velocity for
   * @param velocity - The velocity vector
   */
  setVelocity(body: Matter.Body, velocity: { x: number; y: number }): void {
    Matter.Body.setVelocity(body, velocity)
  }

  /**
   * Set the angle of a body
   * @param body - The body to rotate
   * @param angle - The angle in radians
   */
  setAngle(body: Matter.Body, angle: number): void {
    Matter.Body.setAngle(body, angle)
  }

  /**
   * Get a body by its label
   * @param label - The body label
   * @returns The body or undefined if not found
   */
  getBody(label: string): Matter.Body | undefined {
    return this.bodies.get(label)
  }

  /**
   * Remove a body from the world
   * @param body - The body to remove
   */
  removeBody(body: Matter.Body): void {
    Matter.Composite.remove(this.world, body)

    if (body.label) {
      this.bodies.delete(body.label)
    }
  }

  /**
   * Clear all bodies from the world
   */
  clearWorld(): void {
    Matter.Composite.clear(this.world, false)
    this.bodies.clear()
    this.collisionCallbacks.clear()
  }

  /**
   * Register a collision callback for a specific body
   * @param bodyLabel - The label of the body to watch for collisions
   * @param callback - The callback function
   */
  onCollision(bodyLabel: string, callback: (bodyA: Matter.Body, bodyB: Matter.Body) => void): void {
    this.collisionCallbacks.set(bodyLabel, callback)
  }

  /**
   * Create boundaries around the game area
   * @param width - Width of the game area
   * @param height - Height of the game area
   * @param thickness - Thickness of the boundary walls
   */
  createBoundaries(width: number, height: number, thickness = 50): void {
    // Top boundary
    this.createRectangle({
      x: width / 2,
      y: -thickness / 2,
      width: width,
      height: thickness,
      isStatic: true,
      label: "boundary-top",
    })

    // Bottom boundary
    this.createRectangle({
      x: width / 2,
      y: height + thickness / 2,
      width: width,
      height: thickness,
      isStatic: true,
      label: "boundary-bottom",
    })

    // Left boundary
    this.createRectangle({
      x: -thickness / 2,
      y: height / 2,
      width: thickness,
      height: height,
      isStatic: true,
      label: "boundary-left",
    })

    // Right boundary
    this.createRectangle({
      x: width + thickness / 2,
      y: height / 2,
      width: thickness,
      height: height,
      isStatic: true,
      label: "boundary-right",
    })
  }
}
