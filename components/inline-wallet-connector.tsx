"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { TestTube, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { LOGOS } from "@/utils/image-paths"
import SoundButton from "./sound-button"
import { audioManager, playIntroSound, initializeAudio, loadAudioFiles } from "@/utils/audio-manager"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"

// --- Types (reused from multi-wallet-connector) ---
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

// --- Props ---
interface InlineWalletConnectorProps {
  onConnect: (walletData: {
    publicKey: string
    provider?: any
    isTestMode?: boolean
  }) => void
}

export default function InlineWalletConnector({ onConnect }: InlineWalletConnectorProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  const [wallets, setWallets] = useState<WalletInfo[]>([
    { name: "Phantom", type: "phantom", icon: LOGOS.PHANTOM, available: false },
    { name: "Solflare", type: "solflare", icon: LOGOS.SOLFLARE, available: false },
    { name: "Test Mode", type: "test", icon: "", available: true },
  ])
  const [loading, setLoading] = useState(false)
  const [isAudioInitialized, setIsAudioInitialized] = useState(false)
  const [connectingWallet, setConnectingWallet] = useState<WalletType | null>(null)

  // --- Hooks and Logic (adapted from MultiWalletConnector) ---
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

        console.log("Test wallet data:", testWalletData)
        onConnect(testWalletData)
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

        const walletData = {
          publicKey,
          provider,
          isTestMode: false,
        }

        console.log(`${walletType} wallet connected:`, walletData)
        onConnect(walletData)
      }
    } catch (error) {
      console.error(`${walletType} connection error:`, error)
      alert(`Failed to connect to ${walletType}. Please try again.`)
    } finally {
      setLoading(false)
      setConnectingWallet(null)
    }
  }

  // --- UI Rendering ---
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg p-6 space-y-6 border-4 transition-all duration-300",
        isCyberpunk
          ? [
              "bg-gradient-to-br from-slate-900/95 to-purple-900/95",
              "border-cyan-500/40 shadow-[0_0_20px_rgba(0,255,255,0.3)]",
              "backdrop-blur-sm",
            ]
          : [
              "bg-gradient-to-br from-amber-50/95 to-orange-100/95",
              "border-amber-600/60 shadow-[0_0_20px_rgba(245,158,11,0.3)]",
              "backdrop-blur-sm",
            ],
      )}
    >
      {/* Scanline effect overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent animate-pulse" />
      </div>

      {/* Header */}
      <div className="relative flex items-center gap-3">
        <div
          className={cn(
            "p-2 rounded-lg border-2",
            isCyberpunk
              ? ["bg-cyan-500/20 border-cyan-400/50", "shadow-[0_0_10px_rgba(0,255,255,0.5)]"]
              : ["bg-amber-200/50 border-amber-500/50", "shadow-[0_0_10px_rgba(245,158,11,0.3)]"],
          )}
        >
          <Wallet className={cn("h-6 w-6", isCyberpunk ? "text-cyan-300" : "text-amber-700")} />
        </div>
        <div>
          <h3
            className={cn(
              "font-mono font-bold text-lg tracking-wider",
              isCyberpunk
                ? ["text-cyan-300", "drop-shadow-[0_0_8px_rgba(0,255,255,0.7)]"]
                : ["text-amber-800", "drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]"],
            )}
          >
            SOLANA WALLET
          </h3>
          <p className={cn("text-sm font-mono", isCyberpunk ? "text-slate-300" : "text-amber-700")}>
            Connect your Solana wallet to use Mutable
          </p>
        </div>
      </div>

      {/* Wallet Buttons */}
      <div className="relative grid grid-cols-1 gap-4">
        {wallets.map((wallet) => (
          <SoundButton
            key={wallet.type}
            onClick={() => connectWallet(wallet.type)}
            disabled={loading || !wallet.available}
            className={cn(
              "relative w-full justify-start h-14 font-bold text-sm px-6 border-2 transition-all duration-200 font-mono overflow-hidden group",
              wallet.available
                ? [
                    isCyberpunk
                      ? [
                          "bg-gradient-to-r from-cyan-500/20 to-purple-500/20",
                          "border-cyan-400/60 text-cyan-300",
                          "hover:border-cyan-300 hover:bg-gradient-to-r hover:from-cyan-500/30 hover:to-purple-500/30",
                          "shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]",
                          "hover:scale-[1.02]",
                        ]
                      : [
                          "bg-gradient-to-r from-amber-400 to-orange-400",
                          "border-amber-600 text-amber-900",
                          "hover:border-amber-700 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500",
                          "shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]",
                          "hover:scale-[1.02]",
                        ],
                  ]
                : [
                    isCyberpunk
                      ? ["bg-slate-800/50 border-slate-600/50 text-slate-300", "cursor-not-allowed opacity-60"]
                      : ["bg-gray-300/70 border-gray-400/70 text-gray-600", "cursor-not-allowed opacity-60"],
                  ],
            )}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700",
                )}
              />
            </div>

            <div className="relative flex items-center gap-4 z-10">
              {wallet.type === "test" ? (
                <div
                  className={cn(
                    "p-2 rounded-full border-2",
                    isCyberpunk ? ["bg-purple-500/30 border-purple-400/60"] : ["bg-orange-200 border-orange-400"],
                  )}
                >
                  <TestTube className="h-5 w-5" />
                </div>
              ) : (
                <div className="p-1 rounded-full bg-white/90 border-2 border-gray-300">
                  <Image
                    src={wallet.icon || "/placeholder.svg"}
                    alt={wallet.name}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                </div>
              )}
              <div className="flex-1 text-left">
                <span className="text-base font-bold tracking-wide">{wallet.name}</span>
                {!wallet.available && wallet.type !== "test" && (
                  <div className="text-xs opacity-70 font-mono">(Not Detected)</div>
                )}
                {connectingWallet === wallet.type && <div className="text-xs opacity-70 font-mono">Connecting...</div>}
              </div>
              {connectingWallet === wallet.type && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
              )}
            </div>
          </SoundButton>
        ))}
      </div>

      {/* Footer Links */}
      <div className="relative text-center pt-4 border-t border-cyan-500/20">
        <p className={cn("mb-3 text-sm font-mono", isCyberpunk ? "text-slate-400" : "text-amber-700")}>
          Don't have a Solana wallet?
        </p>
        <div className="flex justify-center gap-6">
          <a
            href="https://phantom.app/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "font-mono font-medium transition-all duration-200 hover:scale-105",
              isCyberpunk
                ? ["text-cyan-400 hover:text-cyan-300", "drop-shadow-[0_0_4px_rgba(0,255,255,0.5)]"]
                : ["text-blue-600 hover:text-blue-700", "hover:drop-shadow-[0_0_4px_rgba(37,99,235,0.5)]"],
            )}
          >
            Get Phantom
          </a>
          <a
            href="https://solflare.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "font-mono font-medium transition-all duration-200 hover:scale-105",
              isCyberpunk
                ? ["text-cyan-400 hover:text-cyan-300", "drop-shadow-[0_0_4px_rgba(0,255,255,0.5)]"]
                : ["text-blue-600 hover:text-blue-700", "hover:drop-shadow-[0_0_4px_rgba(37,99,235,0.5)]"],
            )}
          >
            Get Solflare
          </a>
        </div>
      </div>
    </div>
  )
}
