"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import { Crown, Loader2 } from "lucide-react"
import SoundButton from "../sound-button"
import { withClickSound } from "@/utils/sound-utils"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"

interface Player {
  id: string
  name: string
  isHost: boolean
}

interface WaitingRoomProps {
  lobbyId: string
  hostId: string
  hostName: string
  publicKey: string
  playerName: string
  maxPlayers: number
  wager: number
  gameMode: string
  onExit: () => void
  onGameStart: () => void
}

const botNames = ["NeonNinja", "CyberSamurai", "GlitchGamer", "QuantumQueen", "DataDuelist", "PixelPaladin"]

export default function WaitingRoom({
  lobbyId,
  hostId,
  hostName,
  publicKey,
  playerName,
  maxPlayers,
  wager,
  gameMode,
  onExit,
  onGameStart,
}: WaitingRoomProps) {
  const [players, setPlayers] = useState<Player[]>([{ id: publicKey, name: playerName, isHost: publicKey === hostId }])
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"
  const isReadyToStart = players.length === maxPlayers

  useEffect(() => {
    if (players.length >= maxPlayers) {
      return
    }

    const interval = setInterval(
      () => {
        setPlayers((prevPlayers) => {
          if (prevPlayers.length < maxPlayers) {
            const botName = botNames[Math.floor(Math.random() * botNames.length)]
            const newBot: Player = {
              id: `bot-${Date.now()}`,
              name: botName,
              isHost: false,
            }
            if (!prevPlayers.some((p) => p.id === newBot.id)) {
              return [...prevPlayers, newBot]
            }
          }
          return prevPlayers
        })
      },
      2000 + Math.random() * 3000,
    )

    return () => clearInterval(interval)
  }, [players.length, maxPlayers])

  const renderCard = (content: React.ReactNode) => {
    if (isCyberpunk) {
      return (
        <Card className="bg-black/80 border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(0,255,255,0.3)] text-cyan-300">
          {content}
        </Card>
      )
    }
    return <Card className="bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{content}</Card>
  }

  const renderStartButton = () => {
    const commonCyberpunkClass = `w-full font-mono text-lg py-6 transition-all duration-300 bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold shadow-[0_0_15px_rgba(0,255,255,0.5)] hover:shadow-[0_0_25px_rgba(0,255,255,0.8)]`
    const commonArcadeClass = `w-full font-mono text-lg py-4 transition-all bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]`

    if (isCyberpunk) {
      return (
        <Button
          className={`${commonCyberpunkClass} ${!isReadyToStart ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={onGameStart} // No sound wrapper
          disabled={!isReadyToStart}
        >
          {!isReadyToStart && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          START GAME
        </Button>
      )
    }
    return (
      <Button
        className={`${commonArcadeClass} ${!isReadyToStart ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={onGameStart} // No sound wrapper
        disabled={!isReadyToStart}
      >
        {!isReadyToStart && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        START GAME
      </Button>
    )
  }

  const renderLeaveButton = () => {
    if (isCyberpunk) {
      return (
        <Button
          className="w-full font-mono text-lg py-6 transition-all duration-300 bg-transparent border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/20"
          onClick={withClickSound(onExit)}
        >
          LEAVE LOBBY
        </Button>
      )
    }
    return (
      <SoundButton
        className="w-full font-mono text-lg py-4 transition-all bg-gray-200 hover:bg-gray-300 text-black border-2 border-black"
        onClick={onExit}
      >
        LEAVE LOBBY
      </SoundButton>
    )
  }

  return renderCard(
    <>
      <CardHeader className="text-center">
        <CardTitle className="font-mono text-3xl">WAITING ROOM</CardTitle>
        <CardDescription className={isCyberpunk ? "text-cyan-400/70" : ""}>
          {gameMode} - {maxPlayers} Players
        </CardDescription>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Badge
            variant="secondary"
            className={isCyberpunk ? "bg-purple-500/20 border-purple-400 text-purple-300" : ""}
          >
            Wager: {wager} MUTB
          </Badge>
          <Badge variant="secondary" className={isCyberpunk ? "bg-cyan-500/20 border-cyan-400 text-cyan-300" : ""}>
            Lobby ID: {lobbyId.slice(-6)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[160px]">
          <AnimatePresence>
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-3 rounded-lg flex items-center gap-3 ${
                  isCyberpunk ? "bg-cyan-900/20 border border-cyan-500/30" : "bg-gray-100 border"
                }`}
              >
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/8.x/bottts/svg?seed=${player.name}`} />
                  <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <p className="font-semibold font-mono">{player.name}</p>
                  {player.isHost && (
                    <Badge variant="outline" className={isCyberpunk ? "border-yellow-400 text-yellow-400" : ""}>
                      <Crown className="h-3 w-3 mr-1" /> Host
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {Array.from({ length: maxPlayers - players.length }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className={`p-3 rounded-lg flex items-center justify-center gap-3 border-dashed ${
                isCyberpunk ? "border-cyan-500/30 text-cyan-500/50" : "border-gray-300 text-gray-400"
              }`}
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Waiting for player...</span>
            </div>
          ))}
        </div>
        <div className="text-center p-4 rounded-lg bg-opacity-50">
          {isReadyToStart ? (
            <div className="text-2xl font-bold font-mono animate-pulse">
              {isCyberpunk ? (
                <span className="text-green-400">LOBBY FULL! READY TO START.</span>
              ) : (
                <span className="text-green-600">Lobby Full! Ready to Start.</span>
              )}
            </div>
          ) : (
            <div className="text-lg font-mono">Waiting for {maxPlayers - players.length} more player(s)...</div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        {renderStartButton()}
        {renderLeaveButton()}
      </CardFooter>
    </>,
  )
}
