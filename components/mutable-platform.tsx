"use client"

import type React from "react"

import { useState, useCallback } from "react"
import type { Connection } from "@solana/web3.js"
import type { Client as ColyseusClient, Room } from "colyseus.js"
import { GameSelection } from "@/components/pvp-game/game-selection"
import MatchmakingLobby from "@/components/pvp-game/matchmaking-lobby" // Changed to default import
import type { PlayerState } from "@/schemas/Player"
import { gameRegistry } from "@/types/game-registry"
import { MutableMarketplace } from "@/components/mutable-marketplace"
import { LiquidityPoolStatus } from "@/components/swap/liquidity-pool-status"
import { TokenSwapForm } from "@/components/swap/token-swap-form"
import { MarketOverview } from "@/components/swap/market-overview"
import { TransactionHistory } from "@/components/swap/transaction-history"
import { Tabs } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { CyberpunkTabs } from "@/components/cyberpunk-ui/cyberpunk-tabs"
import { CyberpunkAlert } from "@/components/cyberpunk-ui/cyberpunk-alert"
import { RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MutablePlatformProps {
  publicKey: string
  balance: number | null
  provider: any
  connection: Connection
  colyseusClient: ColyseusClient | null
  hubRoom: Room | null
  playerState: PlayerState
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>
  log: (message: string, type?: "info" | "error" | "success") => void
  availableRooms: any[]
}

export default function MutablePlatform({
  publicKey,
  balance,
  provider,
  connection,
  colyseusClient,
  hubRoom,
  playerState,
  setPlayerState,
  log,
  availableRooms,
}: MutablePlatformProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [selectedGameName, setSelectedGameName] = useState<string | null>(null)
  const [refreshTradability, setRefreshTradability] = useState(0) // State to trigger refresh

  const handleSelectGame = useCallback(
    (gameId: string) => {
      const game = gameRegistry.getGame(gameId)
      if (game) {
        setSelectedGameId(gameId)
        setSelectedGameName(game.config.name)
        setPlayerState((prev) => ({
          ...prev,
          gameSessionActive: true,
          gameSessionType: gameId,
          status: { text: `Selected game: ${game.config.name}`, type: "info" },
        }))
        log(`Game selected: ${game.config.name}`, "info")
      } else {
        log(`Error: Game with ID ${gameId} not found.`, "error")
      }
    },
    [setPlayerState, log],
  )

  const handleLeaveGame = useCallback(() => {
    setSelectedGameId(null)
    setSelectedGameName(null)
    setPlayerState((prev) => ({
      ...prev,
      gameSessionActive: false,
      gameSessionType: null,
      status: { text: "Left game session", type: "info" },
    }))
    log("Left game session", "info")
  }, [setPlayerState, log])

  const handleRefreshTradability = useCallback(() => {
    setRefreshTradability((prev) => prev + 1)
  }, [])

  // Define tabs content dynamically
  const tabs = [
    {
      value: "games",
      label: "Games",
      content: (
        <GameSelection
          publicKey={publicKey}
          balance={balance}
          mutbBalance={playerState.mutbBalance}
          onSelectGame={handleSelectGame}
        />
      ),
    },
    {
      value: "marketplace",
      label: "Marketplace",
      content: <MutableMarketplace publicKey={publicKey} connection={connection} />,
    },
  ]

  // Add swap tab only if in cyberpunk mode
  if (isCyberpunk) {
    tabs.push({
      value: "swap",
      label: "Swap",
      content: (
        <Card className="w-full !bg-black/80 !border-cyan-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold text-cyan-400">Token Swap</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefreshTradability}
              className="text-cyan-400 hover:text-cyan-200"
              aria-label="Refresh Tradability"
            >
              <RefreshCcw className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <LiquidityPoolStatus publicKey={publicKey} connection={connection} refreshKey={refreshTradability} />
            <TokenSwapForm publicKey={publicKey} connection={connection} refreshKey={refreshTradability} />
            <MarketOverview publicKey={publicKey} connection={connection} refreshKey={refreshTradability} />
            <TransactionHistory publicKey={publicKey} connection={connection} />
          </CardContent>
        </Card>
      ),
    })
  }

  const TabComponent = isCyberpunk ? CyberpunkTabs : Tabs

  return (
    <div className="w-full">
      {selectedGameId ? (
        <MatchmakingLobby
          gameId={selectedGameId}
          gameName={selectedGameName || "Unknown Game"}
          publicKey={publicKey}
          balance={balance}
          mutbBalance={playerState.mutbBalance}
          onLeaveGame={handleLeaveGame}
          colyseusClient={colyseusClient}
          hubRoom={hubRoom}
          playerState={playerState}
          setPlayerState={setPlayerState}
          log={log}
          availableRooms={availableRooms}
        />
      ) : (
        <TabComponent defaultValue="games" className="w-full" tabs={tabs} />
      )}
      {playerState.status.type === "error" && (
        <CyberpunkAlert title="Connection Error" description={playerState.status.text} className="mt-4" />
      )}
    </div>
  )
}
