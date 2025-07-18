"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, Settings, Zap, AlertCircle } from "lucide-react"
import Image from "next/image"

interface Token {
  symbol: string
  name: string
  icon: string
  balance: number
  price: number
}

const AVAILABLE_TOKENS: Token[] = [
  {
    symbol: "SOL",
    name: "Solana",
    icon: "/solana-logo.png",
    balance: 5.234,
    price: 125.78,
  },
  {
    symbol: "MUTB",
    name: "Mutable Token",
    icon: "/images/mutable-token.png",
    balance: 1250.5,
    price: 0.0234,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "/placeholder.svg",
    balance: 100.0,
    price: 1.0,
  },
]

export function TokenSwapForm() {
  const [fromToken, setFromToken] = useState<Token>(AVAILABLE_TOKENS[0])
  const [toToken, setToToken] = useState<Token>(AVAILABLE_TOKENS[1])
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [slippage, setSlippage] = useState("0.5")
  const [isSwapping, setIsSwapping] = useState(false)

  const handleSwapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    if (value && !isNaN(Number(value))) {
      const fromValue = Number(value) * fromToken.price
      const toValue = fromValue / toToken.price
      setToAmount(toValue.toFixed(6))
    } else {
      setToAmount("")
    }
  }

  const handleSwap = async () => {
    setIsSwapping(true)
    // Simulate swap transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSwapping(false)
    setFromAmount("")
    setToAmount("")
  }

  const getExchangeRate = () => {
    if (!fromAmount || !toAmount) return null
    const rate = Number(toAmount) / Number(fromAmount)
    return `1 ${fromToken.symbol} = ${rate.toFixed(6)} ${toToken.symbol}`
  }

  const getPriceImpact = () => {
    // Mock price impact calculation
    const impact = Math.random() * 2
    return impact.toFixed(2)
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <ArrowUpDown className="h-5 w-5 text-orange-600" />
              Token Swap
            </CardTitle>
            <CardDescription className="text-gray-600">Exchange tokens instantly</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From Token */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">From</label>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <Select
                value={fromToken.symbol}
                onValueChange={(value) => {
                  const token = AVAILABLE_TOKENS.find((t) => t.symbol === value)
                  if (token) setFromToken(token)
                }}
              >
                <SelectTrigger className="w-32 bg-white border-gray-300">
                  <div className="flex items-center gap-2">
                    <Image src={fromToken.icon || "/placeholder.svg"} alt={fromToken.symbol} width={20} height={20} />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {AVAILABLE_TOKENS.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center gap-2">
                        <Image src={token.icon || "/placeholder.svg"} alt={token.symbol} width={20} height={20} />
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                className="text-right text-xl font-medium border-0 bg-transparent p-0 focus:ring-0"
              />
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Balance: {fromToken.balance.toFixed(4)}</span>
              <span>${(Number(fromAmount) * fromToken.price || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSwapTokens}
            className="rounded-full p-2 border border-gray-200 bg-white hover:bg-gray-50"
          >
            <ArrowUpDown className="h-4 w-4 text-gray-600" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">To</label>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <Select
                value={toToken.symbol}
                onValueChange={(value) => {
                  const token = AVAILABLE_TOKENS.find((t) => t.symbol === value)
                  if (token) setToToken(token)
                }}
              >
                <SelectTrigger className="w-32 bg-white border-gray-300">
                  <div className="flex items-center gap-2">
                    <Image src={toToken.icon || "/placeholder.svg"} alt={toToken.symbol} width={20} height={20} />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {AVAILABLE_TOKENS.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center gap-2">
                        <Image src={token.icon || "/placeholder.svg"} alt={token.symbol} width={20} height={20} />
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-right text-xl font-medium text-gray-900">{toAmount || "0.0"}</div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Balance: {toToken.balance.toFixed(4)}</span>
              <span>${(Number(toAmount) * toToken.price || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Swap Details */}
        {fromAmount && toAmount && (
          <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Exchange Rate</span>
              <span className="font-medium text-gray-900">{getExchangeRate()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Price Impact</span>
              <span className="font-medium text-orange-600">{getPriceImpact()}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Slippage Tolerance</span>
              <span className="font-medium text-gray-900">{slippage}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Network Fee</span>
              <span className="font-medium text-gray-900">~0.0025 SOL</span>
            </div>
          </div>
        )}

        {/* Warning */}
        {Number(getPriceImpact()) > 1 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-700">High price impact. Consider reducing swap amount.</span>
          </div>
        )}

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={!fromAmount || !toAmount || isSwapping}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          {isSwapping ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Swapping...
            </div>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Swap Tokens
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
