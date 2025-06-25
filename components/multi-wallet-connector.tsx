"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Copy, Check, Wallet, TestTube, ChevronUp, ChevronDown } from "lucide-react"
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js"
import Image from "next/image"
import SoundButton from "./sound-button"
import { audioManager, playIntroSound, initializeAudio, loadAudioFiles } from "@/utils/audio-manager"
import { LOGOS, TOKENS } from "@/utils/image-paths"

// Add imports for the theme context
// Remove this line:
// import { useTheme } from "next-themes"
// Keep only this import:
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"

// Add this after the existing imports
import { keyframes } from "@emotion/react"
import styled from "@emotion/styled"

// Add these styled components and keyframes after the imports and before the component definition
const pulse = keyframes`
  0% {
    filter: drop-shadow(0 0 15px rgba(0, 255, 255, 0.7));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 25px rgba(255, 0, 255, 0.7));
  }
  100% {
    filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.9));
    transform: scale(1.05);
  }
`

const controllerGlitch = keyframes`
  0%, 90%, 100% { opacity: 0; transform: translate(0); }
  92% { opacity: 0.3; transform: translate(-5px, 3px); }
  94% { opacity: 0; transform: translate(0); }
  96% { opacity: 0.3; transform: translate(5px, -3px); }
  98% { opacity: 0; transform: translate(0); }
`

const blinkKeyframes = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0.5; }
`

// Add this CSS block right before the MultiWalletConnectorProps interface
const StyledImage = styled(Image)`
  filter: drop-shadow(0 0 15px rgba(0, 255, 255, 0.7));
  animation: ${pulse} 3s infinite alternate;
  transform-origin: center;
  transition: all 0.3s ease;
  margin: 0 auto;

  .controller-container:hover & {
    filter: drop-shadow(0 0 25px rgba(0, 255, 255, 1));
    transform: scale(1.08);
  }

  .controller-container:active & {
    transform: scale(0.95);
    filter: drop-shadow(0 0 15px rgba(255, 0, 255, 1));
  }
`

const ControllerContainer = styled.div`
  position: relative;
  margin: 0 auto;
  text-align: center;
  max-width: 400px;
  cursor: pointer;
  transition: transform 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`

const ControllerGlitch = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  width: 100%;
  height: 100%;
  background-image: url('${LOGOS.MUTABLE.TRANSPARENT}');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  opacity: 0;
  filter: hue-rotate(30deg) brightness(1.2);
  animation: ${controllerGlitch} 5s infinite;
  z-index: 5;
`

const CyberpunkCard = styled(Card)`
  background: linear-gradient(135deg, rgba(16, 16, 48, 0.9) 0%, rgba(32, 16, 64, 0.9) 100%);
  border: 1px solid rgba(0, 255, 255, 0.3);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.2), inset 0 0 10px rgba(255, 0, 255, 0.1);
  backdrop-filter: blur(5px);
  position: relative;
  overflow: hidden;
  width: 100%;
  min-width: 280px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 48%, rgba(0, 255, 255, 0.1) 50%, transparent 52%);
    background-size: 200% 200%;
    animation: shine 8s infinite linear;
    z-index: 0;
  }

  @keyframes shine {
    0% { background-position: 200% 0; }
    100% { background-position: 0 200%; }
  }
`

const CyberpunkCardHeader = styled(CardHeader)`
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  background: rgba(16, 16, 48, 0.7);
  position: relative;
  z-index: 1;
  padding-bottom: 1rem;
  margin-bottom: 0.5rem;
`

const CyberpunkCardTitle = styled(CardTitle)`
  color: #0ff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  font-family: monospace;
  font-weight: bold;
  font-size: 1rem;
  letter-spacing: 1px;
`

const CyberpunkCardContent = styled(CardContent)`
  position: relative;
  z-index: 1;
`

const CyberpunkCardFooter = styled(CardFooter)`
  border-top: 1px solid rgba(0, 255, 255, 0.3);
  background: rgba(16, 16, 48, 0.7);
  position: relative;
  z-index: 1;
`

