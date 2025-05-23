import { ArcherPhysics } from "./physics/archer-physics"
import { PixiRenderer } from "./rendering/pixi-renderer"
import { logger } from "./logger"

/**
 * ArcherGameIntegration - Connects physics and rendering for the Archer Arena game
 * This class serves as the bridge between Matter.js physics and Pixi.js rendering
 */
export class ArcherGameIntegration {
  private physics: ArcherPhysics
  private renderer: PixiRenderer
  private gameWidth: number
  private gameHeight: number
  private isRunning = false
  private lastTimestamp = 0
  private animationFrameId: number | null = null
  private players: Map<
    string,
    {
      physicsId: string
      spriteId: string
      animationIds: { [key: string]: string }
      currentAnimation: string
    }
  > = new Map()
  private arrows: Map<
    string,
    {
      physicsId: string
      spriteId: string
    }
  > = new Map()
  private obstacles: Map<
    string,
    {
      physicsId: string
      spriteId: string
    }
  > = new Map()
  private powerups: Map<
    string,
    {
      physicsId: string
      spriteId: string
      animationId: string
    }
  > = new Map()

  constructor(width: number, height: number) {
    this.gameWidth = width
    this.gameHeight = height

    // Initialize physics
    this.physics = new ArcherPhysics(width, height)

    // Initialize renderer
    this.renderer = new PixiRenderer({
      width,
      height,
      backgroundColor: 0x1a1a1a,
      antialias: true,
    })

    logger.info("ArcherGameIntegration initialized", { width, height })
  }

  /**
   * Initialize the game integration
   * @param container - DOM element to attach the renderer to
   * @returns Promise that resolves when initialization is complete
   */
  async initialize(container: HTMLElement): Promise<void> {
    // Attach renderer to DOM
    this.renderer.initialize(container)

    // Load textures
    await this.loadGameAssets()

    // Create background
    this.createBackground()

    logger.info("ArcherGameIntegration initialization complete")
  }

  /**
   * Load game assets (textures, etc.)
   * @returns Promise that resolves when assets are loaded
   */
  private async loadGameAssets(): Promise<void> {
    // Load textures for players, arrows, obstacles, etc.
    await this.renderer.loadTextures([
      { name: "background", url: "/images/archer-game-background.png" },
      { name: "player-idle", url: "/images/archer-idle.png" },
      { name: "player-run", url: "/images/archer-run.png" },
      { name: "player-shoot", url: "/images/archer-shoot.png" },
      { name: "arrow", url: "/images/arrow.png" },
      { name: "obstacle", url: "/images/obstacle.png" },
      { name: "powerup", url: "/images/powerup.png" },
    ])

    logger.info("Game assets loaded")
  }

