"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import SoundButton from "@/components/sound-button"
import { withClickSound } from "@/utils/sound-utils"
import { useToast } from "@/hooks/use-toast"
import { GameContainer } from "@/components/game-container"
import GamePopOutContainer from "@/components/game-pop-out-container"
import { cn } from "@/lib/utils"
import type { GameImplementation, GameMode } from "@/types/game-registry"
import { SUPPORTED_TOKENS, type Token } from "@/config/token-registry"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PvEGameLauncherProps {
  game: GameImplementation
  publicKey: string
  playerName: string
  mutbBalance: number
  solBalance: number | null
  onExit: () => void
  isCyberpunk?: boolean
  selectedToken: Token
  onTokenChange: (token: Token) => void
}

// Mock conversion rates
const MUTB_TO_USD = 0.01
const SOL_TO_USD = 150

export default function PvEGameLauncher({
  game,
  publicKey,
  playerName,
  mutbBalance,
  solBalance,
  onExit,
  isCyberpunk,
  selectedToken,
  onTokenChange,
}: PvEGameLauncherProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [isGamePopOutOpen, setIsGamePopOutOpen] = useState(false)
  const { toast } = useToast()

  const lightButtonStyle =
    "bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
  const cyberButtonStyle = "!bg-gradient-to-r !from-cyan-500 !to-purple-500 !text-black !border-cyan-400"

  const getTokenBalance = (token: Token) => (token.symbol === "SOL" ? (solBalance ?? 0) : mutbBalance)

  const getFeeInSelectedToken = (mutbFee: number) => {
    if (selectedToken.symbol === "MUTB" || !mutbFee) {
      return mutbFee
    }
    const feeInUsd = mutbFee * MUTB_TO_USD
    return feeInUsd / SOL_TO_USD
  }

  const handleModeSelect = (mode: GameMode) => {
    const fee = getFeeInSelectedToken(mode.entryFee || 0)
    const balance = getTokenBalance(selectedToken)

    if (fee > balance) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${fee.toFixed(selectedToken.symbol === "SOL" ? 4 : 2)} ${
          selectedToken.symbol
        } to enter this mode.`,
        variant: "destructive",
      })
      return
    }
    setSelectedMode(mode)
  }

  const handleGameOver = (stats: any) => {
    const fee = getFeeInSelectedToken(selectedMode?.entryFee || 0)
    toast({
      title: "Game Over!",
      description: `Your final score: ${stats.score}. Entry fee of ${fee.toFixed(
        selectedToken.symbol === "SOL" ? 4 : 2,
      )} ${selectedToken.symbol} was paid.`,
    })
    setIsGamePopOutOpen(false)
    setGameStarted(false)
    setSelectedMode(null)
  }

  const handleStartGame = () => {
    setGameStarted(true)
    setIsGamePopOutOpen(true)
  }

  const handleClosePopOut = () => {
    if (window.confirm("Are you sure you want to exit the game? Your progress will be lost.")) {
      setIsGamePopOutOpen(false)
      setGameStarted(false)
    }
  }

  const renderGameContent = () => {
    if (!selectedMode) return null
    return (
      <div className="w-full h-full">
        <GameContainer
          gameId={game.config.id}
          playerId={publicKey}
          playerName={playerName}
          isHost={true}
          gameMode={selectedMode.id}
          onGameEnd={handleGameOver}
        />
      </div>
    )
  }

  if (gameStarted && selectedMode) {
    return (
      <>
        <GamePopOutContainer isOpen={isGamePopOutOpen} onClose={handleClosePopOut} title={game.config.name}>
          {renderGameContent()}
        </GamePopOutContainer>
        {!isGamePopOutOpen && (
          <Card
            className={cn(
              "bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
              isCyberpunk && "!bg-black/80 !border-cyan-500/50",
            )}
          >
            <CardHeader>
              <CardTitle className="text-center font-mono">GAME PAUSED</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-xl font-bold font-mono">Your game is currently paused</div>
            </CardContent>
            <CardFooter>
              <SoundButton
                className={cn(lightButtonStyle, "w-full", isCyberpunk && cyberButtonStyle)}
                onClick={() => setIsGamePopOutOpen(true)}
              >
                RESUME GAME
              </SoundButton>
            </CardFooter>
          </Card>
        )}
      </>
    )
  }

  if (selectedMode && !gameStarted) {
    const Instructions = game.InstructionsComponent
    const fee = getFeeInSelectedToken(selectedMode.entryFee || 0)
    return (
      <Card
        className={cn(
          "bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          isCyberpunk && "!bg-black/80 !border-cyan-500/50",
        )}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            {game.config.icon}
            <CardTitle className="font-mono">{game.config.name}</CardTitle>
          </div>
          <CardDescription>Confirm your entry to {selectedMode.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Instructions mode={selectedMode} isCyberpunk={isCyberpunk} />
        </CardContent>
        <CardFooter className="flex justify-between">
          <SoundButton
            className={cn(
              "bg-transparent hover:bg-gray-200",
              isCyberpunk && "!border-pink-500/50 !text-pink-400 hover:!bg-pink-900/30",
            )}
            onClick={() => setSelectedMode(null)}
          >
            BACK
          </SoundButton>
          <SoundButton className={cn(lightButtonStyle, isCyberpunk && cyberButtonStyle)} onClick={handleStartGame}>
            {fee > 0
              ? `PAY ${fee.toFixed(selectedToken.symbol === "SOL" ? 4 : 2)} ${selectedToken.symbol} & START`
              : "START GAME"}
          </SoundButton>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        isCyberpunk && "!bg-black/80 !border-cyan-500/50",
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {game.config.icon}
            <CardTitle className="font-mono">{game.config.name}</CardTitle>
          </div>
          <SoundButton
            variant="outline"
            className={cn(
              "border-2 border-black",
              isCyberpunk && "!border-pink-500/50 !text-pink-400 hover:!bg-pink-900/30",
            )}
            onClick={onExit}
          >
            Back
          </SoundButton>
        </div>
        <CardDescription>Select a game mode to begin</CardDescription>
        <div className="flex items-center gap-2 pt-2">
          <span className="text-sm font-medium">Entry Fee Token:</span>
          <Select
            value={selectedToken.symbol}
            onValueChange={(value) => {
              const token = SUPPORTED_TOKENS.find((t) => t.symbol === value)
              if (token) onTokenChange(token)
            }}
          >
            <SelectTrigger className={cn("w-[120px] border-2 border-black", isCyberpunk && "cyber-select")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={cn(isCyberpunk && "cyber-select-content")}>
              {SUPPORTED_TOKENS.map((token) => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  <div className="flex items-center gap-2">
                    <Image src={token.logoURI || "/placeholder.svg"} alt={token.symbol} width={16} height={16} />
                    {token.symbol}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {game.config.modes.map((mode) => {
            const fee = getFeeInSelectedToken(mode.entryFee || 0)
            const balance = getTokenBalance(selectedToken)
            const hasEnoughBalance = fee <= balance

            return (
              <Card
                key={mode.id}
                className={cn(
                  "border-2 border-black overflow-hidden cursor-pointer hover:bg-[#f5efdc] transition-colors flex flex-col",
                  isCyberpunk && "!bg-black/80 !border-cyan-500/50 hover:!bg-black/60",
                )}
                onClick={withClickSound(() => handleModeSelect(mode))}
              >
                <CardHeader className="p-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "p-1 rounded-md flex items-center justify-center w-8 h-8",
                        isCyberpunk
                          ? "bg-transparent border border-cyan-500/70 text-cyan-400"
                          : "bg-transparent border border-gray-400",
                      )}
                    >
                      {mode.icon}
                    </div>
                    <CardTitle className="text-base font-mono">{mode.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0 flex-grow">
                  <p className={cn("text-sm text-muted-foreground", isCyberpunk && "text-gray-400")}>
                    {mode.description}
                  </p>
                  <div className={cn("mt-2 text-xs flex items-center gap-1", isCyberpunk && "text-cyan-400/80")}>
                    <span className="font-medium">Entry Fee:</span>
                    <div className="flex items-center gap-1">
                      <Image
                        src={selectedToken.logoURI || "/placeholder.svg"}
                        alt={selectedToken.symbol}
                        width={12}
                        height={12}
                      />
                      <span>
                        {fee.toFixed(selectedToken.symbol === "SOL" ? 4 : 2)} {selectedToken.symbol}
                      </span>
                    </div>
                  </div>
                  {mode.duration && mode.duration > 0 && (
                    <div className={cn("mt-1 text-xs flex items-center gap-1", isCyberpunk && "text-cyan-400/80")}>
                      <span className="font-medium">Duration:</span>
                      <span>{mode.duration / (60 * 1000)} minutes</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-3 mt-auto">
                  <SoundButton
                    className={cn(lightButtonStyle, "w-full", isCyberpunk && cyberButtonStyle)}
                    onClick={() => handleModeSelect(mode)}
                    disabled={!hasEnoughBalance}
                  >
                    {hasEnoughBalance ? "SELECT" : "INSUFFICIENT FUNDS"}
                  </SoundButton>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
