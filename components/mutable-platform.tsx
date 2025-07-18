"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, Coins, Users, TrendingUp, Star, Play, Wallet, Clock, Target, Zap } from "lucide-react"
import Image from "next/image"
import { GameContainer } from "@/components/game-container"
import { MutableMarketplace } from "@/components/mutable-marketplace"
import { TokenSwapForm } from "@/components/swap/token-swap-form"
import { TransactionHistory } from "@/components/swap/transaction-history"
import { MarketOverview } from "@/components/swap/market-overview"
import { LiquidityPoolStatus } from "@/components/swap/liquidity-pool-status"
import { SignUpBanner } from "@/components/signup-banner" // Corrected import

interface MutablePlatformProps {
  publicKey: string
  balance: number | null
  provider: any
  connection: any
}

interface Game {
  id: string
  name: string
  description: string
  image: string
  category: string
  players: number
  rating: number
  status: "live" | "coming-soon" | "maintenance"
  minBet?: number
  maxBet?: number
  features: string[]
}

const FEATURED_GAMES: Game[] = [
  {
    id: "last-stand",
    name: "Last Stand",
    description: "Survive waves of enemies in this intense tower defense game",
    image: "/images/last-stand.jpg",
    category: "Strategy",
    players: 1247,
    rating: 4.8,
    status: "live",
    minBet: 0.1,
    maxBet: 10,
    features: ["Single Player", "Leaderboards", "Token Rewards"],
  },
  {
    id: "pixel-pool",
    name: "Pixel Pool",
    description: "Classic 8-ball pool with a retro pixel art style",
    image: "/images/pixel-art-pool.png",
    category: "Sports",
    players: 892,
    rating: 4.6,
    status: "live",
    minBet: 0.05,
    maxBet: 5,
    features: ["Multiplayer", "Tournaments", "Skill-based"],
  },
  {
    id: "top-down-shooter",
    name: "Archer Game",
    description: "Fast-paced top-down shooter with epic battles",
    image: "/images/archer-game.png",
    category: "Action",
    players: 2156,
    rating: 4.9,
    status: "live",
    minBet: 0.2,
    maxBet: 15,
    features: ["PvP", "Real-time", "High Stakes"],
  },
]

const RECENT_ACTIVITIES = [
  { user: "Player123", action: "Won 50 MUTB", game: "Last Stand", time: "2 min ago" },
  { user: "GamerPro", action: "Completed Tournament", game: "Pixel Pool", time: "5 min ago" },
  { user: "ArcherKing", action: "New High Score", game: "Archer Game", time: "8 min ago" },
  { user: "TokenMaster", action: "Swapped 100 SOL", game: "Token Exchange", time: "12 min ago" },
]

export default function MutablePlatform({ publicKey, balance, provider, connection }: MutablePlatformProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [activeTab, setActiveTab] = useState("games")
  const [userStats, setUserStats] = useState({
    gamesPlayed: 47,
    tokensEarned: 1250,
    winRate: 68,
    rank: "Gold",
  })

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game)
  }

  const handleBackToGames = () => {
    setSelectedGame(null)
  }

  if (selectedGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
        <GameContainer
          game={selectedGame}
          onBack={handleBackToGames}
          publicKey={publicKey}
          balance={balance}
          provider={provider}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Image src="/images/mutable-logo.png" alt="Mutable Logo" width={40} height={40} className="rounded-lg" />
              <h1 className="text-2xl font-bold text-gray-900">Mutable Platform</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                <Wallet className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-orange-100 rounded-lg px-3 py-2">
                <Coins className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">{balance?.toFixed(2) || "0.00"} SOL</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="swap">Token Swap</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Games Tab */}
          <TabsContent value="games" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURED_GAMES.map((game) => (
                <Card key={game.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-0">
                    <div className="relative">
                      <Image
                        src={game.image || "/placeholder.svg"}
                        alt={game.name}
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Badge
                        className={`absolute top-2 right-2 ${
                          game.status === "live"
                            ? "bg-green-500"
                            : game.status === "coming-soon"
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                        }`}
                      >
                        {game.status === "live"
                          ? "Live"
                          : game.status === "coming-soon"
                            ? "Coming Soon"
                            : "Maintenance"}
                      </Badge>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-900">{game.name}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{game.rating}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600">{game.description}</p>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{game.players.toLocaleString()} playing</span>
                        </div>
                        <Badge variant="secondary">{game.category}</Badge>
                      </div>

                      {game.minBet && (
                        <div className="text-xs text-gray-500">
                          Bet Range: {game.minBet} - {game.maxBet} MUTB
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {game.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <Button
                        onClick={() => handleGameSelect(game)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        disabled={game.status !== "live"}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {game.status === "live"
                          ? "Play Now"
                          : game.status === "coming-soon"
                            ? "Coming Soon"
                            : "Under Maintenance"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {RECENT_ACTIVITIES.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{activity.user.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{activity.user}</p>
                            <p className="text-xs text-gray-500">
                              {activity.action} in {activity.game}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace">
            <MutableMarketplace />
          </TabsContent>

          {/* Token Swap Tab */}
          <TabsContent value="swap" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <TokenSwapForm />
                <LiquidityPoolStatus />
              </div>
              <div className="space-y-6">
                <MarketOverview />
                <TransactionHistory />
              </div>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span>Player Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Games Played</span>
                    <span className="font-semibold">{userStats.gamesPlayed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tokens Earned</span>
                    <span className="font-semibold">{userStats.tokensEarned} MUTB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Win Rate</span>
                    <span className="font-semibold">{userStats.winRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Rank</span>
                    <Badge className="bg-yellow-100 text-yellow-800">{userStats.rank}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    <span>Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Target className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">First Win</p>
                      <p className="text-xs text-gray-500">Won your first game</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Coins className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Token Collector</p>
                      <p className="text-xs text-gray-500">Earned 1000+ MUTB tokens</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Social Player</p>
                      <p className="text-xs text-gray-500">Played 10+ multiplayer games</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span>Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Level Progress</span>
                      <span>Level 12</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Weekly Challenge</span>
                      <span>3/5 Complete</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Tournament Rank</span>
                      <span>#247</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* SignUp Banner */}
      <SignUpBanner walletConnected={true} />
    </div>
  )
}
