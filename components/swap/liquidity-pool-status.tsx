"use client"
import { Info, ExternalLink, Loader2 } from "lucide-react"
import SoundButton from "@/components/sound-button"
import { useToast } from "@/components/ui/use-toast"
import type { TokenConfig } from "@/types/token-types"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"

// Cyberpunk styled components
const glowPulse = keyframes`
  0% { box-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.3); }
  50% { box-shadow: 0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.5); }
  100% { box-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.3); }
`

const CyberCard = styled.div`
  background: rgba(10, 10, 40, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
  }
`

const CyberTitle = styled.h3`
  color: rgba(0, 255, 255, 0.9);
  font-family: monospace;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
  }
`

const CyberButton = styled(SoundButton)`
  background: linear-gradient(90deg, rgba(0, 128, 255, 0.5), rgba(0, 255, 255, 0.5));
  border: 1px solid rgba(0, 255, 255, 0.8);
  color: white;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.8);
  font-family: monospace;
  position: relative;
  overflow: hidden;
  
  &:hover:not(:disabled) {
    background: linear-gradient(90deg, rgba(0, 128, 255, 0.7), rgba(0, 255, 255, 0.7));
    animation: ${glowPulse} 2s infinite;
  }
  
  &:disabled {
    background: rgba(50, 50, 70, 0.5);
    border-color: rgba(100, 100, 150, 0.3);
    color: rgba(200, 200, 220, 0.5);
  }
`

const CyberLink = styled.a`
  color: rgba(0, 150, 255, 0.9);
  text-decoration: none;
  position: relative;
  
  &:hover {
    color: rgba(0, 200, 255, 1);
    text-shadow: 0 0 5px rgba(0, 200, 255, 0.5);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 200, 255, 0.8), transparent);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover::after {
    transform: scaleX(1);
  }
`

