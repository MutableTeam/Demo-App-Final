import * as PIXI from "pixi.js"
import { logger } from "../logger"

/**
 * PixiRenderer - A wrapper around Pixi.js for rendering
 * This class handles the rendering for the Archer Arena game
 */
export class PixiRenderer {
  private app: PIXI.Application
  private stage: PIXI.Container
  private sprites: Map<string, PIXI.Sprite> = new Map()
  private containers: Map<string, PIXI.Container> = new Map()
  private textures: Map<string, PIXI.Texture> = new Map()
  private animations: Map<string, PIXI.AnimatedSprite> = new Map()
  private particleSystems: Map<string, PIXI.ParticleContainer> = new Map()
  private isInitialized = false

  constructor(options: {
    width: number
    height: number
    backgroundColor?: number
    antialias?: boolean
    transparent?: boolean
    resolution?: number
    autoDensity?: boolean
  }) {
    // Create a Pixi.js application
    this.app = new PIXI.Application({
      width: options.width,
      height: options.height,
      backgroundColor: options.backgroundColor !== undefined ? options.backgroundColor : 0x000000,
      antialias: options.antialias !== undefined ? options.antialias : true,
      transparent: options.transparent !== undefined ? options.transparent : false,
      resolution: options.resolution || window.devicePixelRatio || 1,
      autoDensity: options.autoDensity !== undefined ? options.autoDensity : true,
    })

    this.stage = this.app.stage

    // Create default containers for layering
    this.createContainer("background", 0)
    this.createContainer("obstacles", 10)
    this.createContainer("projectiles", 20)
    this.createContainer("players", 30)
    this.createContainer("effects", 40)
    this.createContainer("ui", 50)

    logger.info("PixiRenderer initialized")
  }

  /**
   * Initialize the renderer and attach it to a DOM element
   * @param element - The DOM element to attach to
   */
  initialize(element: HTMLElement): void {
    if (!this.isInitialized) {
      element.appendChild(this.app.view as HTMLCanvasElement)
      this.isInitialized = true
      logger.info("PixiRenderer attached to DOM")
    }
  }

  /**
   * Get the Pixi.js application instance
   * @returns The Pixi.js application
   */
  getApp(): PIXI.Application {
    return this.app
  }

  /**
   * Create a new container for grouping sprites
   * @param name - Container name
   * @param zIndex - Z-index for layering
   * @returns The created container
   */
  createContainer(name: string, zIndex = 0): PIXI.Container {
    const container = new PIXI.Container()
    container.zIndex = zIndex
    container.sortableChildren = true

    this.stage.addChild(container)
    this.containers.set(name, container)

    return container
  }

  /**
   * Get a container by name
   * @param name - Container name
   * @returns The container or undefined if not found
   */
  getContainer(name: string): PIXI.Container | undefined {
    return this.containers.get(name)
  }

  /**
   * Load a texture from a URL
   * @param name - Texture name
   * @param url - Texture URL
   * @returns Promise that resolves when the texture is loaded
   */
  loadTexture(name: string, url: string): Promise<PIXI.Texture> {
    return new Promise((resolve, reject) => {
      PIXI.Assets.load(url)
        .then((texture) => {
          this.textures.set(name, texture as PIXI.Texture)
          logger.debug(`Texture loaded: ${name}`)
          resolve(texture as PIXI.Texture)
        })
        .catch((error) => {
          logger.error(`Failed to load texture: ${name}`, error)
          reject(error)
        })
    })
  }

  /**
   * Load multiple textures
   * @param textures - Array of texture definitions
   * @returns Promise that resolves when all textures are loaded
   */
  loadTextures(textures: Array<{ name: string; url: string }>): Promise<void> {
    const promises = textures.map((texture) => this.loadTexture(texture.name, texture.url))
    return Promise.all(promises).then(() => {})
  }

  /**
   * Create a sprite from a loaded texture
   * @param options - Sprite creation options
   * @returns The created sprite
   */
  createSprite(options: {
    id: string
    textureName: string
    x?: number
    y?: number
    anchor?: { x: number; y: number }
    scale?: { x: number; y: number }
    rotation?: number
    container?: string
    zIndex?: number
  }): PIXI.Sprite | undefined {
    const texture = this.textures.get(options.textureName)

    if (!texture) {
      logger.error(`Texture not found: ${options.textureName}`)
      return undefined
    }

    const sprite = new PIXI.Sprite(texture)

    // Set sprite properties
    if (options.x !== undefined) sprite.x = options.x
    if (options.y !== undefined) sprite.y = options.y
    if (options.anchor) sprite.anchor.set(options.anchor.x, options.anchor.y)
    if (options.scale) sprite.scale.set(options.scale.x, options.scale.y)
    if (options.rotation !== undefined) sprite.rotation = options.rotation
    if (options.zIndex !== undefined) sprite.zIndex = options.zIndex

    // Add to container
    const containerName = options.container || "default"
    const container = this.containers.get(containerName) || this.stage
    container.addChild(sprite)

    // Store sprite reference
    this.sprites.set(options.id, sprite)

    return sprite
  }

