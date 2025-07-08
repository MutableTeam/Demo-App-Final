import { Swords, Users } from "lucide-react"
import type { GameImplementation, GameInitParams } from "@/types/game-registry"
import PvPTestGameComponent from "./game-component"
import PvPTestInstructions from "./instructions"

const PvPTestGame: GameImplementation = {
  GameComponent: PvPTestGameComponent,
  InstructionsComponent: PvPTestInstructions,
  config: {
    id: "pvp-test",
    name: "PvP Test Game",
    description: "A placeholder for a competitive PvP game.",
    image: "/images/diverse-group-playing-board-game.png",
    icon: <Swords className="h-5 w-5" />,
    status: "live",
    minWager: 1,
    maxPlayers: 4,
    gameType: "pvp",
    modes: [
      {
        id: "duel",
        name: "1v1 Duel",
        description: "Head-to-head battle.",
        players: 2,
        icon: <Swords className="h-5 w-5" />,
        minWager: 1,
      },
      {
        id: "team-deathmatch",
        name: "Team Deathmatch",
        description: "2v2 team battle.",
        players: 4,
        icon: <Users className="h-5 w-5" />,
        minWager: 2,
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

export default PvPTestGame
