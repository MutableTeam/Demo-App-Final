"use client"

import { useState, useEffect } from "react"

export const useWalletConnection = () => {
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [isTestMode, setIsTestMode] = useState(false)

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window !== "undefined") {
      // Check for Phantom wallet
      const solWindow = window as any
      if (solWindow.solana?.isPhantom && solWindow.solana.isConnected && solWindow.solana.publicKey) {
        setWalletAddress(solWindow.solana.publicKey.toString())
        setIsTestMode(false)
        return
      }

      // Check for Solflare wallet
      if (solWindow.solflare?.isSolflare && solWindow.solflare.isConnected && solWindow.solflare.publicKey) {
        setWalletAddress(solWindow.solflare.publicKey.toString())
        setIsTestMode(false)
        return
      }

      // Check if we're in test mode
      if (solWindow.testWalletActive) {
        setWalletAddress("TestModeWallet1111111111111111111111111")
        setIsTestMode(true)
        return
      }
    }
  }, [])

  return { walletAddress, isTestMode }
}
