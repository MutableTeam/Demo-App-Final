"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import MultiWalletConnector from "@/components/multi-wallet-connector"
import DemoWatermark from "@/components/demo-watermark"
import PromoWatermark from "@/components/promo-watermark"
import GlobalAudioControls from "@/components/global-audio-controls"
import DebugOverlay from "@/components/debug-overlay"
import { registerGames } from "@/games/registry"
import MutablePlatform from "@/components/mutable-platform"
import RetroArcadeBackground from "@/components/retro-arcade-background"
import { Connection, clusterApiUrl } from "@solana/web3.js"
import "@/styles/retro-arcade.css"
import { initializeGoogleAnalytics } from "@/utils/analytics"
import { SignUpBanner } from "@/components/signup-banner"
import { initializeEnhancedRenderer } from "@/utils/enhanced-renderer-bridge"

// Colyseus Imports
import { Client as ColyseusClient, type Room } from "colyseus.js"
import { usePlayerState } from "@/hooks/usePlayerState"
import { useColyseusRoom } from "@/hooks/useColyseusRoom"
import { ColyseusDebugWidget } from "@/components/colyseus-debug-widget"

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = "G-41DL97N287"

export default function Home() {
  // Removed redundant wallet connection states, playerState is the source of truth
  // const [walletConnected, setWalletConnected] = useState(false)
  // const [publicKey, setPublicKey] = useState("")
  // const [balance, setBalance] = useState<number | null>(null)
  // const [provider, setProvider] = useState<any>(null)

  const [availableRooms, setAvailableRooms] = useState<any[]>([])

  // Colyseus States and Refs
  const [colyseusLogs, setColyseusLogs] = useState<string[]>([])
  const colyseusClientRef = useRef<ColyseusClient | null>(null)

  const { playerState, setPlayerState } = usePlayerState()
  const hubRoomRef = useRef<Room | null>(null)

  const log = useCallback((message: string, type: "info" | "error" | "success" = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    setColyseusLogs((prevLogs) => [`[${timestamp}] [${type.toUpperCase()}] ${message}`, ...prevLogs.slice(0, 99)])
  }, [])

  useColyseusRoom(hubRoomRef.current, setPlayerState, log, "Player Hub Room")

  const connectAndJoinHub = useCallback(
    async (
      currentPlayerState: typeof playerState,
      setCurrentPlayerState: typeof setPlayerState,
      currentHubRoomRef: React.MutableRefObject<Room | null>,
    ) => {
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "ws://localhost:2567"

      if (!colyseusClientRef.current) {
        colyseusClientRef.current = new ColyseusClient(serverUrl)
        log(`Colyseus Client initialized for ${serverUrl}`, "info")
      }

      setCurrentPlayerState((prev) => ({
        ...prev,
        isConnected: true,
        status: { text: "Connecting to Colyseus...", type: "info" },
      }))
      log(`Attempting to connect to Colyseus server at ${serverUrl}`, "info")

      try {
        const hubRoom = await colyseusClientRef.current.joinOrCreate("hub", { username: currentPlayerState.username })
        currentHubRoomRef.current = hubRoom
        setCurrentPlayerState((prev) => ({ ...prev, isInHub: true, status: { text: "In Hub Room", type: "success" } }))
        log(`Joined Hub Room: ${hubRoom.id}`, "success")

        hubRoom.onStateChange((state) => {
          setCurrentPlayerState((prev) => ({ ...prev, totalPlayers: state.totalPlayers }))
        })
        hubRoom.onMessage("hub_welcome", (message) => {
          log(`Hub Welcome: ${message.message}. Total players: ${message.totalPlayers}`, "info")
          setCurrentPlayerState((prev) => ({ ...prev, totalPlayers: message.totalPlayers }))
        })
        hubRoom.onMessage("player_count_update", (message) => {
          log(`Hub Player Count Update: ${message.totalPlayers}`, "info")
          setCurrentPlayerState((prev) => ({ ...prev, totalPlayers: message.totalPlayers }))
        })
        hubRoom.onMessage("hub_state_update", (message) => {
          log(`Hub State Update: ${JSON.stringify(message)}`, "info")
          setCurrentPlayerState((prev) => ({ ...prev, ...message }))
        })
        hubRoom.onMessage("lobbies_discovered", (message) => {
          log(`Discovered Lobbies: ${message.lobbies?.length || 0} lobbies`, "info")
          setCurrentPlayerState((prev) => ({ ...prev, availableRooms: message.lobbies }))
          if (message.lobbies) {
            setAvailableRooms(message.lobbies)
          }
        })
      } catch (e: any) {
        log(`Failed to join Hub Room: ${e.message}`, "error")
        setCurrentPlayerState((prev) => ({
          ...prev,
          isInHub: false,
          status: { text: `Hub Join Error: ${e.message}`, type: "error" },
        }))
      }
    },
    [log],
  )

  const scanAvailableRooms = useCallback(async () => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "ws://localhost:2567"
    const httpUrl = serverUrl.replace("wss://", "https://").replace("ws://", "http://")

    try {
      log("🔍 Scanning for available rooms...", "info")
      const apiUrl = `${httpUrl}/api/rooms`

      const response = await fetch(apiUrl)
      if (response.ok) {
        const rooms = await response.json()
        log(`✅ Found ${rooms.length} available rooms`, "success")
        setAvailableRooms(rooms)
      } else {
        log(`❌ Room scan failed: ${response.status}`, "error")
      }
    } catch (error: any) {
      log(`❌ Room scan error: ${error.message}`, "error")
    }
  }, [log])

  const requestRoomsFromHub = useCallback(() => {
    if (hubRoomRef.current && playerState.isInHub) {
      log("🔍 Requesting active lobbies from hub...", "info")
      hubRoomRef.current.send("get_lobbies")
    }
  }, [log, playerState.isInHub])

  useEffect(() => {
    initializeGoogleAnalytics(GA_MEASUREMENT_ID)
  }, [])

  useEffect(() => {
    registerGames()
    initializeEnhancedRenderer()
  }, [])

  // Use playerState for connection status
  useEffect(() => {
    if (playerState.isConnected && playerState.publicKey) {
      if (!playerState.isInHub) {
        connectAndJoinHub(playerState, setPlayerState, hubRoomRef)
      }
    } else {
      if (colyseusClientRef.current) {
        colyseusClientRef.current.leave()
        colyseusClientRef.current = null
        log("Colyseus client disconnected due to wallet disconnect", "info")
      }
      setPlayerState((prev) => ({
        ...prev,
        isConnected: false,
        isInHub: false,
        status: { text: "Disconnected", type: "info" },
      }))
    }
  }, [playerState]) // Updated to depend on playerState

  useEffect(() => {
    return () => {
      if (colyseusClientRef.current) {
        colyseusClientRef.current.leave()
        colyseusClientRef.current = null
        log("Colyseus client disconnected on unmount", "info")
      }
    }
  }, [log])

  useEffect(() => {
    if (playerState.isConnected) {
      // Depend on playerState.isConnected
      scanAvailableRooms()
      requestRoomsFromHub()

      const scanInterval = setInterval(() => {
        scanAvailableRooms()
        requestRoomsFromHub()
      }, 15000)

      return () => clearInterval(scanInterval)
    }
  }, [playerState.isConnected, scanAvailableRooms, requestRoomsFromHub]) // Depend on playerState.isConnected

  const handleWalletConnection = useCallback(
    (
      connected: boolean,
      newPublicKey: string,
      newBalance: number | null,
      newProvider: any,
      newMutbBalance: number | null,
    ) => {
      console.log("Wallet connection changed:", {
        connected,
        newPublicKey,
        newBalance,
        newMutbBalance,
      })
      setPlayerState((prev) => ({
        ...prev,
        isConnected: connected,
        publicKey: newPublicKey,
        solBalance: newBalance ?? 0,
        mutbBalance: newMutbBalance ?? 0,
        status: {
          text: connected ? "Wallet Connected" : "Disconnected",
          type: connected ? "success" : "info",
        },
      }))
    },
    [setPlayerState],
  )

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed")

  return (
    <main className="min-h-screen relative">
      <PromoWatermark />

      <div
        className={`fixed ${
          playerState.isConnected // Use playerState.isConnected
            ? "top-2 right-2 sm:right-4 md:right-6"
            : "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        } z-[100] ${!playerState.isConnected ? "w-full max-w-md px-4 sm:px-0" : ""}`}
      >
        <MultiWalletConnector
          onConnectionChange={handleWalletConnection}
          compact={playerState.isConnected} // Use playerState.isConnected
          className={`${!playerState.isConnected ? "logo-glow" : ""} wallet-foreground`}
        />
      </div>

      <div className={`fixed ${playerState.isConnected ? "top-12 sm:top-14" : "top-4"} right-4 md:right-8 z-[90]`}>
        <GlobalAudioControls />
      </div>

      <RetroArcadeBackground>
        <div className="max-w-6xl mx-auto p-4 md:p-8 z-10 relative">
          <DemoWatermark />

          {playerState.isConnected &&
            playerState.publicKey && ( // Use playerState
              <div className="mt-16">
                <MutablePlatform
                  publicKey={playerState.publicKey}
                  balance={playerState.solBalance} // Use playerState.solBalance
                  provider={null} // Provider is managed internally by MultiWalletConnector
                  connection={connection}
                  colyseusClient={colyseusClientRef.current}
                  hubRoom={hubRoomRef.current}
                  playerState={playerState}
                  setPlayerState={setPlayerState}
                  log={log}
                  availableRooms={availableRooms}
                />
              </div>
            )}

          <DebugOverlay initiallyVisible={false} position="bottom-right" />
        </div>
      </RetroArcadeBackground>
      <SignUpBanner />

      <ColyseusDebugWidget playerState={playerState} colyseusLogs={colyseusLogs} />
    </main>
  )
}
