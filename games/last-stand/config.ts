export interface GameMode {
  id: string
  name: string
  description: string
  entryFee: number
  duration?: string
  leaderboard?: string
  icon: string
}

export interface LastStandConfig {
  name: string
  description: string
  modes: GameMode[]
  enemyTypes: {
    skeleton: {
      name: string
      description: string
      health: number
      speed: number
      damage: number
    }
    zombie: {
      name: string
      description: string
      health: number
      speed: number
      damage: number
    }
    ghost: {
      name: string
      description: string
      health: number
      speed: number
      damage: number
    }
  }
}

export const lastStandConfig: LastStandConfig = {
  name: "Last Stand",
  description: "Survive waves of enemies in this intense PvE experience",
  modes: [
    {
      id: "practice",
      name: "Practice",
      description: "Practice mode - no entry fee",
      entryFee: 0,
      icon: "target",
    },
    {
      id: "hourly",
      name: "Hourly Challenge",
      description: "Compete for the highest score in 1 hour",
      entryFee: 5,
      duration: "1 hours",
      leaderboard: "hourly",
      icon: "clock",
    },
    {
      id: "daily",
      name: "Daily Challenge",
      description: "Compete for the highest score in 24 hours",
      entryFee: 10,
      duration: "24 hours",
      leaderboard: "daily",
      icon: "trophy",
    },
  ],
  enemyTypes: {
    skeleton: {
      name: "Skeleton",
      description: "Basic enemy. Fast but weak.",
      health: 1,
      speed: 2,
      damage: 1,
    },
    zombie: {
      name: "Zombie",
      description: "Slow but tough. Deals more damage.",
      health: 3,
      speed: 1,
      damage: 2,
    },
    ghost: {
      name: "Ghost",
      description: "Very fast and can move through obstacles. Low health.",
      health: 1,
      speed: 3,
      damage: 1,
    },
  },
}
