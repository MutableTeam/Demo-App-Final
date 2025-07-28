import type { TokenConfig } from "@/types/token-types"

// Cache for token prices to avoid excessive API calls
const priceCache = new Map<string, { price: number; timestamp: number }>()
const CACHE_DURATION = 60 * 1000 // 1 minute

export function formatTokenAmount(amount: number, token: TokenConfig): string {
  if (amount === null || isNaN(amount)) return "0.00"
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: token.decimals,
  })
}

export async function getTokenPrice(token: TokenConfig): Promise<{ token: TokenConfig; usdPrice: number | null }> {
  const cacheKey = token.symbol
  const cached = priceCache.get(cacheKey)

  // Return cached price if it's recent
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { token, usdPrice: cached.price }
  }

  // For SOL, fetch from CoinGecko API
  if (token.symbol === "SOL") {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd")
      if (!response.ok) {
        throw new Error(`Failed to fetch SOL price: ${response.statusText}`)
      }
      const data = await response.json()
      const price = data.solana.usd
      priceCache.set(cacheKey, { price, timestamp: Date.now() })
      return { token, usdPrice: price }
    } catch (error) {
      console.error("Error fetching SOL price:", error)
      // Fallback to a default price if API fails
      return { token, usdPrice: 150.0 }
    }
  }

  // For other tokens, use mock price from config
  const mockPrice = token.mockPrice || 0
  priceCache.set(cacheKey, { price: mockPrice, timestamp: Date.now() })
  return { token, usdPrice: mockPrice }
}
