"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gamepad2, Trophy, Users, Coins, ArrowUpDown, Play, Zap, Target } from "lucide-react"
import Image from "next/image"
import MultiWalletConnector from "./multi-wallet-connector"

interface MutablePlatformProps {
  publicKey: string
  balance: number | null
  provider: any
  connection: any
}

export default function MutablePlatform({ publicKey, balance, provider, connection }: MutablePlatformProps) {
  const [activeTab, setActiveTab] = useState("games")
  const [isWalletConnected, setIsWalletConnected] = useState(!!publicKey)
  const [walletAddress, setWalletAddress] = useState(publicKey)
  const [walletBalance, setWalletBalance] = useState(balance)

  const handleWalletConnection = (connected: boolean, address: string, bal: number | null) => {
    setIsWalletConnected(connected)
    setWalletAddress(address)
    setWalletBalance(bal)
  }

  const featuredGames = [
    {
      id: "last-stand",
      title: "Last Stand",
      description: "Defend your base against waves of enemies",
      image: "/images/last-stand.jpg",
      players: "1-4",
      difficulty: "Medium",
      rewards: "50-200 MUTB",
      category: "Tower Defense",
    },
    {
      id: "pixel-pool",
      title: "Pixel Pool",
      description: "Classic 8-ball pool with pixel art graphics",
      image: "/images/pixel-art-pool.png",
      players: "1-2",
      difficulty: "Easy",
      rewards: "25-100 MUTB",
      category: "Sports",
    },
    {
      id: "top-down-shooter",
      title: "Cyber Arena",
      description: "Fast-paced top-down shooter action",
      image: "/images/archer-game.png",
      players: "1-8",
      difficulty: "Hard",
      rewards: "100-500 MUTB",
      category: "Action",
    },
  ]

  const marketStats = [
    { label: "Total Volume", value: "$2.4M", change: "+12.5%" },
    { label: "Active Players", value: "15,234", change: "+8.2%" },
    { label: "Games Played", value: "89,456", change: "+15.7%" },
    { label: "MUTB Price", value: "$0.0234", change: "+5.3%" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/images/mutable-logo.png"
                alt="Mutable"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mutable</h1>
                <p className="text-sm text-gray-600">Gaming Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <MultiWalletConnector onConnectionChange={handleWalletConnection} compact={true} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Mutable Gaming</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Play games, earn tokens, and trade in our decentralized gaming ecosystem
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {marketStats.map((stat, index) => (
            <Card key={index} className="bg-white border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
                <div className="text-xs text-green-600 font-medium">{stat.change}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white border border-gray-200">
            <TabsTrigger
              value="games"
              className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 font-medium"
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              Games
            </TabsTrigger>
            <TabsTrigger
              value="marketplace"
              className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 font-medium"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger
              value="swap"
              className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 font-medium"
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Swap
            </TabsTrigger>
          </TabsList>

          {/* Games Tab */}
          <TabsContent value="games" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGames.map((game) => (
                <Card
                  key={game.id}
                  className="bg-white border-gray-200 hover:border-orange-300 transition-colors group"
                >
                  <CardHeader className="pb-3">
                    <div className="aspect-video relative mb-3 rounded-lg overflow-hidden border border-gray-200">
                      <Image 
                        src={game.image || "/placeholder.svg"} 
                        alt={game.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform" 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-gray-900">{game.title}</CardTitle>
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200 font-medium">
                        {game.category}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-600">{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        {game.players} Players
                      </span>
                      <span className="flex items-center gap-1 text-gray-600">
                        <Target className="w-4 h-4" />
                        {game.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">
                        <Coins className="w-4 h-4 inline mr-1" />
                        {game.rewards}
                      </span>
                      <Button
                        className="bg-orange-600 hover:bg-orange-700 text-white"
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

            {!isWalletConnected && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-6 text-center">
                  <Zap className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
                  <h3 className="text-xl font-bold text-gray\
