"use client"

import { useState } from "react"

export interface PlayerState {
  username: string
  isConnected: boolean
  isInHub: boolean
  isInLobby: boolean
  isInBattleRoom: boolean
  isReady: boolean
  status: string
  totalPlayers: number
  battleRoomPlayers: number
  battleRoomReadyCount: number
  gameSessionActive: boolean
  availableRooms: any[] // To store discovered lobbies
}

export function usePlayerState() {
  const [playerState, setPlayerState] = useState<PlayerState>({
    username: `Player${Math.floor(Math.random() * 1000)}`, // Basic random username
    isConnected: false,
    isInHub: false,
    isInLobby: false,
    isInBattleRoom: false,
    isReady: false,
    status: "Disconnected",
    totalPlayers: 0,
    battleRoomPlayers: 0,
    battleRoomReadyCount: 0,
    gameSessionActive: false,
    availableRooms: [],
  })

  return { playerState, setPlayerState }
}
