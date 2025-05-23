import * as PIXI from "pixi.js"
import { logger } from "../logger"

/**
 * Manages loading and accessing textures for the game
 */
export class TextureManager {
  private textures: Map<string, PIXI.Texture> = new Map()
  private spritesheets: Map<string, PIXI.Spritesheet> = new Map()
  private isLoading = false
  private loadPromise: Promise<void> | null = null

  constructor() {
    logger.info("TextureManager initialized")
  }

  /**
   * Load a texture from a URL
   * @param name - Texture name
   * @param url - Texture URL
   * @returns Promise that resolves when the texture is loaded
   */
  async loadTexture(name: string, url: string): Promise<PIXI.Texture> {
    try {
      const texture = await PIXI.Assets.load(url)
      this.textures.set(name, texture as PIXI.Texture)
      logger.debug(`Texture loaded: ${name}`)
      return texture as PIXI.Texture
    } catch (error) {
      logger.error(`Failed to load texture: ${name}`, error)
      throw error
    }
  }

  /**
   * Load a spritesheet from a URL and JSON data
   * @param name - Spritesheet name
   * @param imageUrl - Spritesheet image URL
   * @param dataUrl - Spritesheet JSON data URL
   * @returns Promise that resolves when the spritesheet is loaded
   */
  async loadSpritesheet(name: string, imageUrl: string, dataUrl: string): Promise<PIXI.Spritesheet> {
    try {
      // Load image
      const baseTexture = await PIXI.Assets.load(imageUrl)

      // Load JSON data
      const response = await fetch(dataUrl)
      const data = await response.json()

      // Create spritesheet
      const spritesheet = new PIXI.Spritesheet(baseTexture as PIXI.BaseTexture, data)

      // Parse spritesheet
      await new Promise<void>((resolve) => {
        spritesheet.parse().then(() => resolve())
      })

      // Store spritesheet
      this.spritesheets.set(name, spritesheet)

      // Add individual frames to textures
      Object.keys(spritesheet.textures).forEach((frameId) => {
        this.textures.set(`${name}_${frameId}`, spritesheet.textures[frameId])
      })

      logger.debug(`Spritesheet loaded: ${name}`)
      return spritesheet
    } catch (error) {
      logger.error(`Failed to load spritesheet: ${name}`, error)
      throw error
    }
  }

  /**
   * Create a programmatic texture
   * @param name - Texture name
   * @param width - Texture width
   * @param height - Texture height
   * @param renderFunction - Function to render the texture
   * @returns The created texture
   */
  createTexture(
    name: string,
    width: number,
    height: number,
    renderFunction: (graphics: PIXI.Graphics) => void,
  ): PIXI.Texture {
    // Create graphics object
    const graphics = new PIXI.Graphics()

    // Call render function
    renderFunction(graphics)

    // Generate texture
    const texture = PIXI.RenderTexture.create({
      width,
      height,
      resolution: window.devicePixelRatio || 1,
    })

    // Render graphics to texture
    const renderer = PIXI.autoDetectRenderer() as PIXI.Renderer
    renderer.render(graphics, { renderTexture: texture })

    // Store texture
    this.textures.set(name, texture)

    // Clean up
    graphics.destroy()

    return texture
  }

  /**
   * Load all game textures
   * @returns Promise that resolves when all textures are loaded
   */
  async loadGameTextures(): Promise<void> {
    if (this.isLoading) {
      return this.loadPromise!
    }

    this.isLoading = true

    this.loadPromise = (async () => {
      try {
        // Create basic particle texture
        this.createParticleTextures()

        // Load player textures
        await this.loadTexture("player", "/images/archer-base.png")

        // Load arrow texture
        await this.loadTexture("arrow", "/images/arrow.png")

        // Load obstacle texture
        await this.loadTexture("obstacle", "/images/obstacle.png")

        // Load background texture
        await this.loadTexture("background", "/images/archer-game-background.png")

        // Load effect textures
        await this.loadTexture("explosion", "/images/explosion.png")
        await this.loadTexture("impact", "/images/impact.png")

        // Load UI textures
        await this.loadTexture("health-bar", "/images/health-bar.png")
        await this.loadTexture("energy-bar", "/images/energy-bar.png")

        logger.info("All game textures loaded")
      } catch (error) {
        logger.error("Failed to load game textures", error)
        throw error
      } finally {
        this.isLoading = false
      }
    })()

    return this.loadPromise
  }

  /**
   * Create particle textures programmatically
   */
  private createParticleTextures(): void {
    // Create basic particle texture
    this.createTexture("particle", 16, 16, (graphics) => {
      graphics.beginFill(0xffffff)
      graphics.drawCircle(8, 8, 8)
      graphics.endFill()
    })

    // Create square particle
    this.createTexture("particle-square", 16, 16, (graphics) => {
      graphics.beginFill(0xffffff)
      graphics.drawRect(0, 0, 16, 16)
      graphics.endFill()
    })

    // Create star particle
    this.createTexture("particle-star", 16, 16, (graphics) => {
      graphics.beginFill(0xffffff)

      // Draw a 5-point star
      const centerX = 8
      const centerY = 8
      const outerRadius = 8
      const innerRadius = 4
      const points = 5

      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const angle = (i * Math.PI) / points

        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius

        if (i === 0) {
          graphics.moveTo(x, y)
        } else {
          graphics.lineTo(x, y)
        }
      }

      graphics.closePath()
      graphics.endFill()
    })

    // Create glow particle
    this.createTexture("particle-glow", 32, 32, (graphics) => {
      // Create radial gradient
      const centerX = 16
      const centerY = 16
      const radius = 16

      // Outer glow (transparent)
      graphics.beginFill(0xffffff, 0)
      graphics.drawCircle(centerX, centerY, radius)
      graphics.endFill()

      // Middle glow
      graphics.beginFill(0xffffff, 0.3)
      graphics.drawCircle(centerX, centerY, radius * 0.7)
      graphics.endFill()

      // Inner glow
      graphics.beginFill(0xffffff, 0.7)
      graphics.drawCircle(centerX, centerY, radius * 0.4)
      graphics.endFill()

      // Core
      graphics.beginFill(0xffffff, 1)
      graphics.drawCircle(centerX, centerY, radius * 0.2)
      graphics.endFill()
    })
  }

  /**
   * Get a texture by name
   * @param name - Texture name
   * @returns The texture or undefined if not found
   */
  getTexture(name: string): PIXI.Texture | undefined {
    return this.textures.get(name)
  }

  /**
   * Get a spritesheet by name
   * @param name - Spritesheet name
   * @returns The spritesheet or undefined if not found
   */
  getSpritesheet(name: string): PIXI.Spritesheet | undefined {
    return this.spritesheets.get(name)
  }

  /**
   * Get all textures
   * @returns Map of all textures
   */
  getAllTextures(): Map<string, PIXI.Texture> {
    return new Map(this.textures)
  }

  /**
   * Clear all textures
   */
  clear(): void {
    // Destroy all textures
    this.textures.forEach((texture) => {
      texture.destroy()
    })
    this.textures.clear()

    // Destroy all spritesheets
    this.spritesheets.forEach((spritesheet) => {
      spritesheet.destroy()
    })
    this.spritesheets.clear()
  }
}

// Create singleton instance
export const textureManager = new TextureManager()
