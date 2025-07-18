"use client"

import { useState, useEffect } from "react"
import MultiWalletConnector from "@/components/multi-wallet-connector"
import DemoWatermark from "@/components/demo-watermark"
import PromoWatermark from "@/components/promo-watermark"
import GlobalAudioControls from "@/components/global-audio-controls"
import { registerGames } from "@/games/registry"
import MutablePlatform from "@/components/mutable-platform"
import RetroArcadeBackground from "@/components/retro-arcade-background"
import { Connection, clusterApiUrl } from "@solana/web3.js"
import "@/styles/retro-arcade.css"
import { initializeGoogleAnalytics } from "@/utils/analytics"
import { initializeEnhancedRenderer } from "@/utils/enhanced-renderer-bridge"
import ModeSelection from "@/components/mode-selection"
import MobileGameView from "@/components/mobile-game-view"

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = "G-41DL97N287"

export default function Home() {
  const [mode, setMode] = useState<"unselected" | "desktop" | "mobile">("unselected")
  const [walletConnected, setWalletConnected] = useState(false)
  const [publicKey, setPublicKey] = useState("")
  const [balance, setBalance] = useState<number | null>(null)
  const [provider, setProvider] = useState<any>(null)

  useEffect(() => {
    initializeGoogleAnalytics(GA_MEASUREMENT_ID)
    registerGames()
    initializeEnhancedRenderer()
  }, [])

  const handleWalletConnection = (connected: boolean, publicKey: string, balance: number | null, provider: any) => {
    setWalletConnected(connected)
    setPublicKey(publicKey)
    setBalance(balance)
    setProvider(provider)
  }

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed")

  const renderContent = () => {
    if (mode === "unselected") {
      return <ModeSelection onSelectMode={setMode} />
    }

    if (!walletConnected) {
      return (
        <div className="w-full h-screen flex items-center justify-center">
          <div className="w-full max-w-md px-4 sm:px-0">
            <MultiWalletConnector
              onConnectionChange={handleWalletConnection}
              compact={false}
              className="logo-glow wallet-foreground"
            />
          </div>
        </div>
      )
    }

    if (mode === "desktop") {
      return (
        <>
          <div className="fixed top-2 right-2 sm:right-4 md:right-6 z-[100]">
            <MultiWalletConnector
              onConnectionChange={handleWalletConnection}
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
          </div>
        </>
      )
    }

    if (mode === "mobile") {
      return (
        <MobileGameView
          publicKey={publicKey}
          balance={balance}
          provider={provider}
          connection={connection}
          onWalletChange={handleWalletConnection}
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
