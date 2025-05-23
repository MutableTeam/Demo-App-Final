"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeftRight, TrendingUp, Info, Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"
import { type Connection, PublicKey } from "@solana/web3.js"
import { withClickSound } from "@/utils/sound-utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { createJupiterApiClient } from "@/utils/jupiter-sdk"
import { TokenSwapForm } from "./swap/token-swap-form"
import { MarketOverview } from "./swap/market-overview"
import { TransactionHistory } from "./swap/transaction-history"
import { SOL_TOKEN, MUTB_TOKEN, DEFAULT_SWAP_PAIR, SUPPORTED_TOKENS } from "@/config/token-registry"
import { getTokenBalance } from "@/utils/token-utils"
import type { SwapResult } from "@/types/token-types"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"

// Cyberpunk styled components
const scanline = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
`

const CyberTabs = styled(Tabs)`
  .cyber-tab-list {
    background: linear-gradient(90deg, rgba(16, 16, 48, 0.7) 0%, rgba(32, 16, 64, 0.7) 100%);
    border: 1px solid rgba(0, 255, 255, 0.3);
    overflow: hidden;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
      z-index: 1;
    }
  }
  
  .cyber-tab {
    color: rgba(255, 255, 255, 0.7);
    font-family: monospace;
    position: relative;
    transition: all 0.3s ease;
    
    &[data-state="active"] {
      background: rgba(0, 255, 255, 0.1);
      color: #0ff;
      text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
      
      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, #0ff, transparent);
      }
    }
    
    &:hover:not([data-state="active"]) {
      background: rgba(0, 255, 255, 0.05);
      color: rgba(0, 255, 255, 0.9);
    }
  }
`

const CyberAlert = styled(Alert)`
  background: rgba(16, 16, 48, 0.7);
  border: 1px solid rgba(0, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  
  &.cyber-success {
    border-color: rgba(0, 255, 128, 0.5);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(0, 255, 128, 0.8), transparent);
    }
  }
  
  &.cyber-warning {
    border-color: rgba(255, 255, 0, 0.5);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 0, 0.8), transparent);
    }
  }
  
  &.cyber-error {
    border-color: rgba(255, 0, 0, 0.5);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 0, 0, 0.8), transparent);
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), transparent);
    animation: ${scanline} 4s linear infinite;
    z-index: 1;
    opacity: 0.3;
  }
