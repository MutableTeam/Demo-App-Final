import { type Connection, type PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js"

// Jupiter V6 API types
export interface JupiterQuoteResponse {
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  otherAmountThreshold: string
  swapMode: string
  slippageBps: number
  platformFee: {
    amount: string
    feeBps: number
  }
  priceImpactPct: string
  routePlan: Array<{
    swapInfo: {
      ammKey: string
      label: string
      inputMint: string
      outputMint: string
      inAmount: string
      outAmount: string
      feeAmount: string
      feeMint: string
    }
    percent: number
  }>
  contextSlot: number
  timeTaken: number
}

export interface JupiterSwapResponse {
  swapTransaction: string
  lastValidBlockHeight: number
  prioritizationFeeLamports: number
}

export interface JupiterSwapResult {
  txid: string
  outputAmount: string
  fee?: number
}

// Jupiter API wrapper
export class JupiterApiClient {
  private connection: Connection
  private apiUrl = "https://quote-api.jup.ag/v6"
  private isTestnet = true // Set to true for devnet/testnet

  constructor(connection: Connection) {
    this.connection = connection

    // Check if we're on testnet/devnet by looking at the connection endpoint
    const endpoint = connection.rpcEndpoint
    this.isTestnet = endpoint.includes("devnet") || endpoint.includes("testnet")

    console.log(`Jupiter API client initialized for ${this.isTestnet ? "testnet" : "mainnet"}`)
  }

  // Check if a token is tradable on Jupiter
  async isTokenTradable(inputMint: string, outputMint: string): Promise<boolean> {
    try {
      // Try to get a quote with a small amount
      const amount = 10000000 // 0.01 SOL in lamports

      // Build the API URL with query parameters
      const queryParams = new URLSearchParams({
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps: "50",
        onlyDirectRoutes: "false",
      })

      const response = await fetch(`${this.apiUrl}/quote?${queryParams}`)

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      return !!(data && data.routePlan && data.routePlan.length > 0)
    } catch (error) {
      console.error("Error checking if token is tradable:", error)
      return false
    }
  }

  // Get a quote for a token swap
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps = 50, // 0.5% default slippage
    onlyDirectRoutes = false,
  ): Promise<JupiterQuoteResponse> {
    // Build the API URL with query parameters
    const queryParams = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amount.toString(),
      slippageBps: slippageBps.toString(),
      onlyDirectRoutes: onlyDirectRoutes.toString(),
    })

    console.log(`Fetching Jupiter quote: ${this.apiUrl}/quote?${queryParams}`)
    const response = await fetch(`${this.apiUrl}/quote?${queryParams}`)

    if (!response.ok) {
      const errorText = await response.text()
      let errorJson
      try {
        errorJson = JSON.parse(errorText)
      } catch (e) {
        errorJson = { error: errorText }
      }

      throw new Error(`Jupiter API error: ${response.status} - ${errorText}`)
    }

    const quoteResponse = (await response.json()) as JupiterQuoteResponse
    console.log("Jupiter quote received:", quoteResponse)
    return quoteResponse
  }

  // Get a swap transaction
  async getSwapTransaction(quoteResponse: JupiterQuoteResponse, userPublicKey: string): Promise<JupiterSwapResponse> {
    console.log("Requesting swap transaction from Jupiter")
    const response = await fetch(`${this.apiUrl}/swap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey,
        wrapAndUnwrapSol: true, // Automatically wrap/unwrap SOL
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Jupiter swap API error:", errorText)
      throw new Error(`Jupiter swap API error: ${errorText}`)
    }

    const swapResponse = (await response.json()) as JupiterSwapResponse
    console.log("Jupiter swap transaction received")
    return swapResponse
  }

  // Execute a swap transaction
  async executeSwap(
    swapTransaction: string,
    walletPublicKey: PublicKey,
    signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>,
    quoteResponse: JupiterQuoteResponse, // Added quoteResponse as parameter
  ): Promise<JupiterSwapResult> {
    console.log("Executing Jupiter swap transaction")
    // Real implementation for Jupiter swap execution
    // Deserialize the transaction
    const transactionBuf = Buffer.from(swapTransaction, "base64")

    // Check if it's a legacy or versioned transaction
    const isVersionedTransaction = transactionBuf[0] === 0x80

    let transaction
    if (isVersionedTransaction) {
      transaction = VersionedTransaction.deserialize(transactionBuf)
    } else {
      transaction = Transaction.from(transactionBuf)
    }

    // Sign the transaction
    console.log("Signing transaction")
    const signedTransaction = await signTransaction(transaction)

    // Serialize and send the transaction
    let rawTransaction
    if (isVersionedTransaction) {
      rawTransaction = (signedTransaction as VersionedTransaction).serialize()
    } else {
      rawTransaction = (signedTransaction as Transaction).serialize()
    }

    // Send the transaction
    console.log("Sending transaction to blockchain")
    const txid = await this.connection.sendRawTransaction(rawTransaction, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    })
    console.log("Transaction sent, ID:", txid)

    // Wait for confirmation
    console.log("Waiting for confirmation")
    const confirmation = await this.connection.confirmTransaction(txid, "confirmed")

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`)
    }

    console.log("Transaction confirmed successfully")
    return {
      txid,
      outputAmount: quoteResponse.outAmount,
    }
  }

  // Create a liquidity pool for a token (simplified mock for demonstration)
  async createLiquidityPool(
    tokenMint: string,
    solAmount: number,
    tokenAmount: number,
    walletPublicKey: PublicKey,
    signTransaction: (transaction: Transaction) => Promise<Transaction>,
  ): Promise<string> {
    // This is a simplified mock function
    // In a real implementation, you would:
    // 1. Create a pool on a DEX like Raydium or Orca
    // 2. Add initial liquidity

    console.log(`Creating liquidity pool for token ${tokenMint}`)
    console.log(`Adding ${solAmount} SOL and ${tokenAmount} tokens as initial liquidity`)

    // For demonstration purposes, we'll return a mock transaction ID
    return "mock_pool_creation_tx_" + Math.random().toString(36).substring(2, 15)
  }
}

// Helper function to create a Jupiter API client
export function createJupiterApiClient(connection: Connection): JupiterApiClient {
  return new JupiterApiClient(connection)
}
