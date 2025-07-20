import type { TokenConfig, SwapPair } from "@/types/token-types"

// SOL token configuration
export const SOL_TOKEN: TokenConfig = {
  id: "solana",
  name: "Solana",
  symbol: "SOL",
  mintAddress: "So11111111111111111111111111111111111111112",
  decimals: 9,
  logoURI: "/solana-logo.png", // Fixed path - was missing leading slash
  isNative: true,
  coingeckoId: "solana",
}

// MUTB token configuration - Updated for your mainnet address for testing
export const MUTB_TOKEN: TokenConfig = {
  id: "mutb",
  name: "Mutable Token",
  symbol: "MUTB",
  mintAddress: "4EeyZSGjkiM4bBhMPWriyaR9mqdFBGtYKcYCAzTivQbW", // Your mainnet token for testing
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
