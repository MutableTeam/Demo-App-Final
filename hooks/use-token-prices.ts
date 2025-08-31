"use client"

import { useState, useEffect, useCallback } from "react"
import { getSOLPrice, getMUTBPrice, clearPriceCache } from "@/utils/price-service"

interface TokenPrice {
  price: number
  change24h: number
  timestamp: number
  fallback?: boolean
}

interface TokenPrices {
  SOL: TokenPrice | null
  MUTB: TokenPrice | null
}

export function useTokenPrices(enabled = true) {
  const [prices, setPrices] = useState<TokenPrices>({
    SOL: null,
    MUTB: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchPrices = useCallback(
    async (forceRefresh = false) => {
      if (!enabled) return

      console.log("[useTokenPrices] Fetching prices, forceRefresh:", forceRefresh)
      setLoading(true)
      setError(null)

      try {
        if (forceRefresh) {
          clearPriceCache()
        }

        const [solPrice, mutbPrice] = await Promise.all([getSOLPrice(), getMUTBPrice()])

        console.log("[useTokenPrices] Prices fetched:", {
          SOL: solPrice.price,
          MUTB: mutbPrice.price,
        })

        setPrices({
          SOL: solPrice,
          MUTB: mutbPrice,
        })
        setLastUpdated(new Date())
      } catch (err) {
        console.error("[useTokenPrices] Error fetching prices:", err)
        setError("Failed to fetch token prices")
      } finally {
        setLoading(false)
      }
    },
    [enabled],
  )

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchPrices()
    }
  }, [enabled, fetchPrices])

  // Auto-refresh every 30 seconds when enabled
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      console.log("[useTokenPrices] Auto-refreshing prices")
      fetchPrices()
    }, 30000)

    return () => clearInterval(interval)
  }, [enabled, fetchPrices])

  const refreshPrices = useCallback(() => {
    fetchPrices(true)
  }, [fetchPrices])

  return {
    prices,
    loading,
    error,
    lastUpdated,
    refreshPrices,
  }
}
