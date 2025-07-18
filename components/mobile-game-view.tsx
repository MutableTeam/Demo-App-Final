"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Gamepad2, ArrowLeft } from "lucide-react"
import Image from "next/image"
import GameSelection from "./pvp-game/game-selection"
import MatchmakingLobby from "./pvp-game/matchmaking-lobby"
import LastStandGameLauncher from "@/games/last-stand/game-launcher"
import type { Connection } from "@solana/web3.js"
import { cn } from "@/lib/utils"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import MultiWalletConnector from "./multi-wallet-connector"
import GlobalAudioControls from "./global-audio-controls"

interface MobileGameViewProps {
  publicKey: string
  balance: number | null
  provider: any
  connection: Connection
  onBackToModeSelection: () => void
  onWalletChange: (connected: boolean, publicKey: string, balance: number | null, provider: any) => void
}

export default function MobileGameView({
  publicKey,
  balance,
  provider,
  connection,
  onBackToModeSelection,
  onWalletChange,
}: MobileGameViewProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [mutbBalance, setMutbBalance] = useState<number>(100) // Mock MUTB balance
  const [localBalance, setLocalBalance] = useState<number | null>(balance)

  useEffect(() => {
    setLocalBalance(balance)
  }, [balance])

  const getPlayerName = () => {
    if (!publicKey) return "Player"
    return "Player_" + publicKey.substring(0, 4)
  }

  const handleSelectGame = (gameId: string) => {
    setSelectedGame(gameId)
  }

  const handleBackToSelection = () => {
    setSelectedGame(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToModeSelection}
            className={cn(
              "border-2",
              isCyberpunk
                ? "border-cyan-500 text-cyan-400 bg-black/50 hover:bg-cyan-900/50"
                : "border-gray-300 hover:bg-gray-100",
            )}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-1 font-mono",
              isCyberpunk ? "bg-black/70 border-cyan-500 text-cyan-400" : "bg-yellow-100 text-black border-yellow-500",
            )}
          >
            <Image src="/images/mutable-token.png" alt="MUTB" width={16} height={16} className="rounded-full" />
            {mutbBalance.toFixed(2)} MUTB
          </Badge>
          <div className="flex items-center gap-4">
            <GlobalAudioControls />
            <MultiWalletConnector onConnectionChange={onWalletChange} compact={true} />
          </div>
        </div>

        {/* Game Content */}
        {selectedGame ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToSelection}
                className={cn(
                  "border-2",
                  isCyberpunk
                    ? "border-cyan-500 text-cyan-400 bg-black/50 hover:bg-cyan-900/50"
                    : "border-gray-300 hover:bg-gray-100",
                )}
              >
                Back to Games
              </Button>
            </div>

            {selectedGame === "top-down-shooter" || selectedGame === "mutball-pool" ? (
              <MatchmakingLobby
                publicKey={publicKey}
                playerName={getPlayerName()}
                mutbBalance={mutbBalance}
                onExit={handleBackToSelection}
                selectedGame={selectedGame}
              />
            ) : selectedGame === "archer-arena" ? (
              <div className="space-y-4">
                <LastStandGameLauncher
                  publicKey={publicKey}
                  playerName={getPlayerName()}
                  mutbBalance={mutbBalance}
                  onExit={handleBackToSelection}
                />
              </div>
            ) : (
              <Card className={cn("arcade-card", isCyberpunk ? "bg-black/80 border-cyan-500/50" : "")}>
                <CardContent className="p-8 flex flex-col items-center justify-center">
                  <Gamepad2
                    size={48}
                    className={cn("mb-4", isCyberpunk ? "text-cyan-500" : "text-gray-700 dark:text-gray-400")}
                  />
                  <h2
                    className={cn(
                      "text-2xl font-bold font-mono text-center mb-2",
                      isCyberpunk ? "text-cyan-400" : "dark:text-white",
                    )}
                  >
                    COMING SOON
                  </h2>
                  <p
                    className={cn(
                      "text-center text-sm max-w-md mb-4",
                      isCyberpunk ? "text-cyan-300/70" : "text-gray-700 dark:text-gray-300",
                    )}
                  >
                    This game is currently in development and will be available soon!
                  </p>
                  <Button
                    onClick={handleBackToSelection}
                    className={cn(
                      "font-mono",
                      isCyberpunk
                        ? "bg-cyan-900/50 hover:bg-cyan-800/50 text-cyan-400 border border-cyan-500"
                        : "bg-yellow-500 hover:bg-yellow-600 text-black",
                    )}
                  >
                    BACK TO GAMES
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div>
            <Card className={cn("mb-6", isCyberpunk ? "bg-black/80 border-cyan-500/50" : "")}>
              <CardHeader>
                <CardTitle className={cn("font-mono text-center", isCyberpunk ? "text-cyan-400" : "dark:text-white")}>
                  MOBILE GAMES
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={cn(
                    "text-center text-sm",
                    isCyberpunk ? "text-cyan-300/70" : "text-gray-600 dark:text-gray-300",
                  )}
                >
                  Optimized gaming experience for mobile devices
                </p>
              </CardContent>
            </Card>

            <GameSelection
              publicKey={publicKey}
              balance={localBalance}
              mutbBalance={mutbBalance}
              onSelectGame={handleSelectGame}
            />
          </div>
        )}
      </div>
    </div>
  )
}
