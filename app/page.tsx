"use client"

import { useState } from "react"
import MutablePlatform from "@/components/mutable-platform"
import MultiWalletConnector from "@/components/multi-wallet-connector"
import { DemoWatermark } from "@/components/demo-watermark"
import { GlobalAudioControls } from "@/components/global-audio-controls"
import { SignUpBanner } from "@/components/signup-banner" // Corrected import

export default function HomePage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [publicKey, setPublicKey] = useState("")
  const [balance, setBalance] = useState<number | null>(null)
  const [provider, setProvider] = useState<any>(null)

  const handleWalletConnection = (connected: boolean, address: string, bal: number | null, prov: any) => {
    setIsWalletConnected(connected)
    setPublicKey(address)
    setBalance(bal)
    setProvider(prov)
  }

  if (!isWalletConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center space-y-8 max-w-md mx-auto px-4">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">Welcome to Mutable</h1>
            <p className="text-xl text-gray-600">Connect your wallet to access the gaming platform</p>
          </div>
          <MultiWalletConnector onConnectionChange={handleWalletConnection} />
        </div>
        <DemoWatermark />
        <GlobalAudioControls />
      </div>
    )
  }

  return (
    <>
      <MutablePlatform publicKey={publicKey} balance={balance} provider={provider} connection={null} />
      <DemoWatermark />
      <GlobalAudioControls />
      <SignUpBanner walletConnected={isWalletConnected} /> {/* Added SignUpBanner */}
    </>
  )
}