`

interface MutableMarketplaceProps {
  publicKey: string
  balance: number | null
  provider: any
  connection: Connection
  onBalanceChange?: (currency: "sol" | "mutb", newBalance: number) => void
}

export default function MutableMarketplace({
  publicKey,
  balance,
  provider,
  connection,
  onBalanceChange,
}: MutableMarketplaceProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("swap")
  const [mutbBalance, setMutbBalance] = useState<number>(0)
  const [isTokenTradable, setIsTokenTradable] = useState<boolean>(false)
  const [checkingTradability, setCheckingTradability] = useState<boolean>(true)
  const [jupiterClient, setJupiterClient] = useState<any>(null)
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  // Transaction history
  const [transactionHistory, setTransactionHistory] = useState<SwapResult[]>([])

  // Initialize Jupiter client and check token tradability
  useEffect(() => {
    if (connection) {
      const client = createJupiterApiClient(connection)
      setJupiterClient(client)

      // Check if token is tradable
      const checkTokenTradability = async () => {
        setCheckingTradability(true)
        try {
          const tradable = await client.isTokenTradable(SOL_TOKEN.mintAddress, MUTB_TOKEN.mintAddress)
          console.log("Token tradability check result:", tradable)
          setIsTokenTradable(tradable)
        } catch (error) {
          console.error("Error checking token tradability:", error)
          setIsTokenTradable(false)
        } finally {
          setCheckingTradability(false)
        }
      }

      checkTokenTradability()

      // Load transaction history from localStorage
      try {
        const savedHistory = localStorage.getItem("mutb_transaction_history")
        if (savedHistory) {
          setTransactionHistory(JSON.parse(savedHistory))
        }
      } catch (error) {
        console.error("Error loading transaction history:", error)
      }
    }
  }, [connection])

  // Save transaction history to localStorage when it changes
  useEffect(() => {
    if (transactionHistory.length > 0) {
      try {
        localStorage.setItem("mutb_transaction_history", JSON.stringify(transactionHistory))
      } catch (error) {
        console.error("Error saving transaction history:", error)
      }
    }
  }, [transactionHistory])

  // Fetch token balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!publicKey || !connection) return

      try {
        // Fetch MUTB balance
        const mutbBalance = await getTokenBalance(connection, publicKey, MUTB_TOKEN)
        setMutbBalance(mutbBalance)
      } catch (error) {
        console.error("Error fetching token balances:", error)
      }
    }

    if (publicKey) {
      fetchBalances()
    }
  }, [publicKey, connection])

  // Handle successful swap
  const handleSwapComplete = (inputToken, outputToken, inputAmount, outputAmount, txId) => {
    // Add to transaction history
    const newTransaction: SwapResult = {
      type: "swap",
      timestamp: Date.now(),
      inputAmount,
      inputToken: inputToken.symbol,
      outputAmount,
      outputToken: outputToken.symbol,
      txId,
    }

    setTransactionHistory((prev) => [newTransaction, ...prev.slice(0, 9)])

    // Show success toast
    toast({
      title: "Swap Successful!",
      description: `You swapped ${inputAmount} ${inputToken.symbol} for ${outputAmount.toFixed(2)} ${outputToken.symbol}`,
      variant: "default",
      className: isCyberpunk
        ? "border border-[#0ff]/50 bg-[#0a0a24] text-[#0ff] shadow-[0_0_10px_rgba(0,255,255,0.3)]"
        : "border-2 border-black bg-[#FFD54F] text-black font-mono",
      action: (
        <ToastAction altText="OK" className={isCyberpunk ? "border border-[#0ff]/50" : "border border-black"}>
          OK
        </ToastAction>
      ),
    })

    // Refresh balances
    refreshBalances()
  }

  // Function to create a liquidity pool
  const createLiquidityPool = async () => {
    if (!jupiterClient || !publicKey || !provider) {
      toast({
        title: "Error",
        description: "Wallet not connected",
        variant: "destructive",
      })
      return
    }

    try {
      // For demonstration, we'll use 1 SOL and 10,000 MUTB as initial liquidity
      const solAmount = 1
      const mutbAmount = 10000

      // Check balances
      if (balance !== null && solAmount > balance) {
        toast({
          title: "Error",
          description: `Insufficient ${SOL_TOKEN.symbol} balance for pool creation`,
          variant: "destructive",
        })
        return
      }

      if (mutbAmount > mutbBalance) {
        toast({
          title: "Error",
          description: `Insufficient ${MUTB_TOKEN.symbol} balance for pool creation`,
          variant: "destructive",
        })
        return
      }

      // Create the pool
      const txid = await jupiterClient.createLiquidityPool(
        MUTB_TOKEN.mintAddress,
        solAmount,
        mutbAmount,
        new PublicKey(publicKey),
        provider.signTransaction.bind(provider),
      )

      console.log("Liquidity pool created:", txid)

      // Add to transaction history
      const newTransaction: SwapResult = {
        type: "pool",
        timestamp: Date.now(),
        inputAmount: solAmount,
        inputToken: SOL_TOKEN.symbol,
        outputAmount: mutbAmount,
        outputToken: MUTB_TOKEN.symbol,
        txId: txid,
      }

      setTransactionHistory((prev) => [newTransaction, ...prev.slice(0, 9)])

      // Show success toast
      toast({
        title: "Liquidity Pool Created!",
        description: `Successfully created ${MUTB_TOKEN.symbol}/${SOL_TOKEN.symbol} pool with ${solAmount} ${SOL_TOKEN.symbol} and ${mutbAmount} ${MUTB_TOKEN.symbol}`,
        variant: "default",
        className: isCyberpunk
          ? "border border-[#0ff]/50 bg-[#0a0a24] text-[#0ff] shadow-[0_0_10px_rgba(0,255,255,0.3)]"
          : "border-2 border-black bg-[#FFD54F] text-black font-mono",
        action: (
          <ToastAction altText="OK" className={isCyberpunk ? "border border-[#0ff]/50" : "border border-black"}>
            OK
          </ToastAction>
        ),
      })

      // Refresh balances
      refreshBalances()
    } catch (error) {
      console.error("Error creating liquidity pool:", error)
      toast({
        title: "Error",
        description: "Failed to create liquidity pool. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Function to check token tradability
  const checkTokenTradability = async (): Promise<boolean> => {
    if (!jupiterClient) return false

    setCheckingTradability(true)
    try {
      const tradable = await jupiterClient.isTokenTradable(SOL_TOKEN.mintAddress, MUTB_TOKEN.mintAddress)
      setIsTokenTradable(tradable)
      return tradable
    } catch (error) {
      console.error("Error checking token tradability:", error)
      return false
    } finally {
      setCheckingTradability(false)
    }
  }

  // Function to refresh balances
  const refreshBalances = async () => {
    if (!publicKey || !connection) return

    try {
      // Refresh SOL balance
      const solBalance = await connection.getBalance(new PublicKey(publicKey))
      if (onBalanceChange) {
        onBalanceChange("sol", solBalance / 1e9) // 1e9 = LAMPORTS_PER_SOL
      }

      // Refresh MUTB balance
      const mutbBalance = await getTokenBalance(connection, publicKey, MUTB_TOKEN)
      setMutbBalance(mutbBalance)
      if (onBalanceChange) {
        onBalanceChange("mutb", mutbBalance)
      }
    } catch (error) {
      console.error("Error refreshing balances:", error)
    }
  }

  // Render cyberpunk alerts
  const renderAlert = () => {
    if (checkingTradability) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className={`h-6 w-6 animate-spin mr-2 ${isCyberpunk ? "text-[#0ff]" : ""}`} />
          <span className={isCyberpunk ? "text-[#0ff] font-mono" : ""}>
            Checking if {MUTB_TOKEN.symbol} token is tradable on Jupiter...
          </span>
        </div>
      )
    }

    if (!isTokenTradable) {
      if (isCyberpunk) {
        return (
          <CyberAlert className="mb-4 cyber-warning">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <AlertTitle className="text-yellow-400 font-mono">Token Not Yet Tradable</AlertTitle>
            <AlertDescription className="text-yellow-300 font-mono">
              Your {MUTB_TOKEN.symbol} token is not yet indexed by Radium. Swaps are disabled until the token is
              tradable.
            </AlertDescription>
          </CyberAlert>
        )
      }

      return (
        <Alert className="mb-4 border-2 border-yellow-500 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Token Not Yet Tradable</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Your {MUTB_TOKEN.symbol} token is not yet indexed by Radium. Swaps are disabled until the token is tradable.
          </AlertDescription>
        </Alert>
      )
    }

    if (isCyberpunk) {
      return (
        <CyberAlert className="mb-4 cyber-success">
          <Info className="h-4 w-4 text-[#0ff]" />
          <AlertTitle className="text-[#0ff] font-mono">{MUTB_TOKEN.symbol} Token is Tradable!</AlertTitle>
          <AlertDescription className="text-[#0ff]/80 font-mono">
            Your {MUTB_TOKEN.symbol} token is now tradable on Radium. You can perform real swaps on Solana devnet.
          </AlertDescription>
        </CyberAlert>
      )
    }

    return (
      <Alert className="mb-4 border-2 border-green-500 bg-green-50">
        <Info className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">{MUTB_TOKEN.symbol} Token is Tradable!</AlertTitle>
        <AlertDescription className="text-green-700">
          Your {MUTB_TOKEN.symbol} token is now tradable on Radium. You can perform real swaps on Solana devnet.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className={isCyberpunk ? "" : "bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className={`h-5 w-5 ${isCyberpunk ? "text-[#0ff]" : ""}`} />
            <CardTitle className={isCyberpunk ? "" : "font-mono"}>EXCHANGE</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                isCyberpunk
                  ? "bg-[#0a0a24]/80 text-[#0ff] border border-[#0ff]/50 flex items-center gap-1 font-mono"
                  : "bg-[#FFD54F] text-black border-2 border-black flex items-center gap-1 font-mono"
              }
            >
              <Image
                src={MUTB_TOKEN.logoURI || "/placeholder.svg"}
                alt={MUTB_TOKEN.symbol}
                width={16}
                height={16}
                className="rounded-full"
              />
              {mutbBalance.toFixed(2)} {MUTB_TOKEN.symbol}
            </Badge>
            <Badge
              variant="outline"
              className={
                isCyberpunk
                  ? "bg-[#0a0a24]/80 text-[#f0f] border border-[#f0f]/50 font-mono"
                  : "bg-white text-black border-2 border-black font-mono"
              }
            >
              {balance !== null ? `${balance.toFixed(2)} ${SOL_TOKEN.symbol}` : "..."}
            </Badge>
          </div>
        </div>
        <CardDescription className={isCyberpunk ? "text-[#0ff]/70" : ""}>
          Swap between {SOL_TOKEN.symbol} and {MUTB_TOKEN.symbol} tokens using Jupiter
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderAlert()}

        {isCyberpunk ? (
          <CyberTabs defaultValue="swap" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="cyber-tab-list mb-4">
              <TabsTrigger value="swap" className="cyber-tab" onClick={withClickSound()}>
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4" />
                  <span>SWAP</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="market" className="cyber-tab" onClick={withClickSound()}>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>MARKET</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="history" className="cyber-tab" onClick={withClickSound()}>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>HISTORY</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="swap">
              <TokenSwapForm
                connection={connection}
                publicKey={publicKey}
                provider={provider}
                swapPair={DEFAULT_SWAP_PAIR}
                inputBalance={balance}
                outputBalance={mutbBalance}
                isTokenTradable={isTokenTradable}
                onSwap={handleSwapComplete}
                checkingTradability={checkingTradability}
              />
            </TabsContent>

            <TabsContent value="market">
              <MarketOverview tokens={SUPPORTED_TOKENS} recentTransactions={transactionHistory} />
            </TabsContent>

            <TabsContent value="history">
              <TransactionHistory transactions={transactionHistory} />
            </TabsContent>
          </CyberTabs>
        ) : (
          <Tabs defaultValue="swap" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 border-2 border-black bg-[#FFD54F]">
              <TabsTrigger
                value="swap"
                className="data-[state=active]:bg-white data-[state=active]:text-black font-mono"
                onClick={withClickSound()}
              >
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4" />
                  <span>SWAP</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="market"
                className="data-[state=active]:bg-white data-[state=active]:text-black font-mono"
                onClick={withClickSound()}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>MARKET</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-white data-[state=active]:text-black font-mono"
                onClick={withClickSound()}
              >
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>HISTORY</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="swap">
              <TokenSwapForm
                connection={connection}
                publicKey={publicKey}
                provider={provider}
                swapPair={DEFAULT_SWAP_PAIR}
                inputBalance={balance}
                outputBalance={mutbBalance}
                isTokenTradable={isTokenTradable}
                onSwap={handleSwapComplete}
                checkingTradability={checkingTradability}
              />
            </TabsContent>

            <TabsContent value="market">
              <MarketOverview tokens={SUPPORTED_TOKENS} recentTransactions={transactionHistory} />
            </TabsContent>

            <TabsContent value="history">
              <TransactionHistory transactions={transactionHistory} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
