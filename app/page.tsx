"use client"

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
  // Local states to track wallet connection directly from MultiWalletConnector
  const [walletConnectedStatus, setWalletConnectedStatus] = useState(false)
  const [walletPublicKey, setWalletPublicKey] = useState("")
  const [walletProvider, setWalletProvider] = useState<any>(null)

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

  // connectAndJoinHub now uses playerState and setPlayerState from its closure
  const connectAndJoinHub = useCallback(async () => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "ws://localhost:2567"

    if (!colyseusClientRef.current) {
      colyseusClientRef.current = new ColyseusClient(serverUrl)
      log(`Colyseus Client initialized for ${serverUrl}`, "info")
    }

    // Crucial check: Only proceed if Colyseus is not already connected
    if (colyseusClientRef.current && colyseusClientRef.current.connection.isOpen) {
      log("Colyseus client already connected, skipping join.", "info")
      return
    }

    setPlayerState((prev) => ({ ...prev, status: { text: "Connecting to Colyseus...", type: "info" } }))
    log(`Attempting to connect to Colyseus server at ${serverUrl}`, "info")

    try {
      const hubRoom = await colyseusClientRef.current.joinOrCreate("hub", { username: playerState.username })
      hubRoomRef.current = hubRoom
      setPlayerState((prev) => ({ ...prev, isInHub: true, status: { text: "In Hub Room", type: "success" } }))
      log(`Joined Hub Room: ${hubRoom.id}`, "success")

      hubRoom.onStateChange((state) => {
        setPlayerState((prev) => ({ ...prev, totalPlayers: state.totalPlayers }))
      })
      hubRoom.onMessage("hub_welcome", (message) => {
        log(`Hub Welcome: ${message.message}. Total players: ${message.totalPlayers}`, "info")
        setPlayerState((prev) => ({ ...prev, totalPlayers: message.totalPlayers }))
      })
      hubRoom.onMessage("player_count_update", (message) => {
        log(`Hub Player Count Update: ${message.totalPlayers}`, "info")
        setPlayerState((prev) => ({ ...prev, totalPlayers: message.totalPlayers }))
      })
      hubRoom.onMessage("hub_state_update", (message) => {
        log(`Hub State Update: ${JSON.stringify(message)}`, "info")
        setPlayerState((prev) => ({ ...prev, ...message }))
      })
      hubRoom.onMessage("lobbies_discovered", (message) => {
        log(`Discovered Lobbies: ${message.lobbies?.length || 0} lobbies`, "info")
        setPlayerState((prev) => ({ ...prev, availableRooms: message.lobbies }))
        if (message.lobbies) {
          setAvailableRooms(message.lobbies)
        }
      })
    } catch (e: any) {
      log(`Failed to join Hub Room: ${e.message}`, "error")
      setPlayerState((prev) => ({
        ...prev,
        isInHub: false,
        status: { text: `Hub Join Error: ${e.message}`, type: "error" },
      }))
    }
  }, [log, setAvailableRooms, playerState.username, setPlayerState]) // Dependencies for useCallback

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

  // Initialize Google Analytics
  useEffect(() => {
    initializeGoogleAnalytics(GA_MEASUREMENT_ID)
  }, [])

  // Initialize games registry and enhanced renderer
  useEffect(() => {
    registerGames()
    initializeEnhancedRenderer()
  }, [])

  // Effect to connect to Colyseus when wallet is connected
  // This useEffect now depends on the local walletConnectedStatus and walletPublicKey
  useEffect(() => {
    if (walletConnectedStatus && walletPublicKey) {
      // Only connect to Colyseus if not already connected
      if (!colyseusClientRef.current || !colyseusClientRef.current.connection.isOpen) {
        connectAndJoinHub()
      }
    } else {
      // Disconnect Colyseus if wallet disconnects
      if (colyseusClientRef.current && colyseusClientRef.current.connection.isOpen) {
        colyseusClientRef.current.leave()
        colyseusClientRef.current = null
        log("Colyseus client disconnected due to wallet disconnect", "info")
      }
      // Reset player state related to Colyseus connection
      // This part should be safe as it's only triggered on wallet disconnect
      if (playerState.isInHub || playerState.isInLobby || playerState.isInBattleRoom) {
        setPlayerState((prev) => ({
          ...prev,
          isInHub: false,
          isInLobby: false,
          isInBattleRoom: false,
          status: { text: "Disconnected", type: "info" },
        }))
      }
    }
  }, [
    walletConnectedStatus,
    walletPublicKey,
    connectAndJoinHub,
    log,
    setPlayerState,
    playerState.isInHub,
    playerState.isInLobby,
    playerState.isInBattleRoom,
  ])

  // Cleanup Colyseus client on component unmount
  useEffect(() => {
    return () => {
      if (colyseusClientRef.current) {
        colyseusClientRef.current.leave()
        colyseusClientRef.current = null
        log("Colyseus client disconnected on unmount", "info")
      }
    }
  }, [log])

  // Add periodic room scanning
  useEffect(() => {
    // This effect now depends on playerState.isConnected, which is updated by handleWalletConnection
    // and should be stable enough not to cause a loop here.
    if (playerState.isConnected) {
      // Initial scan
      scanAvailableRooms()
      requestRoomsFromHub()

      // Set up periodic scanning
      const scanInterval = setInterval(() => {
        scanAvailableRooms()
        requestRoomsFromHub()
      }, 15000) // Every 15 seconds

      return () => clearInterval(scanInterval)
    }
  }, [playerState.isConnected, scanAvailableRooms, requestRoomsFromHub])

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
      // Update local wallet states
      setWalletConnectedStatus(connected)
      setWalletPublicKey(newPublicKey)
      setWalletProvider(newProvider)

      // Update playerState with the new balances and connection status
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

  // Create a connection object for Solana
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed")

  return (
    <main className="min-h-screen relative">
      {/* PromoWatermark positioned at top left */}
      <PromoWatermark />

      {/* Wallet connector always positioned at top right when connected */}
      <div
        className={`fixed ${
          walletConnectedStatus
            ? "top-2 right-2 sm:right-4 md:right-6"
            : "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        } z-[100] ${!walletConnectedStatus ? "w-full max-w-md px-4 sm:px-0" : ""}`}
      >
        <MultiWalletConnector
          onConnectionChange={handleWalletConnection}
          compact={walletConnectedStatus}
          className={`${!walletConnectedStatus ? "logo-glow" : ""} wallet-foreground`}
        />
      </div>

      {/* Audio controls positioned at top right below wallet when connected */}
      <div className={`fixed ${walletConnectedStatus ? "top-12 sm:top-14" : "top-4"} right-4 md:right-8 z-[90]`}>
        <GlobalAudioControls />
      </div>

      <RetroArcadeBackground>
        <div className="max-w-6xl mx-auto p-4 md:p-8 z-10 relative">
          <DemoWatermark />

          {walletConnectedStatus && walletPublicKey && (
            <div className="mt-16">
              <MutablePlatform
                publicKey={walletPublicKey}
                balance={playerState.solBalance}
                provider={walletProvider}
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

      {/* Colyseus Debug Widget */}
      <ColyseusDebugWidget playerState={playerState} colyseusLogs={colyseusLogs} />
    </main>
  )
}
