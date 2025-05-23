import { type PublicKey, type Connection, LAMPORTS_PER_SOL } from "@solana/web3.js"

// Mock exchange rate: 1 SOL = 10000 MUTB (at $0.01 per MUTB, assuming SOL is ~$100)
const MOCK_EXCHANGE_RATE = 10000

// Mock token reserves (using regular numbers instead of BigInt)
let solReserve = 100 * LAMPORTS_PER_SOL // 100 SOL
let mutbReserve = 1000000 * 1000000000 // 1,000,000 MUTB

// Mock swap function for SOL to MUTB
export async function mockSwapSolForMutb(
  amount: number, // SOL amount
): Promise<{ success: boolean; amount: number; txId: string }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // 5% chance of random failure
  if (Math.random() < 0.05) {
    throw new Error("Transaction failed due to network error")
  }

  // Calculate MUTB amount
  const mutbAmount = amount * MOCK_EXCHANGE_RATE

  // Update reserves
  solReserve += amount * LAMPORTS_PER_SOL
  mutbReserve -= mutbAmount * 1000000000

  return {
    success: true,
    amount: mutbAmount,
    txId: "mock_tx_" + Math.random().toString(36).substring(2, 15),
  }
}

// Mock swap function for MUTB to SOL
export async function mockSwapMutbForSol(
  amount: number, // MUTB amount
): Promise<{ success: boolean; amount: number; txId: string }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // 5% chance of random failure
  if (Math.random() < 0.05) {
    throw new Error("Transaction failed due to network error")
  }

  // Calculate SOL amount
  const solAmount = amount / MOCK_EXCHANGE_RATE

  // Update reserves
  mutbReserve += amount * 1000000000
  solReserve -= solAmount * LAMPORTS_PER_SOL

  return {
    success: true,
    amount: solAmount,
    txId: "mock_tx_" + Math.random().toString(36).substring(2, 15),
  }
}

// Mock function to get exchange rate
export function mockGetExchangeRate(): number {
  return MOCK_EXCHANGE_RATE
}

// Mock function to get token balance
export async function mockGetTokenBalance(connection: Connection, owner: PublicKey, mint: PublicKey): Promise<number> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // For MUTB, return a random balance between 0 and 1000
  return Math.floor(Math.random() * 1000)
}

// Mock Jupiter API response
export async function mockJupiterQuote(
  inputMint: string,
  outputMint: string,
  amount: string,
  slippageBps: number,
): Promise<any> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const inputAmount = Number.parseInt(amount)
  let outputAmount

  // Calculate based on which direction we're swapping
  if (inputMint.includes("11111")) {
    // SOL to MUTB
    outputAmount = inputAmount * MOCK_EXCHANGE_RATE
  } else {
    // MUTB to SOL
    outputAmount = inputAmount / MOCK_EXCHANGE_RATE
  }

  return {
    inputMint,
    outputMint,
    inAmount: amount,
    outAmount: outputAmount.toString(),
    otherAmountThreshold: (outputAmount * (1 - slippageBps / 10000)).toString(),
    swapMode: "ExactIn",
    slippageBps,
    platformFee: {
      amount: "0",
      feeBps: 0,
    },
    priceImpactPct: "0.1",
    routePlan: [
      {
        swapInfo: {
          ammKey: "mock_amm_" + Math.random().toString(36).substring(2, 10),
          label: "Mock DEX",
          inputMint,
          outputMint,
          inAmount: amount,
          outAmount: outputAmount.toString(),
          feeAmount: "0",
          feeMint: inputMint,
        },
        percent: 100,
      },
    ],
    contextSlot: 123456789,
    timeTaken: 0.123,
  }
}

// Mock Jupiter swap transaction
export async function mockJupiterSwapTransaction(quoteResponse: any, userPublicKey: string): Promise<any> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600))

  return {
    swapTransaction: "mock_transaction_data_" + Math.random().toString(36).substring(2, 15),
    lastValidBlockHeight: 123456789,
    prioritizationFeeLamports: 5000,
  }
}
