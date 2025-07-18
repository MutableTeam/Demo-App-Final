"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Copy, Check, Wallet, TestTube, ChevronUp, ChevronDown } from "lucide-react"
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { audioManager, playIntroSound, initializeAudio, loadAudioFiles } from "@/utils/audio-manager"
import { LOGOS, TOKENS } from "@/utils/image-paths"

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

interface MultiWalletConnectorProps {
  onConnectionChange?: (connected: boolean, publicKey: string, balance: number | null, provider: any) => void
  compact?: boolean
  className?: string
}

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
      setIsCollapsed(true)
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
      setIsCollapsed(true)
      setConnectedWallet(solWindow.solflare!)

      // Track already connected wallet
      if (typeof window !== "undefined" && (window as any).gtag) {
        ;(window as any).gtag("event", "solflare", {
          event_category: "Wallet",
          event_label: "Already Connected",
        })
      }
    }
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
      setIsCollapsed(true)

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

        // Play intro sound when wallet is connected (if not muted)
        if (!audioManager.isSoundMuted()) {
          playIntroSound()
        }
        setIsCollapsed(true)

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

          // Play intro sound when wallet is connected (if not muted)
          if (!audioManager.isSoundMuted()) {
            playIntroSound()
          }
          setIsCollapsed(true)

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
      <div className="flex items-center justify-between bg-white rounded-full px-3 py-1.5 shadow-md border-2 border-black ml-auto backdrop-blur-sm w-full sm:w-auto">
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
          <span className="text-xs font-mono font-bold text-black">{shortenAddress(getWalletAddress())}</span>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-mono">
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
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-gray-100 rounded-full"
            onClick={toggleCollapse}
          >
            <ChevronDown className="h-3 w-3 text-black" />
          </Button>
        </div>
      </div>
    )
  }

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
              ? "bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black"
              : "bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black"
          }`}
        >
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2`}>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-black" />
              <CardTitle className="font-mono text-black">SOLANA WALLET</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {connected && !isCollapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-black hover:text-gray-700 hover:bg-gray-100"
                  onClick={toggleCollapse}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>

          {connected && isCollapsed ? (
            <CardContent className="pt-4">{renderCollapsedWallet()}</CardContent>
          ) : (
            <>
              {!connected && (
                <CardDescription className="px-6 text-gray-600 mt-2 mb-4">
                  Connect your Solana wallet to use Mutable
                </CardDescription>
              )}
              <CardContent className={`space-y-4 px-3 sm:px-6 text-black`}>
                {connected ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-800">Wallet:</span>
                      <div className="flex items-center gap-2">
                        {isTestMode ? (
                          <>
                            <TestTube className="h-5 w-5 text-purple-600" />
                            <Badge
                              variant="outline"
                              className="bg-purple-50 text-purple-700 border-purple-200 font-mono"
                            >
                              TEST MODE
                            </Badge>
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
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-mono">
                              {activeWallet?.toUpperCase()}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center flex-wrap">
                      <span className="text-sm font-medium text-gray-800">Address:</span>
                      <div className="flex items-center gap-2 mt-1 sm:mt-0">
                        <span className="text-sm font-mono text-gray-800">{shortenAddress(getWalletAddress())}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-black hover:text-gray-700 hover:bg-gray-100"
                          onClick={copyAddress}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-800">Balances:</span>
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
                            <span className="font-mono text-gray-800">{balance} SOL</span>
                          ) : (
                            <Skeleton className="h-4 w-20 bg-gray-200" />
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
                            <span className="font-mono text-gray-800">{mutbBalance} MUTB</span>
                          ) : (
                            <Skeleton className="h-4 w-20 bg-gray-200" />
                          )}
                        </div>
                      </div>
                    </div>
                    {isTestMode && (
                      <div className="bg-purple-50 p-3 rounded-md border border-purple-200 text-sm">
                        <p className="font-medium mb-1 text-purple-800">Test Mode Active</p>
                        <p className="text-purple-700">
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
                          <Button
                            key={wallet.type}
                            onClick={() => connectWallet(wallet.type)}
                            disabled={loading}
                            className="w-full justify-start h-12 font-bold text-sm sm:text-base px-3 sm:px-4 bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
                          >
                            <div className="flex items-center gap-2 z-10 relative">
                              <TestTube className="h-5 w-5" />
                              <span>{wallet.name}</span>
                            </div>
                          </Button>
                        ) : (
                          <Button
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
                          </Button>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {!connected ? (
                  <div className="text-center w-full text-sm">
                    <p className="mb-2 text-gray-700">Don't have a Solana wallet?</p>
                    <div className="flex justify-center gap-4">
                      <a
                        href="https://phantom.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        Get Phantom
                      </a>
                      <a
                        href="https://solflare.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        Get Solflare
                      </a>
                    </div>
                  </div>
                ) : isTestMode ? (
                  <Button
                    variant="outline"
                    className="w-full bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700"
                    onClick={disconnectWallet}
                  >
                    <span className="relative z-10">DISCONNECT</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700"
                    onClick={disconnectWallet}
                  >
                    <span className="relative z-10">DISCONNECT</span>
                  </Button>
                )}
              </CardFooter>
            </>
          )}
        </Card>
      )}
    </div>
  )
}
