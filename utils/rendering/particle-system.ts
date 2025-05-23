import * as PIXI from "pixi.js"
import { logger } from "../logger"

// Particle types for different visual effects
export enum ParticleType {
  ARROW_TRAIL = "arrow-trail",
  ARROW_IMPACT = "arrow-impact",
  PLAYER_DASH = "player-dash",
  PLAYER_DEATH = "player-death",
  EXPLOSION = "explosion",
  POWERUP = "powerup",
  ENVIRONMENTAL = "environmental",
}

// Particle configuration interface
export interface ParticleConfig {
  lifetime: number // Particle lifetime in seconds
  speed: number // Base speed
  speedVariance: number // Random speed variance
  scale: number // Base scale
  scaleVariance: number // Random scale variance
  alpha: number // Base alpha
  alphaVariance: number // Random alpha variance
  color: number // Base color
  colorVariance: number // Random color variance
  rotation: number // Base rotation in radians
  rotationVariance: number // Random rotation variance
  gravity: { x: number; y: number } // Gravity effect
  fadeOut: boolean // Whether to fade out over lifetime
  shrink: boolean // Whether to shrink over lifetime
  blendMode: PIXI.BLEND_MODES // Blend mode
  texture: string // Texture name
}

// Particle instance
interface Particle {
  sprite: PIXI.Sprite
  velocity: { x: number; y: number }
  rotation: number
  rotationSpeed: number
  lifetime: number
  maxLifetime: number
  initialScale: number
  initialAlpha: number
  config: ParticleConfig
}

/**
 * Advanced particle system for visual effects
 */
export class ParticleSystem {
  private app: PIXI.Application
  private container: PIXI.Container
  private particles: Particle[] = []
  private particleConfigs: Map<ParticleType, ParticleConfig> = new Map()
  private textures: Map<string, PIXI.Texture> = new Map()
  private isActive = false

  constructor(app: PIXI.Application) {
    this.app = app
    this.container = new PIXI.Container()
    this.container.zIndex = 100 // Above most other elements
    this.app.stage.addChild(this.container)

    // Set up default particle configurations
    this.setupDefaultConfigs()

    logger.info("ParticleSystem initialized")
  }

  /**
   * Set up default particle configurations
   */
  private setupDefaultConfigs(): void {
    // Arrow trail particles
    this.particleConfigs.set(ParticleType.ARROW_TRAIL, {
      lifetime: 0.5,
      speed: 0.5,
      speedVariance: 0.3,
      scale: 0.5,
      scaleVariance: 0.2,
      alpha: 0.7,
      alphaVariance: 0.2,
      color: 0xffcc00,
      colorVariance: 0x222222,
      rotation: 0,
      rotationVariance: Math.PI * 2,
      gravity: { x: 0, y: 0 },
      fadeOut: true,
      shrink: true,
      blendMode: PIXI.BLEND_MODES.ADD,
      texture: "particle",
    })

    // Arrow impact particles
    this.particleConfigs.set(ParticleType.ARROW_IMPACT, {
      lifetime: 0.7,
      speed: 2,
      speedVariance: 1,
      scale: 0.7,
      scaleVariance: 0.3,
      alpha: 0.8,
      alphaVariance: 0.2,
      color: 0xffffff,
      colorVariance: 0x333333,
      rotation: 0,
      rotationVariance: Math.PI * 2,
      gravity: { x: 0, y: 0.5 },
      fadeOut: true,
      shrink: true,
      blendMode: PIXI.BLEND_MODES.NORMAL,
      texture: "particle",
    })

    // Player dash particles
    this.particleConfigs.set(ParticleType.PLAYER_DASH, {
      lifetime: 0.4,
      speed: 1,
      speedVariance: 0.5,
      scale: 0.6,
      scaleVariance: 0.2,
      alpha: 0.6,
      alphaVariance: 0.2,
      color: 0x4caf50, // Green to match player color
      colorVariance: 0x111111,
      rotation: 0,
      rotationVariance: Math.PI / 4,
      gravity: { x: 0, y: 0 },
      fadeOut: true,
      shrink: true,
      blendMode: PIXI.BLEND_MODES.ADD,
      texture: "particle",
    })

    // Player death particles
    this.particleConfigs.set(ParticleType.PLAYER_DEATH, {
      lifetime: 1.5,
      speed: 3,
      speedVariance: 1.5,
      scale: 1,
      scaleVariance: 0.5,
      alpha: 0.9,
      alphaVariance: 0.1,
      color: 0xff5252, // Red for death
      colorVariance: 0x222222,
      rotation: 0,
      rotationVariance: Math.PI * 2,
      gravity: { x: 0, y: 1 },
      fadeOut: true,
      shrink: true,
      blendMode: PIXI.BLEND_MODES.NORMAL,
      texture: "particle",
    })

    // Explosion particles
    this.particleConfigs.set(ParticleType.EXPLOSION, {
      lifetime: 1.2,
      speed: 5,
      speedVariance: 2,
      scale: 1.2,
      scaleVariance: 0.6,
      alpha: 0.9,
      alphaVariance: 0.1,
      color: 0xff9500, // Orange for explosion
      colorVariance: 0x333333,
      rotation: 0,
      rotationVariance: Math.PI * 2,
      gravity: { x: 0, y: -1 }, // Upward drift
      fadeOut: true,
      shrink: true,
      blendMode: PIXI.BLEND_MODES.ADD,
      texture: "particle",
    })

    // Powerup particles
    this.particleConfigs.set(ParticleType.POWERUP, {
      lifetime: 1,
      speed: 0.5,
      speedVariance: 0.3,
      scale: 0.5,
      scaleVariance: 0.2,
      alpha: 0.8,
      alphaVariance: 0.2,
      color: 0x00bcd4, // Cyan for powerups
      colorVariance: 0x111111,
      rotation: 0,
      rotationVariance: Math.PI / 2,
      gravity: { x: 0, y: -0.2 }, // Slight upward drift
      fadeOut: true,
      shrink: false,
      blendMode: PIXI.BLEND_MODES.ADD,
      texture: "particle",
    })

    // Environmental particles (dust, leaves, etc.)
    this.particleConfigs.set(ParticleType.ENVIRONMENTAL, {
      lifetime: 3,
      speed: 0.3,
      speedVariance: 0.2,
      scale: 0.4,
      scaleVariance: 0.2,
      alpha: 0.5,
      alphaVariance: 0.3,
      color: 0xcccccc, // Light gray for dust
      colorVariance: 0x222222,
      rotation: 0,
      rotationVariance: Math.PI * 2,
      gravity: { x: 0.1, y: 0.05 }, // Slight drift
      fadeOut: true,
      shrink: false,
      blendMode: PIXI.BLEND_MODES.NORMAL,
      texture: "particle",
    })
  }

