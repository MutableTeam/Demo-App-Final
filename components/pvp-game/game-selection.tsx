"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import LastStandGameLauncher from "@/games/last-stand/game-launcher"
import PixelPoolGameLauncher from "@/games/pixel-pool/game-launcher"
import { usePlatform } from "@/contexts/platform-context"
import MobileGameContainer from "@/components/mobile-game-container"
import DesktopGameContainer from "@/components/desktop-game-container"
import { keyframes, styled } from "@/lib/styled" // Import keyframes and styled

// Define breakpoints locally to avoid import issues
const breakpoints = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

// Define media queries directly in this file to avoid import issues
const mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.md - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  desktop: `@media (min-width: ${breakpoints.lg}px)`,
  touch: "@media (hover: none) and (pointer: coarse)",
}

// Cyberpunk animations
const cardHover = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 10px rgba(255, 0, 255, 0.5), 0 0 20px rgba(255, 0, 255, 0.3);
  }
  100% {
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.3);
  }
`

const imageGlow = keyframes`
  0% {
    filter: drop-shadow(0 0 2px rgba(0, 255, 255, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 5px rgba(255, 0, 255, 0.5));
  }
  100% {
    filter: drop-shadow(0 0 2px rgba(0, 255, 255, 0.5));
  }
`

const buttonGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.7), 0 0 10px rgba(0, 255, 255, 0.5);
    border-color: rgba(0, 255, 255, 0.8);
  }
  50% {
    box-shadow: 0 0 8px rgba(255, 0, 255, 0.7), 0 0 15px rgba(255, 0, 255, 0.5);
    border-color: rgba(255, 0, 255, 0.8);
  }
`

const CyberGameCard = styled(Card)`
  background: rgba(16, 16, 48, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  
  /* Mobile optimizations */
  ${mediaQueries.mobile} {
    /* Reduce animation complexity on mobile */
    animation-duration: 50% !important;
    transition-duration: 50% !important;
    
    /* Ensure touch targets are large enough */
    & button {
      min-height: 44px;
    }
  }
  
  /* Desktop optimizations */
  ${mediaQueries.desktop} {
    min-height: 320px;
    max-height: 380px;
  }
  
  /* Always apply hover effects, regardless of flip state */
  &:hover, &.flipped:hover {
    transform: translateY(-5px);
    animation: ${cardHover} 3s infinite alternate;
    
    .game-image {
      animation: ${imageGlow} 2s infinite alternate;
    }
    
    .cyber-play-button {
      background: linear-gradient(90deg, #0ff 20%, #f0f 80%);
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.7);
      color: #000;
      font-weight: bold;
    }
  }
  
  /* Disable hover effects on touch devices */
  ${mediaQueries.touch} {
    &:hover, &.flipped:hover {
      transform: none;
      animation: none;
      
      .game-image {
        animation: none;
      }
    }
    
    /* Add active state for touch feedback instead */
    &:active {
      transform: scale(0.98);
      opacity: 0.95;
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.8), transparent);
    z-index: 1;
  }
`

const CyberPlayButton = styled(Button)`
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.2) 0%, rgba(255, 0, 255, 0.2) 100%);
  border: 1px solid rgba(0, 255, 255, 0.6);
  color: #0ff;
  font-family: monospace;
  font-weight: bold;
  font-size: 0.875rem;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  width: 100%;
  min-height: 44px;
  animation: ${buttonGlow} 3s infinite alternate;
  
  /* Mobile optimizations */
  ${mediaQueries.mobile} {
    padding: 0.75rem;
    font-size: 0.8rem;
    min-height: 44px; /* Ensure touch target size */
  }
  
  /* Desktop optimizations */
  ${mediaQueries.desktop} {
    min-height: 48px;
    font-size: 0.9rem;
    padding: 0.875rem 1rem;
  }
  
  &:hover {
    background: linear-gradient(90deg, rgba(0, 255, 255, 0.3) 0%, rgba(255, 0, 255, 0.3) 100%);
    border-color: rgba(0, 255, 255, 0.9);
    color: #fff;
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.9);
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.7);
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  /* Disable hover effects on touch devices */
  ${mediaQueries.touch} {
    &:hover {
      transform: none;
      background: linear-gradient(90deg, rgba(0, 255, 255, 0.2) 0%, rgba(255, 0, 255, 0.2) 100%);
      border-color: rgba(0, 255, 255, 0.6);
      color: #0ff;
      text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
    }
    
    /* Add active state for touch feedback instead */
    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
  }
  
  &:disabled {
    background: rgba(71, 85, 105, 0.5);
    border-color: rgba(100, 116, 139, 0.5);
    color: rgb(100, 116, 139);
    transform: none;
    animation: none;
    text-shadow: none;
  }
`

interface GameSelectionProps {
  publicKey: string
  playerName: string
  mutbBalance: number
}

const games = [
  {
    id: "last-stand",
    name: "Last Stand",
    description: "Survive endless waves of enemies in this intense PvE challenge.",
    image: "/images/last-stand-card.png",
    component: LastStandGameLauncher,
  },
  {
    id: "pixel-pool",
    name: "Pixel Pool",
    description: "A retro-style 8-ball pool game with a competitive twist.",
    image: "/images/pixel-pool-card.png",
    component: PixelPoolGameLauncher,
  },
  {
    id: "archer-arena",
    name: "Archer Arena",
    description: "Fast-paced PvP archery combat. Outmaneuver and outshoot your opponents.",
    image: "/images/archer-arena-card.png",
    // This will be handled by the Desktop/Mobile containers directly
    component: null,
  },
]

export default function GameSelection({ publicKey, playerName, mutbBalance }: GameSelectionProps) {
  const [selectedGame, setSelectedGame] = useState<any>(null)
  const { styleMode } = useCyberpunkTheme()
  const { platformType } = usePlatform()
  const isCyberpunk = styleMode === "cyberpunk"

  const [joystickState, setJoystickState] = useState({ x: 0, y: 0 })
  const [actionState, setActionState] = useState<{ action: string; pressed: boolean } | null>(null)

  const handleGameSelect = (game: any) => {
    setSelectedGame(game)
  }

  const handleBack = () => {
    setSelectedGame(null)
  }

  const handleJoystickMove = (direction: { x: number; y: number }) => {
    setJoystickState(direction)
  }

  const handleActionPress = (action: string, pressed: boolean) => {
    setActionState({ action, pressed })
  }

  if (selectedGame) {
    const GameComponent = selectedGame.component

    // Handle Archer Arena separately to inject the correct container
    if (selectedGame.id === "archer-arena") {
      if (platformType === "mobile") {
        return (
          <MobileGameContainer
            onJoystickMove={handleJoystickMove}
            onActionPress={handleActionPress}
            onExit={handleBack}
          >
            <DesktopGameContainer
              gameId="archer-arena"
              playerId={publicKey}
              playerName={playerName}
              isHost={true}
              gameMode="ffa"
              onGameEnd={handleBack}
              joystickInput={joystickState}
              actionInput={actionState}
            />
          </MobileGameContainer>
        )
      }
      // Desktop Archer Arena
      return (
        <DesktopGameContainer
          gameId="archer-arena"
          playerId={publicKey}
          playerName={playerName}
          isHost={true}
          gameMode="ffa"
          onGameEnd={handleBack}
        />
      )
    }

    // For other games like Last Stand, Pixel Pool
    return (
      <GameComponent
        publicKey={publicKey}
        playerName={playerName}
        mutbBalance={mutbBalance}
        onExit={handleBack}
        isCyberpunk={isCyberpunk}
      />
    )
  }

  const cardClass = isCyberpunk
    ? "bg-black/80 border-cyan-500/50 text-cyan-200 hover:border-cyan-400 hover:bg-black/70"
    : "border-4 border-black bg-[#fbf3de] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#f5efdc]"

  const titleClass = isCyberpunk ? "text-cyan-400" : "text-black"
  const descriptionClass = isCyberpunk ? "text-cyan-300/80" : "text-gray-700"

  return (
    <div className="w-full">
      <Card className={cn("border-none shadow-none", isCyberpunk ? "bg-transparent" : "bg-transparent")}>
        <CardHeader>
          <CardTitle className={cn("text-4xl font-bold font-mono", titleClass)}>Select a Game</CardTitle>
          <CardDescription className={descriptionClass}>Choose your challenge and enter the arena.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Card
              key={game.id}
              className={cn("cursor-pointer transition-all duration-300", cardClass)}
              onClick={() => handleGameSelect(game)}
            >
              <CardHeader className="p-0">
                <Image
                  src={game.image || "/placeholder.svg"}
                  alt={game.name}
                  width={400}
                  height={200}
                  className="rounded-t-lg object-cover"
                />
              </CardHeader>
              <CardContent className="p-4">
                <h3 className={cn("text-2xl font-bold font-mono", titleClass)}>{game.name}</h3>
                <p className={cn("mt-2 text-sm", descriptionClass)}>{game.description}</p>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
