"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GameContainer } from "@/components/game-container"
import MultiWalletConnector from "@/components/multi-wallet-connector"
import { TokenSwapForm } from "@/components/swap/token-swap-form"
import { MutableMarketplace } from "@/components/mutable-marketplace"
import { gameRegistry } from "@/games/registry"
import { Play, Trophy, Coins, Store, Users, Gamepad2 } from "lucide-react"
import Image from "next/image"

export default function MutablePlatform() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("games")

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId)
  }

  const handleBackToGames = () => {
    setSelectedGame(null)
  }

  if (selectedGame) {
    const game = gameRegistry.find((g) => g.id === selectedGame)
    if (game) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
          <GameContainer game={game} onBack={handleBackToGames} />
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative w-12 h-12">
              <Image src="/images/mutable-logo.png" alt="Mutable Logo" fill className="object-contain" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Mutable Platform</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The ultimate gaming and DeFi platform on Solana. Play games, trade tokens, and earn rewards.
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white border border-gray-200">
            <TabsTrigger
              value="games"
              className="flex items-center gap-2 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
            >
              <Gamepad2 className="h-4 w-4" />
              Games
            </TabsTrigger>
            <TabsTrigger
              value="swap"
              className="flex items-center gap-2 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
            >
              <Coins className="h-4 w-4" />
              Swap
            </TabsTrigger>
            <TabsTrigger
              value="marketplace"
              className="flex items-center gap-2 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
            >
              <Store className="h-4 w-4" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger
              value="wallet"
              className="flex items-center gap-2 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
            >
              <Users className="h-4 w-4" />
              Wallet
            </TabsTrigger>
          </TabsList>

          {/* Games Tab */}
          <TabsContent value="games" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Games</h2>
              <p className="text-gray-600">Choose from our collection of exciting blockchain games</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gameRegistry.map((game) => (
                <Card
                  key={game.id}
                  className="bg-white border-gray-200 hover:border-orange-300 transition-colors group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-gray-900">{game.name}</CardTitle>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                        {game.category}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-600">{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      {game.thumbnail ? (
                        <Image
                          src={game.thumbnail || "/placeholder.svg"}
                          alt={game.name}
                          width={300}
                          height={200}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <Gamepad2 className="h-12 w-12 mx-auto mb-2" />
                          <p className="text-sm">Game Preview</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{game.players}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        <span>Rewards Available</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleGameSelect(game.id)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Play Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Swap Tab */}
          <TabsContent value="swap">
            <div className="max-w-md mx-auto">
              <TokenSwapForm />
            </div>
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace">
            <MutableMarketplace />
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet">
            <div className="max-w-md mx-auto">
              <MultiWalletConnector />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
