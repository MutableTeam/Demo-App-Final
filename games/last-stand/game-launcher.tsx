"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Gamepad2 } from "lucide-react"
import Image from "next/image"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import GameContainer from "@/components/game-container"
import { usePlatform } from "@/contexts/platform-context"
import MobileGameContainer from "@/components/mobile-game-container"
import GameControllerEnhanced from "@/components/pvp-game/game-controller-enhanced"

interface LastStandGameLauncherProps {
  publicKey: string
  playerName: string
  mutbBalance: number
  onExit: () => void
}

export default function LastStandGameLauncher({
  publicKey,
  playerName,
  mutbBalance,
  onExit,
}: LastStandGameLauncherProps) {
  const [gameStarted, setGameStarted] = useState(false)
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"
  const { platformType } = usePlatform()

  const [joystickState, setJoystickState] = useState({ x: 0, y: 0 })
  const [actionState, setActionState] = useState<{ action: string; pressed: boolean } | null>(null)

  const handleStartGame = () => {
    setGameStarted(true)
  }

  const handleGameEnd = (winner: string | null) => {
    console.log("Game ended, winner:", winner)
    setGameStarted(false)
    onExit()
  }

  const handleJoystickMove = (direction: { x: number; y: number }) => {
    setJoystickState(direction)
  }

  const handleActionPress = (action: string, pressed: boolean) => {
    setActionState({ action, pressed })
  }

  if (gameStarted) {
    if (platformType === "mobile") {
      return (
        <MobileGameContainer onJoystickMove={handleJoystickMove} onActionPress={handleActionPress}>
          <GameControllerEnhanced
            gameId="last-stand"
            playerId={publicKey}
            playerName={playerName}
            isHost={true}
            gameMode="pve"
            onGameEnd={handleGameEnd}
            platformType="mobile"
            joystickInput={joystickState}
            actionInput={actionState}
          />
        </MobileGameContainer>
      )
    }

    return (
      <GameContainer
        gameId="last-stand"
        playerId={publicKey}
        playerName={playerName}
        isHost={true}
        gameMode="pve"
        onGameEnd={handleGameEnd}
      />
    )
  }

  const cardClass = isCyberpunk
    ? "bg-black/80 border-cyan-500/50 text-cyan-200"
    : "border-4 border-black bg-[#FFD54F] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
  const titleClass = isCyberpunk ? "text-cyan-400" : "text-black"
  const descriptionClass = isCyberpunk ? "text-cyan-300/80" : "text-gray-800"
  const buttonClass = isCyberpunk
    ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 hover:bg-cyan-500/40"
    : "bg-green-500 border-2 border-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-green-600"

  return (
    <div className="w-full">
      <Button
        variant="outline"
        onClick={onExit}
        className={cn("mb-4", isCyberpunk ? "text-cyan-300 border-cyan-500/50" : "border-2 border-black")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Games
      </Button>
      <Card className={cn("w-full", cardClass)}>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Image
              src="/images/last-stand-card.png"
              alt="Last Stand"
              width={128}
              height={128}
              className="rounded-lg border-2 border-black"
            />
            <div>
              <CardTitle className={cn("text-3xl font-mono", titleClass)}>Last Stand</CardTitle>
              <CardDescription className={cn("mt-2", descriptionClass)}>
                Survive against endless waves of enemies. How long can you last?
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <Card className={cn("p-4", cardClass)}>
              <h3 className={cn("font-bold font-mono", titleClass)}>OBJECTIVE</h3>
              <p className={cn("text-sm mt-1", descriptionClass)}>Survive as many waves as possible.</p>
            </Card>
            <Card className={cn("p-4", cardClass)}>
              <h3 className={cn("font-bold font-mono", titleClass)}>ENEMIES</h3>
              <p className={cn("text-sm mt-1", descriptionClass)}>Increasingly difficult waves of monsters.</p>
            </Card>
            <Card className={cn("p-4", cardClass)}>
              <h3 className={cn("font-bold font-mono", titleClass)}>WAGER</h3>
              <p className={cn("text-sm mt-1", descriptionClass)}>Wager MUTB to enter. Higher score, bigger rewards.</p>
            </Card>
          </div>
          <div className="text-center">
            <Button
              size="lg"
              className={cn("w-full md:w-1/2 text-lg font-bold", buttonClass)}
              onClick={handleStartGame}
            >
              <Gamepad2 className="mr-2 h-5 w-5" />
              Start Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
