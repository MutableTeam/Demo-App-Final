import type { GameImplementation, GameInitParams } from "@/types/game-registry"
import { lastStandConfig } from "./config"
import LastStandGame from "./game-component"
import LastStandInstructions from "./instructions"
import { createInitialLastStandState } from "./game-state"

// Last Stand game implementation
const LastStandGameImplementation: GameImplementation = {
  GameComponent: LastStandGame,
  InstructionsComponent: LastStandInstructions,
  config: lastStandConfig,
  initializeGameState: (params: GameInitParams) => {
    return createInitialLastStandState(params.playerId, params.playerName, params.gameMode)
  },
}

export default LastStandGameImplementation
