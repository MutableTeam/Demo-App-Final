"use client"

import { useState, useEffect } from "react"
import MultiWalletConnector from "@/components/multi-wallet-connector"
import DemoWatermark from "@/components/demo-watermark"
import PromoWatermark from "@/components/promo-watermark"
import GlobalAudioControls from "@/components/global-audio-controls"
import DebugOverlay from "@/components/debug-overlay"
import PlatformSelector from "@/components/platform-selector"
import PlatformIndicator from "@/components/platform-indicator"
import { registerGames } from "@/games/registry"
import MutablePlatform from "@/components/mutable-platform"
import RetroArcadeBackground from "@/components/retro-arcade-background"
import { Connection, clusterApiUrl } from "@solana/web3.js"
import "@/styles/retro-arcade.css"
import { initializeGoogleAnalytics } from "@/utils/analytics"
import { initializeEnhancedRenderer } from "@/utils/enhanced-renderer-bridge"
import { PlatformProvider, usePlatform } from "@/contexts/platform-context"
import type { PlatformType } from "@/contexts/platform-context"

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = "G-41DL97N287"

function HomeContent() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [publicKey, setPublicKey] = useState("")
  const [balance, setBalance] = useState<number | null>(null)
  const [provider, setProvider] = useState<any>(null)

  // Platform context
  const { isSelected: isPlatformSelected, resetPlatform, platformType } = usePlatform()

  // Debug logging
  useEffect(() => {
    console.log("Platform state:", { isPlatformSelected, platformType })
  }, [isPlatformSelected, platformType])

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

    // If wallet is disconnected, reset platform selection and go back to platform selector
    if (!connected) {
      resetPlatform()
    }
  }

  const handlePlatformSelected = (platform: PlatformType) => {
    console.log("Platform selected in main component:", platform)
    // Platform is already set in context by the PlatformSelector
    // Component will re-render automatically due to context change
  }

  // Create a connection object for Solana
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed")

  // Show platform selector if platform not selected
  if (!isPlatformSelected) {
    console.log("Showing platform selector")
    return (
      <main className="min-h-screen bg-background relative">
        <PromoWatermark />

        <div className="fixed top-4 right-4 md:right-8 z-[90]">
          <GlobalAudioControls />
        </div>

        <RetroArcadeBackground>
          <div className="max-w-6xl mx-auto p-4 md:p-8 z-10 relative flex items-center justify-center min-h-screen">
            <PlatformSelector onPlatformSelected={handlePlatformSelected} />
            <DebugOverlay initiallyVisible={false} position="bottom-right" />
          </div>
        </RetroArcadeBackground>
      </main>
    )
  }

  // Show main platform with wallet connector
  console.log("Showing main platform")
  return (
    <main className="min-h-screen bg-background relative">
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

      {/* Platform indicator widget */}
      <PlatformIndicator />

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

export default function Home() {
  return (
    <PlatformProvider>
      <HomeContent />
    </PlatformProvider>
  )
}
