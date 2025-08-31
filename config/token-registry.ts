import type { TokenConfig, SwapPair } from "@/types/token-types"

// SOL token configuration - Ensure live price fetching
export const SOL_TOKEN: TokenConfig = {
  id: "solana",
  name: "Solana",
  symbol: "SOL",
  mintAddress: "So11111111111111111111111111111111111111112",
  decimals: 9,
  logoURI: "/solana-logo.png",
  isNative: true,
  coingeckoId: "solana", // This ensures live price fetching from CoinGecko
  // Explicitly NO fixedPrice - we want live prices
}

// MUTB token configuration
export const MUTB_TOKEN: TokenConfig = {
  id: "mutb",
  name: "Mutable Token",
  symbol: "MUTB",
  mintAddress: "4EeyZSGjkiM4bBhMPWriyaR9mqdFBGtYKcYCAzTivQbW",
  decimals: 9,
  logoURI: "/images/mutable-token.png",
  fixedPrice: 0.01, // Fixed at $0.01
}

// Default swap pair
export const DEFAULT_SWAP_PAIR: SwapPair = {
  inputToken: SOL_TOKEN,
  outputToken: MUTB_TOKEN,
  defaultDirection: "in-to-out",
}

// All supported tokens
export const SUPPORTED_TOKENS: TokenConfig[] = [SOL_TOKEN, MUTB_TOKEN]

// Get token by mint address
export function getTokenByMint(mintAddress: string): TokenConfig | undefined {
  return SUPPORTED_TOKENS.find((token) => token.mintAddress === mintAddress)
}

// Get token by symbol
export function getTokenBySymbol(symbol: string): TokenConfig | undefined {
  return SUPPORTED_TOKENS.find((token) => token.symbol === symbol)
}
