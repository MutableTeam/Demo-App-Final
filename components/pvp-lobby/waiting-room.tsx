"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, Clock, Loader2, User, Users } from "lucide-react"
import SoundButton from "../sound-button"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import type { Token } from "@/config/token-registry"
import Image from "next/image"

interface WaitingRoomProps {
  lobbyId: string
  hostId: string
  hostName: string
  publicKey: string
  playerName: string
  maxPlayers: number
  wager: number
  wagerToken: Token
  gameMode: string
  onExit: () => void
  onGameStart: () => void
}

export default function WaitingRoom({
  lobbyId,
  hostId,
  hostName,
  publicKey,
  playerName,
  maxPlayers,
  wager,
  wagerToken,
  gameMode,
  onExit,
  onGameStart,
}: WaitingRoomProps) {
  const [players, setPlayers] = useState(() => {
    const initialPlayers = [{ id: hostId, name: hostName, isReady: false }]
    if (hostId !== publicKey) {
      initialPlayers.push({ id: publicKey, name: playerName, isReady: true })
    } else {
      initialPlayers[0].isReady = true
    }
    return initialPlayers
  })

  const [isReady, setIsReady] = useState(publicKey !== hostId)
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  const isHost = publicKey === hostId
  const allPlayersReady = players.every((p) => p.isReady)
  const lobbyFull = players.length === maxPlayers

  useEffect(() => {
    // Simulate other players joining and getting ready
    const interval = setInterval(() => {
      setPlayers((prevPlayers) => {
        if (prevPlayers.length < maxPlayers && Math.random() > 0.7) {
          const newPlayerId = `player-${Date.now()}`
          const newPlayer = {
            id: newPlayerId,
            name: `Player_${newPlayerId.slice(-4)}`,
            isReady: Math.random() > 0.3,
          }
          return [...prevPlayers, newPlayer].filter(
            (player, index, self) => index === self.findIndex((p) => p.id === player.id),
          )
        }
        return prevPlayers.map((p) =>
          p.id !== publicKey && !p.isReady && Math.random() > 0.7 ? { ...p, isReady: true } : p,
        )
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [maxPlayers, publicKey])

  const toggleReady = () => {
    const newReadyState = !isReady
    setIsReady(newReadyState)
    setPlayers(players.map((p) => (p.id === publicKey ? { ...p, isReady: newReadyState } : p)))
  }

  const cardClass = isCyberpunk
    ? "!bg-black/80 !border-cyan-500/50"
    : "bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
  const titleClass = isCyberpunk ? "text-cyan-400" : ""
  const descriptionClass = isCyberpunk ? "text-cyan-300/70" : ""
  const buttonClass = isCyberpunk
    ? "!bg-gradient-to-r !from-cyan-500 !to-purple-500 !text-black !border-cyan-400"
    : "bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"

  return (
    <Card className={cn(cardClass)}>
      <CardHeader>
        <CardTitle className={cn("font-mono text-center", titleClass)}>WAITING ROOM</CardTitle>
        <CardDescription className={cn("text-center flex items-center justify-center gap-2", descriptionClass)}>
          {gameMode} -
          <div className="flex items-center gap-1">
            <Image src={wagerToken.logoURI || "/placeholder.svg"} alt={wagerToken.symbol} width={16} height={16} />
            <span>
              {wager} {wagerToken.symbol} Wager
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            "p-4 rounded-lg border-2",
            isCyberpunk ? "bg-black/50 border-cyan-500/30" : "bg-[#f5efdc] border-black",
          )}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className={cn("font-bold font-mono flex items-center gap-2", titleClass)}>
              <Users className="h-5 w-5" /> PLAYERS ({players.length}/{maxPlayers})
            </h3>
            {lobbyFull && allPlayersReady ? (
              <Badge
                variant="outline"
                className={cn(isCyberpunk ? "text-green-400 border-green-400" : "text-green-600")}
              >
                Ready to Start
              </Badge>
            ) : (
              <Badge variant="outline" className={cn(isCyberpunk ? "text-yellow-400 border-yellow-400" : "")}>
                Waiting for players...
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-md",
                  isCyberpunk ? "bg-black/30" : "bg-white/50",
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${player.name}`} />
                    <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                  <span className={cn("font-medium", descriptionClass)}>{player.name}</span>
                  {player.id === hostId && <Badge variant="secondary">Host</Badge>}
                </div>
                {player.isReady ? (
                  <div className="flex items-center gap-1 text-green-500">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Ready</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Waiting</span>
                  </div>
                )}
              </div>
            ))}
            {Array.from({ length: maxPlayers - players.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className={cn(
                  "flex items-center justify-between p-2 rounded-md",
                  isCyberpunk ? "bg-black/30" : "bg-white/50",
                )}
              >
                <div className="flex items-center gap-3 text-gray-500">
                  <Avatar className="h-8 w-8 bg-gray-600">
                    <User className="h-5 w-5 m-auto text-gray-400" />
                  </Avatar>
                  <span className="font-medium">Waiting for player...</span>
                </div>
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {isHost ? (
          <SoundButton
            className={cn(buttonClass, "w-full")}
            disabled={!lobbyFull || !allPlayersReady}
            onClick={onGameStart}
          >
            {lobbyFull && allPlayersReady ? "START GAME" : "WAITING FOR PLAYERS..."}
          </SoundButton>
        ) : (
          <SoundButton className={cn(buttonClass, "w-full")} onClick={toggleReady}>
            {isReady ? "SET NOT READY" : "SET READY"}
          </SoundButton>
        )}
        <SoundButton
          variant="outline"
          className={cn(
            "w-full",
            isCyberpunk && "border-pink-500/50 text-pink-400 hover:bg-pink-900/30",
            !isCyberpunk && "border-2 border-black",
          )}
          onClick={onExit}
        >
          LEAVE LOBBY
        </SoundButton>
      </CardFooter>
    </Card>
  )
}
