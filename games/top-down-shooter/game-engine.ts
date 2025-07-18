export interface Player {
  id: string
  name: string
  position: { x: number; y: number }
  color: string
  health: number
  score: number
  isActive: boolean
  controls: {
    up: boolean
    down: boolean
    left: boolean
    right: boolean
    shoot: boolean
    special: boolean
    dash: boolean
  }
  angle: number
  ammo: number
}

export interface GameState {
  players: Record<string, Player>
  projectiles: Array<{ x: number; y: number; dx: number; dy: number; id: number }>
  powerUps: any[]
  gameTime: number
  isGameOver: boolean
  winner: string | null
}

export function createInitialGameState(): GameState {
  return {
    players: {},
    projectiles: [],
    powerUps: [],
    gameTime: 0,
    isGameOver: false,
    winner: null,
  }
}

// Helper function to create a player
function createPlayerWithControls(id: string, name: string, position: { x: number; y: number }, color: string): Player {
  return {
    id,
    name,
    position,
    color,
    health: 100,
    score: 0,
    isActive: true,
    controls: { up: false, down: false, left: false, right: false, shoot: false, special: false, dash: false },
    angle: 0,
    ammo: 30,
  }
}

export class GameEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animationFrameId: number | null = null
  private gameState: GameState
  private lastUpdateTime = 0
  private onUpdateCallback: (score: number, isGameOver: boolean) => void
  private keys: Set<string> = new Set()
  private mouse: { x: number; y: number; pressed: boolean } = { x: 0, y: 0, pressed: false }
  private playerId = "player1" // Assuming a single player for this simplified example

  constructor(canvas: HTMLCanvasElement, onUpdateCallback: (score: number, isGameOver: boolean) => void) {
    this.canvas = canvas
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Could not get 2D rendering context for canvas.")
    }
    this.ctx = ctx
    this.onUpdateCallback = onUpdateCallback
    this.gameState = createInitialGameState()
    this.gameState.players[this.playerId] = createPlayerWithControls(
      this.playerId,
      "Player 1",
      { x: canvas.width / 2, y: canvas.height / 2 },
      "green",
    )
  }

  init() {
    this.addEventListeners()
    this.resizeCanvas()
    window.addEventListener("resize", this.resizeCanvas)
  }

  destroy() {
    this.removeEventListeners()
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
    }
    window.removeEventListener("resize", this.resizeCanvas)
  }

  private resizeCanvas = () => {
    // Set canvas dimensions based on parent container or fixed size
    this.canvas.width = this.canvas.offsetWidth
    this.canvas.height = this.canvas.offsetHeight
  }

  private addEventListeners() {
    window.addEventListener("keydown", this.handleKeyDown)
    window.addEventListener("keyup", this.handleKeyUp)
    this.canvas.addEventListener("mousemove", this.handleMouseMove)
    this.canvas.addEventListener("mousedown", this.handleMouseDown)
    this.canvas.addEventListener("mouseup", this.handleMouseUp)
    this.canvas.addEventListener("touchstart", this.handleTouchStart, { passive: false })
    this.canvas.addEventListener("touchmove", this.handleTouchMove, { passive: false })
    this.canvas.addEventListener("touchend", this.handleTouchEnd, { passive: false })
  }

  private removeEventListeners() {
    window.removeEventListener("keydown", this.handleKeyDown)
    window.removeEventListener("keyup", this.handleKeyUp)
    this.canvas.removeEventListener("mousemove", this.handleMouseMove)
    this.canvas.removeEventListener("mousedown", this.handleMouseDown)
    this.canvas.removeEventListener("mouseup", this.handleMouseUp)
    this.canvas.removeEventListener("touchstart", this.handleTouchStart)
    this.canvas.removeEventListener("touchmove", this.handleTouchMove)
    this.canvas.removeEventListener("touchend", this.handleTouchEnd)
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.key.toLowerCase())
    if (e.key === " ") {
      e.preventDefault() // Prevent spacebar from scrolling
      this.gameState.players[this.playerId].controls.shoot = true
    }
  }

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase())
    if (e.key === " ") {
      this.gameState.players[this.playerId].controls.shoot = false
    }
  }

  private handleMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect()
    this.mouse.x = e.clientX - rect.left
    this.mouse.y = e.clientY - rect.top
  }

  private handleMouseDown = (e: MouseEvent) => {
    this.mouse.pressed = true
    this.gameState.players[this.playerId].controls.shoot = true
  }

  private handleMouseUp = (e: MouseEvent) => {
    this.mouse.pressed = false
    this.gameState.players[this.playerId].controls.shoot = false
  }

  private handleTouchStart = (e: TouchEvent) => {
    e.preventDefault() // Prevent scrolling
    const rect = this.canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    // Simple touch logic: left half for movement, right half for aiming/shooting
    if (x < this.canvas.width / 2) {
      // Movement
      // For a simple D-pad, we'd map touch position to discrete directions
      // For now, just set a flag that touch is active for movement
      this.gameState.players[this.playerId].controls.up = true // Example: always move up on touch for simplicity
    } else {
      // Aiming and shooting
      this.gameState.players[this.playerId].controls.shoot = true
      // Set player angle towards touch point
      const dx = x - this.gameState.players[this.playerId].position.x
      const dy = y - this.gameState.players[this.playerId].position.y
      this.gameState.players[this.playerId].angle = Math.atan2(dy, dx)
    }
  }

  private handleTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    const rect = this.canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    if (x >= this.canvas.width / 2) {
      // Update player angle based on touch for aiming
      const dx = x - this.gameState.players[this.playerId].position.x
      const dy = y - this.gameState.players[this.playerId].position.y
      this.gameState.players[this.playerId].angle = Math.atan2(dy, dx)
    }
  }

  private handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault()
    // Reset all touch controls
    this.gameState.players[this.playerId].controls.up = false
    this.gameState.players[this.playerId].controls.down = false
    this.gameState.players[this.playerId].controls.left = false
    this.gameState.players[this.playerId].controls.right = false
    this.gameState.players[this.playerId].controls.shoot = false
  }

  startGame() {
    this.gameState = createInitialGameState()
    this.gameState.players[this.playerId] = createPlayerWithControls(
      this.playerId,
      "Player 1",
      { x: this.canvas.width / 2, y: this.canvas.height / 2 },
      "green",
    )
    this.gameState.isGameOver = false
    this.gameState.gameTime = 0
    this.lastUpdateTime = performance.now()
    this.gameLoop()
  }

  resetGame() {
    this.destroy()
    this.gameState = createInitialGameState()
    this.gameState.players[this.playerId] = createPlayerWithControls(
      this.playerId,
      "Player 1",
      { x: this.canvas.width / 2, y: this.canvas.height / 2 },
      "green",
    )
    this.gameState.isGameOver = false
    this.gameState.gameTime = 0
    this.onUpdateCallback(0, false) // Reset score and game over state in component
    this.init() // Re-initialize event listeners
  }

  private gameLoop = () => {
    const now = performance.now()
    const deltaTime = (now - this.lastUpdateTime) / 1000 // in seconds
    this.lastUpdateTime = now

    if (!this.gameState.isGameOver) {
      this.update(deltaTime)
      this.draw()
      this.onUpdateCallback(this.gameState.players[this.playerId].score, this.gameState.isGameOver)
    }

    this.animationFrameId = requestAnimationFrame(this.gameLoop)
  }

  private update(deltaTime: number) {
    this.gameState.gameTime += deltaTime

    const player = this.gameState.players[this.playerId]
    if (!player || !player.isActive) return

    // Handle player movement based on keys pressed
    let moveX = 0
    let moveY = 0
    const speed = 200 * deltaTime // pixels per second

    if (this.keys.has("w") || this.keys.has("arrowup") || player.controls.up) moveY -= speed
    if (this.keys.has("s") || this.keys.has("arrowdown") || player.controls.down) moveY += speed
    if (this.keys.has("a") || this.keys.has("arrowleft") || player.controls.left) moveX -= speed
    if (this.keys.has("d") || this.keys.has("arrowright") || player.controls.right) moveX += speed

    player.position.x += moveX
    player.position.y += moveY

    // Keep player within canvas bounds
    player.position.x = Math.max(10, Math.min(this.canvas.width - 10, player.position.x))
    player.position.y = Math.max(10, Math.min(this.canvas.height - 10, player.position.y))

    // Update player angle based on mouse/touch for desktop
    if (!this.keys.has("w") && !this.keys.has("s") && !this.keys.has("a") && !this.keys.has("d")) {
      const dx = this.mouse.x - player.position.x
      const dy = this.mouse.y - player.position.y
      player.angle = Math.atan2(dy, dx)
    }

    // Handle shooting
    if (player.controls.shoot && player.ammo > 0) {
      const bulletSpeed = 300 * deltaTime // pixels per second
      const bulletDx = Math.cos(player.angle) * bulletSpeed
      const bulletDy = Math.sin(player.angle) * bulletSpeed
      this.gameState.projectiles.push({
        x: player.position.x + Math.cos(player.angle) * 15, // Spawn slightly in front of player
        y: player.position.y + Math.sin(player.angle) * 15,
        dx: bulletDx,
        dy: bulletDy,
        id: Date.now(),
      })
      player.ammo -= 1
      player.controls.shoot = false // Shoot once per press
    }

    // Update projectiles
    this.gameState.projectiles = this.gameState.projectiles.filter((p) => {
      p.x += p.dx
      p.y += p.dy
      return p.x > 0 && p.x < this.canvas.width && p.y > 0 && p.y < this.canvas.height
    })

    // Spawn enemies
    if (Object.keys(this.gameState.players).length < 5 && Math.random() < 0.01) {
      const side = Math.floor(Math.random() * 4)
      let x, y
      switch (side) {
        case 0:
          x = Math.random() * this.canvas.width
          y = 0
          break
        case 1:
          x = this.canvas.width
          y = Math.random() * this.canvas.height
          break
        case 2:
          x = Math.random() * this.canvas.width
          y = this.canvas.height
          break
        default:
          x = 0
          y = Math.random() * this.canvas.height
          break
      }
      const enemyId = `enemy-${Date.now()}`
      this.gameState.players[enemyId] = createPlayerWithControls(enemyId, "Enemy", { x, y }, "red")
    }

    // Update enemies (simple chase AI)
    Object.values(this.gameState.players).forEach((entity) => {
      if (entity.id.startsWith("enemy-") && entity.isActive) {
        const dx = player.position.x - entity.position.x
        const dy = player.position.y - entity.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const enemySpeed = 100 * deltaTime // pixels per second

        if (distance > 10) {
          entity.position.x += (dx / distance) * enemySpeed
          entity.position.y += (dy / distance) * enemySpeed
        }

        // Enemy collision with player (simple damage)
        if (distance < 20) {
          player.health -= 0.1 // Continuous damage
          if (player.health <= 0) {
            player.isActive = false
            this.gameState.isGameOver = true
            this.gameState.winner = "enemies"
          }
        }
      }
    })

    // Collision detection: bullets vs enemies
    this.gameState.projectiles = this.gameState.projectiles.filter((bullet) => {
      let hit = false
      Object.values(this.gameState.players).forEach((enemy) => {
        if (enemy.id.startsWith("enemy-") && enemy.isActive) {
          const dist = Math.sqrt((bullet.x - enemy.position.x) ** 2 + (bullet.y - enemy.position.y) ** 2)
          if (dist < 15) {
            enemy.health -= 25 // Damage enemy
            if (enemy.health <= 0) {
              enemy.isActive = false
              player.score += 100 // Award score for kill
            }
            hit = true
          }
        }
      })
      return !hit
    })

    // Remove inactive enemies
    this.gameState.players = Object.fromEntries(
      Object.entries(this.gameState.players).filter(([id, p]) => p.isActive || !id.startsWith("enemy-")),
    )
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.fillStyle = "#0a0a0a"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    const player = this.gameState.players[this.playerId]
    if (player && player.isActive) {
      // Draw player
      this.ctx.save()
      this.ctx.translate(player.position.x, player.position.y)
      this.ctx.rotate(player.angle)
      this.ctx.fillStyle = player.color
      this.ctx.fillRect(-10, -10, 20, 20)
      this.ctx.fillStyle = "white"
      this.ctx.fillRect(8, -2, 8, 4) // Player "gun"
      this.ctx.restore()

      // Draw player health bar
      this.ctx.fillStyle = "red"
      this.ctx.fillRect(player.position.x - 20, player.position.y - 30, 40, 5)
      this.ctx.fillStyle = "lime"
      this.ctx.fillRect(player.position.x - 20, player.position.y - 30, (player.health / 100) * 40, 5)
    }

    // Draw projectiles
    this.ctx.fillStyle = "yellow"
    this.gameState.projectiles.forEach((p) => {
      this.ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
    })

    // Draw enemies
    Object.values(this.gameState.players).forEach((entity) => {
      if (entity.id.startsWith("enemy-") && entity.isActive) {
        this.ctx.fillStyle = entity.color
        this.ctx.fillRect(entity.position.x - 10, entity.position.y - 10, 20, 20)

        // Draw enemy health bar
        this.ctx.fillStyle = "red"
        this.ctx.fillRect(entity.position.x - 15, entity.position.y - 25, 30, 3)
        this.ctx.fillStyle = "orange"
        this.ctx.fillRect(entity.position.x - 15, entity.position.y - 25, (entity.health / 100) * 30, 3)
      }
    })
  }
}
