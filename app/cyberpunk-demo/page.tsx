"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { CyberHighlight, CyberAccent, CyberSeparator, CyberTag, CyberWrapper } from "@/components/cyberpunk-components"
import { CyberpunkHeader } from "@/components/cyberpunk-header"
import { CyberpunkFooter } from "@/components/cyberpunk-footer"
import Image from "next/image"
import { Home, Settings, User, BarChart3, Wallet, Trophy, Gamepad2 } from "lucide-react"
import MultiWalletConnector from "@/components/multi-wallet-connector"

export default function CyberpunkDemoPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="min-h-screen flex flex-col">
      <CyberpunkHeader />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <Card className="md:w-1/3">
              <CardHeader>
                <CardTitle>Style Controls</CardTitle>
                <CardDescription>Toggle between UI styles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Color Theme:</span>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>

            <Card className="md:w-2/3">
              <CardHeader>
                <CardTitle>Wallet Connection</CardTitle>
                <CardDescription>Connect your Solana wallet</CardDescription>
              </CardHeader>
              <CardContent>
                <MultiWalletConnector />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Navigation</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <nav className="space-y-2">
                    <Button
                      variant={activeTab === "dashboard" ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("dashboard")}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                    <Button
                      variant={activeTab === "games" ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("games")}
                    >
                      <Gamepad2 className="mr-2 h-4 w-4" />
                      Games
                    </Button>
                    <Button
                      variant={activeTab === "wallet" ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("wallet")}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Wallet
                    </Button>
                    <Button
                      variant={activeTab === "leaderboard" ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("leaderboard")}
                    >
                      <Trophy className="mr-2 h-4 w-4" />
                      Leaderboard
                    </Button>
                    <Button
                      variant={activeTab === "stats" ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("stats")}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Stats
                    </Button>
                    <Button
                      variant={activeTab === "profile" ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("profile")}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                    <Button
                      variant={activeTab === "settings" ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("settings")}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  </nav>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Player Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Games Played:</span>
                      <CyberHighlight>42</CyberHighlight>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Wins:</span>
                      <CyberHighlight>28</CyberHighlight>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Win Rate:</span>
                      <CyberHighlight>66.7%</CyberHighlight>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">MUTB Earned:</span>
                      <CyberAccent>1,250</CyberAccent>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Featured Games</CardTitle>
                  <CardDescription>Play and earn MUTB tokens</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: "Pixel Pool", image: "/images/pixel-art-pool.png" },
                      { name: "Archer Game", image: "/images/archer-game.png" },
                      { name: "Last Stand", image: "/images/last-stand.jpg" },
                    ].map((game) => (
                      <CyberWrapper key={game.name}>
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
                                <CyberTag>PLAY NOW</CyberTag>
                                <CyberTag>EARN MUTB</CyberTag>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CyberWrapper>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="gradient" className="w-full">
                    View All Games
                  </Button>
                </CardFooter>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Leaderboard</CardTitle>
                    <CardDescription>Top players this week</CardDescription>
                  </CardHeader>
                  <CardContent>
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
                            <span className={`font-mono ${player.rank <= 3 ? "text-[#0ff] cyber-text" : ""}`}>
                              #{player.rank}
                            </span>
                            <span>{player.name}</span>
                          </div>
                          <CyberHighlight>{player.score.toLocaleString()}</CyberHighlight>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full bg-transparent">
                      Full Leaderboard
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Token Stats</CardTitle>
                    <CardDescription>Current market data</CardDescription>
                  </CardHeader>
                  <CardContent>
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
                        <CyberHighlight>$0.42</CyberHighlight>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Image src="/solana-logo.png" alt="Solana" width={24} height={24} className="rounded-full" />
                          <span>SOL Price</span>
                        </div>
                        <CyberHighlight>$125.78</CyberHighlight>
                      </div>

                      <CyberSeparator />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>24h Volume</span>
                          <CyberAccent>$1.2M</CyberAccent>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Market Cap</span>
                          <CyberAccent>$42M</CyberAccent>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full bg-transparent">
                      Trade MUTB
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CyberpunkFooter className="mt-8" />
    </div>
  )
}
