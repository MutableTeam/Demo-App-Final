"use client"

import { CardFooter } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Clock, Trophy, Target, Gamepad2, Wifi, WifiOff } from "lucide-react"
import Image from "next/image"
import SoundButton from "../sound-button"
import { withClickSound } from "@/utils/sound-utils"
import { useToast } from "@/hooks/use-toast"
import { GameContainer } from "@/components/game-container"
import GamePopOutContainer from "@/components/game-pop-out-container"
import { cn } from "@/lib/utils"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"

interface MatchmakingLobbyProps {
  publicKey: string
  playerName: string
  mutbBalance: number
  onExit: () => void
  selectedGame: string
}

export default function MatchmakingLobby({
  publicKey,
  playerName,
  mutbBalance,
  onExit,
  selectedGame,
}: MatchmakingLobbyProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"
  const [isSearching, setIsSearching] = useState(false)
  const [searchProgress, setSearchProgress] = useState(0)
  const [estimatedWait, setEstimatedWait] = useState(30)
  const [gameStarted, setGameStarted] = useState(false)
  const [isGamePopOutOpen, setIsGamePopOutOpen] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected")
  const { toast } = useToast()

  // Define the consistent button style for light UI
  const lightButtonStyle =
    "bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"

  // Game configuration based on selected game
  const getGameConfig = () => {
    switch (selectedGame) {
      case "top-down-shooter":
        return {
          name: "Top-Down Shooter",
          description: "Fast-paced multiplayer combat",
          minWager: 1,
          maxPlayers: 4,
          estimatedDuration: "3-5 min",
          icon: <Target className="h-5 w-5" />,
        }
      case "mutball-pool":
        return {
          name: "MutBall Pool",
          description: "Classic 8-ball pool with crypto stakes",
          minWager: 5,
          maxPlayers: 2,
          estimatedDuration: "5-10 min",
          icon: <Trophy className="h-5 w-5" />,
        }
      default:
        return {
          name: "Unknown Game",
          description: "Game configuration not found",
          minWager: 1,
          maxPlayers: 2,
          estimatedDuration: "5 min",
          icon: <Gamepad2 className="h-5 w-5" />,
        }
    }
  }

  const gameConfig = getGameConfig()

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSearching) {
      interval = setInterval(() => {
        setSearchProgress((prev) => {
          if (prev >= 100) {
            // Simulate finding a match
            setIsSearching(false)
            handleMatchFound()
            return 100
          }
          return prev + 2
        })
        setEstimatedWait((prev) => Math.max(0, prev - 1))
      }, 500)
    }
    return () => clearInterval(interval)
  }, [isSearching])

  const handleStartMatchmaking = () => {
    if (gameConfig.minWager > mutbBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${gameConfig.minWager} MUTB to play this game.`,
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    setSearchProgress(0)
    setEstimatedWait(30)
    toast({
      title: "Searching for Match",
      description: "Looking for other players...",
    })
  }

  const handleCancelMatchmaking = () => {
    setIsSearching(false)
    setSearchProgress(0)
    setEstimatedWait(30)
    toast({
      title: "Search Cancelled",
      description: "Matchmaking has been cancelled.",
    })
  }

  const handleMatchFound = () => {
    toast({
      title: "Match Found!",
      description: "Starting game...",
    })
    setGameStarted(true)
    setIsGamePopOutOpen(true)
  }

  const handleGameOver = (stats: any) => {
    toast({
      title: "Game Over!",
      description: `Final result: ${stats.result}`,
    })
    setIsGamePopOutOpen(false)
    setGameStarted(false)
  }

  const handleClosePopOut = () => {
    if (window.confirm("Are you sure you want to exit the game? Your progress will be lost.")) {
      setIsGamePopOutOpen(false)
      setGameStarted(false)
    }
  }

  const renderGameContent = () => {
    return (
      <div className="w-full h-full">
        <GameContainer
          gameId={selectedGame}
          playerId={publicKey}
          playerName={playerName}
          isHost={true}
          gameMode="pvp"
          onGameEnd={handleGameOver}
        />
      </div>
    )
  }

  if (gameStarted) {
    return (
      <>
        <GamePopOutContainer
          isOpen={isGamePopOutOpen}
          onClose={handleClosePopOut}
          title={gameConfig.name.toUpperCase()}
        >
          {renderGameContent()}
        </GamePopOutContainer>

        {!isGamePopOutOpen && (
          <Card
            className={cn(
              "bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
              isCyberpunk && "!bg-black/80 !border-cyan-500/50",
            )}
            style={isCyberpunk ? { backgroundColor: "rgba(0, 0, 0, 0.8)", borderColor: "rgba(6, 182, 212, 0.5)" } : {}}
          >
            <CardHeader>
              <CardTitle className="text-center font-mono">GAME IN PROGRESS</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-xl font-bold font-mono">Your game is currently running</div>
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
                RETURN TO GAME
              </SoundButton>
            </CardFooter>
          </Card>
        )}
      </>
    )
  }

  return (
    <Card
      className={cn(
        "bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        isCyberpunk && "!bg-black/80 !border-cyan-500/50",
      )}
      style={isCyberpunk ? { backgroundColor: "rgba(0, 0, 0, 0.8)", borderColor: "rgba(6, 182, 212, 0.5)" } : {}}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {gameConfig.icon}
            <CardTitle className="font-mono">{gameConfig.name.toUpperCase()}</CardTitle>
          </div>
        </div>
        <CardDescription>{isSearching ? "Searching for opponents..." : "Ready to find a match"}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Game Info */}
        <div
          className={cn(
            "p-4 border-2 border-black rounded-md bg-[#f5efdc]",
            isCyberpunk && "!bg-black/50 !border-cyan-500/50",
          )}
          style={isCyberpunk ? { backgroundColor: "rgba(0, 0, 0, 0.5)", borderColor: "rgba(6, 182, 212, 0.5)" } : {}}
        >
          <h3 className={cn("font-bold mb-2 font-mono", isCyberpunk && "text-cyan-400")}>GAME DETAILS</h3>
          <p className={cn("text-sm mb-3", isCyberpunk && "text-cyan-300/70")}>{gameConfig.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className={cn("h-4 w-4", isCyberpunk && "text-cyan-400")} />
              <span className={isCyberpunk ? "text-cyan-300" : ""}>Max {gameConfig.maxPlayers} Players</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className={cn("h-4 w-4", isCyberpunk && "text-cyan-400")} />
              <span className={isCyberpunk ? "text-cyan-300" : ""}>{gameConfig.estimatedDuration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className={cn("h-4 w-4", isCyberpunk && "text-cyan-400")} />
              <span className={isCyberpunk ? "text-cyan-300" : ""}>Min Wager: {gameConfig.minWager} MUTB</span>
            </div>
            <div className="flex items-center gap-2">
              {connectionStatus === "connected" ? (
                <Wifi className={cn("h-4 w-4 text-green-500", isCyberpunk && "text-cyan-400")} />
              ) : (
                <WifiOff className={cn("h-4 w-4 text-red-500", isCyberpunk && "text-pink-400")} />
              )}
              <span className={isCyberpunk ? "text-cyan-300" : ""}>
                {connectionStatus === "connected" ? "Connected" : "Connecting..."}
              </span>
            </div>
          </div>
        </div>

        {/* Matchmaking Status */}
        {isSearching && (
          <div
            className={cn(
              "p-4 border-2 border-black rounded-md bg-[#f5efdc]",
              isCyberpunk && "!bg-black/50 !border-cyan-500/50",
            )}
            style={isCyberpunk ? { backgroundColor: "rgba(0, 0, 0, 0.5)", borderColor: "rgba(6, 182, 212, 0.5)" } : {}}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className={cn("font-bold font-mono", isCyberpunk && "text-cyan-400")}>SEARCHING FOR MATCH</h3>
              <span className={cn("text-sm", isCyberpunk && "text-cyan-300")}>Est. {estimatedWait}s</span>
            </div>
            <Progress
              value={searchProgress}
              className={cn(
                "mb-2",
                isCyberpunk && "[&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-purple-500",
              )}
            />
            <p className={cn("text-sm text-center", isCyberpunk && "text-cyan-300/70")}>
              Looking for {gameConfig.maxPlayers - 1} more player{gameConfig.maxPlayers > 2 ? "s" : ""}...
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-4">
          <SoundButton
            className={cn(lightButtonStyle, isCyberpunk && "!border-cyan-500/50 !text-cyan-400 hover:!bg-cyan-900/30")}
            onClick={onExit}
            disabled={isSearching}
          >
            BACK TO GAME SELECTION
          </SoundButton>

          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-1 font-mono",
              isCyberpunk
                ? "bg-black/70 text-cyan-400 border border-cyan-500/50"
                : "bg-[#FFD54F] text-black border-2 border-black",
            )}
          >
            <Image src="/images/mutable-token.png" alt="MUTB" width={16} height={16} className="rounded-full" />
            {mutbBalance.toFixed(2)} MUTB
          </Badge>
        </div>

        {isSearching ? (
          <SoundButton
            className={cn(
              "bg-red-500 hover:bg-red-600 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono",
              isCyberpunk && "!bg-pink-500 !hover:bg-pink-600 !border-pink-400",
            )}
            onClick={withClickSound(handleCancelMatchmaking)}
          >
            CANCEL SEARCH
          </SoundButton>
        ) : (
          <SoundButton
            className={cn(
              lightButtonStyle,
              isCyberpunk && "!bg-gradient-to-r !from-cyan-500 !to-purple-500 !text-black !border-cyan-400",
            )}
            onClick={withClickSound(handleStartMatchmaking)}
            disabled={gameConfig.minWager > mutbBalance}
          >
            {gameConfig.minWager > mutbBalance ? "INSUFFICIENT FUNDS" : "FIND MATCH"}
          </SoundButton>
        )}
      </CardFooter>
    </Card>
  )
}
