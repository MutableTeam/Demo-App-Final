"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import type { TokenConfig } from "@/types/token-types"
import { getTokenPrice } from "@/utils/token-utils"
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

interface MarketOverviewProps {
  tokens: TokenConfig[]
  recentTransactions: SwapResult[]
}

export function MarketOverview({ tokens, recentTransactions }: MarketOverviewProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoading(true)
      try {
        const prices: Record<string, number> = {}

        for (const token of tokens) {
          const price = await getTokenPrice(token)
          prices[token.id] = price.usdPrice
        }

        setTokenPrices(prices)
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

  if (isCyberpunk) {
    return (
      <div className="space-y-4">
        <CyberCard className="p-4">
          <CyberTitle className="mb-2 font-mono">MARKET OVERVIEW</CyberTitle>
          <div className="space-y-3">
            {tokens.map((token) => (
              <div key={token.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Image
                    src={token.logoURI || "/placeholder.svg"}
                    alt={token.symbol}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <span className="font-medium text-cyan-200">{token.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-cyan-100">
                    {isLoading ? (
                      <span className="flex items-center gap-1 text-cyan-300">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      `$${tokenPrices[token.id]?.toFixed(2) || "..."} USD`
                    )}
                  </div>
                  <div className="text-sm text-green-400">
                    {token.fixedPrice !== undefined ? "Fixed Price" : "Live Price"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CyberCard>

        <CyberCard className="p-4">
          <CyberTitle className="mb-2 font-mono">RECENT TRADES</CyberTitle>
          <div className="space-y-2">
            {recentTransactions.length > 0 ? (
              recentTransactions
                .filter((tx) => tx.type === "swap")
                .slice(0, 4)
                .map((tx, index) => (
                  <div key={index} className="flex justify-between items-center text-sm text-cyan-200">
                    <span>
                      {tx.inputAmount.toFixed(2)} {tx.inputToken} → {tx.outputAmount.toFixed(2)} {tx.outputToken}
                    </span>
                    <span className="text-cyan-400">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))
            ) : (
              <div className="text-center py-2 text-cyan-400">
                <p>No recent trades</p>
              </div>
            )}
          </div>
        </CyberCard>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc]">
        <h3 className="font-bold mb-2 font-mono">MARKET OVERVIEW</h3>
        <div className="space-y-3">
          {tokens.map((token) => (
            <div key={token.id} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Image
                  src={token.logoURI || "/placeholder.svg"}
                  alt={token.symbol}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="font-medium">{token.name}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {isLoading ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    `$${tokenPrices[token.id]?.toFixed(2) || "..."} USD`
                  )}
                </div>
                <div className="text-sm text-green-600">
                  {token.fixedPrice !== undefined ? "Fixed Price" : "Live Price"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc]">
        <h3 className="font-bold mb-2 font-mono">RECENT TRADES</h3>
        <div className="space-y-2">
          {recentTransactions.length > 0 ? (
            recentTransactions
              .filter((tx) => tx.type === "swap")
              .slice(0, 4)
              .map((tx, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span>
                    {tx.inputAmount.toFixed(2)} {tx.inputToken} → {tx.outputAmount.toFixed(2)} {tx.outputToken}
                  </span>
                  <span className="text-gray-500">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                </div>
              ))
          ) : (
            <div className="text-center py-2 text-gray-500">
              <p>No recent trades</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
