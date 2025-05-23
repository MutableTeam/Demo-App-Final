import type { GameConfig } from "@/types/game-registry"
// Remove the JSX import and use a string identifier instead
// import { Skull } from 'lucide-react'

export const lastStandConfig: GameConfig = {
  id: "archer-arena",
  name: "Archer Arena: Last Stand",
  description: "Fight waves of undead enemies in this survival archery game",
  image: "/images/archer-game.png", // Using existing image for now
  // Replace JSX with a string identifier that can be used to render the icon elsewhere
  iconName: "skull", // Instead of: icon: <Skull className="h-4 w-4" />,
  status: "live", // Make sure this is set to "live"
  minWager: 0, // Free to play in practice mode
  modes: [
    {
      id: "practice",
      name: "Practice",
      description: "Practice mode - no entry fee",
      entryFee: 0,
      duration: 0, // No time limit
    },
    {
      id: "hourly",
      name: "Hourly Challenge",
      description: "Compete for the highest score in 1 hour",
      entryFee: 5,
      duration: 60 * 60 * 1000, // 1 hour in milliseconds
      leaderboardRefresh: "hourly",
    },
    {
      id: "daily",
      name: "Daily Challenge",
      description: "Compete for the highest score in 24 hours",
      entryFee: 10,
      duration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      leaderboardRefresh: "daily",
    },
  ],
}
