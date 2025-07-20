"use client"

import { useState } from "react"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import MutableMarketplace from "./mutable-marketplace"
import TokenSwapInterface from "./token-swap-interface"
import GameSelection from "./pvp-game/game-selection"
import UserProfile from "./user-profile"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import { usePlatform } from "@/contexts/platform-context"
import { CyberpunkHeader } from "@/components/cyberpunk-header"
import { CyberpunkFooter } from "@/components/cyberpunk-footer"
import { GameContainer } from "@/components/game-container"
import MobileGameContainer from "@/components/mobile-game-container"
import { gameRegistry } from "@/types/game-registry"
import GameControllerEnhanced from "@/components/pvp-game/game-controller-enhanced"

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

type MutableTab = "exchange" | "games" | "develop" | "profile"

export default function MutablePlatform() {
  const [activeTab, setActiveTab] = useState<MutableTab>("games")
  const [gameId, setGameId] = useState<string | null>(null)
  const [gameMode, setGameMode] = useState<string>("casual")
  const { platformType } = usePlatform()
  const { styleMode } = useCyberpunkTheme()

  const handleGameSelect = (selectedGameId: string, selectedGameMode: string) => {
    setGameId(selectedGameId)
    setGameMode(selectedGameMode)
  }

  const handleGameEnd = () => {
    setGameId(null)
  }

  const renderContent = () => {
    if (gameId) {
      const game = gameRegistry.getGame(gameId)
      if (!game) return <div>Game not found!</div>

      const gameComponent = (
        <GameControllerEnhanced
          playerId="Player_Test"
          playerName="Player_Test"
          isHost={true}
          gameMode={gameMode}
          onGameEnd={handleGameEnd}
          platformType={platformType}
        />
      )

      // **FIXED: This is the core logic change.**
      // It now correctly chooses which container to use based on the platform selection.
      if (platformType === "mobile") {
        return (
          <MobileGameContainer
            onJoystickMove={(direction) => console.log("Move:", direction)}
            onActionPress={(action, pressed) => console.log("Action:", action, pressed)}
          >
            {gameComponent}
          </MobileGameContainer>
        )
      }

      // Default to desktop container
      return (
        <GameContainer
          gameId={gameId}
          playerId="Player_Test"
          playerName="Player_Test"
          isHost={true}
          gameMode={gameMode}
          onGameEnd={handleGameEnd}
        >
          {gameComponent}
        </GameContainer>
      )
    }

    switch (activeTab) {
      case "exchange":
        return <TokenSwapInterface />
      case "games":
        return <GameSelection onGameSelect={handleGameSelect} />
      case "develop":
        return <MutableMarketplace />
      case "profile":
        return <UserProfile />
      default:
        return <GameSelection onGameSelect={handleGameSelect} />
    }
  }

  return (
    <div
      className={cn(
        "min-h-screen w-full flex flex-col",
        styleMode === "cyberpunk" ? "bg-black text-cyan-300" : "bg-background text-foreground",
      )}
    >
      <CyberpunkHeader activeTab={activeTab} setActiveTab={setActiveTab} onLogoClick={() => setGameId(null)} />
      <main className="flex-grow container mx-auto px-4 py-8">{renderContent()}</main>
      <CyberpunkFooter />
    </div>
  )
}
