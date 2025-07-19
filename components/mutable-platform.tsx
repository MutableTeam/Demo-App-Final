"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Gamepad2,
  Trophy,
  ArrowUpDown,
  Wallet,
  Settings,
  User,
  LogOut,
  Volume2,
  VolumeX,
  ShoppingCart,
} from "lucide-react"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { LOGOS } from "@/utils/image-paths"
import { audioManager, playIntroSound } from "@/utils/audio-manager"
import SoundButton from "./sound-button"
import GameSelection from "./pvp-game/game-selection"
import MutableMarketplace from "./mutable-marketplace"
import TokenSwapInterface from "./token-swap-interface"

interface WalletConnectionData {
  connected: boolean
  publicKey: string
  balance: number | null
  provider: any
  isTestMode?: boolean
}

interface MutablePlatformProps {
  walletData: WalletConnectionData
  onDisconnect: () => void
}

export default function MutablePlatform({ walletData, onDisconnect }: MutablePlatformProps) {
  const [activeTab, setActiveTab] = useState("games")
  const [exchangeSubTab, setExchangeSubTab] = useState("swap")
  const [isSoundMuted, setIsSoundMuted] = useState(false)
  const [userStats] = useState({
    gamesPlayed: 47,
    wins: 32,
    winRate: 68,
    tokensEarned: 1250,
    rank: "Gold III",
    level: 15,
  })

  // Add default values for walletData properties
  const isTestMode = walletData?.isTestMode ?? false
  const publicKey = walletData?.publicKey ?? ""
  const balance = walletData?.balance ?? null
  const provider = walletData?.provider ?? null

  // Add safe defaults for all numeric values
  const safeBalance = balance ?? 0
  const safeMutbBalance = 100 // Default MUTB balance

  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  useEffect(() => {
    setIsSoundMuted(audioManager.isSoundMuted())
  }, [])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (!audioManager.isSoundMuted()) {
      playIntroSound()
    }
  }

  const handleExchangeSubTabChange = (value: string) => {
    setExchangeSubTab(value)
    if (!audioManager.isSoundMuted()) {
      playIntroSound()
    }
  }

  const toggleSound = () => {
    audioManager.toggleSound()
    setIsSoundMuted(audioManager.isSoundMuted())
  }

  const handleDisconnect = () => {
    if (!audioManager.isSoundMuted()) {
      playIntroSound()
    }
    onDisconnect()
  }

  const formatPublicKey = (key: string) => {
    if (key.length <= 8) return key
    return `${key.slice(0, 4)}...${key.slice(-4)}`
  }

  const handleSelectGame = () => {
    if (!audioManager.isSoundMuted()) {
      playIntroSound()
    }
  }

  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-50 border-b-2 backdrop-blur-sm",
          isCyberpunk
            ? "bg-slate-900/80 border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
            : "bg-white/80 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
        )}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Image
                src={LOGOS.MUTABLE.TRANSPARENT || "/placeholder.svg"}
                alt="Mutable"
                width={120}
                height={40}
                className="h-10 w-auto filter drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]"
              />
              <Badge
                variant="outline"
                className={cn(
                  "font-mono text-xs border-2",
                  isCyberpunk
                    ? "border-cyan-500/50 text-cyan-300 bg-cyan-500/10"
                    : "border-amber-500/50 text-amber-700 bg-amber-500/10",
                )}
              >
                {isTestMode ? "TEST MODE" : "MAINNET"}
              </Badge>
            </div>

            {/* User Info & Controls */}
            <div className="flex items-center gap-4">
              {/* Sound Toggle */}
              <SoundButton
                onClick={toggleSound}
                className={cn(
                  "p-2 rounded-lg border-2 transition-all duration-200",
                  isCyberpunk
                    ? "bg-slate-800/60 border-slate-600/60 text-slate-300 hover:bg-slate-700/70 hover:border-slate-500/70 hover:text-cyan-300"
                    : "bg-amber-100/80 border-amber-500/70 text-amber-900 hover:bg-amber-200/80 hover:border-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.3)]",
                )}
              >
                {isSoundMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </SoundButton>

              {/* Wallet Info */}
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg border-2",
                  isCyberpunk
                    ? "bg-slate-800/60 border-slate-600/60"
                    : "bg-amber-100/80 border-amber-500/70 shadow-[0_0_10px_rgba(245,158,11,0.3)]",
                )}
              >
                <Wallet className={cn("h-4 w-4", isCyberpunk ? "text-slate-300" : "text-amber-900")} />
                <div className="text-sm">
                  <div className={cn("font-mono font-bold", isCyberpunk ? "text-slate-200" : "text-amber-900")}>
                    {formatPublicKey(publicKey)}
                  </div>
                  {safeBalance > 0 && (
                    <div className={cn("text-xs", isCyberpunk ? "text-slate-400" : "text-amber-700")}>
                      {safeBalance.toFixed(4)} SOL
                    </div>
                  )}
                </div>
              </div>

              {/* Disconnect Button */}
              <SoundButton
                onClick={handleDisconnect}
                className={cn(
                  "p-2 rounded-lg border-2 transition-all duration-200",
                  isCyberpunk
                    ? "bg-red-900/60 border-red-600/60 text-red-300 hover:bg-red-800/70 hover:border-red-500/70"
                    : "bg-red-100/80 border-red-500/70 text-red-900 hover:bg-red-200/80 hover:border-red-600 shadow-[0_0_10px_rgba(239,68,68,0.3)]",
                )}
              >
                <LogOut className="h-4 w-4" />
              </SoundButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Navigation Tabs */}
          <TabsList
            className={cn(
              "grid w-full grid-cols-4 mb-8 h-14 p-1 border-2",
              isCyberpunk
                ? "bg-slate-900/50 border-cyan-500/30"
                : "bg-amber-50/50 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
            )}
          >
            <TabsTrigger
              value="games"
              className={cn(
                "flex items-center gap-2 font-mono font-bold transition-all duration-200",
                isCyberpunk
                  ? "data-[state=active]:bg-cyan-600/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(0,255,255,0.5)] text-slate-300 hover:text-cyan-300"
                  : "data-[state=active]:bg-amber-600/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(245,158,11,0.5)] text-amber-700 hover:text-amber-800",
              )}
            >
              <Gamepad2 className="h-4 w-4" />
              Games
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className={cn(
                "flex items-center gap-2 font-mono font-bold transition-all duration-200",
                isCyberpunk
                  ? "data-[state=active]:bg-cyan-600/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(0,255,255,0.5)] text-slate-300 hover:text-cyan-300"
                  : "data-[state=active]:bg-amber-600/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(245,158,11,0.5)] text-amber-700 hover:text-amber-800",
              )}
            >
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger
              value="exchange"
              className={cn(
                "flex items-center gap-2 font-mono font-bold transition-all duration-200",
                isCyberpunk
                  ? "data-[state=active]:bg-cyan-600/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(0,255,255,0.5)] text-slate-300 hover:text-cyan-300"
                  : "data-[state=active]:bg-amber-600/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(245,158,11,0.5)] text-amber-700 hover:text-amber-800",
              )}
            >
              <ArrowUpDown className="h-4 w-4" />
              Exchange
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className={cn(
                "flex items-center gap-2 font-mono font-bold transition-all duration-200",
                isCyberpunk
                  ? "data-[state=active]:bg-cyan-600/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(0,255,255,0.5)] text-slate-300 hover:text-cyan-300"
                  : "data-[state=active]:bg-amber-600/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(245,158,11,0.5)] text-amber-700 hover:text-amber-800",
              )}
            >
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Games Tab */}
          <TabsContent value="games" className="space-y-6">
            <GameSelection
              publicKey={publicKey}
              balance={safeBalance}
              mutbBalance={safeMutbBalance}
              onSelectGame={handleSelectGame}
            />
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card
              className={cn(
                "border-2",
                isCyberpunk
                  ? "bg-slate-900/50 border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                  : "bg-white border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
              )}
            >
              <CardHeader>
                <CardTitle
                  className={cn("flex items-center gap-2 font-mono", isCyberpunk ? "text-cyan-300" : "text-amber-700")}
                >
                  <Trophy className="h-5 w-5" />
                  Global Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { rank: 1, player: "CyberWarrior", wins: 156, tokens: 4250 },
                    { rank: 2, player: "PixelMaster", wins: 142, tokens: 3890 },
                    { rank: 3, player: "NeonGamer", wins: 138, tokens: 3750 },
                    { rank: 4, player: "QuantumShot", wins: 124, tokens: 3200 },
                    { rank: 5, player: "You", wins: userStats.wins, tokens: userStats.tokensEarned },
                  ].map((entry) => (
                    <div
                      key={entry.rank}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border-2",
                        entry.player === "You"
                          ? isCyberpunk
                            ? "bg-cyan-500/20 border-cyan-400/50"
                            : "bg-amber-200/50 border-amber-500/50"
                          : isCyberpunk
                            ? "bg-slate-800/30 border-slate-600/30"
                            : "bg-amber-50/30 border-amber-300/30",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                            entry.rank <= 3
                              ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                              : isCyberpunk
                                ? "bg-slate-700 text-slate-300"
                                : "bg-amber-200 text-amber-800",
                          )}
                        >
                          {entry.rank}
                        </div>
                        <div>
                          <div
                            className={cn(
                              "font-bold",
                              entry.player === "You"
                                ? isCyberpunk
                                  ? "text-cyan-300"
                                  : "text-amber-700"
                                : isCyberpunk
                                  ? "text-slate-200"
                                  : "text-gray-900",
                            )}
                          >
                            {entry.player}
                          </div>
                          <div className={cn("text-sm", isCyberpunk ? "text-slate-400" : "text-gray-600")}>
                            {entry.wins} wins
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn("font-bold", isCyberpunk ? "text-cyan-300" : "text-amber-700")}>
                          {entry.tokens} MUTABLE
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exchange Tab with Sub-tabs */}
          <TabsContent value="exchange" className="space-y-6">
            <Tabs value={exchangeSubTab} onValueChange={handleExchangeSubTabChange} className="w-full">
              {/* Exchange Sub-navigation */}
              <TabsList
                className={cn(
                  "grid w-full grid-cols-2 mb-6 h-12 p-1 border-2",
                  isCyberpunk
                    ? "bg-slate-900/50 border-cyan-500/30"
                    : "bg-amber-50/50 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
                )}
              >
                <TabsTrigger
                  value="swap"
                  className={cn(
                    "flex items-center gap-2 font-mono font-bold transition-all duration-200",
                    isCyberpunk
                      ? "data-[state=active]:bg-cyan-600/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(0,255,255,0.5)] text-slate-300 hover:text-cyan-300"
                      : "data-[state=active]:bg-amber-600/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(245,158,11,0.5)] text-amber-700 hover:text-amber-800",
                  )}
                >
                  <ArrowUpDown className="h-4 w-4" />
                  Token Swap
                </TabsTrigger>
                <TabsTrigger
                  value="marketplace"
                  className={cn(
                    "flex items-center gap-2 font-mono font-bold transition-all duration-200",
                    isCyberpunk
                      ? "data-[state=active]:bg-cyan-600/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(0,255,255,0.5)] text-slate-300 hover:text-cyan-300"
                      : "data-[state=active]:bg-amber-600/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(245,158,11,0.5)] text-amber-700 hover:text-amber-800",
                  )}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Marketplace
                </TabsTrigger>
              </TabsList>

              {/* Token Swap Sub-tab */}
              <TabsContent value="swap">
                <TokenSwapInterface />
              </TabsContent>

              {/* Marketplace Sub-tab */}
              <TabsContent value="marketplace">
                <MutableMarketplace />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Stats */}
              <Card
                className={cn(
                  "border-2",
                  isCyberpunk
                    ? "bg-slate-900/50 border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                    : "bg-white border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
                )}
              >
                <CardHeader>
                  <CardTitle
                    className={cn(
                      "flex items-center gap-2 font-mono",
                      isCyberpunk ? "text-cyan-300" : "text-amber-700",
                    )}
                  >
                    <User className="h-5 w-5" />
                    Player Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={cn(
                        "p-4 rounded-lg border-2 text-center",
                        isCyberpunk ? "bg-slate-800/30 border-slate-600/30" : "bg-amber-50/30 border-amber-300/30",
                      )}
                    >
                      <div className={cn("text-2xl font-bold", isCyberpunk ? "text-cyan-300" : "text-amber-700")}>
                        {userStats.gamesPlayed}
                      </div>
                      <div className={cn("text-sm", isCyberpunk ? "text-slate-400" : "text-gray-600")}>
                        Games Played
                      </div>
                    </div>
                    <div
                      className={cn(
                        "p-4 rounded-lg border-2 text-center",
                        isCyberpunk ? "bg-slate-800/30 border-slate-600/30" : "bg-amber-50/30 border-amber-300/30",
                      )}
                    >
                      <div className={cn("text-2xl font-bold", isCyberpunk ? "text-cyan-300" : "text-amber-700")}>
                        {userStats.wins}
                      </div>
                      <div className={cn("text-sm", isCyberpunk ? "text-slate-400" : "text-gray-600")}>Wins</div>
                    </div>
                    <div
                      className={cn(
                        "p-4 rounded-lg border-2 text-center",
                        isCyberpunk ? "bg-slate-800/30 border-slate-600/30" : "bg-amber-50/30 border-amber-300/30",
                      )}
                    >
                      <div className={cn("text-2xl font-bold", isCyberpunk ? "text-cyan-300" : "text-amber-700")}>
                        {userStats.winRate}%
                      </div>
                      <div className={cn("text-sm", isCyberpunk ? "text-slate-400" : "text-gray-600")}>Win Rate</div>
                    </div>
                    <div
                      className={cn(
                        "p-4 rounded-lg border-2 text-center",
                        isCyberpunk ? "bg-slate-800/30 border-slate-600/30" : "bg-amber-50/30 border-amber-300/30",
                      )}
                    >
                      <div className={cn("text-2xl font-bold", isCyberpunk ? "text-cyan-300" : "text-amber-700")}>
                        {(userStats.tokensEarned ?? 0).toFixed(0)}
                      </div>
                      <div className={cn("text-sm", isCyberpunk ? "text-slate-400" : "text-gray-600")}>
                        MUTABLE Earned
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-600/30">
                    <div>
                      <div className={cn("font-bold", isCyberpunk ? "text-slate-200" : "text-gray-900")}>
                        Current Rank
                      </div>
                      <div className={cn("text-sm", isCyberpunk ? "text-slate-400" : "text-gray-600")}>
                        Level {userStats.level}
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "font-mono font-bold px-3 py-1",
                        isCyberpunk
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                          : "bg-gradient-to-r from-amber-400 to-orange-500 text-white",
                      )}
                    >
                      {userStats.rank}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card
                className={cn(
                  "border-2",
                  isCyberpunk
                    ? "bg-slate-900/50 border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                    : "bg-white border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
                )}
              >
                <CardHeader>
                  <CardTitle
                    className={cn(
                      "flex items-center gap-2 font-mono",
                      isCyberpunk ? "text-cyan-300" : "text-amber-700",
                    )}
                  >
                    <Settings className="h-5 w-5" />
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={cn("font-medium", isCyberpunk ? "text-slate-200" : "text-gray-900")}>
                      Sound Effects
                    </span>
                    <SoundButton
                      onClick={toggleSound}
                      className={cn(
                        "p-2 rounded-lg border-2 transition-all duration-200",
                        isCyberpunk
                          ? "bg-slate-800/60 border-slate-600/60 text-slate-300 hover:bg-slate-700/70"
                          : "bg-amber-100/80 border-amber-500/70 text-amber-900 hover:bg-amber-200/80",
                      )}
                    >
                      {isSoundMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </SoundButton>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={cn("font-medium", isCyberpunk ? "text-slate-200" : "text-gray-900")}>
                      Theme Mode
                    </span>
                    <Badge
                      className={cn(
                        "font-mono",
                        isCyberpunk
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                          : "bg-amber-500/20 text-amber-700 border-amber-500/30",
                      )}
                    >
                      {isCyberpunk ? "Cyberpunk" : "Retro"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
