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
  const [gameSessionActive, setGameSessionActive] = useState(false)
  const [gameSessionType, setGameSessionType] = useState<string | null>(null)

  const serviceRef = useRef<ColyseusIntegrationService | null>(null)
  const hubRoomRef = useRef<Room | null>(null)
  const lobbyRoomRef = useRef<Room | null>(null)
  const lobbyRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

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

      // Request initial lobby list immediately upon joining hub
      hubRoom.send("get_lobbies")

      // Set up hub room listeners with all expected message types
      hubRoom.onMessage("hub_welcome", (message) => {
        console.log("Hub welcome:", message)
      })

      hubRoom.onMessage("player_count_update", (message) => {
        console.log("Hub Player count update:", message)
      })

      hubRoom.onMessage("hub_state_update", (message) => {
        console.log("Hub state update:", message)
      })

      hubRoom.onMessage("lobbies_discovered", (message) => {
        console.log("Lobbies discovered:", message)
        setAvailableLobbies(message.lobbies || [])
      })

      hubRoom.onMessage("active_lobbies", (message) => {
        console.log("Active lobbies:", message)
        setAvailableLobbies(message.lobbies || [])
      })

      // Periodically request lobby updates
      if (lobbyRefreshIntervalRef.current) {
        clearInterval(lobbyRefreshIntervalRef.current)
      }
      lobbyRefreshIntervalRef.current = setInterval(() => {
        if (hubRoomRef.current) {
          hubRoomRef.current.send("get_lobbies")
        }
      }, 5000) // Refresh every 5 seconds

      hubRoom.onLeave(() => {
        setIsInHub(false)
        hubRoomRef.current = null
        if (lobbyRefreshIntervalRef.current) {
          clearInterval(lobbyRefreshIntervalRef.current)
          lobbyRefreshIntervalRef.current = null
        }
      })

      hubRoom.onError((code, message) => {
        console.error("Hub room error:", code, message)
        onError?.(`Hub error: ${message}`)
      })
    } catch (error) {
      console.error("Failed to join hub:", error)
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
      setIsInLobby(true) // Explicitly set isInLobby to true here
    } catch (error) {
      onError?.(`Failed to create lobby: ${error}`)
    }
  }

  const joinLobby = async (lobbyId: string) => {
    try {
      if (!serviceRef.current) return

      const lobbyRoom = await serviceRef.current.joinLobby(lobbyId, username)
      setupLobbyRoom(lobbyRoom)
      setIsInLobby(true) // Explicitly set isInLobby to true here
    } catch (error) {
      onError?.(`Failed to join lobby: ${error}`)
    }
  }

  const setupLobbyRoom = (lobbyRoom: Room) => {
    lobbyRoomRef.current = lobbyRoom
    // setIsInLobby(true) // This is now handled in createLobby/joinLobby

    // Set up lobby room listeners based on the CustomLobbyRoom implementation
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
    })

    // Handle lobby welcome message
    lobbyRoom.onMessage("lobby_welcome", (message) => {
      console.log("Lobby welcome:", message)
    })

    // Handle lobby state updates
    lobbyRoom.onMessage("lobby_state", (message) => {
      console.log("Lobby state:", message)
      if (message.players) {
        setPlayers(message.players)
      }
    })

    // Handle lobby stats updates
    lobbyRoom.onMessage("lobby_stats_update", (message) => {
      console.log("Lobby stats update:", message)
      setGameSessionActive(message.gameSessionActive || false)
    })

    // Handle player ready state changes
    lobbyRoom.onMessage("player_ready_changed", (message) => {
      console.log("Player ready changed:", message)
      if (message.sessionId === lobbyRoom.sessionId) {
        setIsReady(message.ready)
      }
    })

    // Handle game session updates
    lobbyRoom.onMessage("game_session_update", (message) => {
      console.log("Game session update:", message)
      setGameSessionActive(!!message.gameType)
      setGameSessionType(message.gameType)
    })

    // Handle joined game session message
    lobbyRoom.onMessage("joined_game_session", (message) => {
      console.log("Joined game session:", message)
      setGameSessionActive(true)
      setGameSessionType(message.gameType)
    })

    // Handle player count update (from lobby)
    lobbyRoom.onMessage("player_count_update", (message) => {
      console.log("Lobby Player count update:", message)
      // This message might be redundant if lobby_stats_update covers totalPlayers
      // but we'll handle it to prevent the "not registered" error.
    })

    // Handle ready updates
    lobbyRoom.onMessage("lobby_ready_update", (message) => {
      console.log("Lobby ready update:", message)
      // Update ready count if needed
    })

    // CRITICAL: Handle automatic transition to Battle Room
    lobbyRoom.onMessage("join_battle_room", async (message) => {
      console.log("Lobby instructed to auto-join battle room!", message)
      setIsGameStarting(true)
      onGameStart?.(message.options)
    })

    lobbyRoom.onLeave(() => {
      setIsInLobby(false)
      setPlayers([])
      setIsReady(false)
      setIsGameStarting(false)
      setGameSessionActive(false)
      setGameSessionType(null)
      lobbyRoomRef.current = null
    })

    lobbyRoom.onError((code, message) => {
      console.error("Lobby room error:", code, message)
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
      if (lobbyRefreshIntervalRef.current) {
        clearInterval(lobbyRefreshIntervalRef.current)
        lobbyRefreshIntervalRef.current = null
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
      setGameSessionActive(false)
      setGameSessionType(null)
      if (lobbyRefreshIntervalRef.current) {
        clearInterval(lobbyRefreshIntervalRef.current)
        lobbyRefreshIntervalRef.current = null
      }
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
    gameSessionActive,
    gameSessionType,

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
