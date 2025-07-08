"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gamepad2 } from "lucide-react"
import Image from "next/image"
import SoundButton from "./sound-button"
import { gameRegistry } from "@/types/game-registry"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { Button } from "@/components/ui/button"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import { useIsMobile } from "@/components/ui/use-mobile"
import { ResponsiveGrid } from "@/components/mobile-optimized-container"
import { TOKENS } from "@/utils/image-paths"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SUPPORTED_TOKENS, type Token } from "@/config/token-registry"

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
  background: linear-gradient(90deg, #0ff 0%, #f0f 100%);
  color: #000;
  font-family: monospace;
  font-weight: bold;
  font-size: 0.875rem;
  letter-spacing: 1px;
  border: none;
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
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.7);
    background: linear-gradient(90deg, #0ff 20%, #f0f 80%);
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  /* Disable hover effects on touch devices */
  ${mediaQueries.touch} {
    &:hover {
      transform: none;
      box-shadow: none;
      background: linear-gradient(90deg, #0ff 0%, #f0f 100%);
    }
    
    /* Add active state for touch feedback instead */
    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
  }
  
  &:disabled {
    background: linear-gradient(90deg, #666 0%, #333 100%);
    color: #aaa;
    box-shadow: none;
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
  selectedToken: Token
  onTokenChange: (token: Token) => void
}

export default function GameSelection({
  publicKey,
  balance,
  mutbBalance,
  onSelectGame,
  selectedToken,
  onTokenChange,
}: GameSelectionProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"
  const isMobile = useIsMobile()

  const games = gameRegistry.getAllGames().sort((a, b) => {
    if (a.config.status === "live" && b.config.status !== "live") return -1
    if (a.config.status !== "live" && b.config.status === "live") return 1
    return a.config.name.localeCompare(b.config.name)
  })

  const handleGameSelect = (gameId: string) => {
    const game = games.find((g) => g.config.id === gameId)
    if (game) {
      const eventName = game.config.name.toLowerCase().replace(/\s+/g, "-")
      if (typeof window !== "undefined" && (window as any).gtag) {
        ;(window as any).gtag("event", eventName, {
          event_category: "Games",
          event_label: game.config.name,
          wager_token: selectedToken.symbol,
        })
      }
    }
    onSelectGame(gameId)
  }

  const getTokenBalance = (token: Token) => {
    if (token.symbol === "SOL") {
      return balance || 0
    }
    return mutbBalance
  }

  const formatTokenBalance = (token: Token) => {
    const tokenBalance = getTokenBalance(token)
    if (token.symbol === "SOL") {
      return tokenBalance.toFixed(4)
    }
    return tokenBalance.toFixed(2)
  }

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
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={
                isCyberpunk
                  ? "bg-[#0a0a24]/80 text-[#0ff] border border-[#0ff]/50 flex items-center gap-1 font-mono"
                  : "bg-[#FFD54F] text-black border-2 border-black flex items-center gap-1 font-mono"
              }
            >
              <Image
                src={TOKENS.MUTABLE || "/placeholder.svg"}
                alt="MUTB"
                width={16}
                height={16}
                className="rounded-full"
              />
              {mutbBalance.toFixed(2)} MUTB
            </Badge>
            <Badge
              variant="outline"
              className={
                isCyberpunk
                  ? "bg-[#0a0a24]/80 text-[#0ff] border border-[#0ff]/50 flex items-center gap-1 font-mono"
                  : "bg-[#FFD54F] text-black border-2 border-black flex items-center gap-1 font-mono"
              }
            >
              <Image src="/solana-logo.png" alt="SOL" width={16} height={16} className="rounded-full" />
              {balance?.toFixed(4) || "0.0000"} SOL
            </Badge>
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
            {isCyberpunk ? (
              <Select
                value={selectedToken.symbol}
                onValueChange={(value) => {
                  const token = SUPPORTED_TOKENS.find((t) => t.symbol === value)
                  if (token) onTokenChange(token)
                }}
              >
                <SelectTrigger className="w-[140px] bg-black/50 border-cyan-500/50 text-cyan-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-cyan-500/50">
                  {SUPPORTED_TOKENS.map((token) => (
                    <SelectItem
                      key={token.symbol}
                      value={token.symbol}
                      className="text-cyan-400 hover:bg-cyan-900/30 focus:bg-cyan-900/30"
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={token.logoURI || "/placeholder.svg"}
                          alt={token.symbol}
                          width={16}
                          height={16}
                          className="rounded-full"
                        />
                        <span className="font-mono">{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select
                value={selectedToken.symbol}
                onValueChange={(value) => {
                  const token = SUPPORTED_TOKENS.find((t) => t.symbol === value)
                  if (token) onTokenChange(token)
                }}
              >
                <SelectTrigger className="w-[140px] border-2 border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_TOKENS.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center gap-2">
                        <Image
                          src={token.logoURI || "/placeholder.svg"}
                          alt={token.symbol}
                          width={16}
                          height={16}
                          className="rounded-full"
                        />
                        <span className="font-mono">{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm", isCyberpunk ? "text-cyan-300/70" : "text-gray-600 dark:text-gray-400")}>
              Selected Balance:
            </span>
            <div className="flex items-center gap-1">
              <Image
                src={selectedToken.logoURI || "/placeholder.svg"}
                alt={selectedToken.symbol}
                width={16}
                height={16}
                className="rounded-full"
              />
              <span
                className={cn("font-medium font-mono", isCyberpunk ? "text-cyan-400" : "text-black dark:text-white")}
              >
                {formatTokenBalance(selectedToken)} {selectedToken.symbol}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className={isMobile ? "p-4" : undefined}>
        <ResponsiveGrid
          columns={{
            base: 1,
            sm: 2,
            md: 3,
          }}
          gap={isMobile ? "0.75rem" : "1rem"}
        >
          {games.map(({ config: game }) =>
            isCyberpunk ? (
              <CyberGameCard key={game.id} className="flex flex-col h-[420px]">
                <div className="relative">
                  <Image
                    src={game.image || "/placeholder.svg"}
                    alt={game.name}
                    width={400}
                    height={240}
                    className="w-full h-32 object-cover game-image"
                    loading="lazy"
                  />
                  {game.status === "coming-soon" && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <CyberBadge>{game.id === "pixel-pool" ? "IN DEVELOPMENT" : "COMING SOON"}</CyberBadge>
                    </div>
                  )}
                </div>
                <CardHeader className={isMobile ? "p-2" : "p-3"}>
                  <div className="flex items-center gap-2">
                    <div className="bg-[#0a0a24] p-1 rounded-md border border-[#0ff]/50 text-[#0ff]">{game.icon}</div>
                    <CardTitle className={`text-base font-mono ${isMobile ? "text-sm" : ""}`}>{game.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className={`${isMobile ? "p-2" : "p-3"} pt-0 flex-grow`}>
                  <p className={`${isMobile ? "text-xs" : "text-sm"} text-[#0ff]/70`}>{game.description}</p>
                  <div className={`mt-2 ${isMobile ? "text-xs" : "text-sm"} flex items-center gap-1 text-[#0ff]/80`}>
                    <span className="font-medium">Min Wager:</span>
                    <div className="flex items-center">
                      <Image
                        src={selectedToken.logoURI || "/placeholder.svg"}
                        alt={selectedToken.symbol}
                        width={12}
                        height={12}
                        className="rounded-full"
                      />
                      <span>
                        {selectedToken.symbol === "SOL" ? ((game.minWager * 0.01) / 150).toFixed(4) : game.minWager}{" "}
                        {selectedToken.symbol}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <div className="mt-auto"></div>
                <CardFooter className={isMobile ? "p-2" : "p-3"}>
                  <CyberPlayButton
                    className="cyber-play-button"
                    disabled={game.status !== "live"}
                    onClick={() => handleGameSelect(game.id)}
                  >
                    {game.status === "live" ? "PLAY NOW" : "COMING SOON"}
                  </CyberPlayButton>
                </CardFooter>
              </CyberGameCard>
            ) : (
              <Card
                key={game.id}
                className={`border-2 ${
                  game.status === "live" ? "border-black" : "border-gray-300"
                } overflow-hidden flex flex-col h-[420px]`}
              >
                <div className="relative">
                  <Image
                    src={game.image || "/placeholder.svg"}
                    alt={game.name}
                    width={400}
                    height={240}
                    className="w-full h-32 object-cover"
                    loading="lazy"
                  />
                  {game.status === "coming-soon" && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Badge className="bg-yellow-500 text-black font-mono">
                        {game.id === "pixel-pool" ? "IN DEVELOPMENT" : "COMING SOON"}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardHeader className={isMobile ? "p-2" : "p-3"}>
                  <div className="flex items-center gap-2">
                    <div className="bg-[#FFD54F] p-1 rounded-md border border-black">{game.icon}</div>
                    <CardTitle className={`text-base font-mono ${isMobile ? "text-sm" : ""}`}>{game.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className={`${isMobile ? "p-2" : "p-3"} pt-0 flex-grow`}>
                  <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>{game.description}</p>
                  <div className={`mt-2 ${isMobile ? "text-xs" : "text-sm"} flex items-center gap-1`}>
                    <span className="font-medium">Min Wager:</span>
                    <div className="flex items-center">
                      <Image
                        src={selectedToken.logoURI || "/placeholder.svg"}
                        alt={selectedToken.symbol}
                        width={12}
                        height={12}
                        className="rounded-full"
                      />
                      <span>
                        {selectedToken.symbol === "SOL" ? ((game.minWager * 0.01) / 150).toFixed(4) : game.minWager}{" "}
                        {selectedToken.symbol}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <div className="mt-auto"></div>
                <CardFooter className={isMobile ? "p-2" : "p-3"}>
                  <SoundButton
                    className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
                    disabled={game.status !== "live"}
                    onClick={() => handleGameSelect(game.id)}
                  >
                    {game.status === "live" ? "PLAY NOW" : "COMING SOON"}
                  </SoundButton>
                </CardFooter>
              </Card>
            ),
          )}
        </ResponsiveGrid>
      </CardContent>
    </Card>
  )
}
