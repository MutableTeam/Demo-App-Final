"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Code, ArrowUpDown } from "lucide-react"
import MutableMarketplace from "./mutable-marketplace"
import GameSelection from "./pvp-game/game-selection"
import WaitingRoom from "./pvp-game/waiting-room"
import GameControllerEnhanced from "./pvp-game/game-controller-enhanced"
import { TokenSwapForm } from "@/components/swap/token-swap-form"
import { MarketOverview } from "@/components/swap/market-overview"
import { TransactionHistory } from "@/components/swap/transaction-history"
import { LiquidityPoolStatus } from "@/components/swap/liquidity-pool-status"
import { SwapSettings } from "@/components/swap/swap-settings"
import { MultiWalletConnector } from "@/components/multi-wallet-connector"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Connection } from "@solana/web3.js"
import { withClickSound } from "@/utils/sound-utils"
import { trackEvent } from "@/utils/analytics"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import { Separator } from "@/components/ui/separator"

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
  connection: Connection
  className?: string
}

export default function MutablePlatform({ publicKey, balance, provider, connection, className }: MutablePlatformProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  const [activeTab, setActiveTab] = useState("exchange")
  const [gameState, setGameState] = useState<"selection" | "waiting" | "playing">("selection")
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [mutbBalance, setMutbBalance] = useState<number>(100) // Mock MUTB balance
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  // Local state to track balance changes without waiting for blockchain updates
  const [localBalance, setLocalBalance] = useState<number | null>(balance)

  // Update useEffect to sync localBalance with balance from props
  useEffect(() => {
    setLocalBalance(balance)
  }, [balance])

  const getPlayerName = () => {
    if (!publicKey) return "Player"
    return "Player_" + publicKey.substring(0, 4)
  }

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId)
    setGameState("waiting")
  }

  const handleGameStart = () => {
    setGameState("playing")
  }

  const handleGameEnd = () => {
    setGameState("selection")
    setSelectedGame(null)
  }

  const handleDeveloperContact = () => {
    // Track developer contact event
    trackEvent("developer_contact", { source: "develop_tab" })
    window.location.href =
      "mailto:mutablepvp@gmail.com?subject=Game%20Developer%20Submission&body=I'm%20interested%20in%20developing%20a%20game%20for%20the%20Mutable%20platform.%0A%0AGame%20Name:%20%0AGame%20Type:%20%0ABrief%20Description:%20%0A%0AThank%20you!"
  }

  const renderGameContent = () => {
    switch (gameState) {
      case "waiting":
        return (
          <WaitingRoom
            gameId={selectedGame || ""}
            onGameStart={handleGameStart}
            onCancel={() => setGameState("selection")}
          />
        )
      case "playing":
        return <GameControllerEnhanced gameId={selectedGame || ""} onGameEnd={handleGameEnd} />
      default:
        return <GameSelection onGameSelect={handleGameSelect} />
    }
  }

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/images/mutable-logo-transparent.png" alt="Mutable" className="h-8 w-auto" />
              <h1 className="text-2xl font-bold">Mutable Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">Beta</Badge>
              <ThemeToggle size="sm" />
              <MultiWalletConnector
                onConnect={() => setIsWalletConnected(true)}
                onDisconnect={() => setIsWalletConnected(false)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className={isCyberpunk ? "" : tabStyles.container}>
            {isCyberpunk ? (
              <CyberTabsList className="w-full grid grid-cols-3">
                <CyberTabsTrigger value="exchange" data-value="EXCHANGE" onClick={withClickSound()}>
                  <ArrowUpDown className="h-4 w-4 mb-1 mx-auto" />
                  <span className="text-xs sm:text-sm whitespace-normal text-center">EXCHANGE</span>
                </CyberTabsTrigger>
                <CyberTabsTrigger value="games" data-value="GAMES" onClick={withClickSound()}>
                  <Gamepad2 className="h-4 w-4 mb-1 mx-auto" />
                  <span className="text-xs sm:text-sm whitespace-normal text-center">GAMES</span>
                </CyberTabsTrigger>
                <CyberTabsTrigger value="develop" data-value="DEVELOP" onClick={withClickSound()}>
                  <Code className="h-4 w-4 mb-1 mx-auto" />
                  <span className="text-xs sm:text-sm whitespace-normal text-center">DEVELOP</span>
                </CyberTabsTrigger>
              </CyberTabsList>
            ) : (
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="exchange" className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Exchange
                </TabsTrigger>
                <TabsTrigger value="games" className="flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  Games
                </TabsTrigger>
                <TabsTrigger value="develop" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Develop
                </TabsTrigger>
              </TabsList>
            )}
          </div>

          <TabsContent
            value="exchange"
            className={cn("mt-0 h-full min-h-[500px] pt-4", isCyberpunk && "rounded-lg py-4 px-0")}
            style={
              isCyberpunk
                ? {
                    color: "rgb(224, 255, 255) !important",
                  }
                : {}
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <TokenSwapForm />
                <MarketOverview />
              </div>
              <div className="space-y-6">
                <LiquidityPoolStatus />
                <SwapSettings />
                <TransactionHistory />
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="games"
            className={cn("mt-0 h-full min-h-[500px] pt-4", isCyberpunk && "rounded-lg py-4 px-0")}
            style={
              isCyberpunk
                ? {
                    color: "rgb(224, 255, 255) !important",
                  }
                : {}
            }
          >
            {renderGameContent()}
          </TabsContent>

          <TabsContent
            value="develop"
            className={cn("mt-0 h-full min-h-[500px] pt-4", isCyberpunk && "rounded-lg py-4 px-0")}
            style={
              isCyberpunk
                ? {
                    color: "rgb(224, 255, 255) !important",
                  }
                : {}
            }
          >
            <MutableMarketplace />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <img src="/images/mutable-logo-transparent.png" alt="Mutable" className="h-8 w-auto" />
              <p className="text-sm text-muted-foreground">The future of Web3 gaming on Solana</p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Games
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Exchange
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Marketplace
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Developers</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    SDK
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Community</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">© 2024 Mutable Platform. All rights reserved.</p>
            <div className="flex space-x-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground">
                Terms
              </a>
              <a href="#" className="hover:text-foreground">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
