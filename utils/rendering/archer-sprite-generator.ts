import * as PIXI from "pixi.js"
import { logger } from "../logger"

// Animation frames configuration
export interface AnimationConfig {
  name: string
  frames: number
  speed: number
  loop: boolean
}

/**
 * Generates archer sprite animations programmatically
 */
export class ArcherSpriteGenerator {
  /**
   * Generate a complete archer spritesheet
   * @param renderer - PIXI renderer
   * @param color - Archer color
   * @returns Generated textures for each animation
   */
  static generateArcherSpritesheet(renderer: PIXI.Renderer, color = 0x4caf50): Record<string, PIXI.Texture[]> {
    // Define animations
    const animations: AnimationConfig[] = [
      { name: "idle", frames: 4, speed: 0.1, loop: true },
      { name: "run", frames: 8, speed: 0.2, loop: true },
      { name: "fire", frames: 5, speed: 0.3, loop: false },
      { name: "hit", frames: 3, speed: 0.2, loop: false },
      { name: "death", frames: 6, speed: 0.15, loop: false },
      { name: "dash", frames: 3, speed: 0.3, loop: false },
    ]

    // Frame dimensions
    const frameWidth = 64
    const frameHeight = 64

    // Calculate total frames and dimensions
    const totalFrames = animations.reduce((sum, anim) => sum + anim.frames, 0)
    const framesPerRow = 8
    const rows = Math.ceil(totalFrames / framesPerRow)
    const sheetWidth = framesPerRow * frameWidth
    const sheetHeight = rows * frameHeight

    // Create graphics for spritesheet
    const graphics = new PIXI.Graphics()

    // Create textures for each animation
    const textures: Record<string, PIXI.Texture[]> = {}
    let frameIndex = 0

    // Generate each animation
    animations.forEach((animation) => {
      textures[animation.name] = []

      for (let i = 0; i < animation.frames; i++) {
        const row = Math.floor(frameIndex / framesPerRow)
        const col = frameIndex % framesPerRow
        const x = col * frameWidth
        const y = row * frameHeight

        // Draw frame
        this.drawArcherFrame(graphics, x, y, frameWidth, frameHeight, animation.name, i, color)

        // Create texture for this frame
        const texture = PIXI.RenderTexture.create({
          width: frameWidth,
          height: frameHeight,
          resolution: window.devicePixelRatio || 1,
        })

        // Render graphics to texture
        const tempGraphics = new PIXI.Graphics()
        this.drawArcherFrame(tempGraphics, 0, 0, frameWidth, frameHeight, animation.name, i, color)
        renderer.render(tempGraphics, { renderTexture: texture })
        tempGraphics.destroy()

        // Add to textures
        textures[animation.name].push(texture)

        frameIndex++
      }
    })

    logger.debug("Generated archer spritesheet")
    return textures
  }

  /**
   * Draw a single archer animation frame
   * @param graphics - PIXI Graphics object to draw on
   * @param x - X position
   * @param y - Y position
   * @param width - Frame width
   * @param height - Frame height
   * @param animationType - Animation type
   * @param frameNumber - Frame number in the animation
   * @param color - Archer color
   */
  private static drawArcherFrame(
    graphics: PIXI.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    animationType: string,
    frameNumber: number,
    color = 0x4caf50,
  ): void {
    // Save position
    const originalPosition = { x: graphics.position.x, y: graphics.position.y }
    graphics.position.set(x, y)

    // Clear area
    graphics.beginFill(0x000000, 0)
    graphics.drawRect(0, 0, width, height)
    graphics.endFill()

    // Center of the frame
    const centerX = width / 2
    const centerY = height / 2

    // Draw different poses based on animation type
    switch (animationType) {
      case "idle":
        this.drawIdleFrame(graphics, centerX, centerY, width, height, frameNumber, color)
        break
      case "run":
        this.drawRunFrame(graphics, centerX, centerY, width, height, frameNumber, color)
        break
      case "fire":
        this.drawFireFrame(graphics, centerX, centerY, width, height, frameNumber, color)
        break
      case "hit":
        this.drawHitFrame(graphics, centerX, centerY, width, height, frameNumber, color)
        break
      case "death":
        this.drawDeathFrame(graphics, centerX, centerY, width, height, frameNumber, color)
        break
      case "dash":
        this.drawDashFrame(graphics, centerX, centerY, width, height, frameNumber, color)
        break
      default:
        this.drawIdleFrame(graphics, centerX, centerY, width, height, frameNumber, color)
    }

    // Restore position
    graphics.position.set(originalPosition.x, originalPosition.y)
  }

