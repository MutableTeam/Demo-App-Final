import * as PIXI from "pixi.js"
import type { AnimationName, Animation, AnimationSet } from "../sprite-animation"

// Enhanced sprite animation system using Pixi.js
export class PixiSpriteAnimator {
  private animations: AnimationSet
  private currentAnimation: Animation | null = null
  private currentFrameIndex = 0
  private frameTime = 0
  private sprite: PIXI.AnimatedSprite | null = null
  private textures: Record<string, PIXI.Texture[]> = {}
  private deathEffectStarted = false

  constructor(animations: AnimationSet, textures: Record<string, PIXI.Texture[]>) {
    this.animations = animations
    this.textures = textures
  }

  // Set the sprite to animate
  public setSprite(sprite: PIXI.AnimatedSprite): void {
    this.sprite = sprite
  }

  // Play an animation
  public play(animationName: AnimationName): void {
    // If already playing this animation, do nothing
    if (this.currentAnimation?.name === animationName) {
      return
    }

    // Get the animation
    const animation = this.animations[animationName]
    if (!animation) {
      console.error(`Animation ${animationName} not found`)
      // Fall back to idle animation if the requested one doesn't exist
      if (animationName !== "idle" && this.animations["idle"]) {
        this.play("idle")
      }
      return
    }

    // Set the current animation
    this.currentAnimation = animation
    this.currentFrameIndex = 0
    this.frameTime = 0

    // Update the sprite textures if available
    if (this.sprite && this.textures[animationName]) {
      this.sprite.textures = this.textures[animationName]
      this.sprite.loop = animation.loop
      this.sprite.animationSpeed = 0.1 // Will be adjusted in update
      this.sprite.play()
    }
  }

  // Update the animation
  public update(deltaTime: number): void {
    if (!this.currentAnimation || !this.sprite) return

    // Update frame time
    this.frameTime += deltaTime

    // Check if we need to advance to the next frame
    const currentFrame = this.currentAnimation.frames[this.currentFrameIndex]
    if (this.frameTime >= currentFrame.duration) {
      // Reset frame time (accounting for overflow)
      this.frameTime -= currentFrame.duration

      // Advance to the next frame
      this.currentFrameIndex++

      // Check if we've reached the end of the animation
      if (this.currentFrameIndex >= this.currentAnimation.frames.length) {
        if (this.currentAnimation.loop) {
          // Loop back to the beginning
          this.currentFrameIndex = 0
        } else {
          // Stay on the last frame
          this.currentFrameIndex = this.currentAnimation.frames.length - 1

          // Stop the sprite animation
          this.sprite.stop()
        }
      }

      // Update the sprite's texture
      if (this.textures[this.currentAnimation.name]) {
        const frameIndex = this.currentAnimation.frames[this.currentFrameIndex].frameIndex
        if (frameIndex < this.textures[this.currentAnimation.name].length) {
          this.sprite.texture = this.textures[this.currentAnimation.name][frameIndex]
        }
      }
    }
  }

  // Get the current frame index
  public getCurrentFrameIndex(): number {
    if (!this.currentAnimation) return 0
    return this.currentAnimation.frames[this.currentFrameIndex].frameIndex
  }

  // Get the current animation name
  public getCurrentAnimationName(): AnimationName | null {
    return this.currentAnimation?.name || null
  }

  // Check if death effect has started
  public isDeathEffectStarted(): boolean {
    return this.deathEffectStarted
  }

  // Set death effect started
  public setDeathEffectStarted(started: boolean): void {
    this.deathEffectStarted = started
  }

  // Create sprite sheets from image data
  public static async createSpriteSheets(
    baseTexture: PIXI.BaseTexture,
    frameWidth: number,
    frameHeight: number,
    animations: AnimationSet,
  ): Promise<Record<string, PIXI.Texture[]>> {
    const textures: Record<string, PIXI.Texture[]> = {}

    // Calculate the number of frames per row
    const framesPerRow = Math.floor(baseTexture.width / frameWidth)

    // Create textures for each animation
    Object.values(animations).forEach((animation) => {
      textures[animation.name] = []

      animation.frames.forEach((frame) => {
        const frameIndex = frame.frameIndex
        const row = Math.floor(frameIndex / framesPerRow)
        const col = frameIndex % framesPerRow

        const rect = new PIXI.Rectangle(col * frameWidth, row * frameHeight, frameWidth, frameHeight)

        const texture = new PIXI.Texture(baseTexture, rect)
        textures[animation.name].push(texture)
      })
    })

    return textures
  }
}

