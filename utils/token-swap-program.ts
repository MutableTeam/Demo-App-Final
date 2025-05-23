import {
  type Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js"
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token"
import * as borsh from "borsh"

// Define the program ID - using a valid base58 string
// This is a placeholder that will be replaced with your actual deployed program ID
export const TOKEN_SWAP_PROGRAM_ID = new PublicKey("11111111111111111111111111111111")

// MUTB token mint address on devnet
export const MUTB_MINT = new PublicKey("5R3KsVN6fucM7Mxyob4oro5Xp3qMxAb7Vi4L4Di57jCY")

// Define the instruction layouts
class SwapInstruction {
  static schema = new Map([
    [
      SwapInstruction,
      {
        kind: "struct",
        fields: [
          ["variant", "u8"],
          ["amount_in", "u64"],
          ["minimum_amount_out", "u64"],
        ],
      },
    ],
  ])

  constructor(
    public variant: number,
    public amount_in: bigint,
    public minimum_amount_out: bigint,
  ) {}

  serialize(): Buffer {
    return Buffer.from(borsh.serialize(SwapInstruction.schema, this))
  }
}

// Find the program derived address for the swap pool
export async function findSwapPoolAddress(programId: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync([Buffer.from("pool")], programId)
}

// Find the program derived address for the pool authority
export async function findPoolAuthorityAddress(programId: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync([Buffer.from("authority")], programId)
}

// Find or create the associated token account for a user
export async function findOrCreateAssociatedTokenAccount(
  connection: Connection,
  payer: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
): Promise<PublicKey> {
  const associatedTokenAddress = await getAssociatedTokenAddress(
    mint,
    owner,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )

  try {
    // Check if the account exists
    await connection.getTokenAccountBalance(associatedTokenAddress)
    return associatedTokenAddress
  } catch (error) {
    // Account doesn't exist, create it
    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        payer,
        associatedTokenAddress,
        owner,
        mint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    )

    transaction.feePayer = payer
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash

    const signedTransaction = await signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signedTransaction.serialize())
    await connection.confirmTransaction(signature)
    return associatedTokenAddress
  }
}

// Swap SOL for MUTB
export async function swapSolForMutb(
  connection: Connection,
  userPublicKey: PublicKey,
  amountIn: number, // SOL amount
  minimumAmountOut: number, // MUTB amount
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
): Promise<string> {
  // Convert SOL to lamports
  const lamports = Math.floor(amountIn * LAMPORTS_PER_SOL)
  const minimumTokens = Math.floor(minimumAmountOut * 1_000_000_000) // Assuming 9 decimals for MUTB

  // Find the program addresses
  const [poolAddress] = await findSwapPoolAddress(TOKEN_SWAP_PROGRAM_ID)
  const [poolAuthority] = await findPoolAuthorityAddress(TOKEN_SWAP_PROGRAM_ID)

  // Get or create the user's MUTB token account
  const userMutbAccount = await findOrCreateAssociatedTokenAccount(
    connection,
    userPublicKey,
    MUTB_MINT,
    userPublicKey,
    signTransaction,
  )

  // Create the swap instruction
  const instruction = new SwapInstruction(1, BigInt(lamports), BigInt(minimumTokens))
  const data = instruction.serialize()

  // Create the transaction
  const transaction = new Transaction().add(
    new TransactionInstruction({
      keys: [
        { pubkey: userPublicKey, isSigner: true, isWritable: true },
        { pubkey: userMutbAccount, isSigner: false, isWritable: true },
        { pubkey: poolAddress, isSigner: false, isWritable: true },
        { pubkey: poolAuthority, isSigner: false, isWritable: true },
        { pubkey: MUTB_MINT, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      programId: TOKEN_SWAP_PROGRAM_ID,
      data,
    }),
  )

  transaction.feePayer = userPublicKey
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash

  // Sign and send the transaction
  const signedTransaction = await signTransaction(transaction)
  const signature = await connection.sendRawTransaction(signedTransaction.serialize())
  await connection.confirmTransaction(signature)

  return signature
}

// Swap MUTB for SOL
export async function swapMutbForSol(
  connection: Connection,
  userPublicKey: PublicKey,
  amountIn: number, // MUTB amount
  minimumAmountOut: number, // SOL amount
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
): Promise<string> {
  // Convert to smallest units
  const tokens = Math.floor(amountIn * 1_000_000_000) // Assuming 9 decimals for MUTB
  const minimumLamports = Math.floor(minimumAmountOut * LAMPORTS_PER_SOL)

  // Find the program addresses
  const [poolAddress] = await findSwapPoolAddress(TOKEN_SWAP_PROGRAM_ID)
  const [poolAuthority] = await findPoolAuthorityAddress(TOKEN_SWAP_PROGRAM_ID)

  // Get the user's MUTB token account
  const userMutbAccount = await getAssociatedTokenAddress(
    MUTB_MINT,
    userPublicKey,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )

  // Create the swap instruction
  const instruction = new SwapInstruction(2, BigInt(tokens), BigInt(minimumLamports))
  const data = instruction.serialize()

  // Create the transaction
  const transaction = new Transaction().add(
    new TransactionInstruction({
      keys: [
        { pubkey: userPublicKey, isSigner: true, isWritable: true },
        { pubkey: userMutbAccount, isSigner: false, isWritable: true },
        { pubkey: poolAddress, isSigner: false, isWritable: true },
        { pubkey: poolAuthority, isSigner: false, isWritable: true },
        { pubkey: MUTB_MINT, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      programId: TOKEN_SWAP_PROGRAM_ID,
      data,
    }),
  )

  transaction.feePayer = userPublicKey
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash

  // Sign and send the transaction
  const signedTransaction = await signTransaction(transaction)
  const signature = await connection.sendRawTransaction(signedTransaction.serialize())
  await connection.confirmTransaction(signature)

  return signature
}

// Get the current exchange rate from the pool
export async function getExchangeRate(connection: Connection): Promise<number> {
  // Find the program addresses
  const [poolAddress] = await findSwapPoolAddress(TOKEN_SWAP_PROGRAM_ID)

  try {
    // Get the pool account data
    const accountInfo = await connection.getAccountInfo(poolAddress)
    if (!accountInfo || !accountInfo.data) {
      throw new Error("Pool account not found")
    }

    // Parse the pool state (simplified, would need proper borsh deserialization)
    // This is a placeholder - you would need to implement proper deserialization
    const mutbPerSol = accountInfo.data.readBigUInt64LE(10) // Offset where mutb_per_sol is stored
    return Number(mutbPerSol) / 1_000_000_000 // Convert from fixed point to float
  } catch (error) {
    console.error("Error getting exchange rate:", error)
    // Return a default rate if the pool is not initialized
    return 10000 // 10,000 MUTB per SOL (assuming MUTB is $0.01 and SOL is $100)
  }
}
