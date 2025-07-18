"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Users, Clock, Trophy, X, Gamepad2, Wifi, WifiOff } from "lucide-react"

interface Player {
  id: string
  name: string
  avatar?: string
  level: number
  winRate: number
  isReady: boolean
  isHost?: boolean
}

interface WaitingRoomProps {
  gameId: string
  onGameStart: () => void
  onCancel: () => void
}

const MOCK_PLAYERS: Player[] = [
  {
    id: "1",
    name: "You",
    level: 15,
    winRate: 68,
    isReady: true,
    isHost: true,
  },
  {
    id: "2",
    name: "CryptoGamer",
    level: 22,
    winRate: 74,
    isReady: true,
  },
  {
    id: "3",
    name: "PixelMaster",
    level: 18,
    winRate: 61,
    isReady: false,
  },
]

export function WaitingRoom({ gameId, onGameStart, onCancel }: WaitingRoomProps) {
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error">("connecting")

  useEffect(() => {
    // Simulate connection
    const timer = setTimeout(() => {
      setConnectionStatus("connected")
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Start countdown when all players are ready
    const allReady = players.every((p) => p.isReady)
    if (allReady && players.length >= 2 && countdown === null) {
      setCountdown(5)
    }
  }, [players, countdown])

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      onGameStart()
    }
  }, [countdown, onGameStart])

  const toggleReady = (playerId: string) => {
    setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, isReady: !p.isReady } : p)))
  }

  const getGameInfo = () => {
    switch (gameId) {
      case "pixel-pool":
        return {
          title: "Pixel Pool",
          maxPlayers: 2,
          wager: "10 MUTB",
          prize: "20 MUTB",
        }
      case "archer-arena":
        return {
          title: "Archer Arena",
          maxPlayers: 4,
          wager: "25 MUTB",
          prize: "100 MUTB",
        }
      case "last-stand":
        return {
          title: "Last Stand",
          maxPlayers: 4,
          wager: "15 MUTB",
          prize: "60 MUTB",
        }
      default:
        return {
          title: "Unknown Game",
          maxPlayers: 2,
          wager: "10 MUTB",
          prize: "20 MUTB",
        }
    }
  }

  const gameInfo = getGameInfo()
  const readyCount = players.filter((p) => p.isReady).length
  const allReady = players.every((p) => p.isReady)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gamepad2 className="h-6 w-6" />
              <div>
                <CardTitle>{gameInfo.title} - Waiting Room</CardTitle>
                <CardDescription>Waiting for players to join and ready up</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm">
                {connectionStatus === "connecting" && (
                  <>
                    <WifiOff className="h-4 w-4 text-yellow-500" />
                    <span className="text-yellow-600">Connecting...</span>
                  </>
                )}
                {connectionStatus === "connected" && (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">Connected</span>
                  </>
                )}
                {connectionStatus === "error" && (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span className="text-red-600">Connection Error</span>
                  </>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={onCancel}>
                <X className="h-4 w-4 mr-1" />
                Leave
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Players */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Players ({players.length}/{gameInfo.maxPlayers})
                </span>
                <Badge variant={allReady ? "default" : "secondary"}>
                  {readyCount}/{players.length} Ready
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {players.map((player, index) => (
                <div key={player.id}>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={player.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{player.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{player.name}</span>
                          {player.isHost && <Badge variant="outline">Host</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Level {player.level} • {player.winRate}% Win Rate
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {player.isReady ? (
                        <Badge className="bg-green-500">Ready</Badge>
                      ) : (
                        <Badge variant="secondary">Not Ready</Badge>
                      )}
                      {player.id === "1" && (
                        <Button
                          size="sm"
                          variant={player.isReady ? "outline" : "default"}
                          onClick={() => toggleReady(player.id)}
                        >
                          {player.isReady ? "Not Ready" : "Ready Up"}
                        </Button>
                      )}
                    </div>
                  </div>
                  {index < players.length - 1 && <Separator className="my-2" />}
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: gameInfo.maxPlayers - players.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="flex items-center justify-center p-8 rounded-lg border-2 border-dashed border-muted"
                >
                  <div className="text-center text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p>Waiting for player...</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Game Info & Status */}
        <div className="space-y-6">
          {/* Game Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Game Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wager:</span>
                  <span className="font-medium">{gameInfo.wager}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prize Pool:</span>
                  <span className="font-medium text-green-600">{gameInfo.prize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Players:</span>
                  <span className="font-medium">{gameInfo.maxPlayers}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Countdown */}
          {countdown !== null && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Starting Soon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{countdown}</div>
                  <p className="text-muted-foreground">Game starts in...</p>
                  <Progress value={(5 - countdown) * 20} className="mt-4" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status */}
          {countdown === null && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  {!allReady ? (
                    <>
                      <p className="text-muted-foreground">Waiting for all players to ready up</p>
                      <Progress value={(readyCount / players.length) * 100} />
                    </>
                  ) : players.length < 2 ? (
                    <p className="text-muted-foreground">Need at least 2 players to start</p>
                  ) : (
                    <p className="text-green-600 font-medium">All players ready! Starting game...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
