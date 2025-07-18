"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, Copy, ExternalLink, LogOut, ChevronDown } from "lucide-react"
import { toast } from "sonner"

interface WalletInfo {
  name: string
  icon: string
  installed: boolean
  connecting?: boolean
}

interface MultiWalletConnectorProps {
  onConnectionChange?: (connected: boolean, publicKey: string, balance: number | null, provider: any) => void
  compact?: boolean
  className?: string
}

const SUPPORTED_WALLETS: WalletInfo[] = [
  {
    name: "Phantom",
    icon: "/images/phantom-wallet.png",
    installed: typeof window !== "undefined" && "solana" in window,
  },
  {
    name: "Solflare",
    icon: "/images/solflare-icon.png",
    installed: typeof window !== "undefined" && "solflare" in window,
  },
]

export default function MultiWalletConnector({
  onConnectionChange,
  compact = false,
  className = "",
}: MultiWalletConnectorProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [connectedWallet, setConnectedWallet] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [balance, setBalance] = useState<number>(0)

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    try {
      if (typeof window !== "undefined" && window.solana?.isPhantom) {
        const response = await window.solana.connect({ onlyIfTrusted: true })
        if (response.publicKey) {
          setIsConnected(true)
          setWalletAddress(response.publicKey.toString())
          setConnectedWallet("Phantom")
          setBalance(Math.random() * 10)
          onConnectionChange?.(true, response.publicKey.toString(), Math.random() * 10, window.solana)
        }
      }
    } catch (error) {
      console.log("Wallet not connected")
    }
  }

  const connectWallet = async (walletName: string) => {
    try {
      let wallet: any = null

      if (walletName === "Phantom" && window.solana?.isPhantom) {
        wallet = window.solana
      } else if (walletName === "Solflare" && window.solflare) {
        wallet = window.solflare
      }

      if (!wallet) {
        toast.error(`${walletName} wallet not found. Please install it first.`)
        return
      }

      const response = await wallet.connect()

      if (response.publicKey) {
        setIsConnected(true)
        setWalletAddress(response.publicKey.toString())
        setConnectedWallet(walletName)
        setIsDialogOpen(false)
        const mockBalance = Math.random() * 10
        setBalance(mockBalance)
        onConnectionChange?.(true, response.publicKey.toString(), mockBalance, wallet)
        toast.success(`Connected to ${walletName}`)
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      toast.error("Failed to connect wallet")
    }
  }

  const disconnectWallet = async () => {
    try {
      if (connectedWallet === "Phantom" && window.solana?.isPhantom) {
        await window.solana.disconnect()
      } else if (connectedWallet === "Solflare" && window.solflare) {
        await window.solflare.disconnect()
      }

      setIsConnected(false)
      setWalletAddress("")
      setConnectedWallet("")
      setBalance(0)
      onConnectionChange?.(false, "", null, null)
      toast.success("Wallet disconnected")
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
      toast.error("Failed to disconnect wallet")
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    toast.success("Address copied to clipboard")
  }

  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (isConnected && compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-300 hover:bg-gray-50">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={SUPPORTED_WALLETS.find((w) => w.name === connectedWallet)?.icon || "/placeholder.svg"}
                alt={connectedWallet}
              />
              <AvatarFallback>
                <Wallet className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-gray-900">{formatAddress(walletAddress)}</span>
            <ChevronDown className="h-4 w-4 text-gray-600" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-white border-gray-200">
          <div className="p-2">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={SUPPORTED_WALLETS.find((w) => w.name === connectedWallet)?.icon || "/placeholder.svg"}
                  alt={connectedWallet}
                />
                <AvatarFallback>
                  <Wallet className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">{connectedWallet}</p>
                <p className="text-sm text-gray-600">{formatAddress(walletAddress)}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded p-2 mb-2">
              <p className="text-sm font-medium text-gray-700">Balance</p>
              <p className="text-lg font-bold text-gray-900">{balance.toFixed(4)} SOL</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyAddress} className="text-gray-700 hover:bg-gray-50">
            <Copy className="mr-2 h-4 w-4" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem className="text-gray-700 hover:bg-gray-50">
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Explorer
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnectWallet} className="text-red-600 hover:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg text-gray-900">Wallet Connected</CardTitle>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">{connectedWallet}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-sm font-mono text-gray-700">{formatAddress(walletAddress)}</span>
            <Button variant="ghost" size="sm" onClick={copyAddress} className="h-8 w-8 p-0 hover:bg-gray-200">
              <Copy className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700">Balance</p>
            <p className="text-xl font-bold text-gray-900">{balance.toFixed(4)} SOL</p>
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
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Connect Wallet</DialogTitle>
          <DialogDescription className="text-gray-600">
            Choose a wallet to connect to the Mutable platform
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {SUPPORTED_WALLETS.map((wallet) => (
            <Card
              key={wallet.name}
              className={`cursor-pointer transition-colors hover:bg-gray-50 border-gray-200 ${
                !wallet.installed ? "opacity-50" : ""
              }`}
              onClick={() => wallet.installed && connectWallet(wallet.name)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={wallet.icon || "/placeholder.svg"} alt={wallet.name} />
                  <AvatarFallback>
                    <Wallet className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{wallet.name}</h3>
                  <p className="text-sm text-gray-600">{wallet.installed ? "Detected" : "Not installed"}</p>
                </div>
                {!wallet.installed && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">
                    Install
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have a wallet?{" "}
            <a
              href="https://phantom.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:text-orange-700 underline"
            >
              Get Phantom
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean
      connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>
      disconnect: () => Promise<void>
    }
    solflare?: {
      connect: () => Promise<{ publicKey: { toString: () => string } }>
      disconnect: () => Promise<void>
    }
  }
}
