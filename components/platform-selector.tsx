"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Monitor, Smartphone, TestTube, Wallet, HelpCircle, ExternalLink } from "lucide-react"
import { usePlatform, type PlatformType } from "@/contexts/platform-context"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { LOGOS } from "@/utils/image-paths"
import SoundButton from "./sound-button"
import { audioManager, playIntroSound, initializeAudio, loadAudioFiles } from "@/utils/audio-manager"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// --- Types ---
type PhantomEvent = "connect" | "disconnect" | "accountChanged"
interface PhantomProvider {
  publicKey: { toString: () => string }
  isConnected: boolean
  connect: () => Promise<{
    publicKey: {
      toString: () => string
    }
  }>
  disconnect: () => Promise<void>
  on: (event: PhantomEvent, callback: (publicKey?: { toString: () => string }) => void) => void
  isPhantom: boolean
}
interface SolflareProvider extends PhantomProvider {
  isSolflare: boolean
}
type WindowWithSolana = Window & {
  solana?: PhantomProvider
  solflare?: SolflareProvider
}
type WalletType = "phantom" | "solflare" | "test"
interface WalletInfo {
  name: string
  type: WalletType
  icon: string
  available: boolean
}

interface WalletConnectionData {
  connected: boolean
  publicKey: string
  balance: number | null
  provider: any
  isTestMode?: boolean
}

interface PlatformSelectorProps {
  onWalletConnect: (walletData: WalletConnectionData) => void
}

