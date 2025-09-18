import type { GameImplementation, GameInitParams } from "@/types/game-registry"
import { galacticVanguardConfig } from "./config"
import GalacticVanguardGameLauncher from "./game-launcher"
import GalacticVanguardInstructions from "./instructions"
import { createInitialGalacticVanguardState } from "./game-state"

// Galactic Vanguard game implementation
const GalacticVanguardGameImplementation: GameImplementation = {
  GameComponent: GalacticVanguardGameLauncher,
  InstructionsComponent: GalacticVanguardInstructions,
  config: galacticVanguardConfig,
  initializeGameState: (params: GameInitParams) => {
    return createInitialGalacticVanguardState(params.playerId, params.playerName, params.gameMode)
  },
}

export default GalacticVanguardGameImplementation
