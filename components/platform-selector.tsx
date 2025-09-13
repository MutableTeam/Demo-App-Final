"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Monitor, Smartphone, TestTube, HelpCircle, ExternalLink } from "lucide-react"
import { usePlatform, type PlatformType } from "@/contexts/platform-context"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { LOGOS } from "@/utils/image-paths"
import SoundButton from "./sound-button"
import { audioManager, playIntroSound, initializeAudio, loadAudioFiles } from "@/utils/audio-manager"
import { useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// --- Types ---
type PhantomEvent = "connect" | "disconnect" | "accountChanged"
interface PhantomProvider {
  publicKey: { toString: () => string }
  isConnected: boolean
  connect: () => Promise<{ publicKey: { toString: () => string } }>
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
  walletType?: "phantom" | "solflare" | "test"
  selectedPlatform?: "mobile" | "desktop" // Add selectedPlatform to interface
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
    { name: "Demo Mode", type: "test", icon: "", available: true },
  ])
  const [loading, setLoading] = useState(false)
  const [isAudioInitialized, setIsAudioInitialized] = useState(false)
  const [connectingWallet, setConnectingWallet] = useState<WalletType | null>(null)

  const { setPlatform } = usePlatform()
  const { styleMode } = useCyberpunkTheme()

  const isCyberpunk = true

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
        console.log("Connecting to demo wallet...")
        if (!audioManager.isSoundMuted()) playIntroSound()

        const testWalletData = {
          publicKey: "DemoModeWallet1111111111111111111111111",
          provider: {
            publicKey: { toString: () => "DemoModeWallet1111111111111111111111111" },
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
            walletType: "test",
            selectedPlatform: selectedPlatform, // Pass the selected platform card
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
            walletType: walletType,
            selectedPlatform: selectedPlatform, // Pass the selected platform card
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
      type: "mobile" as PlatformType,
      title: "Mobile",
      icon: Smartphone,
      image: "/images/retro-mobile-gaming.png",
    },
    {
      type: "desktop" as PlatformType,
      title: "Desktop",
      icon: Monitor,
      image: "/images/retro-desktop-gaming.png",
    },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Logo */}
      <div className="text-center mb-12">
        <Image
          src={LOGOS.MUTABLE.TRANSPARENT || "/placeholder.svg"}
          alt="Mutable Logo"
          width={160}
          height={96}
          className="w-auto h-auto max-w-[160px] mx-auto filter drop-shadow-[0_0_15px_rgba(0,255,255,0.7)]"
        />
      </div>

      {/* Connection Status */}
      {isConnecting && (
        <div className="text-center mb-8">
          <div
            className={cn(
              "inline-flex items-center gap-3 px-6 py-3 rounded-lg border-2 font-mono",
              "bg-cyan-500/20 border-cyan-400/50 text-cyan-300",
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
                    "border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]",
                    isSelected && "border-cyan-400/80 shadow-[0_0_25px_rgba(0,255,255,0.5)]",
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
                    "border-cyan-400/80 shadow-[0_0_25px_rgba(0,255,255,0.5)]",
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

                    {/* Help Icon - Top Right */}
                    <div className="absolute top-4 right-4 z-20">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div
                            className={cn(
                              "cursor-pointer p-2 rounded-full transition-all duration-200",
                              "text-slate-400 hover:text-cyan-300",
                            )}
                          >
                            <HelpCircle className="h-5 w-5" />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className={cn(
                            "w-56 border-2 font-mono",
                            "bg-slate-900/95 border-slate-600/50 text-slate-300",
                          )}
                        >
                          <DropdownMenuItem
                            onClick={() => handleWalletDownload("phantom")}
                            className={cn(
                              "cursor-pointer transition-colors duration-200",
                              "hover:bg-slate-700/50 focus:bg-slate-700/50",
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
                              <span className="text-slate-200">Get Phantom Wallet</span>
                              <ExternalLink className="h-3 w-3 ml-auto" />
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleWalletDownload("solflare")}
                            className={cn(
                              "cursor-pointer transition-colors duration-200",
                              "hover:bg-slate-700/50 focus:bg-slate-700/50",
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
                                ? // Brighter hover states with better contrast
                                  "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400/60 text-cyan-300 hover:border-cyan-300 hover:bg-gradient-to-r hover:from-cyan-500/40 hover:to-purple-500/40 hover:scale-[1.02] shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.6)] hover:text-white"
                                : // Updated disabled text color from text-slate-500 to text-slate-300 for better contrast
                                  "bg-slate-900/50 border-slate-700/50 text-slate-300 cursor-not-allowed opacity-60",
                            )}
                          >
                            {/* Subtle shine effect for cyberpunk */}
                            {wallet.available && (
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                              </div>
                            )}

                            <div className="relative flex items-center justify-center gap-3 z-10">
                              {wallet.type === "test" ? (
                                <div
                                  className={cn("p-1.5 rounded-full border-2", "bg-slate-700/50 border-slate-500/50")}
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