export default function PlatformSelector({ onWalletConnect }: PlatformSelectorProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [wallets, setWallets] = useState<WalletInfo[]>([
    { name: "Phantom", type: "phantom", icon: LOGOS.PHANTOM, available: false },
    { name: "Solflare", type: "solflare", icon: LOGOS.SOLFLARE, available: false },
    { name: "Test Mode", type: "test", icon: "", available: true },
  ])
  const [loading, setLoading] = useState(false)
  const [isAudioInitialized, setIsAudioInitialized] = useState(false)
  const [connectingWallet, setConnectingWallet] = useState<WalletType | null>(null)

  const { setPlatform } = usePlatform()
  const { styleMode } = useCyberpunkTheme()

  const isCyberpunk = styleMode === "cyberpunk"

  // Initialize audio and wallet detection
  useEffect(() => {
    const initAudio = async () => {
      await initializeAudio()
      setIsAudioInitialized(true)
    }
    initAudio()
  }, [])

  useEffect(() => {
    const solWindow = window as WindowWithSolana
    const phantomAvailable = "solana" in window && !!solWindow.solana?.isPhantom
    const solflareAvailable = "solflare" in window && !!solWindow.solflare?.isSolflare

    setWallets((prev) =>
      prev.map((wallet) => {
        if (wallet.type === "phantom") return { ...wallet, available: phantomAvailable }
        if (wallet.type === "solflare") return { ...wallet, available: solflareAvailable }
        return wallet
      }),
    )
  }, [])

  const handlePlatformSelect = (platform: PlatformType) => {
    // Don't allow platform change while connecting
    if (isConnecting) return

    // Toggle selection off if the same card is clicked again
    if (selectedPlatform === platform) {
      setSelectedPlatform(null)
    } else {
      setSelectedPlatform(platform)
      setPlatform(platform)
    }
  }

  const connectWallet = async (walletType: WalletType) => {
    if (isAudioInitialized && !audioManager.isSoundMuted()) {
      await loadAudioFiles()
    }

    setLoading(true)
    setConnectingWallet(walletType)

    try {
      if (walletType === "test") {
        console.log("Connecting to test wallet...")
        if (!audioManager.isSoundMuted()) playIntroSound()

        const testWalletData = {
          publicKey: "TestModeWallet1111111111111111111111111",
          provider: {
            publicKey: { toString: () => "TestModeWallet1111111111111111111111111" },
            isConnected: true,
            isTestMode: true,
          },
          isTestMode: true,
        }

        if (selectedPlatform) {
          const connectionData: WalletConnectionData = {
            connected: true,
            publicKey: testWalletData.publicKey,
            balance: 5.0,
            provider: testWalletData.provider,
            isTestMode: true,
          }

          setTimeout(() => {
            onWalletConnect(connectionData)
          }, 500)
        }
        return
      }

      const solWindow = window as WindowWithSolana
      let provider: PhantomProvider | SolflareProvider | undefined
      if (walletType === "phantom") provider = solWindow.solana
      if (walletType === "solflare") provider = solWindow.solflare

      if (!provider) {
        alert(`${walletType} wallet not detected. Please install the ${walletType} wallet extension.`)
        return
      }

      console.log(`Connecting to ${walletType} wallet...`)
      const response = await provider.connect()
      const publicKey = response.publicKey.toString()

      if (publicKey) {
        if (!audioManager.isSoundMuted()) playIntroSound()

        if (selectedPlatform) {
          const connectionData: WalletConnectionData = {
            connected: true,
            publicKey,
            balance: null,
            provider,
            isTestMode: false,
          }

          setTimeout(() => {
            onWalletConnect(connectionData)
          }, 500)
        }
      }
    } catch (error) {
      console.error(`${walletType} connection error:`, error)
      alert(`Failed to connect to ${walletType}. Please try again.`)
    } finally {
      setLoading(false)
      setConnectingWallet(null)
    }
  }

  const handleWalletDownload = (walletType: "phantom" | "solflare") => {
    const urls = {
      phantom: "https://phantom.app/download",
      solflare: "https://solflare.com/download",
    }
    window.open(urls[walletType], "_blank", "noopener,noreferrer")
  }

  const platforms = [
    {
      type: "desktop" as PlatformType,
      title: "Desktop",
      icon: Monitor,
      image: "/images/retro-desktop-gaming.png",
    },
    {
      type: "mobile" as PlatformType,
      title: "Mobile",
      icon: Smartphone,
      image: "/images/retro-mobile-gaming.png",
    },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Logo */}
      <div className="text-center mb-12">
        <Image
          src={LOGOS.MUTABLE.TRANSPARENT || "/placeholder.svg"}
          alt="Mutable Logo"
          width={200}
          height={120}
          className="w-auto h-auto max-w-[200px] mx-auto filter drop-shadow-[0_0_15px_rgba(0,255,255,0.7)]"
        />
      </div>

      {/* Connection Status */}
      {isConnecting && (
        <div className="text-center mb-8">
          <div
            className={cn(
              "inline-flex items-center gap-3 px-6 py-3 rounded-lg border-2 font-mono",
              isCyberpunk
                ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300"
                : "bg-amber-200/50 border-amber-500/50 text-amber-800",
            )}
          >
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            <span>Connecting to platform...</span>
          </div>
        </div>
      )}

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {platforms.map((platform) => {
          const isSelected = selectedPlatform === platform.type
          const IconComponent = platform.icon

          return (
            <div key={platform.type} className="flip-card">
              <div
                className={cn("flip-card-inner transition-transform duration-700", isSelected && "flip-card-flipped")}
              >
                {/* Front Side - Platform Display */}
                <Card
                  className={cn(
                    "flip-card-front absolute inset-0 overflow-hidden cursor-pointer group",
                    "aspect-[4/3] border-4 p-0",
                    isConnecting && "pointer-events-none opacity-50",
                    isCyberpunk
                      ? "border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]"
                      : "border-amber-600/50 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:border-amber-500/70 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]",
                    isSelected &&
                      (isCyberpunk
                        ? "border-cyan-400/80 shadow-[0_0_25px_rgba(0,255,255,0.5)]"
                        : "border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.5)]"),
                  )}
                  onClick={() => handlePlatformSelect(platform.type)}
                >
                  {/* Background Image & Overlay */}
                  <div className="relative w-full h-full">
                    <Image
                      src={platform.image || "/placeholder.svg"}
                      alt={`${platform.title} Gaming`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

                    {/* Content */}
                    <div className="relative h-full flex flex-col items-center justify-center p-8 text-white text-shadow-lg">
                      <IconComponent className="h-16 w-16 mb-4 text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.7)] transition-transform duration-300 group-hover:scale-110" />
                      <h3 className="text-4xl font-bold font-mono tracking-wider text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.7)] md:text-4xl text-2xl">
                        {platform.title}
                      </h3>
                    </div>
                  </div>
                </Card>

                {/* Back Side - Wallet Connector */}
                <Card
                  className={cn(
                    "flip-card-back absolute inset-0 overflow-hidden",
                    "aspect-[4/3] border-4 p-0",
                    isCyberpunk
                      ? "border-cyan-400/80 shadow-[0_0_25px_rgba(0,255,255,0.5)]"
                      : "border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.5)]",
                  )}
                >
                  {/* Background Image & Overlay (same as front) */}
                  <div className="relative w-full h-full">
                    <Image
                      src={platform.image || "/placeholder.svg"}
                      alt={`${platform.title} Gaming`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/50" />

                    {/* Help Button - Top Right */}
                    <div className="absolute top-4 right-4 z-20">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SoundButton
                            className={cn(
                              "h-8 w-8 p-0 rounded-full flex items-center justify-center transition-all duration-200",
                              isCyberpunk
                                ? "bg-black/50 border-2 border-cyan-400/50 text-cyan-300 hover:bg-cyan-900/70 hover:border-cyan-400/80 hover:text-cyan-200"
                                : "bg-amber-200/80 border-amber-500/70 text-amber-900 hover:bg-amber-300/80 hover:border-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.3)]",
                            )}
                          >
                            <HelpCircle className="h-5 w-5" />
                          </SoundButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className={cn(
                            "w-56 border-2 font-mono",
                            isCyberpunk
                              ? "bg-slate-900/95 border-slate-600/50 text-slate-300"
                              : "bg-amber-50/95 border-amber-500/50 text-amber-900",
                          )}
                        >
                          <DropdownMenuItem
                            onClick={() => handleWalletDownload("phantom")}
                            className={cn(
                              "cursor-pointer transition-colors duration-200",
                              isCyberpunk
                                ? "hover:bg-slate-700/50 focus:bg-slate-700/50"
                                : "hover:bg-amber-200/50 focus:bg-amber-200/50",
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-1 rounded-full bg-white/90 border border-gray-300">
                                <Image
                                  src={LOGOS.PHANTOM || "/placeholder.svg"}
                                  alt="Phantom"
                                  width={16}
                                  height={16}
                                  className="rounded-full"
                                />
                              </div>
                              <span>Get Phantom Wallet</span>
                              <ExternalLink className="h-3 w-3 ml-auto" />
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleWalletDownload("solflare")}
                            className={cn(
                              "cursor-pointer transition-colors duration-200",
                              isCyberpunk
                                ? "hover:bg-slate-700/50 focus:bg-slate-700/50"
                                : "hover:bg-amber-200/50 focus:bg-amber-200/50",
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-1 rounded-full bg-white/90 border border-gray-300">
                                <Image
                                  src={LOGOS.SOLFLARE || "/placeholder.svg"}
                                  alt="Solflare"
                                  width={16}
                                  height={16}
                                  className="rounded-full"
                                />
                              </div>
                              <span>Get Solflare Wallet</span>
                              <ExternalLink className="h-3 w-3 ml-auto" />
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Wallet Connection Content */}
                    <div className="relative h-full flex flex-col items-center justify-center p-6 space-y-4 md:p-6 p-4">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={cn(
                            "p-2 rounded-lg border-2",
                            isCyberpunk
                              ? "bg-slate-800/60 border-slate-600/60"
                              : "bg-amber-200/80 border-amber-500/70 shadow-[0_0_10px_rgba(245,158,11,0.4)]",
                          )}
                        >
                          <Wallet className={cn("h-5 w-5", isCyberpunk ? "text-slate-300" : "text-amber-900")} />
                        </div>
                        <div className="text-center">
                          <h3
                            className={cn(
                              "font-mono font-bold tracking-wider md:text-lg text-base",
                              isCyberpunk
                                ? "text-slate-200"
                                : "text-white drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] font-black text-shadow-lg",
                            )}
                          >
                            CONNECT WALLET
                          </h3>
                        </div>
                      </div>

                      {/* Wallet Buttons */}
                      <div className="w-full space-y-3">
                        {wallets.map((wallet) => (
                          <SoundButton
                            key={wallet.type}
                            onClick={() => connectWallet(wallet.type)}
                            disabled={loading || !wallet.available}
                            className={cn(
                              "relative w-full justify-center font-bold px-4 border-2 transition-all duration-200 font-mono overflow-hidden group md:h-12 h-10 md:text-sm text-xs",
                              wallet.available
                                ? isCyberpunk
                                  ? "bg-slate-800/70 border-slate-600/70 text-slate-200 hover:bg-slate-700/80 hover:border-slate-500/80 hover:text-white hover:scale-[1.02]"
                                  : "bg-gradient-to-r from-amber-400 to-orange-400 border-amber-600 text-amber-900 hover:border-amber-700 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:scale-[1.02]"
                                : isCyberpunk
                                  ? "bg-slate-900/50 border-slate-700/50 text-slate-600 cursor-not-allowed opacity-60"
                                  : "bg-gray-600/70 border-gray-500/70 text-gray-300 cursor-not-allowed opacity-60",
                            )}
                          >
                            {/* Subtle shine effect for cyberpunk */}
                            {isCyberpunk && wallet.available && (
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                              </div>
                            )}

                            {/* Regular shine effect for light mode */}
                            {!isCyberpunk && wallet.available && (
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                              </div>
                            )}

                            <div className="relative flex items-center justify-center gap-3 z-10">
                              {wallet.type === "test" ? (
                                <div
                                  className={cn(
                                    "p-1.5 rounded-full border-2",
                                    isCyberpunk
                                      ? "bg-slate-700/50 border-slate-500/50"
                                      : "bg-orange-200 border-orange-400",
                                  )}
                                >
                                  <TestTube className="h-4 w-4" />
                                </div>
                              ) : (
                                <div className="p-0.5 rounded-full bg-white/90 border-2 border-gray-300">
                                  <Image
                                    src={wallet.icon || "/placeholder.svg"}
                                    alt={wallet.name}
                                    width={20}
                                    height={20}
                                    className="rounded-full"
                                  />
                                </div>
                              )}
                              <span className="font-bold tracking-wide md:text-sm text-xs">{wallet.name}</span>
                              {connectingWallet === wallet.type && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              )}
                            </div>
                          </SoundButton>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
