"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, ExternalLink, Search, Filter, TrendingUp, TrendingDown } from "lucide-react"

interface Transaction {
  id: string
  type: "swap" | "add_liquidity" | "remove_liquidity"
  tokenA: string
  tokenB: string
  amountA: number
  amountB: number
  timestamp: Date
  txHash: string
  status: "completed" | "pending" | "failed"
  fee: number
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    type: "swap",
    tokenA: "SOL",
    tokenB: "MUTB",
    amountA: 1.5,
    amountB: 3420.5,
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    txHash: "5KJp7z2X9vQ8mR3nF1wY6tE4sA7bC9dG2hL8pM4qN6rT3uV1xW",
    status: "completed",
    fee: 0.0025,
  },
  {
    id: "2",
    type: "add_liquidity",
    tokenA: "MUTB",
    tokenB: "USDC",
    amountA: 1000,
    amountB: 23.4,
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    txHash: "8NmQ4y7X2vR9pS6nG3wZ8tF5sB9cD1eH4iL0pN7qO8rU5vW2xY",
    status: "completed",
    fee: 0.005,
  },
  {
    id: "3",
    type: "swap",
    tokenA: "USDC",
    tokenB: "SOL",
    amountA: 50,
    amountB: 0.32,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    txHash: "2HkL9z5X1vP7mQ4nE2wX7tD6sC8bA0dF3gI9pK6qM5rS4uT8xV",
    status: "pending",
    fee: 0.0015,
  },
]

export function TransactionHistory() {
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS)
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter = filter === "all" || tx.type === filter
    const matchesSearch =
      tx.tokenA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.tokenB.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.txHash.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (minutes < 60) {
      return `${minutes}m ago`
    }
    return `${hours}h ago`
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "swap":
        return <ArrowUpDown className="h-4 w-4" />
      case "add_liquidity":
        return <TrendingUp className="h-4 w-4" />
      case "remove_liquidity":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <ArrowUpDown className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "swap":
        return "Swap"
      case "add_liquidity":
        return "Add Liquidity"
      case "remove_liquidity":
        return "Remove Liquidity"
      default:
        return "Unknown"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900">Transaction History</CardTitle>
        <CardDescription className="text-gray-600">Your recent trading activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-300"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-white border-gray-300">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="swap">Swaps</SelectItem>
              <SelectItem value="add_liquidity">Add Liquidity</SelectItem>
              <SelectItem value="remove_liquidity">Remove Liquidity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transaction List */}
        <div className="space-y-3">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors bg-white"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-orange-100 text-orange-600">{getTypeIcon(tx.type)}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{getTypeLabel(tx.type)}</span>
                    <Badge className={getStatusColor(tx.status)}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {tx.amountA} {tx.tokenA} → {tx.amountB} {tx.tokenB}
                  </div>
                  <div className="text-xs text-gray-500">{formatTime(tx.timestamp)}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">Fee: {tx.fee} SOL</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-1"
                  onClick={() => window.open(`https://solscan.io/tx/${tx.txHash}`, "_blank")}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">No transactions found</div>
            <div className="text-sm text-gray-400">Try adjusting your search or filter criteria</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
