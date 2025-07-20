"use client"

import { useState, useEffect } from "react"
import { gameRegistry } from "@/types/game-registry"
import { useToast } from "@/hooks/use-toast"
import GameErrorBoundary from "@/components/game-error-boundary"
import { debugManager } from "@/utils/debug-utils"
import { cyberpunkColors } from "@/styles/cyberpunk-theme"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import GameControllerEnhanced from "@/components/pvp-game/game-controller-enhanced"
import { usePlatform } from "@/contexts/platform-context"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { Badge } from "@/components/ui/badge"

// Cyberpunk styled components for the game container
const CyberpunkGameContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: ${cyberpunkColors.background.dark};
  border: 1px solid ${cyberpunkColors.border.cyan};
  box-shadow: 0 0 15px ${cyberpunkColors.shadow.cyan};
  overflow: hidden;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, 
      transparent, 
      ${cyberpunkColors.primary.cyan}, 
      transparent
    );
    z-index: 1;
  }
  
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, 
      ${cyberpunkColors.primary.magenta}, 
      ${cyberpunkColors.primary.cyan}
    );
    z-index: 1;
  }
`

const CyberpunkDevBanner = styled.div`
  width: 100%;
  background: linear-gradient(90deg, 
    ${cyberpunkColors.primary.magenta}80, 
    ${cyberpunkColors.primary.cyan}80
  );
  color: ${cyberpunkColors.text.primary};
  font-family: monospace;
  font-weight: bold;
  text-transform: uppercase;
  text-align: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-bottom: 2px solid ${cyberpunkColors.border.cyanBright};
  letter-spacing: 1px;
  text-shadow: 0 0 5px ${cyberpunkColors.primary.cyan};
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    animation: ${keyframes`
      from { left: -100%; }
      to { left: 200%; }
    `} 3s linear infinite;
  }
`

const PlatformBadge = styled(Badge)`
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.2) 0%, rgba(255, 0, 255, 0.2) 100%);
  border: 1px solid rgba(0, 255, 255, 0.5);
  color: #0ff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  font-family: monospace;
  font-weight: bold;
  font-size: 0.6rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`

const pulseAnimation = keyframes`
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 15px ${cyberpunkColors.primary.cyan}, 0 0 30px ${cyberpunkColors.primary.cyan}80;
  }
  50% {
    opacity: 0.7;
    box-shadow: 0 0 25px ${cyberpunkColors.primary.magenta}, 0 0 40px ${cyberpunkColors.primary.magenta}80;
  }
`

const CyberpunkLoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 600px;
  background-color: ${cyberpunkColors.background.darker};
  color: ${cyberpunkColors.text.primary};
  border: 1px solid ${cyberpunkColors.border.cyan};
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(0deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 20px 20px;
    transform: perspective(500px) rotateX(60deg);
    transform-origin: center bottom;
    opacity: 0.3;
  }
`

const CyberpunkSpinner = styled.div`
  width: 60px;
  height: 60px;
  margin-bottom: 20px;
  border: 3px solid transparent;
  border-top-color: ${cyberpunkColors.primary.cyan};
  border-right-color: ${cyberpunkColors.primary.magenta};
  border-radius: 50%;
  animation: ${keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  `} 1s linear infinite;
  box-shadow: 0 0 15px ${cyberpunkColors.shadow.cyan};
`

const CyberpunkLoadingText = styled.p`
  font-size: 1.5rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: ${cyberpunkColors.text.cyan};
  text-shadow: 0 0 10px ${cyberpunkColors.shadow.cyan};
  animation: ${pulseAnimation} 2s infinite;
  
  &::after {
    content: "...";
    animation: ${keyframes`
      0% { content: "."; }
      33% { content: ".."; }
      66% { content: "..."; }
      100% { content: "."; }
    `} 1.5s infinite;
  }
`

interface GameContainerProps {
  gameId: string
  playerId: string
  playerName: string
  isHost: boolean
  gameMode: string
  onGameEnd: (winner: string | null) => void
}

export function GameContainer({ gameId, playerId, playerName, isHost, gameMode, onGameEnd }: GameContainerProps) {
  const [gameState, setGameState] = useState<"loading" | "playing" | "ended">("loading")
  const { toast } = useToast()
  const { platformType } = usePlatform()
  const { styleMode } = useCyberpunkTheme()

  const isCyberpunk = styleMode === "cyberpunk"

  const game = gameRegistry.getGame(gameId)

  useEffect(() => {
    debugManager.logInfo("GameContainer", "Initializing game container", {
      gameId,
      playerId,
      playerName,
      isHost,
      gameMode,
      platformType,
    })
    const timer = setTimeout(() => {
      setGameState("playing")
      debugManager.logInfo("GameContainer", "Game state set to playing")
    }, 500)
    return () => clearTimeout(timer)
  }, [gameId, playerId, playerName, isHost, gameMode, platformType])

  const handleError = (error: Error) => {
    console.error("Game error:", error)
    toast({
      title: "System Error",
      description: error.message,
      variant: "destructive",
    })
  }

  if (!game) {
    const NotFoundComponent = isCyberpunk ? (
      <CyberpunkLoadingContainer>
        <CyberpunkLoadingText>Game not found</CyberpunkLoadingText>
      </CyberpunkLoadingContainer>
    ) : (
      <div className="flex items-center justify-center h-[600px] bg-muted rounded-lg border">
        <div className="text-center">
          <p className="text-xl font-bold text-muted-foreground">Game not found</p>
        </div>
      </div>
    )
    return NotFoundComponent
  }

  if (gameState === "loading") {
    const LoadingComponent = isCyberpunk ? (
      <CyberpunkLoadingContainer>
        <CyberpunkSpinner />
        <CyberpunkLoadingText>Loading Game</CyberpunkLoadingText>
      </CyberpunkLoadingContainer>
    ) : (
      <div className="flex items-center justify-center h-[600px] bg-muted rounded-lg border">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xl font-bold">Loading Game...</p>
        </div>
      </div>
    )
    return LoadingComponent
  }

  // Simplified logic: Always use GameControllerEnhanced for archer-arena
  // Other games can have their own logic
  const GameContent =
    game.id === "archer-arena" || game.id === "last-stand" ? (
      <GameControllerEnhanced
        playerId={playerId}
        playerName={playerName}
        isHost={isHost}
        gameMode={gameMode}
        onGameEnd={onGameEnd}
        platformType={platformType}
        gameId={gameId}
        onGameStart={() => {}}
        onGamePause={() => {}}
        onGameReset={() => {}}
        onGameStop={() => {}}
      />
    ) : (
      <div className="text-white">Game component for {game.name} not implemented here.</div>
    )

  // The GameControllerEnhanced will handle mobile vs desktop rendering internally
  return <GameErrorBoundary>{GameContent}</GameErrorBoundary>
}

// Export as default
export default GameContainer
