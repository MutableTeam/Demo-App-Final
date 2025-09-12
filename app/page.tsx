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
import { trackLogin } from "@/utils/analytics"
import { initializeEnhancedRenderer } from "@/utils/enhanced-renderer-bridge"
import { PlatformProvider, usePlatform } from "@/contexts/platform-context"
import { AirdropSideTag } from "@/components/airdrop-side-tag"
import { CyberpunkFooter } from "@/components/cyberpunk-footer"
import { useIsMobile } from "@/components/ui/use-mobile"

function HomeContent() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [publicKey, setPublicKey] = useState("")
  const [balance, setBalance] = useState<number | null>(null)
  const [provider, setProvider] = useState<any>(null)
  const [showPlatform, setShowPlatform] = useState(false)

  // Platform context
  const { isSelected: isPlatformSelected } = usePlatform()

  const isMobile = useIsMobile()

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
    walletType?: "phantom" | "solflare" | "test"
  }) => {
    console.log("Wallet connection data received:", walletData)

    if (walletData.connected && walletData.publicKey) {
      setWalletConnected(true)
      setPublicKey(walletData.publicKey)
      setBalance(walletData.balance)
      setProvider(walletData.provider)
      setShowPlatform(true)

      const platform = isMobile ? "mobile" : "desktop"
      const loginType = walletData.isTestMode ? "demo" : "wallet"
      const walletType = walletData.walletType || (walletData.isTestMode ? "test" : undefined)

      trackLogin(loginType, platform, walletType)

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
      <main className="min-h-screen bg-background relative flex flex-col">
        <PromoWatermark />

        <div className="fixed bottom-4 right-4 md:right-8 z-[90]">
          <GlobalAudioControls />
        </div>

        <div className="flex-1 pb-4">
          <RetroArcadeBackground>
            <div className="max-w-6xl mx-auto p-2 pt-4 md:p-8 md:pt-6 z-10 relative flex items-start justify-center">
              <div className="w-full flex flex-col items-center">
                <PlatformSelector onWalletConnect={handleWalletConnection} />
              </div>
              <DebugOverlay initiallyVisible={false} position="bottom-right" />
            </div>
          </RetroArcadeBackground>
        </div>

        <CyberpunkFooter />
      </main>
    )
  }

  // Show main platform once wallet is connected (wallet widget removed from top-right)
  return (
    <main className="min-h-screen bg-background relative flex flex-col">
      <PromoWatermark />

      <div className="fixed bottom-4 right-4 md:right-8 z-[90]">
        <GlobalAudioControls />
      </div>

      <div className="flex-1 pb-4">
        <RetroArcadeBackground>
          <div className="max-w-6xl mx-auto p-4 md:p-8 z-10 relative">
            <MutablePlatform
              publicKey={publicKey}
              balance={balance}
              provider={provider}
              connection={connection}
              onDisconnect={handleDisconnect}
            />
          </div>
        </RetroArcadeBackground>
      </div>

      {walletConnected && <AirdropSideTag walletConnected={walletConnected} />}

      <CyberpunkFooter />
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
