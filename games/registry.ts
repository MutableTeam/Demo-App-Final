import { gameRegistry } from "@/types/game-registry"
import PvPTestGame from "./pvp-test"
import PvETestGame from "./pve-test"

// Register all games
export function registerGames() {
  gameRegistry.registerGame(PvPTestGame)
  gameRegistry.registerGame(PvETestGame)
}

// Initialize the registry
registerGames()

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
