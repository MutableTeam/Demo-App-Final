"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GameSelection } from "@/components/pvp-game/game-selection"
import { MutableMarketplace } from "@/components/mutable-marketplace"
import { LiquidityPoolStatus } from "@/components/swap/liquidity-pool-status"
import { TokenSwapForm } from "@/components/swap/token-swap-form"
import { MarketOverview } from "@/components/swap/market-overview"
import { TransactionHistory } from "@/components/swap/transaction-history"
import { SwapSettings } from "@/components/swap/swap-settings"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import type { ColyseusClient, Room } from "colyseus.js"
import type { PlayerState } from "@/hooks/usePlayerState"
import { GameLobbyBrowser } from "./game-lobby-browser" // Import the new component
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"

// Cyberpunk styled components
const glitchAnim1 = keyframes`
  0% {
    clip-path: inset(40% 0 61% 0);
    transform: translate(-2px, 2px);
  }
  20% {
    clip-path: inset(92% 0 1% 0);
    transform: translate(1px, 3px);
  }
  40% {
    clip-path: inset(43% 0 1% 0);
    transform: translate(-1px, -3px);
  }
  60% {
    clip-path: inset(25% 0 58% 0);
    transform: translate(3px, 1px);
  }
  80% {
    clip-path: inset(54% 0 7% 0);
    transform: translate(-3px, -2px);
  }
  100% {
    clip-path: inset(58% 0 43% 0);
    transform: translate(2px, -1px);
  }
`

const glitchAnim2 = keyframes`
  0% {
    clip-path: inset(24% 0 29% 0);
    transform: translate(2px, -2px);
  }
  20% {
    clip-path: inset(54% 0 26% 0);
    transform: translate(-3px, 1px);
  }
  40% {
    clip-path: inset(9% 0 38% 0);
    transform: translate(1px, 3px);
  }
  60% {
    clip-path: inset(23% 0 75% 0);
    transform: translate(3px, -1px);
  }
  80% {
    clip-path: inset(74% 0 26% 0);
    transform: translate(-2px, 2px);
  }
  100% {
    clip-path: inset(46% 0 11% 0);
    transform: translate(2px, -2px);
  }
`

const flickerAnim = keyframes`
  0% {
    opacity: 0.1;
  }
  2% {
    opacity: 0.9;
  }
  4% {
    opacity: 0.3;
  }
  8% {
    opacity: 0.8;
  }
  70% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
`

const CyberTabsList = styled(TabsList)`
  background: rgba(10, 10, 40, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  margin-bottom: 1.5rem;
  
  &::before, &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.2;
    pointer-events: none;
    z-index: 1;
  }
  
  &::before {
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.2), transparent);
    animation: ${flickerAnim} 4s linear infinite;
  }
  
  &::after {
    background: linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.2), transparent);
    animation: ${flickerAnim} 7s linear infinite reverse;
  }
`

const CyberTabsTrigger = styled(TabsTrigger)`
  color: rgba(150, 200, 255, 0.7);
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  &[data-state="active"] {
    color: rgba(0, 255, 255, 0.9);
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
    background: transparent;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: rgba(0, 255, 255, 0.8);
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
    }
    
    // Glitch effect for active tab
    &::before {
      content: attr(data-value);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      color: rgba(255, 0, 255, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      animation: ${glitchAnim1} 4s infinite linear alternate-reverse;
      z-index: -1;
      opacity: 0.5;
    }
  }
  
  &:hover:not([data-state="active"]) {
    color: rgba(150, 220, 255, 0.9);
    background: rgba(0, 100, 200, 0.1);
    
    // Glitch effect on hover
    &::before {
      content: attr(data-value);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      color: rgba(0, 255, 255, 0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      animation: ${glitchAnim2} 3s infinite linear alternate-reverse;
      z-index: -1;
      opacity: 0.3;
    }
  }
`

// Add responsive styles for tabs
const tabStyles = {
  container: "sticky top-0 z-30 bg-opacity-100 w-full",
  list: "mb-6 border-2 border-black bg-[#FFD54F] dark:bg-[#D4AF37] dark:border-gray-700 w-full grid grid-cols-4 p-0 h-auto",
  trigger:
    "data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white font-mono py-2 px-1 h-auto flex flex-col items-center justify-center text-center",
}

interface MutablePlatformProps {
  publicKey: string
  balance: number | null
  provider: any
  connection: any
  colyseusClient: ColyseusClient | null // Added Colyseus client
  hubRoom: Room | null // Added hub room
  playerState: PlayerState // Added player state
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>> // Added setPlayerState
  log: (message: string, type?: "info" | "error" | "success") => void // Added logger
  availableRooms: any[] // Added available rooms
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
  const [activeTab, setActiveTab] = useState("games")
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const { theme } = useTheme()

  const isCyberpunk = theme === "cyberpunk"

  const handleGameSelect = useCallback((gameId: string) => {
    setSelectedGame(gameId)
    setActiveTab("lobby") // Automatically switch to lobby tab
  }, [])