  /**
   * Load particle textures
   * @param textures - Map of texture names to PIXI.Texture objects
   */
  loadTextures(textures: Map<string, PIXI.Texture>): void {
    this.textures = textures
    logger.debug("Particle textures loaded")
  }

  /**
   * Start the particle system
   */
  start(): void {
    if (!this.isActive) {
      this.isActive = true
      this.app.ticker.add(this.update, this)
      logger.debug("ParticleSystem started")
    }
  }

  /**
   * Stop the particle system
   */
  stop(): void {
    if (this.isActive) {
      this.isActive = false
      this.app.ticker.remove(this.update, this)
      logger.debug("ParticleSystem stopped")
    }
  }

  /**
   * Update particle system (called each frame)
   * @param delta - Time delta
   */
  private update(delta: number): void {
    // Convert delta to seconds (Pixi.js delta is in frames, ~1/60 seconds)
    const deltaSeconds = delta / 60

    // Update each particle
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i]

      // Update lifetime
      particle.lifetime -= deltaSeconds

      // Remove dead particles
      if (particle.lifetime <= 0) {
        this.container.removeChild(particle.sprite)
        particle.sprite.destroy()
        this.particles.splice(i, 1)
        continue
      }

      // Update position based on velocity
      particle.sprite.x += particle.velocity.x * deltaSeconds * 60
      particle.sprite.y += particle.velocity.y * deltaSeconds * 60

      // Apply gravity
      particle.velocity.x += particle.config.gravity.x * deltaSeconds
      particle.velocity.y += particle.config.gravity.y * deltaSeconds

      // Update rotation
      particle.sprite.rotation += particle.rotationSpeed * deltaSeconds

      // Update alpha (fade out)
      if (particle.config.fadeOut) {
        const lifeRatio = particle.lifetime / particle.maxLifetime
        particle.sprite.alpha = particle.initialAlpha * lifeRatio
      }

