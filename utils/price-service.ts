interface TokenPrice {
  price: number
  change24h: number
  timestamp: number
  fallback?: boolean
}

// Simple cache to avoid excessive API calls
const priceCache = new Map<string, { data: TokenPrice; expiry: number }>()
const CACHE_DURATION = 30 * 1000 // 30 seconds

export async function getSOLPrice(): Promise<TokenPrice> {
  const cacheKey = "SOL"
  const now = Date.now()

  // Check cache first
  const cached = priceCache.get(cacheKey)
  if (cached && now < cached.expiry) {
    console.log("[PriceService] Using cached SOL price:", cached.data.price)
    return cached.data
  }

  try {
    console.log("[PriceService] Fetching fresh SOL price...")

    const response = await fetch("/api/solana-price", {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`API response not ok: ${response.status}`)
    }

    const data: TokenPrice = await response.json()
    console.log("[PriceService] Fresh SOL price received:", data.price)

    // Cache the result
    priceCache.set(cacheKey, {
      data,
      expiry: now + CACHE_DURATION,
    })

    return data
  } catch (error) {
    console.error("[PriceService] Error fetching SOL price:", error)

    // Return cached data if available, even if expired
    if (cached) {
      console.log("[PriceService] Using stale cached SOL price:", cached.data.price)
      return cached.data
    }

    // Final fallback
    return {
      price: 150.0,
      change24h: 0,
      timestamp: now,
      fallback: true,
    }
  }
}

export function getMUTBPrice(): TokenPrice {
  return {
    price: 0.01,
    change24h: 0,
    timestamp: Date.now(),
  }
}

export function clearPriceCache(): void {
  priceCache.clear()
  console.log("[PriceService] Price cache cleared")
}
