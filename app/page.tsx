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
  // Wallet connection state
  const [walletConnected, setWalletConnected] = useState(false)
  const [publicKey, setPublicKey] = useState("")
  const [balance, setBalance] = useState<number | null>(null)
  const [provider, setProvider] = useState<any>(null)

  // Add after existing state declarations
  const [availableRooms, setAvailableRooms] = useState<any[]>([])

  // Colyseus States and Refs
  const [colyseusLogs, setColyseusLogs] = useState<string[]>([])
  const colyseusClientRef = useRef<ColyseusClient | null>(null)

  const { playerState, setPlayerState } = usePlayerState()
  const hubRoomRef = useRef<Room | null>(null)

  // Log function for ColyseusDebugWidget
  const log = useCallback((message: string, type: "info" | "error" | "success" = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    setColyseusLogs((prevLogs) => [`[${timestamp}] [${type.toUpperCase()}] ${message}`, ...prevLogs.slice(0, 99)]) // Keep last 100 logs
  }, [])

  // Colyseus Room Hook for cleanup and error handling
  useColyseusRoom(hubRoomRef.current, setPlayerState, log, "Player Hub Room")

  // Function to connect to Colyseus and join the hub
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

      setCurrentPlayerState((prev) => ({ ...prev, isConnected: true, status: "Connecting to Colyseus..." }))
      log(`Attempting to connect to Colyseus server at ${serverUrl}`, "info")

      try {
        const hubRoom = await colyseusClientRef.current.joinOrCreate("hub", { username: currentPlayerState.username })
        currentHubRoomRef.current = hubRoom
        setCurrentPlayerState((prev) => ({ ...prev, isInHub: true, status: "In Hub Room" }))
        log(`Joined Hub Room: ${hubRoom.id}`, "success")

        hubRoom.onStateChange((state) => {
          setCurrentPlayerState((prev) => ({ ...prev, totalPlayers: state.totalPlayers }))
          // log(`Hub State: ${JSON.stringify(state.toJSON())}`, "info") // Too verbose for root page
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
        setCurrentPlayerState((prev) => ({ ...prev, isInHub: false, status: `Hub Join Error: ${e.message}` }))
      }
    },
    [log],
  )

  // Add room scanning function after the connectAndJoinHub function
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

  // Add lobby rooms request function
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

  // Effect to connect to Colyseus and join hub when wallet is connected
  useEffect(() => {
    if (walletConnected && publicKey) {
      if (!playerState.isConnected) {
        connectAndJoinHub(playerState, setPlayerState, hubRoomRef)
      }
    } else {
      // Disconnect Colyseus if wallet disconnects
      // Replace this problematic code:
      // if (colyseusClientRef.current) {
      //   colyseusClientRef.current.leave()
      //   colyseusClientRef.current = null
      //   log("Colyseus client disconnected due to wallet disconnect", "info")
      // }
      // With this proper cleanup:
      if (hubRoomRef.current) {
        hubRoomRef.current.leave()
        hubRoomRef.current = null
      }
      if (colyseusClientRef.current) {
        colyseusClientRef.current = null
        log("Colyseus client disconnected due to wallet disconnect", "info")
      }
      setPlayerState((prev) => ({ ...prev, isConnected: false, isInHub: false, status: "Disconnected" }))
    }
  }, [walletConnected, publicKey, connectAndJoinHub, setPlayerState, log])

  // Cleanup Colyseus client on component unmount
  useEffect(() => {
    // Replace this problematic code:
    // return () => {
    //   if (colyseusClientRef.current) {
    //     colyseusClientRef.current.leave()
    //     colyseusClientRef.current = null
    //     log("Colyseus client disconnected on unmount", "info")
    //   }
    // }
    // With this proper cleanup:
    return () => {
      if (hubRoomRef.current) {
        hubRoomRef.current.leave()
        hubRoomRef.current = null
      }
      if (colyseusClientRef.current) {
        colyseusClientRef.current = null
        log("Colyseus client disconnected on unmount", "info")
      }
    }
  }, [log])

  // Add periodic room scanning
  useEffect(() => {
    if (walletConnected && playerState.isConnected) {
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
  }, [walletConnected, playerState.isConnected, scanAvailableRooms, requestRoomsFromHub])

  const handleWalletConnection = (connected: boolean, publicKey: string, balance: number | null, provider: any) => {
    console.log("Wallet connection changed:", { connected, publicKey, balance })
    setWalletConnected(connected)
    setPublicKey(publicKey)
    setBalance(balance)
    setProvider(provider)
  }

  // Create a connection object for Solana
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed")

  return (
    <main className="min-h-screen relative">
      {/* PromoWatermark positioned at top left */}
      <PromoWatermark />

      {/* Wallet connector always positioned at top right when connected */}
      <div
        className={`fixed ${
          walletConnected
            ? "top-2 right-2 sm:right-4 md:right-6"
            : "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        } z-[100] ${!walletConnected ? "w-full max-w-md px-4 sm:px-0" : ""}`}
      >
        <MultiWalletConnector
          onConnectionChange={handleWalletConnection}
          compact={walletConnected}
          className={`${!walletConnected ? "logo-glow" : ""} wallet-foreground`}
        />
      </div>

      {/* Audio controls positioned at top right below wallet when connected */}
      <div className={`fixed ${walletConnected ? "top-12 sm:top-14" : "top-4"} right-4 md:right-8 z-[90]`}>
        <GlobalAudioControls />
      </div>

      <RetroArcadeBackground>
        <div className="max-w-6xl mx-auto p-4 md:p-8 z-10 relative">
          <DemoWatermark />

          {walletConnected && publicKey && (
            <div className="mt-16">
              <MutablePlatform publicKey={publicKey} balance={balance} provider={provider} connection={connection} />
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
