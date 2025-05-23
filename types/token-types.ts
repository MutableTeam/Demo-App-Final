export interface TokenConfig {
  id: string
  name: string
  symbol: string
  mintAddress: string
  decimals: number
  logoURI: string
  isNative?: boolean
  fixedPrice?: number // For tokens with fixed prices
  coingeckoId?: string // For tokens with live prices from CoinGecko
}

export interface SwapPair {
  inputToken: TokenConfig
  outputToken: TokenConfig
  defaultDirection: "in-to-out" | "out-to-in"
}

export interface TokenBalance {
  token: TokenConfig
  balance: number
  usdValue?: number
}

export interface SwapResult {
  type: "swap" | "pool"
  timestamp: number
  inputAmount: number
  inputToken: string
  outputAmount: number
  outputToken: string
  txId: string
}

export interface TokenPrice {
  token: TokenConfig
  usdPrice: number
  lastUpdated: number
}