// Helper function to create archer sprite sheets
export async function createArcherSpriteSheets(
  renderer: PIXI.Renderer,
  animationSet: AnimationSet,
): Promise<Record<string, PIXI.Texture[]>> {
  // In a real implementation, we would load actual sprite sheets
  // For now, we'll create programmatic sprites

  // Create a base texture with a grid of frames
  const frameWidth = 64
  const frameHeight = 64
  const framesPerRow = 8
  const rows = 4

  const graphics = new PIXI.Graphics()

  // Create a canvas for our sprite sheet
  const width = frameWidth * framesPerRow
  const height = frameHeight * rows

  // Fill the background
  graphics.beginFill(0x000000, 0)
  graphics.drawRect(0, 0, width, height)
  graphics.endFill()

  // Create frames for each animation state
  let frameIndex = 0

  // Idle frames (0-4)
  for (let i = 0; i < 4; i++) {
    const x = (frameIndex % framesPerRow) * frameWidth
    const y = Math.floor(frameIndex / framesPerRow) * frameHeight

    // Draw archer in idle pose
    drawArcherFrame(graphics, x, y, frameWidth, frameHeight, "idle", i)
    frameIndex++
  }

  // Attack/Fire frames (5-9)
  for (let i = 0; i < 5; i++) {
    const x = (frameIndex % framesPerRow) * frameWidth
    const y = Math.floor(frameIndex / framesPerRow) * frameHeight

    // Draw archer in attack pose
    drawArcherFrame(graphics, x, y, frameWidth, frameHeight, "fire", i)
    frameIndex++
  }

  // Run/Walk frames (10-17)
  for (let i = 0; i < 8; i++) {
    const x = (frameIndex % framesPerRow) * frameWidth
    const y = Math.floor(frameIndex / framesPerRow) * frameHeight

    // Draw archer in run pose
    drawArcherFrame(graphics, x, y, frameWidth, frameHeight, "run", i)
    frameIndex++
  }

  // Hit frames (20-24)
  frameIndex = 20 // Skip to frame 20
  for (let i = 0; i < 5; i++) {
    const x = (frameIndex % framesPerRow) * frameWidth
    const y = Math.floor(frameIndex / framesPerRow) * frameHeight

    // Draw archer in hit pose
    drawArcherFrame(graphics, x, y, frameWidth, frameHeight, "hit", i)
    frameIndex++
  }

  // Death frames (25-30)
  frameIndex = 25 // Skip to frame 25
  for (let i = 0; i < 6; i++) {
    const x = (frameIndex % framesPerRow) * frameWidth
    const y = Math.floor(frameIndex / framesPerRow) * frameHeight

    // Draw archer in death pose
    drawArcherFrame(graphics, x, y, frameWidth, frameHeight, "death", i)
    frameIndex++
  }

  // Generate texture from graphics
  const baseTexture = renderer.generateTexture(graphics)

  // Create sprite sheets for each animation
  return PixiSpriteAnimator.createSpriteSheets(baseTexture, frameWidth, frameHeight, animationSet)
}

// Helper function to draw archer frame
function drawArcherFrame(
  graphics: PIXI.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  animationType: string,
  frameNumber: number,
): void {
  // Save position
  graphics.position.set(x, y)

  // Draw frame border for debugging
  graphics.lineStyle(1, 0x333333, 0.5)
  graphics.drawRect(0, 0, width, height)

  // Center of the frame
  const centerX = width / 2
  const centerY = height / 2

  // Draw different poses based on animation type
  switch (animationType) {
    case "idle":
      // Body
      graphics.beginFill(0x4caf50)
      graphics.drawCircle(centerX, centerY, width * 0.25)
      graphics.endFill()

      // Head
      graphics.beginFill(0xffd3b6)
      graphics.drawCircle(centerX, centerY - height * 0.2, width * 0.15)
      graphics.endFill()

      // Slight breathing animation
      const breathOffset = Math.sin((frameNumber * Math.PI) / 2) * 2

      // Arms
      graphics.beginFill(0x4caf50)
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
      break

    case "fire":
      // Body
      graphics.beginFill(0x4caf50)
      graphics.drawCircle(centerX, centerY, width * 0.25)
      graphics.endFill()

      // Head
      graphics.beginFill(0xffd3b6)
      graphics.drawCircle(centerX, centerY - height * 0.2, width * 0.15)
      graphics.endFill()

      // Draw animation progress
      const drawProgress = frameNumber / 4 // 0 to 1

      // Left arm (holding bow)
      graphics.beginFill(0x4caf50)
      graphics.drawRect(centerX - width * 0.35, centerY - height * 0.1, width * 0.1, height * 0.2)
      graphics.endFill()

      // Right arm (drawing string)
      graphics.beginFill(0x4caf50)
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
      break

    case "run":
      // Running animation
      const legOffset = Math.sin((frameNumber * Math.PI) / 4) * width * 0.1
      const armOffset = Math.sin((frameNumber * Math.PI) / 4) * width * 0.1

      // Legs
      graphics.beginFill(0x4caf50)
      graphics.drawRect(centerX - width * 0.15, centerY, width * 0.1, height * 0.3 + legOffset)
      graphics.drawRect(centerX + width * 0.05, centerY, width * 0.1, height * 0.3 - legOffset)
      graphics.endFill()

      // Body
      graphics.beginFill(0x4caf50)
      graphics.drawCircle(centerX, centerY, width * 0.25)
      graphics.endFill()

      // Head
      graphics.beginFill(0xffd3b6)
      graphics.drawCircle(centerX, centerY - height * 0.2, width * 0.15)
      graphics.endFill()

      // Arms
      graphics.beginFill(0x4caf50)
      graphics.drawRect(centerX - width * 0.35, centerY - height * 0.1, width * 0.1, height * 0.2 + armOffset)
      graphics.drawRect(centerX + width * 0.25, centerY - height * 0.1, width * 0.1, height * 0.2 - armOffset)
      graphics.endFill()

      // Bow on back
      graphics.lineStyle(2, 0x8b4513)
      graphics.moveTo(centerX - width * 0.1, centerY - height * 0.2)
      graphics.lineTo(centerX - width * 0.15, centerY)
      graphics.lineTo(centerX - width * 0.1, centerY + height * 0.2)
      break

    case "hit":
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
      break

    case "death":
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
      break
  }

  // Reset position
  graphics.position.set(0, 0)
}
