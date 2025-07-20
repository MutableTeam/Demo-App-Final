"use client"

import { useState, useEffect, type ReactNode } from "react"
import { gameRegistry } from "@/types/game-registry"
import { useToast } from "@/hooks/use-toast"
import GameErrorBoundary from "@/components/game-error-boundary"
import { cyberpunkColors } from "@/styles/cyberpunk-theme"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import GameControllerEnhanced from "@/components/pvp-game/game-controller-enhanced"
import { usePlatform } from "@/contexts/platform-context"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { Badge } from "@/components/ui/badge"
import { Monitor, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"

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

// Redesigned Cyberpunk Container for a consistent, polished desktop experience
const CyberpunkGameWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: #0a0a14;
  border: 2px solid ${cyberpunkColors.border.cyan};
  box-shadow: 0 0 25px ${cyberpunkColors.shadow.cyan}, inset 0 0 15px ${cyberpunkColors.shadow.cyan + "40"};
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  &::before, &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, transparent, ${cyberpunkColors.primary.cyan}, transparent);
    animation: ${keyframes`0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; }`} 4s linear infinite;
  }
  
  &::before { top: -2px; }
  &::after { bottom: -2px; }
`

const CyberpunkHeaderBar = styled.div`
  width: 100%;
  background: linear-gradient(90deg, ${cyberpunkColors.primary.magenta}30, ${cyberpunkColors.primary.cyan}30);
  color: ${cyberpunkColors.text.primary};
  font-family: 'Orbitron', sans-serif;
  font-weight: bold;
  text-transform: uppercase;
  text-align: center;
  padding: 0.75rem;
  border-bottom: 2px solid ${cyberpunkColors.border.cyanBright};
  letter-spacing: 2px;
  text-shadow: 0 0 8px ${cyberpunkColors.primary.cyan};
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const GameScreen = styled.div`
  flex-grow: 1;
  background-color: #000;
  border: 1px solid ${cyberpunkColors.border.cyan + "80"};
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`

interface GameContainerProps {
  gameId: string
  playerId: string
  playerName: string
  isHost: boolean
  gameMode: string
  onGameEnd: (winner: string | null) => void
  children: ReactNode
}

export function GameContainer({
  gameId,
  playerId,
  playerName,
  isHost,
  gameMode,
  onGameEnd,
  children,
}: GameContainerProps) {
  const [gameState, setGameState] = useState<"loading" | "playing" | "ended">("loading")
  const { toast } = useToast()
  const { platformType } = usePlatform()
  const { styleMode } = useCyberpunkTheme()

  const isCyberpunk = styleMode === "cyberpunk"

  // Get the game from registry
  const game = gameRegistry.getGame(gameId)

  useEffect(() => {
    // Set game to playing state after a short delay to ensure proper initialization
    const timer = setTimeout(() => {
      setGameState("playing")
    }, 500)

    return () => clearTimeout(timer)
  }, [gameId, playerId, playerName, isHost, gameMode, platformType])

  if (!game) {
    if (isCyberpunk) {
      return (
        <CyberpunkLoadingContainer>
          <CyberpunkLoadingText>Game not found</CyberpunkLoadingText>
        </CyberpunkLoadingContainer>
      )
    }

    return (
      <div className="flex items-center justify-center h-[600px] bg-muted rounded-lg border">
        <div className="text-center">
          <p className="text-xl font-bold text-muted-foreground">Game not found</p>
        </div>
      </div>
    )
  }

  const GameComponent = game.GameComponent

  const handleError = (error: Error) => {
    console.error("Game error:", error)
    toast({
      title: "System Error",
      description: error.message,
      variant: "destructive",
    })
  }

  // Initialize game state
  const initialGameState = game.initializeGameState({
    playerId,
    playerName,
    isHost,
    gameMode,
    players: [
      { id: playerId, name: playerName, isHost },
      // Mock players for testing
      { id: "ai-1", name: "AI Player 1", isHost: false },
      { id: "ai-2", name: "AI Player 2", isHost: false },
      { id: "ai-3", name: "AI Player 3", isHost: false },
    ],
  })

  // Cyberpunk styled loading state
  if (gameState === "loading") {
    if (isCyberpunk) {
      return (
        <CyberpunkLoadingContainer>
          <CyberpunkSpinner />
          <CyberpunkLoadingText>Loading Game</CyberpunkLoadingText>
        </CyberpunkLoadingContainer>
      )
    }

    return (
      <div className="flex items-center justify-center h-[600px] bg-muted rounded-lg border">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xl font-bold">Loading Game...</p>
        </div>
      </div>
    )
  }

  // Render game container based on style mode
  if (isCyberpunk) {
    return (
      <CyberpunkGameWrapper>
        {/* Development Banner with Platform Info */}
        <CyberpunkDevBanner>
          <span>Demo Game : Does Not Represent Final Product</span>
          <PlatformBadge>
            {platformType === "desktop" ? (
              <>
                <Monitor className="h-3 w-3" />
                Desktop Mode
              </>
            ) : (
              <>
                <Smartphone className="h-3 w-3" />
                Mobile Mode
              </>
            )}
          </PlatformBadge>
        </CyberpunkDevBanner>

        <GameErrorBoundary>
          {game.id === "archer-arena" || game.id === "last-stand" ? (
            <GameControllerEnhanced
              playerId={playerId}
              playerName={playerName}
              isHost={isHost}
              gameMode={gameMode}
              onGameEnd={onGameEnd}
              platformType={platformType}
            />
          ) : (
            <GameComponent
              playerId={playerId}
              playerName={playerName}
              isHost={isHost}
              gameMode={gameMode}
              initialGameState={initialGameState}
              onGameEnd={onGameEnd}
              onError={handleError}
              platformType={platformType}
            />
          )}
        </GameErrorBoundary>
      </CyberpunkGameWrapper>
    )
  }

  // Light/Dark theme version
  return (
    <div className="w-full h-full relative bg-background border rounded-lg overflow-hidden">
      {/* Development Banner with Platform Info */}
      <div className={cn("flex items-center justify-between p-3 border-b", "bg-muted/50 border-border")}>
        <span className="text-sm font-medium">Demo Game : Does Not Represent Final Product</span>
        <Badge variant="outline" className="flex items-center gap-1">
          {platformType === "desktop" ? (
            <>
              <Monitor className="h-3 w-3" />
              Desktop Mode
            </>
          ) : (
            <>
              <Smartphone className="h-3 w-3" />
              Mobile Mode
            </>
          )}
        </Badge>
      </div>

      <GameErrorBoundary>
        {game.id === "archer-arena" || game.id === "last-stand" ? (
          <GameControllerEnhanced
            playerId={playerId}
            playerName={playerName}
            isHost={isHost}
            gameMode={gameMode}
            onGameEnd={onGameEnd}
            platformType={platformType}
          />
        ) : (
          <GameComponent
            playerId={playerId}
            playerName={playerName}
            isHost={isHost}
            gameMode={gameMode}
            initialGameState={initialGameState}
            onGameEnd={onGameEnd}
            onError={handleError}
            platformType={platformType}
          />
        )}
      </GameErrorBoundary>
    </div>
  )
}

// Export as default
export default GameContainer
