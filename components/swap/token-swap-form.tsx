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
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import { cn } from "@/lib/utils"

// Cyberpunk styled components
const glowPulse = keyframes`
  0% { box-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.3); }
  50% { box-shadow: 0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.5); }
  100% { box-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.3); }
`

const CyberCard = styled.div`
  background: rgba(10, 10, 40, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
  }
`

const CyberInput = styled(Input)`
  background: rgba(16, 16, 48, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.5);
  color: rgba(0, 255, 255, 0.9);
  font-family: monospace;
  
  &:focus {
    border-color: rgba(0, 255, 255, 0.8);
    box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.2);
  }
`

const CyberButton = styled(SoundButton)`
  background: linear-gradient(90deg, rgba(0, 128, 255, 0.5), rgba(0, 255, 255, 0.5));
  border: 1px solid rgba(0, 255, 255, 0.8);
  color: white;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.8);
  font-family: monospace;
  position: relative;
  overflow: hidden;
  
  &:hover:not(:disabled) {
    background: linear-gradient(90deg, rgba(0, 128, 255, 0.7), rgba(0, 255, 255, 0.7));
    animation: ${glowPulse} 2s infinite;
  }
  
  &:disabled {
    background: rgba(50, 50, 70, 0.5);
    border-color: rgba(100, 100, 150, 0.3);
    color: rgba(200, 200, 220, 0.5);
  }
`

const CyberToggleButton = styled(SoundButton)`
  background: rgba(16, 16, 48, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.5);
  color: rgba(0, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background: rgba(16, 16, 48, 0.9);
    border-color: rgba(0, 255, 255, 0.8);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }
`

const CyberInfoBox = styled.div`
  background: rgba(0, 50, 100, 0.3);
  border: 1px solid rgba(0, 150, 255, 0.3);
  border-radius: 4px;
  color: rgba(150, 220, 255, 0.9);
`

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
  connectedWallet: any
  isTestMode: boolean
  setWalletAddress: (address: string) => void
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
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

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
    if (!isTestMode && connectedWallet && connectedWallet.publicKey) {
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
      {isCyberpunk ? (
        <CyberCard className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium font-mono text-cyan-300">FROM</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-cyan-200">
                Balance:{" "}
                {inputBalance !== null ? `${formatTokenAmount(inputBalance, inputToken)} ${inputToken.symbol}` : "..."}
              </span>
              <CyberButton
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={() => {
                  if (inputBalance !== null) {
                    setSwapAmount(inputBalance.toString())
                  }
                }}
                disabled={inputBalance === null || inputBalance === 0}
              >
                MAX
              </CyberButton>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <CyberInput
                type="number"
                value={swapAmount}
                onChange={(e) => setSwapAmount(e.target.value)}
                className="font-mono"
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
              isCyberpunk={true}
            />
          </div>
        </CyberCard>
      ) : (
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
      )}

      {/* Swap direction toggle */}
      <div className="flex justify-center">
        {isCyberpunk ? (
          <CyberToggleButton
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={toggleSwapDirection}
            disabled={isSwapping || !isTokenTradable}
          >
            <ArrowDownUp className="h-4 w-4" />
          </CyberToggleButton>
        ) : (
          <SoundButton
            variant="ghost"
            size="icon"
            className="h-8 w-8 border-2 border-black rounded-full bg-white"
            onClick={toggleSwapDirection}
            disabled={isSwapping || !isTokenTradable}
          >
            <ArrowDownUp className="h-4 w-4" />
          </SoundButton>
        )}
      </div>

      {/* Output token section */}
      {isCyberpunk ? (
        <CyberCard className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium font-mono text-cyan-300">TO</span>
            <span className="text-sm text-cyan-200">
              You receive: {calculateReceiveAmount()} {outputToken.symbol}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <CyberInput type="text" value={calculateReceiveAmount()} readOnly className="font-mono bg-opacity-50" />
            </div>
            <TokenSelector
              selectedToken={outputToken}
              onTokenSelect={setOutputToken}
              otherToken={inputToken}
              disabled={isSwapping || !isTokenTradable}
              isCyberpunk={true}
            />
          </div>
        </CyberCard>
      ) : (
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
      )}

      {/* Settings and info */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium", isCyberpunk && "text-cyan-200")}>Slippage Tolerance:</span>
          <span className={cn("text-sm font-bold", isCyberpunk && "text-cyan-300")}>
            {(slippageBps / 100).toFixed(2)}%
          </span>
        </div>
        <SwapSettings slippageBps={slippageBps} onSlippageChange={setSlippageBps} isCyberpunk={isCyberpunk} />
      </div>

      {/* Error display */}
      {swapError && (
        <Alert
          variant="destructive"
          className={isCyberpunk ? "border border-red-500 bg-red-900/30" : "border-2 border-red-500"}
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{swapError}</AlertDescription>
        </Alert>
      )}

      {/* Exchange rate info */}
      {isCyberpunk ? (
        <CyberInfoBox className="p-3 rounded-md text-sm">
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
        </CyberInfoBox>
      ) : (
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
      )}

      {/* Swap button */}
      {isCyberpunk ? (
        <CyberButton
          className="w-full font-mono"
          onClick={handleSwap}
          disabled={true} // Always disabled for now
        >
          SWAP TEMPORARILY DISABLED
        </CyberButton>
      ) : (
        <SoundButton
          className="w-full bg-gray-400 hover:bg-gray-400 text-gray-600 border-2 border-gray-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono cursor-not-allowed"
          onClick={handleSwap}
          disabled={true} // Always disabled for now
        >
          SWAP TEMPORARILY DISABLED
        </SoundButton>
      )}
    </div>
  )
}
