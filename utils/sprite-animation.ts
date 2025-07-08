// Define animation types
export type AnimationName = "idle" | "walk" | "attack" | "hit" | "death" | "dash" | "special" | "run" | "fire"

// Animation frame interface
export interface AnimationFrame {
  duration: number // Duration in seconds
  frameIndex: number // Index in the sprite sheet
}

// Animation interface
export interface Animation {
  name: AnimationName
  frames: AnimationFrame[]
  loop: boolean
}

// Animation set interface
export interface AnimationSet {
  [key: string]: Animation
}

// Create a standard animation set for archer characters
export function createArcherAnimationSet(): AnimationSet {
  return {
    idle: {
      name: "idle",
      frames: [
        { duration: 0.25, frameIndex: 0 },
        { duration: 0.25, frameIndex: 1 },
        { duration: 0.25, frameIndex: 2 },
        { duration: 0.25, frameIndex: 1 },
      ],
      loop: true,
    },
    walk: {
      name: "walk",
      frames: [
        { duration: 0.12, frameIndex: 10 },
        { duration: 0.12, frameIndex: 11 },
        { duration: 0.12, frameIndex: 12 },
        { duration: 0.12, frameIndex: 13 },
        { duration: 0.12, frameIndex: 14 },
        { duration: 0.12, frameIndex: 15 },
        { duration: 0.12, frameIndex: 16 },
        { duration: 0.12, frameIndex: 17 },
      ],
      loop: true,
    },
    // Add run as an alias for walk
    run: {
      name: "run",
      frames: [
        { duration: 0.12, frameIndex: 10 },
        { duration: 0.12, frameIndex: 11 },
        { duration: 0.12, frameIndex: 12 },
        { duration: 0.12, frameIndex: 13 },
        { duration: 0.12, frameIndex: 14 },
        { duration: 0.12, frameIndex: 15 },
        { duration: 0.12, frameIndex: 16 },
        { duration: 0.12, frameIndex: 17 },
      ],
      loop: true,
    },
    attack: {
      name: "attack",
      frames: [
        { duration: 0.1, frameIndex: 5 },
        { duration: 0.1, frameIndex: 6 },
        { duration: 0.1, frameIndex: 7 },
        { duration: 0.1, frameIndex: 8 },
        { duration: 0.1, frameIndex: 9 },
      ],
      loop: false,
    },
    // Add fire as an alias for attack
    fire: {
      name: "fire",
      frames: [
        { duration: 0.1, frameIndex: 5 },
        { duration: 0.1, frameIndex: 6 },
        { duration: 0.1, frameIndex: 7 },
        { duration: 0.1, frameIndex: 8 },
        { duration: 0.1, frameIndex: 9 },
      ],
      loop: false,
    },
    hit: {
      name: "hit",
      frames: [
        { duration: 0.1, frameIndex: 20 },
        { duration: 0.1, frameIndex: 21 },
        { duration: 0.1, frameIndex: 22 },
        { duration: 0.1, frameIndex: 23 },
        { duration: 0.1, frameIndex: 24 },
      ],
      loop: false,
    },
    death: {
      name: "death",
      frames: [
        { duration: 0.15, frameIndex: 25 },
        { duration: 0.15, frameIndex: 26 },
        { duration: 0.15, frameIndex: 27 },
        { duration: 0.15, frameIndex: 28 },
        { duration: 0.15, frameIndex: 29 },
        { duration: 0.15, frameIndex: 30 },
      ],
      loop: false,
    },
    dash: {
      name: "dash",
      frames: [
        { duration: 0.08, frameIndex: 15 },
        { duration: 0.08, frameIndex: 16 },
        { duration: 0.08, frameIndex: 17 },
      ],
      loop: true,
    },
    special: {
      name: "special",
      frames: [
        { duration: 0.1, frameIndex: 5 },
        { duration: 0.1, frameIndex: 6 },
        { duration: 0.1, frameIndex: 7 },
        { duration: 0.1, frameIndex: 8 },
        { duration: 0.1, frameIndex: 9 },
      ],
      loop: false,
    },
  }
}

// Sprite animator class
export class SpriteAnimator {
  private animations: AnimationSet
  private currentAnimation: Animation | null = null
  private currentFrameIndex = 0
  private frameTime = 0
  private deathEffectStarted = false

  constructor(animations: AnimationSet) {
    this.animations = animations
  }

  // Play an animation
  play(animationName: AnimationName): void {
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
  }

  // Update the animation
  update(deltaTime: number): void {
    if (!this.currentAnimation) return

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
        }
      }
    }
  }

  // Get the current frame index
  getCurrentFrameIndex(): number {
    if (!this.currentAnimation) return 0
    return this.currentAnimation.frames[this.currentFrameIndex].frameIndex
  }

  // Get the current animation name
  getCurrentAnimationName(): AnimationName | null {
    return this.currentAnimation?.name || null
  }

  // Check if death effect has started
  isDeathEffectStarted(): boolean {
    return this.deathEffectStarted
  }

  // Set death effect started
  setDeathEffectStarted(started: boolean): void {
    this.deathEffectStarted = started
  }
}
