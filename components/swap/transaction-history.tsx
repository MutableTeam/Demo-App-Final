"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { History, ExternalLink, Search, ArrowUpDown, Clock } from "lucide-react"
import type { SwapResult } from "@/types/token-types"

interface TransactionHistoryProps {
  transactions: SwapResult[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.inputToken.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.outputToken.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.txId && tx.txId.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesFilter = filterType === "all" || tx.type === filterType

    return matchesSearch && matchesFilter
  })

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return a.timestamp - b.timestamp
      case "amount-high":
        return b.inputAmount - a.inputAmount
      case "amount-low":
        return a.inputAmount - b.inputAmount
      default: // newest
        return b.timestamp - a.timestamp
    }
  })

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getStatusColor = (type: string) => {
    switch (type) {
      case "swap":
        return "bg-green-100 text-green-800 border-green-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
          <History className="h-5 w-5 text-orange-600" />
          Transaction History
        </CardTitle>
        <CardDescription className="text-gray-600">View your recent swap transactions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-32 border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="swap">Swaps</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-32 border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="amount-high">Amount ↓</SelectItem>
              <SelectItem value="amount-low">Amount ↑</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transaction List */}
        <div className="space-y-3">
          {sortedTransactions.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">
                {transactions.length === 0
                  ? "Your transaction history will appear here after you make your first swap."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          ) : (
            sortedTransactions.map((tx, index) => (
              <Card key={index} className="bg-gray-50 border-gray-200 hover:border-orange-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4 text-gray-600" />
                        <Badge className={getStatusColor(tx.type)}>
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </Badge>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {tx.inputAmount} {tx.inputToken} → {tx.outputAmount.toFixed(4)} {tx.outputToken}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(tx.timestamp)}
                        </div>
                      </div>
                    </div>
                    {tx.txId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 hover:border-orange-500 bg-transparent"
                        onClick={() => {
                          const url = `https://explorer.solana.com/tx/${tx.txId}?cluster=devnet`
                          window.open(url, "_blank")
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary */}
        {transactions.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 text-center">
              Showing {sortedTransactions.length} of {transactions.length} transactions
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
