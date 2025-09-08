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
import { CyberpunkFooter } from "@/components/cyberpunk-footer"

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = "G-41DL97N287"

function HomeContent() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [publicKey, setPublicKey] = useState("")
  const [balance, setBalance] = useState<number | null>(null)
  const [provider, setProvider] = useState<any>(null)
  const [showPlatform, setShowPlatform] = useState(false)
  const [showSocials, setShowSocials] = useState(true)

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

  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down and past 50px - hide socials
        setShowSocials(false)
      } else if (currentScrollY < lastScrollY || currentScrollY <= 50) {
        // Scrolling up or at top - show socials
        setShowSocials(true)
      }

      lastScrollY = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
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
      <main className="min-h-screen bg-background relative flex flex-col">
        <PromoWatermark />

        <div className="fixed bottom-4 right-4 md:right-8 z-[90]">
          <GlobalAudioControls />
        </div>

        <div
          className={`fixed top-4 left-0 right-0 flex justify-between pointer-events-none z-50 transition-all duration-300 ${
            showSocials ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
          }`}
        >
          <div className="flex items-center pointer-events-auto ml-4">
            <a href="https://www.mutablepvp.com" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
              <img
                src="/images/mutable-logo-transparent.png"
                alt="Mutable PvP"
                className="w-[44px] h-[44px] opacity-80 hover:opacity-100 transition-opacity duration-200"
              />
            </a>
          </div>

          <div className="flex gap-4 items-center pointer-events-auto mr-4">
            <a
              href="https://x.com/mutablepvp"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 flex items-center justify-center transition-colors duration-200 text-cyan-400 hover:text-white hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.9)]"
              title="X"
              aria-label="X"
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.80l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://t.me/OfficialMutablePvP"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 flex items-center justify-center transition-colors duration-200 text-cyan-400 hover:text-white hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.9)]"
              title="Telegram"
              aria-label="Telegram"
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </a>
            <a
              href="https://facebook.com/mutablepvp"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 flex items-center justify-center transition-colors duration-200 text-cyan-400 hover:text-white hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.9)]"
              title="Facebook"
              aria-label="Facebook"
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="https://instagram.com/mutablepvp"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 flex items-center justify-center transition-colors duration-200 text-cyan-400 hover:text-white hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.9)]"
              title="Instagram"
              aria-label="Instagram"
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.948 0-3.204.013-3.583.07-4.849.149-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.204-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="flex-1">
          <RetroArcadeBackground>
            <div className="max-w-6xl mx-auto p-4 md:p-8 z-10 relative flex items-center justify-center min-h-screen">
              <PlatformSelector onWalletConnect={handleWalletConnection} />
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

      <div
        className={`fixed top-4 left-0 right-0 flex justify-between pointer-events-none z-50 transition-all duration-300 ${
          showSocials ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
        }`}
      >
        <div className="flex items-center pointer-events-auto ml-4">
          <a href="https://www.mutablepvp.com" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
            <img
              src="/images/mutable-logo-transparent.png"
              alt="Mutable PvP"
              className="w-[44px] h-[44px] opacity-80 hover:opacity-100 transition-opacity duration-200"
            />
          </a>
        </div>

        <div className="flex gap-4 items-center pointer-events-auto mr-4">
          <a
            href="https://x.com/mutablepvp"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 flex items-center justify-center transition-colors duration-200 text-cyan-400 hover:text-white hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.9)]"
            title="X"
            aria-label="X"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.80l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="https://t.me/OfficialMutablePvP"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 flex items-center justify-center transition-colors duration-200 text-cyan-400 hover:text-white hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.9)]"
            title="Telegram"
            aria-label="Telegram"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          </a>
          <a
            href="https://facebook.com/mutablepvp"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 flex items-center justify-center transition-colors duration-200 text-cyan-400 hover:text-white hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.9)]"
            title="Facebook"
            aria-label="Facebook"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a
            href="https://instagram.com/mutablepvp"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 flex items-center justify-center transition-colors duration-200 text-cyan-400 hover:text-white hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.9)]"
            title="Instagram"
            aria-label="Instagram"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.948 0-3.204.013-3.583.07-4.849.149-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.204-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        </div>
      </div>

      <div className="flex-1">
        <RetroArcadeBackground>
          <div className="max-w-6xl mx-auto p-4 md:p-8 z-10 relative mt-8">
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

      {walletConnected && <SignUpBanner walletConnected={walletConnected} />}

      <CyberpunkFooter />
    </main>
  )
  \
  )
}

export default function Home() {
  return (
    <PlatformProvider>
      <HomeContent />
    </PlatformProvider>
  )
}
