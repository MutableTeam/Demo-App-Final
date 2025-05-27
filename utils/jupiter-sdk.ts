import {
  type Connection,
  type PublicKey,
  Transaction,
  VersionedTransaction,
  SendTransactionError,
} from "@solana/web3.js"
import { Buffer } from "buffer"

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
  private isTestnet = true

  constructor(connection: Connection) {
    this.connection = connection

    // Check if we're on testnet/devnet by looking at the connection endpoint
    const endpoint = connection.rpcEndpoint
    this.isTestnet = endpoint.includes("devnet") || endpoint.includes("testnet")

    console.log(`🚀 Jupiter API client initialized`)
    console.log(`📡 Network: ${this.isTestnet ? "DEVNET" : "MAINNET"}`)
    console.log(`🔗 RPC endpoint: ${endpoint}`)
    console.log(`🌐 Jupiter API: ${this.apiUrl}`)
  }

  // Check if a token is tradable on Jupiter
  async isTokenTradable(inputMint: string, outputMint: string): Promise<boolean> {
    try {
      // Try multiple amounts to be thorough
      const testAmounts = [
        1000000000, // 1 token
        100000000, // 0.1 token
        10000000, // 0.01 token
      ]

      console.log(`🔍 Testing tradability: ${inputMint} -> ${outputMint}`)

      for (const amount of testAmounts) {
        const queryParams = new URLSearchParams({
          inputMint,
          outputMint,
          amount: amount.toString(),
          slippageBps: "100", // 1% slippage for testing
          onlyDirectRoutes: "false",
        })

        const url = `${this.apiUrl}/quote?${queryParams}`
        console.log(`📞 Testing with amount ${amount}: ${url}`)

        try {
          const response = await fetch(url)

          if (response.ok) {
            const data = await response.json()
            if (data && data.routePlan && data.routePlan.length > 0) {
              console.log(`✅ Token is tradable! Found ${data.routePlan.length} routes`)
              console.log(
                `📊 Route details:`,
                data.routePlan.map((r) => r.swapInfo.label),
              )
              return true
            }
          } else {
            const errorText = await response.text()
            console.log(`❌ Amount ${amount} failed:`, response.status, errorText)
          }
        } catch (error) {
          console.log(`❌ Amount ${amount} error:`, error)
        }
      }

      console.log(`❌ Token not tradable with any test amount`)
      return false
    } catch (error) {
      console.error("❌ Error checking if token is tradable:", error)
      return false
    }
  }

  // Check what tokens are available on Jupiter
  async getAvailableTokens(): Promise<any[]> {
    try {
      console.log(`🔍 Fetching available tokens from Jupiter...`)
      const response = await fetch(`${this.apiUrl}/tokens`)

      if (!response.ok) {
        throw new Error(`Failed to fetch tokens: ${response.status}`)
      }

      const tokens = await response.json()
      console.log(`📋 Found ${tokens.length} tokens available on Jupiter`)

      // Check if our MUTB token is in the list
      const mutbToken = tokens.find((token: any) => token.address === "4EeyZSGjkiM4bBhMPWriyaR9mqdFBGtYKcYCAzTivQbW")

      if (mutbToken) {
        console.log(`✅ MUTB token found in Jupiter token list:`, mutbToken)
      } else {
        console.log(`❌ MUTB token NOT found in Jupiter token list`)
        console.log(`🔍 Searching for similar tokens...`)
        const similarTokens = tokens.filter(
          (token: any) => token.symbol?.toLowerCase().includes("mutb") || token.name?.toLowerCase().includes("mutable"),
        )
        console.log(`🔍 Similar tokens found:`, similarTokens)
      }

      return tokens
    } catch (error) {
      console.error("❌ Error fetching available tokens:", error)
      return []
    }
  }

  // Get a quote for a token swap
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps = 50,
    onlyDirectRoutes = false,
  ): Promise<JupiterQuoteResponse> {
    const queryParams = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amount.toString(),
      slippageBps: slippageBps.toString(),
      onlyDirectRoutes: onlyDirectRoutes.toString(),
    })

    console.log(`📞 Fetching Jupiter quote: ${this.apiUrl}/quote?${queryParams}`)
    const response = await fetch(`${this.apiUrl}/quote?${queryParams}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Jupiter quote failed:`, response.status, errorText)
      throw new Error(`Jupiter API error: ${response.status} - ${errorText}`)
    }

    const quoteResponse = (await response.json()) as JupiterQuoteResponse
    console.log("✅ Jupiter quote received:", quoteResponse)
    return quoteResponse
  }

  // Get a swap transaction
  async getSwapTransaction(quoteResponse: JupiterQuoteResponse, userPublicKey: string): Promise<JupiterSwapResponse> {
    console.log("📞 Requesting swap transaction from Jupiter")

    // For devnet, we need to be more careful about address lookup tables
    const requestBody = {
      quoteResponse,
      userPublicKey,
      wrapAndUnwrapSol: true,
      // Add devnet-specific options
      ...(this.isTestnet && {
        // Disable address lookup tables for devnet if they're causing issues
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: "auto",
      }),
    }

    console.log("📦 Swap request body:", JSON.stringify(requestBody, null, 2))

    const response = await fetch(`${this.apiUrl}/swap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Jupiter swap API error:", errorText)
      throw new Error(`Jupiter swap API error: ${errorText}`)
    }

    const swapResponse = (await response.json()) as JupiterSwapResponse
    console.log("✅ Jupiter swap transaction received")
    return swapResponse
  }

  // Execute a swap transaction
  async executeSwap(
    swapTransaction: string,
    walletPublicKey: PublicKey,
    signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>,
    quoteResponse: JupiterQuoteResponse,
  ): Promise<JupiterSwapResult> {
    console.log("🔄 Executing Jupiter swap transaction")

    try {
      // Deserialize the transaction
      const transactionBuf = Buffer.from(swapTransaction, "base64")
      console.log("📦 Transaction buffer length:", transactionBuf.length)

      let transaction: Transaction | VersionedTransaction
      let isVersionedTransaction = false

      try {
        // First, try to deserialize as a versioned transaction
        transaction = VersionedTransaction.deserialize(transactionBuf)
        isVersionedTransaction = true
        console.log("✅ Successfully deserialized as VersionedTransaction")

        // Log address lookup table info for debugging
        if (transaction.message.addressTableLookups && transaction.message.addressTableLookups.length > 0) {
          console.log("🔍 Address lookup tables found:", transaction.message.addressTableLookups.length)
          transaction.message.addressTableLookups.forEach((alt, index) => {
            console.log(`ALT ${index}:`, alt.accountKey.toString())
          })
        }
      } catch (versionedError) {
        console.log("⚠️ Failed to deserialize as VersionedTransaction, trying legacy Transaction")
        try {
          // If that fails, try as a legacy transaction
          transaction = Transaction.from(transactionBuf)
          isVersionedTransaction = false
          console.log("✅ Successfully deserialized as legacy Transaction")
        } catch (legacyError) {
          console.error("❌ Failed to deserialize as both VersionedTransaction and Transaction")
          console.error("VersionedTransaction error:", versionedError)
          console.error("Legacy Transaction error:", legacyError)
          throw new Error("Failed to deserialize transaction in any format")
        }
      }

      // Sign the transaction
      console.log("✍️ Signing transaction")
      const signedTransaction = await signTransaction(transaction)

      // Serialize and send the transaction
      let rawTransaction: Uint8Array
      if (isVersionedTransaction) {
        rawTransaction = (signedTransaction as VersionedTransaction).serialize()
        console.log("📦 Serialized as VersionedTransaction")
      } else {
        rawTransaction = (signedTransaction as Transaction).serialize()
        console.log("📦 Serialized as legacy Transaction")
      }

      console.log("📡 Sending transaction to blockchain")

      try {
        // First try with simulation
        console.log("🧪 Simulating transaction first...")
        const simulation = await this.connection.simulateTransaction(
          isVersionedTransaction ? (signedTransaction as VersionedTransaction) : (signedTransaction as Transaction),
          {
            commitment: "confirmed",
            replaceRecentBlockhash: true,
          },
        )

        if (simulation.value.err) {
          console.error("❌ Simulation failed:", simulation.value.err)
          console.error("📋 Simulation logs:", simulation.value.logs)
          throw new Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}`)
        }

        console.log("✅ Simulation successful")
        console.log("📋 Simulation logs:", simulation.value.logs)

        // If simulation passes, send the actual transaction
        const txid = await this.connection.sendRawTransaction(rawTransaction, {
          skipPreflight: true, // Skip preflight since we already simulated
          preflightCommitment: "confirmed",
          maxRetries: 3,
        })
        console.log("✅ Transaction sent, ID:", txid)

        console.log("⏳ Waiting for confirmation")
        const confirmation = await this.connection.confirmTransaction(txid, "confirmed")

        if (confirmation.value.err) {
          console.error("❌ Transaction failed:", confirmation.value.err)
          throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`)
        }

        console.log("🎉 Transaction confirmed successfully")
        return {
          txid,
          outputAmount: quoteResponse.outAmount,
        }
      } catch (sendError) {
        console.error("❌ Error sending transaction:", sendError)

        // If it's a SendTransactionError, get the logs
        if (sendError instanceof SendTransactionError) {
          console.error("📋 Transaction logs:", sendError.logs)
        }

        // Check if it's an address lookup table issue
        if (sendError.message.includes("address table account that doesn't exist")) {
          console.error("🚨 Address Lookup Table issue detected")
          console.error("💡 This might be because the ALT doesn't exist on devnet")
          throw new Error(
            "Address lookup table not found on devnet. This token might not be fully supported on devnet yet.",
          )
        }

        throw sendError
      }
    } catch (error) {
      console.error("❌ Error in executeSwap:", error)
      throw error
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
    console.log(`🏊 Creating liquidity pool for token ${tokenMint}`)
    console.log(`💰 Adding ${solAmount} SOL and ${tokenAmount} tokens as initial liquidity`)
    return "mock_pool_creation_tx_" + Math.random().toString(36).substring(2, 15)
  }
}

// Helper function to create a Jupiter API client
export function createJupiterApiClient(connection: Connection): JupiterApiClient {
  return new JupiterApiClient(connection)
}