  /**
   * Draw idle animation frame
   */
  private static drawIdleFrame(
    graphics: PIXI.Graphics,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    frameNumber: number,
    color: number,
  ): void {
    // Breathing animation
    const breathOffset = Math.sin((frameNumber * Math.PI) / 2) * 2

    // Body
    graphics.beginFill(color)
    graphics.drawCircle(centerX, centerY, width * 0.25)
    graphics.endFill()

    // Head
    graphics.beginFill(0xffd3b6)
    graphics.drawCircle(centerX, centerY - height * 0.2, width * 0.15)
    graphics.endFill()

    // Arms
    graphics.beginFill(color)
    graphics.drawRect(centerX - width * 0.35, centerY - height * 0.1, width * 0.1, height * 0.2 + breathOffset)
    graphics.drawRect(centerX + width * 0.25, centerY - height * 0.1, width * 0.1, height * 0.2 - breathOffset)
    graphics.endFill()

    // Bow
    graphics.lineStyle(2, 0x8b4513)
    graphics.moveTo(centerX + width * 0.3, centerY - height * 0.2)
    graphics.lineTo(centerX + width * 0.35, centerY)
    graphics.lineTo(centerX + width * 0.3, centerY + height * 0.2)
    graphics.lineStyle(1, 0xe0e0e0)
    graphics.moveTo(centerX + width * 0.3, centerY - height * 0.2)
    graphics.lineTo(centerX + width * 0.3, centerY + height * 0.2)
  }

  /**
   * Draw run animation frame
   */
  private static drawRunFrame(
    graphics: PIXI.Graphics,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    frameNumber: number,
    color: number,
  ): void {
    // Running animation
    const legOffset = Math.sin((frameNumber * Math.PI) / 4) * width * 0.1
    const armOffset = Math.sin((frameNumber * Math.PI) / 4) * width * 0.1

    // Legs
    graphics.beginFill(color)
    graphics.drawRect(centerX - width * 0.15, centerY, width * 0.1, height * 0.3 + legOffset)
    graphics.drawRect(centerX + width * 0.05, centerY, width * 0.1, height * 0.3 - legOffset)
    graphics.endFill()

    // Body
    graphics.beginFill(color)
    graphics.drawCircle(centerX, centerY, width * 0.25)
    graphics.endFill()

    // Head
    graphics.beginFill(0xffd3b6)
    graphics.drawCircle(centerX, centerY - height * 0.2, width * 0.15)
    graphics.endFill()

    // Arms
    graphics.beginFill(color)
    graphics.drawRect(centerX - width * 0.35, centerY - height * 0.1, width * 0.1, height * 0.2 + armOffset)
    graphics.drawRect(centerX + width * 0.25, centerY - height * 0.1, width * 0.1, height * 0.2 - armOffset)
    graphics.endFill()

    // Bow on back
    graphics.lineStyle(2, 0x8b4513)
    graphics.moveTo(centerX - width * 0.1, centerY - height * 0.2)
    graphics.lineTo(centerX - width * 0.15, centerY)
    graphics.lineTo(centerX - width * 0.1, centerY + height * 0.2)
  }

  /**
   * Draw fire animation frame
   */
  private static drawFireFrame(
    graphics: PIXI.Graphics,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    frameNumber: number,
    color: number,
  ): void {
    // Draw animation progress
    const drawProgress = frameNumber / 4 // 0 to 1

    // Body
    graphics.beginFill(color)
    graphics.drawCircle(centerX, centerY, width * 0.25)
    graphics.endFill()

    // Head
    graphics.beginFill(0xffd3b6)
    graphics.drawCircle(centerX, centerY - height * 0.2, width * 0.15)
    graphics.endFill()

    // Left arm (holding bow)
    graphics.beginFill(color)
    graphics.drawRect(centerX - width * 0.35, centerY - height * 0.1, width * 0.1, height * 0.2)
    graphics.endFill()

    // Right arm (drawing string)
    graphics.beginFill(color)
    graphics.drawRect(
      centerX + width * 0.25 - drawProgress * width * 0.2,
      centerY - height * 0.1,
      width * 0.1,
      height * 0.2,
    )
    graphics.endFill()

    // Bow
    graphics.lineStyle(2, 0x8b4513)
    graphics.moveTo(centerX + width * 0.3, centerY - height * 0.2)
    graphics.lineTo(centerX + width * 0.35, centerY)
    graphics.lineTo(centerX + width * 0.3, centerY + height * 0.2)

    // Bowstring
    graphics.lineStyle(1, 0xe0e0e0)
    graphics.moveTo(centerX + width * 0.3, centerY - height * 0.2)
    graphics.lineTo(centerX + width * 0.3 - drawProgress * width * 0.15, centerY)
    graphics.lineTo(centerX + width * 0.3, centerY + height * 0.2)

    // Arrow
    if (drawProgress > 0.2) {
      graphics.lineStyle(2, 0xd3a973)
      graphics.moveTo(centerX + width * 0.3 - drawProgress * width * 0.15, centerY)
      graphics.lineTo(centerX + width * 0.4, centerY)

      // Arrow head
      graphics.beginFill(0xa0a0a0)
      graphics.drawPolygon([
        centerX + width * 0.4,
        centerY,
        centerX + width * 0.45,
        centerY - height * 0.03,
        centerX + width * 0.45,
        centerY + height * 0.03,
      ])
      graphics.endFill()
    }
  }

