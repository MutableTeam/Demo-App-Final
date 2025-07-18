"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { MultiWalletConnector } from "@/components/multi-wallet-connector"
import { SignUpBanner } from "@/components/signup-banner"
import { TokenSwapForm } from "@/components/swap/token-swap-form"
import { TransactionHistory } from "@/components/swap/transaction-history"
import { MarketOverview } from "@/components/swap/market-overview"
import { LiquidityPoolStatus } from "@/components/swap/liquidity-pool-status"
import { MutableMarketplace } from "@/components/mutable-marketplace"
import { GameContainer } from "@/components/game-container"
import { gameRegistry } from "@/types/game-registry"
import { Play, Trophy, Users, Coins, TrendingUp, Shield, Gamepad2, Star, Clock, Target, Zap } from "lucide-react"

interface Player {
  id: string
  name: string
  avatar?: string
  level: number
  wins: number
  totalGames: number
}

interface GameSession {
  id: string
  gameId: string
  players: Player[]
  status: "waiting" | "playing" | "finished"
  winner?: string
}

export function MutablePlatform() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("games")
  const [currentPlayer] = useState<Player>({
    id: "player-1",
    name: "Player",
    level: 5,
    wins: 12,
    totalGames: 20,
  })
  const [gameSession, setGameSession] = useState<GameSession | null>(null)

  const games = gameRegistry.getAllGames()

  const handleWalletConnect = (connected: boolean) => {
    setIsWalletConnected(connected)
  }

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId)
    // Create a new game session
    const newSession: GameSession = {
      id: `session-${Date.now()}`,
      gameId,
      players: [currentPlayer],
      status: "waiting",
    }
    setGameSession(newSession)
  }

  const handleGameEnd = (winner: string | null) => {
    if (gameSession) {
      setGameSession({
        ...gameSession,
        status: "finished",
        winner: winner || undefined,
      })
    }
    // Reset after a delay
    setTimeout(() => {
      setSelectedGame(null)
      setGameSession(null)
    }, 3000)
  }

  const handleBackToGames = () => {
    setSelectedGame(null)
    setGameSession(null)
  }

  // If a game is selected, show the game container
  if (selectedGame && gameSession) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <Button onClick={handleBackToGames} variant="outline" className="mb-4 bg-transparent">
              ← Back to Games
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {games.find((g) => g.id === selectedGame)?.name || "Game"}
            </h1>
          </div>

          <GameContainer
            gameId={selectedGame}
            playerId={currentPlayer.id}
            playerName={currentPlayer.name}
            isHost={true}
            gameMode="single"
            onGameEnd={handleGameEnd}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mutable Platform</h1>
            <p className="text-gray-600">Play games, earn tokens, and trade on Solana</p>
          </div>
          <MultiWalletConnector onConnect={handleWalletConnect} />
        </div>

        {/* Show signup banner if wallet not connected */}
        {!isWalletConnected && (
          <div className="mb-8">
            <SignUpBanner />
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="games" className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              Games
            </TabsTrigger>
            <TabsTrigger value="swap" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Swap
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Games Tab */}
          <TabsContent value="games" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <Card key={game.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {game.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">4.8</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{game.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <img
                        src={game.image || "/placeholder.svg"}
                        alt={game.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{game.maxPlayers} players</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>~{game.estimatedDuration}min</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-orange-500" />
                        <span className="font-semibold text-orange-600">{game.tokenReward} MUTB</span>
                      </div>
                      <Button
                        onClick={() => handleGameSelect(game.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        disabled={!isWalletConnected}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Play Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Swap Tab */}
          <TabsContent value="swap" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <TokenSwapForm />
                <TransactionHistory />
              </div>
              <div className="space-y-6">
                <MarketOverview />
                <LiquidityPoolStatus />
              </div>
            </div>
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace">
            <MutableMarketplace />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" />
                    <AvatarFallback>{currentPlayer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{currentPlayer.name}</h2>
                    <p className="text-gray-600">Level {currentPlayer.level}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Trophy className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{currentPlayer.wins}</div>
                    <div className="text-sm text-gray-600">Wins</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{currentPlayer.totalGames}</div>
                    <div className="text-sm text-gray-600">Games Played</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round((currentPlayer.wins / currentPlayer.totalGames) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Win Rate</div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Progress to Next Level</h3>
                  <Progress value={65} className="mb-2" />
                  <p className="text-sm text-gray-600">350/500 XP to Level {currentPlayer.level + 1}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Trophy className="w-6 h-6 text-yellow-600" />
                      <div>
                        <div className="font-medium">First Victory</div>
                        <div className="text-sm text-gray-600">Won your first game</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Target className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="font-medium">Sharpshooter</div>
                        <div className="text-sm text-gray-600">Hit 10 consecutive targets</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
