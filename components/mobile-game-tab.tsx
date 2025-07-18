"use client"

import { useState } from "react"
import { GameContainer } from "@/components/game-container"
import { gameRegistry } from "@/types/game-registry"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Users, Trophy, Settings } from "lucide-react"
import { useIsMobile } from "@/components/ui/use-mobile"
import ResponsiveGameContainer from "@/components/responsive-game-container"

interface MobileGameTabProps {
  className?: string
}

export function MobileGameTab({ className }: MobileGameTabProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [gameState, setGameState] = useState<"menu" | "playing" | "ended">("menu")
  const [playerId] = useState(`player-${Math.random().toString(36).substr(2, 9)}`)
  const [playerName] = useState("Mobile Player")
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
      <div className="w-full h-full relative">
        {/* Mobile back button */}
        <div className="absolute top-2 left-2 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToMenu}
            className="bg-black/70 text-white border-white/30 hover:bg-black/90"
          >
            ← Back
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
            className="w-full h-full"
          />
        </ResponsiveGameContainer>
      </div>
    )
  }

  // Show game selection menu
  return (
    <div className={`w-full h-full p-4 overflow-y-auto ${className}`}>
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Mobile Games</h1>
          <p className="text-gray-400 text-sm">Optimized for mobile devices with touch controls</p>
        </div>

        {/* Featured Game - Archer Arena */}
        {archerArena && (
          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  {archerArena.name}
                </CardTitle>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  Featured
                </Badge>
              </div>
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
                  <li>• Auto-rotate to landscape</li>
                  <li>• Responsive scaling</li>
                </ul>
              </div>

              <Button
                onClick={() => handleGameStart(archerArena.id)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
                    <div>
                      <h4 className="text-white font-medium">{game.name}</h4>
                      <p className="text-gray-400 text-sm">{game.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGameStart(game.id)}
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
        {isMobile && (
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
        )}
      </div>
    </div>
  )
}
