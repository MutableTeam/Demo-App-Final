"use client"

import { useState, useEffect } from "react"
import type { Connection } from "@solana/web3.js"
import { MultiWalletConnector } from "@/components/multi-wallet-connector"
import { Button } from "@/components/ui/button"
import ModeSelection from "@/components/mode-selection"
import MobileGameView from "@/components/mobile-game-view"
import DemoWatermark from "@/components/demo-watermark"
import PromoWatermark from "@/components/promo-watermark"
import GlobalAudioControls from "@/components/global-audio-controls"
import DebugOverlay from "@/components/debug-overlay"
import { registerGames } from "@/games/registry"
import MutablePlatform from "@/components/mutable-platform"
import RetroArcadeBackground from "@/components/retro-arcade-background"
import "@/styles/retro-arcade.css"
import { initializeGoogleAnalytics } from "@/utils/analytics"
import { initializeEnhancedRenderer } from "@/utils/enhanced-renderer-bridge"
import { clusterApiUrl, Connection as SolanaConnection } from "@solana/web3.js"

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = "G-41DL97N287"

export default function Home() {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [provider, setProvider] = useState<any>(null)
  const [connection, setConnection] = useState<Connection | null>(null)
  const [selectedMode, setSelectedMode] = useState<"unselected" | "desktop" | "mobile">("unselected")

  useEffect(() => {
    initializeGoogleAnalytics(GA_MEASUREMENT_ID)
    registerGames()
    initializeEnhancedRenderer()

    // Initialize connection
    const conn = new SolanaConnection(clusterApiUrl("devnet"), "confirmed")
    setConnection(conn)
  }, [])

  const handleModeSelect = (mode: "desktop" | "mobile") => {
    setSelectedMode(mode)
  }

  const handleBackToModeSelection = () => {
    setSelectedMode("unselected")
    setPublicKey(null)
    setBalance(null)
    setProvider(null)
  }

  const handleWalletConnect = async (connected: boolean, pk: string, bal: number | null, prov: any) => {
    if (!connected || !pk) {
      console.error("Wallet not connected or public key missing")
      setPublicKey(null)
      setBalance(null)
      setProvider(null)
      return
    }

    try {
      setProvider(prov)
      setPublicKey(pk)
      setBalance(bal)
    } catch (error) {
      console.error("Error connecting wallet:", error)
      setPublicKey(null)
      setBalance(null)
      setProvider(null)
    }
  }

  const renderContent = () => {
    if (selectedMode === "unselected") {
      return <ModeSelection onModeSelect={handleModeSelect} />
    }

    if (!publicKey || !provider || !connection) {
      return (
        <div className="w-full h-screen flex items-center justify-center">
          <div className="w-full max-w-md px-4 sm:px-0">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4 font-mono text-white">
                {selectedMode === "mobile" ? "Mobile Gaming" : "Desktop Gaming"}
              </h1>
              <Button
                variant="outline"
                onClick={handleBackToModeSelection}
                className="mb-6 bg-transparent text-white border-white/50 hover:bg-white/10"
              >
                ← Back to Mode Selection
              </Button>
            </div>
            <MultiWalletConnector
              onConnectionChange={handleWalletConnect}
              compact={false}
              className="logo-glow wallet-foreground"
            />
          </div>
        </div>
      )
    }

    if (selectedMode === "desktop") {
      return (
        <>
          <div className="fixed top-2 right-2 sm:right-4 md:right-6 z-[100]">
            <MultiWalletConnector
              onConnectionChange={handleWalletConnect}
              compact={true}
              className="wallet-foreground"
            />
          </div>
          <div className="fixed top-12 sm:top-14 right-4 md:right-8 z-[90]">
            <GlobalAudioControls />
          </div>
          <div className="max-w-6xl mx-auto p-4 md:p-8 z-10 relative">
            <DemoWatermark />
            <div className="mt-16">
              <MutablePlatform publicKey={publicKey} balance={balance} provider={provider} connection={connection} />
            </div>
            <DebugOverlay initiallyVisible={false} position="bottom-right" />
          </div>
        </>
      )
    }

    if (selectedMode === "mobile") {
      return (
        <MobileGameView
          publicKey={publicKey}
          balance={balance}
          provider={provider}
          connection={connection}
          onBackToModeSelection={handleBackToModeSelection}
          onWalletChange={handleWalletConnect}
        />
      )
    }
  }

  return (
    <main className="min-h-screen relative bg-black">
      <PromoWatermark />
      <RetroArcadeBackground>
        <div className="z-10 relative">{renderContent()}</div>
      </RetroArcadeBackground>
    </main>
  )
}
