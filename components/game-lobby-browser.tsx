"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ColyseusClient, Room } from "colyseus.js"
import { useColyseusLobby } from "@/hooks/useColyseusLobby"
import type { PlayerState } from "@/hooks/usePlayerState"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface GameLobbyBrowserProps {
  gameId: string
  username: string
  colyseusClient: ColyseusClient | null
  hubRoom: Room | null
  playerState: PlayerState
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>
  log: (message: string, type?: "info" | "error" | "success") => void
  availableRooms: any[]
}

export function GameLobbyBrowser({
  gameId,
  username,
  colyseusClient,
  hubRoom,
  playerState,
  setPlayerState,
  log,
  availableRooms,
}: GameLobbyBrowserProps) {
  const [wager, setWager] = useState("0")
  const [maxPlayers, setMaxPlayers] = useState("2")
  const [lobbyToJoinId, setLobbyToJoinId] = useState("")
  const { theme } = useTheme()
  const isCyberpunk = theme === "cyberpunk"

  const {
    isConnected,
    isInHub,
    isInLobby,
    players,
    isReady,
    gameMode,
    isGameStarting,
    availableLobbies, // This is from the useColyseusLobby hook
    connect,
    joinHub,
    createLobby,
    joinLobby,
    toggleReady,
    leaveLobby,
    leaveHub,
    disconnect,
  } = useColyseusLobby({
    serverUrl: process.env.NEXT_PUBLIC_SERVER_URL || "ws://localhost:2567",
    username,
    onGameStart: (options) => {
      log(`Game starting with options: ${JSON.stringify(options)}`, "success")
      // Here you would transition to the actual game scene/component
      setPlayerState((prev) => ({ ...prev, isInBattleRoom: true, status: "In Battle Room" }))
    },
    onError: (error) => log(error, "error"),
  })

  // Effect to synchronize playerState from useColyseusLobby to global playerState
  useEffect(() => {
    setPlayerState((prev) => ({
      ...prev,
      isConnected: isConnected,
      isInHub: isInHub,
      isInLobby: isInLobby,
      isReady: isReady,
      battleRoomPlayers: players.length, // Assuming players in lobby are battleRoomPlayers
      gameSessionActive: isGameStarting, // Use isGameStarting for gameSessionActive
      gameSessionType: gameMode,
      availableRooms: availableLobbies, // Sync available lobbies from hook
    }))
  }, [isConnected, isInHub, isInLobby, isReady, players, isGameStarting, gameMode, availableLobbies, setPlayerState])

  const handleCreateLobby = async () => {
    if (!isConnected) {
      log("Not connected to Colyseus server. Please connect first.", "error")
      return
    }
    if (!isInHub) {
      log("Not in hub room. Please join hub first.", "error")
      return
    }
    try {
      await createLobby({
        gameMode: gameId,
        wager: Number.parseFloat(wager),
        maxPlayers: Number.parseInt(maxPlayers),
      })
      log(`Created lobby for ${gameId} with ${maxPlayers} players and wager ${wager}`, "success")
    } catch (error: any) {
      log(`Failed to create lobby: ${error.message}`, "error")
    }
  }

  const handleJoinLobby = async () => {
    if (!isConnected) {
      log("Not connected to Colyseus server. Please connect first.", "error")
      return
    }
    if (!isInHub) {
      log("Not in hub room. Please join hub first.", "error")
      return
    }
    if (!lobbyToJoinId) {
      log("Please enter a Lobby ID to join.", "error")
      return
    }
    try {
      await joinLobby(lobbyToJoinId)
      log(`Joined lobby: ${lobbyToJoinId}`, "success")
    } catch (error: any) {
      log(`Failed to join lobby: ${error.message}`, "error")
    }
  }

  const handleToggleReady = async () => {
    try {
      await toggleReady()
      log(`Toggled ready state to ${!isReady}`, "info")
    } catch (error: any) {
      log(`Failed to toggle ready: ${error.message}`, "error")
    }
  }

  const handleLeaveLobby = async () => {
    try {
      await leaveLobby()
      log("Left the lobby.", "info")
    } catch (error: any) {
      log(`Failed to leave lobby: ${error.message}`, "error")
    }
  }

  const handleJoinRoomFromList = async (roomId: string, roomType: string) => {
    log(`Attempting to join room ${roomId} of type ${roomType} from list.`, "info")
    if (roomType === "lobby") {
      setLobbyToJoinId(roomId)
      await joinLobby(roomId)
    } else {
      log(`Joining of room type ${roomType} not yet supported from this list.`, "warning")
    }
  }

  // Filter available rooms to show only lobbies for the current gameId
  const filteredLobbies = availableRooms.filter((room) => room.type === "lobby" && room.metadata?.gameMode === gameId)

  return (
    <div className="space-y-6">
      {!isConnected && (
        <div className="text-center">
          <p className={cn(isCyberpunk ? "text-cyberpunk-text" : "text-gray-700")}>Connecting to Colyseus server...</p>
          <Button
            onClick={connect}
            disabled={isConnected}
            className={cn(isCyberpunk ? "cyberpunk-button" : "bg-blue-500 hover:bg-blue-600 text-white")}
          >
            Connect to Colyseus
          </Button>
        </div>
      )}

      {isConnected && !isInHub && (
        <div className="text-center">
          <p className={cn(isCyberpunk ? "text-cyberpunk-text" : "text-gray-700")}>
            Connected to server. Joining hub...
          </p>
          <Button
            onClick={joinHub}
            disabled={isInHub}
            className={cn(isCyberpunk ? "cyberpunk-button" : "bg-blue-500 hover:bg-blue-600 text-white")}
          >
            Join Hub
          </Button>
        </div>
      )}

      {isInHub && !isInLobby && (
        <Card
          className={cn(
            isCyberpunk ? "cyberpunk-card-border bg-cyberpunk-bg text-cyberpunk-text" : "bg-white text-gray-900",
          )}
        >
          <CardHeader>
            <CardTitle className={cn(isCyberpunk ? "text-cyberpunk-accent" : "text-gray-800")}>
              Create or Join Lobby
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wager" className={cn(isCyberpunk ? "text-cyberpunk-text" : "text-gray-700")}>
                Wager
              </Label>
              <Input
                id="wager"
                type="number"
                value={wager}
                onChange={(e) => setWager(e.target.value)}
                placeholder="0"
                className={cn(isCyberpunk ? "cyberpunk-input" : "")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPlayers" className={cn(isCyberpunk ? "text-cyberpunk-text" : "text-gray-700")}>
                Max Players
              </Label>
              <Select value={maxPlayers} onValueChange={setMaxPlayers}>
                <SelectTrigger className={cn(isCyberpunk ? "cyberpunk-select-trigger" : "")}>
                  <SelectValue placeholder="Select max players" />
                </SelectTrigger>
                <SelectContent className={cn(isCyberpunk ? "cyberpunk-select-content" : "")}>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCreateLobby}
              className={cn(isCyberpunk ? "cyberpunk-button" : "bg-green-500 hover:bg-green-600 text-white")}
            >
              Create Lobby for {gameId}
            </Button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-gray-300" />
              <span className="flex-shrink mx-4 text-gray-400">OR</span>
              <div className="flex-grow border-t border-gray-300" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lobbyId" className={cn(isCyberpunk ? "text-cyberpunk-text" : "text-gray-700")}>
                Join Existing Lobby (ID)
              </Label>
              <Input
                id="lobbyId"
                type="text"
                value={lobbyToJoinId}
                onChange={(e) => setLobbyToJoinId(e.target.value)}
                placeholder="Enter Lobby ID"
                className={cn(isCyberpunk ? "cyberpunk-input" : "")}
              />
            </div>
            <Button
              onClick={handleJoinLobby}
              className={cn(isCyberpunk ? "cyberpunk-button" : "bg-blue-500 hover:bg-blue-600 text-white")}
            >
              Join Lobby
            </Button>

            <h3 className={cn("text-lg font-semibold mt-6", isCyberpunk ? "text-cyberpunk-accent" : "text-gray-800")}>
              Available Lobbies for {gameId}
            </h3>
            {filteredLobbies.length === 0 ? (
              <p className={cn(isCyberpunk ? "text-cyberpunk-text" : "text-gray-700")}>No active lobbies found.</p>
            ) : (
              <div className="space-y-2">
                {filteredLobbies.map((room) => (
                  <Card
                    key={room.roomId}
                    className={cn(
                      isCyberpunk ? "cyberpunk-card-border bg-cyberpunk-bg-dark" : "bg-gray-50",
                      "p-3 flex items-center justify-between",
                    )}
                  >
                    <div>
                      <p className={cn("font-medium", isCyberpunk ? "text-cyberpunk-text" : "text-gray-800")}>
                        ID: {room.roomId.substring(0, 8)}...
                      </p>
                      <p className={cn("text-sm", isCyberpunk ? "text-cyberpunk-text-light" : "text-gray-600")}>
                        Players: {room.clients}/{room.maxClients} | Wager: {room.metadata?.wager || "N/A"}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleJoinRoomFromList(room.roomId, room.type)}
                      disabled={room.clients >= room.maxClients}
                      className={cn(isCyberpunk ? "cyberpunk-button" : "bg-blue-500 hover:bg-blue-600 text-white")}
                    >
                      Join
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isInLobby && (
        <Card
          className={cn(
            isCyberpunk ? "cyberpunk-card-border bg-cyberpunk-bg text-cyberpunk-text" : "bg-white text-gray-900",
          )}
        >
          <CardHeader>
            <CardTitle className={cn(isCyberpunk ? "text-cyberpunk-accent" : "text-gray-800")}>
              In Lobby: {gameMode} ({playerState.lobbyInfo?.id.substring(0, 8)}...)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className={cn(isCyberpunk ? "text-cyberpunk-text" : "text-gray-700")}>
              Players in Lobby: {players.length} / {maxPlayers}
            </p>
            <div className="space-y-2">
              <h3 className={cn("font-semibold", isCyberpunk ? "text-cyberpunk-accent" : "text-gray-800")}>Players:</h3>
              <ul className="list-disc pl-5">
                {players.map((player) => (
                  <li key={player.id} className={cn(isCyberpunk ? "text-cyberpunk-text" : "text-gray-700")}>
                    {player.name} {player.isHost && "(Host)"} - {player.isReady ? "READY" : "NOT READY"}
                  </li>
                ))}
              </ul>
            </div>
            <p className={cn(isCyberpunk ? "text-cyberpunk-text" : "text-gray-700")}>
              Game Session Active: {playerState.gameSessionActive ? "Yes" : "No"}
              {playerState.gameSessionActive && ` (${playerState.gameSessionType})`}
            </p>
            <div className="flex gap-4">
              <Button
                onClick={handleToggleReady}
                disabled={isGameStarting}
                className={cn(
                  isReady
                    ? isCyberpunk
                      ? "cyberpunk-button-red"
                      : "bg-orange-500 hover:bg-orange-600"
                    : isCyberpunk
                      ? "cyberpunk-button"
                      : "bg-blue-500 hover:bg-blue-600",
                  "text-white",
                )}
              >
                {isReady ? "Unready" : "Ready"}
              </Button>
              <Button
                onClick={handleLeaveLobby}
                disabled={isGameStarting}
                className={cn(isCyberpunk ? "cyberpunk-button-red" : "bg-red-500 hover:bg-red-600 text-white")}
              >
                Leave Lobby
              </Button>
            </div>
            {isGameStarting && (
              <p
                className={cn(
                  "text-lg font-bold text-center",
                  isCyberpunk ? "text-cyberpunk-accent" : "text-green-600",
                )}
              >
                Game is starting...
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
