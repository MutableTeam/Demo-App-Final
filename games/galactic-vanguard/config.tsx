import { Zap, Target } from "lucide-react"

export const galacticVanguardConfig = {
  id: "galactic-vanguard",
  name: "Galactic Vanguard",
  description:
    "Survive waves of geometric enemies in this retro space shooter with neon visuals and synthwave aesthetics.",
  image: "/images/galactic-vanguard-card.jpg",
  icon: <Zap className="h-full w-full" />,
  status: "live" as const,
  minWager: 25,
  maxPlayers: 1,
  gameType: "Survival",
  gameCategory: "PvE" as const,
  isOffPlatform: true,
  externalUrl: "https://galactic-vanguard-c1030fc2.base44.app",
  launcherType: "iframe" as const,
  modes: [
    {
      id: "practice",
      name: "Practice",
      description: "Practice your skills with no entry fee. Perfect for learning the game mechanics.",
      players: 1,
      icon: <Target className="h-4 w-4" />,
      minWager: 0,
      entryFee: 0,
      isOffPlatform: false, // Use local game for practice
    },
    {
      id: "survival",
      name: "Survival",
      description: "Survive as long as possible against endless waves of geometric enemies.",
      players: 1,
      icon: <Zap className="h-4 w-4" />,
      minWager: 25,
      entryFee: 25,
      isOffPlatform: true,
      externalUrl: "https://galactic-vanguard-c1030fc2.base44.app",
    },
  ],
}
