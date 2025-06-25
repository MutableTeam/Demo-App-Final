"use client"

import { useState, useEffect, useRef } from "react"
import type { Room } from "colyseus.js"
import { ColyseusIntegrationService, type ColyseusPlayer, type GameListing } from "@/services/colyseus-integration"

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
  const [availableGames, setAvailableGames] = useState<GameListing[]>([])
  const [gameSessionActive, setGameSessionActive] = useState(false)
  const [gameSessionType, setGameSessionType] = useState<string | null>(null)
  const [currentGameId, setCurrentGameId] = useState<string | null>(null)
  const [lobbyStats, setLobbyStats] = useState({
    totalPlayers: 0,
    readyPlayers: 0,
    gameSessionActive: false,
  })

  const serviceRef = useRef<ColyseusIntegrationService | null>(null)
  const hubRoomRef = useRef<Room | null>(null)
  const lobbyRoomRef = useRef<Room | null>(null)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

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

      hubRoom.onMessage("player_count_update", (message) => {
        console.log("Hub player count:", message)
      })

      hubRoom.onLeave(() => {
        setIsInHub(false)
        hubRoomRef.current = null
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

  const joinLobby = async () => {
    try {
      if (!serviceRef.current) return

      const lobbyRoom = await serviceRef.current.joinLobby(username)
      setupLobbyRoom(lobbyRoom)
    } catch (error) {
      onError?.(`Failed to join lobby: ${error}`)
    }
  }

  const setupLobbyRoom = (lobbyRoom: Room) => {
    lobbyRoomRef.current = lobbyRoom
    setIsInLobby(true)

    // Set up lobby room listeners based on CustomLobbyRoom implementation
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

      // Update available games from lobby state
      if (state.availableGames) {
        const gamesList: GameListing[] = []
        state.availableGames.forEach((game: any, gameId: string) => {
          gamesList.push({
            id: gameId,
            gameType: game.gameType,
            gameMode: game.gameMode,
            wager: game.wager,
            maxPlayers: game.maxPlayers,
            currentPlayers: game.players?.size || 0,
            hostName: game.hostName,
            status: game.status,
            createdAt: game.createdAt,
          })
        })
        setAvailableGames(gamesList)
      }
    })

    // Handle lobby welcome and initial state
    lobbyRoom.onMessage("lobby_welcome", (message) => {
      console.log("Lobby welcome:", message)
    })

    lobbyRoom.onMessage("lobby_state", (message) => {
      console.log("Lobby state:", message)
      if (message.players) {
        setPlayers(message.players)
      }
      if (message.availableGames) {
        setAvailableGames(message.availableGames)
      }
    })

    // Handle lobby stats updates
    lobbyRoom.onMessage("lobby_stats_update", (message) => {
      console.log("Lobby stats update:", message)
      setLobbyStats({
        totalPlayers: message.totalPlayers || 0,
        readyPlayers: message.readyPlayers || 0,
        gameSessionActive: message.gameSessionActive || false,
      })
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

    lobbyRoom.onMessage("joined_game_session", (message) => {
      console.log("Joined game session:", message)
      setGameSessionActive(true)
      setGameSessionType(message.gameType)
    })

    // Handle game creation/joining
    lobbyRoom.onMessage("game_created", (message) => {
      console.log("Game created:", message)
      // Refresh available games
      requestActiveGames()
    })

    lobbyRoom.onMessage("player_joined_game", (message) => {
      console.log("Player joined game:", message)
      if (message.playerId === lobbyRoom.sessionId) {
        setCurrentGameId(message.gameId)
      }
      // Refresh available games
      requestActiveGames()
    })

    lobbyRoom.onMessage("player_left_game", (message) => {
      console.log("Player left game:", message)
      if (message.playerId === lobbyRoom.sessionId) {
        setCurrentGameId(null)
      }
      // Refresh available games
      requestActiveGames()
    })

    // Handle active lobbies response
    lobbyRoom.onMessage("active_lobbies", (message) => {
      console.log("Active lobbies received:", message)
      setAvailableGames(message.lobbies || [])
    })

    // Handle ready updates
    lobbyRoom.onMessage("lobby_ready_update", (message) => {
      console.log("Lobby ready update:", message)
      setLobbyStats((prev) => ({
        ...prev,
        readyPlayers: message.readyCount || 0,
      }))
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
      setCurrentGameId(null)
      setAvailableGames([])
      lobbyRoomRef.current = null
    })

    lobbyRoom.onError((code, message) => {
      console.error("Lobby room error:", code, message)
      onError?.(`Lobby error: ${message}`)
    })

    // Request initial active games
    requestActiveGames()
  }

  const createGame = async (options: {
    gameMode: string
    wager: number
    maxPlayers: number
  }) => {
    try {
      if (!serviceRef.current) return

      await serviceRef.current.createGame(options)
      console.log("Game creation requested")
    } catch (error) {
      onError?.(`Failed to create game: ${error}`)
    }
  }

  const joinGame = async (gameId: string) => {
    try {
      if (!serviceRef.current) return

      await serviceRef.current.joinGame(gameId)
      console.log("Game join requested")
    } catch (error) {
      onError?.(`Failed to join game: ${error}`)
    }
  }

  const selectGameType = async (gameType = "battle") => {
    try {
      if (!serviceRef.current) return

      await serviceRef.current.selectGameType(gameType)
      console.log("Game type selected:", gameType)
    } catch (error) {
      onError?.(`Failed to select game type: ${error}`)
    }
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

  const requestActiveGames = async () => {
    try {
      if (!serviceRef.current) return

      await serviceRef.current.requestActiveLobbies()
    } catch (error) {
      console.error("Failed to request active games:", error)
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
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
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
      setCurrentGameId(null)
      setAvailableGames([])
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
    } catch (error) {
      onError?.(`Failed to disconnect: ${error}`)
    }
  }

  // Set up periodic refresh of active games
  useEffect(() => {
    if (isInLobby) {
      // Initial request
      requestActiveGames()

      // Set up periodic refresh
      refreshIntervalRef.current = setInterval(() => {
        requestActiveGames()
      }, 5000) // Every 5 seconds

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current)
          refreshIntervalRef.current = null
        }
      }
    }
  }, [isInLobby])

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
    availableLobbies: availableGames, // Renamed for compatibility
    availableGames,
    gameSessionActive,
    gameSessionType,
    currentGameId,
    lobbyStats,

    // Actions
    connect,
    joinHub,
    joinLobby,
    createGame,
    joinGame,
    selectGameType,
    toggleReady,
    requestActiveGames,
    leaveLobby,
    leaveHub,
    disconnect,
  }
}
