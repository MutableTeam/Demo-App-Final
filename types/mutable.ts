// Token types
export interface GameToken {
  id: string
  name: string
  symbol: string
  icon: string
  description: string
  gameId: string
  gameName: string
  gameIcon: string
  conversionRate: number // Conversion rate to MUTB
}

export interface TradeOrder {
  id: string
  sourceToken: GameToken
  destinationToken: GameToken
  sourceAmount: number
  destinationAmount: number
  mutbFee: number
  status: "pending" | "completed" | "failed"
  timestamp: number
  txSignature?: string
}

export interface MutbBalance {
  available: number
  staked: number
}

export interface FeeDistribution {
  sourceGame: number
  destinationGame: number
  stakers: number
}
