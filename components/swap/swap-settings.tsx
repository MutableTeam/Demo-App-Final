"use client"

import { useState } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface SwapSettingsProps {
  slippageBps: number
  onSlippageChange: (slippageBps: number) => void
}

export function SwapSettings({ slippageBps, onSlippageChange }: SwapSettingsProps) {
  const [open, setOpen] = useState(false)

  // Convert basis points to percentage for display
  const slippagePercentage = slippageBps / 100

  // Predefined slippage options
  const slippageOptions = [0.1, 0.5, 1.0, 2.0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 border-2 border-black bg-transparent">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
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
    </Popover>
  )
}
