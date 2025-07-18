"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Loader2, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TokenConfig } from "@/types/token-types"
import { getTokenPrice } from "@/utils/token-utils"
import type { SwapResult } from "@/types/token-types"

interface MarketOverviewProps {
  tokens: TokenConfig[]
  recentTransactions: SwapResult[]
}

export function MarketOverview({ tokens, recentTransactions }: MarketOverviewProps) {
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoading(true)
      try {
        const prices: Record<string, number> = {}
        const changes: Record<string, number> = {}

        for (const token of tokens) {
          const price = await getTokenPrice(token)
          prices[token.id] = price.usdPrice
          // Mock price change for demo (in real app, this would come from API)
          changes[token.id] = (Math.random() - 0.5) * 10 // Random change between -5% and +5%
        }

        setTokenPrices(prices)
        setPriceChanges(changes)
      } catch (error) {
        console.error("Error fetching token prices:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrices()
    // Refresh prices every 60 seconds
    const intervalId = setInterval(fetchPrices, 60000)

    return () => clearInterval(intervalId)
  }, [tokens])

  const formatPriceChange = (change: number) => {
    const sign = change >= 0 ? "+" : ""
    return `${sign}${change.toFixed(2)}%`
  }

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return "text-green-600"
    if (change < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3" />
    if (change < 0) return <TrendingDown className="h-3 w-3" />
    return <Activity className="h-3 w-3" />
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            Market Overview
          </CardTitle>
          <CardDescription className="text-gray-600">Current token prices and market data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={token.logoURI || "/placeholder.svg"}
                    alt={token.symbol}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{token.name}</div>
                    <div className="text-sm text-gray-600">{token.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {isLoading ? (
                      <span className="flex items-center gap-1 text-gray-500">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      `$${tokenPrices[token.id]?.toFixed(2) || "0.00"}`
                    )}
                  </div>
                  <div
                    className={`text-sm flex items-center gap-1 ${getPriceChangeColor(priceChanges[token.id] || 0)}`}
                  >
                    {getPriceChangeIcon(priceChanges[token.id] || 0)}
                    {formatPriceChange(priceChanges[token.id] || 0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-600" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-gray-600">Latest trades and transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions
                .filter((tx) => tx.type === "swap")
                .slice(0, 5)
                .map((tx, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-orange-200 text-orange-700">
                        Swap
                      </Badge>
                      <span className="text-sm text-gray-900">
                        {tx.inputAmount.toFixed(2)} {tx.inputToken} → {tx.outputAmount.toFixed(2)} {tx.outputToken}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">{new Date(tx.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">No recent activity</p>
                <p className="text-sm text-gray-500">Trades will appear here once you start swapping</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Market Stats */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Market Statistics</CardTitle>
          <CardDescription className="text-gray-600">24-hour trading statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 border border-gray-100 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{recentTransactions.length}</div>
              <div className="text-sm text-gray-600">Total Trades</div>
            </div>
            <div className="text-center p-3 border border-gray-100 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {recentTransactions.reduce((sum, tx) => sum + tx.inputAmount, 0).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Volume</div>
            </div>
            <div className="text-center p-3 border border-gray-100 rounded-lg">
              <div className="text-2xl font-bold text-green-600">+{(Math.random() * 5 + 1).toFixed(1)}%</div>
              <div className="text-sm text-gray-600">24h Change</div>
            </div>
            <div className="text-center p-3 border border-gray-100 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">${(Math.random() * 1000 + 500).toFixed(0)}K</div>
              <div className="text-sm text-gray-600">Market Cap</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
