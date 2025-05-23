import { PublicKey } from "@solana/web3.js"
import fs from "fs"
import path from "path"

let programId: PublicKey

try {
  // Try to load the program ID from the file
  const programIdFile = path.join(__dirname, "program-id.json")
  const programIdData = JSON.parse(fs.readFileSync(programIdFile, "utf8"))
  programId = new PublicKey(programIdData.programId)
} catch (error) {
  // If the file doesn't exist, use a default program ID
  console.warn("Program ID file not found, using default ID")
  programId = new PublicKey("11111111111111111111111111111111")
}

export const TOKEN_SWAP_PROGRAM_ID = programId
