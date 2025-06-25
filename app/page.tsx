"use client"

import { useState, useEffect } from "react"
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

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = "G-41DL97N287"

export default function Home() {
  // Wallet connection state
  const [walletConnected, setWalletConnected] = useState(false)
  const [publicKey, setPublicKey] = useState("")
  const [balance, setBalance] = useState<number | null>(null)
  const [provider, setProvider] = useState<any>(null)

  // Initialize Google Analytics
  useEffect(() => {
    initializeGoogleAnalytics(GA_MEASUREMENT_ID)
  }, [])

  // Initialize games registry
  useEffect(() => {
    registerGames()

    // Initialize enhanced renderer
    initializeEnhancedRenderer()
  }, [])

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
    </main>
  )
}
