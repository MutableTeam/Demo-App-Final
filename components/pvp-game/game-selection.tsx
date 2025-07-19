"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Play, Users, Trophy, Clock, HelpCircle, ExternalLink } from "lucide-react"
import Image from "next/image"
import SoundButton from "../sound-button"
import { gameRegistry } from "@/types/game-registry"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { Button } from "@/components/ui/button"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import { useIsMobile } from "@/components/ui/use-mobile"
import { ResponsiveGrid } from "@/components/mobile-optimized-container"
import { TOKENS } from "@/utils/image-paths"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
  
  &:hover {
    transform: translateY(-5px);
    animation: ${cardHover} 3s infinite alternate;
    
    .game-image {
      animation: ${imageGlow} 2s infinite alternate;
    }
    
    .cyber-play-button {
      background: linear-gradient(90deg, #0ff 20%, #f0f 80%);
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.7);
    }
  }
  
  /* Disable hover effects on touch devices */
  ${mediaQueries.touch} {
    &:hover {
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
  background: rgba(71, 85, 105, 0.7);
  border: 1px solid rgba(100, 116, 139, 0.7);
  color: rgb(226, 232, 240);
  font-family: monospace;
  font-weight: bold;
  font-size: 0.875rem;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-shadow: none;
  width: 100%;
  
  /* Mobile optimizations */
  ${mediaQueries.mobile} {
    padding: 0.75rem;
    font-size: 0.8rem;
    min-height: 44px; /* Ensure touch target size */
  }
  
  &:hover {
    background: rgba(100, 116, 139, 0.8);
    border-color: rgba(148, 163, 184, 0.8);
    color: white;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  /* Disable hover effects on touch devices */
  ${mediaQueries.touch} {
    &:hover {
      transform: none;
      background: rgba(71, 85, 105, 0.7);
      border-color: rgba(100, 116, 139, 0.7);
      color: rgb(226, 232, 240);
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
  }
`

const CyberBadge = styled(Badge)`
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.2) 0%, rgba(255, 0, 255, 0.2) 100%);
  border: 1px solid rgba(0, 255, 255, 0.5);
  color: #0ff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  font-family: monospace;
  font-weight: bold;
  font-size: 0.75rem;
  letter-spacing: 1px;
  
  /* Mobile optimizations */
  ${mediaQueries.mobile} {
    font-size: 0.7rem;
    padding: 0.15rem 0.4rem;
  }
`

interface GameSelectionProps {
  publicKey: string
  balance: number | null
  mutbBalance: number
  onSelectGame: (gameId: string) => void
}

export default function GameSelection({ publicKey, balance, mutbBalance, onSelectGame }: GameSelectionProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"
  const isMobile = useIsMobile()

  // Get all games from registry
  const allGames = gameRegistry.getAllGames().map((game) => ({
    id: game.config.id,
    name: game.config.name,
    description: game.config.description,
    image: game.config.image,
    icon: game.config.icon,
    status: game.config.status,
    minWager: game.config.minWager,
    maxPlayers: game.config.maxPlayers,
    gameType: game.config.gameType,
    originalName: game.config.name, // Store original name for reference
  }))

  const [wagerToken, setWagerToken] = useState<"MUTB" | "SOL">("MUTB")
  const [showSolWarning, setShowSolWarning] = useState(false)
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())

  // Modify the name for Archer Arena: Last Stand
  const processedGames = allGames.map((game) => {
    if (game.name === "Archer Arena: Last Stand") {
      return {
        ...game,
        name: "Last Stand",
        description: "Survive waves of enemies in this intense archer survival game",
        hasCustomIcon: true,
      }
    }
    if (game.name === "Archer Arena") {
      return {
        ...game,
        name: "Archer Arena",
        description: "Master your bow skills in epic PvP battles",
      }
    }
    if (game.name === "Pixel Pool") {
      return {
        ...game,
        name: "Pixel Pool",
        description: "Classic 8-ball pool with retro pixel art style",
      }
    }
    return game
  })

  // Sort games: available games first, then put "Last Stand" next to "Archer Arena"
  const games = processedGames.sort((a, b) => {
    // First, sort by status (live games first)
    if (a.status === "live" && b.status !== "live") return -1
    if (a.status !== "live" && b.status === "live") return 1

    // Then, ensure "Last Stand" is next to "Archer Arena"
    if (a.name === "Archer Arena" && b.name === "Last Stand") return -1
    if (a.name === "Last Stand" && b.name === "Archer Arena") return 1

    // Default sort by name
    return a.name.localeCompare(b.name)
  })

  // Custom image override for games
  const getGameImage = (game) => {
    if (game.originalName === "Archer Arena: Last Stand" || game.name === "Last Stand") {
      return "/images/last-stand-card.png"
    }
    if (game.id === "archer-arena") {
      return "/images/archer-arena-card.png"
    }
    if (game.id === "pixel-pool") {
      return "/images/pixel-pool-card.png"
    }
    return game.image || "/placeholder.svg"
  }

  // Handle card flip
  const handleCardClick = (gameId: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(gameId)) {
        newSet.delete(gameId)
      } else {
        newSet.add(gameId)
      }
      return newSet
    })
  }

  // Handle game selection with Google Analytics tracking
  const handleGameSelect = (gameId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card flip when clicking play button

    // Check if SOL is selected and show popup
    if (wagerToken === "SOL") {
      setShowSolWarning(true)
      return
    }

    // Get the game name for tracking
    const game = games.find((g) => g.id === gameId)

    if (game) {
      // Convert game name to kebab case for analytics
      const eventName = game.name.toLowerCase().replace(/\s+/g, "-")

      // Track the game selection in Google Analytics
      if (typeof window !== "undefined" && (window as any).gtag) {
        ;(window as any).gtag("event", eventName, {
          event_category: "Games",
          event_label: game.name,
          wager_token: wagerToken,
        })
      }
    }

    // Call the original onSelectGame handler
    onSelectGame(gameId)
  }

  const getGameStats = (game) => {
    return {
      players: `${game.maxPlayers || 2} Players`,
      type: game.gameType || "PvP",
      duration: game.id === "pixel-pool" ? "5-10 min" : "3-5 min",
    }
  }

  // Consistent card height for both themes
  const cardHeight = isMobile ? "h-56" : "h-60"

  return (
    <Card
      className={
        isCyberpunk
          ? "!bg-black/80 !border-cyan-500/50"
          : "bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      }
      style={isCyberpunk ? { backgroundColor: "rgba(0, 0, 0, 0.8)", borderColor: "rgba(6, 182, 212, 0.5)" } : {}}
    >
      <CardHeader className={isMobile ? "p-4" : undefined}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className={`h-5 w-5 ${isCyberpunk ? "text-[#0ff]" : ""}`} />
            <CardTitle className={`${isCyberpunk ? "" : "font-mono"} ${isMobile ? "text-lg" : ""}`}>
              MUTABLE GAMES
            </CardTitle>
          </div>
        </div>
        <CardDescription className={isCyberpunk ? "text-[#0ff]/70" : ""}>
          Select a game to play and wager tokens
        </CardDescription>

        {/* Wager Token Selection */}
        <div className="flex items-center justify-between px-2 py-3 border-b border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <span
              className={cn("text-sm font-medium", isCyberpunk ? "text-cyan-400" : "text-gray-700 dark:text-gray-300")}
            >
              Wager Token:
            </span>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-sm font-mono",
                  wagerToken === "MUTB"
                    ? isCyberpunk
                      ? "text-cyan-400 font-bold"
                      : "text-black dark:text-white font-bold"
                    : "text-gray-500",
                )}
              >
                MUTB
              </span>
              <Switch
                checked={wagerToken === "SOL"}
                onCheckedChange={(checked) => setWagerToken(checked ? "SOL" : "MUTB")}
                className={isCyberpunk ? "data-[state=checked]:bg-cyan-500" : ""}
              />
              <span
                className={cn(
                  "text-sm font-mono",
                  wagerToken === "SOL"
                    ? isCyberpunk
                      ? "text-cyan-400 font-bold"
                      : "text-black dark:text-white font-bold"
                    : "text-gray-500",
                )}
              >
                SOL
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {wagerToken === "MUTB" ? (
              <>
                <Image
                  src={TOKENS.MUTABLE || "/placeholder.svg"}
                  alt="MUTB"
                  width={16}
                  height={16}
                  className="rounded-full"
                />
                <span
                  className={cn("font-medium font-mono", isCyberpunk ? "text-cyan-400" : "text-black dark:text-white")}
                >
                  {mutbBalance.toFixed(2)} MUTB
                </span>
              </>
            ) : (
              <>
                <Image src="/solana-logo.png" alt="SOL" width={16} height={16} className="rounded-full" />
                <span
                  className={cn("font-medium font-mono", isCyberpunk ? "text-cyan-400" : "text-black dark:text-white")}
                >
                  {balance?.toFixed(4) || "0.0000"} SOL
                </span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className={isMobile ? "p-4" : "p-6"}>
        <ResponsiveGrid
          columns={{
            base: 1,
            sm: 2,
            md: 3,
          }}
          gap={isMobile ? "0.75rem" : "1rem"}
        >
          {games.map((game) => {
            const isFlipped = flippedCards.has(game.id)
            const gameStats = getGameStats(game)

            return (
              <div key={game.id} className="flip-card">
                <div
                  className={`flip-card-inner transition-transform duration-700 ${isFlipped ? "flip-card-flipped" : ""}`}
                >
                  {/* Front Side - Game Image and Name */}
                  <div className="flip-card-front">
                    {isCyberpunk ? (
                      <CyberGameCard
                        className={cn("cursor-pointer overflow-hidden", cardHeight)}
                        onClick={() => handleCardClick(game.id)}
                      >
                        <div className="relative h-full">
                          <Image
                            src={getGameImage(game) || "/placeholder.svg"}
                            alt={game.name}
                            fill
                            className="object-cover game-image"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          {game.status === "coming-soon" && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <CyberBadge>{game.id === "pixel-pool" ? "IN DEVELOPMENT" : "COMING SOON"}</CyberBadge>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="bg-[#0a0a24] p-1 rounded-md border border-[#0ff]/50 text-[#0ff]">
                                {game.hasCustomIcon ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-[#0ff]"
                                  >
                                    <path d="M3 8a7 7 0 0 1 14 0a6.97 6.97 0 0 1-2 4.9V22h-3v-3h-4v3h-3v-9.1A6.97 6.97 0 0 1 3 8z" />
                                    <path d="M19 8a3 3 0 0 1 6 0c0 3-2 4-2 9h-4c0-5-2-6-2-9a3 3 0 0 1 2-3z" />
                                  </svg>
                                ) : (
                                  game.icon
                                )}
                              </div>
                            </div>
                            <h3 className={`text-lg md:text-xl font-mono font-bold text-[#0ff] text-shadow-lg`}>
                              {game.name}
                            </h3>
                          </div>
                        </div>
                      </CyberGameCard>
                    ) : (
                      <Card
                        className={cn("cursor-pointer border-2 border-black overflow-hidden", cardHeight)}
                        onClick={() => handleCardClick(game.id)}
                      >
                        <div className="relative h-full">
                          <Image
                            src={getGameImage(game) || "/placeholder.svg"}
                            alt={game.name}
                            fill
                            className="object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          {game.status === "coming-soon" && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <Badge className="bg-yellow-500 text-black font-mono">
                                {game.id === "pixel-pool" ? "IN DEVELOPMENT" : "COMING SOON"}
                              </Badge>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="bg-[#FFD54F] p-1 rounded-md border border-black">
                                {game.hasCustomIcon ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-amber-700"
                                  >
                                    <path d="M3 8a7 7 0 0 1 14 0a6.97 6.97 0 0 1-2 4.9V22h-3v-3h-4v3h-3v-9.1A6.97 6.97 0 0 1 3 8z" />
                                    <path d="M19 8a3 3 0 0 1 6 0c0 3-2 4-2 9h-4c0-5-2-6-2-9a3 3 0 0 1 2-3z" />
                                  </svg>
                                ) : (
                                  game.icon
                                )}
                              </div>
                            </div>
                            <h3 className={`text-lg md:text-xl font-mono font-bold text-white text-shadow-lg`}>
                              {game.name}
                            </h3>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* Back Side - Game Info and Play Button */}
                  <div className="flip-card-back">
                    {isCyberpunk ? (
                      <CyberGameCard
                        className={cn("cursor-pointer overflow-hidden", cardHeight)}
                        onClick={() => handleCardClick(game.id)}
                      >
                        <div className="relative h-full">
                          <Image
                            src={getGameImage(game) || "/placeholder.svg"}
                            alt={game.name}
                            fill
                            className="object-cover opacity-30"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/60" />

                          {/* Help Button */}
                          <div className="absolute top-2 right-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 bg-slate-800/70 border border-slate-600/70 text-slate-200 hover:bg-slate-700/80 hover:border-slate-500/80 hover:text-white"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <HelpCircle className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                                <DropdownMenuItem asChild>
                                  <a
                                    href={`/games/${game.id}/instructions`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-slate-200 hover:text-white"
                                  >
                                    <HelpCircle className="h-4 w-4" />
                                    Game Instructions
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="relative h-full flex flex-col justify-between p-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Play className="h-4 w-4 text-slate-200" />
                                <h3 className="text-base md:text-lg font-mono font-bold text-slate-200">{game.name}</h3>
                              </div>
                              <p className="text-xs md:text-sm text-slate-300 mb-3 line-clamp-2">{game.description}</p>

                              <div className="space-y-1 mb-3">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                  <Users className="h-3 w-3" />
                                  <span>{gameStats.players}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                  <Clock className="h-3 w-3" />
                                  <span>{gameStats.duration}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                  <Trophy className="h-3 w-3" />
                                  <span>
                                    Min Wager:{" "}
                                    {wagerToken === "MUTB"
                                      ? `${game.minWager} MUTB`
                                      : `${((game.minWager * 0.01) / 150).toFixed(4)} SOL`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <CyberPlayButton
                              className="cyber-play-button mt-auto"
                              disabled={game.status !== "live"}
                              onClick={(e) => handleGameSelect(game.id, e)}
                            >
                              {game.status === "live" ? "PLAY NOW" : "COMING SOON"}
                            </CyberPlayButton>
                          </div>
                        </div>
                      </CyberGameCard>
                    ) : (
                      <Card
                        className={cn("cursor-pointer border-2 border-black overflow-hidden", cardHeight)}
                        onClick={() => handleCardClick(game.id)}
                      >
                        <div className="relative h-full">
                          <Image
                            src={getGameImage(game) || "/placeholder.svg"}
                            alt={game.name}
                            fill
                            className="object-cover opacity-30"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/60" />

                          {/* Help Button */}
                          <div className="absolute top-2 right-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 bg-amber-200/80 border border-black text-amber-800 hover:bg-amber-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <HelpCircle className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <a
                                    href={`/games/${game.id}/instructions`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2"
                                  >
                                    <HelpCircle className="h-4 w-4" />
                                    Game Instructions
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="relative h-full flex flex-col justify-between p-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Play className="h-4 w-4 text-white" />
                                <h3 className="text-base md:text-lg font-mono font-bold text-white drop-shadow-lg">
                                  {game.name}
                                </h3>
                              </div>
                              <p className="text-xs md:text-sm text-white/90 mb-3 line-clamp-2 drop-shadow">
                                {game.description}
                              </p>

                              <div className="space-y-1 mb-3">
                                <div className="flex items-center gap-2 text-xs text-white/80">
                                  <Users className="h-3 w-3" />
                                  <span>{gameStats.players}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white/80">
                                  <Clock className="h-3 w-3" />
                                  <span>{gameStats.duration}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white/80">
                                  <Trophy className="h-3 w-3" />
                                  <span>
                                    Min Wager:{" "}
                                    {wagerToken === "MUTB"
                                      ? `${game.minWager} MUTB`
                                      : `${((game.minWager * 0.01) / 150).toFixed(4)} SOL`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <SoundButton
                              className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono text-xs md:text-sm min-h-[44px] mt-auto"
                              disabled={game.status !== "live"}
                              onClick={(e) => handleGameSelect(game.id, e)}
                            >
                              {game.status === "live" ? "PLAY NOW" : "COMING SOON"}
                            </SoundButton>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </ResponsiveGrid>
      </CardContent>

      {/* SOL Warning Dialog */}
      <AlertDialog open={showSolWarning} onOpenChange={setShowSolWarning}>
        <AlertDialogContent className={isCyberpunk ? "bg-black/90 border-cyan-500/50" : ""}>
          <AlertDialogHeader>
            <AlertDialogTitle className={isCyberpunk ? "text-cyan-400" : ""}>SOL Wagering Coming Soon</AlertDialogTitle>
            <AlertDialogDescription className={isCyberpunk ? "text-cyan-300/70" : ""}>
              SOL wagering functionality is currently in development and will be available soon. Please switch to MUTB
              to play games in this demo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowSolWarning(false)}
              className={isCyberpunk ? "bg-cyan-500 hover:bg-cyan-600 text-black" : ""}
            >
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

export { GameSelection }
