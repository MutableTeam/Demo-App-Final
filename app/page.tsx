"use client"

import { useState, useEffect } from "react"
import { type Connection, PublicKey } from "@solana/web3.js"
import { Program, AnchorProvider } from "@coral-xyz/anchor"
import { MultiWalletConnector } from "@/components/multi-wallet-connector"
import { IDL } from "../../../target/types/mutable_platform"
import { Button } from "@/components/ui/button"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import ModeSelection from "@/components/mode-selection"
import MobileGameView from "@/components/mobile-game-view"

const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!)

export default function Home() {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [provider, setProvider] = useState<AnchorProvider | null>(null)
  const [connection, setConnection] = useState<Connection | null>(null)
  const [selectedMode, setSelectedMode] = useState<"mobile" | "desktop" | null>(null)

  const wallet = useWallet()
  const { connection: walletConnection } = useConnection()

  useEffect(() => {
    if (wallet.publicKey) {
      setPublicKey(wallet.publicKey.toBase58())
    } else {
      setPublicKey(null)
    }
  }, [wallet.publicKey])

  const handleModeSelect = (mode: "mobile" | "desktop") => {
    setSelectedMode(mode)
  }

  const handleBackToModeSelection = () => {
    setSelectedMode(null)
    setPublicKey("")
    setBalance(null)
    setProvider(null)
  }

  const handleWalletConnect = async () => {
    if (!wallet.publicKey) {
      console.error("Wallet not connected")
      return
    }

    try {
      const anchorProvider = new AnchorProvider(walletConnection, wallet, AnchorProvider.defaultOptions())

      setProvider(anchorProvider)
      setConnection(walletConnection)

      const program = new Program(IDL, programId, anchorProvider)

      const balance = await walletConnection.getBalance(wallet.publicKey)
      setBalance(balance)
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }

  const handleWalletDisconnect = () => {
    setPublicKey(null)
    setBalance(null)
    setProvider(null)
    setConnection(null)
  }

  return (
    <>
      {!selectedMode ? (
        <ModeSelection onModeSelect={handleModeSelect} />
      ) : !publicKey ? (
        // Show wallet connection for selected mode
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4 font-mono">
                {selectedMode === "mobile" ? "Mobile Gaming" : "Desktop Gaming"}
              </h1>
              <Button variant="outline" onClick={handleBackToModeSelection} className="mb-6 bg-transparent">
                ← Back to Mode Selection
              </Button>
            </div>
            <MultiWalletConnector onConnect={handleWalletConnect} onDisconnect={handleWalletDisconnect} />
          </div>
        </div>
      ) : selectedMode === "mobile" ? (
        <MobileGameView
          publicKey={publicKey}
          balance={balance}
          provider={provider}
          connection={connection}
          onBackToModeSelection={handleBackToModeSelection}
        />
      ) : (
        // Desktop view (existing MutablePlatform component)
        <div className="min-h-screen">{/* Existing desktop layout */}</div>
      )}
    </>
  )
}
