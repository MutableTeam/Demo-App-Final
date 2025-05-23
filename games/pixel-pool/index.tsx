import { PocketIcon as Pool } from "lucide-react"
import type { GameConfig, GameImplementation, GameInitParams } from "@/types/game-registry"
import PixelPoolGameComponent from "./game-component"
import PixelPoolInstructions from "./instructions"

// Game configuration
const pixelPoolConfig: GameConfig = {
  id: "pixel-pool",
  name: "Pixel Pool",
  description: "Classic 8-ball pool with pixel art graphics",
  image: "/images/pixel-art-pool.png",
  icon: <Pool size={16} />,
  status: "coming-soon", // Set status to coming-soon
  minWager: 5,
  maxPlayers: 2,
  gameType: "turn-based",
  modes: [
    {
      id: "classic",
      name: "Classic 8-Ball",
      description: "Traditional 8-ball pool rules",
      players: 2,
      icon: <Pool size={16} />,
      minWager: 5,
    },
  ],
}

// Game implementation
const PixelPoolGame: GameImplementation = {
  GameComponent: PixelPoolGameComponent,
  InstructionsComponent: PixelPoolInstructions,
  config: pixelPoolConfig,
  initializeGameState: (params: GameInitParams) => {
    // This would normally initialize the game state
    // For now, return a placeholder state
    return {
      gameId: params.gameMode,
      players: params.players,
      currentPlayer: params.playerId,
      balls: [],
      pockets: [],
      status: "waiting",
    }
  },
}

export default PixelPoolGame
