"use client"
import { Crosshair } from "lucide-react"
import type { GameConfig, GameImplementation, GameInitParams } from "@/types/game-registry"
import MutableFPSGameComponent from "./game-component"
import MutableFPSInstructions from "./instructions"

// Game configuration
const mutableFPSConfig: GameConfig = {
  id: "mutable-fps",
  name: "Battlefield 6 Portal",
  description: "Battlefield 6 / Mutable PvP crossover - Create custom game modes using Portal",
  image: "/images/battlefield6-card.png",
  icon: <Crosshair size={16} />,
  status: "coming-soon", // Set status to coming-soon for now
  minWager: 10,
  maxPlayers: 8,
  minPlayers: 2,
  gameType: "real-time",
  gameCategory: "PvP",
  modes: [
    {
      id: "deathmatch",
      name: "Deathmatch",
      description: "Classic free-for-all combat (2-8 players)",
      players: 8,
      minPlayers: 2,
      icon: <Crosshair size={16} />,
      minWager: 10,
    },
    {
      id: "team-deathmatch",
      name: "Team Deathmatch",
      description: "Team-based combat (4-8 players)",
      players: 8,
      minPlayers: 4,
      icon: <Crosshair size={16} />,
      minWager: 15,
    },
  ],
}

// Game implementation
const MutableFPSGame: GameImplementation = {
  GameComponent: MutableFPSGameComponent,
  InstructionsComponent: MutableFPSInstructions,
  config: mutableFPSConfig,
  initializeGameState: (params: GameInitParams) => {
    return {
      gameId: params.gameMode,
      players: params.players,
      currentPlayer: params.playerId,
      arena: "cyberpunk_city",
      weapons: [],
      powerUps: [],
      status: "waiting",
    }
  },
}

export default MutableFPSGame