  /**
   * Draw hit animation frame
   */
  private static drawHitFrame(
    graphics: PIXI.Graphics,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    frameNumber: number,
    color: number,
  ): void {
    // Hit animation
    const hitOffset = Math.sin((frameNumber * Math.PI) / 2.5) * width * 0.1

    // Body (shifted)
    graphics.beginFill(0xff5252) // Red tint when hit
    graphics.drawCircle(centerX + hitOffset, centerY, width * 0.25)
    graphics.endFill()

    // Head (shifted)
    graphics.beginFill(0xffd3b6)
    graphics.drawCircle(centerX + hitOffset, centerY - height * 0.2, width * 0.15)
    graphics.endFill()

    // Arms (flailing)
    graphics.beginFill(0xff5252)
    graphics.drawRect(centerX - width * 0.35 + hitOffset, centerY - height * 0.1, width * 0.1, height * 0.2)
    graphics.drawRect(centerX + width * 0.25 + hitOffset, centerY - height * 0.1, width * 0.1, height * 0.2)
    graphics.endFill()

    // Hit effect
    graphics.lineStyle(1, 0xffffff, 0.7 - frameNumber * 0.1)
    graphics.drawCircle(centerX, centerY, width * 0.3 + frameNumber * 5)
  }

  /**
   * Draw death animation frame
   */
  private static drawDeathFrame(
    graphics: PIXI.Graphics,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    frameNumber: number,
    color: number,
  ): void {
    // Death animation
    const deathProgress = frameNumber / 5 // 0 to 1

    // Falling rotation
    const fallAngle = (deathProgress * Math.PI) / 2 // 0 to 90 degrees

    // Body (falling)
    graphics.beginFill(0xff5252) // Red tint when dying
    graphics.drawCircle(centerX, centerY + deathProgress * height * 0.3, width * 0.25 * (1 - deathProgress * 0.3))
    graphics.endFill()

    // Head (falling)
    graphics.beginFill(0xffd3b6)
    graphics.drawCircle(
      centerX + Math.sin(fallAngle) * height * 0.2,
      centerY - Math.cos(fallAngle) * height * 0.2 + deathProgress * height * 0.3,
      width * 0.15 * (1 - deathProgress * 0.3),
    )
    graphics.endFill()

    // Arms (limp)
    graphics.beginFill(0xff5252)
    graphics.drawRect(
      centerX - width * 0.35 + deathProgress * width * 0.1,
      centerY - height * 0.1 + deathProgress * height * 0.3,
      width * 0.1,
      height * 0.2,
    )
    graphics.drawRect(
      centerX + width * 0.25 - deathProgress * width * 0.1,
      centerY - height * 0.1 + deathProgress * height * 0.3,
      width * 0.1,
      height * 0.2,
    )
    graphics.endFill()

    // Death effect (fade out)
    if (deathProgress > 0.5) {
      const fadeAlpha = 1 - (deathProgress - 0.5) * 2
      graphics.beginFill(0xff0000, fadeAlpha * 0.3)
      graphics.drawCircle(centerX, centerY, width * 0.4)
      graphics.endFill()
    }
  }

  /**
   * Draw dash animation frame
   */
  private static drawDashFrame(
    graphics: PIXI.Graphics,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    frameNumber: number,
    color: number,
  ): void {
    // Dash animation
    const dashProgress = frameNumber / 2 // 0 to 1
    const dashOffset = dashProgress * width * 0.2

    // Motion blur effect
    const alpha = 0.7 - dashProgress * 0.5

    // Trailing body
    graphics.beginFill(color, alpha * 0.5)
    graphics.drawCircle(centerX - dashOffset * 2, centerY, width * 0.25)
    graphics.endFill()

    // Trailing head
    graphics.beginFill(0xffd3b6, alpha * 0.5)
    graphics.drawCircle(centerX - dashOffset * 2, centerY - height * 0.2, width * 0.15)
    graphics.endFill()

    // Main body
    graphics.beginFill(color)
    graphics.drawCircle(centerX, centerY, width * 0.25)
    graphics.endFill()

    // Main head
    graphics.beginFill(0xffd3b6)
    graphics.drawCircle(centerX, centerY - height * 0.2, width * 0.15)
    graphics.endFill()

    // Arms stretched back
    graphics.beginFill(color)
    graphics.drawRect(centerX - width * 0.35, centerY - height * 0.1, width * 0.1, height * 0.2)
    graphics.drawRect(centerX + width * 0.25, centerY - height * 0.1, width * 0.1, height * 0.2)
    graphics.endFill()

    // Dash effect
    graphics.lineStyle(2, 0xffffff, alpha)
    graphics.moveTo(centerX - dashOffset * 3, centerY - height * 0.1)
    graphics.lineTo(centerX, centerY - height * 0.1)
    graphics.moveTo(centerX - dashOffset * 3, centerY)
    graphics.lineTo(centerX, centerY)
    graphics.moveTo(centerX - dashOffset * 3, centerY + height * 0.1)
    graphics.lineTo(centerX, centerY + height * 0.1)
  }
}
