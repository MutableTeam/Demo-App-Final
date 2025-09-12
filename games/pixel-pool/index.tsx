"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { PenTool as Pool } from "lucide-react"
import type { GameConfig, GameImplementation, GameInitParams } from "@/types/game-registry"
import PixelPoolGameComponent from "./game-component"
import PixelPoolInstructions from "./instructions"

// Game configuration
const pixelPoolConfig: GameConfig = {
  id: "pixel-pool",
  name: "MutaBall Pool",
  description: "Classic 8-ball pool with futuristic MutaBall physics",
  image: "/images/pixel-art-pool.png",
  icon: <Pool size={16} />,
  status: "coming-soon", // Set status to coming-soon
  minWager: 5,
  maxPlayers: 2,
  gameType: "turn-based",
  gameCategory: "PvP", // Add this line
  modes: [
    {
      id: "classic",
      name: "Classic MutaBall",
      description: "Traditional 8-ball pool with MutaBall enhancements",
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

const PixelPool: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setIsLoading(true)
    const iframe = iframeRef.current

    if (iframe) {
      iframe.onload = () => {
        setIsLoading(false)
      }
    }
  }, [])

  return (
    <div>
      <h1>{pixelPoolConfig.name}</h1>
      <p>{pixelPoolConfig.description}</p>
      {isLoading && <p>Loading...</p>}
      <iframe
        ref={iframeRef}
        src={pixelPoolConfig.gameUrl}
        width={pixelPoolConfig.width}
        height={pixelPoolConfig.height}
        style={{ border: "none" }}
        title={pixelPoolConfig.name}
      />
    </div>
  )
}

export default PixelPoolGame
