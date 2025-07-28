import type { GameImplementation } from "@/types/game-registry"
import { GoalIcon,GoalIcon,GoalIcon,GoalIcon,GuitarIcon as Golf } from "lucide-react"
import ClosestToThePinGameComponent from "./game-component"
import ClosestToThePinInstructions from "./instructions"

const ClosestToThePinGame: GameImplementation = {
  GameComponent: ClosestToThePinGameComponent,
  InstructionsComponent: ClosestToThePinInstructions,
  config: {
    id: "closest-to-the-pin",
    name: "Closest to the Pin",
    description: "A relaxing golf game of skill. Get your ball nearest to the hole to win.",
    image: "/images/closest-to-theGoalIcon-cardGoalIcon",
  GoalIconon: <GoalIcon className="h-full w-full" />,
    status: "coming-soon",
    minWager: 50,
    maxPlayers: 4,
    gameType: "Turn-based",
    gameCategory: "PvE",
    modes: [
      {
        id: "classic",
        name: "Classic",
        description: "Standard closest to the pin rules.",
        players: 4,
        icon: <Golf className="h-4 w-4" />,
        minWager: 50,
      },
    ],
  },
  initializeGameState: (params) => {
    console.log("Initializing Closest to the Pin game state with params:", params)
    return {
      ...params,
      gameStatus: "pending",
      scores: {},
    }
  },
}

export default ClosestToThePinGame
