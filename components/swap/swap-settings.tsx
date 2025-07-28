"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import SoundButton from "../sound-button"

interface SwapSettingsProps {
  slippageBps: number
  onSlippageChange: (value: number) => void
  isCyberpunk: boolean
}

export function SwapSettings({ slippageBps, onSlippageChange, isCyberpunk }: SwapSettingsProps) {
  const [customSlippage, setCustomSlippage] = useState((slippageBps / 100).toString())

  const handleSlippageSelect = (bps: number) => {
    onSlippageChange(bps)
    setCustomSlippage((bps / 100).toString())
  }

  const handleCustomSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomSlippage(value)
    const percentage = Number.parseFloat(value)
    if (!isNaN(percentage) && percentage >= 0) {
      onSlippageChange(Math.round(percentage * 100))
    }
  }

  const slippageOptions = [
    { label: "0.1%", value: 10 },
    { label: "0.5%", value: 50 },
    { label: "1.0%", value: 100 },
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8",
            isCyberpunk ? "text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-100" : "text-gray-600 hover:bg-gray-100",
          )}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          isCyberpunk
            ? "bg-black/90 border-cyan-500/50 text-cyan-200"
            : "bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        )}
      >
        <DialogHeader>
          <DialogTitle className={cn(isCyberpunk ? "text-cyan-400" : "text-black")}>Swap Settings</DialogTitle>
          <DialogDescription className={cn(isCyberpunk ? "text-cyan-300/70" : "text-gray-600")}>
            Customize your transaction settings.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="slippage" className={cn(isCyberpunk ? "text-cyan-300" : "text-black")}>
              Slippage Tolerance
            </Label>
            <div className="flex items-center gap-2">
              {slippageOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={slippageBps === option.value ? "default" : "outline"}
                  onClick={() => handleSlippageSelect(option.value)}
                  className={cn(
                    isCyberpunk
                      ? slippageBps === option.value
                        ? "bg-cyan-500 text-black"
                        : "border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20"
                      : slippageBps === option.value
                        ? "bg-black text-white"
                        : "border-black",
                  )}
                >
                  {option.label}
                </Button>
              ))}
              <div className="relative flex-1">
                <Input
                  id="slippage"
                  type="number"
                  value={customSlippage}
                  onChange={handleCustomSlippageChange}
                  className={cn(
                    "pr-8",
                    isCyberpunk ? "bg-black/40 border-cyan-500/50 focus:border-cyan-400" : "border-2 border-black",
                  )}
                  step="0.1"
                  min="0"
                />
                <span
                  className={cn(
                    "absolute inset-y-0 right-3 flex items-center text-sm",
                    isCyberpunk ? "text-cyan-400/70" : "text-gray-500",
                  )}
                >
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <SoundButton
              className={cn(
                isCyberpunk ? "bg-cyan-500 hover:bg-cyan-600 text-black" : "bg-black text-white hover:bg-gray-800",
              )}
            >
              Done
            </SoundButton>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
