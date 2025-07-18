"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Gamepad2, Users, Trophy, Search, Filter } from "lucide-react"

interface Game {
  id: string
  title: string
  description: string
  image: string
  players: string
  category: string
  difficulty: "Easy" | "Medium" | "Hard"
  rewards: number
  isPopular?: boolean
  isNew?: boolean
}

const GAMES: Game[] = [
  {
    id: "pixel-pool",
    title: "Pixel Pool",
    description: "Classic 8-ball pool with pixel art graphics and competitive gameplay",
    image: "/images/pixel-art-pool.png",
    players: "1v1",
    category: "Sports",
    difficulty: "Medium",
    rewards: 50,
    isPopular: true,
  },
  {
    id: "archer-arena",
    title: "Archer Arena",
    description: "Top-down archery combat with strategic positioning and skill-based gameplay",
    image: "/images/archer-game.png",
    players: "1v1-4v4",
    category: "Action",
    difficulty: "Hard",
    rewards: 100,
    isNew: true,
  },
  {
    id: "last-stand",
    title: "Last Stand",
    description: "Survive waves of enemies in this intense tower defense shooter",
    image: "/images/last-stand.jpg",
    players: "1-4",
    category: "Strategy",
    difficulty: "Hard",
    rewards: 75,
    isPopular: true,
  },
]

interface GameSelectionProps {
  onGameSelect: (gameId: string) => void
}

export function GameSelection({ onGameSelect }: GameSelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [wagerAmount, setWagerAmount] = useState([10])
  const [selectedToken, setSelectedToken] = useState("MUTB")

  const filteredGames = GAMES.filter((game) => {
    const matchesCategory = selectedCategory === "all" || game.category.toLowerCase() === selectedCategory
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const categories = ["all", ...Array.from(new Set(GAMES.map((game) => game.category.toLowerCase())))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Choose Your Game</h2>
        <p className="text-muted-foreground">Select a game and set your wager to start playing</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Wager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Games</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Token Selection */}
            <div className="space-y-2">
              <Label>Wager Token</Label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MUTB">MUTB</SelectItem>
                  <SelectItem value="SOL">SOL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Wager Amount */}
          <div className="space-y-2">
            <Label>
              Wager Amount: {wagerAmount[0]} {selectedToken}
            </Label>
            <Slider value={wagerAmount} onValueChange={setWagerAmount} max={100} min={1} step={1} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>1 {selectedToken}</span>
              <span>100 {selectedToken}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => (
          <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img src={game.image || "/placeholder.svg"} alt={game.title} className="w-full h-48 object-cover" />
              <div className="absolute top-2 right-2 flex gap-1">
                {game.isNew && <Badge variant="secondary">New</Badge>}
                {game.isPopular && <Badge>Popular</Badge>}
              </div>
              <div className="absolute top-2 left-2">
                <Badge variant="outline" className="bg-background/80">
                  <Users className="h-3 w-3 mr-1" />
                  {game.players}
                </Badge>
              </div>
            </div>

            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{game.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{game.category}</Badge>
                    <Badge
                      variant={
                        game.difficulty === "Easy"
                          ? "secondary"
                          : game.difficulty === "Medium"
                            ? "default"
                            : "destructive"
                      }
                    >
                      {game.difficulty}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Trophy className="h-3 w-3 mr-1" />
                    Up to {game.rewards}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <CardDescription>{game.description}</CardDescription>
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
              <div className="w-full flex items-center justify-between text-sm">
                <span>Your Wager:</span>
                <span className="font-medium">
                  {wagerAmount[0]} {selectedToken}
                </span>
              </div>
              <Button onClick={() => onGameSelect(game.id)} className="w-full">
                <Gamepad2 className="h-4 w-4 mr-2" />
                Play Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No games found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
