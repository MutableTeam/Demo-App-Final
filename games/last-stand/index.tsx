import type { GameImplementation, GameInitParams } from "@/types/game-registry"
import { lastStandConfig } from "./config"
import LastStandGame from "./game-component"
import LastStandInstructions from "./instructions"
import { createInitialLastStandState } from "./game-state"

interface GameConfig {
  gameType: string
  gameCategory: string
  modes: string[]
}

const config: GameConfig = {
  gameType: "Survival",
  gameCategory: "PvE",
  modes: ["Single Player", "Multiplayer"],
}

const updatedLastStandConfig = {
  ...lastStandConfig,
  gameCategory: "PvE" as const, // Add this line
}

// Last Stand game implementation
const LastStandGameImplementation: GameImplementation = {
  GameComponent: LastStandGame,
  InstructionsComponent: LastStandInstructions,
  config: updatedLastStandConfig,
  initializeGameState: (params: GameInitParams) => {
    return createInitialLastStandState(params.playerId, params.playerName, params.gameMode)
  },
}

export default LastStandGameImplementation
