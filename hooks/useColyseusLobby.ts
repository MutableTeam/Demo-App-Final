"use client"

import { useState, useEffect, useRef } from "react"
import type { Room } from "colyseus.js"
import { ColyseusIntegrationService, type ColyseusPlayer } from "@/services/colyseus-integration"

interface UseColyseusLobbyProps {
  serverUrl: string
  username: string
  onGameStart?: (battleRoomOptions: any) => void
  onError?: (error: string) => void
}

export function useColyseusLobby({ serverUrl, username, onGameStart, onError }: UseColyseusLobbyProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isInHub, setIsInHub] = useState(false)
  const [isInLobby, setIsInLobby] = useState(false)
  const [players, setPlayers] = useState<ColyseusPlayer[]>([])
  const [isReady, setIsReady] = useState(false)
  const [gameMode, setGameMode] = useState("")
  const [wager, setWager] = useState(0)
  const [maxPlayers, setMaxPlayers] = useState(2)
  const [isGameStarting, setIsGameStarting] = useState(false)
  const [availableLobbies, setAvailableLobbies] = useState<any[]>([])

  const serviceRef = useRef<ColyseusIntegrationService | null>(null)
  const hubRoomRef = useRef<Room | null>(null)
  const lobbyRoomRef = useRef<Room | null>(null)

  // Initialize service
  useEffect(() => {
    serviceRef.current = new ColyseusIntegrationService(serverUrl)
  }, [serverUrl])

  const connect = async () => {
    try {
      if (!serviceRef.current) return

      await serviceRef.current.connect()
      setIsConnected(true)
    } catch (error) {
      onError?.(`Failed to connect: ${error}`)
    }
  }

  const joinHub = async () => {
    try {
      if (!serviceRef.current) return

      const hubRoom = await serviceRef.current.joinHub(username)
      hubRoomRef.current = hubRoom
      setIsInHub(true)

      // Set up hub room listeners
      hubRoom.onMessage("hub_welcome", (message) => {
        console.log("Hub welcome:", message)
      })

      hubRoom.onMessage("lobbies_discovered", (message) => {
        setAvailableLobbies(message.lobbies || [])
      })

      hubRoom.onLeave(() => {
        setIsInHub(false)
        hubRoomRef.current = null
      })

      hubRoom.onError((code, message) => {
        onError?.(`Hub error: ${message}`)
      })
    } catch (error) {
      onError?.(`Failed to join hub: ${error}`)
    }
  }

  const createLobby = async (options: {
    gameMode: string
    wager: number
    maxPlayers: number
  }) => {
    try {
      if (!serviceRef.current) return

      const lobbyRoom = await serviceRef.current.createLobby({
        username,
        ...options,
      })

      setupLobbyRoom(lobbyRoom)
      setGameMode(options.gameMode)
      setWager(options.wager)
      setMaxPlayers(options.maxPlayers)
    } catch (error) {
      onError?.(`Failed to create lobby: ${error}`)
    }
  }

  const joinLobby = async (lobbyId: string) => {
    try {
      if (!serviceRef.current) return

      const lobbyRoom = await serviceRef.current.joinLobby(lobbyId, username)
      setupLobbyRoom(lobbyRoom)
    } catch (error) {
      onError?.(`Failed to join lobby: ${error}`)
    }
  }

  const setupLobbyRoom = (lobbyRoom: Room) => {
    lobbyRoomRef.current = lobbyRoom
    setIsInLobby(true)

    // Set up lobby room listeners
    lobbyRoom.onStateChange((state) => {
      // Update players from lobby state
      const playerList: ColyseusPlayer[] = []
      if (state.players) {
        state.players.forEach((player: any, sessionId: string) => {
          playerList.push({
            id: sessionId,
            name: player.name,
            isReady: player.ready,
            isHost: player.isHost,
          })
        })
      }
      setPlayers(playerList)
      setGameMode(state.gameMode || "")
      setWager(state.wager || 0)
      setMaxPlayers(state.maxPlayers || 2)
      setIsGameStarting(state.isGameStarting || false)
    })

    lobbyRoom.onMessage("lobby_welcome", (message) => {
      console.log("Lobby welcome:", message)
    })

    lobbyRoom.onMessage("player_ready_changed", (message) => {
      if (message.sessionId === lobbyRoom.sessionId) {
        setIsReady(message.ready)
      }
    })

    lobbyRoom.onMessage("join_battle_room", (message) => {
      console.log("Joining battle room:", message)
      onGameStart?.(message.options)
    })

    lobbyRoom.onLeave(() => {
      setIsInLobby(false)
      setPlayers([])
      setIsReady(false)
      setIsGameStarting(false)
      lobbyRoomRef.current = null
    })

    lobbyRoom.onError((code, message) => {
      onError?.(`Lobby error: ${message}`)
    })
  }

  const toggleReady = async () => {
    try {
      if (!serviceRef.current) return

      const newReadyState = !isReady
      await serviceRef.current.toggleReady(newReadyState)
      // Don't update local state here - wait for server confirmation
    } catch (error) {
      onError?.(`Failed to toggle ready: ${error}`)
    }
  }

  const leaveLobby = async () => {
    try {
      if (!serviceRef.current) return

      await serviceRef.current.leaveLobby()
    } catch (error) {
      onError?.(`Failed to leave lobby: ${error}`)
    }
  }

  const leaveHub = async () => {
    try {
      if (hubRoomRef.current) {
        await hubRoomRef.current.leave()
      }
    } catch (error) {
      onError?.(`Failed to leave hub: ${error}`)
    }
  }

  const disconnect = async () => {
    try {
      if (!serviceRef.current) return

      await serviceRef.current.disconnect()
      setIsConnected(false)
      setIsInHub(false)
      setIsInLobby(false)
      setPlayers([])
      setIsReady(false)
      setIsGameStarting(false)
    } catch (error) {
      onError?.(`Failed to disconnect: ${error}`)
    }
  }

  return {
    // State
    isConnected,
    isInHub,
    isInLobby,
    players,
    isReady,
    gameMode,
    wager,
    maxPlayers,
    isGameStarting,
    availableLobbies,

    // Actions
    connect,
    joinHub,
    createLobby,
    joinLobby,
    toggleReady,
    leaveLobby,
    leaveHub,
    disconnect,
  }
}
