/**
 * Utility functions for fetching cryptocurrency prices
 */

// Cache the price data to avoid excessive API calls
interface PriceCache {
  price: number
  timestamp: number
  usdPrice: number
  lastUpdated?: number
}

const CACHE_DURATION = 30000 // 30 seconds cache
const priceCache: Record<string, PriceCache> = {}

/**
 * Fetches the current price of a cryptocurrency in USD using our API route
 * @param coinId The CoinGecko ID of the cryptocurrency (e.g., 'solana')
 * @returns The current price in USD
 */
export async function getCryptoPrice(coinId: string): Promise<number> {
  console.log(`[getCryptoPrice] Fetching price for ${coinId}`)

  // Check if we have a recent cached price
  const cachedData = priceCache[coinId]
  const now = Date.now()

  if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
    console.log(
      `[getCryptoPrice] Using cached price for ${coinId}: $${cachedData.usdPrice} (cached ${Math.floor((now - cachedData.timestamp) / 1000)}s ago)`,
    )
    return cachedData.usdPrice
  }

  try {
    console.log(`[getCryptoPrice] Making API call for ${coinId}...`)

    // Use our API route instead of direct CoinGecko call
    const response = await fetch(`/api/crypto-price?coinId=${coinId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store", // Don't cache the request
    })

    console.log(`[getCryptoPrice] API response status: ${response.status}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`API error: ${response.status} - ${errorData.error || "Unknown error"}`)
    }

    const data = await response.json()
    console.log(`[getCryptoPrice] API response data:`, data)

    const usdPrice = data.usdPrice
    const lastUpdated = data.lastUpdated

    if (!usdPrice) {
      throw new Error(`No price data found for ${coinId}`)
    }

    console.log(
      `[getCryptoPrice] Live price for ${coinId}: $${usdPrice} (updated: ${lastUpdated ? new Date(lastUpdated * 1000).toLocaleString() : "unknown"})`,
    )

    // Cache the result
    priceCache[coinId] = {
      price: usdPrice,
      timestamp: now,
      usdPrice: usdPrice,
      lastUpdated: lastUpdated,
    }

    return usdPrice
  } catch (error) {
    console.error(`[getCryptoPrice] Error fetching crypto price for ${coinId}:`, error)

    // Return the cached price if available, otherwise a fallback value
    if (cachedData) {
      console.log(`[getCryptoPrice] Using stale cached price for ${coinId}: $${cachedData.usdPrice}`)
      return cachedData.usdPrice
    }

    // Fallback values for common coins - these should be avoided
    const fallbacks: Record<string, number> = {
      solana: 20.5,
      bitcoin: 35000,
      ethereum: 1800,
    }

    console.warn(`[getCryptoPrice] Using fallback price for ${coinId}: $${fallbacks[coinId] || 0}`)
    return fallbacks[coinId] || 0
  }
}

/**
 * Calculates the exchange rate between two cryptocurrencies based on their USD prices
 * @param fromCoinPrice The USD price of the source cryptocurrency
 * @param toCoinPrice The USD price of the destination cryptocurrency
 * @returns The exchange rate (how many of the destination coin per 1 of the source coin)
 */
export function calculateExchangeRate(fromCoinPrice: number, toCoinPrice: number): number {
  if (!toCoinPrice) return 0
  return fromCoinPrice / toCoinPrice
}

/**
 * Gets the MUTB price in USD (currently fixed at $0.01)
 */
export function getMUTBPrice(): number {
  return 0.01 // Fixed price of $0.01 per MUTB
}

/**
 * Gets the live SOL price specifically
 */
export async function getSOLPrice(): Promise<number> {
  console.log(`[getSOLPrice] Fetching live SOL price...`)
  return getCryptoPrice("solana")
}

/**
 * Clears the price cache (useful for testing or forcing fresh data)
 */
export function clearPriceCache(): void {
  Object.keys(priceCache).forEach((key) => delete priceCache[key])
  console.log("[clearPriceCache] Price cache cleared")
}

/**
 * Gets cache status for debugging
 */
export function getCacheStatus(): Record<string, { price: number; age: number; lastUpdated?: number }> {
  const now = Date.now()
  const status: Record<string, { price: number; age: number; lastUpdated?: number }> = {}

  Object.entries(priceCache).forEach(([key, data]) => {
    status[key] = {
      price: data.usdPrice,
      age: Math.floor((now - data.timestamp) / 1000),
      lastUpdated: data.lastUpdated,
    }
  })

  return status
}
