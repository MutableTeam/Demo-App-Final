import type { TokenConfig } from "@/types/token-types"
import { getCryptoPrice, getMUTBPrice, getSOLPrice, clearPriceCache, getCacheStatus } from "./crypto-price"

// Define TokenPrice interface since it might not be in types
interface TokenPrice {
  token: TokenConfig
  usdPrice: number
  lastUpdated: number
}

/**
 * Formats a token amount with appropriate decimal places
 */
export function formatTokenAmount(amount: number, token: TokenConfig): string {
  if (amount === 0) return "0"

  // For very small amounts, show more decimal places
  if (amount < 0.001) {
    return amount.toFixed(6)
  } else if (amount < 1) {
    return amount.toFixed(4)
  } else if (amount < 1000) {
    return amount.toFixed(2)
  } else {
    return amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }
}

/**
 * Gets the current price of a token in USD
 */
export async function getTokenPrice(token: TokenConfig): Promise<TokenPrice> {
  console.log(`[getTokenPrice] Getting price for ${token.symbol}`)
  console.log(`[getTokenPrice] Token config:`, {
    symbol: token.symbol,
    coingeckoId: token.coingeckoId,
    fixedPrice: token.fixedPrice,
    isNative: token.isNative,
  })

  let usdPrice: number

  try {
    // Clear any stale cache for debugging
    if (token.symbol === "SOL") {
      console.log(`[getTokenPrice] Cache status before SOL fetch:`, getCacheStatus())
    }

    if (token.fixedPrice) {
      // Use fixed price for tokens like MUTB
      usdPrice = token.fixedPrice
      console.log(`[getTokenPrice] Using fixed price for ${token.symbol}: $${usdPrice}`)
    } else if (token.symbol === "SOL") {
      // Force live price fetch for SOL - bypass any other logic
      console.log(`[getTokenPrice] Forcing live price fetch for SOL...`)
      usdPrice = await getSOLPrice()
      console.log(`[getTokenPrice] Live SOL price fetched: $${usdPrice}`)
    } else if (token.coingeckoId) {
      // Fetch live price from CoinGecko for other tokens
      console.log(`[getTokenPrice] Fetching live price for ${token.symbol} using coingeckoId: ${token.coingeckoId}`)
      usdPrice = await getCryptoPrice(token.coingeckoId)
    } else if (token.symbol === "MUTB") {
      // Special handling for MUTB
      usdPrice = getMUTBPrice()
      console.log(`[getTokenPrice] Using fixed MUTB price: $${usdPrice}`)
    } else {
      // No price source configured
      console.warn(`[getTokenPrice] No price source configured for ${token.symbol}`)
      usdPrice = 0
    }

    console.log(`[getTokenPrice] Final price for ${token.symbol}: $${usdPrice}`)
  } catch (error) {
    console.error(`[getTokenPrice] Error fetching price for ${token.symbol}:`, error)

    // Fallback prices - these should be avoided
    const fallbacks: Record<string, number> = {
      SOL: 20.5,
      MUTB: 0.01,
    }

    usdPrice = fallbacks[token.symbol] || 0
    console.warn(`[getTokenPrice] Using fallback price for ${token.symbol}: $${usdPrice}`)
  }

  return {
    token,
    usdPrice,
    lastUpdated: Date.now(),
  }
}

/**
 * Calculates the USD value of a token amount
 */
export function calculateUSDValue(amount: number, tokenPrice: TokenPrice): number {
  return amount * tokenPrice.usdPrice
}

/**
 * Formats a USD amount
 */
export function formatUSDAmount(amount: number): string {
  if (amount < 0.01) {
    return `$${amount.toFixed(4)}`
  }
  return `$${amount.toFixed(2)}`
}

/**
 * Gets the exchange rate between two tokens based on their USD prices
 */
export async function getExchangeRate(fromToken: TokenConfig, toToken: TokenConfig): Promise<number> {
  try {
    console.log(`[getExchangeRate] Calculating exchange rate from ${fromToken.symbol} to ${toToken.symbol}`)

    const [fromPrice, toPrice] = await Promise.all([getTokenPrice(fromToken), getTokenPrice(toToken)])

    if (toPrice.usdPrice === 0) {
      console.warn(`[getExchangeRate] ${toToken.symbol} price is 0, cannot calculate rate`)
      return 0
    }

    const rate = fromPrice.usdPrice / toPrice.usdPrice
    console.log(`[getExchangeRate] Exchange rate: 1 ${fromToken.symbol} = ${rate.toFixed(6)} ${toToken.symbol}`)

    return rate
  } catch (error) {
    console.error("[getExchangeRate] Error calculating exchange rate:", error)
    return 0
  }
}

/**
 * Validates if a token amount is valid
 */
export function isValidTokenAmount(amount: string): boolean {
  const num = Number.parseFloat(amount)
  return !isNaN(num) && num > 0 && isFinite(num)
}

/**
 * Converts a token amount to its smallest unit (based on decimals)
 */
export function toSmallestUnit(amount: number, decimals: number): bigint {
  const multiplier = Math.pow(10, decimals)
  return BigInt(Math.floor(amount * multiplier))
}

/**
 * Converts from smallest unit to human readable amount
 */
export function fromSmallestUnit(amount: bigint, decimals: number): number {
  const divisor = Math.pow(10, decimals)
  return Number(amount) / divisor
}

/**
 * Force refresh all token prices (clears cache)
 */
export function forceRefreshPrices(): void {
  console.log("[forceRefreshPrices] Forcing price refresh by clearing cache")
  clearPriceCache()
}
