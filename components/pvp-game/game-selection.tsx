"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Play, Users, Trophy, Clock, HelpCircle, ExternalLink } from "lucide-react"
import Image from "next/image"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import LastStandGameLauncher from "@/games/last-stand/game-launcher"
import PixelPoolGame from "@/games/pixel-pool/index"
import { usePlatform } from "@/contexts/platform-context"
import MobileGameContainer from "@/components/mobile-game-container"
import DesktopGameContainer from "@/components/desktop-game-container"
import { useIsMobile } from "@/components/ui/use-mobile"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
    status: "live",
    minWager: 1,
    maxPlayers: 1,
    gameType: "PvE",
    duration: "3-5 min",
  },
  {
    id: "pixel-pool",
    name: "Pixel Pool",
    description: "A retro-style 8-ball pool game with a competitive twist.",
    image: "/images/pixel-pool-card.png",
    component: PixelPoolGame.GameComponent,
    status: "coming-soon",
    minWager: 5,
    maxPlayers: 2,
    gameType: "PvP",
    duration: "5-10 min",
  },
  {
    id: "archer-arena",
    name: "Archer Arena",
    description: "Fast-paced PvP archery combat. Outmaneuver and outshoot your opponents.",
    image: "/images/archer-arena-card.png",
    component: null,
    status: "live",
    minWager: 2,
    maxPlayers: 4,
    gameType: "PvP",
    duration: "3-5 min",
  },
]

export default function GameSelection({ publicKey, playerName, mutbBalance }: GameSelectionProps) {
  const [selectedGame, setSelectedGame] = useState<any>(null)
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())
  const { styleMode } = useCyberpunkTheme()
  const { platformType } = usePlatform()
  const isCyberpunk = styleMode === "cyberpunk"
  const isMobile = useIsMobile()

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

  const handleCardClick = (gameId: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(gameId)) {
        newSet.delete(gameId)
      } else {
        newSet.add(gameId)
      }
      return newSet
    })
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
    if (GameComponent) {
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
  }

  const cardClass = isCyberpunk
    ? "bg-black/80 border-cyan-500/50 text-cyan-200 hover:border-cyan-400 hover:bg-black/70"
    : "border-4 border-black bg-[#fbf3de] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#f5efdc] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"

  const titleClass = isCyberpunk ? "text-cyan-400" : "text-black"
  const descriptionClass = isCyberpunk ? "text-cyan-300/80" : "text-gray-700"

  const getCardHeight = () => {
    if (isMobile) return "h-56"
    return "h-72 lg:h-80"
  }

  const cardHeight = getCardHeight()

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Gamepad2 className={`h-5 w-5 ${isCyberpunk ? "text-[#0ff]" : "text-black"}`} />
          <h1 className={cn("text-2xl font-bold font-mono", titleClass)}>MUTABLE GAMES</h1>
        </div>
        <p className={cn("text-sm", descriptionClass)}>
          Select a game to play and wager tokens. Click cards to see more details.
        </p>
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => {
          const isFlipped = flippedCards.has(game.id)

          return (
            <div key={game.id} className="flip-card">
              <div
                className={`flip-card-inner transition-transform duration-700 ${isFlipped ? "flip-card-flipped" : ""}`}
              >
                {/* Front Side - Game Image and Name */}
                <div className="flip-card-front">
                  <Card
                    className={cn(
                      "cursor-pointer overflow-hidden transition-all duration-300 relative",
                      cardClass,
                      cardHeight,
                      game.status === "coming-soon" ? "opacity-60" : "",
                    )}
                    onClick={() => handleCardClick(game.id)}
                  >
                    <div className="relative h-full">
                      <Image
                        src={game.image || "/placeholder.svg"}
                        alt={game.name}
                        fill
                        className="object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      {game.status === "coming-soon" && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge
                            className={cn(
                              "font-mono",
                              isCyberpunk
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                                : "bg-yellow-500 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                            )}
                          >
                            {game.id === "pixel-pool" ? "IN DEVELOPMENT" : "COMING SOON"}
                          </Badge>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-xl md:text-2xl font-mono font-bold text-white drop-shadow-lg">
                          {game.name}
                        </h3>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Back Side - Game Info and Play Button */}
                <div className="flip-card-back">
                  <Card
                    className={cn(
                      "cursor-pointer overflow-hidden transition-all duration-300 relative",
                      cardClass,
                      cardHeight,
                      game.status === "coming-soon" ? "opacity-60" : "",
                    )}
                    onClick={() => handleCardClick(game.id)}
                  >
                    <div className="relative h-full">
                      <Image
                        src={game.image || "/placeholder.svg"}
                        alt={game.name}
                        fill
                        className="object-cover opacity-30"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/60" />

                      {/* Help Button */}
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-8 w-8 p-0",
                                isCyberpunk
                                  ? "bg-slate-800/70 border border-slate-600/70 text-slate-200 hover:bg-slate-700/80"
                                  : "bg-amber-200/80 border-2 border-black text-amber-800 hover:bg-amber-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                              )}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <HelpCircle className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className={isCyberpunk ? "bg-slate-900 border-slate-700" : "border-2 border-black"}
                          >
                            <DropdownMenuItem asChild>
                              <a
                                href={`/games/${game.id}/instructions`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                <HelpCircle className="h-4 w-4" />
                                Game Instructions
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="relative h-full flex flex-col justify-between p-4 lg:p-6">
                        <div className="flex-1 space-y-3 lg:space-y-4">
                          <div className="flex items-center gap-2">
                            <Play className="h-4 w-4 text-white" />
                            <h3 className="text-base md:text-lg lg:text-xl font-mono font-bold text-white drop-shadow-lg">
                              {game.name}
                            </h3>
                          </div>
                          <p className="text-xs md:text-sm lg:text-base text-white/90 line-clamp-2 lg:line-clamp-3 drop-shadow">
                            {game.description}
                          </p>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs lg:text-sm text-white/80">
                              <Users className="h-3 w-3 lg:h-4 lg:w-4" />
                              <span>{game.maxPlayers} Players</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs lg:text-sm text-white/80">
                              <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
                              <span>{game.duration}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs lg:text-sm text-white/80">
                              <Trophy className="h-3 w-3 lg:h-4 lg:w-4" />
                              <span>Min Wager: {game.minWager} MUTB</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 lg:mt-6">
                          <Button
                            className={cn(
                              "w-full font-mono text-xs md:text-sm lg:text-base min-h-[44px] lg:min-h-[48px]",
                              isCyberpunk
                                ? "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50"
                                : "bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all",
                            )}
                            disabled={game.status !== "live"}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleGameSelect(game)
                            }}
                          >
                            {game.status === "live" ? "PLAY NOW" : "COMING SOON"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* CSS for flip cards */}
      <style jsx>{`
        .flip-card {
          background-color: transparent;
          perspective: 1000px;
        }

        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transform-style: preserve-3d;
        }

        .flip-card-flipped {
          transform: rotateY(180deg);
        }

        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }

        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  )
}

export { GameSelection }
