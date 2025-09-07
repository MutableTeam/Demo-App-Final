"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import { Trophy, Target, Sword, Shield, TrendingUp, Gamepad2, Coins, Flame, Award, Medal } from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"
import { Line, Bar, Pie } from "react-chartjs-2"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement)

interface StatisticsModalProps {
  isOpen: boolean
  onClose: () => void
  username: string
}

const mockAchievements = [
  {
    id: 1,
    title: "First Victory",
    description: "Win your first game",
    icon: "/images/achievements/first-victory-badge.jpg", // replaced icon string with image path
    unlocked: true,
    unlockedDate: "2025-07-07",
    reward: { type: "tokens", amount: 5 },
    rarity: "common",
  },
  {
    id: 2,
    title: "Sniper",
    description: "Hit 10 perfect shots in Archer Arena",
    icon: "/images/achievements/sharpshooter-badge.jpg", // replaced icon string with image path
    unlocked: true,
    unlockedDate: "2025-08-09",
    reward: { type: "tokens", amount: 3 },
    rarity: "uncommon",
  },
  {
    id: 3,
    title: "Wave Master",
    description: "Survive 50 waves in Last Stand",
    icon: "/images/achievements/survivor-badge.jpg", // replaced icon string with image path
    unlocked: false,
    progress: 47,
    maxProgress: 50,
    reward: { type: "tokens", amount: 20 },
    rarity: "epic",
  },
  {
    id: 4,
    title: "Token Collector",
    description: "Earn 5000 total tokens",
    icon: "/images/achievements/collector-badge.jpg", // replaced icon string with image path
    unlocked: false,
    progress: 2847,
    maxProgress: 5000,
    reward: { type: "xp", amount: 50 },
    rarity: "rare",
  },
  {
    id: 5,
    title: "Winning Streak",
    description: "Win 15 games in a row",
    icon: "/images/achievements/champion-badge.jpg", // replaced icon string with image path
    unlocked: false,
    progress: 12,
    maxProgress: 15,
    reward: { type: "title", name: "Unstoppable" },
    rarity: "legendary",
  },
  {
    id: 6,
    title: "Arena Champion",
    description: "Score 3000+ in Archer Arena",
    icon: "/images/achievements/veteran-badge.jpg", // replaced icon string with image path
    unlocked: false,
    progress: 2450,
    maxProgress: 3000,
    reward: { type: "tokens", amount: 30 },
    rarity: "epic",
  },
]

const mockChartData = {
  winRateTrend: [
    { date: "Jan 1", winRate: 45 },
    { date: "Jan 8", winRate: 52 },
    { date: "Jan 15", winRate: 68 },
    { date: "Jan 22", winRate: 71 },
    { date: "Jan 29", winRate: 68 },
  ],
  gamesByType: [
    { game: "Archer Arena", count: 28, percentage: 60 },
    { game: "Last Stand", count: 19, percentage: 40 },
  ],
  tokenEarnings: [
    { week: "Week 1", tokens: 245 },
    { week: "Week 2", tokens: 387 },
    { week: "Week 3", tokens: 521 },
    { week: "Week 4", tokens: 698 },
  ],
}

