"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Star, Trophy, Gamepad2, Coins } from "lucide-react"
import Image from "next/image"

interface MarketplaceItem {
  id: string
  type: "nft" | "game_item" | "token"
  name: string
  description: string
  price: number
  currency: "MUTB" | "SOL"
  image: string
  seller: string
  rarity: "common" | "rare" | "epic" | "legendary"
  category: string
  stats?: {
    power?: number
    defense?: number
    speed?: number
  }
}

const MOCK_ITEMS: MarketplaceItem[] = [
  {
    id: "1",
    type: "game_item",
    name: "Legendary Bow",
    description: "A powerful bow that increases accuracy by 25%",
    price: 150,
    currency: "MUTB",
    image: "/images/archer-game.png",
    seller: "GameMaster",
    rarity: "legendary",
    category: "Weapons",
    stats: { power: 95, speed: 80 },
  },
  {
    id: "2",
    type: "nft",
    name: "Pixel Pool Champion",
    description: "Exclusive NFT for top pool players",
    price: 2.5,
    currency: "SOL",
    image: "/images/pixel-art-pool.png",
    seller: "PoolPro",
    rarity: "epic",
    category: "Collectibles",
  },
  {
    id: "3",
    type: "game_item",
    name: "Shield of Defense",
    description: "Reduces incoming damage by 30%",
    price: 75,
    currency: "MUTB",
    image: "/images/last-stand.jpg",
    seller: "DefenderX",
    rarity: "rare",
    category: "Armor",
    stats: { defense: 90, power: 20 },
  },
]

export function MutableMarketplace() {
  const [items] = useState<MarketplaceItem[]>(MOCK_ITEMS)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRarity, setSelectedRarity] = useState("all")
  const [sortBy, setSortBy] = useState("price_low")

  const filteredItems = items
    .filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || item.category.toLowerCase() === selectedCategory
      const matchesRarity = selectedRarity === "all" || item.rarity === selectedRarity
      return matchesSearch && matchesCategory && matchesRarity
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price_low":
          return a.price - b.price
        case "price_high":
          return b.price - a.price
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "rare":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "epic":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "legendary":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "nft":
        return <Star className="h-4 w-4" />
      case "game_item":
        return <Gamepad2 className="h-4 w-4" />
      case "token":
        return <Coins className="h-4 w-4" />
      default:
        return <Trophy className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Mutable Marketplace</h2>
        <p className="text-gray-600">Trade game items, NFTs, and tokens with other players</p>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">1,234</div>
            <div className="text-sm text-gray-600">Items Listed</div>
            <div className="text-xs text-green-600 font-medium">+12% this week</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">567</div>
            <div className="text-sm text-gray-600">Active Traders</div>
            <div className="text-xs text-green-600 font-medium">+8% this week</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">89K</div>
            <div className="text-sm text-gray-600">MUTB Volume</div>
            <div className="text-xs text-green-600 font-medium">+15% this week</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">45</div>
            <div className="text-sm text-gray-600">SOL Volume</div>
            <div className="text-xs text-green-600 font-medium">+22% this week</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Filter className="h-5 w-5 text-orange-600" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="weapons">Weapons</SelectItem>
                  <SelectItem value="armor">Armor</SelectItem>
                  <SelectItem value="collectibles">Collectibles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Rarity</label>
              <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all">All Rarities</SelectItem>
                  <SelectItem value="common">Common</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                  <SelectItem value="epic">Epic</SelectItem>
                  <SelectItem value="legendary">Legendary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="bg-white border-gray-200 hover:border-orange-300 transition-colors group">
            <CardHeader className="pb-3">
              <div className="aspect-square relative mb-3 rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-2 left-2">
                  <Badge className={getRarityColor(item.rarity)}>
                    {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge className="bg-white/90 text-gray-700 border-gray-200">
                    {getTypeIcon(item.type)}
                    <span className="ml-1">{item.type.replace("_", " ")}</span>
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-lg font-bold text-gray-900">{item.name}</CardTitle>
              <CardDescription className="text-gray-600">{item.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Stats */}
              {item.stats && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {item.stats.power && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Power:</span>
                      <span className="font-medium text-gray-900">{item.stats.power}</span>
                    </div>
                  )}
                  {item.stats.defense && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Defense:</span>
                      <span className="font-medium text-gray-900">{item.stats.defense}</span>
                    </div>
                  )}
                  {item.stats.speed && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Speed:</span>
                      <span className="font-medium text-gray-900">{item.stats.speed}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Price and Seller */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Seller</div>
                  <div className="font-medium text-gray-900">{item.seller}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">
                    {item.price} {item.currency}
                  </div>
                </div>
              </div>

              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                <Coins className="h-4 w-4 mr-2" />
                Buy Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="bg-white border-gray-200">
          <CardContent className="text-center py-12">
            <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
