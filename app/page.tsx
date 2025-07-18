"use client"

import { useState, useEffect } from "react"
import MultiWalletConnector from "@/components/multi-wallet-connector"
import DemoWatermark from "@/components/demo-watermark"
import PromoWatermark from "@/components/promo-watermark"
import GlobalAudioControls from "@/components/global-audio-controls"
import DebugOverlay from "@/components/debug-overlay"
import PlatformSelector from "@/components/platform-selector"
import { registerGames } from "@/games/registry"
import MutablePlatform from "@/components/mutable-platform"
import RetroArcadeBackground from "@/components/retro-arcade-background"
import { Connection, clusterApiUrl } from "@solana/web3.js"
import "@/styles/retro-arcade.css"
import "@/styles/maximize-mode.css"
import { initializeGoogleAnalytics } from "@/utils/analytics"
import { initializeEnhancedRenderer } from "@/utils/enhanced-renderer-bridge"
import { PlatformProvider, usePlatform } from "@/contexts/platform-context"
import type { PlatformType } from "@/contexts/platform-context"
import { MaximizeToggle } from "@/components/maximize-toggle"

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = "G-41DL97N287"

function HomeContent() {
  const [showPlatform, setShowPlatform] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [publicKey, setPublicKey] = useState("")
  const [balance, setBalance] = useState<number | null>(null)
  const [provider, setProvider] = useState<any>(null)
  const [isMaximized, setIsMaximized] = useState(false)

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

  const handleWalletConnection = (connected: boolean, publicKey: string, balance: number | null, provider: any) => {
    console.log("Wallet connection changed:", { connected, publicKey, balance })
    setWalletConnected(connected)
    setPublicKey(publicKey)
    setBalance(balance)
    setProvider(provider)
  }

  const handlePlatformSelected = (platform: PlatformType) => {
    // Small delay to show selection feedback
    setTimeout(() => {
      setShowPlatform(true)
    }, 500)
  }

  const handleMaximizeToggle = (maximized: boolean) => {
    setIsMaximized(maximized)
  }

  // Create a connection object for Solana
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed")

  if (!showPlatform) {
    return (
      <main
        className={`min-h-screen bg-background relative maximize-container ${isMaximized ? "maximize-transition" : ""}`}
      >
        <PromoWatermark className="hide-on-maximize" />

        <div className="fixed top-4 right-4 md:right-8 z-[90] flex items-center gap-2">
          <GlobalAudioControls />
          <MaximizeToggle onToggle={handleMaximizeToggle} className="maximize-toggle" />
        </div>

        <RetroArcadeBackground>
          <div
            className={`max-w-6xl mx-auto p-4 md:p-8 z-10 relative flex items-center justify-center min-h-screen ${isMaximized ? "maximize-content" : ""}`}
          >
            <PlatformSelector onPlatformSelected={handlePlatformSelected} />
            <DebugOverlay initiallyVisible={false} position="bottom-right" />
          </div>
        </RetroArcadeBackground>
      </main>
    )
  }

  return (
    <main
      className={`min-h-screen bg-background relative maximize-container ${isMaximized ? "maximize-transition" : ""}`}
    >
      {/* PromoWatermark positioned at top left */}
      <PromoWatermark className="hide-on-maximize" />

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

      {/* Audio controls and maximize toggle positioned at top right below wallet when connected */}
      <div
        className={`fixed ${walletConnected ? "top-12 sm:top-14" : "top-4"} right-4 md:right-8 z-[90] flex items-center gap-2`}
      >
        <GlobalAudioControls />
        <MaximizeToggle onToggle={handleMaximizeToggle} className="maximize-toggle" />
      </div>

      <RetroArcadeBackground>
        <div className={`max-w-6xl mx-auto p-4 md:p-8 z-10 relative ${isMaximized ? "maximize-content" : ""}`}>
          <DemoWatermark className="hide-on-maximize" />

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
