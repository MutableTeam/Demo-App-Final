"use client"

import { useState, useEffect } from "react"
import PromoWatermark from "@/components/promo-watermark"
import GlobalAudioControls from "@/components/global-audio-controls"
import DebugOverlay from "@/components/debug-overlay"
import PlatformSelector from "@/components/platform-selector"
import { registerGames } from "@/games/registry"
import MutablePlatform from "@/components/mutable-platform"
import RetroArcadeBackground from "@/components/retro-arcade-background"
import { Connection, clusterApiUrl } from "@solana/web3.js"
import "@/styles/retro-arcade.css"
import { initializeGoogleAnalytics } from "@/utils/analytics"
import { initializeEnhancedRenderer } from "@/utils/enhanced-renderer-bridge"
import { PlatformProvider, usePlatform } from "@/contexts/platform-context"
import { SignUpBanner } from "@/components/signup-banner"
import { CyberpunkThemeProvider } from "@/contexts/cyberpunk-theme-context"

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = "G-41DL97N287"

function HomeContent() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [publicKey, setPublicKey] = useState("")
  const [balance, setBalance] = useState<number | null>(null)
  const [provider, setProvider] = useState<any>(null)
  const [showPlatform, setShowPlatform] = useState(false)

  // Platform context
  const { isSelected: isPlatformSelected } = usePlatform()

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

  const handleWalletConnection = (walletData: {
    connected: boolean
    publicKey: string
    balance: number | null
    provider: any
    isTestMode?: boolean
  }) => {
    console.log("Wallet connection data received:", walletData)

    if (walletData.connected && walletData.publicKey) {
      setWalletConnected(true)
      setPublicKey(walletData.publicKey)
      setBalance(walletData.balance)
      setProvider(walletData.provider)
      setShowPlatform(true)

      console.log("Setting wallet state:", {
        connected: true,
        publicKey: walletData.publicKey,
        balance: walletData.balance,
        showPlatform: true,
      })
    } else {
      // Only reset if we're not already connected
      if (!showPlatform) {
        setWalletConnected(false)
        setPublicKey("")
        setBalance(null)
        setProvider(null)
        setShowPlatform(false)
      }
    }
  }

  const handleDisconnect = () => {
    if (provider && typeof provider.disconnect === "function") {
      provider.disconnect()
    }
    setWalletConnected(false)
    setPublicKey("")
    setBalance(null)
    setProvider(null)
    setShowPlatform(false)
  }

  // Create a connection object for Solana
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed")

  console.log("Current app state:", { walletConnected, publicKey, balance, showPlatform })

  // Show platform selector until wallet is connected and we should show platform
  if (!showPlatform || !walletConnected || !publicKey) {
    return (
      <main className="min-h-screen bg-background relative">
        <PromoWatermark />

        <div className="fixed top-4 right-4 md:right-8 z-[90]">
          <GlobalAudioControls />
        </div>

        <RetroArcadeBackground>
          <div className="max-w-6xl mx-auto p-4 md:p-8 z-10 relative flex items-center justify-center min-h-screen">
            <PlatformSelector onWalletConnect={handleWalletConnection} />
            <DebugOverlay initiallyVisible={false} position="bottom-right" />
          </div>
        </RetroArcadeBackground>

        {/* Show banner even before wallet connection */}
        <SignUpBanner walletConnected={walletConnected} />
      </main>
    )
  }

  // Show main platform once wallet is connected (wallet widget removed from top-right)
  return (
    <main className="min-h-screen bg-background relative">
      <PromoWatermark />

      {/* Audio controls positioned at top right */}
      <div className="fixed top-4 right-4 md:right-8 z-[90]">
        <GlobalAudioControls />
      </div>

      <RetroArcadeBackground>
        <div className="max-w-6xl mx-auto p-4 md:p-8 z-10 relative">
          <div className="mt-16">
            <MutablePlatform
              publicKey={publicKey}
              balance={balance}
              provider={provider}
              connection={connection}
              onDisconnect={handleDisconnect}
            />
          </div>
          <DebugOverlay initiallyVisible={false} position="bottom-right" />
        </div>
      </RetroArcadeBackground>

      {/* Show banner after wallet connection too */}
      <SignUpBanner walletConnected={walletConnected} />
    </main>
  )
}

export default function Home() {
  return (
    <CyberpunkThemeProvider>
      <PlatformProvider>
        <HomeContent />
      </PlatformProvider>
    </CyberpunkThemeProvider>
  )
}
