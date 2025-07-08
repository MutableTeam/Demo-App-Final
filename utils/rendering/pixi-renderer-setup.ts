import * as PIXI from "pixi.js"
import type { GameState, Player, GameObject } from "../../components/pvp-game/game-engine"

// Main Pixi.js renderer for Archer Arena
export class ArcherPixiRenderer {
  // PIXI.js core objects
  private app: PIXI.Application | null = null
  private stage: PIXI.Container | null = null
  private gameContainer: PIXI.Container | null = null
  private uiContainer: PIXI.Container | null = null

  // Game object containers
  private players: Record<string, PIXI.Container> = {}
  private arrows: Record<string, PIXI.Container> = {}
  private walls: Record<string, PIXI.Container> = {}
  private effects: Record<string, PIXI.Container> = {}

  // Asset references
  private textures: Record<string, PIXI.Texture> = {}
  private spriteSheets: Record<string, PIXI.Spritesheet> = {}

  // Configuration
  private config = {
    backgroundColor: 0x1a3300, // Dark green background
    resolution: window.devicePixelRatio || 1,
    antialias: true,
    autoDensity: true,
    debugMode: false,
  }

  constructor(debugMode = false) {
    this.config.debugMode = debugMode
  }

  // Initialize the renderer with a canvas element
  public async initialize(canvas: HTMLCanvasElement, width: number, height: number): Promise<void> {
    // Create PIXI Application
    this.app = new PIXI.Application({
      view: canvas as PIXI.ICanvas,
      width,
      height,
      backgroundColor: this.config.backgroundColor,
      resolution: this.config.resolution,
      antialias: this.config.antialias,
      autoDensity: this.config.autoDensity,
    })

    // Set up stage and containers
    this.stage = this.app.stage

    // Create main containers
    this.gameContainer = new PIXI.Container()
    this.uiContainer = new PIXI.Container()

    // Add containers to stage
    this.stage.addChild(this.gameContainer)
    this.stage.addChild(this.uiContainer)

    // Load assets
    await this.loadAssets()

    if (this.config.debugMode) {
      console.log("Pixi renderer initialized with dimensions:", { width, height })
    }
  }

  // Load game assets
  private async loadAssets(): Promise<void> {
    return new Promise((resolve) => {
      // Create basic textures for initial rendering
      this.createBasicTextures()

      // In a real implementation, we would load sprite sheets and textures here
      // For now, we'll just resolve immediately with our basic textures
      resolve()
    })
  }

  // Create basic textures for initial rendering
  private createBasicTextures(): void {
    // Create a basic player texture (circle)
    const playerGraphics = new PIXI.Graphics()
    playerGraphics.beginFill(0xffffff)
    playerGraphics.drawCircle(0, 0, 24)
    playerGraphics.endFill()
    this.textures["player"] = this.app!.renderer.generateTexture(playerGraphics)

    // Create a basic arrow texture (rectangle)
    const arrowGraphics = new PIXI.Graphics()
    arrowGraphics.beginFill(0xd3a973)
    arrowGraphics.drawRect(-15, -2, 30, 4)
    arrowGraphics.endFill()
    this.textures["arrow"] = this.app!.renderer.generateTexture(arrowGraphics)

    // Create a basic wall texture (square)
    const wallGraphics = new PIXI.Graphics()
    wallGraphics.beginFill(0x6d6552)
    wallGraphics.drawRect(-20, -20, 40, 40)
    wallGraphics.endFill()
    this.textures["wall"] = this.app!.renderer.generateTexture(wallGraphics)
  }

  // Update the renderer with the current game state
  public render(gameState: GameState, localPlayerId: string): void {
    if (!this.app || !this.gameContainer || !this.uiContainer) {
      return
    }

    // Clear previous frame's UI elements
    this.uiContainer.removeChildren()

    // Update or create player sprites
    this.renderPlayers(gameState.players, localPlayerId)

    // Update or create arrow sprites
    this.renderArrows(gameState.arrows)

    // Update or create wall sprites
    this.renderWalls(gameState.walls)

    // Render UI elements
    this.renderUI(gameState, localPlayerId)

    // Render effects (explosions, particles, etc.)
    this.renderEffects(gameState)
  }