const CyberInfoBox = styled.div`
  background: ${(props) => (props.color === "green" ? "rgba(0, 100, 50, 0.3)" : "rgba(100, 100, 0, 0.3)")};
  border: 1px solid ${(props) => (props.color === "green" ? "rgba(0, 255, 100, 0.3)" : "rgba(255, 255, 0, 0.3)")};
  border-radius: 4px;
  color: ${(props) => (props.color === "green" ? "rgba(100, 255, 150, 0.9)" : "rgba(255, 255, 150, 0.9)")};
`

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
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"
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

  if (isCyberpunk) {
    return (
      <div className="space-y-4">
        <CyberCard className="p-4">
          <CyberTitle className="mb-2 font-mono">LIQUIDITY POOL STATUS</CyberTitle>
          <CyberInfoBox className="p-3 rounded-md text-sm mb-3" color={isTokenTradable ? "green" : "yellow"}>
            <p className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                {isTokenTradable
                  ? `Your ${tokenA.symbol} token is now tradable on Jupiter! The liquidity pool has been successfully created and indexed.`
                  : `Your liquidity pool has been created but may not be indexed by Jupiter yet. This typically takes 24-48 hours.`}
              </span>
            </p>
          </CyberInfoBox>

          <div className="space-y-2 mt-4">
            <div className="flex justify-between">
              <span className="text-sm text-cyan-200">Pool Status:</span>
              <span className="text-sm font-medium">
                {isTokenTradable ? (
                  <span className="text-green-400">Active & Indexed</span>
                ) : (
                  <span className="text-yellow-400">Created, Awaiting Indexing</span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-cyan-200">Jupiter Integration:</span>
              <span className="text-sm font-medium">
                {isTokenTradable ? (
                  <span className="text-green-400">Available</span>
                ) : (
                  <span className="text-yellow-400">Pending</span>
                )}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <CyberLink
              href={`https://explorer.solana.com/address/${tokenA.mintAddress}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm"
            >
              View {tokenA.symbol} Token on Solana Explorer <ExternalLink className="h-3 w-3 ml-1" />
            </CyberLink>
          </div>
        </CyberCard>

        <CyberCard className="p-4">
          <CyberTitle className="mb-2 font-mono">CHECK JUPITER INTEGRATION</CyberTitle>
          <p className="text-sm mb-3 text-cyan-200">
            You can manually check if your token is tradable on Jupiter using these methods:
          </p>
          <ol className="list-decimal list-inside text-sm space-y-2 text-cyan-100">
            <li>
              <strong className="text-cyan-300">Jupiter Swap UI:</strong> Visit{" "}
              <CyberLink
                href={`https://jup.ag/swap/${tokenB.symbol}-${tokenA.symbol}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Jupiter Swap
              </CyberLink>{" "}
              and try to swap {tokenB.symbol} to {tokenA.symbol}.
            </li>
            <li>
              <strong className="text-cyan-300">API Check:</strong> Use the Jupiter API to check if your token is
              tradable by making a request to:{" "}
              <code className="bg-[rgba(16,16,48,0.6)] p-1 rounded text-cyan-300">
                https://quote-api.jup.ag/v6/quote?inputMint={tokenB.mintAddress}&outputMint={tokenA.mintAddress}
                &amount=10000000
              </code>
            </li>
            <li>
              <strong className="text-cyan-300">Refresh Token Status:</strong> Click the button below to check if your
              token is now tradable on Jupiter.
            </li>
          </ol>
          <div className="mt-4">
            <CyberButton className="w-full font-mono" onClick={handleCheckStatus} disabled={checkingTradability}>
              {checkingTradability ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  CHECKING...
                </span>
              ) : (
                "CHECK TOKEN STATUS"
              )}
            </CyberButton>
          </div>
        </CyberCard>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc]">
        <h3 className="font-bold mb-2 font-mono">LIQUIDITY POOL STATUS</h3>
        <div
          className={`bg-${isTokenTradable ? "green" : "yellow"}-100 border border-${isTokenTradable ? "green" : "yellow"}-300 p-3 rounded-md text-sm mb-3`}
        >
          <p className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              {isTokenTradable
                ? `Your ${tokenA.symbol} token is now tradable on Jupiter! The liquidity pool has been successfully created and indexed.`
                : `Your liquidity pool has been created but may not be indexed by Jupiter yet. This typically takes 24-48 hours.`}
            </span>
          </p>
        </div>

        <div className="space-y-2 mt-4">
          <div className="flex justify-between">
            <span className="text-sm">Pool Status:</span>
            <span className="text-sm font-medium">
              {isTokenTradable ? (
                <span className="text-green-600">Active & Indexed</span>
              ) : (
                <span className="text-yellow-600">Created, Awaiting Indexing</span>
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Jupiter Integration:</span>
            <span className="text-sm font-medium">
              {isTokenTradable ? (
                <span className="text-green-600">Available</span>
              ) : (
                <span className="text-yellow-600">Pending</span>
              )}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <a
            href={`https://explorer.solana.com/address/${tokenA.mintAddress}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center text-sm"
          >
            View {tokenA.symbol} Token on Solana Explorer <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
      </div>

      <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc]">
        <h3 className="font-bold mb-2 font-mono">CHECK JUPITER INTEGRATION</h3>
        <p className="text-sm mb-3">You can manually check if your token is tradable on Jupiter using these methods:</p>
        <ol className="list-decimal list-inside text-sm space-y-2">
          <li>
            <strong>Jupiter Swap UI:</strong> Visit{" "}
            <a
              href={`https://jup.ag/swap/${tokenB.symbol}-${tokenA.symbol}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Jupiter Swap
            </a>{" "}
            and try to swap {tokenB.symbol} to {tokenA.symbol}.
          </li>
          <li>
            <strong>API Check:</strong> Use the Jupiter API to check if your token is tradable by making a request to:{" "}
            <code className="bg-gray-100 p-1 rounded">
              https://quote-api.jup.ag/v6/quote?inputMint={tokenB.mintAddress}&outputMint={tokenA.mintAddress}
              &amount=10000000
            </code>
          </li>
          <li>
            <strong>Refresh Token Status:</strong> Click the button below to check if your token is now tradable on
            Jupiter.
          </li>
        </ol>
        <div className="mt-4">
          <SoundButton
            className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
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
          </SoundButton>
        </div>
      </div>
    </div>
  )
}
