export interface TokenConfig {
  id: string
  name: string
  symbol: string
  mintAddress: string
  decimals: number
  logoURI: string
  isNative?: boolean
  coingeckoId?: string
  fixedPrice?: number
  mockPrice?: number
}

export interface TokenPrice {
  token: TokenConfig
  usdPrice: number
  lastUpdated: number
}

export interface SwapPair {
  inputToken: TokenConfig
  outputToken: TokenConfig
  defaultDirection: "in-to-out" | "out-to-in"
}

export interface SwapTransaction {
  id: string
  inputToken: TokenConfig
  outputToken: TokenConfig
  inputAmount: number
  outputAmount: number
  exchangeRate: number
  timestamp: number
  txId: string
  status: "pending" | "completed" | "failed"
}

export interface TokenBalance {
  token: TokenConfig
  balance: number
  usdValue: number
}
