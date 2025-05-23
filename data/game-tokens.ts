import type { GameToken } from "@/types/mutable"

export const gameTokens: GameToken[] = [
  {
    id: "vbucks",
    name: "V-Bucks",
    symbol: "VB",
    icon: "/placeholder.svg?height=40&width=40",
    description: "The in-game currency for Fortnite",
    gameId: "fortnite",
    gameName: "Fortnite",
    gameIcon: "/placeholder.svg?height=24&width=24",
    conversionRate: 100, // 1 MUTB = 100 V-Bucks
  },
  {
    id: "fifa-points",
    name: "FIFA Points",
    symbol: "FP",
    icon: "/placeholder.svg?height=40&width=40",
    description: "The in-game currency for EA SPORTS FC",
    gameId: "ea-fc",
    gameName: "EA SPORTS FC",
    gameIcon: "/placeholder.svg?height=24&width=24",
    conversionRate: 80, // 1 MUTB = 80 FIFA Points
  },
  {
    id: "robux",
    name: "Robux",
    symbol: "RBX",
    icon: "/placeholder.svg?height=40&width=40",
    description: "The in-game currency for Roblox",
    gameId: "roblox",
    gameName: "Roblox",
    gameIcon: "/placeholder.svg?height=24&width=24",
    conversionRate: 120, // 1 MUTB = 120 Robux
  },
  {
    id: "cod-points",
    name: "COD Points",
    symbol: "CP",
    icon: "/placeholder.svg?height=40&width=40",
    description: "The in-game currency for Call of Duty",
    gameId: "call-of-duty",
    gameName: "Call of Duty",
    gameIcon: "/placeholder.svg?height=24&width=24",
    conversionRate: 90, // 1 MUTB = 90 COD Points
  },
  {
    id: "apex-coins",
    name: "Apex Coins",
    symbol: "AC",
    icon: "/placeholder.svg?height=40&width=40",
    description: "The in-game currency for Apex Legends",
    gameId: "apex-legends",
    gameName: "Apex Legends",
    gameIcon: "/placeholder.svg?height=24&width=24",
    conversionRate: 110, // 1 MUTB = 110 Apex Coins
  },
  {
    id: "minecraft-coins",
    name: "Minecraft Coins",
    symbol: "MC",
    icon: "/placeholder.svg?height=40&width=40",
    description: "The in-game currency for Minecraft",
    gameId: "minecraft",
    gameName: "Minecraft",
    gameIcon: "/placeholder.svg?height=24&width=24",
    conversionRate: 150, // 1 MUTB = 150 Minecraft Coins
  },
]
