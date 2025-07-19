"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface TokenSwapInterfaceProps {
  balance: number | null | undefined
  publicKey: string | null | undefined
  exchangeRate: number | null | undefined
  onSwap: (amount: number) => void
}

const TokenSwapInterface: React.FC<TokenSwapInterfaceProps> = ({ balance, publicKey, exchangeRate, onSwap }) => {
  const [swapAmount, setSwapAmount] = useState("")
  const [calculatedOutput, setCalculatedOutput] = useState(0)

  // Add safe defaults to prevent undefined errors
  const safeBalance = balance ?? 0
  const safePublicKey = publicKey ?? ""

  useEffect(() => {
    // Safe numeric operations
    const amount = Number.parseFloat(swapAmount) || 0
    const calculatedOutputValue = amount * (exchangeRate ?? 0) || 0
    setCalculatedOutput(calculatedOutputValue)
  }, [swapAmount, exchangeRate])

  const handleSwap = () => {
    const amount = Number.parseFloat(swapAmount)
    if (!isNaN(amount) && amount > 0) {
      onSwap(amount)
      setSwapAmount("") // Clear the input after a successful swap
    } else {
      alert("Please enter a valid amount to swap.")
    }
  }

  return (
    <div>
      <h2>Token Swap</h2>
      <p>Balance: {safeBalance > 0 ? `${safeBalance.toFixed(4)} SOL` : "0.0000 SOL"}</p>
      <p>Public Key: {safePublicKey || "Not Connected"}</p>
      <p>Exchange Rate: {exchangeRate ? exchangeRate.toFixed(4) : "Loading..."}</p>

      <input
        type="number"
        placeholder="Enter amount to swap"
        value={swapAmount}
        onChange={(e) => setSwapAmount(e.target.value)}
      />
      <p>You will receive: {calculatedOutput.toFixed(4)} TOK</p>
      <button onClick={handleSwap}>Swap</button>
    </div>
  )
}

export default TokenSwapInterface
