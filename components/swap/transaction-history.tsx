"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { History, Search, ExternalLink, ArrowUpDown, Clock } from "lucide-react"
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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const truncateHash = (hash: string) => {
    if (!hash) return "N/A"
    return `${hash.slice(0, 6)}...${hash.slice(-6)}`
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <History className="h-5 w-5 text-orange-600" />
            Transaction History
          </CardTitle>
          <CardDescription className="text-gray-600">View your recent swaps and transactions</CardDescription>
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
              <SelectTrigger className="w-full sm:w-40 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="swap">Swaps</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="amount-high">Amount: High to Low</SelectItem>
                <SelectItem value="amount-low">Amount: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transaction List */}
          <div className="space-y-3">
            {sortedTransactions.length > 0 ? (
              sortedTransactions.map((tx, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-gray-900">
                          {tx.inputAmount.toFixed(4)} {tx.inputToken} → {tx.outputAmount.toFixed(4)} {tx.outputToken}
                        </span>
                        <Badge className={getStatusColor(tx.status)}>{tx.status || "Completed"}</Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(tx.timestamp)}</span>
                        </div>
                        {tx.txId && (
                          <div className="flex items-center gap-1">
                            <span>TX:</span>
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-orange-600 hover:text-orange-700 text-sm"
                              onClick={() => {
                                const explorerUrl = `https://explorer.solana.com/tx/${tx.txId}?cluster=devnet`
                                window.open(explorerUrl, "_blank")
                              }}
                            >
                              {truncateHash(tx.txId)}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{tx.type === "swap" ? "Swap" : tx.type}</div>
                      {tx.fee && <div className="text-xs text-gray-500">Fee: {tx.fee} SOL</div>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-600">
                  {searchQuery || filterType !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Your transaction history will appear here after you make your first swap"}
                </p>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          {transactions.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{transactions.length}</div>
                  <div className="text-sm text-gray-600">Total Transactions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {transactions.filter((tx) => tx.type === "swap").length}
                  </div>
                  <div className="text-sm text-gray-600">Swaps</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {transactions.filter((tx) => tx.status === "confirmed" || !tx.status).length}
                  </div>
                  <div className="text-sm text-gray-600">Successful</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {transactions.reduce((sum, tx) => sum + tx.inputAmount, 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Volume</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
