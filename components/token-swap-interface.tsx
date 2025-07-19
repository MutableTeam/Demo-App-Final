"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, TrendingUp, TrendingDown, BarChart3, Wallet, RefreshCw } from "lucide-react"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import Image from "next/image"

// Mock token data
const TOKENS = [
  {
    symbol: "SOL",
    name: "Solana",
    icon: "/solana-logo.png",
    balance: 12.5,
    price: 98.45,
    change24h: 5.2,
  },
  {
    symbol: "MUTABLE",
    name: "Mutable Token",
    icon: "/images/mutable-token.png",
    balance: 1250.0,
    price: 0.045,
    change24h: -2.1,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "/usdc-coins.png",
    balance: 500.0,
    price: 1.0,
    change24h: 0.0,
  },
]

export default function TokenSwapInterface() {
  const [fromToken, setFromToken] = useState(TOKENS[0])
  const [toToken, setToToken] = useState(TOKENS[1])
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [isSwapping, setIsSwapping] = useState(false)
  const [slippage, setSlippage] = useState("0.5")

  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  // Calculate exchange rate and amounts
  useEffect(() => {
    if (fromAmount && fromToken && toToken) {
      const rate = fromToken.price / toToken.price
      const calculatedAmount = (Number.parseFloat(fromAmount) * rate).toFixed(6)
      setToAmount(calculatedAmount)
    } else {
      setToAmount("")
    }
  }, [fromAmount, fromToken, toToken])

  const handleSwapTokens = () => {
    const tempToken = fromToken
    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const handleSwap = async () => {
    setIsSwapping(true)
    // Simulate swap transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSwapping(false)
    setFromAmount("")
    setToAmount("")
  }

  const exchangeRate = fromToken && toToken ? (fromToken.price / toToken.price).toFixed(6) : "0"

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Main Swap Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Swap Card */}
        <div className="lg:col-span-2">
          <Card
            className={cn(
              "border-2",
              isCyberpunk
                ? "bg-slate-900/50 border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                : "bg-white border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
            )}
          >
            <CardHeader>
              <CardTitle
                className={cn("flex items-center gap-2 font-mono", isCyberpunk ? "text-cyan-300" : "text-amber-700")}
              >
                <ArrowUpDown className="h-5 w-5" />
                Token Swap
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* From Token */}
              <div className="space-y-2">
                <label className={cn("text-sm font-medium", isCyberpunk ? "text-slate-300" : "text-gray-700")}>
                  From
                </label>
                <div
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border-2",
                    isCyberpunk ? "bg-slate-800/50 border-slate-600/50" : "bg-amber-50/50 border-amber-300/50",
                  )}
                >
                  <Select
                    value={fromToken.symbol}
                    onValueChange={(value) => setFromToken(TOKENS.find((t) => t.symbol === value) || TOKENS[0])}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TOKENS.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center gap-2">
                            <Image
                              src={token.icon || "/placeholder.svg"}
                              alt={token.symbol}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                            <span>{token.symbol}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="flex-1 text-right text-lg font-mono"
                  />
                </div>
                <div className={cn("text-xs", isCyberpunk ? "text-slate-400" : "text-gray-500")}>
                  Balance: {fromToken.balance.toFixed(4)} {fromToken.symbol}
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleSwapTokens}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "rounded-full p-2 border-2",
                    isCyberpunk
                      ? "border-cyan-500/50 hover:border-cyan-400/70 hover:bg-cyan-500/10"
                      : "border-amber-500/50 hover:border-amber-400/70 hover:bg-amber-500/10",
                  )}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>

              {/* To Token */}
              <div className="space-y-2">
                <label className={cn("text-sm font-medium", isCyberpunk ? "text-slate-300" : "text-gray-700")}>
                  To
                </label>
                <div
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border-2",
                    isCyberpunk ? "bg-slate-800/50 border-slate-600/50" : "bg-amber-50/50 border-amber-300/50",
                  )}
                >
                  <Select
                    value={toToken.symbol}
                    onValueChange={(value) => setToToken(TOKENS.find((t) => t.symbol === value) || TOKENS[1])}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TOKENS.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center gap-2">
                            <Image
                              src={token.icon || "/placeholder.svg"}
                              alt={token.symbol}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                            <span>{token.symbol}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={toAmount}
                    readOnly
                    className="flex-1 text-right text-lg font-mono bg-transparent"
                  />
                </div>
                <div className={cn("text-xs", isCyberpunk ? "text-slate-400" : "text-gray-500")}>
                  Balance: {toToken.balance.toFixed(4)} {toToken.symbol}
                </div>
              </div>

              {/* Exchange Rate */}
              {fromAmount && (
                <div
                  className={cn(
                    "p-3 rounded-lg border",
                    isCyberpunk
                      ? "bg-slate-800/30 border-slate-600/30 text-slate-300"
                      : "bg-amber-50/30 border-amber-300/30 text-amber-700",
                  )}
                >
                  <div className="text-sm">
                    1 {fromToken.symbol} = {exchangeRate} {toToken.symbol}
                  </div>
                </div>
              )}

              {/* Slippage Settings */}
              <div className="flex items-center justify-between">
                <span className={cn("text-sm", isCyberpunk ? "text-slate-300" : "text-gray-700")}>
                  Slippage Tolerance
                </span>
                <Select value={slippage} onValueChange={setSlippage}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.1">0.1%</SelectItem>
                    <SelectItem value="0.5">0.5%</SelectItem>
                    <SelectItem value="1.0">1.0%</SelectItem>
                    <SelectItem value="3.0">3.0%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Swap Button */}
              <Button
                onClick={handleSwap}
                disabled={!fromAmount || !toAmount || isSwapping}
                className={cn(
                  "w-full h-12 font-bold text-lg",
                  isCyberpunk
                    ? "bg-cyan-600 hover:bg-cyan-500 text-white"
                    : "bg-amber-600 hover:bg-amber-500 text-white",
                )}
              >
                {isSwapping ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Swapping...
                  </div>
                ) : (
                  "Swap Tokens"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio & Stats */}
        <div className="space-y-6">
          {/* Portfolio Overview */}
          <Card
            className={cn(
              "border-2",
              isCyberpunk
                ? "bg-slate-900/50 border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                : "bg-white border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
            )}
          >
            <CardHeader>
              <CardTitle
                className={cn(
                  "flex items-center gap-2 font-mono text-sm",
                  isCyberpunk ? "text-cyan-300" : "text-amber-700",
                )}
              >
                <Wallet className="h-4 w-4" />
                Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {TOKENS.map((token) => (
                <div key={token.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image
                      src={token.icon || "/placeholder.svg"}
                      alt={token.symbol}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <div>
                      <div className={cn("font-medium text-sm", isCyberpunk ? "text-slate-200" : "text-gray-900")}>
                        {token.symbol}
                      </div>
                      <div className={cn("text-xs", isCyberpunk ? "text-slate-400" : "text-gray-500")}>
                        ${token.price.toFixed(4)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn("font-medium text-sm", isCyberpunk ? "text-slate-200" : "text-gray-900")}>
                      {token.balance.toFixed(2)}
                    </div>
                    <div className={cn("text-xs", isCyberpunk ? "text-slate-400" : "text-gray-500")}>
                      ${(token.balance * token.price).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Market Stats */}
          <Card
            className={cn(
              "border-2",
              isCyberpunk
                ? "bg-slate-900/50 border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                : "bg-white border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
            )}
          >
            <CardHeader>
              <CardTitle
                className={cn(
                  "flex items-center gap-2 font-mono text-sm",
                  isCyberpunk ? "text-cyan-300" : "text-amber-700",
                )}
              >
                <BarChart3 className="h-4 w-4" />
                Market Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {TOKENS.map((token) => (
                <div key={token.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image
                      src={token.icon || "/placeholder.svg"}
                      alt={token.symbol}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <span className={cn("font-medium text-sm", isCyberpunk ? "text-slate-200" : "text-gray-900")}>
                      {token.symbol}
                    </span>
                  </div>
                  <Badge
                    variant={token.change24h >= 0 ? "default" : "destructive"}
                    className={cn(
                      "text-xs",
                      token.change24h >= 0
                        ? isCyberpunk
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-green-100 text-green-700 border-green-300"
                        : isCyberpunk
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-red-100 text-red-700 border-red-300",
                    )}
                  >
                    {token.change24h >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(token.change24h).toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
