import { gameRegistry } from "@/types/game-registry"
import TopDownShooterGame from "./top-down-shooter"
import PixelPoolGame from "./pixel-pool"
import LastStandGame from "./last-stand"
import ClosestToThePinGame from "./closest-to-the-pin"
import MutableFPSGame from "./mutable-fps"
import GalacticVanguardGame from "./galactic-vanguard"

// Register all games
export function registerGames() {
  gameRegistry.registerGame(MutableFPSGame)

  // Register the top-down shooter game
  gameRegistry.registerGame(TopDownShooterGame)

  // Register the pixel pool game (now MutaBall Pool)
  gameRegistry.registerGame(PixelPoolGame)

  // Register the Last Stand game
  gameRegistry.registerGame(LastStandGame)

  // Register the Galactic Vanguard game
  gameRegistry.registerGame(GalacticVanguardGame)

  // Register the Closest to the Pin game
  gameRegistry.registerGame(ClosestToThePinGame)

  // Register more games here as they are developed
}

// Initialize the registry
registerGames()

// Ensure archer-arena is properly registered in the registry

// Export helper functions
export function getAllGames() {
  return gameRegistry.getAllGames()
}

export function getLiveGames() {
  return gameRegistry.getLiveGames()
}

export function getGameById(id: string) {
  return gameRegistry.getGame(id)
}
