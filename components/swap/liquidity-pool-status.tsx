"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Droplets, TrendingUp, AlertTriangle, Plus, Minus } from "lucide-react"
import Image from "next/image"

interface LiquidityPool {
  id: string
  tokenA: {
    symbol: string
    amount: number
    icon: string
  }
  tokenB: {
    symbol: string
    amount: number
    icon: string
  }
  totalLiquidity: number
  volume24h: number
  fees24h: number
  apr: number
  userShare: number
  status: "active" | "low_liquidity" | "high_volume"
}

const MOCK_POOLS: LiquidityPool[] = [
  {
    id: "1",
    tokenA: {
      symbol: "MUTB",
      amount: 125000,
      icon: "/images/mutable-token.png",
    },
    tokenB: {
      symbol: "SOL",
      amount: 850.5,
      icon: "/solana-logo.png",
    },
    totalLiquidity: 234000,
    volume24h: 45000,
    fees24h: 135,
    apr: 24.5,
    userShare: 2.3,
    status: "active",
  },
  {
    id: "2",
    tokenA: {
      symbol: "MUTB",
      amount: 89000,
      icon: "/images/mutable-token.png",
    },
    tokenB: {
      symbol: "USDC",
      amount: 2100,
      icon: "/placeholder.svg",
    },
    totalLiquidity: 156000,
    volume24h: 28000,
    fees24h: 84,
    apr: 18.2,
    userShare: 0,
    status: "high_volume",
  },
]

export function LiquidityPoolStatus() {
  const [pools] = useState<LiquidityPool[]>(MOCK_POOLS)

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toFixed(2)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "low_liquidity":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "high_volume":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active"
      case "low_liquidity":
        return "Low Liquidity"
      case "high_volume":
        return "High Volume"
      default:
        return "Unknown"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Droplets className="h-3 w-3" />
      case "low_liquidity":
        return <AlertTriangle className="h-3 w-3" />
      case "high_volume":
        return <TrendingUp className="h-3 w-3" />
      default:
        return <Droplets className="h-3 w-3" />
    }
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Droplets className="h-5 w-5 text-orange-600" />
          Liquidity Pools
        </CardTitle>
        <CardDescription className="text-gray-600">Manage your liquidity positions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {pools.map((pool) => (
          <div
            key={pool.id}
            className="p-4 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors bg-white"
          >
            {/* Pool Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center -space-x-2">
                  <Image
                    src={pool.tokenA.icon || "/placeholder.svg"}
                    alt={pool.tokenA.symbol}
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-white"
                  />
                  <Image
                    src={pool.tokenB.icon || "/placeholder.svg"}
                    alt={pool.tokenB.symbol}
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-white"
                  />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {pool.tokenA.symbol}/{pool.tokenB.symbol}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatNumber(pool.tokenA.amount)} {pool.tokenA.symbol} • {formatNumber(pool.tokenB.amount)}{" "}
                    {pool.tokenB.symbol}
                  </div>
                </div>
              </div>
              <Badge className={getStatusColor(pool.status)}>
                {getStatusIcon(pool.status)}
                <span className="ml-1">{getStatusLabel(pool.status)}</span>
              </Badge>
            </div>

            {/* Pool Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600">Total Liquidity</div>
                <div className="font-medium text-gray-900">${formatNumber(pool.totalLiquidity)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">24h Volume</div>
                <div className="font-medium text-gray-900">${formatNumber(pool.volume24h)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">24h Fees</div>
                <div className="font-medium text-green-600">${formatNumber(pool.fees24h)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">APR</div>
                <div className="font-medium text-orange-600">{pool.apr}%</div>
              </div>
            </div>

            {/* User Position */}
            {pool.userShare > 0 && (
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-700">Your Position</span>
                  <span className="text-sm font-medium text-orange-700">{pool.userShare}% of pool</span>
                </div>
                <Progress value={pool.userShare} className="h-2" />
                <div className="flex justify-between text-xs text-orange-600 mt-1">
                  <span>Share: {pool.userShare}%</span>
                  <span>Value: ${((pool.totalLiquidity * pool.userShare) / 100).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
                <Plus className="h-4 w-4 mr-1" />
                Add Liquidity
              </Button>
              {pool.userShare > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                >
                  <Minus className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        ))}

        {pools.length === 0 && (
          <div className="text-center py-8">
            <Droplets className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <div className="text-gray-500 mb-2">No liquidity pools found</div>
            <div className="text-sm text-gray-400">Create your first liquidity position to get started</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
