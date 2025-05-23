import { PublicKey, TransactionInstruction } from "@solana/web3.js"
import { Buffer } from "buffer"

// Use a valid dummy program ID for demonstration
// This is the System Program ID which is a valid base58 string
export const PROGRAM_ID = new PublicKey("11111111111111111111111111111111")

// Define instruction types (customize based on your program)
export enum InstructionType {
  Initialize = 0,
  Execute = 1,
  Update = 2,
}

// Function to create an instruction for your program
export function createProgramInstruction(
  type: InstructionType,
  data: Buffer,
  accounts: PublicKey[],
  programId?: PublicKey,
): TransactionInstruction {
  // Use provided program ID or default to the dummy one
  const targetProgramId = programId || PROGRAM_ID

  const keys = accounts.map((pubkey, idx) => ({
    pubkey,
    isSigner: idx === 0, // Usually the first account is the signer
    isWritable: idx !== accounts.length - 1, // Usually the last account is read-only (program ID)
  }))

  // Create instruction data buffer
  const instructionData = Buffer.alloc(data.length + 1)
  instructionData.writeUInt8(type, 0)
  data.copy(instructionData, 1)

  return new TransactionInstruction({
    keys,
    programId: targetProgramId,
    data: instructionData,
  })
}

// Parse program account data (customize based on your program's data structure)
export function parseProgramAccountData(data: Buffer): any {
  // Example parsing logic - customize based on your program's data structure
  const version = data.readUInt8(0)
  const isInitialized = Boolean(data.readUInt8(1))
  const value = data.readBigUInt64LE(2)

  return {
    version,
    isInitialized,
    value: Number(value),
  }
}

// Find a program derived address (PDA)
export async function findProgramAddress(seeds: Buffer[], programId: PublicKey): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(seeds, programId)
}

// Validate a program ID string
export function isValidProgramId(programIdString: string): boolean {
  try {
    new PublicKey(programIdString)
    return true
  } catch (error) {
    return false
  }
}

// Safely create a PublicKey
export function safeCreatePublicKey(publicKeyString: string): PublicKey | null {
  try {
    return new PublicKey(publicKeyString)
  } catch (error) {
    console.error("Invalid public key:", error)
    return null
  }
}
