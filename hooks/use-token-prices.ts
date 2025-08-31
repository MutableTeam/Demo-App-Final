"use client"

import { useState, useEffect, useCallback } from "react"
import { getSolanaPrice, getMutableTokenPrice, clearPriceCache } from "@/utils/price-service"

interface TokenPrice {
  price: number
  change24h: number
  timestamp: number
  source: string
  fallback?: boolean
}

interface TokenPrices {
  SOL: TokenPrice | null
  MUTB: TokenPrice | null
}

interface UseTokenPricesReturn {
  prices: TokenPrices
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  refreshPrices: () => Promise<void>
}

export function useTokenPrices(enabled = true): UseTokenPricesReturn {
  const [prices, setPrices] = useState<TokenPrices>({
    SOL: null,
    MUTB: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchPrices = useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const [solPrice, mutbPrice] = await Promise.all([getSolanaPrice(), getMutableTokenPrice()])

      setPrices({
        SOL: solPrice,
        MUTB: mutbPrice,
      })

      setLastUpdated(new Date())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch prices"
      setError(errorMessage)
      console.error("Error fetching token prices:", err)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  const refreshPrices = useCallback(async () => {
    clearPriceCache()
    await fetchPrices()
  }, [fetchPrices])

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchPrices()
    }
  }, [enabled, fetchPrices])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [enabled, fetchPrices])

  return {
    prices,
    loading,
    error,
    lastUpdated,
    refreshPrices,
  }
}
