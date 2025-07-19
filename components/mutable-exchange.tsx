"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Package, Star, Search, ArrowUpDown, Eye, Heart, Share2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"

interface MarketplaceItem {
  id: string
  name: string
  description: string
  price: number
  currency: "MUTB" | "SOL"
  image: string
  category: "weapons" | "skins" | "characters" | "items"
  rarity: "common" | "rare" | "epic" | "legendary"
  seller: string
  likes: number
  views: number
  isLiked?: boolean
}

const mockItems: MarketplaceItem[] = [
  {
    id: "1",
    name: "Cyber Bow Elite",
    description: "A high-tech bow with enhanced accuracy and damage",
    price: 150,
    currency: "MUTB",
    image: "/cyber-bow-weapon.png",
    category: "weapons",
    rarity: "legendary",
    seller: "CyberArcher",
    likes: 42,
    views: 156,
    isLiked: false,
  },
  {
    id: "2",
    name: "Neon Archer Skin",
    description: "Glowing neon skin for your archer character",
    price: 75,
    currency: "MUTB",
    image: "/neon-archer-skin.png",
    category: "skins",
    rarity: "epic",
    seller: "NeonMaster",
    likes: 28,
    views: 89,
    isLiked: true,
  },
  {
    id: "3",
    name: "Pool Cue Supreme",
    description: "Professional-grade pool cue with perfect balance",
    price: 0.05,
    currency: "SOL",
    image: "/placeholder-7nyni.png",
    category: "weapons",
    rarity: "rare",
    seller: "PoolPro",
    likes: 15,
    views: 67,
    isLiked: false,
  },
  {
    id: "4",
    name: "Holographic Table",
    description: "Futuristic holographic pool table skin",
    price: 200,
    currency: "MUTB",
    image: "/holographic-pool-table.png",
    category: "items",
    rarity: "legendary",
    seller: "HoloDesign",
    likes: 63,
    views: 234,
    isLiked: false,
  },
  {
    id: "5",
    name: "Quantum Arrow Pack",
    description: "Pack of 50 quantum-enhanced arrows",
    price: 25,
    currency: "MUTB",
    image: "/quantum-arrows-pack.png",
    category: "items",
    rarity: "common",
    seller: "ArrowSmith",
    likes: 8,
    views: 34,
    isLiked: false,
  },
  {
    id: "6",
    name: "Cyber Warrior",
    description: "Elite cyber warrior character with special abilities",
    price: 0.1,
    currency: "SOL",
    image: "/cyber-warrior.png",
    category: "characters",
    rarity: "epic",
    seller: "WarriorForge",
    likes: 91,
    views: 312,
    isLiked: true,
  },
]

const rarityColors = {
  common: "bg-gray-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-yellow-500",
}

const categoryIcons = {
  weapons: Package,
  skins: Star,
  characters: Eye,
  items: ShoppingCart,
}

interface MutableExchangeProps {
  publicKey: string
  balance: number | null
  mutbBalance: number
}

