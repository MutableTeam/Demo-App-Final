"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, RefreshCw, Settings } from "lucide-react"
import Image from "next/image"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import type { Connection } from "@solana/web3.js"

interface TokenSwapInterfaceProps {
  publicKey: string
  balance: number | null
  provider: any
  connection: Connection
  onBalanceChange?: (currency: "sol" | "mutb", newBalance: number) => void
}

interface Token {
  symbol: string
  name: string
  image: string
  balance: number
  price: number
}

const mockTokens: Token[] = [
  {
    symbol: "SOL",
    name: "Solana",
    image: "/solana-logo.png",
    balance: 2.5,
    price: 98.45,
  },
  {
    symbol: "MUTB",
    name: "Mutable Token",
    image: "/images/mutable-token.png",
    balance: 1250.0,
    price: 0.12,
  },
]

export default function TokenSwapInterface({
  publicKey,
  balance,
  provider,
  connection,
  onBalanceChange,
}: TokenSwapInterfaceProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  const [fromToken, setFromToken] = useState<Token>(mockTokens[0])
  const [toToken, setToToken] = useState<Token>(mockTokens[1])
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [isSwapping, setIsSwapping] = useState(false)
  const [slippage, setSlippage] = useState("0.5")

  // Calculate exchange rate
  const exchangeRate = fromToken.price / toToken.price

  useEffect(() => {
    if (fromAmount && !isNaN(Number(fromAmount))) {
      const calculatedToAmount = (Number(fromAmount) * exchangeRate).toFixed(6)
      setToAmount(calculatedToAmount)
    } else {
      setToAmount("")
    }
  }, [fromAmount, exchangeRate])

  const handleSwapTokens = () => {
    const tempToken = fromToken
    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const handleSwap = async () => {
    if (!fromAmount || !toAmount) return

    setIsSwapping(true)
    try {
      // Simulate swap transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Update balances (mock)
      if (onBalanceChange) {
        if (fromToken.symbol === "SOL") {
          onBalanceChange("sol", (balance || 0) - Number(fromAmount))
        } else {
          onBalanceChange("mutb", fromToken.balance - Number(fromAmount))
        }
      }

      // Reset form
      setFromAmount("")
      setToAmount("")
    } catch (error) {
      console.error("Swap failed:", error)
    } finally {
      setIsSwapping(false)
    }
  }

  const canSwap = fromAmount && toAmount && Number(fromAmount) > 0 && Number(fromAmount) <= fromToken.balance

  return (
    <div className="space-y-6">
      {/* Main Swap Interface */}
      <Card
        className={cn(
          "relative overflow-hidden",
          isCyberpunk
            ? "bg-black/60 border border-cyan-500/30"
            : "bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        )}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpDown className={cn("h-5 w-5", isCyberpunk ? "text-cyan-400" : "text-black")} />
              <CardTitle className={cn("font-mono", isCyberpunk ? "text-cyan-200" : "text-black")}>
                Token Swap
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                isCyberpunk ? "text-cyan-400 hover:bg-cyan-500/20" : "text-gray-600 hover:bg-gray-100",
              )}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className={isCyberpunk ? "text-cyan-400/70" : "text-gray-600"}>
            Swap tokens instantly with low fees
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* From Token */}
          <div
            className={cn(
              "p-4 rounded-lg border",
              isCyberpunk ? "bg-black/40 border-cyan-500/20" : "bg-gray-50 border-gray-200",
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={cn("text-sm font-medium", isCyberpunk ? "text-cyan-300" : "text-gray-700")}>From</span>
              <span className={cn("text-xs", isCyberpunk ? "text-cyan-400/70" : "text-gray-500")}>
                Balance: {fromToken.balance.toFixed(4)} {fromToken.symbol}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Image
                  src={fromToken.image || "/placeholder.svg?height=32&width=32"}
                  alt={fromToken.symbol}
                  width={32}
                  height={32}
                  className="rounded-full flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className={cn("font-bold", isCyberpunk ? "text-cyan-100" : "text-black")}>
                    {fromToken.symbol}
                  </div>
                  <div className={cn("text-xs", isCyberpunk ? "text-cyan-400/70" : "text-gray-500")}>
                    ${fromToken.price.toFixed(2)}
                  </div>
                </div>
              </div>

              <Input
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className={cn(
                  "text-right text-lg font-bold border-none bg-transparent p-0 focus-visible:ring-0",
                  isCyberpunk ? "text-cyan-100" : "text-black",
                )}
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSwapTokens}
              className={cn(
                "h-10 w-10 rounded-full border-2",
                isCyberpunk
                  ? "border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100",
              )}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          {/* To Token */}
          <div
            className={cn(
              "p-4 rounded-lg border",
              isCyberpunk ? "bg-black/40 border-cyan-500/20" : "bg-gray-50 border-gray-200",
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={cn("text-sm font-medium", isCyberpunk ? "text-cyan-300" : "text-gray-700")}>To</span>
              <span className={cn("text-xs", isCyberpunk ? "text-cyan-400/70" : "text-gray-500")}>
                Balance: {toToken.balance.toFixed(4)} {toToken.symbol}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Image
                  src={toToken.image || "/placeholder.svg?height=32&width=32"}
                  alt={toToken.symbol}
                  width={32}
                  height={32}
                  className="rounded-full flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className={cn("font-bold", isCyberpunk ? "text-cyan-100" : "text-black")}>{toToken.symbol}</div>
                  <div className={cn("text-xs", isCyberpunk ? "text-cyan-400/70" : "text-gray-500")}>
                    ${toToken.price.toFixed(2)}
                  </div>
                </div>
              </div>

              <Input
                type="number"
                placeholder="0.00"
                value={toAmount}
                readOnly
                className={cn(
                  "text-right text-lg font-bold border-none bg-transparent p-0 focus-visible:ring-0",
                  isCyberpunk ? "text-cyan-100" : "text-black",
                )}
              />
            </div>
          </div>

          {/* Exchange Rate */}
          {fromAmount && toAmount && (
            <div
              className={cn(
                "p-3 rounded-lg text-sm",
                isCyberpunk ? "bg-black/40 text-cyan-300" : "bg-gray-50 text-gray-700",
              )}
            >
              <div className="flex items-center justify-between">
                <span>Exchange Rate</span>
                <span className="font-mono">
                  1 {fromToken.symbol} = {exchangeRate.toFixed(6)} {toToken.symbol}
                </span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <Button
            onClick={handleSwap}
            disabled={!canSwap || isSwapping}
            className={cn(
              "w-full h-12 text-lg font-bold",
              isCyberpunk
                ? "bg-cyan-500 hover:bg-cyan-600 text-black disabled:bg-cyan-500/20 disabled:text-cyan-400/50"
                : "bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black disabled:bg-gray-200 disabled:text-gray-400",
            )}
          >
            {isSwapping ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Swapping...
              </div>
            ) : !canSwap ? (
              "Enter Amount"
            ) : (
              `Swap ${fromToken.symbol} for ${toToken.symbol}`
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={cn(isCyberpunk ? "bg-black/40 border border-cyan-500/20" : "bg-white border-2 border-black")}>
          <CardHeader className="pb-3">
            <CardTitle className={cn("text-sm font-mono", isCyberpunk ? "text-cyan-200" : "text-black")}>
              Market Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className={cn("text-sm", isCyberpunk ? "text-cyan-300/70" : "text-gray-600")}>24h Volume</span>
              <span className={cn("text-sm font-bold", isCyberpunk ? "text-cyan-100" : "text-black")}>$2.4M</span>
            </div>
            <div className="flex justify-between">
              <span className={cn("text-sm", isCyberpunk ? "text-cyan-300/70" : "text-gray-600")}>Total Liquidity</span>
              <span className={cn("text-sm font-bold", isCyberpunk ? "text-cyan-100" : "text-black")}>$12.8M</span>
            </div>
            <div className="flex justify-between">
              <span className={cn("text-sm", isCyberpunk ? "text-cyan-300/70" : "text-gray-600")}>Fees (24h)</span>
              <span className={cn("text-sm font-bold", isCyberpunk ? "text-cyan-100" : "text-black")}>$7,200</span>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(isCyberpunk ? "bg-black/40 border border-cyan-500/20" : "bg-white border-2 border-black")}>
          <CardHeader className="pb-3">
            <CardTitle className={cn("text-sm font-mono", isCyberpunk ? "text-cyan-200" : "text-black")}>
              Your Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className={cn("text-sm", isCyberpunk ? "text-cyan-300/70" : "text-gray-600")}>Total Value</span>
              <span className={cn("text-sm font-bold", isCyberpunk ? "text-cyan-100" : "text-black")}>
                ${((balance || 0) * 98.45 + 1250 * 0.12).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={cn("text-sm", isCyberpunk ? "text-cyan-300/70" : "text-gray-600")}>SOL Balance</span>
              <span className={cn("text-sm font-bold", isCyberpunk ? "text-cyan-100" : "text-black")}>
                {(balance || 0).toFixed(4)} SOL
              </span>
            </div>
            <div className="flex justify-between">
              <span className={cn("text-sm", isCyberpunk ? "text-cyan-300/70" : "text-gray-600")}>MUTB Balance</span>
              <span className={cn("text-sm font-bold", isCyberpunk ? "text-cyan-100" : "text-black")}>
                1,250.00 MUTB
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