  const handleBackToGames = useCallback(() => {
    setSelectedGame(null)
    setActiveTab("games")
  }, [])

  return (
    <div
      className={cn(
        "w-full max-w-6xl mx-auto p-4 md:p-8 rounded-lg shadow-lg",
        isCyberpunk ? "cyberpunk-card-border bg-cyberpunk-bg text-cyberpunk-text" : "bg-white text-gray-900",
      )}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className={cn("grid w-full grid-cols-3", isCyberpunk ? "cyberpunk-tabs-list" : "bg-gray-100 text-gray-700")}
        >
          <TabsTrigger
            value="games"
            className={cn(
              isCyberpunk ? "cyberpunk-tabs-trigger" : "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
            )}
          >
            Games
          </TabsTrigger>
          <TabsTrigger
            value="marketplace"
            className={cn(
              isCyberpunk ? "cyberpunk-tabs-trigger" : "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
            )}
          >
            Marketplace
          </TabsTrigger>
          <TabsTrigger
            value="swap"
            className={cn(
              isCyberpunk ? "cyberpunk-tabs-trigger" : "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
            )}
          >
            Swap
          </TabsTrigger>
        </TabsList>
        <TabsContent value="games" className="mt-4">
          <Card
            className={cn(
              isCyberpunk ? "cyberpunk-card-border bg-cyberpunk-bg text-cyberpunk-text" : "bg-white text-gray-900",
            )}
          >
            <CardHeader>
              <CardTitle className={cn(isCyberpunk ? "text-cyberpunk-accent" : "text-gray-800")}>
                Game Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GameSelection onGameSelect={handleGameSelect} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="lobby" className="mt-4">
          <Card
            className={cn(
              isCyberpunk ? "cyberpunk-card-border bg-cyberpunk-bg text-cyberpunk-text" : "bg-white text-gray-900",
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className={cn(isCyberpunk ? "text-cyberpunk-accent" : "text-gray-800")}>
                {selectedGame ? `${selectedGame} Lobby` : "Game Lobby"}
              </CardTitle>
              <Button
                onClick={handleBackToGames}
                className={cn(isCyberpunk ? "cyberpunk-button" : "bg-blue-500 hover:bg-blue-600 text-white")}
              >
                Back to Games
              </Button>
            </CardHeader>
            <CardContent>
              {selectedGame ? (
                <GameLobbyBrowser
                  gameId={selectedGame}
                  username={playerState.username}
                  colyseusClient={colyseusClient}
                  hubRoom={hubRoom}
                  playerState={playerState}
                  setPlayerState={setPlayerState}
                  log={log}
                  availableRooms={availableRooms}
                />
              ) : (
                <p className={cn(isCyberpunk ? "text-cyberpunk-text" : "text-gray-700")}>
                  Please select a game to view its lobby.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="marketplace" className="mt-4">
          <MutableMarketplace publicKey={publicKey} balance={balance} provider={provider} connection={connection} />
        </TabsContent>
        <TabsContent value="swap" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className={cn(
                isCyberpunk ? "cyberpunk-card-border bg-cyberpunk-bg text-cyberpunk-text" : "bg-white text-gray-900",
              )}
            >
              <CardHeader>
                <CardTitle className={cn(isCyberpunk ? "text-cyberpunk-accent" : "text-gray-800")}>
                  Token Swap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TokenSwapForm publicKey={publicKey} connection={connection} />
              </CardContent>
            </Card>
            <Card
              className={cn(
                isCyberpunk ? "cyberpunk-card-border bg-cyberpunk-bg text-cyberpunk-text" : "bg-white text-gray-900",
              )}
            >
              <CardHeader>
                <CardTitle className={cn(isCyberpunk ? "text-cyberpunk-accent" : "text-gray-800")}>
                  Market Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MarketOverview />
              </CardContent>
            </Card>
            <Card
              className={cn(
                isCyberpunk ? "cyberpunk-card-border bg-cyberpunk-bg text-cyberpunk-text" : "bg-white text-gray-900",
              )}
            >
              <CardHeader>
                <CardTitle className={cn(isCyberpunk ? "text-cyberpunk-accent" : "text-gray-800")}>
                  Liquidity Pool Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LiquidityPoolStatus />
              </CardContent>
            </Card>
            <Card
              className={cn(
                isCyberpunk ? "cyberpunk-card-border bg-cyberpunk-bg text-cyberpunk-text" : "bg-white text-gray-900",
              )}
            >
              <CardHeader>
                <CardTitle className={cn(isCyberpunk ? "text-cyberpunk-accent" : "text-gray-800")}>
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionHistory />
              </CardContent>
            </Card>
            <Card
              className={cn(
                isCyberpunk ? "cyberpunk-card-border bg-cyberpunk-bg text-cyberpunk-text" : "bg-white text-gray-900",
              )}
            >
              <CardHeader>
                <CardTitle className={cn(isCyberpunk ? "text-cyberpunk-accent" : "text-gray-800")}>
                  Swap Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SwapSettings />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
