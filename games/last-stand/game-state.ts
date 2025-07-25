"use client"

import type { Vector2D, PlayerAnimationState } from "@/components/pvp-game/game-engine"
import type { Upgrade } from "./upgrades"

export interface LastStandGameState {
  playerId: string
  playerName: string
  gameMode: string
  player: Player
  enemies: Enemy[]
  arrows: Arrow[]
  companions: Companion[]
  effects: VisualEffect[]
  arenaSize: { width: number; height: number }
  gameTime: number
  isGameOver: boolean
  isPaused: boolean
  isLevelingUp: boolean
  availableUpgrades: Upgrade[]
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
  // Rogue-like stats
  level: number
  xp: number
  xpToNextLevel: number
  upgrades: { [key: string]: number } // Tracks level of each upgrade
  // Base stats that can be modified by upgrades
  damageMultiplier: number
  moveSpeedMultiplier: number
  xpMultiplier: number
  critChance: number
  healthRegen: number
  dashCooldownTime: number
  // Upgrade flags/levels
  multiShot: number
  piercing: number
  ricochet: number
  explosiveArrows: boolean
  frostArrows: boolean
  homingArrows: boolean
  hasWolf: boolean
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
  lifetime: number
  isWeakShot?: boolean
  distanceTraveled?: number
  range?: number
  // Upgrade properties
  piercingLeft: number
  bouncesLeft: number
  isExplosive: boolean
  isFrost: boolean
  isHoming: boolean
  homingTargetId?: string | null
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
  attackCooldown: number
  animationState: string
  value: number
  xpValue: number
  isSlowed: boolean
  slowTimer: number
}

export interface Companion {
  id: string
  type: "wolf"
  position: Vector2D
  target: Enemy | null
  attackCooldown: number
  speed: number
  damage: number
}

export interface VisualEffect {
  id: string
  type: "explosion"
  position: Vector2D
  radius: number
  duration: number
  life: number
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

// Calculate XP needed for the next level
export function calculateXpForLevel(level: number): number {
  // Level 2 requires 100 XP. Each subsequent level requires ~25% more.
  if (level === 1) return 100
  return Math.floor(100 * Math.pow(1.25, level - 1))
}

// Create initial game state
export function createInitialLastStandState(
  playerId: string,
  playerName: string,
  gameMode: string,
): LastStandGameState {
  const arenaSize = { width: 1280, height: 720 }
  const initialLevel = 1

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
      // Rogue-like stats
      level: initialLevel,
      xp: 0,
      xpToNextLevel: calculateXpForLevel(initialLevel),
      upgrades: {},
      damageMultiplier: 1,
      moveSpeedMultiplier: 1,
      xpMultiplier: 1,
      critChance: 0.05,
      healthRegen: 0,
      dashCooldownTime: 1.5,
      multiShot: 0,
      piercing: 0,
      ricochet: 0,
      explosiveArrows: false,
      frostArrows: false,
      homingArrows: false,
      hasWolf: false,
      // Animation state
      animationState: "idle",
      lastAnimationChange: Date.now(),
      // Bow mechanics
      isDrawingBow: false,
      drawStartTime: null,
      maxDrawTime: 1.5,
      minDrawTime: 0.45,
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
    companions: [],
    effects: [],
    arenaSize,
    gameTime: 0,
    isGameOver: false,
    isPaused: false,
    isLevelingUp: false,
    availableUpgrades: [],
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
  // Increased enemy count and faster scaling
  let enemyCount = 8 + waveNumber * 3
  if (waveNumber > 10) {
    enemyCount = 38 + (waveNumber - 10) * 4
  }

  // Decreased spawn delay for faster pace
  const spawnDelay = Math.max(0.2, 2.5 - waveNumber * 0.1)

  return {
    number: waveNumber,
    enemyCount: enemyCount,
    remainingEnemies: enemyCount,
    spawnDelay: spawnDelay,
    lastSpawnTime: 0,
    isComplete: false,
  }
}

// Get a random spawn position
export function getRandomSpawnPosition(arenaSize: { width: number; height: number }): Vector2D {
  const margin = 50
  const side = Math.floor(Math.random() * 4)

  switch (side) {
    case 0:
      return { x: Math.random() * arenaSize.width, y: -margin }
    case 1:
      return { x: arenaSize.width + margin, y: Math.random() * arenaSize.height }
    case 2:
      return { x: Math.random() * arenaSize.width, y: arenaSize.height + margin }
    case 3:
      return { x: -margin, y: Math.random() * arenaSize.height }
    default:
      return { x: 0, y: 0 }
  }
}

// Get enemy type for wave
export function getEnemyTypeForWave(waveNumber: number): "skeleton" | "zombie" | "ghost" | "necromancer" {
  if (waveNumber % 10 === 0) return "necromancer"
  if (waveNumber % 5 === 0) return "ghost"
  if (waveNumber % 3 === 0) return "zombie"
  return "skeleton"
}

// Create an enemy
export function createEnemy(
  type: "skeleton" | "zombie" | "ghost" | "necromancer",
  position: Vector2D,
  wave: number,
): Enemy {
  const baseStats = {
    skeleton: { health: 30, damage: 10, speed: 80, value: 10, xp: 50, size: 20 }, // XP set to 50
    zombie: { health: 50, damage: 15, speed: 60, value: 20, xp: 80, size: 22 },
    ghost: { health: 20, damage: 8, speed: 100, value: 15, xp: 70, size: 18 },
    necromancer: { health: 80, damage: 20, speed: 50, value: 50, xp: 250, size: 25 },
  }

  const stats = baseStats[type]
  const healthMultiplier = 1 + (wave - 1) * 0.1
  const damageMultiplier = 1 + (wave - 1) * 0.05

  return {
    id: `enemy-${type}-${Date.now()}-${Math.random()}`,
    type,
    position: { ...position },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    health: stats.health * healthMultiplier,
    maxHealth: stats.health * healthMultiplier,
    size: stats.size,
    speed: stats.speed,
    damage: stats.damage * damageMultiplier,
    attackCooldown: 0.5 + Math.random() * 0.5,
    animationState: "walk",
    value: stats.value,
    xpValue: stats.xp,
    isSlowed: false,
    slowTimer: 0,
  }
}
