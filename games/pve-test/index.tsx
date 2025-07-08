import { Trophy, Clock, Calendar } from "lucide-react"
import type { GameImplementation, GameInitParams } from "@/types/game-registry"
import PvETestGameComponent from "./game-component"
import PvETestInstructions from "./instructions"

const PvETestGame: GameImplementation = {
  GameComponent: PvETestGameComponent,
  InstructionsComponent: PvETestInstructions,
  config: {
    id: "pve-test",
    name: "PvE Test Challenge",
    description: "A placeholder for a score-based PvE game.",
    image: "/images/abstract-geometric-shapes.png",
    icon: <Trophy className="h-5 w-5" />,
    status: "live",
    minWager: 0,
    maxPlayers: 1,
    gameType: "pve",
    modes: [
      {
        id: "hourly-challenge",
        name: "Hourly Challenge",
        description: "Compete for the high score on the hourly leaderboard.",
        players: 1,
        icon: <Clock className="h-5 w-5" />,
        minWager: 0,
        entryFee: 5,
        leaderboardRefresh: "Hourly",
      },
      {
        id: "daily-challenge",
        name: "Daily Challenge",
        description: "A tougher challenge with a bigger prize pool. Resets daily.",
        players: 1,
        icon: <Calendar className="h-5 w-5" />,
        minWager: 0,
        entryFee: 20,
        leaderboardRefresh: "Daily",
      },
    ],
  },
  initializeGameState: (params: GameInitParams) => {
    return {
      ...params,
      status: "waiting",
    }
  },
}

export default PvETestGame