  // Render players
  private renderPlayers(players: Record<string, Player>, localPlayerId: string): void {
    // Process existing players
    Object.entries(players).forEach(([playerId, player]) => {
      let playerContainer = this.players[playerId]

      // Create new player container if it doesn't exist
      if (!playerContainer) {
        playerContainer = new PIXI.Container()

        // Create player sprite
        const sprite = new PIXI.Sprite(this.textures["player"])
        sprite.anchor.set(0.5)

        // Add sprite to container
        playerContainer.addChild(sprite)

        // Add name text
        const nameText = new PIXI.Text(player.name, {
          fontFamily: "Arial",
          fontSize: 12,
          fill: 0xffffff,
          align: "center",
        })
        nameText.anchor.set(0.5, 0.5)
        nameText.position.set(0, -40)
        playerContainer.addChild(nameText)

        // Add to game container and store reference
        this.gameContainer!.addChild(playerContainer)
        this.players[playerId] = playerContainer
      }

      // Update player position and rotation
      playerContainer.position.set(player.position.x, player.position.y)
      playerContainer.rotation = player.rotation

      // Update player color
      const sprite = playerContainer.children[0] as PIXI.Sprite
      sprite.tint = this.hexStringToNumber(player.color)

      // Highlight local player
      if (playerId === localPlayerId) {
        // Add glow filter if it doesn't exist
        if (!sprite.filters || sprite.filters.length === 0) {
          const glowFilter = new PIXI.filters.GlowFilter({
            distance: 15,
            outerStrength: 2,
            innerStrength: 0,
            color: 0xffffff,
            quality: 0.5,
          })
          sprite.filters = [glowFilter]
        }
      } else {
        // Remove glow filter for non-local players
        sprite.filters = []
      }

      // Update animation state
      this.updatePlayerAnimation(playerContainer, player)
    })

    // Remove players that no longer exist
    Object.keys(this.players).forEach((playerId) => {
      if (!players[playerId]) {
        this.gameContainer!.removeChild(this.players[playerId])
        delete this.players[playerId]
      }
    })
  }

  // Update player animation based on state
  private updatePlayerAnimation(container: PIXI.Container, player: Player): void {
    // In a full implementation, we would update the sprite frame based on animation state
    // For now, we'll just apply visual effects based on state

    const sprite = container.children[0] as PIXI.Sprite

    // Reset all animation effects
    sprite.alpha = 1
    sprite.scale.set(1)

    // Apply effects based on animation state
    switch (player.animationState) {
      case "hit":
        // Flash red
        sprite.tint = 0xff0000
        break

      case "death":
        // Fade out
        sprite.alpha = 0.5
        sprite.scale.set(0.8)
        break

      case "dash":
        // Scale effect for dash
        sprite.scale.set(1.2, 0.8)
        break

      default:
        // Reset to normal color
        sprite.tint = this.hexStringToNumber(player.color)
    }
  }

  // Render arrows
  private renderArrows(arrows: GameObject[]): void {
    // Track current arrow IDs for cleanup
    const currentArrowIds = new Set<string>()

    // Process arrows
    arrows.forEach((arrow) => {
      currentArrowIds.add(arrow.id)

      let arrowContainer = this.arrows[arrow.id]

      // Create new arrow container if it doesn't exist
      if (!arrowContainer) {
        arrowContainer = new PIXI.Container()

        // Create arrow sprite
        const sprite = new PIXI.Sprite(this.textures["arrow"])
        sprite.anchor.set(0.5)

        // Add sprite to container
        arrowContainer.addChild(sprite)

        // Add to game container and store reference
        this.gameContainer!.addChild(arrowContainer)
        this.arrows[arrow.id] = arrowContainer
      }

      // Update arrow position and rotation
      arrowContainer.position.set(arrow.position.x, arrow.position.y)
      arrowContainer.rotation = arrow.rotation

      // Update arrow color
      const sprite = arrowContainer.children[0] as PIXI.Sprite
      sprite.tint = this.hexStringToNumber(arrow.color)

      // Add special effects for weak shots
      // @ts-ignore - Custom property
      if (arrow.isWeakShot) {
        sprite.alpha = 0.7
        sprite.tint = 0x996633 // Darker brown
      }

      // Add special effects for explosive arrows
      // @ts-ignore - Custom property
      if (arrow.isExplosive) {
        sprite.tint = 0xff5722 // Orange-red

        // Add pulsing glow effect
        if (!sprite.filters || sprite.filters.length === 0) {
          const glowFilter = new PIXI.filters.GlowFilter({
            distance: 10,
            outerStrength: 2,
            innerStrength: 0,
            color: 0xff5722,
            quality: 0.5,
          })
          sprite.filters = [glowFilter]
        }
      }
    })

    // Remove arrows that no longer exist
    Object.keys(this.arrows).forEach((arrowId) => {
      if (!currentArrowIds.has(arrowId)) {
        this.gameContainer!.removeChild(this.arrows[arrowId])
        delete this.arrows[arrowId]
      }
    })
  }

