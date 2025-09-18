"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Rocket, Smartphone, Monitor } from "lucide-react"
import Image from "next/image"
import SoundButton from "@/components/sound-button"
import { galacticVanguardConfig } from "./config"
import GalacticVanguardInstructions from "./instructions"
import { withClickSound } from "@/utils/sound-utils"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { usePlatform } from "@/contexts/platform-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import SpaceShooter from "./space-shooter"
import GamePopOutContainer, { type GamePopOutContainerRef } from "@/components/game-pop-out-container"

interface GalacticVanguardGameLauncherProps {
  publicKey: string
  playerName: string
  mutbBalance: number
  onExit: () => void
  isCyberpunk?: boolean
}

export default function GalacticVanguardGameLauncher({
  publicKey,
  playerName,
  mutbBalance,
  onExit,
  isCyberpunk,
}: GalacticVanguardGameLauncherProps) {
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [isGamePopOutOpen, setIsGamePopOutOpen] = useState(false)
  const { toast } = useToast()
  const { platformType } = usePlatform()
  const isMobile = platformType === "mobile"
  const popOutRef = useRef<GamePopOutContainerRef>(null)

  const lightButtonStyle =
    "bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"

  const handleModeSelect = (modeId: string) => {
    const mode = galacticVanguardConfig.modes.find((m) => m.id === modeId)
    if (!mode) return

    const entryFee = mode.entryFee || mode.minWager || 0
    if (entryFee > mutbBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${entryFee} MUTB to enter this mode.`,
        variant: "destructive",
      })
      return
    }

    setSelectedMode(modeId)
  }

  const handleStartGame = () => {
    setGameStarted(true)
    setIsGamePopOutOpen(true)
    setTimeout(() => {
      popOutRef.current?.triggerFullscreen()
    }, 100)

    toast({
      title: "Loading Game",
      description: "Space Defender is loading...",
    })
  }

  const handleClosePopOut = () => {
    setIsGamePopOutOpen(false)
    if (gameStarted) {
      setGameStarted(false)
      setSelectedMode(null)
    }
  }

  const handleGameOver = () => {
    // Game over is handled within the SpaceShooter component
    // This is just for consistency with Last Stand pattern
  }

  const renderGameContent = () => {
    if (!gameStarted) return null
    return (
      <div className="w-full h-full">
        <SpaceShooter
          playerName={playerName}
          onExit={handleClosePopOut}
          isMobile={isMobile}
          platformType={platformType}
        />
      </div>
    )
  }

  if (gameStarted && selectedMode) {
    return (
      <>
        <GamePopOutContainer
          ref={popOutRef}
          isOpen={isGamePopOutOpen}
          onClose={handleClosePopOut}
          title="GALACTIC VANGUARD"
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
            data-game="galactic-vanguard"
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
                onClick={() => {
                  popOutRef.current?.triggerFullscreen()
                  setIsGamePopOutOpen(true)
                }}
              >
                RESUME GAME
              </SoundButton>
            </CardFooter>
          </Card>
        )}
      </>
    )
  }

  if (selectedMode === "iframe-game") {
    const gameUrl = galacticVanguardConfig.externalUrl || "https://galactic-vanguard-c1030fc2.base44.app"
    const fullGameUrl = `${gameUrl}?player=${encodeURIComponent(playerName)}&id=${encodeURIComponent(publicKey)}&embedded=true&autostart=true`

    return (
      <Card
        className={cn(
          "bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          isCyberpunk && "!bg-black/80 !border-cyan-500/50",
          isMobile ? "w-full h-full max-w-none border-0 rounded-none" : "w-full max-w-6xl mx-auto",
        )}
        style={isCyberpunk ? { backgroundColor: "rgba(0, 0, 0, 0.8)", borderColor: "rgba(6, 182, 212, 0.5)" } : {}}
        data-game="galactic-vanguard"
      >
        <CardHeader className={cn(isMobile ? "p-2" : "p-6")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Rocket className={cn("h-5 w-5", isCyberpunk && "text-cyan-400")} />
              <CardTitle className={cn("font-mono", isMobile ? "text-base" : "text-xl")}>GALACTIC VANGUARD</CardTitle>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {isMobile ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
              <span>{isMobile ? "Mobile" : "Desktop"}</span>
            </div>
          </div>
          <CardDescription className={cn(isMobile ? "text-xs" : "text-sm")}>Game is loading...</CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className={cn("relative", isMobile ? "h-[calc(100vh-140px)] min-h-[300px]" : "h-[600px] max-h-[70vh]")}>
            <iframe
              src={fullGameUrl}
              className="w-full h-full border-0 rounded-lg"
              title="Galactic Vanguard Game"
              allow="fullscreen; gamepad; accelerometer; gyroscope; autoplay; microphone; camera"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-presentation allow-top-navigation-by-user-activation"
              loading="eager"
              onLoad={() => {
                console.log("[v0] Galactic Vanguard iframe loaded successfully")
              }}
              onError={() => {
                console.error("[v0] Galactic Vanguard iframe failed to load")
                toast({
                  title: "Game Loading Error",
                  description: "Failed to load the game. Please try again.",
                  variant: "destructive",
                })
              }}
            />
          </div>
        </CardContent>

        <CardFooter className={cn("flex justify-between", isMobile ? "p-2 gap-2" : "p-6")}>
          <SoundButton
            className={cn(
              lightButtonStyle,
              isCyberpunk && "!border-cyan-500/50 !text-cyan-400 hover:!bg-cyan-900/30",
              isMobile ? "text-xs px-3 py-2" : "",
            )}
            onClick={() => setSelectedMode(null)}
          >
            BACK TO MENU
          </SoundButton>

          <SoundButton
            className={cn(
              lightButtonStyle,
              isCyberpunk && "!bg-gradient-to-r !from-cyan-500 !to-purple-500 !text-black !border-cyan-400",
              isMobile ? "text-xs px-3 py-2" : "",
            )}
            onClick={() => {
              const iframe = document.querySelector('iframe[title="Galactic Vanguard Game"]') as HTMLIFrameElement
              if (iframe && iframe.requestFullscreen) {
                iframe.requestFullscreen()
              }
            }}
          >
            FULLSCREEN
          </SoundButton>
        </CardFooter>
      </Card>
    )
  }

  if (selectedMode) {
    const mode = galacticVanguardConfig.modes.find((m) => m.id === selectedMode)!

    return (
      <Card
        className={cn(
          "bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          isCyberpunk && "!bg-black/80 !border-cyan-500/50",
          isMobile ? "w-full h-full max-w-none border-0 rounded-none" : "w-full max-w-4xl mx-auto",
        )}
        style={isCyberpunk ? { backgroundColor: "rgba(0, 0, 0, 0.8)", borderColor: "rgba(6, 182, 212, 0.5)" } : {}}
        data-game="galactic-vanguard"
      >
        <CardHeader className={cn(isMobile ? "p-3" : "p-6")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Rocket className={cn("h-5 w-5", isCyberpunk && "text-cyan-400")} />
              <CardTitle className={cn("font-mono", isMobile ? "text-lg" : "text-xl")}>GALACTIC VANGUARD</CardTitle>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {isMobile ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
              <span>{isMobile ? "Mobile" : "Desktop"}</span>
            </div>
          </div>
          <CardDescription className={cn(isMobile ? "text-sm" : "text-base")}>
            Confirm your entry to {mode.name}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className={cn("p-4", isMobile ? "h-[calc(100vh-220px)] min-h-[200px]" : "max-h-[60vh]")}>
            <GalacticVanguardInstructions mode={mode} isCyberpunk={isCyberpunk} isMobile={isMobile} />
          </ScrollArea>
        </CardContent>

        <CardFooter className={cn("flex justify-between", isMobile ? "p-3 gap-2" : "p-6")}>
          <SoundButton
            className={cn(
              lightButtonStyle,
              isCyberpunk && "!border-cyan-500/50 !text-cyan-400 hover:!bg-cyan-900/30",
              isMobile ? "text-sm px-4 py-3 min-h-[44px]" : "",
            )}
            onClick={() => setSelectedMode(null)}
          >
            BACK
          </SoundButton>

          <SoundButton
            className={cn(
              lightButtonStyle,
              isCyberpunk && "!bg-gradient-to-r !from-cyan-500 !to-purple-500 !text-black !border-cyan-400",
              isMobile ? "text-sm px-4 py-3 min-h-[44px]" : "",
            )}
            onClick={handleStartGame}
          >
            {(mode.entryFee || mode.minWager || 0) > 0
              ? `PAY ${mode.entryFee || mode.minWager} MUTB & LAUNCH`
              : "LAUNCH GAME"}
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
        isMobile ? "w-full h-full max-w-none border-0 rounded-none" : "w-full max-w-4xl mx-auto",
      )}
      style={isCyberpunk ? { backgroundColor: "rgba(0, 0, 0, 0.8)", borderColor: "rgba(6, 182, 212, 0.5)" } : {}}
      data-game="galactic-vanguard"
    >
      <CardHeader className={cn(isMobile ? "p-4" : "p-6")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className={cn("h-5 w-5", isCyberpunk && "text-cyan-400")} />
            <CardTitle className={cn("font-mono", isMobile ? "text-xl" : "text-2xl")}>GALACTIC VANGUARD</CardTitle>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {isMobile ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
            <span>{isMobile ? "Mobile" : "Desktop"}</span>
          </div>
        </div>
        <CardDescription className={cn(isMobile ? "text-base" : "text-lg")}>
          Select a game mode to begin your space adventure
        </CardDescription>
      </CardHeader>

      <CardContent className={cn(isMobile ? "p-4" : "p-6")}>
        <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3")}>
          {galacticVanguardConfig.modes.map((mode) => (
            <Card
              key={mode.id}
              className={cn(
                "border-2 border-black overflow-hidden cursor-pointer hover:bg-[#f5efdc] transition-colors flex flex-col",
                isCyberpunk && "!bg-black/80 !border-cyan-500/50 hover:!bg-black/60",
                isMobile && "min-h-[120px]",
              )}
              style={
                isCyberpunk
                  ? {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      borderColor: "rgba(6, 182, 212, 0.5)",
                    }
                  : {}
              }
              onClick={withClickSound(() => handleModeSelect(mode.id))}
            >
              <CardHeader className={cn(isMobile ? "p-4" : "p-4")}>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "p-1 rounded-md flex items-center justify-center w-8 h-8",
                      isCyberpunk
                        ? "bg-transparent border border-cyan-500/70 text-cyan-400 shadow-[0_0_5px_rgba(0,255,255,0.5)]"
                        : "bg-transparent border border-gray-400",
                    )}
                  >
                    <Rocket className={cn("h-5 w-5", isCyberpunk && "text-cyan-400")} />
                  </div>
                  <CardTitle className={cn("font-mono", isMobile ? "text-base" : "text-lg")}>{mode.name}</CardTitle>
                </div>
              </CardHeader>

              <CardContent className={cn("pt-0 flex-grow", isMobile ? "p-4" : "p-4")}>
                <p className={cn("text-sm text-muted-foreground leading-relaxed", isCyberpunk && "text-gray-400")}>
                  {mode.description}
                </p>

                <div className={cn("mt-3 text-sm flex items-center gap-2", isCyberpunk && "text-cyan-400/80")}>
                  <span className="font-medium">Entry Fee:</span>
                  <div className="flex items-center gap-1">
                    <Image src="/images/mutable-token.png" alt="MUTB" width={16} height={16} />
                    <span>{mode.entryFee || mode.minWager || 0} MUTB</span>
                  </div>
                </div>

                {mode.duration && mode.duration > 0 && (
                  <div className={cn("mt-2 text-sm flex items-center gap-2", isCyberpunk && "text-cyan-400/80")}>
                    <span className="font-medium">Duration:</span>
                    <span>
                      {mode.duration / (60 * 60 * 1000) >= 1
                        ? `${mode.duration / (60 * 60 * 1000)} hours`
                        : `${mode.duration / (60 * 1000)} minutes`}
                    </span>
                  </div>
                )}
              </CardContent>

              <CardFooter className={cn("mt-auto", isMobile ? "p-4" : "p-4")}>
                <SoundButton
                  className={cn(
                    lightButtonStyle,
                    "w-full",
                    isCyberpunk && "!bg-gradient-to-r !from-cyan-500 !to-purple-500 !text-black !border-cyan-400",
                    isMobile ? "text-base py-3 min-h-[48px] font-bold" : "py-3",
                  )}
                  onClick={() => handleModeSelect(mode.id)}
                  disabled={(mode.entryFee || mode.minWager || 0) > mutbBalance}
                >
                  {(mode.entryFee || mode.minWager || 0) > mutbBalance ? "INSUFFICIENT FUNDS" : "SELECT"}
                </SoundButton>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