      // Update scale (shrink)
      if (particle.config.shrink) {
        const lifeRatio = particle.lifetime / particle.maxLifetime
        particle.sprite.scale.set(particle.initialScale * lifeRatio)
      }
    }
  }

  /**
   * Emit particles at a specific position
   * @param type - Particle type
   * @param position - Emission position
   * @param count - Number of particles to emit
   * @param direction - Optional direction vector for directional emission
   * @param spread - Angle spread in radians for directional emission
   */
  emit(
    type: ParticleType,
    position: { x: number; y: number },
    count: number,
    direction?: { x: number; y: number },
    spread = Math.PI / 4,
  ): void {
    const config = this.particleConfigs.get(type)
    if (!config) {
      logger.error(`Particle config not found for type: ${type}`)
      return
    }

    const texture = this.textures.get(config.texture)
    if (!texture) {
      logger.error(`Texture not found for particle: ${config.texture}`)
      return
    }

    // Normalize direction if provided
    let normalizedDirection: { x: number; y: number } | undefined
    if (direction) {
      const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y)
      if (magnitude > 0) {
        normalizedDirection = {
          x: direction.x / magnitude,
          y: direction.y / magnitude,
        }
      }
    }

    // Create particles
    for (let i = 0; i < count; i++) {
      // Create sprite
      const sprite = new PIXI.Sprite(texture)
      sprite.anchor.set(0.5)
      sprite.position.set(position.x, position.y)

      // Set blend mode
      sprite.blendMode = config.blendMode

      // Set random rotation
      const rotation = config.rotation + (Math.random() - 0.5) * 2 * config.rotationVariance
      sprite.rotation = rotation

      // Set random scale
      const scale = config.scale + (Math.random() - 0.5) * 2 * config.scaleVariance
      sprite.scale.set(scale)

      // Set random alpha
      const alpha = Math.min(1, Math.max(0, config.alpha + (Math.random() - 0.5) * 2 * config.alphaVariance))
      sprite.alpha = alpha

      // Set random tint (color)
      const colorVariance = Math.floor((Math.random() - 0.5) * 2 * config.colorVariance)
      const r = ((config.color >> 16) & 0xff) + ((colorVariance >> 16) & 0xff)
      const g = ((config.color >> 8) & 0xff) + ((colorVariance >> 8) & 0xff)
      const b = (config.color & 0xff) + (colorVariance & 0xff)
      const color =
        (Math.min(255, Math.max(0, r)) << 16) | (Math.min(255, Math.max(0, g)) << 8) | Math.min(255, Math.max(0, b))
      sprite.tint = color

      // Calculate velocity
      let velocityX: number
      let velocityY: number
      const speed = config.speed + (Math.random() - 0.5) * 2 * config.speedVariance

      if (normalizedDirection) {
        // Directional emission with spread
        const angle = Math.atan2(normalizedDirection.y, normalizedDirection.x)
        const spreadAngle = (Math.random() - 0.5) * 2 * spread
        const finalAngle = angle + spreadAngle
        velocityX = Math.cos(finalAngle) * speed
        velocityY = Math.sin(finalAngle) * speed
      } else {
        // Omnidirectional emission
        const angle = Math.random() * Math.PI * 2
        velocityX = Math.cos(angle) * speed
        velocityY = Math.sin(angle) * speed
      }

      // Create particle
      const particle: Particle = {
        sprite,
        velocity: { x: velocityX, y: velocityY },
        rotation,
        rotationSpeed: (Math.random() - 0.5) * Math.PI, // Random rotation speed
        lifetime: config.lifetime,
        maxLifetime: config.lifetime,
        initialScale: scale,
        initialAlpha: alpha,
        config,
      }

      // Add to container and particles array
      this.container.addChild(sprite)
      this.particles.push(particle)
    }
  }

  /**
   * Create a particle emitter that emits particles at regular intervals
   * @param type - Particle type
   * @param position - Emission position
   * @param options - Emitter options
   * @returns Emitter ID (used to stop the emitter)
   */
  createEmitter(
    type: ParticleType,
    position: { x: number; y: number },
    options: {
      interval: number // Emission interval in seconds
      count: number // Particles per emission
      duration?: number // Total duration in seconds (undefined for infinite)
      direction?: { x: number; y: number } // Direction vector
      spread?: number // Angle spread in radians
      followSprite?: PIXI.Sprite // Sprite to follow
    },
  ): number {
    const emitterId = Date.now() + Math.floor(Math.random() * 1000)
    let elapsed = 0
    let emitterActive = true

    // Create update function
    const updateEmitter = (delta: number) => {
      if (!emitterActive) return

      // Convert delta to seconds
      const deltaSeconds = delta / 60

      // Update elapsed time
      elapsed += deltaSeconds

      // Check if emitter should stop
      if (options.duration !== undefined && elapsed >= options.duration) {
        this.app.ticker.remove(updateEmitter)
        emitterActive = false
        return
      }

      // Update position if following a sprite
      const currentPosition = { ...position }
      if (options.followSprite) {
        currentPosition.x = options.followSprite.x
        currentPosition.y = options.followSprite.y
      }

      // Emit particles at interval
      if (elapsed % options.interval < deltaSeconds) {
        this.emit(type, currentPosition, options.count, options.direction, options.spread)
      }
    }

    // Start emitter
    this.app.ticker.add(updateEmitter)

    // Return emitter ID
    return emitterId
  }

  /**
   * Stop an emitter
   * @param emitterId - Emitter ID
   */
  stopEmitter(emitterId: number): void {
    // In a real implementation, we would store emitters in a map and remove them
    // For simplicity, this is just a placeholder
    logger.debug(`Stopping emitter: ${emitterId}`)
  }

  /**
   * Clear all particles
   */
  clear(): void {
    // Remove all particles
    this.particles.forEach((particle) => {
      this.container.removeChild(particle.sprite)
      particle.sprite.destroy()
    })
    this.particles = []
  }

  /**
   * Destroy the particle system
   */
  destroy(): void {
    this.stop()
    this.clear()
    this.app.stage.removeChild(this.container)
    this.container.destroy()
    this.textures.clear()
    this.particleConfigs.clear()
  }
}
