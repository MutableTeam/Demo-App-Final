interface PriceData {
  price: number
  change24h: number
  timestamp: number
  source: string
  fallback?: boolean
}

interface CachedPrice extends PriceData {
  cachedAt: number
}

// Cache for price data (30 seconds)
const CACHE_DURATION = 30 * 1000
const priceCache = new Map<string, CachedPrice>()

export async function getSolanaPrice(): Promise<PriceData> {
  const cacheKey = "SOL"
  const cached = priceCache.get(cacheKey)

  // Return cached data if still valid
  if (cached && Date.now() - cached.cachedAt < CACHE_DURATION) {
    return {
      price: cached.price,
      change24h: cached.change24h,
      timestamp: cached.timestamp,
      source: cached.source,
      fallback: cached.fallback,
    }
  }

  try {
    const response = await fetch("/api/solana-price")

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    const priceData: PriceData = {
      price: data.price,
      change24h: data.change24h,
      timestamp: data.timestamp,
      source: data.source,
      fallback: data.source === "fallback",
    }

    // Cache the result
    priceCache.set(cacheKey, {
      ...priceData,
      cachedAt: Date.now(),
    })

    return priceData
  } catch (error) {
    console.error("Error in getSolanaPrice:", error)

    // Return fallback data
    const fallbackData: PriceData = {
      price: 98.45,
      change24h: 0,
      timestamp: Date.now(),
      source: "fallback",
      fallback: true,
    }

    priceCache.set(cacheKey, {
      ...fallbackData,
      cachedAt: Date.now(),
    })

    return fallbackData
  }
}

export async function getMutableTokenPrice(): Promise<PriceData> {
  // MUTB has a fixed price for now
  return {
    price: 0.12,
    change24h: 0,
    timestamp: Date.now(),
    source: "fixed",
  }
}

export function clearPriceCache(): void {
  priceCache.clear()
}
