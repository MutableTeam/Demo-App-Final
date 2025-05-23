import { type Connection, PublicKey, TransactionInstruction } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID, Token, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { Buffer } from "buffer"

// Example: Function to create an SPL token transfer instruction
export async function createTokenTransferInstruction(
  connection: Connection,
  fromWallet: PublicKey,
  toWallet: PublicKey,
  tokenMint: PublicKey,
  amount: number,
): Promise<TransactionInstruction> {
  // Find the associated token accounts for sender and receiver
  const fromTokenAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    tokenMint,
    fromWallet,
  )

  const toTokenAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    tokenMint,
    toWallet,
  )

  // Check if the receiver's token account exists
  const receiverAccount = await connection.getAccountInfo(toTokenAccount)

  // If the receiver's token account doesn't exist, create it first
  if (!receiverAccount) {
    const createATAInstruction = Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      tokenMint,
      toTokenAccount,
      toWallet,
      fromWallet,
    )

    // Return both instructions
    return createATAInstruction
  }

  // Create the transfer instruction
  const transferInstruction = Token.createTransferInstruction(
    TOKEN_PROGRAM_ID,
    fromTokenAccount,
    toTokenAccount,
    fromWallet,
    [],
    amount,
  )

  return transferInstruction
}

// Example: Function to interact with a custom token contract
export async function interactWithCustomContract(
  connection: Connection,
  wallet: PublicKey,
  programId: PublicKey,
  action: string,
  params: any,
): Promise<TransactionInstruction> {
  // Define instruction discriminator based on action
  let discriminator: number
  switch (action) {
    case "initialize":
      discriminator = 0
      break
    case "mint":
      discriminator = 1
      break
    case "burn":
      discriminator = 2
      break
    case "transfer":
      discriminator = 3
      break
    default:
      throw new Error(`Unknown action: ${action}`)
  }

  // Create instruction data buffer
  // First byte is the discriminator, rest is serialized parameters
  const dataBuffer = Buffer.alloc(9) // Adjust size based on your needs
  dataBuffer.writeUInt8(discriminator, 0)

  // Example: For a transfer, we might write the amount
  if (action === "transfer" && params.amount) {
    dataBuffer.writeBigUInt64LE(BigInt(params.amount), 1)
  }

  // Define accounts that will be used in the instruction
  const accounts = [
    { pubkey: wallet, isSigner: true, isWritable: true },
    // Add other accounts based on the action
    // For example, for a transfer:
    ...(action === "transfer" ? [{ pubkey: new PublicKey(params.recipient), isSigner: false, isWritable: true }] : []),
    { pubkey: programId, isSigner: false, isWritable: false },
  ]

  // Create and return the instruction
  return new TransactionInstruction({
    keys: accounts,
    programId,
    data: dataBuffer,
  })
}