  /**
   * Create the game background
   */
  private createBackground(): void {
    this.renderer.createSprite({
      id: "background",
      textureName: "background",
      x: this.gameWidth / 2,
      y: this.gameHeight / 2,
      anchor: { x: 0.5, y: 0.5 },
      scale: {
        x: this.gameWidth / 800, // Assuming background texture is 800x600
        y: this.gameHeight / 600,
      },
      container: "background",
      zIndex: 0,
    })
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (!this.isRunning) {
      this.isRunning = true
      this.lastTimestamp = performance.now()
      this.physics.start()
      this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this))
      logger.info("Game loop started")
    }
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    if (this.isRunning) {
      this.isRunning = false
      this.physics.stop()
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId)
        this.animationFrameId = null
      }
      logger.info("Game loop stopped")
    }
  }

  /**
   * The main game loop
   * @param timestamp - Current timestamp
   */
  private gameLoop(timestamp: number): void {
    if (!this.isRunning) return

    // Calculate delta time
    const delta = timestamp - this.lastTimestamp
    this.lastTimestamp = timestamp

    // Update physics (if not using the built-in runner)
    // this.physics.update(delta);

    // Sync physics and rendering
    this.syncPhysicsWithRendering()

    // Request next frame
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this))
  }

  /**
   * Synchronize physics state with rendering
   */
  private syncPhysicsWithRendering(): void {
    // Update player sprites based on physics
    this.players.forEach((player, id) => {
      const physicsState = this.physics.getPlayerPhysicsState(player.physicsId)
      if (physicsState) {
        // Update sprite position and rotation
        this.renderer.updateSprite(player.spriteId, physicsState.position, physicsState.angle)

        // Update current animation if any
        if (player.currentAnimation && player.animationIds[player.currentAnimation]) {
          this.renderer.updateAnimation(
            player.animationIds[player.currentAnimation],
            physicsState.position,
            physicsState.angle,
          )
        }
      }
    })

    // Update arrow sprites based on physics
    this.arrows.forEach((arrow, id) => {
      const physicsState = this.physics.getArrowPhysicsState(arrow.physicsId)
      if (physicsState) {
        this.renderer.updateSprite(arrow.spriteId, physicsState.position, physicsState.angle)
      }
    })
  }

  /**
   * Create a player
   * @param id - Player ID
   * @param x - Initial X position
   * @param y - Initial Y position
   * @param options - Additional player options
   */
  createPlayer(
    id: string,
    x: number,
    y: number,
    options: {
      radius?: number
      color?: number
      name?: string
    } = {},
  ): void {
    const radius = options.radius || 20

    // Create physics body
    const physicsBody = this.physics.createPlayer(id, x, y, radius)

    // Create sprite
    const sprite = this.renderer.createSprite({
      id: `player-sprite-${id}`,
      textureName: "player-idle",
      x,
      y,
      anchor: { x: 0.5, y: 0.5 },
      container: "players",
      zIndex: 10,
    })

    // Create animations
    const idleAnimation = this.renderer.createAnimation({
      id: `player-idle-${id}`,
      textureNames: ["player-idle"], // Should be a spritesheet in a real implementation
      x,
      y,
      anchor: { x: 0.5, y: 0.5 },
      container: "players",
      zIndex: 10,
      speed: 0.1,
      loop: true,
      autoPlay: true,
    })

    const runAnimation = this.renderer.createAnimation({
      id: `player-run-${id}`,
      textureNames: ["player-run"], // Should be a spritesheet in a real implementation
      x,
      y,
      anchor: { x: 0.5, y: 0.5 },
      container: "players",
      zIndex: 10,
      speed: 0.2,
      loop: true,
      autoPlay: false,
    })

    const shootAnimation = this.renderer.createAnimation({
      id: `player-shoot-${id}`,
      textureNames: ["player-shoot"], // Should be a spritesheet in a real implementation
      x,
      y,
      anchor: { x: 0.5, y: 0.5 },
      container: "players",
      zIndex: 10,
      speed: 0.3,
      loop: false,
      autoPlay: false,
    })

    // Hide the sprite since we'll use animations
    if (sprite) {
      sprite.visible = false
    }

    // Store player data
    this.players.set(id, {
      physicsId: id,
      spriteId: `player-sprite-${id}`,
      animationIds: {
        idle: `player-idle-${id}`,
        run: `player-run-${id}`,
        shoot: `player-shoot-${id}`,
      },
      currentAnimation: "idle",
    })

    logger.info("Player created", { id, x, y })
  }

  /**
   * Create an arrow
   * @param id - Arrow ID
   * @param x - Initial X position
   * @param y - Initial Y position
   * @param angle - Arrow angle in radians
   * @param velocity - Initial velocity
   */
  createArrow(id: string, x: number, y: number, angle: number, velocity: { x: number; y: number }): void {
    // Create physics body
    const physicsBody = this.physics.createArrow(id, x, y, angle, velocity)

    // Create sprite
    const sprite = this.renderer.createSprite({
      id: `arrow-sprite-${id}`,
      textureName: "arrow",
      x,
      y,
      rotation: angle,
      anchor: { x: 0.5, y: 0.5 },
      container: "projectiles",
      zIndex: 5,
    })

    // Store arrow data
    this.arrows.set(id, {
      physicsId: id,
      spriteId: `arrow-sprite-${id}`,
    })

    logger.debug("Arrow created", { id, x, y, angle })
  }

  /**
   * Create an obstacle
   * @param id - Obstacle ID
   * @param x - X position
   * @param y - Y position
   * @param width - Obstacle width
   * @param height - Obstacle height
   */
  createObstacle(id: string, x: number, y: number, width: number, height: number): void {
    // Create physics body
    const physicsBody = this.physics.createObstacle(id, x, y, width, height)

    // Create sprite
    const sprite = this.renderer.createSprite({
      id: `obstacle-sprite-${id}`,
      textureName: "obstacle",
      x,
      y,
      anchor: { x: 0.5, y: 0.5 },
      scale: { x: width / 64, y: height / 64 }, // Assuming obstacle texture is 64x64
      container: "obstacles",
      zIndex: 2,
    })

    // Store obstacle data
    this.obstacles.set(id, {
      physicsId: id,
      spriteId: `obstacle-sprite-${id}`,
    })

    logger.debug("Obstacle created", { id, x, y, width, height })
  }

  /**
   * Create a powerup
   * @param id - Powerup ID
   * @param x - X position
   * @param y - Y position
   * @param type - Powerup type
   */
  createPowerup(id: string, x: number, y: number, type: string): void {
    const radius = 15

    // Create physics body
    const physicsBody = this.physics.createPowerup(id, x, y, radius)

    // Create sprite
    const sprite = this.renderer.createSprite({
      id: `powerup-sprite-${id}`,
      textureName: "powerup",
      x,
      y,
      anchor: { x: 0.5, y: 0.5 },
      container: "obstacles",
      zIndex: 3,
    })

    // Create animation (pulsing effect)
    const animation = this.renderer.createAnimation({
      id: `powerup-animation-${id}`,
      textureNames: ["powerup"], // Should be a spritesheet in a real implementation
      x,
      y,
      anchor: { x: 0.5, y: 0.5 },
      container: "obstacles",
      zIndex: 3,
      speed: 0.1,
      loop: true,
      autoPlay: true,
    })

    // Hide the sprite since we'll use animation
    if (sprite) {
      sprite.visible = false
    }

    // Store powerup data
    this.powerups.set(id, {
      physicsId: id,
      spriteId: `powerup-sprite-${id}`,
      animationId: `powerup-animation-${id}`,
    })

    logger.debug("Powerup created", { id, x, y, type })
  }

  /**
   * Set player animation
   * @param id - Player ID
   * @param animationType - Animation type (idle, run, shoot)
   */
  setPlayerAnimation(id: string, animationType: "idle" | "run" | "shoot"): void {
    const player = this.players.get(id)

    if (player && player.currentAnimation !== animationType) {
      // Stop current animation
      if (player.currentAnimation) {
        this.renderer.stopAnimation(player.animationIds[player.currentAnimation])
      }

      // Start new animation
      this.renderer.playAnimation(
        player.animationIds[animationType],
        animationType !== "shoot", // Loop for idle and run, not for shoot
      )

      player.currentAnimation = animationType
    }
  }

  /**
   * Move a player
   * @param id - Player ID
   * @param velocity - Velocity vector
   */
  movePlayer(id: string, velocity: { x: number; y: number }): void {
    this.physics.setPlayerVelocity(id, velocity)

    // Set appropriate animation based on movement
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
    if (speed > 0.1) {
      this.setPlayerAnimation(id, "run")
    } else {
      this.setPlayerAnimation(id, "idle")
    }
  }

  /**
   * Player shoots an arrow
   * @param playerId - Player ID
   * @param arrowId - Arrow ID
   * @param angle - Shooting angle
   * @param power - Shooting power
   */
  playerShoot(playerId: string, arrowId: string, angle: number, power: number): void {
    // Set shoot animation
    this.setPlayerAnimation(playerId, "shoot")

    // Get player position
    const playerState = this.physics.getPlayerPhysicsState(playerId)

    if (playerState) {
      // Calculate arrow velocity based on angle and power
      const velocity = {
        x: Math.cos(angle) * power,
        y: Math.sin(angle) * power,
      }

      // Create arrow
      this.createArrow(arrowId, playerState.position.x, playerState.position.y, angle, velocity)
    }
  }

  /**
   * Remove a player
   * @param id - Player ID
   */
  removePlayer(id: string): void {
    const player = this.players.get(id)

    if (player) {
      // Remove physics body
      this.physics.removePlayer(player.physicsId)

      // Remove sprite
      this.renderer.removeSprite(player.spriteId)

      // Remove animations
      Object.values(player.animationIds).forEach((animationId) => {
        this.renderer.removeAnimation(animationId)
      })

      // Remove from players map
      this.players.delete(id)

      logger.info("Player removed", { id })
    }
  }

  /**
   * Remove an arrow
   * @param id - Arrow ID
   */
  removeArrow(id: string): void {
    const arrow = this.arrows.get(id)

    if (arrow) {
      // Remove physics body
      this.physics.removeArrow(arrow.physicsId)

      // Remove sprite
      this.renderer.removeSprite(arrow.spriteId)

      // Remove from arrows map
      this.arrows.delete(id)

      logger.debug("Arrow removed", { id })
    }
  }

  /**
   * Remove an obstacle
   * @param id - Obstacle ID
   */
  removeObstacle(id: string): void {
    const obstacle = this.obstacles.get(id)

    if (obstacle) {
      // Remove physics body
      this.physics.removeObstacle(obstacle.physicsId)

      // Remove sprite
      this.renderer.removeSprite(obstacle.spriteId)

      // Remove from obstacles map
      this.obstacles.delete(id)

      logger.debug("Obstacle removed", { id })
    }
  }

  /**
   * Remove a powerup
   * @param id - Powerup ID
   */
  removePowerup(id: string): void {
    const powerup = this.powerups.get(id)

    if (powerup) {
      // Remove physics body
      this.physics.removePowerup(powerup.physicsId)

      // Remove sprite
      this.renderer.removeSprite(powerup.spriteId)

      // Remove animation
      this.renderer.removeAnimation(powerup.animationId)

      // Remove from powerups map
      this.powerups.delete(id)

      logger.debug("Powerup removed", { id })
    }
  }

  /**
   * Resize the game
   * @param width - New width
   * @param height - New height
   */
  resize(width: number, height: number): void {
    this.gameWidth = width
    this.gameHeight = height

    // Resize renderer
    this.renderer.resize(width, height)

    // Update background
    this.renderer.updateSprite("background", { x: width / 2, y: height / 2 })
    this.renderer.updateSprite("background", undefined, undefined)

    logger.info("Game resized", { width, height })
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop()

    // Clear physics
    this.physics.clear()

    // Clear renderer
    this.renderer.destroy()

    // Clear entity maps
    this.players.clear()
    this.arrows.clear()
    this.obstacles.clear()
    this.powerups.clear()

    logger.info("Game resources destroyed")
  }
}
