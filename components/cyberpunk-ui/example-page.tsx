"use client"

import { useState } from "react"
import Image from "next/image"
import {
  CyberCard,
  CyberCardHeader,
  CyberCardTitle,
  CyberCardContent,
  CyberCardFooter,
  CyberButton,
  CyberOutlineButton,
  CyberBadge,
  GridBackground,
  GlowText,
  MagentaGlowText,
  CyberPanel,
  CyberHeader,
  CyberFooter,
  NeonBorder,
} from "./styled-components"
import { Home, Settings, User, BarChart3, Wallet, Trophy, Gamepad2 } from "lucide-react"

export function CyberpunkExamplePage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="min-h-screen bg-[#0a0a24] text-white p-4 md:p-8">
      <CyberHeader className="mb-8">
        <div className="flex items-center gap-4">
          <Image
            src="/images/mutable-logo-transparent.png"
            alt="Mutable Logo"
            width={96}
            height={48}
            className="logo-glow"
          />
          <GlowText className="text-xl md:text-2xl font-bold">MUTABLE ARCADE</GlowText>
        </div>
        <div className="flex items-center gap-2">
          <CyberBadge>BETA</CyberBadge>
          <CyberButton size="sm">Connect</CyberButton>
        </div>
      </CyberHeader>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-6">
          <CyberPanel>
            <nav className="space-y-2">
              <CyberButton
                variant={activeTab === "dashboard" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveTab("dashboard")}
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </CyberButton>
              <CyberButton
                variant={activeTab === "games" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveTab("games")}
              >
                <Gamepad2 className="mr-2 h-4 w-4" />
                Games
              </CyberButton>
              <CyberButton
                variant={activeTab === "wallet" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveTab("wallet")}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Wallet
              </CyberButton>
              <CyberButton
                variant={activeTab === "leaderboard" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveTab("leaderboard")}
              >
                <Trophy className="mr-2 h-4 w-4" />
                Leaderboard
              </CyberButton>
              <CyberButton
                variant={activeTab === "stats" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveTab("stats")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Stats
              </CyberButton>
              <CyberButton
                variant={activeTab === "profile" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveTab("profile")}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </CyberButton>
              <CyberButton
                variant={activeTab === "settings" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </CyberButton>
            </nav>
          </CyberPanel>

          <CyberCard>
            <GridBackground />
            <CyberCardHeader>
              <CyberCardTitle>Player Stats</CyberCardTitle>
            </CyberCardHeader>
            <CyberCardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Games Played:</span>
                  <GlowText>42</GlowText>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Wins:</span>
                  <GlowText>28</GlowText>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Win Rate:</span>
                  <GlowText>66.7%</GlowText>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">MUTB Earned:</span>
                  <MagentaGlowText>1,250</MagentaGlowText>
                </div>
              </div>
            </CyberCardContent>
          </CyberCard>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <CyberCard className="w-full">
            <GridBackground />
            <CyberCardHeader>
              <CyberCardTitle>Featured Games</CyberCardTitle>
            </CyberCardHeader>
            <CyberCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Pixel Pool", image: "/images/pixel-art-pool.png" },
                  { name: "Archer Game", image: "/images/archer-game.png" },
                  { name: "Last Stand", image: "/images/last-stand.jpg" },
                ].map((game) => (
                  <NeonBorder key={game.name}>
                    <div className="relative overflow-hidden rounded">
                      <Image
                        src={game.image || "/placeholder.svg"}
                        alt={game.name}
                        width={300}
                        height={200}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                        <div>
                          <h3 className="font-bold text-white">{game.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <CyberBadge className="text-xs">PLAY NOW</CyberBadge>
                            <CyberBadge variant="outline" className="text-xs">
                              EARN MUTB
                            </CyberBadge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </NeonBorder>
                ))}
              </div>
            </CyberCardContent>
            <CyberCardFooter>
              <CyberButton className="w-full">View All Games</CyberButton>
            </CyberCardFooter>
          </CyberCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CyberCard>
              <GridBackground />
              <CyberCardHeader>
                <CyberCardTitle>Leaderboard</CyberCardTitle>
              </CyberCardHeader>
              <CyberCardContent>
                <div className="space-y-3">
                  {[
                    { rank: 1, name: "CryptoKing", score: 9850 },
                    { rank: 2, name: "PixelMaster", score: 8720 },
                    { rank: 3, name: "BlockchainWizard", score: 7650 },
                    { rank: 4, name: "SolanaGamer", score: 6540 },
                    { rank: 5, name: "NFTCollector", score: 5430 },
                  ].map((player) => (
                    <div key={player.rank} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`font-mono ${player.rank <= 3 ? "text-[#0ff]" : ""}`}>#{player.rank}</span>
                        <span>{player.name}</span>
                      </div>
                      <GlowText>{player.score.toLocaleString()}</GlowText>
                    </div>
                  ))}
                </div>
              </CyberCardContent>
              <CyberCardFooter>
                <CyberOutlineButton className="w-full">Full Leaderboard</CyberOutlineButton>
              </CyberCardFooter>
            </CyberCard>

            <CyberCard>
              <GridBackground />
              <CyberCardHeader>
                <CyberCardTitle>Token Stats</CyberCardTitle>
              </CyberCardHeader>
              <CyberCardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/images/mutable-token.png"
                        alt="MUTB Token"
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span>MUTB Price</span>
                    </div>
                    <GlowText>$0.42</GlowText>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image src="/solana-logo.png" alt="Solana" width={24} height={24} className="rounded-full" />
                      <span>SOL Price</span>
                    </div>
                    <GlowText>$125.78</GlowText>
                  </div>

                  <div className="pt-2 border-t border-[#0ff]/30">
                    <div className="flex items-center justify-between mb-2">
                      <span>24h Volume</span>
                      <MagentaGlowText>$1.2M</MagentaGlowText>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Market Cap</span>
                      <MagentaGlowText>$42M</MagentaGlowText>
                    </div>
                  </div>
                </div>
              </CyberCardContent>
              <CyberCardFooter>
                <CyberOutlineButton className="w-full">Trade MUTB</CyberOutlineButton>
              </CyberCardFooter>
            </CyberCard>
          </div>
        </div>
      </div>

      <CyberFooter className="mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Image src="/images/mutable-logo-transparent.png" alt="Mutable Logo" width={64} height={32} />
            <GlowText>&copy; 2023 Mutable Arcade</GlowText>
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-[#0ff] hover:text-[#0ff]/80">
              Terms
            </a>
            <a href="#" className="text-[#0ff] hover:text-[#0ff]/80">
              Privacy
            </a>
            <a href="#" className="text-[#0ff] hover:text-[#0ff]/80">
              Support
            </a>
          </div>
        </div>
      </CyberFooter>
    </div>
  )
}