const CyberpunkButton = styled(SoundButton)`
  background: linear-gradient(90deg, #0ff 0%, #f0f 100%);
  color: #000;
  font-family: monospace;
  font-weight: bold;
  font-size: 0.7rem;
  letter-spacing: 1px;
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-shadow: none;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.7);
    background: linear-gradient(90deg, #0ff 20%, #f0f 80%);
  }
  
  &:active {
    transform: translateY(1px);
  }
`

const GridBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(0deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  transform: perspective(500px) rotateX(60deg);
  transform-origin: center bottom;
  opacity: 0.3;
  z-index: 0;
`

const CyberpunkBadge = styled(Badge)`
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.2) 0%, rgba(255, 0, 255, 0.2) 100%);
  border: 1px solid rgba(0, 255, 255, 0.5);
  color: #0ff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  font-family: monospace;
  font-weight: bold;
  font-size: 0.6rem;
  letter-spacing: 1px;
  padding: 0.2rem 0.5rem;
`

const TestModeButton = styled(CyberpunkButton)`
  background: linear-gradient(90deg, #f0f 0%, #b300b3 100%);
  
  &:hover {
    background: linear-gradient(90deg, #f0f 20%, #b300b3 80%);
    box-shadow: 0 0 15px rgba(255, 0, 255, 0.7);
  }
`

const TestModeBadge = styled(CyberpunkBadge)`
  background: linear-gradient(90deg, rgba(255, 0, 255, 0.2) 0%, rgba(179, 0, 179, 0.2) 100%);
  border: 1px solid rgba(255, 0, 255, 0.5);
  color: #f0f;
  text-shadow: 0 0 5px rgba(255, 0, 255, 0.7);
`

// Define types for Phantom wallet
type PhantomEvent = "connect" | "disconnect" | "accountChanged"

interface PhantomProvider {
  publicKey: { toString: () => string }
  isConnected: boolean
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>
  signTransaction: (transaction: any) => Promise<any>
  signAllTransactions: (transactions: any[]) => Promise<any[]>
  connect: () => Promise<{ publicKey: { toString: () => string } }>
  disconnect: () => Promise<void>
  on: (event: PhantomEvent, callback: () => void) => void
  isPhantom: boolean
}

// Define types for Solflare wallet
interface SolflareProvider {
  publicKey: { toString: () => string }
  isConnected: boolean
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>
  signTransaction: (transaction: any) => Promise<any>
  signAllTransactions: (transactions: any[]) => Promise<any[]>
  connect: () => Promise<{ publicKey: { toString: () => string } }>
  disconnect: () => Promise<void>
  on: (event: PhantomEvent, callback: () => void) => void
  isSolflare: boolean
}

type WindowWithSolana = Window & {
  solana?: PhantomProvider
  solflare?: SolflareProvider
}

// Use devnet for testing
const connection = new Connection(clusterApiUrl("devnet"), "confirmed")

// Wallet types
type WalletType = "phantom" | "solflare" | "test"

interface WalletInfo {
  name: string
  type: WalletType
  icon: string
  available: boolean
}

// Mock provider for test mode
const createMockProvider = () => {
  const mockPublicKey = {
    toString: () => "TestModeWallet1111111111111111111111111",
  }

  return {
    publicKey: mockPublicKey,
    isConnected: true,
    signMessage: async (message: Uint8Array) => ({ signature: new Uint8Array([1, 2, 3]) }),
    signTransaction: async (transaction: any) => transaction,
    signAllTransactions: async (transactions: any[]) => transactions,
    connect: async () => ({ publicKey: mockPublicKey }),
    disconnect: async () => {},
    on: (event: PhantomEvent, callback: () => void) => {},
    isPhantom: false,
    isSolflare: false,
    isTestMode: true,
  }
}

// Update the MultiWalletConnectorProps interface to include a compact prop
interface MultiWalletConnectorProps {
  onConnectionChange?: (connected: boolean, publicKey: string, balance: number | null, provider: any) => void
  compact?: boolean
  className?: string
}

// Update the function signature to include the compact prop with a default value
export default function MultiWalletConnector({
  onConnectionChange,
  compact = false,
  className = "",
}: MultiWalletConnectorProps) {
  const [activeWallet, setActiveWallet] = useState<WalletType | null>(null)
  const [wallets, setWallets] = useState<WalletInfo[]>([
    {
      name: "Phantom",
      type: "phantom",
      icon: LOGOS.PHANTOM,
      available: false,
    },
    {
      name: "Solflare",
      type: "solflare",
      icon: LOGOS.SOLFLARE,
      available: false,
    },
    {
      name: "Test Mode",
      type: "test",
      icon: "/placeholder.svg?height=24&width=24",
      available: true,
    },
  ])

  // Wallet state
  const [provider, setProvider] = useState<PhantomProvider | SolflareProvider | any>(null)
  const [connected, setConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<string>("")
  const [balance, setBalance] = useState<number | null>(null)
  const [isTestMode, setIsTestMode] = useState(false)
  const [mutbBalance, setMutbBalance] = useState<number | null>(null)
  const [connectedWallet, setConnectedWallet] = useState<PhantomProvider | SolflareProvider | null>(null)

  // UI state
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAudioInitialized, setIsAudioInitialized] = useState(false)

  // Add theme control
  // Replace this line:
  // const { setTheme } = useTheme()
  // With this line:
  const { styleMode, toggleStyleMode } = useCyberpunkTheme()

  const testWalletAddress = "TestModeWallet1111111111111111111111111"

  // Initialize audio manager (but don't load sounds yet)
  useEffect(() => {
    const initAudio = async () => {
      await initializeAudio()
      setIsAudioInitialized(true)
    }

    initAudio()
  }, [])

  // Check for available wallets
  useEffect(() => {
    const solWindow = window as WindowWithSolana

    // Check for Phantom
    const phantomAvailable = "solana" in window && solWindow.solana?.isPhantom

    // Check for Solflare
    const solflareAvailable = "solflare" in window && solWindow.solflare?.isSolflare

    setWallets((prev) =>
      prev.map((wallet) => {
        if (wallet.type === "phantom") {
          return { ...wallet, available: phantomAvailable }
        } else if (wallet.type === "solflare") {
          return { ...wallet, available: solflareAvailable }
        }
        return wallet
      }),
    )

    // Check if already connected to Phantom
    if (phantomAvailable && solWindow.solana!.isConnected && solWindow.solana!.publicKey) {
      setProvider(solWindow.solana!)
      setConnected(true)
      setPublicKey(solWindow.solana!.publicKey.toString())
      setActiveWallet("phantom")
      setIsCollapsed(true) // Minimize wallet by default for already connected wallets
      setConnectedWallet(solWindow.solana!)

      // Switch to dark mode after connection
      // Replace this:
      // setTheme("dark")
      // With this:
      // if (styleMode === "regular") {
      //   toggleStyleMode()
      // }

      // Track already connected wallet
      if (typeof window !== "undefined" && (window as any).gtag) {
        ;(window as any).gtag("event", "phantom", {
          event_category: "Wallet",
          event_label: "Already Connected",
        })
      }
    }

    // Check if already connected to Solflare
    else if (solflareAvailable && solWindow.solflare!.isConnected && solWindow.solflare!.publicKey) {
      setProvider(solWindow.solflare!)
      setConnected(true)
      setPublicKey(solWindow.solflare!.publicKey.toString())
      setActiveWallet("solflare")
      setIsCollapsed(true) // Minimize wallet by default for already connected wallets
      setConnectedWallet(solWindow.solflare!)

      // Switch to dark mode after connection
      // Replace this:
      // setTheme("dark")
      // With this:
      // if (styleMode === "regular") {
      //   toggleStyleMode()
      // }

      // Track already connected wallet
      if (typeof window !== "undefined" && (window as any).gtag) {
        ;(window as any).gtag("event", "solflare", {
          event_category: "Wallet",
          event_label: "Already Connected",
        })
      }
    }

    const checkForWallets = () => {
      const solWindow = window as WindowWithSolana

      // Check for Phantom
      const phantomAvailable = "solana" in window && solWindow.solana?.isPhantom

      // Check for Solflare
      const solflareAvailable = "solflare" in window && solWindow.solflare?.isSolflare

      setWallets((prev) =>
        prev.map((wallet) => {
          if (wallet.type === "phantom") {
            return { ...wallet, available: phantomAvailable }
          } else if (wallet.type === "solflare") {
            return { ...wallet, available: solflareAvailable }
          }
          return wallet
        }),
      )

      // Check if already connected to Phantom
      if (phantomAvailable && solWindow.solana!.isConnected && solWindow.solana!.publicKey) {
        setProvider(solWindow.solana!)
        setConnected(true)
        setPublicKey(solWindow.solana!.publicKey.toString())
        setActiveWallet("phantom")
        setIsCollapsed(true) // Minimize wallet by default for already connected wallets
        setConnectedWallet(solWindow.solana!)

        // Track already connected wallet
        if (typeof window !== "undefined" && (window as any).gtag) {
          ;(window as any).gtag("event", "phantom", {
            event_category: "Wallet",
            event_label: "Already Connected",
          })
        }
      }

      // Check if already connected to Solflare
      else if (solflareAvailable && solWindow.solflare!.isConnected && solWindow.solflare!.publicKey) {
        setProvider(solWindow.solflare!)
        setConnected(true)
        setPublicKey(solWindow.solflare!.publicKey.toString())
        setActiveWallet("solflare")
        setIsCollapsed(true) // Minimize wallet by default for already connected wallets
        setConnectedWallet(solWindow.solflare!)

        // Track already connected wallet
        if (typeof window !== "undefined" && (window as any).gtag) {
          ;(window as any).gtag("event", "solflare", {
            event_category: "Wallet",
            event_label: "Already Connected",
          })
        }
      }
    }
    checkForWallets()
  }, [])

  // Set up wallet event listeners
  useEffect(() => {
    if (provider && !isTestMode) {
      provider.on("connect", () => {
        setConnected(true)
        if (provider.publicKey) {
          setPublicKey(provider.publicKey.toString())
        }
      })

      provider.on("disconnect", () => {
        setConnected(false)
        setPublicKey("")
        setBalance(null)
        setActiveWallet(null)
        setConnectedWallet(null)
      })

      provider.on("accountChanged", () => {
        if (provider.publicKey) {
          setPublicKey(provider.publicKey.toString())
        } else {
          setConnected(false)
          setPublicKey("")
          setBalance(null)
          setActiveWallet(null)
          setConnectedWallet(null)
        }
      })
    }
  }, [provider, isTestMode])

  // Fetch SOL and MUTB balances when connected
  useEffect(() => {
    const getBalances = async () => {
      if (connected && publicKey) {
        if (isTestMode) {
          // Set mock balances for test mode
          setBalance(5.0)
          setMutbBalance(100.0)
          return
        }

        try {
          const publicKeyObj = new PublicKey(publicKey)
          const solBalance = await connection.getBalance(publicKeyObj)
          setBalance(solBalance / 1e9) // Convert lamports to SOL

          // In a real app, you would fetch the MUTB token balance here
          // For now, we'll use a mock value for all wallets
          setMutbBalance(50.0)
        } catch (error) {
          console.error("Error fetching balances:", error)
          setBalance(null)
          setMutbBalance(null)
        }
      }
    }

    getBalances()
  }, [connected, publicKey, isTestMode])

  // Notify parent component when connection state changes
  useEffect(() => {
    if (onConnectionChange) {
      console.log("Notifying parent of connection change:", { connected, publicKey, balance, mutbBalance })
      onConnectionChange(connected, publicKey, balance, provider)
    }
  }, [connected, publicKey, balance, mutbBalance, provider, onConnectionChange])

  // Connect to wallet
  const connectWallet = async (walletType: WalletType) => {
    // Initialize and load audio files on first interaction
    if (isAudioInitialized && !audioManager.isSoundMuted()) {
      await loadAudioFiles()
    }

    // Handle test mode
    if (walletType === "test") {
      const mockProvider = createMockProvider()
      setProvider(mockProvider)
      setPublicKey(mockProvider.publicKey.toString())
      setConnected(true)
      setActiveWallet("test")
      setIsTestMode(true)
      setBalance(5.0) // Set mock balance
      setIsCollapsed(true) // Minimize wallet by default after connection

      // Switch to dark mode after connection
      // Replace this:
      // setTheme("dark")
      // With this:
      // if (styleMode === "regular") {
      //   toggleStyleMode()
      // }

      setConnectedWallet(mockProvider)

      // Play intro sound when wallet is connected (if not muted)
      if (!audioManager.isSoundMuted()) {
        playIntroSound()
      }

      // Track test wallet connection in Google Analytics
      if (typeof window !== "undefined" && (window as any).gtag) {
        ;(window as any).gtag("event", "testwallet", {
          event_category: "Wallet",
          event_label: "Connected",
        })
      }

      return
    }

    const solWindow = window as WindowWithSolana
    let walletProvider: PhantomProvider | SolflareProvider | null = null

    if (walletType === "phantom") {
      if (!solWindow.solana) {
        alert("Phantom wallet not detected. Please ensure you have Phantom wallet extension installed and signed in.")
        return
      }
      walletProvider = solWindow.solana
    } else if (walletType === "solflare") {
      if (!solWindow.solflare) {
        alert("Solflare wallet not detected. Please ensure you have Solflare wallet extension installed and signed in.")
        return
      }
      walletProvider = solWindow.solflare
    }

    if (!walletProvider) return

    try {
      setLoading(true)
      if (!walletProvider.isConnected) {
        const response = await walletProvider.connect()
        setPublicKey(response.publicKey.toString())
        setConnected(true)
        setProvider(walletProvider)
        setActiveWallet(walletType)
        setIsTestMode(false)
        setConnectedWallet(walletProvider)

        // Switch to dark mode after connection
        // Replace this:
        // setTheme("dark")
        // With this:
        // if (styleMode === "regular") {
        //   toggleStyleMode()
        // }

        // Play intro sound when wallet is connected (if not muted)
        if (!audioManager.isSoundMuted()) {
          playIntroSound()
        }
        setIsCollapsed(true) // Minimize wallet by default after connection

        // Track wallet connection in Google Analytics
        if (typeof window !== "undefined" && (window as any).gtag) {
          ;(window as any).gtag("event", walletType, {
            event_category: "Wallet",
            event_label: "Connected",
          })
        }
      } else {
        console.log(`Already connected to ${walletType} Wallet`)
        // Make sure we have the publicKey even if already connected
        if (walletProvider.publicKey) {
          setPublicKey(walletProvider.publicKey.toString())
          setConnected(true)
          setProvider(walletProvider)
          setActiveWallet(walletType)
          setIsTestMode(false)
          setConnectedWallet(walletProvider)

          // Switch to dark mode after connection
          // Replace this:
          // setTheme("dark")
          // With this:
          // if (styleMode === "regular") {
          //   toggleStyleMode()
          // }

          // Play intro sound when wallet is connected (if not muted)
          if (!audioManager.isSoundMuted()) {
            playIntroSound()
          }
          setIsCollapsed(true) // Minimize wallet by default after connection

          // Track wallet connection in Google Analytics
          if (typeof window !== "undefined" && (window as any).gtag) {
            ;(window as any).gtag("event", walletType, {
              event_category: "Wallet",
              event_label: "Already Connected",
            })
          }
        }
      }
    } catch (error) {
      console.error(`${walletType} connection error:`, error)
      if (error instanceof Error) {
        alert(
          `Connection failed: ${error.message}. Please ensure you have ${walletType} wallet extension installed and signed in.`,
        )
      }

      // Track failed wallet connection
      if (typeof window !== "undefined" && (window as any).gtag) {
        ;(window as any).gtag("event", `${walletType}_failed`, {
          event_category: "Wallet",
          event_label: "Connection Failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // Disconnect from wallet
  const disconnectWallet = async () => {
    // Track wallet disconnection
    if (typeof window !== "undefined" && (window as any).gtag && activeWallet) {
      ;(window as any).gtag("event", `${activeWallet}_disconnected`, {
        event_category: "Wallet",
        event_label: "Disconnected",
      })
    }

    if (isTestMode) {
      // Just reset state for test mode
      setConnected(false)
      setPublicKey("")
      setBalance(null)
      setActiveWallet(null)
      setIsTestMode(false)
      setProvider(null)
      setConnectedWallet(null)
      return
    }

    if (provider) {
      try {
        await provider.disconnect()
      } catch (error) {
        console.error("Disconnection error:", error)
      }
    }
  }

  // Copy address to clipboard
  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Shorten address for display
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  // Toggle wallet collapse state
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const getWalletAddress = () => {
    if (isTestMode) {
      return testWalletAddress
    }

    if (connectedWallet) {
      return connectedWallet.publicKey.toString()
    }

    return ""
  }

  // Render the collapsed wallet view when connected
  const renderCollapsedWallet = () => {
    return (
      <div className="flex items-center justify-between bg-[#fbf3de] dark:bg-[#0a0a24] rounded-full px-3 py-1.5 shadow-md border-2 border-black dark:border dark:border-cyan-400/50 ml-auto backdrop-blur-sm w-full sm:w-auto dark:text-white">
        <div className="flex items-center gap-2">
          {isTestMode ? (
            <div className="bg-purple-500/80 p-1 rounded-full">
              <TestTube className="h-4 w-4 text-white" />
            </div>
          ) : (
            <Image
              src={activeWallet === "phantom" ? LOGOS.PHANTOM : LOGOS.SOLFLARE}
              alt={activeWallet === "phantom" ? "Phantom" : "Solflare"}
              width={20}
              height={20}
              className="rounded-full w-4 h-4"
            />
          )}
          <span className="text-xs font-mono font-bold text-black dark:text-cyan-400">
            {shortenAddress(getWalletAddress())}
          </span>
          <div className="flex items-center gap-1">
            <Badge
              variant="outline"
              className="bg-green-50 dark:bg-transparent text-green-700 dark:text-cyan-400 border-green-200 dark:border-cyan-400/50 font-mono"
            >
              <Image
                src={TOKENS.MUTABLE || "/placeholder.svg"}
                alt="MUTB"
                width={12}
                height={12}
                className="rounded-full w-3 h-3"
              />
              {isTestMode ? "100.0 MUTB" : mutbBalance !== null ? `${mutbBalance} MUTB` : "..."}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SoundButton
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-cyan-400/20 rounded-full text-cyan-400"
            onClick={toggleCollapse}
          >
            <ChevronDown className="h-3 w-3 text-black" />
          </SoundButton>
        </div>
      </div>
    )
  }

  // Update the return statement to conditionally render based on compact mode
  return (
    <div className={`${compact && connected ? "flex justify-end w-full" : "w-full space-y-6"} ${className}`}>
      {!connected && !compact && (
        <div className="controller-container mb-2 sm:mb-6 relative mx-auto text-center max-w-[400px]">
          <Image
            src={LOGOS.MUTABLE.TRANSPARENT || "/placeholder.svg"}
            alt="Mutable Logo"
            width={200}
            height={120}
            className="w-auto h-auto max-w-[200px] z-10 mx-auto"
          />
        </div>
      )}

      {connected && isCollapsed && compact ? (
        // Compact collapsed view for header
        <div className="wallet-compact-header wallet-foreground-element w-full sm:w-auto">
          {renderCollapsedWallet()}
        </div>
      ) : (
        // Regular card view
        <Card
          className={`${compact ? "w-full" : "w-full max-w-md mx-auto"} relative overflow-hidden ${
            connected && !isCollapsed
              ? "bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black"
              : "bg-[#fbf3de] dark:bg-gradient-to-r dark:from-[rgba(16,16,48,0.9)] dark:to-[rgba(32,16,64,0.9)] border-2 border-black dark:border dark:border-[#0ff]/30 shadow-[0_0_15px_rgba(0,255,255,0.2)] dark:text-white"
          }`}
        >
          <CardHeader
            className={`flex flex-row items-center justify-between space-y-0 pb-2 ${
              connected && !isCollapsed ? "" : "dark:border-b dark:border-[#0ff]/30 dark:bg-[rgba(16,16,48,0.7)]"
            }`}
          >
            <div className="flex items-center gap-2">
              <Wallet
                className={`h-5 w-5 ${connected && !isCollapsed ? "text-black" : "text-black dark:text-[#0ff]"}`}
              />
              <CardTitle
                className={`font-mono ${
                  connected && !isCollapsed
                    ? "text-black"
                    : "text-black dark:text-[#0ff] dark:text-shadow-[0_0_5px_rgba(0,255,255,0.7)]"
                }`}
              >
                SOLANA WALLET
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {connected && !isCollapsed && (
                <SoundButton
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                  onClick={toggleCollapse}
                >
                  <ChevronUp className="h-4 w-4" />
                </SoundButton>
              )}
            </div>
          </CardHeader>

          {connected && isCollapsed ? (
            <CardContent className="pt-4 dark:bg-[#0a0a24]">{renderCollapsedWallet()}</CardContent>
          ) : (
            <>
              {!connected && (
                <CardDescription className="px-6 text-gray-600 dark:text-cyan-300 mt-2 mb-4">
                  Connect your Solana wallet to use Mutable
                </CardDescription>
              )}
              <CardContent
                className={`space-y-4 px-3 sm:px-6 ${
                  connected && !isCollapsed ? "text-black" : "text-black dark:text-[#0ff]"
                }`}
              >
                {connected ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-800 dark:text-cyan-400">Wallet:</span>
                      <div className="flex items-center gap-2">
                        {isTestMode ? (
                          <>
                            <TestTube className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            <TestModeBadge variant="outline">TEST MODE</TestModeBadge>
                          </>
                        ) : (
                          <>
                            <Image
                              src={activeWallet === "phantom" ? LOGOS.PHANTOM : LOGOS.SOLFLARE}
                              alt={activeWallet === "phantom" ? "Phantom" : "Solflare"}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                            <Badge
                              variant="outline"
                              className="bg-green-50 dark:bg-transparent text-green-700 dark:text-[#0ff] border-green-200 dark:border-[#0ff]/50 font-mono"
                            >
                              {activeWallet?.toUpperCase()}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center flex-wrap">
                      <span className="text-sm font-medium text-gray-800 dark:text-[#0ff]">Address:</span>
                      <div className="flex items-center gap-2 mt-1 sm:mt-0">
                        <span className="text-sm font-mono text-gray-800 dark:text-[#0ff]">
                          {shortenAddress(getWalletAddress())}
                        </span>
                        <SoundButton
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                          onClick={copyAddress}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </SoundButton>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-800 dark:text-[#0ff]">Balances:</span>
                      <div className="flex flex-col gap-1 items-end">
                        <div className="flex items-center gap-2">
                          <Image
                            src={TOKENS.SOL || "/placeholder.svg"}
                            alt="SOL"
                            width={16}
                            height={16}
                            className="rounded-full"
                          />
                          {balance !== null ? (
                            <span className="font-mono text-gray-800 dark:text-[#0ff]">{balance} SOL</span>
                          ) : (
                            <Skeleton className="h-4 w-20 bg-cyan-400/10" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Image
                            src={TOKENS.MUTABLE || "/placeholder.svg"}
                            alt="MUTB"
                            width={16}
                            height={16}
                            className="rounded-full"
                          />
                          {mutbBalance !== null ? (
                            <span className="font-mono text-gray-800 dark:text-[#0ff]">{mutbBalance} MUTB</span>
                          ) : (
                            <Skeleton className="h-4 w-20 bg-cyan-400/10" />
                          )}
                        </div>
                      </div>
                    </div>
                    {isTestMode && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md border border-purple-200 dark:border-purple-400/30 text-sm">
                        <p className="font-medium mb-1 text-purple-800 dark:text-purple-300">Test Mode Active</p>
                        <p className="text-purple-700 dark:text-purple-200">
                          You're using a simulated wallet for testing. No real transactions will be made.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-2">
                    <div className="grid grid-cols-1 gap-3">
                      {wallets.map((wallet) =>
                        wallet.type === "test" ? (
                          <SoundButton
                            key={wallet.type}
                            onClick={() => connectWallet(wallet.type)}
                            disabled={loading}
                            className="w-full justify-start h-12 font-bold text-sm sm:text-base px-3 sm:px-4 bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
                          >
                            <div className="flex items-center gap-2 z-10 relative">
                              <TestTube className="h-5 w-5" />
                              <span>{wallet.name}</span>
                            </div>
                          </SoundButton>
                        ) : (
                          <SoundButton
                            key={wallet.type}
                            onClick={() => connectWallet(wallet.type)}
                            disabled={loading || !wallet.available}
                            className="w-full justify-start h-12 font-bold text-sm sm:text-base px-3 sm:px-4 bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
                          >
                            <div className="flex items-center gap-2 z-10 relative">
                              <Image
                                src={wallet.icon || "/placeholder.svg"}
                                alt={wallet.name}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                              <span>{wallet.name}</span>
                              {!wallet.available && (
                                <span className="text-xs ml-auto font-bold opacity-70">(Not Detected)</span>
                              )}
                            </div>
                          </SoundButton>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter
                className={`${
                  connected && !isCollapsed ? "" : "dark:border-t dark:border-cyan-400/30 dark:bg-[rgba(16,16,48,0.7)]"
                }`}
              >
                {!connected ? (
                  <div className="text-center w-full text-sm">
                    <p
                      className={`mb-2 ${
                        connected && !isCollapsed ? "text-gray-700" : "text-gray-700 dark:text-cyan-300"
                      }`}
                    >
                      Don't have a Solana wallet?
                    </p>
                    <div className="flex justify-center gap-4">
                      <a
                        href="https://phantom.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:underline font-medium ${
                          connected && !isCollapsed
                            ? "text-blue-600 hover:text-blue-800"
                            : "text-blue-600 dark:text-cyan-400 hover:text-blue-800 dark:hover:text-cyan-300"
                        }`}
                      >
                        Get Phantom
                      </a>
                      <a
                        href="https://solflare.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:underline font-medium ${
                          connected && !isCollapsed
                            ? "text-blue-600 hover:text-blue-800"
                            : "text-blue-600 dark:text-cyan-400 hover:text-blue-800 dark:hover:text-cyan-300"
                        }`}
                      >
                        Get Solflare
                      </a>
                    </div>
                  </div>
                ) : isTestMode ? (
                  <SoundButton
                    variant="outline"
                    className="w-full bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-400/30 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                    onClick={disconnectWallet}
                  >
                    <span className="relative z-10">DISCONNECT</span>
                  </SoundButton>
                ) : (
                  <SoundButton
                    variant="outline"
                    className="w-full bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-400/30 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300"
                    onClick={disconnectWallet}
                  >
                    <span className="relative z-10">DISCONNECT</span>
                  </SoundButton>
                )}
              </CardFooter>
            </>
          )}
        </Card>
      )}
    </div>
  )
}

// Add a named export at the end
