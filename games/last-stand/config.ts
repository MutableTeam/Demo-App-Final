import type { GameConfig } from "@/types/game-registry"
import { Target } from "lucide-react"

export const lastStandConfig: GameConfig = {
  id: "archer-arena",
  name: "Archer Arena: Last Stand",
  description: "Survive waves of enemies in this intense archer survival game",
  image: "/images/last-stand.jpg",
  icon: <Target className="h-5 w-5" />,
  status: "live",
  minWager: 1,
  maxPlayers: 1,
  gameType: "survival",
  gameCategory: "PvE",
  modes: [
    {
      id: "practice",
      name: "Practice",
      description: "Practice mode - no entry fee",
      entryFee: 0,
      duration: 0, // No time limit
    },
    {
      id: "hourly",
      name: "Hourly Challenge",
      description: "Compete for the highest score in 1 hour",
      entryFee: 5,
      duration: 60 * 60 * 1000, // 1 hour in milliseconds
      leaderboardRefresh: "hourly",
    },
    {
      id: "daily",
      name: "Daily Challenge",
      description: "Compete for the highest score in 24 hours",
      entryFee: 10,
      duration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      leaderboardRefresh: "daily",
    },
  ],
}