  // Render walls
  private renderWalls(walls: GameObject[]): void {
    // Only create wall sprites once, they don't move
    if (Object.keys(this.walls).length === 0) {
      walls.forEach((wall) => {
        const wallContainer = new PIXI.Container()

        // Create wall sprite
        const sprite = new PIXI.Sprite(this.textures["wall"])
        sprite.anchor.set(0.5)
        sprite.width = wall.size * 2
        sprite.height = wall.size * 2
        sprite.tint = this.hexStringToNumber(wall.color)

        // Add sprite to container
        wallContainer.addChild(sprite)

        // Position the wall
        wallContainer.position.set(wall.position.x, wall.position.y)

        // Add to game container and store reference
        this.gameContainer!.addChild(wallContainer)
        this.walls[wall.id] = wallContainer
      })
    }
  }

  // Render UI elements
  private renderUI(gameState: GameState, localPlayerId: string): void {
    // Render health bars
    Object.values(gameState.players).forEach((player) => {
      // Create health bar container
      const healthBarContainer = new PIXI.Container()

      // Position above player
      healthBarContainer.position.set(player.position.x, player.position.y - 48)

      // Create background
      const background = new PIXI.Graphics()
      background.beginFill(0x333333)
      background.drawRect(-20, -2, 40, 4)
      background.endFill()

      // Create health fill
      const healthFill = new PIXI.Graphics()
      const healthPercentage = player.health / 100
      const healthColor = healthPercentage > 0.5 ? 0x00ff00 : healthPercentage > 0.25 ? 0xffff00 : 0xff0000

      healthFill.beginFill(healthColor)
      healthFill.drawRect(-20, -2, 40 * healthPercentage, 4)
      healthFill.endFill()

      // Add to container
      healthBarContainer.addChild(background)
      healthBarContainer.addChild(healthFill)

      // Add to UI container
      this.uiContainer!.addChild(healthBarContainer)
    })

    // Render game time
    const remainingTime = Math.max(0, gameState.maxGameTime - gameState.gameTime)
    const minutes = Math.floor(remainingTime / 60)
    const seconds = Math.floor(remainingTime % 60)

    const timeText = new PIXI.Text(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`, {
      fontFamily: "Arial",
      fontSize: 24,
      fontWeight: "bold",
      fill: 0xffffff,
      align: "center",
    })

    timeText.anchor.set(0.5, 0)
    timeText.position.set(gameState.arenaSize.width / 2, 10)

    this.uiContainer!.addChild(timeText)

    // Render game over message if needed
    if (gameState.isGameOver) {
      this.renderGameOverUI(gameState)
    }
  }

  // Render game over UI
  private renderGameOverUI(gameState: GameState): void {
    // Create semi-transparent overlay
    const overlay = new PIXI.Graphics()
    overlay.beginFill(0x000000, 0.6)
    overlay.drawRect(0, 0, gameState.arenaSize.width, gameState.arenaSize.height)
    overlay.endFill()

    // Create game over text
    const gameOverText = new PIXI.Text("GAME OVER", {
      fontFamily: "Arial",
      fontSize: 48,
      fontWeight: "bold",
      fill: 0xffd700, // Gold color
      align: "center",
      stroke: 0x000000,
      strokeThickness: 4,
    })

    gameOverText.anchor.set(0.5)
    gameOverText.position.set(gameState.arenaSize.width / 2, gameState.arenaSize.height / 2 - 50)

    // Create winner text if there is one
    if (gameState.winner) {
      const winnerName = gameState.players[gameState.winner]?.name || "Unknown"

      const winnerText = new PIXI.Text(`${winnerName} WINS!`, {
        fontFamily: "Arial",
        fontSize: 32,
        fontWeight: "bold",
        fill: 0xffffff,
        align: "center",
        stroke: 0x000000,
        strokeThickness: 3,
      })

      winnerText.anchor.set(0.5)
      winnerText.position.set(gameState.arenaSize.width / 2, gameState.arenaSize.height / 2 + 20)

      // Add to UI container
      this.uiContainer!.addChild(overlay)
      this.uiContainer!.addChild(gameOverText)
      this.uiContainer!.addChild(winnerText)
    } else {
      // Draw text
      const drawText = new PIXI.Text("DRAW!", {
        fontFamily: "Arial",
        fontSize: 32,
        fontWeight: "bold",
        fill: 0xffffff,
        align: "center",
        stroke: 0x000000,
        strokeThickness: 3,
      })

      drawText.anchor.set(0.5)
      drawText.position.set(gameState.arenaSize.width / 2, gameState.arenaSize.height / 2 + 20)

      // Add to UI container
      this.uiContainer!.addChild(overlay)
      this.uiContainer!.addChild(gameOverText)
      this.uiContainer!.addChild(drawText)
    }
  }

  // Render effects (explosions, particles, etc.)
  private renderEffects(gameState: GameState): void {
    // Render explosions
    if (gameState.explosions && gameState.explosions.length > 0) {
      gameState.explosions.forEach((explosion) => {
        // Create a unique ID for this explosion
        const explosionId = `explosion-${explosion.position.x}-${explosion.position.y}-${Date.now()}`

        // Create explosion container if it doesn't exist
        if (!this.effects[explosionId]) {
          const explosionContainer = new PIXI.Container()
          explosionContainer.position.set(explosion.position.x, explosion.position.y)

          // Create explosion graphic
          const graphic = new PIXI.Graphics()

          // Store the explosion data for animation
          // @ts-ignore - Custom property
          explosionContainer.explosionData = {
            radius: explosion.radius,
            time: explosion.time,
            maxTime: explosion.maxTime,
            startTime: Date.now(),
          }

          // Add graphic to container
          explosionContainer.addChild(graphic)

          // Add to game container and store reference
          this.gameContainer!.addChild(explosionContainer)
          this.effects[explosionId] = explosionContainer
        }

        // Update explosion animation
        const container = this.effects[explosionId]
        // @ts-ignore - Custom property
        const data = container.explosionData

        if (data) {
          const progress = explosion.time / explosion.maxTime
          const radius = explosion.radius * (1 - Math.pow(progress - 1, 2)) // Easing function

          // Update explosion graphic
          const graphic = container.children[0] as PIXI.Graphics
          graphic.clear()

          // Create gradient effect
          const alpha = 1 - progress

          // Inner circle
          graphic.beginFill(0xffcc33, alpha)
          graphic.drawCircle(0, 0, radius * 0.3)
          graphic.endFill()

          // Middle circle
          graphic.beginFill(0xff5722, alpha * 0.8)
          graphic.drawCircle(0, 0, radius * 0.6)
          graphic.endFill()

          // Outer circle
          graphic.beginFill(0x661100, alpha * 0.4)
          graphic.drawCircle(0, 0, radius)
          graphic.endFill()

          // Remove explosion if animation is complete
          if (progress >= 1) {
            this.gameContainer!.removeChild(container)
            delete this.effects[explosionId]
          }
        }
      })
    }
  }

  // Helper method to convert hex string to number
  private hexStringToNumber(hex: string): number {
    // Remove # if present
    hex = hex.replace("#", "")

    // Convert to number
    return Number.parseInt(hex, 16)
  }

  // Resize the renderer
  public resize(width: number, height: number): void {
    if (this.app) {
      this.app.renderer.resize(width, height)
    }
  }

  // Clean up resources
  public destroy(): void {
    if (this.app) {
      this.app.destroy(true, {
        children: true,
        texture: true,
        baseTexture: true,
      })

      this.app = null
      this.stage = null
      this.gameContainer = null
      this.uiContainer = null

      this.players = {}
      this.arrows = {}
      this.walls = {}
      this.effects = {}

      this.textures = {}
      this.spriteSheets = {}
    }
  }
}

// Create a singleton instance for global use
export const archerPixiRenderer = new ArcherPixiRenderer(false)
