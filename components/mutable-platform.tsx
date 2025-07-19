"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeftRight, Gamepad2, Code, User, ShoppingCart } from "lucide-react"
import type { Connection } from "@solana/web3.js"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import { withClickSound } from "@/utils/sound-utils"
import GameSelection from "./pvp-game/game-selection"
import UserProfile from "./user-profile"
import MutableExchange from "./mutable-exchange"
import MutableMarketplace from "./mutable-marketplace"
import { getTokenBalance } from "@/utils/token-utils"
import { MUTB_TOKEN } from "@/config/token-registry"

interface MutablePlatformProps {
  publicKey: string
  balance: number | null
  provider: any
  connection: Connection
  onDisconnect: () => void
}

export default function MutablePlatform({
  publicKey,
  balance: initialBalance,
  provider,
  connection,
  onDisconnect,
}: MutablePlatformProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  const [activeTab, setActiveTab] = useState("games")
  const [solBalance, setSolBalance] = useState(initialBalance)
  const [mutbBalance, setMutbBalance] = useState<number | null>(null)

  const fetchBalances = async () => {
    if (!publicKey || !connection) return
    try {
      const sol = await connection.getBalance(new (await import("@solana/web3.js")).PublicKey(publicKey))
      setSolBalance(sol / 1e9)

      const mutb = await getTokenBalance(connection, publicKey, MUTB_TOKEN)
      setMutbBalance(mutb)
    } catch (error) {
      console.error("Error fetching balances:", error)
    }
  }

  useEffect(() => {
    fetchBalances()
    const interval = setInterval(fetchBalances, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [publicKey, connection])

  const handleBalanceChange = (currency: "sol" | "mutb", newBalance: number) => {
    if (currency === "sol") {
      setSolBalance(newBalance)
    } else {
      setMutbBalance(newBalance)
    }
  }

  const tabsConfig = [
    { value: "exchange", label: "EXCHANGE", icon: ArrowLeftRight },
    { value: "games", label: "GAMES", icon: Gamepad2 },
    { value: "develop", label: "DEVELOP", icon: Code },
    { value: "profile", label: "PROFILE", icon: User },
  ]

  const exchangeTabsConfig = [
    { value: "swap", label: "Token Swap", icon: ArrowLeftRight },
    { value: "marketplace", label: "Marketplace", icon: ShoppingCart },
  ]

  return (
    <div className="w-full">
      <Tabs defaultValue="games" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className={cn(
            "grid w-full grid-cols-4 mb-6",
            isCyberpunk ? "bg-black/30 border border-cyan-500/30 p-1 h-14" : "bg-[#FFD54F] border-2 border-black h-14",
          )}
        >
          {tabsConfig.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={cn(
                "text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300",
                isCyberpunk
                  ? "text-cyan-200/70 hover:bg-cyan-500/10 hover:text-cyan-200 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-100 data-[state=active]:shadow-[inset_0_0_10px_rgba(0,255,255,0.2)]"
                  : "text-black/70 hover:bg-white/50 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-inner",
              )}
              onClick={withClickSound()}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="exchange">
          <Card className={isCyberpunk ? "bg-black/50 border border-cyan-500/20" : "bg-white border-2 border-black"}>
            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="swap" className="w-full">
                <TabsList
                  className={cn(
                    "grid w-full grid-cols-2 mb-6 max-w-md mx-auto",
                    isCyberpunk
                      ? "bg-black/30 border border-cyan-500/30 p-1 h-12"
                      : "bg-yellow-200 border-2 border-black h-12",
                  )}
                >
                  {exchangeTabsConfig.map(({ value, label, icon: Icon }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className={cn(
                        "text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300",
                        isCyberpunk
                          ? "text-cyan-200/70 hover:bg-cyan-500/10 hover:text-cyan-200 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-100"
                          : "text-black/70 hover:bg-white/50 data-[state=active]:bg-white data-[state=active]:text-black",
                      )}
                      onClick={withClickSound()}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value="swap">
                  <MutableExchange
                    publicKey={publicKey}
                    balance={solBalance}
                    provider={provider}
                    connection={connection}
                    onBalanceChange={handleBalanceChange}
                  />
                </TabsContent>
                <TabsContent value="marketplace">
                  <MutableMarketplace publicKey={publicKey} balance={solBalance} mutbBalance={mutbBalance ?? 0} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games">
          <GameSelection
            publicKey={publicKey}
            solBalance={solBalance}
            mutbBalance={mutbBalance}
            provider={provider}
            connection={connection}
            onBalanceChange={handleBalanceChange}
          />
        </TabsContent>

        <TabsContent value="develop">
          <Card className={isCyberpunk ? "bg-black/50 border border-cyan-500/20" : "bg-white border-2 border-black"}>
            <CardHeader>
              <CardTitle className={isCyberpunk ? "text-cyan-200" : ""}>Developer Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={isCyberpunk ? "text-cyan-400/80" : ""}>
                Integrate your own games and assets into the Mutable ecosystem. Docs coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <UserProfile
            publicKey={publicKey}
            solBalance={solBalance}
            mutbBalance={mutbBalance}
            onDisconnect={onDisconnect}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
