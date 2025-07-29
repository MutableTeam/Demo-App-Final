import type { GameConfig } from "@/types/game-registry"
import { Target } from "lucide-react"

export const lastStandConfig: GameConfig = {
  id: "last-stand",
  name: "Last Stand",
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
      players: 1,
      icon: <Target className="h-4 w-4" />,
      minWager: 0,
    },
    {
      id: "hourly",
      name: "Hourly Challenge",
      description: "Compete for the highest score in 1 hour",
      players: 1,
      icon: <Target className="h-4 w-4" />,
      minWager: 5,
    },
    {
      id: "daily",
      name: "Daily Challenge",
      description: "Compete for the highest score in 24 hours",
      players: 1,
      icon: <Target className="h-4 w-4" />,
      minWager: 10,
    },
  ],
}
