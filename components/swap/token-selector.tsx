"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown } from "lucide-react"
import { SUPPORTED_TOKENS } from "@/config/token-registry"
import type { TokenConfig } from "@/types/token-types"
import { cn } from "@/lib/utils"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"

// Cyberpunk styled components
const glowPulse = keyframes`
  0% { box-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.3); }
  50% { box-shadow: 0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.5); }
  100% { box-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.3); }
`

const CyberButton = styled(Button)`
  background: rgba(16, 16, 48, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.5);
  color: rgba(0, 255, 255, 0.9);
  
  &:hover:not(:disabled) {
    background: rgba(16, 16, 48, 0.9);
    border-color: rgba255,255,0.9);
  
  &:hover:not(:disabled) {
    background: rgba(16, 16, 48, 0.9);
    border-color: rgba(0, 255, 255, 0.8);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }
  
  &:disabled {
    background: rgba(50, 50, 70, 0.5);
    border-color: rgba(100, 100, 150, 0.3);
    color: rgba(200, 200, 220, 0.5);
  }
`

const CyberPopoverContent = styled(PopoverContent)`
  background: rgba(10, 10, 40, 0.9);
  border: 1px solid rgba(0, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
  }
`

const CyberTokenItem = styled.div`
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 255, 255, 0.1);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
  }
`

interface TokenSelectorProps {
  selectedToken: TokenConfig
  onTokenSelect: (token: TokenConfig) => void
  otherToken: TokenConfig
  disabled?: boolean
  isCyberpunk?: boolean
}

export function TokenSelector({
  selectedToken,
  onTokenSelect,
  otherToken,
  disabled = false,
  isCyberpunk = false,
}: TokenSelectorProps) {
  const [open, setOpen] = useState(false)

  // Filter out the other token from the list
  const availableTokens = SUPPORTED_TOKENS.filter((token) => token.id !== otherToken.id)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {isCyberpunk ? (
          <CyberButton
            variant="outline"
            size="sm"
            className={cn("flex items-center gap-2 h-10 px-3", disabled && "opacity-50 cursor-not-allowed")}
            disabled={disabled}
          >
            <Image
              src={selectedToken.logoURI || "/placeholder.svg"}
              alt={selectedToken.symbol}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span>{selectedToken.symbol}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </CyberButton>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "flex items-center gap-2 h-10 px-3 border-2 border-black",
              disabled && "opacity-50 cursor-not-allowed",
            )}
            disabled={disabled}
          >
            <Image
              src={selectedToken.logoURI || "/placeholder.svg"}
              alt={selectedToken.symbol}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span>{selectedToken.symbol}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        )}
      </PopoverTrigger>
      {isCyberpunk ? (
        <CyberPopoverContent className="w-[200px] p-0">
          <div className="max-h-[300px] overflow-y-auto">
            {availableTokens.map((token) => (
              <CyberTokenItem
                key={token.id}
                className="flex items-center gap-2 p-2 cursor-pointer"
                onClick={() => {
                  onTokenSelect(token)
                  setOpen(false)
                }}
              >
                <Image
                  src={token.logoURI || "/placeholder.svg"}
                  alt={token.symbol}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <div>
                  <div className="font-medium text-cyan-200">{token.symbol}</div>
                  <div className="text-xs text-cyan-400">{token.name}</div>
                </div>
              </CyberTokenItem>
            ))}
          </div>
        </CyberPopoverContent>
      ) : (
        <PopoverContent className="w-[200px] p-0">
          <div className="max-h-[300px] overflow-y-auto">
            {availableTokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onTokenSelect(token)
                  setOpen(false)
                }}
              >
                <Image
                  src={token.logoURI || "/placeholder.svg"}
                  alt={token.symbol}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <div>
                  <div className="font-medium">{token.symbol}</div>
                  <div className="text-xs text-gray-500">{token.name}</div>
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      )}
    </Popover>
  )
}
