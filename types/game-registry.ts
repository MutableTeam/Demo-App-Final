import type React from "react"
import type { ReactNode } from "react"

// Game mode configuration
export interface GameMode {
  id: string
  name: string
  description: string
  players: number
  icon: ReactNode
  minWager: number
}

// Game configuration
export interface GameConfig {
  id: string
  name: string
  description: string
  image: string
  icon: ReactNode
  status: "live" | "coming-soon"
  minWager: number
  maxPlayers: number
  gameType: string
  modes: GameMode[]
  useEnhancedRenderer?: boolean
}

// Game initialization parameters
export interface GameInitParams {
  playerId: string
  playerName: string
  isHost: boolean
  gameMode: string
  players: Array<{
    id: string
    name: string
    isHost: boolean
  }>
}

// Game implementation interface
export interface GameImplementation {
  GameComponent: React.ComponentType<any>
  InstructionsComponent: React.ComponentType<any>
  config: GameConfig
  initializeGameState: (params: GameInitParams) => any
}

// Game registry to manage all available games
class GameRegistry {
  private games: Map<string, GameImplementation> = new Map()

  // Register a game
  registerGame(game: GameImplementation): void {
    this.games.set(game.config.id, game)
  }

  // Get a game by ID
  getGame(id: string): GameImplementation | null {
    return this.games.get(id) || null
  }

  // Get all games
  getAllGames(): GameImplementation[] {
    return Array.from(this.games.values())
  }

  // Get only live games
  getLiveGames(): GameImplementation[] {
    return this.getAllGames().filter((game) => game.config.status === "live")
  }

  // Get games by type
  getGamesByType(type: string): GameImplementation[] {
    return this.getAllGames().filter((game) => game.config.gameType === type)
  }
}

// Create and export a singleton instance
export const gameRegistry = new GameRegistry()

export interface GameInfo {
  id: string
  name: string
  description: string
  thumbnail: string
  minPlayers: number
  maxPlayers: number
  supportedControls: string[]
  version: string
  author: string
  component: React.ComponentType<any>
  status?: "live" | "coming-soon"
}

// Make sure the archer-arena game is properly registered