  /**
   * Create an animated sprite from a spritesheet
   * @param options - Animation creation options
   * @returns The created animated sprite
   */
  createAnimation(options: {
    id: string
    textureNames: string[]
    x?: number
    y?: number
    anchor?: { x: number; y: number }
    scale?: { x: number; y: number }
    rotation?: number
    container?: string
    zIndex?: number
    speed?: number
    loop?: boolean
    autoPlay?: boolean
  }): PIXI.AnimatedSprite | undefined {
    const textures: PIXI.Texture[] = []

    for (const textureName of options.textureNames) {
      const texture = this.textures.get(textureName)
      if (texture) {
        textures.push(texture)
      } else {
        logger.error(`Texture not found for animation: ${textureName}`)
      }
    }

    if (textures.length === 0) {
      logger.error("No textures found for animation")
      return undefined
    }

    const animation = new PIXI.AnimatedSprite(textures)

    // Set animation properties
    if (options.x !== undefined) animation.x = options.x
    if (options.y !== undefined) animation.y = options.y
    if (options.anchor) animation.anchor.set(options.anchor.x, options.anchor.y)
    if (options.scale) animation.scale.set(options.scale.x, options.scale.y)
    if (options.rotation !== undefined) animation.rotation = options.rotation
    if (options.zIndex !== undefined) animation.zIndex = options.zIndex
    if (options.speed !== undefined) animation.animationSpeed = options.speed
    if (options.loop !== undefined) animation.loop = options.loop

    // Add to container
    const containerName = options.container || "default"
    const container = this.containers.get(containerName) || this.stage
    container.addChild(animation)

    // Store animation reference
    this.animations.set(options.id, animation)

    // Auto-play if specified
    if (options.autoPlay) {
      animation.play()
    }

    return animation
  }

  /**
   * Create a particle system
   * @param options - Particle system creation options
   * @returns The created particle container
   */
  createParticleSystem(options: {
    id: string
    maxSize?: number
    properties?: PIXI.IParticleProperties
    container?: string
    zIndex?: number
  }): PIXI.ParticleContainer {
    const particleContainer = new PIXI.ParticleContainer(options.maxSize || 1000, options.properties)

    if (options.zIndex !== undefined) {
      particleContainer.zIndex = options.zIndex
    }

    // Add to container
    const containerName = options.container || "effects"
    const container = this.containers.get(containerName) || this.stage
    container.addChild(particleContainer)

    // Store particle system reference
    this.particleSystems.set(options.id, particleContainer)

    return particleContainer
  }

  /**
   * Update a sprite's position and rotation
   * @param id - Sprite ID
   * @param position - New position
   * @param rotation - New rotation in radians
   */
  updateSprite(id: string, position?: { x: number; y: number }, rotation?: number): void {
    const sprite = this.sprites.get(id)

    if (sprite) {
      if (position) {
        sprite.x = position.x
        sprite.y = position.y
      }

      if (rotation !== undefined) {
        sprite.rotation = rotation
      }
    }
  }

  /**
   * Update an animated sprite
   * @param id - Animation ID
   * @param position - New position
   * @param rotation - New rotation in radians
   */
  updateAnimation(id: string, position?: { x: number; y: number }, rotation?: number): void {
    const animation = this.animations.get(id)

    if (animation) {
      if (position) {
        animation.x = position.x
        animation.y = position.y
      }

      if (rotation !== undefined) {
        animation.rotation = rotation
      }
    }
  }

  /**
   * Play an animation
   * @param id - Animation ID
   * @param loop - Whether to loop the animation
   */
  playAnimation(id: string, loop = true): void {
    const animation = this.animations.get(id)

    if (animation) {
      animation.loop = loop
      animation.play()
    }
  }

  /**
   * Stop an animation
   * @param id - Animation ID
   */
  stopAnimation(id: string): void {
    const animation = this.animations.get(id)

    if (animation) {
      animation.stop()
    }
  }

  /**
   * Remove a sprite
   * @param id - Sprite ID
   */
  removeSprite(id: string): void {
    const sprite = this.sprites.get(id)

    if (sprite) {
      sprite.parent.removeChild(sprite)
      sprite.destroy()
      this.sprites.delete(id)
    }
  }

  /**
   * Remove an animation
   * @param id - Animation ID
   */
  removeAnimation(id: string): void {
    const animation = this.animations.get(id)

    if (animation) {
      animation.parent.removeChild(animation)
      animation.destroy()
      this.animations.delete(id)
    }
  }

  /**
   * Remove a particle system
   * @param id - Particle system ID
   */
  removeParticleSystem(id: string): void {
    const particleSystem = this.particleSystems.get(id)

    if (particleSystem) {
      particleSystem.parent.removeChild(particleSystem)
      particleSystem.destroy()
      this.particleSystems.delete(id)
    }
  }

  /**
   * Clear all sprites, animations, and particle systems
   */
  clear(): void {
    // Clear sprites
    this.sprites.forEach((sprite) => {
      sprite.parent.removeChild(sprite)
      sprite.destroy()
    })
    this.sprites.clear()

    // Clear animations
    this.animations.forEach((animation) => {
      animation.parent.removeChild(animation)
      animation.destroy()
    })
    this.animations.clear()

    // Clear particle systems
    this.particleSystems.forEach((particleSystem) => {
      particleSystem.parent.removeChild(particleSystem)
      particleSystem.destroy()
    })
    this.particleSystems.clear()
  }

  /**
   * Resize the renderer
   * @param width - New width
   * @param height - New height
   */
  resize(width: number, height: number): void {
    this.app.renderer.resize(width, height)
  }

  /**
   * Destroy the renderer and clean up resources
   */
  destroy(): void {
    this.clear()

    // Destroy containers
    this.containers.forEach((container) => {
      container.destroy()
    })
    this.containers.clear()

    // Destroy textures
    this.textures.forEach((texture) => {
      texture.destroy()
    })
    this.textures.clear()

    // Destroy the Pixi.js application
    this.app.destroy(true, { children: true, texture: true, baseTexture: true })

    this.isInitialized = false
  }
}
