export interface Vector2D {
  x: number
  y: number
}

export interface Controls {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  shoot: boolean
  dash: boolean
  explosiveArrow: boolean
}

export interface Player {
  id: string
  name: string
  position: Vector2D
  velocity: Vector2D
  rotation: number
  size: number
  health: number
  maxHealth: number
  controls: Controls
  isDrawingBow: boolean
  drawStartTime: number | null
  minDrawTime: number
  maxDrawTime: number
  isDashing: boolean
  dashStartTime: number | null
  dashVelocity: Vector2D | null
  dashCooldown: number
  animationState: "idle" | "run" | "fire" | "dash" | "death" | "hit"
  lastAnimationChange: number
  hitAnimationTimer: number
  isInvulnerable: boolean
  invulnerabilityTimer: number
  level: number
  xp: number
  xpToNextLevel: number
  damageMultiplier: number
  moveSpeedMultiplier: number
  xpMultiplier: number
  multiShot: number
  piercing: number
  ricochet: number
  explosiveArrows: boolean
  frostArrows: boolean
  homingArrows: boolean
  upgrades: Record<string, number>
}

export interface Arrow {
  id: string
  position: Vector2D
  velocity: Vector2D
  rotation: number
  size: number
  damage: number
  ownerId: string
  isWeakShot: boolean
  piercingLeft: number
  bouncesLeft: number
  isExplosive: boolean
  isFrost: boolean
  isHoming: boolean
  homingTarget?: Enemy
  distanceTraveled?: number
  range?: number
}

export interface Enemy {
  id: string
  type: "grunt" | "brute" | "scout"
  position: Vector2D
  rotation: number
  size: number
  health: number
  maxHealth: number
  speed: number
  damage: number
  attackCooldown: number
  value: number
  xpValue: number
  isSlowed: boolean
  slowTimer: number
}

export interface Wave {
  number: number
  totalEnemies: number
  remainingEnemies: number
  spawnDelay: number
  lastSpawnTime: number
  isComplete: boolean
}

export interface PlayerStats {
  kills: number
  score: number
  timeAlive: number
  wavesCompleted: number
  shotsFired: number
  shotsHit: number
  accuracy: number
}

export interface Upgrade {
  id: string
  name: string
  description: string
  maxLevel?: number
  apply: (player: Player) => Partial<Player>
}

export interface GameEffect {
  id: string
  type: "explosion" | "text"
  position: Vector2D
  duration: number
  startTime: number
  // For text effect
  text?: string
  color?: string
}

export interface LastStandGameState {
  gameId: string
  gameMode: "practice" | "ranked"
  player: Player
  players: { [key: string]: Player } // For compatibility with useGameControls
  enemies: Enemy[]
  arrows: Arrow[]
  arenaSize: { width: number; height: number }
  gameTime: number
  isGameOver: boolean
  isPaused: boolean
  currentWave: Wave
  completedWaves: number
  playerStats: PlayerStats
  isLevelingUp: boolean
  availableUpgrades: Upgrade[]
  effects: GameEffect[]
}

export function calculateXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.2, level - 1))
}

export function createInitialLastStandState(
  playerId: string,
  playerName: string,
  gameMode: string,
): LastStandGameState {
  const player: Player = {
    id: "player",
    name: playerName,
    position: { x: 800, y: 450 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    size: 20,
    health: 100,
    maxHealth: 100,
    controls: {
      up: false,
      down: false,
      left: false,
      right: false,
      shoot: false,
      dash: false,
      explosiveArrow: false,
    },
    isDrawingBow: false,
    drawStartTime: null,
    minDrawTime: 0.2,
    maxDrawTime: 1.0,
    isDashing: false,
    dashStartTime: null,
    dashVelocity: null,
    dashCooldown: 0,
    animationState: "idle",
    lastAnimationChange: Date.now(),
    hitAnimationTimer: 0,
    isInvulnerable: false,
    invulnerabilityTimer: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: calculateXpForLevel(1),
    damageMultiplier: 1,
    moveSpeedMultiplier: 1,
    xpMultiplier: 1,
    multiShot: 0,
    piercing: 0,
    ricochet: 0,
    explosiveArrows: false,
    frostArrows: false,
    homingArrows: false,
    upgrades: {},
  }

  return {
    gameId: `ls-${Date.now()}`,
    gameMode: gameMode === "practice" ? "practice" : "ranked",
    player: player,
    players: { player: player },
    enemies: [],
    arrows: [],
    arenaSize: { width: 1600, height: 900 },
    gameTime: 0,
    isGameOver: false,
    isPaused: false,
    currentWave: generateWave(1, { width: 1600, height: 900 }),
    completedWaves: 0,
    playerStats: {
      kills: 0,
      score: 0,
      timeAlive: 0,
      wavesCompleted: 0,
      shotsFired: 0,
      shotsHit: 0,
      accuracy: 0,
    },
    isLevelingUp: false,
    availableUpgrades: [],
    effects: [],
  }
}

export function getEnemyTypeForWave(waveNumber: number): "grunt" | "brute" | "scout" {
  if (waveNumber % 5 === 0) return "brute"
  if (waveNumber > 2 && Math.random() < 0.3) return "scout"
  return "grunt"
}

export function createEnemy(type: "grunt" | "brute" | "scout", position: Vector2D, waveNumber: number): Enemy {
  const baseStats = {
    grunt: { health: 20, speed: 80, damage: 10, size: 15, value: 10, xp: 5 },
    brute: { health: 100, speed: 50, damage: 25, size: 25, value: 50, xp: 25 },
    scout: { health: 15, speed: 150, damage: 8, size: 12, value: 15, xp: 7 },
  }
  const stats = baseStats[type]
  const scalingFactor = 1 + (waveNumber - 1) * 0.1

  return {
    id: `enemy-${type}-${Date.now()}-${Math.random()}`,
    type,
    position,
    rotation: 0,
    size: stats.size,
    health: Math.floor(stats.health * scalingFactor),
    maxHealth: Math.floor(stats.health * scalingFactor),
    speed: stats.speed,
    damage: Math.floor(stats.damage * scalingFactor),
    attackCooldown: 0,
    value: Math.floor(stats.value * scalingFactor),
    xpValue: Math.floor(stats.xp * scalingFactor),
    isSlowed: false,
    slowTimer: 0,
  }
}

export function getRandomSpawnPosition(arenaSize: { width: number; height: number }): Vector2D {
  const side = Math.floor(Math.random() * 4)
  const { width, height } = arenaSize
  switch (side) {
    case 0: // top
      return { x: Math.random() * width, y: -30 }
    case 1: // right
      return { x: width + 30, y: Math.random() * height }
    case 2: // bottom
      return { x: Math.random() * width, y: height + 30 }
    case 3: // left
      return { x: -30, y: Math.random() * height }
    default:
      return { x: 0, y: 0 }
  }
}

export function generateWave(waveNumber: number, arenaSize: { width: number; height: number }): Wave {
  return {
    number: waveNumber,
    totalEnemies: 5 + waveNumber * 2,
    remainingEnemies: 5 + waveNumber * 2,
    spawnDelay: Math.max(0.2, 2 - waveNumber * 0.1),
    lastSpawnTime: 0,
    isComplete: false,
  }
}
