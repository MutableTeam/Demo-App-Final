import { Connection, Keypair, PublicKey, BpfLoader, BPF_LOADER_PROGRAM_ID } from "@solana/web3.js"
import fs from "fs"
import path from "path"

// Load the compiled program
const programPath = path.join(__dirname, "../solana/programs/token-swap/target/deploy/token_swap.so")
const programData = fs.readFileSync(programPath)

// Connect to the Solana devnet
const connection = new Connection("https://api.devnet.solana.com", "confirmed")

// Create a new keypair for the program
const programKeypair = Keypair.generate()
console.log("Program ID:", programKeypair.publicKey.toString())

async function deployProgram() {
  try {
    // Fund the program account
    const airdropSignature = await connection.requestAirdrop(programKeypair.publicKey, 1000000000)
    await connection.confirmTransaction(airdropSignature)

    // Deploy the program
    console.log("Deploying program...")
    const deploySignature = await BpfLoader.load(
      connection,
      programKeypair,
      programKeypair,
      programData,
      BPF_LOADER_PROGRAM_ID,
    )
    console.log("Program deployed with signature:", deploySignature)

    // Initialize the program
    console.log("Initializing program...")
    const [poolAddress, poolBump] = await PublicKey.findProgramAddress([Buffer.from("pool")], programKeypair.publicKey)
    const [authorityAddress, authorityBump] = await PublicKey.findProgramAddress(
      [Buffer.from("authority")],
      programKeypair.publicKey,
    )

    // Create the initialization transaction
    // This is a placeholder - you would need to implement the actual initialization
    console.log("Program deployed and initialized!")
    console.log("Program ID:", programKeypair.publicKey.toString())
    console.log("Pool Address:", poolAddress.toString())
    console.log("Authority Address:", authorityAddress.toString())

    // Save the program ID to a file
    fs.writeFileSync(
      path.join(__dirname, "../utils/program-id.json"),
      JSON.stringify({ programId: programKeypair.publicKey.toString() }),
    )
  } catch (error) {
    console.error("Deployment failed:", error)
  }
}

deployProgram()
