"use client"

import { useState } from "react"
import type { Connection } from "@solana/web3.js"
import { GameSelection } from "@/components/pvp-game/game-selection"
import { WaitingRoom } from "@/components/pvp-game/waiting-room"
import { GameContainer } from "@/components/game-container"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import MultiWalletConnector from "@/components/multi-wallet-connector"
import GlobalAudioControls from "@/components/global-audio-controls"
import Image from "next/image"

interface MobileGameViewProps {
  publicKey: string
  balance: number | null
  provider: any
  connection: Connection
  onWalletChange: (connected: boolean, publicKey: string, balance: number | null, provider: any) => void
}

export default function MobileGameView({
  publicKey,
  balance,
  provider,
  connection,
  onWalletChange,
}: MobileGameViewProps) {
  const [gameStage, setGameStage] = useState<"selection" | "waiting" | "playing" | "ended">("selection")
  const [selectedGame, setSelectedGame] = useState<any>(null)
  const [wager, setWager] = useState(0)
  const [winner, setWinner] = useState<string | null>(null)

  const handleGameSelect = (game: any, selectedWager: number) => {
    setSelectedGame(game)
    setWager(selectedWager)
    setGameStage("waiting")
  }

  const handleGameStart = () => {
    setGameStage("playing")
  }

  const handleGameEnd = (winner: string | null) => {
    setWinner(winner)
    setGameStage("ended")
  }

  const handlePlayAgain = () => {
    setGameStage("selection")
    setSelectedGame(null)
    setWinner(null)
  }

  const renderStage = () => {
    switch (gameStage) {
      case "selection":
        // For mobile, we go directly to the Archer Arena game selection
        return <GameSelection onGameSelect={handleGameSelect} gameId="archer-arena" />
      case "waiting":
        return <WaitingRoom game={selectedGame} wager={wager} onGameStart={handleGameStart} isMobile={true} />
      case "playing":
        return (
          <GameContainer
            gameId={selectedGame.id}
            playerId={publicKey}
            playerName="Player1" // In a real app, this would come from a user profile
            isHost={true}
            gameMode="mobile"
            onGameEnd={handleGameEnd}
          />
        )
      case "ended":
        return (
          <Card className="text-center p-8 bg-black/70 border-2 border-cyber-cyan text-white">
            <h2 className="text-3xl font-bold mb-4 text-cyber-cyan-light">Game Over</h2>
            <p className="text-xl mb-6">
              {winner ? `Winner: ${winner === publicKey ? "You!" : "AI"}` : "It's a draw!"}
            </p>
            <Button onClick={handlePlayAgain} className="bg-cyber-blue hover:bg-cyber-blue/80 text-white font-bold">
              Play Again
            </Button>
          </Card>
        )
    }
  }

  return (
    <div className="w-full h-screen flex flex-col bg-black text-white p-4 font-mono">
      <header className="flex justify-between items-center mb-4 flex-shrink-0">
        <div className="flex items-center gap-2 bg-black/50 border border-cyber-magenta-dark p-2 rounded-md">
          <Image src="/images/mutable-token.png" alt="MUTB Token" width={24} height={24} />
          <span className="font-bold text-lg text-cyber-magenta-light">{balance?.toFixed(2) ?? "0.00"}</span>
        </div>
        <div className="flex items-center gap-4">
          <GlobalAudioControls />
          <MultiWalletConnector onConnectionChange={onWalletChange} compact={true} />
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center overflow-hidden">{renderStage()}</main>
    </div>
  )
}