// Mock detailed statistics data
const mockStats = {
  overview: {
    totalGames: 47,
    totalWins: 32,
    totalLosses: 15,
    winRate: 68,
    avgGameDuration: "4m 32s",
    tokensEarned: 2847.5,
    tokensSpent: 1596.75,
    currentStreak: 5,
    bestStreak: 12,
    rank: "Rising Star",
    xp: 8450,
  },
  archerArena: {
    gamesPlayed: 28,
    wins: 19,
    losses: 9,
    winRate: 68,
    avgAccuracy: 78,
    bestScore: 2450,
    avgScore: 1680,
    perfectGames: 3,
    tokensEarned: 1650.25,
    favoriteMap: "Forest Clearing",
  },
  lastStand: {
    gamesPlayed: 19,
    wins: 13,
    losses: 6,
    winRate: 68,
    bestWave: 47,
    avgWave: 23,
    enemiesKilled: 1247,
    tokensEarned: 1197.25,
    favoriteWeapon: "Plasma Rifle",
  },
  recentGames: [
    {
      id: 1,
      game: "Archer Arena",
      result: "Win",
      score: 2100,
      duration: "5m 12s",
      tokensEarned: 45.5,
      date: "2024-01-15",
      map: "Forest Clearing",
      opponent: "OpponentA",
    },
    {
      id: 2,
      game: "Last Stand",
      result: "Win",
      wave: 34,
      duration: "8m 45s",
      tokensEarned: 68.25,
      date: "2024-01-15",
      weapon: "Plasma Rifle",
      opponent: "OpponentB",
    },
    {
      id: 3,
      game: "Archer Arena",
      result: "Loss",
      score: 1450,
      duration: "3m 28s",
      tokensEarned: 12.75,
      date: "2024-01-14",
      map: "Mountain Peak",
      opponent: "OpponentC",
    },
    {
      id: 4,
      game: "Last Stand",
      result: "Win",
      wave: 28,
      duration: "6m 33s",
      tokensEarned: 52.0,
      date: "2024-01-14",
      weapon: "Lightning Bow",
      opponent: "OpponentD",
    },
    {
      id: 5,
      game: "Archer Arena",
      result: "Win",
      score: 1890,
      duration: "4m 15s",
      tokensEarned: 38.25,
      date: "2024-01-13",
      map: "Desert Ruins",
      opponent: "OpponentE",
    },
  ],
}

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "achievements", label: "Achievements" },
  { id: "history", label: "Game History" },
]

