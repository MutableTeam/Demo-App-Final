"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Wallet, ChevronDown, TestTube, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { LOGOS } from "@/utils/image-paths"
import SoundButton from "./sound-button"
import { audioManager, playIntroSound, initializeAudio, loadAudioFiles } from "@/utils/audio-manager"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"

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

// --- Props ---
interface MultiWalletConnectorProps {
  onConnectionChange: (connected: boolean, publicKey: string, balance: number | null, provider: any) => void
  compact?: boolean
  className?: string
  initialPublicKey?: string
  initialBalance?: number | null
  initialProvider?: any
}

export default function MultiWalletConnector({
  onConnectionChange,
  compact = false,
  className = "",
  initialPublicKey = "",
  initialBalance = null,
  initialProvider = null,
}: MultiWalletConnectorProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  const [wallets, setWallets] = useState<WalletInfo[]>([
    { name: "Phantom", type: "phantom", icon: LOGOS.PHANTOM, available: false },
    { name: "Solflare", type: "solflare", icon: LOGOS.SOLFLARE, available: false },
    { name: "Demo Mode", type: "test", icon: "", available: true },
  ])
  const [connected, setConnected] = useState(!!initialPublicKey)
  const [publicKey, setPublicKey] = useState(initialPublicKey)
  const [balance, setBalance] = useState<number | null>(initialBalance)
  const [mutbBalance, setMutbBalance] = useState<number | null>(null)
  const [provider, setProvider] = useState<any>(initialProvider)
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isAudioInitialized, setIsAudioInitialized] = useState(false)

  // Initialize with provided values
  useEffect(() => {
    if (initialPublicKey && initialProvider) {
      setConnected(true)
      setPublicKey(initialPublicKey)
      setBalance(initialBalance)
      setProvider(initialProvider)
    }
  }, [initialPublicKey, initialBalance, initialProvider])

  // --- Hooks and Logic ---
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

  const notifyParent = (connected: boolean, publicKey: string, balance: number | null, provider: any) => {
    console.log("Notifying parent of connection change:", { connected, publicKey, balance, mutbBalance })
    onConnectionChange(connected, publicKey, balance, provider)
  }

  const connectWallet = async (walletType: WalletType) => {
    if (isAudioInitialized && !audioManager.isSoundMuted()) {
      await loadAudioFiles()
    }
    setLoading(true)
    setShowDropdown(false)

    try {
      if (walletType === "test") {
        const testPublicKey = "TestModeWallet1111111111111111111111111"
        const testProvider = {
          publicKey: { toString: () => testPublicKey },
          isConnected: true,
          isTestMode: true,
        }

        setConnected(true)
        setPublicKey(testPublicKey)
        setBalance(5.0)
        setMutbBalance(1000)
        setProvider(testProvider)

        if (!audioManager.isSoundMuted()) playIntroSound()
        notifyParent(true, testPublicKey, 5.0, testProvider)
        return
      }

      const solWindow = window as WindowWithSolana
      let walletProvider: PhantomProvider | SolflareProvider | undefined
      if (walletType === "phantom") walletProvider = solWindow.solana
      if (walletType === "solflare") walletProvider = solWindow.solflare

      if (!walletProvider) {
        alert(`${walletType} wallet not detected.`)
        return
      }

      const response = await walletProvider.connect()
      const walletPublicKey = response.publicKey.toString()

      if (walletPublicKey) {
        setConnected(true)
        setPublicKey(walletPublicKey)
        setBalance(null)
        setMutbBalance(null)
        setProvider(walletProvider)

        if (!audioManager.isSoundMuted()) playIntroSound()
        notifyParent(true, walletPublicKey, null, walletProvider)
      }
    } catch (error) {
      console.error(`${walletType} connection error:`, error)
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      if (provider && provider.disconnect && !provider.isTestMode) {
        await provider.disconnect()
      }

      setConnected(false)
      setPublicKey("")
      setBalance(null)
      setMutbBalance(null)
      setProvider(null)
      setShowDropdown(false)

      notifyParent(false, "", null, null)
    } catch (error) {
      console.error("Disconnect error:", error)
    }
  }

  // --- UI Rendering ---
  if (!connected || !publicKey) {
    if (compact) {
      return null
    }

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
          className,
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
                      "bg-gradient-to-r from-cyan-500/20 to-purple-500/20",
                      "border-cyan-400/60 text-cyan-300",
                      "hover:border-cyan-300 hover:bg-gradient-to-r hover:from-cyan-500/40 hover:to-purple-500/40",
                      "shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.6)]",
                      "hover:scale-[1.02] hover:text-white",
                    ]
                  : ["bg-slate-800/50 border-slate-600/50 text-slate-500", "cursor-not-allowed opacity-60"],
              )}
            >
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
                </div>
              </div>
            </SoundButton>
          ))}
        </div>
      </div>
    )
  }

  // Connected state - compact view
  return (
    <div className={cn("relative", className)}>
      <SoundButton
        onClick={() => setShowDropdown(!showDropdown)}
        className={cn(
          "relative flex items-center gap-3 px-4 py-2 rounded-lg border-2 font-mono text-sm transition-all duration-200",
          isCyberpunk
            ? [
                "bg-gradient-to-r from-cyan-500/20 to-purple-500/20",
                "border-cyan-400/60 text-cyan-300",
                "hover:border-cyan-300 hover:bg-gradient-to-r hover:from-cyan-500/30 hover:to-purple-500/30",
                "shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]",
              ]
            : [
                "bg-gradient-to-r from-amber-400 to-orange-400",
                "border-amber-600 text-amber-900",
                "hover:border-amber-700 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500",
                "shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]",
              ],
        )}
      >
        <Wallet className="h-4 w-4" />
        <span className="font-bold">
          {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
        </span>
        {balance !== null && <span className="text-xs opacity-80">({balance.toFixed(2)} SOL)</span>}
        <ChevronDown className={cn("h-4 w-4 transition-transform", showDropdown && "rotate-180")} />
      </SoundButton>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className={cn(
            "absolute top-full right-0 mt-2 w-64 rounded-lg border-2 p-4 space-y-3 z-50",
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
          <div className="space-y-2">
            <div className={cn("text-xs font-mono", isCyberpunk ? "text-slate-400" : "text-amber-700")}>
              Public Key:
            </div>
            <div
              className={cn(
                "text-sm font-mono break-all p-2 rounded border",
                isCyberpunk
                  ? "bg-slate-800/50 border-slate-600/50 text-cyan-300"
                  : "bg-amber-100/50 border-amber-300/50 text-amber-800",
              )}
            >
              {publicKey}
            </div>
          </div>

          {balance !== null && (
            <div className="space-y-1">
              <div className={cn("text-xs font-mono", isCyberpunk ? "text-slate-400" : "text-amber-700")}>
                SOL Balance:
              </div>
              <div className={cn("text-lg font-bold font-mono", isCyberpunk ? "text-cyan-300" : "text-amber-800")}>
                {balance.toFixed(4)} SOL
              </div>
            </div>
          )}

          <SoundButton
            onClick={disconnectWallet}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-4 py-2 rounded border-2 font-mono text-sm transition-all duration-200",
              isCyberpunk
                ? ["bg-red-500/20 border-red-400/60 text-red-300", "hover:bg-red-500/30 hover:border-red-300"]
                : ["bg-red-100 border-red-400 text-red-700", "hover:bg-red-200 hover:border-red-500"],
            )}
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </SoundButton>
        </div>
      )}
    </div>
  )
}
