"use client"

import { Info, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import type { TokenConfig } from "@/types/token-types"

interface LiquidityPoolStatusProps {
  tokenA: TokenConfig
  tokenB: TokenConfig
  isTokenTradable: boolean
  checkingTradability: boolean
  onCheckTradability: () => Promise<boolean>
}

export function LiquidityPoolStatus({
  tokenA,
  tokenB,
  isTokenTradable,
  checkingTradability,
  onCheckTradability,
}: LiquidityPoolStatusProps) {
  const { toast } = useToast()

  const handleCheckStatus = async () => {
    try {
      const tradable = await onCheckTradability()

      toast({
        title: tradable ? "Token is Tradable!" : "Token Not Yet Tradable",
        description: tradable
          ? `Your ${tokenA.symbol} token is now tradable on Jupiter.`
          : `Your token is not yet indexed by Jupiter. Please check back later.`,
        variant: "default",
        className: tradable
          ? "border-2 border-green-500 bg-green-50 text-green-800"
          : "border-2 border-yellow-500 bg-yellow-50 text-yellow-800",
      })
    } catch (error) {
      console.error("Error checking token tradability:", error)
      toast({
        title: "Error Checking Token",
        description: "Failed to check if your token is tradable. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">LIQUIDITY POOL STATUS</CardTitle>
          <CardDescription className="text-gray-600">Current status of your token's liquidity pool</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert
            className={`border-2 ${isTokenTradable ? "border-green-500 bg-green-50" : "border-yellow-500 bg-yellow-50"}`}
          >
            <Info className="h-4 w-4" />
            <AlertDescription className={isTokenTradable ? "text-green-700" : "text-yellow-700"}>
              {isTokenTradable
                ? `Your ${tokenA.symbol} token is now tradable on Jupiter! The liquidity pool has been successfully created and indexed.`
                : `Your liquidity pool has been created but may not be indexed by Jupiter yet. This typically takes 24-48 hours.`}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pool Status:</span>
              <span className="text-sm font-medium">
                {isTokenTradable ? (
                  <span className="text-green-600">Active & Indexed</span>
                ) : (
                  <span className="text-yellow-600">Created, Awaiting Indexing</span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Jupiter Integration:</span>
              <span className="text-sm font-medium">
                {isTokenTradable ? (
                  <span className="text-green-600">Available</span>
                ) : (
                  <span className="text-yellow-600">Pending</span>
                )}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={`https://explorer.solana.com/address/${tokenA.mintAddress}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center text-sm transition-colors"
            >
              View {tokenA.symbol} Token on Solana Explorer <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">CHECK JUPITER INTEGRATION</CardTitle>
          <CardDescription className="text-gray-600">
            Manually verify if your token is available on Jupiter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            You can manually check if your token is tradable on Jupiter using these methods:
          </p>
          <ol className="list-decimal list-inside text-sm space-y-2 text-gray-700">
            <li>
              <strong className="text-gray-900">Jupiter Swap UI:</strong> Visit{" "}
              <a
                href={`https://jup.ag/swap/${tokenB.symbol}-${tokenA.symbol}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                Jupiter Swap
              </a>{" "}
              and try to swap {tokenB.symbol} to {tokenA.symbol}.
            </li>
            <li>
              <strong className="text-gray-900">API Check:</strong> Use the Jupiter API to check if your token is
              tradable by making a request to:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                https://quote-api.jup.ag/v6/quote?inputMint={tokenB.mintAddress}&outputMint={tokenA.mintAddress}
                &amount=10000000
              </code>
            </li>
            <li>
              <strong className="text-gray-900">Refresh Token Status:</strong> Click the button below to check if your
              token is now tradable on Jupiter.
            </li>
          </ol>
          <div className="pt-2">
            <Button
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              onClick={handleCheckStatus}
              disabled={checkingTradability}
            >
              {checkingTradability ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  CHECKING...
                </span>
              ) : (
                "CHECK TOKEN STATUS"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
