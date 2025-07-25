"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skull, Target, Clock3, Award } from "lucide-react"
import Image from "next/image"
import SoundButton from "@/components/sound-button"
import { lastStandConfig } from "./config"
import LastStandInstructions from "./instructions"
import { withClickSound } from "@/utils/sound-utils"
import { useToast } from "@/hooks/use-toast"
import { GameContainer } from "@/components/game-container"
import GamePopOutContainer from "@/components/game-pop-out-container"
import { cn } from "@/lib/utils"

// Add this after the existing imports
import { keyframes } from "@emotion/react"
import styled from "@emotion/styled"

// Add these styled components and keyframes
const pulseGlow = keyframes`
  0%, 100% {
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.7), 0 0 12px rgba(0, 255, 255, 0.4);
  }
  50% {
    text-shadow: 0 0 15px rgba(0, 255, 255, 0.9), 0 0 20px rgba(0, 255, 255, 0.6);
  }
`

const TextShadowGlow = styled.span`
  animation: ${pulseGlow} 2s infinite;
`

interface LastStandGameLauncherProps {
  publicKey: string
  playerName: string
  mutbBalance: number
  onExit: () => void
  isCyberpunk?: boolean
}

export default function LastStandGameLauncher({
  publicKey,
  playerName,
  mutbBalance,
  onExit,
  isCyberpunk,
}: LastStandGameLauncherProps) {
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [isGamePopOutOpen, setIsGamePopOutOpen] = useState(false)
  const { toast } = useToast()

  // Define the consistent button style for light UI
  const lightButtonStyle =
    "bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"

  const handleModeSelect = (modeId: string) => {
    const mode = lastStandConfig.modes.find((m) => m.id === modeId)
    if (!mode) return

    if (mode.entryFee > mutbBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${mode.entryFee} MUTB to enter this mode.`,
        variant: "destructive",
      })
      return
    }

    setSelectedMode(modeId)
  }

  const handleGameOver = (stats: any) => {
    // Here you would submit the score to the leaderboard
    toast({
      title: "Game Over!",
      description: `Your final score: ${stats.score}`,
    })

    // Close the pop-out
    setIsGamePopOutOpen(false)

    // Reset game state
    setGameStarted(false)
    setSelectedMode(null)
  }

  const handleStartGame = () => {
    setGameStarted(true)
    setIsGamePopOutOpen(true)
  }

  const handleClosePopOut = () => {
    // Show a confirmation dialog before closing the game
    if (window.confirm("Are you sure you want to exit the game? Your progress will be lost.")) {
      setIsGamePopOutOpen(false)
      setGameStarted(false)
    }
  }

  // Game content to be rendered in the pop-out
  const renderGameContent = () => {
    if (!selectedMode) return null

    return (
      <div className="w-full h-full">
        <GameContainer
          gameId="archer-arena"
          playerId={publicKey}
          playerName={playerName}
          isHost={true}
          gameMode={selectedMode}
          onGameEnd={handleGameOver}
        />
      </div>
    )
  }

  if (gameStarted && selectedMode) {
    return (
      <>
        <GamePopOutContainer isOpen={isGamePopOutOpen} onClose={handleClosePopOut} title="ARCHER ARENA: LAST STAND">
          {renderGameContent()}
        </GamePopOutContainer>

        {!isGamePopOutOpen && (
          <Card
            className={cn(
              "bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
              isCyberpunk && "!bg-black/80 !border-cyan-500/50",
            )}
            style={isCyberpunk ? { backgroundColor: "rgba(0, 0, 0, 0.8)", borderColor: "rgba(6, 182, 212, 0.5)" } : {}}
            data-game="last-stand"
          >
            <CardHeader>
              <CardTitle className="text-center font-mono">GAME PAUSED</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-xl font-bold font-mono">Your game is currently paused</div>
            </CardContent>
            <CardFooter>
              <SoundButton
                className={cn(
                  lightButtonStyle,
                  "w-full",
                  isCyberpunk && "!bg-gradient-to-r !from-cyan-500 !to-purple-500 !text-black !border-cyan-400",
                )}
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
    const mode = lastStandConfig.modes.find((m) => m.id === selectedMode)!
    const isHourlyMode = mode.id === "hourly"

    return (
      <Card
        className={cn(
          "bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          isCyberpunk && "!bg-black/80 !border-cyan-500/50",
          isCyberpunk &&
            isHourlyMode &&
            "!bg-black/90 !border-cyan-400 !border-2 shadow-[0_0_15px_rgba(0,255,255,0.4)]",
        )}
        style={
          isCyberpunk
            ? {
                backgroundColor: isHourlyMode ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 0.8)",
                borderColor: isHourlyMode ? "rgba(6, 232, 242, 0.8)" : "rgba(6, 182, 212, 0.5)",
              }
            : {}
        }
        data-game="last-stand"
      >
        <CardHeader className={cn(isCyberpunk && isHourlyMode && "bg-gradient-to-r from-cyan-900/30 to-purple-900/30")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isHourlyMode && isCyberpunk ? (
                <Clock3 className="h-5 w-5 text-cyan-400 animate-pulse" />
              ) : (
                <Skull className={cn("h-5 w-5", isCyberpunk && "text-cyan-400")} />
              )}
              <CardTitle className={cn("font-mono", isCyberpunk && isHourlyMode && "text-cyan-300")}>
                {isHourlyMode ? "HOURLY CHALLENGE" : "ARCHER ARENA: LAST STAND"}
              </CardTitle>
            </div>
          </div>
          <CardDescription className={cn(isCyberpunk && isHourlyMode && "text-cyan-300/90")}>
            Confirm your entry to {mode.name}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <LastStandInstructions mode={mode} isCyberpunk={isCyberpunk} />
        </CardContent>

        <CardFooter className="flex justify-between">
          <SoundButton
            className={cn(lightButtonStyle, isCyberpunk && "!border-cyan-500/50 !text-cyan-400 hover:!bg-cyan-900/30")}
            onClick={() => setSelectedMode(null)}
          >
            BACK
          </SoundButton>

          <SoundButton
            className={cn(
              lightButtonStyle,
              isCyberpunk && "!bg-gradient-to-r !from-cyan-500 !to-purple-500 !text-black !border-cyan-400",
            )}
            onClick={handleStartGame}
          >
            {mode.entryFee > 0 ? `PAY ${mode.entryFee} MUTB & START` : "START GAME"}
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
      style={isCyberpunk ? { backgroundColor: "rgba(0, 0, 0, 0.8)", borderColor: "rgba(6, 182, 212, 0.5)" } : {}}
      data-game="last-stand"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skull className={cn("h-5 w-5", isCyberpunk && "text-cyan-400")} />
            <CardTitle className="font-mono">ARCHER ARENA: LAST STAND</CardTitle>
          </div>
        </div>
        <CardDescription>Select a game mode to begin</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {lastStandConfig.modes.map((mode) => (
            <Card
              key={mode.id}
              className={cn(
                "border-2 border-black overflow-hidden cursor-pointer hover:bg-[#f5efdc] transition-colors flex flex-col",
                isCyberpunk && "!bg-black/80 !border-cyan-500/50 hover:!bg-black/60",
                mode.id === "hourly" &&
                  isCyberpunk &&
                  "!bg-black/90 !border-cyan-400 !border-2 shadow-[0_0_15px_rgba(0,255,255,0.4)]",
              )}
              style={
                isCyberpunk
                  ? {
                      backgroundColor: mode.id === "hourly" ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 0.8)",
                      borderColor: mode.id === "hourly" ? "rgba(6, 232, 242, 0.8)" : "rgba(6, 182, 212, 0.5)",
                    }
                  : {}
              }
              onClick={withClickSound(() => handleModeSelect(mode.id))}
            >
              <CardHeader
                className={cn(
                  "p-3",
                  mode.id === "hourly" && isCyberpunk && "bg-gradient-to-r from-cyan-900/30 to-purple-900/30",
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "p-1 rounded-md flex items-center justify-center w-8 h-8",
                      isCyberpunk
                        ? "bg-transparent border border-cyan-500/70 text-cyan-400 shadow-[0_0_5px_rgba(0,255,255,0.5)]"
                        : "bg-transparent border border-gray-400",
                      mode.id === "hourly" && isCyberpunk && "border-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.7)]",
                    )}
                  >
                    {mode.id === "practice" ? (
                      <Target className={cn("h-5 w-5", isCyberpunk && "text-cyan-400")} />
                    ) : mode.id === "hourly" ? (
                      <Clock3 className={cn("h-5 w-5", isCyberpunk && "text-cyan-400 animate-pulse")} />
                    ) : (
                      <Award className={cn("h-5 w-5", isCyberpunk && "text-cyan-400")} />
                    )}
                  </div>
                  <CardTitle
                    className={cn(
                      "text-base font-mono",
                      mode.id === "hourly" && isCyberpunk && "text-cyan-300 text-shadow-glow",
                    )}
                  >
                    {mode.name}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent
                className={cn(
                  "p-3 pt-0 flex-grow",
                  mode.id === "hourly" && isCyberpunk && "bg-gradient-to-b from-transparent to-cyan-900/10",
                )}
              >
                <p
                  className={cn(
                    "text-sm text-muted-foreground",
                    isCyberpunk && "text-gray-400",
                    mode.id === "hourly" && isCyberpunk && "text-cyan-300/90",
                  )}
                >
                  {mode.description}
                </p>

                <div
                  className={cn(
                    "mt-2 text-xs flex items-center gap-1",
                    isCyberpunk && "text-cyan-400/80",
                    mode.id === "hourly" && isCyberpunk && "text-cyan-300 font-bold",
                  )}
                >
                  <span className="font-medium">Entry Fee:</span>
                  <div className="flex items-center">
                    <Image src="/images/mutable-token.png" alt="MUTB" width={12} height={12} />
                    <span>{mode.entryFee} MUTB</span>
                  </div>
                </div>

                {mode.duration > 0 && (
                  <div
                    className={cn(
                      "mt-1 text-xs flex items-center gap-1",
                      isCyberpunk && "text-cyan-400/80",
                      mode.id === "hourly" && isCyberpunk && "text-cyan-300",
                    )}
                  >
                    <span className="font-medium">Duration:</span>
                    <span>
                      {mode.duration / (60 * 60 * 1000) >= 1
                        ? `${mode.duration / (60 * 60 * 1000)} hours`
                        : `${mode.duration / (60 * 1000)} minutes`}
                    </span>
                  </div>
                )}

                {mode.leaderboardRefresh && (
                  <div
                    className={cn(
                      "mt-1 text-xs flex items-center gap-1",
                      isCyberpunk && "text-cyan-400/80",
                      mode.id === "hourly" && isCyberpunk && "text-cyan-300",
                    )}
                  >
                    <span className="font-medium">Leaderboard:</span>
                    <span>{mode.leaderboardRefresh}</span>
                  </div>
                )}
              </CardContent>

              <CardFooter
                className={cn(
                  "p-3 mt-auto",
                  mode.id === "hourly" && isCyberpunk && "bg-gradient-to-t from-transparent to-cyan-900/10",
                )}
              >
                <SoundButton
                  className={cn(
                    lightButtonStyle,
                    "w-full",
                    isCyberpunk && "!bg-gradient-to-r !from-cyan-500 !to-purple-500 !text-black !border-cyan-400",
                    mode.id === "hourly" &&
                      isCyberpunk &&
                      "!bg-gradient-to-r !from-cyan-400 !to-purple-400 !border-cyan-300 !text-black !font-bold !shadow-[0_0_10px_rgba(0,255,255,0.5)]",
                  )}
                  onClick={() => handleModeSelect(mode.id)}
                  disabled={mode.entryFee > mutbBalance}
                >
                  {mode.entryFee > mutbBalance
                    ? "INSUFFICIENT FUNDS"
                    : mode.id === "hourly" && isCyberpunk
                      ? "SELECT HOURLY CHALLENGE"
                      : "SELECT"}
                </SoundButton>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
