/**
 * Utility functions for fetching cryptocurrency prices
 */

// Cache the price data to avoid excessive API calls
interface PriceCache {
  price: number
  timestamp: number
  usdPrice: number
}

const CACHE_DURATION = 60000 // 1 minute cache
const priceCache: Record<string, PriceCache> = {}

/**
 * Fetches the current price of a cryptocurrency in USD
 * @param coinId The CoinGecko ID of the cryptocurrency (e.g., 'solana')
 * @returns The current price in USD
 */
export async function getCryptoPrice(coinId: string): Promise<number> {
  // Check if we have a recent cached price
  const cachedData = priceCache[coinId]
  const now = Date.now()

  if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.usdPrice
  }

  try {
    // Fetch from CoinGecko API
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`, {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch price: ${response.status}`)
    }

    const data = await response.json()
    const usdPrice = data[coinId]?.usd

    if (!usdPrice) {
      throw new Error(`No price data found for ${coinId}`)
    }

    // Cache the result
    priceCache[coinId] = {
      price: usdPrice,
      timestamp: now,
      usdPrice: usdPrice,
    }

    return usdPrice
  } catch (error) {
    console.error("Error fetching crypto price:", error)

    // Return the cached price if available, otherwise a fallback value
    if (cachedData) {
      return cachedData.usdPrice
    }

    // Fallback values for common coins
    const fallbacks: Record<string, number> = {
      solana: 20.5,
      bitcoin: 35000,
      ethereum: 1800,
    }

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
 * Gets the MUTB price in USD (currently fixed at $0.10)
 */
export function getMUTBPrice(): number {
  return 0.1 // Fixed price of $0.10 per MUTB
}
