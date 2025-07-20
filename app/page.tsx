"use client"

import { useState, useEffect } from "react"
import { Connection, PublicKey } from "@solana/web3.js"
import { AnchorProvider, web3 } from "@project-serum/anchor"

import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom"
import { useWallet, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui"
require("@solana/wallet-adapter-react-ui/styles.css")

import idl from "../idl.json"
import { MutablePlatform } from "./MutablePlatform"

const programID = new PublicKey(idl.metadata.address)
const network = "http://127.0.0.1:8899"
const opts = {
  preflightCommitment: "processed",
}

const platformTypes = ["Twitter", "YouTube", "TikTok"]

const App = () => {
  const [walletConnected, setWalletConnected] = useState(false)
  const [publicKey, setPublicKey] = useState(null)
  const [balance, setBalance] = useState(0)
  const [provider, setProvider] = useState(null)
  const [connection, setConnection] = useState(null)
  const [platformType, setPlatformType] = useState(null)

  const wallet = useWallet()

  useEffect(() => {
    if (wallet.connected) {
      setPublicKey(wallet.publicKey.toString())
      setWalletConnected(true)
    }
  }, [wallet.connected, wallet.publicKey])

  useEffect(() => {
    const establishConnection = async () => {
      const connection = new Connection(network, opts.preflightCommitment)
      setConnection(connection)

      if (wallet.publicKey) {
        const provider = getProvider()
        setProvider(provider)
      }
    }

    establishConnection()
  }, [wallet.publicKey])

  useEffect(() => {
    const getWalletBalance = async () => {
      if (publicKey && connection) {
        try {
          const balance = await connection.getBalance(new PublicKey(publicKey))
          setBalance(balance / web3.LAMPORTS_PER_SOL)
        } catch (e) {
          console.error(e)
          setBalance(0)
        }
      }
    }

    getWalletBalance()
  }, [publicKey, connection])

  const getProvider = () => {
    const provider = new AnchorProvider(connection, wallet, opts.preflightCommitment)
    return provider
  }

  const handleDisconnect = () => {
    setWalletConnected(false)
    setPublicKey(null)
    setBalance(0)
    setProvider(null)
    setConnection(null)
    setPlatformType(null)
  }

  return (
    <div className="App">
      <div>
        {!walletConnected ? (
          <WalletMultiButton />
        ) : (
          <>
            <p>
              <strong>Public Key:</strong> {publicKey}
            </p>
            <p>
              <strong>Balance:</strong> {balance} SOL
            </p>
            <button onClick={handleDisconnect}>Disconnect Wallet</button>
            <div>
              <label htmlFor="platformType">Choose a platform:</label>
              <select name="platformType" id="platformType" onChange={(e) => setPlatformType(e.target.value)}>
                <option value="">Select a platform</option>
                {platformTypes.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {platformType && walletConnected ? (
        <MutablePlatform
          publicKey={publicKey}
          balance={balance}
          provider={provider}
          connection={connection}
          onDisconnect={handleDisconnect}
          platformType={platformType}
        />
      ) : (
        <p>Please connect your wallet and select a platform.</p>
      )}
    </div>
  )
}

export default function Page() {
  const wallets = [new PhantomWalletAdapter()]

  return (
    <div>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </div>
  )
}
