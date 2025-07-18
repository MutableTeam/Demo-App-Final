"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

interface Token {
  symbol: string
  name: string
  icon: string
  balance?: number
}

const AVAILABLE_TOKENS: Token[] = [
  {
    symbol: "SOL",
    name: "Solana",
    icon: "/images/solana-logo.png",
    balance: 5.234,
  },
  {
    symbol: "MUTB",
    name: "Mutable Token",
    icon: "/images/mutable-token.png",
    balance: 150.0,
  },
]

export function TokenSwapForm() {
  const [fromToken, setFromToken] = useState<Token>(AVAILABLE_TOKENS[0])
  const [toToken, setToToken] = useState<Token>(AVAILABLE_TOKENS[1])
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [isSwapping, setIsSwapping] = useState(false)
  const [slippage, setSlippage] = useState("0.5")

  // Mock exchange rate (in real app, this would come from an API)
  const exchangeRate = fromToken.symbol === "SOL" ? 0.1 : 10

  useEffect(() => {
    if (fromAmount && !isNaN(Number(fromAmount))) {
      const calculated = (Number(fromAmount) * exchangeRate).toFixed(6)
      setToAmount(calculated)
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

    // Simulate swap transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSwapping(false)
    setFromAmount("")
    setToAmount("")

    // In a real app, you would handle the actual swap here
    alert("Swap completed successfully!")
  }

  const isSwapDisabled = !fromAmount || !toAmount || isSwapping || Number(fromAmount) > (fromToken.balance || 0)

  return (
    <Card className="w-full max-w-md mx-auto bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5 text-orange-600" />
          Token Swap
        </CardTitle>
        <CardDescription className="text-gray-600">Swap between SOL and MUTB tokens</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From Token */}
        <div className="space-y-2">
          <Label htmlFor="from-amount" className="text-sm font-medium text-gray-700">
            From
          </Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                id="from-amount"
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="text-lg font-mono border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <Select
              value={fromToken.symbol}
              onValueChange={(value) => {
                const token = AVAILABLE_TOKENS.find((t) => t.symbol === value)
                if (token) setFromToken(token)
              }}
            >
              <SelectTrigger className="w-32 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_TOKENS.filter((t) => t.symbol !== toToken.symbol).map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    <div className="flex items-center gap-2">
                      <Image
                        src={token.icon || "/placeholder.svg"}
                        alt={token.symbol}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      {token.symbol}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              Balance: {fromToken.balance?.toFixed(4) || "0.0000"} {fromToken.symbol}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-orange-600 hover:text-orange-700"
              onClick={() => setFromAmount(fromToken.balance?.toString() || "0")}
            >
              Max
            </Button>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwapTokens}
            className="rounded-full border border-gray-300 hover:bg-gray-50"
          >
            <ArrowUpDown className="h-4 w-4 text-gray-600" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <Label htmlFor="to-amount" className="text-sm font-medium text-gray-700">
            To
          </Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                id="to-amount"
                type="number"
                placeholder="0.00"
                value={toAmount}
                readOnly
                className="text-lg font-mono bg-gray-50 border-gray-300"
              />
            </div>
            <Select
              value={toToken.symbol}
              onValueChange={(value) => {
                const token = AVAILABLE_TOKENS.find((t) => t.symbol === value)
                if (token) setToToken(token)
              }}
            >
              <SelectTrigger className="w-32 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_TOKENS.filter((t) => t.symbol !== fromToken.symbol).map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    <div className="flex items-center gap-2">
                      <Image
                        src={token.icon || "/placeholder.svg"}
                        alt={token.symbol}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      {token.symbol}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-gray-500">
            Balance: {toToken.balance?.toFixed(4) || "0.0000"} {toToken.symbol}
          </div>
        </div>

        {/* Slippage Settings */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Slippage Tolerance</Label>
          <div className="flex gap-2">
            {["0.1", "0.5", "1.0"].map((value) => (
              <Button
                key={value}
                variant={slippage === value ? "default" : "outline"}
                size="sm"
                onClick={() => setSlippage(value)}
                className={
                  slippage === value ? "bg-orange-600 hover:bg-orange-700" : "border-gray-300 hover:bg-gray-50"
                }
              >
                {value}%
              </Button>
            ))}
            <Input
              type="number"
              placeholder="Custom"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              className="w-20 text-xs border-gray-300"
              step="0.1"
              min="0.1"
              max="50"
            />
          </div>
        </div>

        {/* Exchange Rate Info */}
        {fromAmount && toAmount && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Exchange Rate:</span>
                <span>
                  1 {fromToken.symbol} = {exchangeRate} {toToken.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Slippage:</span>
                <span>{slippage}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {fromAmount && Number(fromAmount) > (fromToken.balance || 0) && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">Insufficient {fromToken.symbol} balance</AlertDescription>
          </Alert>
        )}

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={isSwapDisabled}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
        >
          {isSwapping ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Swapping...
            </>
          ) : (
            "Swap Tokens"
          )}
        </Button>

        {/* Disclaimer */}
        <div className="text-xs text-gray-500 text-center">
          <p>This is a demo swap interface. No real transactions will be executed.</p>
        </div>
      </CardContent>
    </Card>
  )
}
