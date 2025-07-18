"use client"

import { CardFooter } from "@/components/ui/card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Wallet, TestTube, ChevronUp, ChevronDown } from "lucide-react"
import { Connection, clusterApiUrl } from "@solana/web3.js"
import Image from "next/image"
import SoundButton from "./sound-button"
import { LOGOS } from "@/utils/image-paths"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
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
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { keyframes } from "@emotion/react"
import styled from "@emotion/styled"
import { toast } from "react-toastify"

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

interface WalletInfo {
  name: string
  icon: string
  installed: boolean
  connecting?: boolean
}

interface MultiWalletConnectorProps {
  onConnect?: () => void
  onDisconnect?: () => void
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

const connection = new Connection(clusterApiUrl("devnet"), "confirmed")

export function MultiWalletConnector({ onConnect, onDisconnect, className }: MultiWalletConnectorProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [connectedWallet, setConnectedWallet] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [balance, setBalance] = useState<number>(0)
  const { styleMode, toggleStyleMode } = useCyberpunkTheme()

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
          onConnect?.()
          setBalance(Math.random() * 10)
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
        onConnect?.()
        setBalance(Math.random() * 10)
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
      onDisconnect?.()
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

  if (isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={SUPPORTED_WALLETS.find((w) => w.name === connectedWallet)?.icon || "/placeholder.svg"}
                alt={connectedWallet}
              />
              <AvatarFallback>
                <Wallet className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline">{formatAddress(walletAddress)}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
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
                <p className="font-medium">{connectedWallet}</p>
                <p className="text-sm text-muted-foreground">{formatAddress(walletAddress)}</p>
              </div>
            </div>
            <div className="bg-muted rounded p-2 mb-2">
              <p className="text-sm font-medium">Balance</p>
              <p className="text-lg font-bold">{balance.toFixed(4)} SOL</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyAddress}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem>
            <TestTube className="mr-2 h-4 w-4" />
            View on Explorer
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnectWallet} className="text-destructive">
            <ChevronUp className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>Choose a wallet to connect to the Mutable platform</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {SUPPORTED_WALLETS.map((wallet) => (
            <Card
              key={wallet.name}
              className={`cursor-pointer transition-colors hover:bg-accent ${!wallet.installed ? "opacity-50" : ""}`}
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
                  <h3 className="font-medium">{wallet.name}</h3>
                  <p className="text-sm text-muted-foreground">{wallet.installed ? "Detected" : "Not installed"}</p>
                </div>
                {!wallet.installed && <Badge variant="secondary">Install</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have a wallet?{" "}
            <a
              href="https://phantom.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Get Phantom
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { MultiWalletConnector as default }

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
