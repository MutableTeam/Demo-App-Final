"use client"

import { useState } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"

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
    border-color: rgba(0, 255, 255, 0.8);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
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

interface SwapSettingsProps {
  slippageBps: number
  onSlippageChange: (slippageBps: number) => void
  isCyberpunk?: boolean
}

export function SwapSettings({ slippageBps, onSlippageChange, isCyberpunk = false }: SwapSettingsProps) {
  const [open, setOpen] = useState(false)
  const { styleMode } = useCyberpunkTheme()
  const isActuallyCyberpunk = isCyberpunk || styleMode === "cyberpunk"

  // Convert basis points to percentage for display
  const slippagePercentage = slippageBps / 100

  // Predefined slippage options
  const slippageOptions = [0.1, 0.5, 1.0, 2.0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {isActuallyCyberpunk ? (
          <CyberButton variant="outline" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </CyberButton>
        ) : (
          <Button variant="outline" size="icon" className="h-8 w-8 border-2 border-black">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </PopoverTrigger>
      {isActuallyCyberpunk ? (
        <CyberPopoverContent className="w-80" side="bottom" align="end">
          <div className="p-4">
            <h4 className="font-medium mb-2 text-cyan-300">Swap Settings</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-cyan-200">Slippage Tolerance</span>
                  <span className="text-sm font-bold text-cyan-300">{slippagePercentage.toFixed(2)}%</span>
                </div>
                <div className="flex gap-2 mb-2">
                  {slippageOptions.map((option) => (
                    <button
                      key={option}
                      className={cn(
                        "px-2 py-1 text-xs rounded border",
                        slippagePercentage === option
                          ? "bg-cyan-900/50 border-cyan-500 text-cyan-300"
                          : "bg-transparent border-cyan-700/50 text-cyan-400 hover:border-cyan-500",
                      )}
                      onClick={() => onSlippageChange(option * 100)}
                    >
                      {option}%
                    </button>
                  ))}
                </div>
                <Slider
                  value={[slippageBps]}
                  min={10}
                  max={500}
                  step={5}
                  onValueChange={(value) => onSlippageChange(value[0])}
                  className="[&_[role=slider]]:bg-cyan-500 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-[0_0_5px_rgba(0,255,255,0.5)]"
                />
              </div>
              <div className="text-xs text-cyan-400">
                <p>
                  Slippage tolerance is the maximum price difference you're willing to accept between the estimated and
                  actual price.
                </p>
                <p className="mt-1">
                  Higher slippage increases the chance of your transaction succeeding, but you may get a worse price.
                </p>
              </div>
            </div>
          </div>
        </CyberPopoverContent>
      ) : (
        <PopoverContent className="w-80" side="bottom" align="end">
          <div className="p-4">
            <h4 className="font-medium mb-2">Swap Settings</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Slippage Tolerance</span>
                  <span className="text-sm font-bold">{slippagePercentage.toFixed(2)}%</span>
                </div>
                <div className="flex gap-2 mb-2">
                  {slippageOptions.map((option) => (
                    <button
                      key={option}
                      className={cn(
                        "px-2 py-1 text-xs rounded border",
                        slippagePercentage === option
                          ? "bg-blue-100 border-blue-300 text-blue-800"
                          : "bg-transparent border-gray-300 text-gray-600 hover:border-blue-300",
                      )}
                      onClick={() => onSlippageChange(option * 100)}
                    >
                      {option}%
                    </button>
                  ))}
                </div>
                <Slider
                  value={[slippageBps]}
                  min={10}
                  max={500}
                  step={5}
                  onValueChange={(value) => onSlippageChange(value[0])}
                />
              </div>
              <div className="text-xs text-gray-500">
                <p>
                  Slippage tolerance is the maximum price difference you're willing to accept between the estimated and
                  actual price.
                </p>
                <p className="mt-1">
                  Higher slippage increases the chance of your transaction succeeding, but you may get a worse price.
                </p>
              </div>
            </div>
          </div>
        </PopoverContent>
      )}
    </Popover>
  )
}
