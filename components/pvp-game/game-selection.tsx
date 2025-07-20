"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import LastStandGameLauncher from "@/games/last-stand/game-launcher"
import PixelPoolGame from "@/games/pixel-pool/index"
import { usePlatform } from "@/contexts/platform-context"
import MobileGameContainer from "@/components/mobile-game-container"
import DesktopGameContainer from "@/components/desktop-game-container"

interface GameSelectionProps {
  publicKey: string
  playerName: string
  mutbBalance: number
}

const games = [
  {
    id: "last-stand",
    name: "Last Stand",
    description: "Survive endless waves of enemies in this intense PvE challenge.",
    image: "/images/last-stand-card.png",
    component: LastStandGameLauncher,
  },
  {
    id: "pixel-pool",
    name: "Pixel Pool",
    description: "A retro-style 8-ball pool game with a competitive twist.",
    image: "/images/pixel-pool-card.png",
    component: PixelPoolGame.GameComponent,
    status: "coming-soon",
  },
  {
    id: "archer-arena",
    name: "Archer Arena",
    description: "Fast-paced PvP archery combat. Outmaneuver and outshoot your opponents.",
    image: "/images/archer-arena-card.png",
    // This will be handled by the Desktop/Mobile containers directly
    component: null,
  },
]

export default function GameSelection({ publicKey, playerName, mutbBalance }: GameSelectionProps) {
  const [selectedGame, setSelectedGame] = useState<any>(null)
  const { styleMode } = useCyberpunkTheme()
  const { platformType } = usePlatform()
  const isCyberpunk = styleMode === "cyberpunk"

  const [joystickState, setJoystickState] = useState({ x: 0, y: 0 })
  const [actionState, setActionState] = useState<{ action: string; pressed: boolean } | null>(null)

  const handleGameSelect = (game: any) => {
    // Don't allow selection of coming soon games
    if (game.status === "coming-soon") {
      return
    }
    setSelectedGame(game)
  }

  const handleBack = () => {
    setSelectedGame(null)
  }

  const handleJoystickMove = (direction: { x: number; y: number }) => {
    setJoystickState(direction)
  }

  const handleActionPress = (action: string, pressed: boolean) => {
    setActionState({ action, pressed })
  }

  if (selectedGame) {
    const GameComponent = selectedGame.component

    // Handle Archer Arena separately to inject the correct container
    if (selectedGame.id === "archer-arena") {
      if (platformType === "mobile") {
        return (
          <MobileGameContainer
            onJoystickMove={handleJoystickMove}
            onActionPress={handleActionPress}
            onExit={handleBack}
          >
            <DesktopGameContainer
              gameId="archer-arena"
              playerId={publicKey}
              playerName={playerName}
              isHost={true}
              gameMode="ffa"
              onGameEnd={handleBack}
              joystickInput={joystickState}
              actionInput={actionState}
            />
          </MobileGameContainer>
        )
      }
      // Desktop Archer Arena
      return (
        <DesktopGameContainer
          gameId="archer-arena"
          playerId={publicKey}
          playerName={playerName}
          isHost={true}
          gameMode="ffa"
          onGameEnd={handleBack}
        />
      )
    }

    // For other games like Last Stand, Pixel Pool
    return (
      <GameComponent
        publicKey={publicKey}
        playerName={playerName}
        mutbBalance={mutbBalance}
        onExit={handleBack}
        isCyberpunk={isCyberpunk}
      />
    )
  }

  const cardClass = isCyberpunk
    ? "bg-black/80 border-cyan-500/50 text-cyan-200 hover:border-cyan-400 hover:bg-black/70"
    : "border-4 border-black bg-[#fbf3de] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#f5efdc]"

  const titleClass = isCyberpunk ? "text-cyan-400" : "text-black"
  const descriptionClass = isCyberpunk ? "text-cyan-300/80" : "text-gray-700"

  return (
    <div className="w-full">
      <Card className={cn("border-none shadow-none", isCyberpunk ? "bg-transparent" : "bg-transparent")}>
        <CardHeader>
          <CardTitle className={cn("text-4xl font-bold font-mono", titleClass)}>Select a Game</CardTitle>
          <CardDescription className={descriptionClass}>Choose your challenge and enter the arena.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Card
              key={game.id}
              className={cn(
                "cursor-pointer transition-all duration-300 relative",
                cardClass,
                game.status === "coming-soon" ? "opacity-60 cursor-not-allowed" : "",
              )}
              onClick={() => handleGameSelect(game)}
            >
              <CardHeader className="p-0">
                <Image
                  src={game.image || "/placeholder.svg"}
                  alt={game.name}
                  width={400}
                  height={200}
                  className="rounded-t-lg object-cover"
                />
                {game.status === "coming-soon" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg">
                    <span className="bg-yellow-500 text-black px-3 py-1 rounded font-bold text-sm">COMING SOON</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4">
                <h3 className={cn("text-2xl font-bold font-mono", titleClass)}>{game.name}</h3>
                <p className={cn("mt-2 text-sm", descriptionClass)}>{game.description}</p>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