export default function StatisticsModal({ isOpen, onClose, username }: StatisticsModalProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"
  const [selectedGame, setSelectedGame] = useState<any | null>(null)
  const [selectedGameType, setSelectedGameType] = useState<"all" | "Archer Arena" | "Last Stand">("all")
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedGame, setExpandedGame] = useState<string | null>(null)
  const [showInDevelopment, setShowInDevelopment] = useState(false)

  const chartColors = {
    primary: isCyberpunk ? "#00ffff" : "#3b82f6",
    secondary: isCyberpunk ? "#ff00ff" : "#8b5cf6",
    accent: isCyberpunk ? "#00ff00" : "#10b981",
    background: isCyberpunk ? "rgba(0, 0, 0, 0.6)" : "#ffffff",
    text: isCyberpunk ? "#00ffff" : "#374151",
  }

  const pieColors = [chartColors.primary, chartColors.secondary, chartColors.accent, "#fbbf24", "#f87171"]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return isCyberpunk ? "text-gray-400 border-gray-500" : "text-gray-600 border-gray-300"
      case "rare":
        return isCyberpunk ? "text-blue-400 border-blue-500" : "text-blue-600 border-blue-300"
      case "epic":
        return isCyberpunk ? "text-purple-400 border-purple-500" : "text-purple-600 border-purple-300"
      case "legendary":
        return isCyberpunk ? "text-yellow-400 border-yellow-500" : "text-yellow-600 border-yellow-300"
      default:
        return isCyberpunk ? "text-gray-400 border-gray-500" : "text-gray-600 border-gray-300"
    }
  }

  const getFilteredGames = () => {
    if (selectedGameType === "all") return mockStats.recentGames
    return mockStats.recentGames.filter((game) => game.game === selectedGameType)
  }

  const getGameTypeStats = (gameType: "Archer Arena" | "Last Stand") => {
    const games = mockStats.recentGames.filter((game) => game.game === gameType)
    const wins = games.filter((game) => game.result === "Win").length
    const totalTokens = games.reduce((sum, game) => sum + game.tokensEarned, 0)
    const avgDuration = games.length > 0 ? "4m 15s" : "0m 0s" // Mock calculation

    return {
      totalGames: games.length,
      wins,
      losses: games.length - wins,
      winRate: games.length > 0 ? Math.round((wins / games.length) * 100) : 0,
      totalTokens: totalTokens.toFixed(2),
      avgDuration,
    }
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    description,
  }: {
    title: string
    value: string | number
    icon: any
    trend?: "up" | "down" | "neutral"
    description?: string
  }) => (
    <Card className={cn("arcade-card", isCyberpunk && "bg-black/60 border-cyan-500/30")}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center justify-center h-5 w-5",
                isCyberpunk ? "text-cyan-400" : "text-blue-600",
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <span className={cn("text-sm font-medium leading-none", isCyberpunk && "text-cyan-300")}>{title}</span>
          </div>
          {trend && (
            <div className="flex items-center gap-1">
              {trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
              {trend === "down" && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
            </div>
          )}
        </div>
        <div className="mt-2 text-center">
          <div className={cn("text-2xl font-bold", isCyberpunk ? "text-white" : "text-gray-900")}>{value}</div>
          {description && (
            <p className={cn("text-xs", isCyberpunk ? "text-gray-400" : "text-gray-600")}>{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const InteractiveChart = ({ title, data, type }: { title: string; data: any; type: "line" | "bar" | "pie" }) => {
    const getChartData = () => {
      if (type === "line") {
        return {
          labels: data.map((item) => item.date),
          datasets: [
            {
              label: "Win Rate %",
              data: data.map((item) => item.winRate),
              borderColor: chartColors.primary,
              backgroundColor: `${chartColors.primary}20`,
              borderWidth: 2,
              fill: true,
              tension: 0.4,
            },
          ],
        }
      }

      if (type === "bar") {
        return {
          labels: data.map((item) => item.week),
          datasets: [
            {
              label: "Tokens Earned",
              data: data.map((item) => item.tokens),
              backgroundColor: chartColors.primary,
              borderColor: chartColors.primary,
              borderWidth: 1,
            },
          ],
        }
      }

      if (type === "pie") {
        return {
          labels: data.map((item) => item.game),
          datasets: [
            {
              data: data.map((item) => item.count),
              backgroundColor: pieColors,
              borderColor: pieColors.map((color) => color),
              borderWidth: 2,
            },
          ],
        }
      }
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: type === "pie",
          labels: {
            color: chartColors.text,
            font: { size: 10 },
          },
        },
        tooltip: {
          backgroundColor: chartColors.background,
          titleColor: chartColors.text,
          bodyColor: chartColors.text,
          borderColor: chartColors.primary,
          borderWidth: 1,
        },
      },
      scales:
        type !== "pie"
          ? {
              x: {
                ticks: { color: chartColors.text, font: { size: 10 } },
                grid: { color: isCyberpunk ? "#00ffff20" : "#e5e7eb" },
              },
              y: {
                ticks: { color: chartColors.text, font: { size: 10 } },
                grid: { color: isCyberpunk ? "#00ffff20" : "#e5e7eb" },
              },
            }
          : undefined,
    }

    return (
      <Card className={cn("arcade-card", isCyberpunk && "bg-black/60 border-cyan-500/30")}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className={cn("text-sm", isCyberpunk && "text-cyan-400")}>{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg h-32">
            {type === "line" && <Line data={getChartData()!} options={chartOptions} />}
            {type === "bar" && <Bar data={getChartData()!} options={chartOptions} />}
            {type === "pie" && <Pie data={getChartData()!} options={chartOptions} />}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-2 sm:p-4">
          <div className="bg-slate-900/95 border-2 border-cyan-500/40 rounded-lg w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-[0_0_30px_rgba(0,255,255,0.3)]">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-6 border-b border-cyan-500/30">
              <h2 className="text-lg sm:text-2xl font-bold text-cyan-300 font-mono tracking-wider truncate">
                {username}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/30 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex flex-col h-[calc(95vh-80px)] sm:h-[calc(90vh-120px)]">
              {/* Tabs */}
              <div className="flex border-b border-cyan-500/30 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-3 sm:px-6 py-3 sm:py-4 font-mono text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0",
                      activeTab === tab.id
                        ? "text-cyan-300 border-b-2 border-cyan-400 bg-cyan-500/10"
                        : "text-slate-400 hover:text-cyan-400",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                {activeTab === "overview" && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <StatCard title="Total Games" value={mockStats.overview.totalGames} icon={Gamepad2} />
                      <StatCard title="Win Rate" value={`${mockStats.overview.winRate}%`} icon={Trophy} />
                      <StatCard title="Current Streak" value={mockStats.overview.currentStreak} icon={Flame} />
                      <StatCard
                        title="Tokens Earned"
                        value={`${mockStats.overview.tokensEarned.toFixed(2)}`}
                        icon={Coins}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                      <InteractiveChart title="Win Rate Trend" data={mockChartData.winRateTrend} type="line" />
                      <InteractiveChart title="Games by Type" data={mockChartData.gamesByType} type="pie" />
                      <InteractiveChart title="Token Earnings" data={mockChartData.tokenEarnings} type="bar" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <Card className={cn("arcade-card", isCyberpunk && "bg-black/60 border-cyan-500/30")}>
                        <CardHeader>
                          <CardTitle className={cn("flex items-center gap-2", isCyberpunk && "text-cyan-400")}>
                            <div className="flex items-center justify-center h-5 w-5">
                              <Target className="h-4 w-4" />
                            </div>
                            <span className="leading-none">Archer Arena</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className={cn("text-2xl font-bold", isCyberpunk && "text-cyan-400")}>
                                {mockStats.archerArena.gamesPlayed}
                              </div>
                              <div className={cn("text-xs", isCyberpunk && "text-cyan-300/70")}>Games Played</div>
                            </div>
                            <div className="text-center">
                              <div className={cn("text-2xl font-bold", isCyberpunk && "text-cyan-400")}>
                                {mockStats.archerArena.avgAccuracy}%
                              </div>
                              <div className={cn("text-xs", isCyberpunk && "text-cyan-300/70")}>Avg Accuracy</div>
                            </div>
                            <div className="text-center">
                              <div className={cn("text-2xl font-bold", isCyberpunk && "text-cyan-400")}>
                                {mockStats.archerArena.bestScore.toLocaleString()}
                              </div>
                              <div className={cn("text-xs", isCyberpunk && "text-cyan-300/70")}>Best Score</div>
                            </div>
                            <div className="text-center">
                              <div className={cn("text-2xl font-bold", isCyberpunk && "text-cyan-400")}>
                                {mockStats.archerArena.perfectGames}
                              </div>
                              <div className={cn("text-xs", isCyberpunk && "text-cyan-300/70")}>Perfect Games</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className={cn("arcade-card", isCyberpunk && "bg-black/60 border-cyan-500/30")}>
                        <CardHeader>
                          <CardTitle className={cn("flex items-center gap-2", isCyberpunk && "text-cyan-400")}>
                            <div className="flex items-center justify-center h-5 w-5">
                              <Sword className="h-4 w-4" />
                            </div>
                            <span className="leading-none">Last Stand</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className={cn("text-2xl font-bold", isCyberpunk && "text-cyan-400")}>
                                {mockStats.lastStand.gamesPlayed}
                              </div>
                              <div className={cn("text-xs", isCyberpunk && "text-cyan-300/70")}>Games Played</div>
                            </div>
                            <div className="text-center">
                              <div className={cn("text-2xl font-bold", isCyberpunk && "text-cyan-400")}>
                                {mockStats.lastStand.bestWave}
                              </div>
                              <div className={cn("text-xs", isCyberpunk && "text-cyan-300/70")}>Best Wave</div>
                            </div>
                            <div className="text-center">
                              <div className={cn("text-2xl font-bold", isCyberpunk && "text-cyan-400")}>
                                {mockStats.lastStand.enemiesKilled.toLocaleString()}
                              </div>
                              <div className={cn("text-xs", isCyberpunk && "text-cyan-300/70")}>Enemies Killed</div>
                            </div>
                            <div className="text-center">
                              <div className={cn("text-2xl font-bold", isCyberpunk && "text-cyan-400")}>
                                {mockStats.lastStand.avgWave}
                              </div>
                              <div className={cn("text-xs", isCyberpunk && "text-cyan-300/70")}>Avg Wave</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className={cn("arcade-card", isCyberpunk && "bg-black/60 border-cyan-500/30")}>
                        <CardHeader>
                          <CardTitle className={cn("flex items-center gap-2", isCyberpunk && "text-cyan-400")}>
                            <div className="flex items-center justify-center h-5 w-5">
                              <Trophy className="h-4 w-4" />
                            </div>
                            <span className="leading-none">Achievements</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className={cn("text-sm", isCyberpunk && "text-cyan-300")}>Unlocked</span>
                            <span className={cn("font-bold", isCyberpunk && "text-cyan-400")}>
                              {mockAchievements.filter((a) => a.unlocked).length}/{mockAchievements.length}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={cn("text-sm", isCyberpunk && "text-cyan-300")}>Progress</span>
                            <span className={cn("font-bold", isCyberpunk && "text-cyan-400")}>
                              {Math.round(
                                (mockAchievements.filter((a) => a.unlocked).length / mockAchievements.length) * 100,
                              )}
                              %
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className={cn("arcade-card", isCyberpunk && "bg-black/60 border-cyan-500/30")}>
                        <CardHeader>
                          <CardTitle className={cn("flex items-center gap-2", isCyberpunk && "text-cyan-400")}>
                            <div className="flex items-center justify-center h-5 w-5">
                              <Award className="h-4 w-4" />
                            </div>
                            <span className="leading-none">Performance</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className={cn("text-sm", isCyberpunk && "text-cyan-300")}>Total Wins</span>
                            <span className={cn("font-bold", isCyberpunk && "text-cyan-400")}>
                              {mockStats.overview.totalWins}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={cn("text-sm", isCyberpunk && "text-cyan-300")}>Best Streak</span>
                            <span className={cn("font-bold", isCyberpunk && "text-cyan-400")}>
                              {mockStats.overview.bestStreak}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className={cn("arcade-card", isCyberpunk && "bg-black/60 border-cyan-500/30")}>
                        <CardHeader>
                          <CardTitle className={cn("flex items-center gap-2", isCyberpunk && "text-cyan-400")}>
                            <div className="flex items-center justify-center h-5 w-5">
                              <Shield className="h-4 w-4" />
                            </div>
                            <span className="leading-none">Player</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className={cn("text-sm", isCyberpunk && "text-cyan-300")}>Current Rank</span>
                            <Badge
                              className={cn(
                                "bg-yellow-100 text-yellow-800",
                                isCyberpunk && "bg-cyan-900/30 text-cyan-300",
                              )}
                            >
                              {mockStats.overview.rank}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={cn("text-sm", isCyberpunk && "text-cyan-300")}>Experience Points</span>
                            <span className={cn("font-bold", isCyberpunk && "text-cyan-400")}>
                              {mockStats.overview.xp.toLocaleString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {activeTab === "achievements" && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                      <Card className={cn("arcade-card", isCyberpunk && "bg-black/60 border-cyan-500/30")}>
                        <CardHeader>
                          <CardTitle className={cn("flex items-center gap-2", isCyberpunk && "text-cyan-400")}>
                            <div className="flex items-center justify-center h-5 w-5">
                              <Medal className="h-4 w-4" />
                            </div>
                            <span className="leading-none">Achievement Gallery</span>
                          </CardTitle>
                          <CardDescription className={isCyberpunk ? "text-cyan-300/70" : ""}>
                            Unlock achievements to earn rewards and showcase your skills
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                            {mockAchievements.map((achievement) => {
                              const rarityColors = getRarityColor(achievement.rarity)

                              return (
                                <Card
                                  key={achievement.id}
                                  className={cn(
                                    "relative overflow-hidden border-2 w-full",
                                    achievement.unlocked
                                      ? isCyberpunk
                                        ? "bg-black/40 border-cyan-500/50"
                                        : "bg-white border-green-300"
                                      : isCyberpunk
                                        ? "bg-black/20 border-gray-700/50"
                                        : "bg-gray-50 border-gray-200",
                                    rarityColors,
                                  )}
                                >
                                  <CardContent className="p-3 lg:p-4">
                                    <div className="flex items-start gap-3">
                                      <div
                                        className={cn(
                                          "flex items-center justify-center p-2 rounded-lg flex-shrink-0",
                                          achievement.unlocked
                                            ? isCyberpunk
                                              ? "bg-cyan-900/50"
                                              : "bg-green-100"
                                            : isCyberpunk
                                              ? "bg-gray-800/50"
                                              : "bg-gray-200",
                                        )}
                                      >
                                        <div
                                          className={cn(
                                            "flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30",
                                            achievement.unlocked
                                              ? isCyberpunk
                                                ? "bg-cyan-900/50"
                                                : "bg-green-100"
                                              : isCyberpunk
                                                ? "bg-gray-800/50"
                                                : "bg-gray-200",
                                          )}
                                        >
                                          <img
                                            src={achievement.icon || "/placeholder.svg"}
                                            alt={achievement.title}
                                            className="w-6 h-6 lg:w-8 lg:h-8 object-contain"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                          <h3
                                            className={cn(
                                              "font-semibold text-sm lg:text-base",
                                              achievement.unlocked
                                                ? isCyberpunk
                                                  ? "text-cyan-300"
                                                  : "text-gray-900"
                                                : isCyberpunk
                                                  ? "text-gray-400"
                                                  : "text-gray-500",
                                            )}
                                          >
                                            {achievement.title}
                                          </h3>
                                          <Badge variant="outline" className={cn("text-xs capitalize", rarityColors)}>
                                            {achievement.rarity}
                                          </Badge>
                                        </div>
                                        <p
                                          className={cn(
                                            "text-xs lg:text-sm mb-2",
                                            achievement.unlocked
                                              ? isCyberpunk
                                                ? "text-cyan-300/70"
                                                : "text-gray-600"
                                              : isCyberpunk
                                                ? "text-gray-500"
                                                : "text-gray-400",
                                          )}
                                        >
                                          {achievement.description}
                                        </p>

                                        {/* Progress bar for locked achievements */}
                                        {!achievement.unlocked && achievement.progress !== undefined && (
                                          <div className="mb-2">
                                            <div className="flex justify-between text-xs mb-1">
                                              <span className={isCyberpunk ? "text-gray-400" : "text-gray-500"}>
                                                Progress
                                              </span>
                                              <span className={isCyberpunk ? "text-gray-400" : "text-gray-500"}>
                                                {achievement.progress}/{achievement.maxProgress}
                                              </span>
                                            </div>
                                            <div
                                              className={cn(
                                                "w-full bg-gray-200 rounded-full h-2",
                                                isCyberpunk && "bg-gray-700",
                                              )}
                                            >
                                              <div
                                                className={cn(
                                                  "h-2 rounded-full",
                                                  isCyberpunk ? "bg-cyan-500" : "bg-blue-500",
                                                )}
                                                style={{
                                                  width: `${(achievement.progress! / achievement.maxProgress!) * 100}%`,
                                                }}
                                              />
                                            </div>
                                          </div>
                                        )}

                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                          {/* Reward display */}
                                          <div className="flex items-center gap-2">
                                            <span
                                              className={cn("text-xs", isCyberpunk ? "text-gray-400" : "text-gray-500")}
                                            >
                                              Reward:
                                            </span>
                                            {achievement.reward.type === "tokens" && (
                                              <Badge
                                                className={cn("text-xs", isCyberpunk && "bg-cyan-900/30 text-cyan-300")}
                                              >
                                                +{achievement.reward.amount} MUTB
                                              </Badge>
                                            )}
                                            {achievement.reward.type === "xp" && (
                                              <Badge
                                                className={cn(
                                                  "text-xs",
                                                  isCyberpunk && "bg-purple-900/30 text-purple-300",
                                                )}
                                              >
                                                +{achievement.reward.amount} XP
                                              </Badge>
                                            )}
                                            {achievement.reward.type === "title" && (
                                              <Badge
                                                className={cn(
                                                  "text-xs",
                                                  isCyberpunk && "bg-yellow-900/30 text-yellow-300",
                                                )}
                                              >
                                                Title: {achievement.reward.name}
                                              </Badge>
                                            )}
                                          </div>

                                          {/* Unlock date for completed achievements */}
                                          {achievement.unlocked && achievement.unlockedDate && (
                                            <div className="text-xs">
                                              <span className={isCyberpunk ? "text-cyan-300/50" : "text-gray-400"}>
                                                Unlocked: {achievement.unlockedDate}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {activeTab === "history" && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 items-start sm:items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs sm:text-sm font-medium", isCyberpunk && "text-cyan-300")}>
                          Filter by Game:
                        </span>
                        <Select
                          value={selectedGameType}
                          onValueChange={(value: "all" | "Archer Arena" | "Last Stand") => setSelectedGameType(value)}
                        >
                          <SelectTrigger
                            className={cn("w-48", isCyberpunk && "bg-black/60 border-cyan-500/30 text-cyan-300")}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className={isCyberpunk ? "bg-black/95 border-cyan-500/50" : ""}>
                            <SelectItem value="all" className={isCyberpunk ? "text-cyan-300 focus:bg-cyan-900/30" : ""}>
                              All Games
                            </SelectItem>
                            <SelectItem
                              value="Archer Arena"
                              className={isCyberpunk ? "text-cyan-300 focus:bg-cyan-900/30" : ""}
                            >
                              Archer Arena
                            </SelectItem>
                            <SelectItem
                              value="Last Stand"
                              className={isCyberpunk ? "text-cyan-300 focus:bg-cyan-900/30" : ""}
                            >
                              Last Stand
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {selectedGameType !== "all" && (
                      <Card className={cn("arcade-card", isCyberpunk && "bg-black/60 border-cyan-500/30")}>
                        <CardHeader>
                          <CardTitle className={cn("flex items-center gap-2", isCyberpunk && "text-cyan-400")}>
                            <div className="flex items-center justify-center h-5 w-5">
                              {selectedGameType === "Archer Arena" ? (
                                <Target className="h-4 w-4" />
                              ) : (
                                <Sword className="h-4 w-4" />
                              )}
                            </div>
                            <span className="leading-none">{selectedGameType} Analytics</span>
                          </CardTitle>
                          <CardDescription className={isCyberpunk ? "text-cyan-300/70" : ""}>
                            Detailed performance metrics for {selectedGameType}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-cyan-500/20">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                              {(() => {
                                const stats = getGameTypeStats(selectedGameType as "Archer Arena" | "Last Stand")
                                return (
                                  <>
                                    <div className="text-center">
                                      <div
                                        className={cn("text-lg sm:text-2xl font-bold", isCyberpunk && "text-cyan-400")}
                                      >
                                        {stats.totalGames}
                                      </div>
                                      <div className={cn("text-xs", isCyberpunk && "text-cyan-300/70")}>
                                        Total Games
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div
                                        className={cn(
                                          "text-lg sm:text-2xl font-bold text-green-500",
                                          isCyberpunk && "text-cyan-400",
                                        )}
                                      >
                                        {stats.wins}
                                      </div>
                                      <div className={cn("text-xs", isCyberpunk && "text-cyan-300/70")}>Wins</div>
                                    </div>
                                    <div className="text-center">
                                      <div
                                        className={cn(
                                          "text-lg sm:text-2xl font-bold text-red-500",
                                          isCyberpunk && "text-cyan-400",
                                        )}
                                      >
                                        {stats.losses}
                                      </div>
                                      <div className={cn("text-xs", isCyberpunk && "text-cyan-300/70")}>Losses</div>
                                    </div>
                                    <div className="text-center">
                                      <div
                                        className={cn("text-lg sm:text-2xl font-bold", isCyberpunk && "text-cyan-400")}
                                      >
                                        {stats.winRate}%
                                      </div>
                                      <div className={cn("text-xs", isCyberpunk && "text-cyan-300/70")}>Win Rate</div>
                                    </div>
                                    <div className="text-center">
                                      <div
                                        className={cn("text-lg sm:text-2xl font-bold", isCyberpunk && "text-cyan-400")}
                                      >
                                        {stats.totalTokens}
                                      </div>
                                      <div className={cn("text-xs", isCyberpunk && "text-cyan-300/70")}>
                                        Tokens Earned
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div
                                        className={cn("text-lg sm:text-2xl font-bold", isCyberpunk && "text-cyan-400")}
                                      >
                                        {stats.avgDuration}
                                      </div>
                                      <div className={cn("text-xs", isCyberpunk && "text-cyan-300/70")}>
                                        Avg Duration
                                      </div>
                                    </div>
                                  </>
                                )
                              })()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="space-y-3 sm:space-y-4">
                      {getFilteredGames().map((game) => (
                        <Card
                          key={game.id}
                          className={cn(
                            "arcade-card cursor-pointer transition-all duration-200 hover:shadow-lg",
                            isCyberpunk && "bg-black/40 border-cyan-500/30 hover:border-cyan-400/50",
                          )}
                          onClick={() => setExpandedGame(expandedGame === game.id ? null : game.id)}
                        >
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-cyan-500/20">
                                  {game.game === "Archer Arena" ? (
                                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                                  ) : (
                                    <Sword className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                                  )}
                                </div>
                                <div>
                                  <div
                                    className={cn("font-medium text-sm sm:text-base", isCyberpunk && "text-cyan-300")}
                                  >
                                    {game.game}
                                  </div>
                                  <div className={cn("text-xs sm:text-sm", isCyberpunk && "text-cyan-300/70")}>
                                    vs {game.opponent || "Player123"}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                                <div className="flex items-center gap-2 text-xs sm:text-sm">
                                  <span
                                    className={cn(
                                      "px-2 py-1 rounded text-xs font-medium",
                                      game.result === "Win"
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-red-500/20 text-red-400",
                                    )}
                                  >
                                    {game.result}
                                  </span>
                                  <span className={cn("text-xs", isCyberpunk && "text-cyan-300/70")}>
                                    +{game.tokensEarned}
                                  </span>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setShowInDevelopment(true)
                                    }}
                                    className="bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30 text-xs px-2 py-1 h-auto"
                                  >
                                    Report Match
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setShowInDevelopment(true)
                                    }}
                                    className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 text-xs px-2 py-1 h-auto"
                                  >
                                    Watch Replay
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {expandedGame === game.id && (
                              <div className="mt-4 pt-4 border-t border-cyan-500/30">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                                  <div>
                                    <h4 className={cn("font-medium mb-2", isCyberpunk && "text-cyan-300")}>
                                      Game Details
                                    </h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span className={cn(isCyberpunk ? "text-cyan-300/70" : "text-gray-600")}>
                                          Opponent:
                                        </span>
                                        <span className={cn(isCyberpunk && "text-cyan-400")}>
                                          {game.opponent || "Player123"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className={cn(isCyberpunk ? "text-cyan-300/70" : "text-gray-600")}>
                                          Duration:
                                        </span>
                                        <span className={cn(isCyberpunk && "text-cyan-400")}>{game.duration}</span>
                                      </div>
                                      {game.game === "Archer Arena" && (
                                        <>
                                          <div className="flex justify-between">
                                            <span className={cn(isCyberpunk ? "text-cyan-300/70" : "text-gray-600")}>
                                              Score:
                                            </span>
                                            <span className={cn(isCyberpunk && "text-cyan-400")}>{game.score}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className={cn(isCyberpunk ? "text-cyan-300/70" : "text-gray-600")}>
                                              Map:
                                            </span>
                                            <span className={cn(isCyberpunk && "text-cyan-400")}>{game.map}</span>
                                          </div>
                                        </>
                                      )}
                                      {game.game === "Last Stand" && (
                                        <>
                                          <div className="flex justify-between">
                                            <span className={cn(isCyberpunk ? "text-cyan-300/70" : "text-gray-600")}>
                                              Wave:
                                            </span>
                                            <span className={cn(isCyberpunk && "text-cyan-400")}>{game.wave}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className={cn(isCyberpunk ? "text-cyan-300/70" : "text-gray-600")}>
                                              Weapon:
                                            </span>
                                            <span className={cn(isCyberpunk && "text-cyan-400")}>{game.weapon}</span>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className={cn("font-medium mb-2", isCyberpunk && "text-cyan-300")}>
                                      Performance
                                    </h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span className={cn(isCyberpunk ? "text-cyan-300/70" : "text-gray-600")}>
                                          Result:
                                        </span>
                                        <span className={cn(game.result === "Win" ? "text-green-400" : "text-red-400")}>
                                          {game.result}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className={cn(isCyberpunk ? "text-cyan-300/70" : "text-gray-600")}>
                                          Tokens:
                                        </span>
                                        <span className={cn(isCyberpunk && "text-cyan-400")}>
                                          +{game.tokensEarned} MUTB
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
