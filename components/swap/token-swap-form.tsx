"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, Loader2, ArrowDownUp } from "lucide-react"
import { TokenSelector } from "./token-selector"
import { SwapSettings } from "./swap-settings"
import SoundButton from "@/components/sound-button"
import type { TokenConfig, SwapPair } from "@/types/token-types"
import { formatTokenAmount, getTokenPrice } from "@/utils/token-utils"
import { createJupiterApiClient, type JupiterQuoteResponse } from "@/utils/jupiter-sdk"
import { type Connection, PublicKey } from "@solana/web3.js"

interface TokenSwapFormProps {
  connection: Connection
  publicKey: string | null
  provider: any
  swapPair: SwapPair
  inputBalance: number | null
  outputBalance: number | null
  isTokenTradable: boolean
  onSwap: (
    inputToken: TokenConfig,
    outputToken: TokenConfig,
    inputAmount: number,
    outputAmount: number,
    txId: string,
  ) => void
  checkingTradability?: boolean
  connectedWallet?: any
  isTestMode?: boolean
  setWalletAddress?: (address: string) => void
}

export function TokenSwapForm({
  connection,
  publicKey,
  provider,
  swapPair,
  inputBalance,
  outputBalance,
  isTokenTradable,
  onSwap,
  checkingTradability = false,
  connectedWallet,
  isTestMode,
  setWalletAddress,
}: TokenSwapFormProps) {
  // State for the swap form
  const [inputToken, setInputToken] = useState<TokenConfig>(swapPair.inputToken)
  const [outputToken, setOutputToken] = useState<TokenConfig>(swapPair.outputToken)
  const [swapAmount, setSwapAmount] = useState<string>("1")
  const [slippageBps, setSlippageBps] = useState<number>(50) // 0.5% default slippage
  const [isSwapping, setIsSwapping] = useState<boolean>(false)
  const [swapError, setSwapError] = useState<string | null>(null)
  const [jupiterClient, setJupiterClient] = useState<any>(null)
  const [jupiterQuote, setJupiterQuote] = useState<JupiterQuoteResponse | null>(null)
  const [isLoadingQuote, setIsLoadingQuote] = useState<boolean>(false)
  const [exchangeRate, setExchangeRate] = useState<number>(0)
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(false)
  const [inputTokenPrice, setInputTokenPrice] = useState<number | null>(null)
  const [outputTokenPrice, setOutputTokenPrice] = useState<number | null>(null)

  // Initialize Jupiter client
  useEffect(() => {
    if (connection) {
      const client = createJupiterApiClient(connection)
      setJupiterClient(client)
    }
  }, [connection])

  // Fetch token prices
  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoadingPrice(true)
      try {
        const [inPrice, outPrice] = await Promise.all([getTokenPrice(inputToken), getTokenPrice(outputToken)])

        setInputTokenPrice(inPrice.usdPrice)
        setOutputTokenPrice(outPrice.usdPrice)

        // Calculate exchange rate based on prices
        if (inPrice.usdPrice && outPrice.usdPrice) {
          setExchangeRate(inPrice.usdPrice / outPrice.usdPrice)
        }
      } catch (error) {
        console.error("Failed to fetch token prices:", error)
      } finally {
        setIsLoadingPrice(false)
      }
    }

    fetchPrices()
    // Refresh prices every 60 seconds
    const intervalId = setInterval(fetchPrices, 60000)

    return () => clearInterval(intervalId)
  }, [inputToken, outputToken])

  // Get Jupiter quote when amount or tokens change
  useEffect(() => {
    if (jupiterClient && publicKey && isTokenTradable) {
      const getQuote = async () => {
        setIsLoadingQuote(true)
        setSwapError(null)

        try {
          const amount = Number.parseFloat(swapAmount)
          if (isNaN(amount) || amount <= 0) {
            setIsLoadingQuote(false)
            return
          }

          // Convert to the smallest unit based on decimals
          const inputDecimals = inputToken.decimals
          const amountInSmallestUnit = Math.floor(amount * Math.pow(10, inputDecimals))

          console.log(`Getting Jupiter quote for ${amount} ${inputToken.symbol}`)
          const quote = await jupiterClient.getQuote(
            inputToken.mintAddress,
            outputToken.mintAddress,
            amountInSmallestUnit,
            slippageBps,
            false, // Allow indirect routes
          )

          setJupiterQuote(quote)

          // Update the exchange rate based on the quote
          if (quote) {
            const inAmount = Number.parseFloat(quote.inAmount) / Math.pow(10, inputToken.decimals)
            const outAmount = Number.parseFloat(quote.outAmount) / Math.pow(10, outputToken.decimals)
            const quoteRate = inAmount / outAmount
            setExchangeRate(quoteRate)
          }
        } catch (error) {
          console.error("Error getting Jupiter quote:", error)
          setSwapError("Failed to get quote. Please try again.")
        } finally {
          setIsLoadingQuote(false)
        }
      }

      const timer = setTimeout(() => {
        getQuote()
      }, 500) // Debounce

      return () => clearTimeout(timer)
    }
  }, [swapAmount, inputToken, outputToken, jupiterClient, publicKey, slippageBps, isTokenTradable])

  // Auto-populate wallet address when not in test mode
  useEffect(() => {
    if (!isTestMode && connectedWallet && connectedWallet.publicKey && setWalletAddress) {
      setWalletAddress(connectedWallet.publicKey.toString())
    }
  }, [connectedWallet, isTestMode, setWalletAddress])

  // Function to swap tokens
  const handleSwap = async () => {
    if (!publicKey || !jupiterClient || !isTokenTradable) return

    setSwapError(null)
    setIsSwapping(true)

    try {
      const amount = Number.parseFloat(swapAmount)
      if (isNaN(amount) || amount <= 0) {
        setSwapError("Please enter a valid amount")
        setIsSwapping(false)
        return
      }

      if (!provider) {
        setSwapError("Wallet not connected")
        setIsSwapping(false)
        return
      }

      // Check balance
      if (inputBalance !== null && amount > inputBalance) {
        setSwapError(`Insufficient ${inputToken.symbol} balance`)
        setIsSwapping(false)
        return
      }

      // Get a fresh quote if needed
      if (!jupiterQuote) {
        const inputDecimals = inputToken.decimals
        const amountInSmallestUnit = Math.floor(amount * Math.pow(10, inputDecimals))

        try {
          const quote = await jupiterClient.getQuote(
            inputToken.mintAddress,
            outputToken.mintAddress,
            amountInSmallestUnit,
            slippageBps,
            false,
          )
          setJupiterQuote(quote)
        } catch (error) {
          console.error("Error getting Jupiter quote:", error)
          setSwapError("Failed to get quote. Please try again.")
          setIsSwapping(false)
          return
        }
      }

      if (!jupiterQuote) {
        setSwapError("Failed to get quote. Please try again.")
        setIsSwapping(false)
        return
      }

      try {
        // Get the swap transaction
        const swapResponse = await jupiterClient.getSwapTransaction(jupiterQuote, publicKey)

        // Execute the swap
        const swapResult = await jupiterClient.executeSwap(
          swapResponse.swapTransaction,
          new PublicKey(publicKey),
          provider.signTransaction.bind(provider),
          jupiterQuote,
        )

        console.log("Jupiter swap completed:", swapResult)

        // Calculate output amount
        const outputAmount = Number.parseFloat(jupiterQuote.outAmount) / Math.pow(10, outputToken.decimals)

        // Call the onSwap callback
        onSwap(inputToken, outputToken, amount, outputAmount, swapResult.txid)

        // Reset the form
        setSwapAmount("1")
        setJupiterQuote(null)
      } catch (error) {
        console.error("Error executing Jupiter swap:", error)
        setSwapError("Transaction failed. Please try again.")
      }
    } catch (error) {
      console.error("Swap error:", error)
      setSwapError("An unexpected error occurred")
    } finally {
      setIsSwapping(false)
    }
  }

  // Function to toggle the swap direction
  const toggleSwapDirection = () => {
    setInputToken(outputToken)
    setOutputToken(inputToken)
    setSwapAmount("1")
    setJupiterQuote(null)
  }

  // Calculate the receive amount
  const calculateReceiveAmount = () => {
    const amount = Number.parseFloat(swapAmount)
    if (isNaN(amount) || amount <= 0) return "0"

    if (jupiterQuote) {
      // Use Jupiter quote for calculation
      const outputAmount = Number.parseFloat(jupiterQuote.outAmount) / Math.pow(10, outputToken.decimals)
      return formatTokenAmount(outputAmount, outputToken)
    } else if (exchangeRate > 0) {
      // Use our exchange rate as fallback
      return formatTokenAmount(amount / exchangeRate, outputToken)
    }

    return "0"
  }

  return (
    <div className="space-y-4">
      {/* Input token section */}
      <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc]">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium font-mono">FROM</span>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              Balance:{" "}
              {inputBalance !== null ? `${formatTokenAmount(inputBalance, inputToken)} ${inputToken.symbol}` : "..."}
            </span>
            <SoundButton
              variant="outline"
              size="sm"
              className="h-6 text-xs border border-black"
              onClick={() => {
                if (inputBalance !== null) {
                  setSwapAmount(inputBalance.toString())
                }
              }}
              disabled={inputBalance === null || inputBalance === 0}
            >
              MAX
            </SoundButton>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              type="number"
              value={swapAmount}
              onChange={(e) => setSwapAmount(e.target.value)}
              className="border-2 border-black font-mono"
              min="0"
              step="0.01"
              disabled={isSwapping || !isTokenTradable}
            />
          </div>
          <TokenSelector
            selectedToken={inputToken}
            onTokenSelect={setInputToken}
            otherToken={outputToken}
            disabled={isSwapping || !isTokenTradable}
          />
        </div>
      </div>

      {/* Swap direction toggle */}
      <div className="flex justify-center">
        <SoundButton
          variant="ghost"
          size="icon"
          className="h-8 w-8 border-2 border-black rounded-full bg-white"
          onClick={toggleSwapDirection}
          disabled={isSwapping || !isTokenTradable}
        >
          <ArrowDownUp className="h-4 w-4" />
        </SoundButton>
      </div>

      {/* Output token section */}
      <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc]">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium font-mono">TO</span>
          <span className="text-sm">
            You receive: {calculateReceiveAmount()} {outputToken.symbol}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              type="text"
              value={calculateReceiveAmount()}
              readOnly
              className="border-2 border-black font-mono bg-gray-100"
            />
          </div>
          <TokenSelector
            selectedToken={outputToken}
            onTokenSelect={setOutputToken}
            otherToken={inputToken}
            disabled={isSwapping || !isTokenTradable}
          />
        </div>
      </div>

      {/* Settings and info */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Slippage Tolerance:</span>
          <span className="text-sm font-bold">{(slippageBps / 100).toFixed(2)}%</span>
        </div>
        <SwapSettings slippageBps={slippageBps} onSlippageChange={setSlippageBps} />
      </div>

      {/* Error display */}
      {swapError && (
        <Alert variant="destructive" className="border-2 border-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{swapError}</AlertDescription>
        </Alert>
      )}

      {/* Exchange rate info */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
        <p className="flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>
            {isLoadingPrice || isLoadingQuote ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading prices...
              </span>
            ) : (
              <>
                Exchange Rate: 1 {inputToken.symbol} = {(1 / exchangeRate).toFixed(exchangeRate < 0.01 ? 4 : 2)}{" "}
                {outputToken.symbol}
                {inputTokenPrice && outputTokenPrice && (
                  <>
                    {" "}
                    ({inputToken.symbol}: ${inputTokenPrice.toFixed(2)}, {outputToken.symbol}: $
                    {outputTokenPrice.toFixed(2)})
                  </>
                )}
                {" Swaps are executed on Solana devnet using Jupiter."}
              </>
            )}
          </span>
        </p>
      </div>

      {/* Swap button */}
      <SoundButton
        className="w-full bg-gray-400 hover:bg-gray-400 text-gray-600 border-2 border-gray-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono cursor-not-allowed"
        onClick={handleSwap}
        disabled={true} // Always disabled for now
      >
        SWAP TEMPORARILY DISABLED
      </SoundButton>
    </div>
  )
}