export default function MutableExchange({ publicKey, balance, mutbBalance }: MutableExchangeProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  const [items, setItems] = useState<MarketplaceItem[]>(mockItems)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedRarity, setSelectedRarity] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("popular")

  const handleLike = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 }
          : item,
      ),
    )
  }

  const filteredItems = items.filter((item) => {
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
      case "popular":
        return b.likes - a.likes
      case "recent":
        return b.views - a.views
      default:
        return 0
    }
  })

  return (
    <Card
      className={
        isCyberpunk
          ? "!bg-black/80 !border-cyan-500/50"
          : "bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      }
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className={`h-5 w-5 ${isCyberpunk ? "text-[#0ff]" : ""}`} />
            <CardTitle className={`${isCyberpunk ? "" : "font-mono"}`}>MUTABLE MARKETPLACE</CardTitle>
          </div>
        </div>
        <CardDescription className={isCyberpunk ? "text-[#0ff]/70" : ""}>
          Buy and sell in-game items, skins, and characters
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "pl-10",
                  isCyberpunk
                    ? "bg-black/50 border-cyan-500/50 text-cyan-100 placeholder:text-cyan-300/50"
                    : "bg-white border-black",
                )}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger
                className={cn(
                  "w-32",
                  isCyberpunk ? "bg-black/50 border-cyan-500/50 text-cyan-100" : "bg-white border-black",
                )}
              >
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="weapons">Weapons</SelectItem>
                <SelectItem value="skins">Skins</SelectItem>
                <SelectItem value="characters">Characters</SelectItem>
                <SelectItem value="items">Items</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedRarity} onValueChange={setSelectedRarity}>
              <SelectTrigger
                className={cn(
                  "w-32",
                  isCyberpunk ? "bg-black/50 border-cyan-500/50 text-cyan-100" : "bg-white border-black",
                )}
              >
                <SelectValue placeholder="Rarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger
                className={cn(
                  "w-32",
                  isCyberpunk ? "bg-black/50 border-cyan-500/50 text-cyan-100" : "bg-white border-black",
                )}
              >
                <ArrowUpDown className="h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="price-low">Price: Low</SelectItem>
                <SelectItem value="price-high">Price: High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedItems.map((item) => {
            const CategoryIcon = categoryIcons[item.category]

            return (
              <Card
                key={item.id}
                className={cn(
                  "group cursor-pointer transition-all duration-300 hover:scale-105",
                  isCyberpunk
                    ? "bg-black/60 border-cyan-500/30 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-500/20"
                    : "bg-white border-2 border-black hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
                )}
              >
                <div className="relative">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    width={200}
                    height={200}
                    className="w-full h-48 object-cover"
                  />

                  {/* Rarity Badge */}
                  <Badge className={cn("absolute top-2 left-2 text-white font-bold", rarityColors[item.rarity])}>
                    {item.rarity.toUpperCase()}
                  </Badge>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "h-8 w-8 p-0",
                        isCyberpunk
                          ? "bg-black/70 hover:bg-cyan-500/20 text-cyan-400"
                          : "bg-white/70 hover:bg-gray-100",
                      )}
                      onClick={() => handleLike(item.id)}
                    >
                      <Heart className={cn("h-4 w-4", item.isLiked && "fill-red-500 text-red-500")} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "h-8 w-8 p-0",
                        isCyberpunk
                          ? "bg-black/70 hover:bg-cyan-500/20 text-cyan-400"
                          : "bg-white/70 hover:bg-gray-100",
                      )}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Category Icon */}
                  <div
                    className={cn("absolute bottom-2 left-2 p-1 rounded", isCyberpunk ? "bg-black/70" : "bg-white/70")}
                  >
                    <CategoryIcon className={cn("h-4 w-4", isCyberpunk ? "text-cyan-400" : "text-gray-600")} />
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className={cn("font-bold text-sm", isCyberpunk ? "text-cyan-100" : "text-black")}>
                      {item.name}
                    </h3>

                    <p className={cn("text-xs line-clamp-2", isCyberpunk ? "text-cyan-300/70" : "text-gray-600")}>
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Image
                          src={item.currency === "MUTB" ? "/images/mutable-token.png" : "/solana-logo.png"}
                          alt={item.currency}
                          width={16}
                          height={16}
                          className="rounded-full"
                        />
                        <span className={cn("font-bold text-sm", isCyberpunk ? "text-cyan-400" : "text-black")}>
                          {item.price} {item.currency}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{item.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{item.views}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className={cn("text-xs", isCyberpunk ? "text-cyan-300/50" : "text-gray-500")}>
                        by {item.seller}
                      </span>

                      <Button
                        size="sm"
                        className={cn(
                          "text-xs",
                          isCyberpunk
                            ? "bg-cyan-500 hover:bg-cyan-600 text-black"
                            : "bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black",
                        )}
                      >
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {sortedItems.length === 0 && (
          <div className="text-center py-12">
            <Package className={cn("h-12 w-12 mx-auto mb-4", isCyberpunk ? "text-cyan-400" : "text-gray-400")} />
            <h3 className={cn("text-lg font-semibold mb-2", isCyberpunk ? "text-cyan-100" : "text-black")}>
              No items found
            </h3>
            <p className={cn("text-sm", isCyberpunk ? "text-cyan-300/70" : "text-gray-600")}>
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
