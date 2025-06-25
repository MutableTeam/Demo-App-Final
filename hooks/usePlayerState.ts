"use client"

import { useState, useCallback } from "react"
import type { PlayerState } from "@/schemas/Player" // Assuming PlayerState is defined here

// Helper to generate a random username
const generateRandomUsername = () => {
  const adjectives = ["Cyber", "Neo", "Arcade", "Pixel", "Quantum", "Digital", "Synth", "Vapor", "Neon", "Retro"]
  const nouns = ["Knight", "Racer", "Hunter", "Pilot", "Glitch", "Specter", "Droid", "Echo", "Phantom", "Byte"]
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
  const randomNumber = Math.floor(Math.random() * 1000)
  return `${randomAdjective}${randomNoun}${randomNumber}`
}

const initialPlayerState: PlayerState = {
  isConnected: false,
  isInHub: false,
  isInLobby: false,
  isInBattleRoom: false,
  isReady: false,
  status: { text: "Disconnected", type: "info" },
  hubInfo: null,
  lobbyInfo: null,
  battleRoomInfo: null,
  totalPlayers: 0,
  availableRoomsCount: 0,
  battleRoomPlayers: 0,
  battleRoomReadyCount: 0,
  gameSessionActive: false,
  gameSessionType: null,
  username: "", // This will be generated
  solBalance: 0, // Initialize to 0
  mutbBalance: 0, // Initialize to 0
}

export function usePlayerState() {
  const [playerState, setPlayerState] = useState<PlayerState>(() => ({
    ...initialPlayerState,
    username: generateRandomUsername(),
  }))

  const updatePlayerState = useCallback(
    (updates: Partial<PlayerState>, source = "unknown") => {
      setPlayerState((prev) => {
        const newState = { ...prev, ...updates }
        // console.log(`PlayerState update from ${source}:`, newState)
        return newState
      })
    },
    [setPlayerState],
  )

  const setConnectionStatus = useCallback(
    (connected: boolean, statusText: string, source = "unknown") => {
      updatePlayerState(
        { isConnected: connected, status: { text: statusText, type: connected ? "info" : "error" } },
        `connectionStatus-${source}`,
      )
    },
    [updatePlayerState],
  )

  const setRoomState = useCallback(
    (
      roomType: "hub" | "lobby" | "battle",
      connected: boolean,
      roomInfo: { id: string; type: string; sessionId: string; name?: string } | null,
      source = "unknown",
    ) => {
      updatePlayerState(
        {
          [`isIn${roomType.charAt(0).toUpperCase() + roomType.slice(1)}`]: connected,
          [`${roomType}Info`]: roomInfo,
          status: {
            text: connected ? `In ${roomType.charAt(0).toUpperCase() + roomType.slice(1)} Room` : "Disconnected",
            type: "info",
          },
        },
        `roomState-${roomType}-${source}`,
      )
    },
    [updatePlayerState],
  )

  const resetPlayerState = useCallback(() => {
    setPlayerState(() => ({
      ...initialPlayerState,
      username: generateRandomUsername(), // Regenerate username on reset
    }))
  }, [setPlayerState])

  return {
    playerState,
    setPlayerState, // Expose the direct setter for more granular control if needed
    updatePlayerState,
    setConnectionStatus,
    setRoomState,
    resetPlayerState,
  }
}
