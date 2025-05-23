"use client"

import { ExternalLink } from "lucide-react"
import type { SwapResult } from "@/types/token-types"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"

// Cyberpunk styled components
const scanline = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
`

const CyberCard = styled.div`
  background: rgba(10, 10, 40, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
  }
`

const CyberTitle = styled.h3`
  color: rgba(0, 255, 255, 0.9);
  font-family: monospace;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
  }
`

const CyberTxCard = styled.div`
  background: rgba(16, 16, 48, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba(0, 255, 255, 0.8);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  }
`

const CyberLink = styled.a`
  color: rgba(0, 150, 255, 0.9);
  text-decoration: none;
  position: relative;
  
  &:hover {
    color: rgba(0, 200, 255, 1);
    text-shadow: 0 0 5px rgba(0, 200, 255, 0.5);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 200, 255, 0.8), transparent);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover::after {
    transform: scaleX(1);
  }
`

interface TransactionHistoryProps {
  transactions: SwapResult[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

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

  if (isCyberpunk) {
    return (
      <div className="space-y-4">
        <CyberCard className="p-4">
          <CyberTitle className="mb-4 font-mono">TRANSACTION HISTORY</CyberTitle>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx, index) => (
                <CyberTxCard key={index} className="p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-cyan-200">{tx.type === "swap" ? "Swap" : "Pool Creation"}</span>
                    <span className="text-xs text-cyan-400">{formatDate(tx.timestamp)}</span>
                  </div>
                  <div className="text-sm mb-1 text-cyan-100">
                    {tx.inputAmount.toFixed(2)} {tx.inputToken} {tx.type === "swap" ? "→" : "+"}{" "}
                    {tx.outputAmount.toFixed(2)} {tx.outputToken}
                  </div>
                  <div className="flex items-center text-xs text-cyan-400">
                    <span>TX: {formatTxId(tx.txId)}</span>
                    <CyberLink
                      href={`https://explorer.solana.com/tx/${tx.txId}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 flex items-center"
                    >
                      View <ExternalLink className="h-3 w-3 ml-1" />
                    </CyberLink>
                  </div>
                </CyberTxCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-cyan-400">
              <p>No transaction history yet.</p>
              <p className="text-sm mt-2">Your transactions will appear here after you make a swap or create a pool.</p>
            </div>
          )}
        </CyberCard>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc]">
        <h3 className="font-bold mb-4 font-mono">TRANSACTION HISTORY</h3>
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx, index) => (
              <div key={index} className="p-3 bg-white rounded-md border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{tx.type === "swap" ? "Swap" : "Pool Creation"}</span>
                  <span className="text-xs text-gray-500">{formatDate(tx.timestamp)}</span>
                </div>
                <div className="text-sm mb-1">
                  {tx.inputAmount.toFixed(2)} {tx.inputToken} {tx.type === "swap" ? "→" : "+"}{" "}
                  {tx.outputAmount.toFixed(2)} {tx.outputToken}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <span>TX: {formatTxId(tx.txId)}</span>
                  <a
                    href={`https://explorer.solana.com/tx/${tx.txId}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-500 hover:underline flex items-center"
                  >
                    View <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>No transaction history yet.</p>
            <p className="text-sm mt-2">Your transactions will appear here after you make a swap or create a pool.</p>
          </div>
        )}
      </div>
    </div>
  )
}
