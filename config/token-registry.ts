import type { TokenConfig, SwapPair } from "@/types/token-types"

// SOL token configuration
export const SOL_TOKEN: TokenConfig = {
  id: "solana",
  name: "Solana",
  symbol: "SOL",
  mintAddress: "So11111111111111111111111111111111111111112",
  decimals: 9,
  logoURI: "/solana-logo.png",
  isNative: true,
  coingeckoId: "solana",
}

// MUTB token configuration
export const MUTB_TOKEN: TokenConfig = {
  id: "mutb",
  name: "Mutable Token",
  symbol: "MUTB",
  mintAddress: "BKc4wfcYXm8Eky71EoeAmKuao7zY1dhiJgYaQUAEVGyG",
  decimals: 9,
  logoURI: "/images/mutable-token.png",
  fixedPrice: 0.1, // Fixed at $0.10
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
