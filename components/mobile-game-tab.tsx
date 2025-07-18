"use client"

import { useState } from "react"
import { GameContainer } from "@/components/game-container"
import { gameRegistry } from "@/types/game-registry"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Users, Trophy, Settings, ArrowLeft, Gamepad2 } from "lucide-react"
import { useIsMobile } from "@/components/ui/use-mobile"
import ResponsiveGameContainer from "@/components/responsive-game-container"
import Image from "next/image"
import { GAME_IMAGES, TOKENS } from "@/utils/image-paths"

interface MobileGameTabProps {
  className?: string
}

export function MobileGameTab({ className }: MobileGameTabProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [gameState, setGameState] = useState<"menu" | "playing" | "ended">("menu")
  const [playerId] = useState(`player-${Math.random().toString(36).substr(2, 9)}`)
  const [playerName] = useState("Mobile Player")
  const [mutbBalance] = useState(100.0)
  const isMobile = useIsMobile()

  // Get available games
  const games = gameRegistry.getAllGames()
  const archerArena = games.find((game) => game.id === "archer-arena")

  const handleGameStart = (gameId: string) => {
    setSelectedGame(gameId)
    setGameState("playing")
  }

  const handleGameEnd = (winner: string | null) => {
    setGameState("ended")
    // Auto return to menu after 3 seconds
    setTimeout(() => {
      setGameState("menu")
      setSelectedGame(null)
    }, 3000)
  }

  const handleBackToMenu = () => {
    setGameState("menu")
    setSelectedGame(null)
  }

  // If currently playing a game, show the game container
  if (gameState === "playing" && selectedGame) {
    return (
      <div className="w-full h-full relative bg-black">
        {/* Mobile back button */}
        <div className="absolute top-2 left-2 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToMenu}
            className="bg-black/70 text-white border-white/30 hover:bg-black/90"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>

        {/* Game container with responsive wrapper */}
        <ResponsiveGameContainer gameWidth={800} gameHeight={600} className="w-full h-full">
          <GameContainer
            gameId={selectedGame}
            playerId={playerId}
            playerName={playerName}
            isHost={true}
            gameMode="mobile"
            onGameEnd={handleGameEnd}
          />
        </ResponsiveGameContainer>
      </div>
    )
  }

  // Show game selection menu
  return (
    <div className={`w-full h-full bg-[#1a1a2e] overflow-y-auto ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">MOBILE GAMES</h1>
              <p className="text-gray-400 text-sm">Play games optimized for mobile devices</p>
            </div>
          </div>
          <Badge className="bg-yellow-500 text-black font-mono px-3 py-1">
            <Image
              src={TOKENS.MUTABLE || "/placeholder.svg"}
              alt="MUTB"
              width={16}
              height={16}
              className="rounded-full mr-1"
            />
            {mutbBalance.toFixed(2)} MUTB
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Featured Game - Archer Arena */}
        {archerArena && (
          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30 overflow-hidden">
            <div className="relative">
              <Image
                src={GAME_IMAGES.ARCHER || "/placeholder.svg"}
                alt="Archer Arena"
                width={400}
                height={200}
                className="w-full h-32 object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Trophy className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <div className="bg-purple-600 p-1 rounded">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <path d="M3 8a7 7 0 0 1 14 0a6.97 6.97 0 0 1-2 4.9V22h-3v-3h-4v3h-3v-9.1A6.97 6.97 0 0 1 3 8z" />
                  </svg>
                </div>
                {archerArena.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm">{archerArena.description}</p>

              {/* Game stats */}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>1-4 Players</span>
                </div>
                <div className="flex items-center gap-1">
                  <Settings className="w-4 h-4" />
                  <span>Touch Controls</span>
                </div>
              </div>

              {/* Mobile features */}
              <div className="space-y-2">
                <h4 className="text-white font-medium text-sm">Mobile Features:</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Virtual joystick for movement</li>
                  <li>• Touch-to-aim bow controls</li>
                  <li>• Gesture-based special attacks</li>
                  <li>• Responsive scaling</li>
                  <li>• Optimized for portrait & landscape</li>
                </ul>
              </div>

              <Button
                onClick={() => handleGameStart(archerArena.id)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold"
              >
                <Play className="w-4 h-4 mr-2" />
                Play Now
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Other Games */}
        <div className="space-y-3">
          <h3 className="text-white font-medium">Other Games</h3>
          {games
            .filter((game) => game.id !== "archer-arena")
            .map((game) => (
              <Card key={game.id} className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                        {game.icon}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{game.name}</h4>
                        <p className="text-gray-400 text-sm">{game.description}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {game.status === "live" ? "Available" : "Coming Soon"}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGameStart(game.id)}
                      disabled={game.status !== "live"}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Mobile optimization notice */}
        <Card className="bg-blue-900/20 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-400 mt-1">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-blue-300 font-medium text-sm">Mobile Optimized</h4>
                <p className="text-blue-200 text-xs mt-1">
                  Games are optimized for touch controls. Rotate to landscape for the best experience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
