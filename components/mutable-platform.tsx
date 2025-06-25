"use client"

import { useState, useCallback } from "react"
import type { Connection } from "@solana/web3.js"
import type { Client as ColyseusClient, Room } from "colyseus.js"
import type { usePlayerState } from "@/hooks/usePlayerState"
import { GameSelection } from "@/components/pvp-game/game-selection"
import MatchmakingLobby from "@/components/pvp-game/matchmaking-lobby" // Default import
import { MutableMarketplace } from "@/components/mutable-marketplace" // Default import
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { CyberpunkTabs, CyberpunkTabsList, CyberpunkTabsTrigger } from "@/components/cyberpunk-ui/cyberpunk-tabs"
import { withClickSound } from "@/utils/sound-utils"
import { debugManager } from "@/utils/debug-utils"
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
  connection: Connection
  colyseusClient: ColyseusClient | null
  hubRoom: Room | null
  playerState: ReturnType<typeof usePlayerState>["playerState"]
  setPlayerState: ReturnType<typeof usePlayerState>["setPlayerState"]
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

  // State to manage which view is active: game selection or matchmaking lobby
  const [currentView, setCurrentView] = useState<"game-selection" | "matchmaking-lobby" | "marketplace">(
    "game-selection",
  )
  const [selectedGameId, setSelectedGameId] = useState<string | undefined>(undefined)

  // Callback for when a game is selected from the GameSelection component
  const handleSelectGame = useCallback((gameId: string) => {
    setSelectedGameId(gameId)
    setCurrentView("matchmaking-lobby")
    debugManager.logInfo("MutablePlatform", `Selected game: ${gameId}, transitioning to lobby.`)
  }, [])

  // Callback for when the user exits the matchmaking lobby
  const handleExitLobby = useCallback(() => {
    setCurrentView("game-selection")
    setSelectedGameId(undefined)
    debugManager.logInfo("MutablePlatform", "Exited lobby, returning to game selection.")
  }, [])

  // Define the tabs content
  const tabsContent = [
    {
      value: "games",
      label: "GAMES",
      component: (
        <GameSelection
          publicKey={publicKey}
          balance={balance}
          mutbBalance={playerState.mutbBalance} // Ensure mutbBalance is passed
          onSelectGame={handleSelectGame}
        />
      ),
    },
    {
      value: "marketplace",
      label: "MARKETPLACE",
      component: (
        <MutableMarketplace
          publicKey={publicKey}
          balance={balance}
          mutbBalance={playerState.mutbBalance}
          provider={provider}
          connection={connection}
        />
      ),
    },
  ]

  const TabComponent = isCyberpunk ? CyberpunkTabs : Tabs
  const TabListComponent = isCyberpunk ? CyberpunkTabsList : TabsList
  const TabTriggerComponent = isCyberpunk ? CyberpunkTabsTrigger : TabsTrigger
  const TabContentComponent = TabsContent // Standard TabsContent is fine

  const getPlayerName = () => {
    if (!publicKey) return "Player"
    return "Player_" + publicKey.substring(0, 4)
  }

  const handleDeveloperContact = () => {
    // Track developer contact event
    log("developer_contact", { source: "develop_tab" })
    window.location.href =
      "mailto:mutablepvp@gmail.com?subject=Game%20Developer%20Submission&body=I'm%20interested%20in%20developing%20a%20game%20for%20the%20Mutable%20platform.%0A%0AGame%20Name:%20%0AGame%20Type:%20%0ABrief%20Description:%20%0A%0AThank%20you!"
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {currentView === "game-selection" ? (
        <TabComponent defaultValue="games" className="w-full">
          <TabListComponent className={isCyberpunk ? "cyber-tab-list" : "mb-4 border-2 border-black bg-[#FFD54F]"}>
            {tabsContent.map((tab) => (
              <TabTriggerComponent
                key={tab.value}
                value={tab.value}
                className={
                  isCyberpunk ? "cyber-tab" : "data-[state=active]:bg-white data-[state=active]:text-black font-mono"
                }
                onClick={withClickSound()}
              >
                {tab.label}
              </TabTriggerComponent>
            ))}
          </TabListComponent>
          {tabsContent.map((tab) => (
            <TabContentComponent key={tab.value} value={tab.value}>
              {tab.component}
            </TabContentComponent>
          ))}
        </TabComponent>
      ) : (
        <MatchmakingLobby
          publicKey={publicKey}
          playerName={getPlayerName()}
          mutbBalance={playerState.mutbBalance}
          onExit={handleExitLobby}
          selectedGame={selectedGameId}
        />
      )}
    </div>
  )
}
