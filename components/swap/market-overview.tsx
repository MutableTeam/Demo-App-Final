"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity, Zap } from "lucide-react"
import Image from "next/image"

interface TokenData {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  icon: string
}

interface MarketStats {
  totalVolume: number
  totalLiquidity: number
  activePairs: number
  totalTransactions: number
}

const MOCK_TOKENS: TokenData[] = [
  {
    symbol: "MUTB",
    name: "Mutable Token",
    price: 0.0234,
    change24h: 5.3,
    volume24h: 125000,
    marketCap: 2340000,
    icon: "/images/mutable-token.png",
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 125.78,
    change24h: -2.1,
    volume24h: 890000,
    marketCap: 52000000000,
    icon: "/solana-logo.png",
  },
]

const MOCK_STATS: MarketStats = {
  totalVolume: 2400000,
  totalLiquidity: 8900000,
  activePairs: 12,
  totalTransactions: 15234,
}

export function MarketOverview() {
  const [tokens] = useState<TokenData[]>(MOCK_TOKENS)
  const [stats] = useState<MarketStats>(MOCK_STATS)
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h")

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`
    }
    return `$${num.toFixed(2)}`
  }

  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return `$${price.toFixed(4)}`
    }
    return `$${price.toFixed(2)}`
  }

  return (
    <div className="space-y-6">
      {/* Market Stats */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <BarChart3 className="h-5 w-5 text-orange-600" />
            Market Overview
          </CardTitle>
          <CardDescription className="text-gray-600">Real-time market statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Total Volume</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalVolume)}</div>
              <div className="text-xs text-green-600 font-medium">+12.5% (24h)</div>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Total Liquidity</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalLiquidity)}</div>
              <div className="text-xs text-green-600 font-medium">+8.2% (24h)</div>
            </div>

            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Active Pairs</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.activePairs}</div>
              <div className="text-xs text-green-600 font-medium">+2 new pairs</div>
            </div>

            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Transactions</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalTransactions.toLocaleString()}</div>
              <div className="text-xs text-green-600 font-medium">+15.7% (24h)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Tokens */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900">Top Tokens</CardTitle>
              <CardDescription className="text-gray-600">Most traded tokens on the platform</CardDescription>
            </div>
            <div className="flex gap-2">
              {["24h", "7d", "30d"].map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={
                    selectedTimeframe === timeframe
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                  }
                >
                  {timeframe}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tokens.map((token, index) => (
              <div
                key={token.symbol}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors bg-white"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-500 w-6">#{index + 1}</span>
                    <Image
                      src={token.icon || "/placeholder.svg"}
                      alt={token.symbol}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{token.symbol}</div>
                    <div className="text-sm text-gray-600">{token.name}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-medium text-gray-900">{formatPrice(token.price)}</div>
                  <div className="flex items-center gap-1">
                    {token.change24h >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${token.change24h >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {token.change24h >= 0 ? "+" : ""}
                      {token.change24h.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-600">Volume</div>
                  <div className="font-medium text-gray-900">{formatNumber(token.volume24h)}</div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-600">Market Cap</div>
                  <div className="font-medium text-gray-900">{formatNumber(token.marketCap)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
