"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, ExternalLink, Copy, Check } from "lucide-react"
import Image from "next/image"

interface WalletOption {
  name: string
  icon: string
  description: string
  installed?: boolean
  downloadUrl?: string
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    name: "Phantom",
    icon: "/images/phantom-wallet.png",
    description: "Popular Solana wallet with great mobile support",
    downloadUrl: "https://phantom.app/",
  },
  {
    name: "Solflare",
    icon: "/images/solflare-icon.png",
    description: "Feature-rich wallet for Solana ecosystem",
    downloadUrl: "https://solflare.com/",
  },
]

export default function MultiWalletConnector() {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [installedWallets, setInstalledWallets] = useState<string[]>([])

  useEffect(() => {
    // Check for installed wallets
    const checkWallets = () => {
      const installed: string[] = []

      if (typeof window !== "undefined") {
        // Check for Phantom
        if (window.phantom?.solana?.isPhantom) {
          installed.push("Phantom")
        }

        // Check for Solflare
        if (window.solflare?.isSolflare) {
          installed.push("Solflare")
        }
      }

      setInstalledWallets(installed)
    }

    checkWallets()

    // Check periodically for newly installed wallets
    const interval = setInterval(checkWallets, 1000)
    return () => clearInterval(interval)
  }, [])

  const connectWallet = async (walletName: string) => {
    setSelectedWallet(walletName)
    setIsConnecting(true)

    try {
      let provider: any = null

      if (walletName === "Phantom" && window.phantom?.solana) {
        provider = window.phantom.solana
      } else if (walletName === "Solflare" && window.solflare) {
        provider = window.solflare
      }

      if (provider) {
        const response = await provider.connect()
        setConnectedWallet(walletName)
        setWalletAddress(response.publicKey.toString())
      } else {
        throw new Error(`${walletName} wallet not found`)
      }
    } catch (error) {
      console.error("Wallet connection failed:", error)
    } finally {
      setIsConnecting(false)
      setSelectedWallet(null)
    }
  }

  const disconnectWallet = async () => {
    try {
      if (connectedWallet === "Phantom" && window.phantom?.solana) {
        await window.phantom.solana.disconnect()
      } else if (connectedWallet === "Solflare" && window.solflare) {
        await window.solflare.disconnect()
      }
    } catch (error) {
      console.error("Disconnect failed:", error)
    } finally {
      setConnectedWallet(null)
      setWalletAddress(null)
    }
  }

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (connectedWallet && walletAddress) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white border-gray-200">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wallet className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg text-gray-900">Wallet Connected</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            {connectedWallet}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <span className="text-sm font-mono text-gray-700">{formatAddress(walletAddress)}</span>
            <Button variant="ghost" size="sm" onClick={copyAddress} className="h-8 w-8 p-0 hover:bg-gray-200">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
            </Button>
          </div>
          <Button
            onClick={disconnectWallet}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
          >
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white border-gray-200">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Wallet className="h-6 w-6 text-orange-600" />
          <CardTitle className="text-xl text-gray-900">Connect Wallet</CardTitle>
        </div>
        <CardDescription className="text-gray-600">Choose your preferred Solana wallet to get started</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {WALLET_OPTIONS.map((wallet) => {
          const isInstalled = installedWallets.includes(wallet.name)
          const isConnected = selectedWallet === wallet.name && isConnecting

          return (
            <div key={wallet.name} className="space-y-2">
              <Button
                onClick={() => (isInstalled ? connectWallet(wallet.name) : window.open(wallet.downloadUrl, "_blank"))}
                disabled={isConnected}
                className="w-full h-auto p-4 justify-start bg-white border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-900"
                variant="outline"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <Image
                      src={wallet.icon || "/placeholder.svg"}
                      alt={`${wallet.name} icon`}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{wallet.name}</span>
                      {isInstalled ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">
                          Installed
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
                          Install
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{wallet.description}</p>
                  </div>
                  {!isInstalled && <ExternalLink className="h-4 w-4 text-gray-400" />}
                </div>
              </Button>

              {isConnected && (
                <div className="flex items-center justify-center gap-2 text-sm text-orange-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-600 border-t-transparent"></div>
                  Connecting to {wallet.name}...
                </div>
              )}
            </div>
          )
        })}

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            New to Solana wallets?{" "}
            <a
              href="https://docs.solana.com/wallet-guide"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:text-orange-700 underline"
            >
              Learn more
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Extend Window interface for wallet detection
declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom: boolean
        connect: () => Promise<{ publicKey: { toString: () => string } }>
        disconnect: () => Promise<void>
      }
    }
    solflare?: {
      isSolflare: boolean
      connect: () => Promise<{ publicKey: { toString: () => string } }>
      disconnect: () => Promise<void>
    }
  }
}
