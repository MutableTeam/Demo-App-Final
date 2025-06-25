"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useColyseusLobby } from "@/hooks/useColyseusLobby"
import { toast } from "@/hooks/use-toast"
import { Loader2, Users, Trophy, Coins } from "lucide-react"

interface GameLauncherProps {
  publicKey: string
  onGameStart?: (gameData: any) => void
  onBack?: () => void
}

export default function GameLauncher({ publicKey, onGameStart, onBack }: GameLauncherProps) {
  const [selectedWager, setSelectedWager] = useState(0.1)
  const [selectedMaxPlayers, setSelectedMaxPlayers] = useState(2)
  const [isCreatingGame, setIsCreatingGame] = useState(false)

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "ws://localhost:2567"
  const username = publicKey.slice(0, 8) // Use first 8 chars of public key as username

  const {
    isConnected,
    isInHub,
    isInLobby,
    availableGames,
    gameSessionActive,
    isGameStarting,
    connect,
    joinHub,
    joinLobby,
    createGame,
    joinGame,
    selectGameType,
    toggleReady,
    disconnect,
  } = useColyseusLobby({
    serverUrl,
    username,
    onGameStart: (battleRoomOptions) => {
      console.log("Game starting with options:", battleRoomOptions)
      onGameStart?.(battleRoomOptions)
    },
    onError: (error) => {
      console.error("Colyseus error:", error)
      toast({
        title: "Connection Error",
        description: error,
        variant: "destructive",
      })
    },
  })

  // Auto-connect when component mounts
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        if (!isConnected) {
          await connect()
        }
        if (isConnected && !isInHub) {
          await joinHub()
        }
        if (isConnected && isInHub && !isInLobby) {
          await joinLobby()
        }
      } catch (error) {
        console.error("Failed to initialize connection:", error)
      }
    }

    initializeConnection()

    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [isConnected, isInHub, isInLobby])

  const handleCreateGame = async () => {
    try {
      setIsCreatingGame(true)

      // Create a game in the lobby
      await createGame({
        gameMode: "battle",
        wager: selectedWager,
        maxPlayers: selectedMaxPlayers,
      })

      // Select game type to join the game session
      await selectGameType("battle")

      toast({
        title: "Game Created",
        description: "Your game has been created. Waiting for players...",
      })
    } catch (error) {
      console.error("Failed to create game:", error)
      toast({
        title: "Error",
        description: "Failed to create game. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingGame(false)
    }
  }

  const handleJoinGame = async (gameId: string) => {
    try {
      await joinGame(gameId)
      await selectGameType("battle")

      toast({
        title: "Joined Game",
        description: "You have joined the game. Get ready!",
      })
    } catch (error) {
      console.error("Failed to join game:", error)
      toast({
        title: "Error",
        description: "Failed to join game. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getConnectionStatus = () => {
    if (!isConnected) return "Connecting..."
    if (!isInHub) return "Joining Hub..."
    if (!isInLobby) return "Joining Lobby..."
    return "Connected"
  }

  const getConnectionColor = () => {
    if (!isConnected || !isInHub || !isInLobby) return "bg-yellow-500"
    return "bg-green-500"
  }

  if (isGameStarting) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <h3 className="text-lg font-semibold mb-2">Starting Game...</h3>
            <p className="text-sm text-muted-foreground text-center">
              Preparing your battle room. You'll be redirected shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Connection Status</CardTitle>
            <Badge className={`${getConnectionColor()} text-white`}>{getConnectionStatus()}</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Create Game Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Create New Game
          </CardTitle>
          <CardDescription>Set up a new game and wait for other players to join</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Wager (SOL)</label>
              <select
                value={selectedWager}
                onChange={(e) => setSelectedWager(Number(e.target.value))}
                className="w-full mt-1 p-2 border rounded-md"
                disabled={!isInLobby}
              >
                <option value={0.1}>0.1 SOL</option>
                <option value={0.5}>0.5 SOL</option>
                <option value={1.0}>1.0 SOL</option>
                <option value={2.0}>2.0 SOL</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Max Players</label>
              <select
                value={selectedMaxPlayers}
                onChange={(e) => setSelectedMaxPlayers(Number(e.target.value))}
                className="w-full mt-1 p-2 border rounded-md"
                disabled={!isInLobby}
              >
                <option value={2}>2 Players</option>
                <option value={4}>4 Players</option>
                <option value={6}>6 Players</option>
              </select>
            </div>
          </div>
          <Button onClick={handleCreateGame} disabled={!isInLobby || isCreatingGame} className="w-full">
            {isCreatingGame ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Game...
              </>
            ) : (
              "Create Game"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Available Games Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Available Games ({availableGames.length})
          </CardTitle>
          <CardDescription>Join an existing game or wait for players to join yours</CardDescription>
        </CardHeader>
        <CardContent>
          {availableGames.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No games available</p>
              <p className="text-sm">Create a new game to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableGames.map((game) => (
                <div key={game.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{game.hostName}</span>
                      <Badge variant="outline">{game.gameMode}</Badge>
                      <Badge variant={game.status === "waiting" ? "default" : "secondary"}>{game.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {game.currentPlayers}/{game.maxPlayers}
                      </span>
                      <span className="flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        {game.wager} SOL
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleJoinGame(game.id)}
                    disabled={!isInLobby || game.status !== "waiting"}
                    size="sm"
                  >
                    Join
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game Session Status */}
      {gameSessionActive && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-800">In Game Session</h4>
                <p className="text-sm text-green-600">Ready up when you're prepared to start!</p>
              </div>
              <Button onClick={toggleReady} variant="outline" size="sm">
                Toggle Ready
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Back Button */}
      {onBack && (
        <Button onClick={onBack} variant="outline" className="w-full">
          Back to Platform
        </Button>
      )}
    </div>
  )
}
