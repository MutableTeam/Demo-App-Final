"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, DollarSign, BarChart3, RefreshCw, Activity } from "lucide-react"
import Image from "next/image"
import type { TokenConfig, SwapResult } from "@/types/token-types"
import { getTokenPrice } from "@/utils/token-utils"

interface MarketOverviewProps {
  tokens: TokenConfig[]
  recentTransactions: SwapResult[]
}

interface TokenMarketData {
  token: TokenConfig
  price: number
  change24h: number
  volume24h: number
  isLoading: boolean
}

export function MarketOverview({ tokens, recentTransactions }: MarketOverviewProps) {
  const [marketData, setMarketData] = useState<TokenMarketData[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Fetch market data for tokens
  const fetchMarketData = async () => {
    setIsRefreshing(true)

    const dataPromises = tokens.map(async (token) => {
      try {
        const priceData = await getTokenPrice(token)
        return {
          token,
          price: priceData.usdPrice || 0,
          change24h: priceData.change24h || 0,
          volume24h: priceData.volume24h || 0,
          isLoading: false,
        }
      } catch (error) {
        console.error(`Error fetching data for ${token.symbol}:`, error)
        return {
          token,
          price: 0,
          change24h: 0,
          volume24h: 0,
          isLoading: false,
        }
      }
    })

    const data = await Promise.all(dataPromises)
    setMarketData(data)
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }

  useEffect(() => {
    fetchMarketData()

    // Refresh every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [tokens])

  // Calculate total portfolio value from recent transactions
  const calculatePortfolioStats = () => {
    const totalTransactions = recentTransactions.length
    const successfulSwaps = recentTransactions.filter((tx) => tx.type === "swap").length
    const totalVolume = recentTransactions.reduce((sum, tx) => sum + tx.inputAmount, 0)

    return {
      totalTransactions,
      successfulSwaps,
      totalVolume,
      successRate: totalTransactions > 0 ? (successfulSwaps / totalTransactions) * 100 : 0,
    }
  }

  const portfolioStats = calculatePortfolioStats()

  const formatPrice = (price: number) => {
    if (price === 0) return "N/A"
    if (price < 0.01) return `$${price.toFixed(6)}`
    return `$${price.toFixed(2)}`
  }

  const formatVolume = (volume: number) => {
    if (volume === 0) return "N/A"
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`
    if (volume >= 1000) return `$${(volume / 1000).toFixed(1)}K`
    return `$${volume.toFixed(0)}`
  }

  const formatChange = (change: number) => {
    const isPositive = change >= 0
    return (
      <span className={`flex items-center gap-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {Math.abs(change).toFixed(2)}%
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                Portfolio Overview
              </CardTitle>
              <CardDescription className="text-gray-600">Your trading activity summary</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMarketData}
              disabled={isRefreshing}
              className="border-gray-300 hover:border-orange-500 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{portfolioStats.totalTransactions}</div>
              <div className="text-sm text-gray-600">Total Transactions</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{portfolioStats.successfulSwaps}</div>
              <div className="text-sm text-gray-600">Successful Swaps</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-orange-600">{portfolioStats.totalVolume.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Volume</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{portfolioStats.successRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Market Data */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-orange-600" />
            Market Data
          </CardTitle>
          <CardDescription className="text-gray-600">
            Current prices and 24h changes • Last updated: {lastUpdated.toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketData.map((data, index) => (
              <div
                key={data.token.symbol}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Image
                      src={data.token.logoURI || "/placeholder.svg"}
                      alt={data.token.symbol}
                      width={40}
                      height={40}
                      className="rounded-full border border-gray-200"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{data.token.name}</div>
                    <div className="text-sm text-gray-600">{data.token.symbol}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{formatPrice(data.price)}</div>
                    <div className="text-sm">{formatChange(data.change24h)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">24h Volume</div>
                    <div className="font-medium text-gray-900">{formatVolume(data.volume24h)}</div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${data.token.symbol === "SOL" ? "border-blue-300 text-blue-700" : "border-orange-300 text-orange-700"}`}
                  >
                    {data.token.symbol}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recentTransactions.length > 0 && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-gray-600">Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.slice(0, 5).map((tx, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Swapped {tx.inputAmount} {tx.inputToken} → {tx.outputAmount.toFixed(4)} {tx.outputToken}
                      </div>
                      <div className="text-sm text-gray-600">{new Date(tx.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Success</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
