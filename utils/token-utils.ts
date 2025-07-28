import { type Connection, PublicKey } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import type { TokenConfig, TokenPrice } from "@/types/token-types"

// Cache for token prices
const tokenPriceCache = new Map<string, TokenPrice>()

// Function to fetch real-time crypto price from CoinGecko API
export async function getCryptoPrice(coinId: string): Promise<number> {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`)
    const data = await response.json()
    if (data && data[coinId] && data[coinId].usd) {
      return data[coinId].usd
    } else {
      throw new Error(`Could not fetch price for ${coinId}`)
    }
  } catch (error) {
    console.error("Error fetching crypto price:", error)
    throw error
  }
}

// Get token price (either from fixed price or from CoinGecko)
export async function getTokenPrice(token: TokenConfig): Promise<TokenPrice> {
  // Check cache first (if less than 5 minutes old)
  const cachedPrice = tokenPriceCache.get(token.id)
  const now = Date.now()
  if (cachedPrice && now - cachedPrice.lastUpdated < 5 * 60 * 1000) {
    return cachedPrice
  }

  let usdPrice: number

  // If token has fixed price, use that
  if (token.fixedPrice !== undefined) {
    usdPrice = token.fixedPrice
  }
  // Otherwise fetch from CoinGecko if coingeckoId is available
  else if (token.coingeckoId) {
    usdPrice = await getCryptoPrice(token.coingeckoId)
  }
  // Default fallback price
  else {
    usdPrice = 0
  }

  const tokenPrice: TokenPrice = {
    token,
    usdPrice,
    lastUpdated: now,
  }

  // Update cache
  tokenPriceCache.set(token.id, tokenPrice)

  return tokenPrice
}

// Get token balance for a wallet
export async function getTokenBalance(
  connection: Connection,
  walletAddress: string,
  token: TokenConfig,
): Promise<number> {
  try {
    const publicKey = new PublicKey(walletAddress)

    // For SOL (native token)
    if (token.isNative) {
      const balance = await connection.getBalance(publicKey)
      return balance / Math.pow(10, token.decimals)
    }

    // For SPL tokens
    const tokenMint = new PublicKey(token.mintAddress)
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    })

    const tokenAccount = tokenAccounts.value.find(
      (account) => account.account.data.parsed.info.mint === token.mintAddress,
    )

    if (tokenAccount) {
      return tokenAccount.account.data.parsed.info.tokenAmount.uiAmount
    }

    return 0
  } catch (error) {
    console.error(`Error fetching balance for ${token.symbol}:`, error)
    return 0
  }
}

// Format token amount based on token decimals and symbol
export function formatTokenAmount(amount: number, token: TokenConfig): string {
  // For SOL, show 4 decimal places
  if (token.symbol === "SOL") {
    return amount.toFixed(4)
  }

  // For other tokens, show 2 decimal places
  return amount.toFixed(2)
}

// Calculate USD value of token amount
export function calculateUsdValue(amount: number, tokenPrice: number): number {
  return amount * tokenPrice
}
