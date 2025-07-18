"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Store, Search, Filter, TrendingUp, Users, Star, ShoppingCart, Eye } from "lucide-react"
import Image from "next/image"

interface MarketplaceItem {
  id: string
  name: string
  description: string
  price: number
  currency: "SOL" | "MUTB"
  category: "NFT" | "Game Asset" | "Token" | "Collectible"
  rarity: "Common" | "Rare" | "Epic" | "Legendary"
  image: string
  seller: string
  rating: number
  sales: number
  isVerified: boolean
}

const MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: "1",
    name: "Legendary Archer Bow",
    description: "A powerful bow that increases arrow damage by 50%",
    price: 2.5,
    currency: "SOL",
    category: "Game Asset",
    rarity: "Legendary",
    image: "/images/archer-game.png",
    seller: "GameMaster",
    rating: 4.8,
    sales: 156,
    isVerified: true,
  },
  {
    id: "2",
    name: "Pixel Pool Cue",
    description: "Premium cue stick with enhanced accuracy",
    price: 150,
    currency: "MUTB",
    category: "Game Asset",
    rarity: "Epic",
    image: "/images/pixel-art-pool.png",
    seller: "PoolPro",
    rating: 4.6,
    sales: 89,
    isVerified: true,
  },
  {
    id: "3",
    name: "Mutable Genesis NFT",
    description: "First edition collectible from Mutable platform",
    price: 5.0,
    currency: "SOL",
    category: "NFT",
    rarity: "Legendary",
    image: "/images/mutable-logo.png",
    seller: "MutableTeam",
    rating: 5.0,
    sales: 234,
    isVerified: true,
  },
  {
    id: "4",
    name: "Defense Tower Upgrade",
    description: "Upgrade your towers in Last Stand game",
    price: 75,
    currency: "MUTB",
    category: "Game Asset",
    rarity: "Rare",
    image: "/images/last-stand.jpg",
    seller: "TowerDefender",
    rating: 4.4,
    sales: 67,
    isVerified: false,
  },
]

export function MutableMarketplace() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedRarity, setSelectedRarity] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("popular")
  const [activeTab, setActiveTab] = useState("browse")

  const filteredItems = MARKETPLACE_ITEMS.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesRarity = selectedRarity === "all" || item.rarity === selectedRarity

    return matchesSearch && matchesCategory && matchesRarity
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      case "sales":
        return b.sales - a.sales
      default: // popular
        return b.sales - a.sales
    }
  })

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "Rare":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Epic":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Legendary":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Store className="h-8 w-8 text-orange-600" />
          Mutable Marketplace
        </h2>
        <p className="text-gray-600">Trade game assets, NFTs, and collectibles</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200">
          <TabsTrigger value="browse" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
            <Eye className="h-4 w-4 mr-2" />
            Browse
          </TabsTrigger>
          <TabsTrigger value="sell" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Sell
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
            <TrendingUp className="h-4 w-4 mr-2" />
            Stats
          </TabsTrigger>
        </TabsList>

        {/* Browse Tab */}
        <TabsContent value="browse" className="space-y-6">
          {/* Filters */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <Filter className="h-5 w-5 text-orange-600" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="NFT">NFTs</SelectItem>
                      <SelectItem value="Game Asset">Game Assets</SelectItem>
                      <SelectItem value="Token">Tokens</SelectItem>
                      <SelectItem value="Collectible">Collectibles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rarity */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Rarity</Label>
                  <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rarities</SelectItem>
                      <SelectItem value="Common">Common</SelectItem>
                      <SelectItem value="Rare">Rare</SelectItem>
                      <SelectItem value="Epic">Epic</SelectItem>
                      <SelectItem value="Legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="sales">Most Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedItems.map((item) => (
              <Card key={item.id} className="bg-white border-gray-200 hover:border-orange-300 transition-colors group">
                <CardHeader className="pb-3">
                  <div className="aspect-square relative mb-3 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-gray-900">{item.name}</CardTitle>
                      {item.isVerified && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">Verified</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRarityColor(item.rarity)}>{item.rarity}</Badge>
                      <Badge variant="outline" className="border-gray-300">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-gray-600">{item.description}</CardDescription>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{item.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{item.sales} sales</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-gray-900">
                        {item.price} {item.currency}
                      </div>
                      <div className="text-xs text-gray-500">by {item.seller}</div>
                    </div>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white">Buy Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {sortedItems.length === 0 && (
            <Card className="bg-white border-gray-200">
              <CardContent className="text-center py-12">
                <Store className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sell Tab */}
        <TabsContent value="sell">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">List an Item</CardTitle>
              <CardDescription className="text-gray-600">
                Sell your game assets and collectibles on the marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600">The ability to list items will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-gray-900">1,234</div>
                <div className="text-sm text-gray-600">Total Items</div>
                <div className="text-xs text-green-600 font-medium">+12% this week</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-gray-900">567</div>
                <div className="text-sm text-gray-600">Active Sellers</div>
                <div className="text-xs text-green-600 font-medium">+8% this week</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-gray-900">89.2K</div>
                <div className="text-sm text-gray-600">Total Volume (SOL)</div>
                <div className="text-xs text-green-600 font-medium">+15% this week</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-gray-900">2.4</div>
                <div className="text-sm text-gray-600">Avg. Price (SOL)</div>
                <div className="text-xs text-red-600 font-medium">-3% this week</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
