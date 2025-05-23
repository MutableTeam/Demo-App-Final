"use client"

import type { Vector2D, PlayerAnimationState } from "@/components/pvp-game/game-engine"

export interface LastStandGameState {
  playerId: string
  playerName: string
  gameMode: string
  player: Player
  enemies: Enemy[]
  arrows: Arrow[]
  arenaSize: { width: number; height: number }
  gameTime: number
  isGameOver: boolean
  isPaused: boolean
  startTime: number
  currentWave: Wave
  completedWaves: number
  playerStats: PlayerStats
  leaderboard: LeaderboardEntry[]
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
  color: string
  // Animation state
  animationState: PlayerAnimationState
  lastAnimationChange: number
  // Bow mechanics
  isDrawingBow: boolean
  drawStartTime: number | null
  maxDrawTime: number
  minDrawTime: number
  // Dash mechanics
  dashCooldown: number
  isDashing: boolean
  dashStartTime: number | null
  dashVelocity: Vector2D | null
  // Special attack
  isChargingSpecial: boolean
  specialChargeStartTime: number | null
  specialAttackCooldown: number
  // State timers
  hitAnimationTimer: number
  isInvulnerable: boolean
  invulnerabilityTimer: number
  // Controls
  controls: {
    up: boolean
    down: boolean
    left: boolean
    right: boolean
    shoot: boolean
    dash: boolean
    special: boolean
  }
}

export interface Arrow {
  id: string
  position: Vector2D
  velocity: Vector2D
  rotation: number
  size: number
  damage: number
  ownerId: string
  isWeakShot?: boolean
  distanceTraveled?: number
  range?: number
}

export interface Enemy {
  id: string
  type: "skeleton" | "zombie" | "ghost" | "necromancer"
  position: Vector2D
  velocity: Vector2D
  rotation: number
  health: number
  maxHealth: number
  size: number
  speed: number
  damage: number
  lastAttackTime: number
  attackCooldown: number
  animationState: string
  value: number
}

export interface Wave {
  number: number
  enemyCount: number
  remainingEnemies: number
  spawnDelay: number
  lastSpawnTime: number
  isComplete: boolean
}

export interface PlayerStats {
  shotsFired: number
  shotsHit: number
  accuracy: number
  wavesCompleted: number
  timeAlive: number
  score: number
  kills: number
}

export interface LeaderboardEntry {
  id: string
  playerName: string
  score: number
  wavesCompleted: number
  timeAlive: number
}

// Create initial game state
export function createInitialLastStandState(
  playerId: string,
  playerName: string,
  gameMode: string,
): LastStandGameState {
  const arenaSize = { width: 800, height: 600 }

  return {
    playerId,
    playerName,
    gameMode,
    player: {
      id: playerId,
      name: playerName,
      position: { x: arenaSize.width / 2, y: arenaSize.height / 2 },
      velocity: { x: 0, y: 0 },
      rotation: 0,
      size: 24,
      health: 100,
      maxHealth: 100,
      color: "#4CAF50",
      // Animation state
      animationState: "idle",
      lastAnimationChange: Date.now(),
      // Bow mechanics
      isDrawingBow: false,
      drawStartTime: null,
      maxDrawTime: 1.5, // 1.5 seconds for max draw
      minDrawTime: 0.45, // 30% of maxDrawTime
      // Dash mechanics
      dashCooldown: 0,
      isDashing: false,
      dashStartTime: null,
      dashVelocity: null,
      // Special attack
      isChargingSpecial: false,
      specialChargeStartTime: null,
      specialAttackCooldown: 0,
      // State timers
      hitAnimationTimer: 0,
      isInvulnerable: false,
      invulnerabilityTimer: 0,
      // Controls
      controls: {
        up: false,
        down: false,
        left: false,
        right: false,
        shoot: false,
        dash: false,
        special: false,
      },
    },
    enemies: [],
    arrows: [],
    arenaSize,
    gameTime: 0,
    isGameOver: false,
    isPaused: false,
    startTime: Date.now(),
    currentWave: generateWave(1, arenaSize),
    completedWaves: 0,
    playerStats: {
      shotsFired: 0,
      shotsHit: 0,
      accuracy: 0,
      wavesCompleted: 0,
      timeAlive: 0,
      score: 0,
      kills: 0,
    },
    leaderboard: [],
  }
}

// Generate a wave of enemies
export function generateWave(waveNumber: number, arenaSize: { width: number; height: number }): Wave {
  let enemyCount = 5 + waveNumber * 2
  if (waveNumber > 10) {
    enemyCount = 25 + (waveNumber - 10) * 3
  }

  return {
    number: waveNumber,
    enemyCount: enemyCount,
    remainingEnemies: enemyCount,
    spawnDelay: Math.max(1, 4 - waveNumber * 0.1), // Faster spawning as waves increase
    lastSpawnTime: 0,
    isComplete: false,
  }
}

// Get a random spawn position
export function getRandomSpawnPosition(arenaSize: { width: number; height: number }): Vector2D {
  const margin = 50 // Keep enemies away from edges
  const side = Math.floor(Math.random() * 4) // 0: top, 1: right, 2: bottom, 3: left

  switch (side) {
    case 0: // top
      return {
        x: margin + Math.random() * (arenaSize.width - 2 * margin),
        y: margin / 2,
      }
    case 1: // right
      return {
        x: arenaSize.width - margin / 2,
        y: margin + Math.random() * (arenaSize.height - 2 * margin),
      }
    case 2: // bottom
      return {
        x: margin + Math.random() * (arenaSize.width - 2 * margin),
        y: arenaSize.height - margin / 2,
      }
    case 3: // left
      return {
        x: margin / 2,
        y: margin + Math.random() * (arenaSize.height - 2 * margin),
      }
    default:
      return {
        x: margin + Math.random() * (arenaSize.width - 2 * margin),
        y: margin + Math.random() * (arenaSize.height - 2 * margin),
      }
  }
}

// Get enemy type for wave
export function getEnemyTypeForWave(waveNumber: number): "skeleton" | "zombie" | "ghost" | "necromancer" {
  if (waveNumber % 10 === 0) {
    return "necromancer"
  } else if (waveNumber % 5 === 0) {
    return "ghost"
  } else if (waveNumber % 3 === 0) {
    return "zombie"
  } else {
    return "skeleton"
  }
}

// Create an enemy
export function createEnemy(
  type: "skeleton" | "zombie" | "ghost" | "necromancer",
  position: Vector2D,
  wave: number,
): Enemy {
  const baseStats = {
    skeleton: {
      health: 30 + wave * 5,
      damage: 10 + wave,
      speed: 80 + wave * 2,
      value: 10,
      size: 20,
    },
    zombie: {
      health: 50 + wave * 8,
      damage: 15 + wave * 1.5,
      speed: 60 + wave,
      value: 20,
      size: 22,
    },
    ghost: {
      health: 20 + wave * 3,
      damage: 8 + wave * 0.5,
      speed: 100 + wave * 3,
      value: 15,
      size: 18,
    },
    necromancer: {
      health: 80 + wave * 10,
      damage: 20 + wave * 2,
      speed: 50 + wave,
      value: 50,
      size: 25,
    },
  }

  const stats = baseStats[type]

  return {
    id: `enemy-${type}-${Date.now()}-${Math.random()}`,
    type,
    position: { ...position },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    health: stats.health,
    maxHealth: stats.health,
    size: stats.size,
    speed: stats.speed,
    damage: stats.damage,
    lastAttackTime: Date.now(),
    attackCooldown: 1000,
    animationState: "walk",
    value: stats.value,
  }
}
