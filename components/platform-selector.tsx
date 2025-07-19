"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Monitor, Smartphone } from "lucide-react"
import { usePlatform, type PlatformType } from "@/contexts/platform-context"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { LOGOS } from "@/utils/image-paths"
import InlineWalletConnector from "./inline-wallet-connector"
import { AnimatePresence, motion } from "framer-motion"

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
  const { setPlatform } = usePlatform()
  const { styleMode } = useCyberpunkTheme()

  const isCyberpunk = styleMode === "cyberpunk"

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

  const handleWalletConnect = (walletData: {
    publicKey: string
    provider?: any
    isTestMode?: boolean
  }) => {
    console.log(`Wallet connected with data:`, walletData)
    setIsConnecting(true)

    if (selectedPlatform) {
      // Determine balance based on wallet type
      const balance = walletData.isTestMode ? 5.0 : null

      // Create the wallet connection data
      const connectionData: WalletConnectionData = {
        connected: true,
        publicKey: walletData.publicKey,
        balance: balance,
        provider: walletData.provider || {
          publicKey: { toString: () => walletData.publicKey },
          isConnected: true,
          isTestMode: walletData.isTestMode || false,
        },
        isTestMode: walletData.isTestMode,
      }

      console.log("Sending wallet connection data to parent:", connectionData)

      // Small delay to show connection feedback
      setTimeout(() => {
        onWalletConnect(connectionData)
      }, 500)
    }
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {platforms.map((platform) => {
          const isSelected = selectedPlatform === platform.type
          const IconComponent = platform.icon

          return (
            <div key={platform.type} className="flex flex-col gap-4">
              <Card
                onClick={() => handlePlatformSelect(platform.type)}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 cursor-pointer group",
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
              >
                {/* Background Image & Overlay */}
                <Image
                  src={platform.image || "/placeholder.svg"}
                  alt={`${platform.title} Gaming`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center p-8 text-white text-shadow-lg">
                  <IconComponent className="h-16 w-16 mb-4 text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.7)] transition-transform duration-300 group-hover:scale-110" />
                  <h3 className="text-4xl font-bold font-mono tracking-wider text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.7)]">
                    {platform.title}
                  </h3>
                </div>
              </Card>

              {/* Wallet Connector Pop-out */}
              <AnimatePresence>
                {isSelected && !isConnecting && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <InlineWalletConnector onConnect={handleWalletConnect} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
