"use client"

import { ExternalLink } from "lucide-react"
import type { SwapResult } from "@/types/token-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TransactionHistoryProps {
  transactions: SwapResult[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // Format transaction ID to shortened form
  const formatTxId = (txId: string) => {
    if (txId.length <= 12) return txId
    return `${txId.substring(0, 6)}...${txId.substring(txId.length - 6)}`
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="font-mono text-gray-900">TRANSACTION HISTORY</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx, index) => (
                <Card
                  key={index}
                  className="bg-gray-50 border border-gray-200 hover:border-orange-300 transition-colors"
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-900">{tx.type === "swap" ? "Swap" : "Pool Creation"}</span>
                      <span className="text-xs text-gray-500">{formatDate(tx.timestamp)}</span>
                    </div>
                    <div className="text-sm mb-1 text-gray-700">
                      {tx.inputAmount.toFixed(2)} {tx.inputToken} {tx.type === "swap" ? "→" : "+"}{" "}
                      {tx.outputAmount.toFixed(2)} {tx.outputToken}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>TX: {formatTxId(tx.txId)}</span>
                      <a
                        href={`https://explorer.solana.com/tx/${tx.txId}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-orange-600 hover:text-orange-700 hover:underline flex items-center transition-colors"
                      >
                        View <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No transaction history yet.</p>
              <p className="text-sm mt-2">Your transactions will appear here after you make a swap or create a pool.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
