"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Settings, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SwapSettingsProps {
  slippageBps: number
  onSlippageChange: (slippageBps: number) => void
}

export function SwapSettings({ slippageBps, onSlippageChange }: SwapSettingsProps) {
  const [autoSlippage, setAutoSlippage] = useState(true)
  const [customSlippage, setCustomSlippage] = useState("")
  const [deadline, setDeadline] = useState("20")
  const [expertMode, setExpertMode] = useState(false)

  // Convert basis points to percentage for display
  const slippagePercentage = slippageBps / 100

  // Predefined slippage options
  const slippageOptions = [0.1, 0.5, 1.0, 2.0]

  const handleSlippageSelect = (percentage: number) => {
    onSlippageChange(percentage * 100)
    setAutoSlippage(false)
    setCustomSlippage("")
  }

  const handleCustomSlippage = (value: string) => {
    setCustomSlippage(value)
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue > 0 && numValue <= 50) {
      onSlippageChange(numValue * 100)
      setAutoSlippage(false)
    }
  }

  return (
    <Card className="w-full bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
          <Settings className="h-5 w-5 text-orange-600" />
          Swap Settings
        </CardTitle>
        <CardDescription className="text-gray-600">Configure your swap preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Slippage Tolerance */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">Slippage Tolerance</Label>
            <span className="text-sm font-bold text-gray-900">{slippagePercentage.toFixed(2)}%</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {slippageOptions.map((option) => (
              <Button
                key={option}
                variant={Math.abs(slippagePercentage - option) < 0.01 ? "default" : "outline"}
                size="sm"
                onClick={() => handleSlippageSelect(option)}
                className={
                  Math.abs(slippagePercentage - option) < 0.01
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "border-gray-300 hover:bg-gray-50"
                }
              >
                {option}%
              </Button>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Custom"
              value={customSlippage}
              onChange={(e) => handleCustomSlippage(e.target.value)}
              className="w-24 text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              step="0.1"
              min="0.1"
              max="50"
            />
            <span className="text-sm text-gray-600">%</span>
          </div>

          <Slider
            value={[slippageBps]}
            min={10}
            max={500}
            step={5}
            onValueChange={(value) => onSlippageChange(value[0])}
            className="w-full"
          />

          {slippagePercentage < 0.5 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <Info className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700">
                Low slippage may cause transaction failures
              </AlertDescription>
            </Alert>
          )}

          {slippagePercentage > 5 && (
            <Alert className="border-red-200 bg-red-50">
              <Info className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                High slippage may result in unfavorable rates
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Transaction Deadline */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Transaction Deadline</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-20 text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              min="1"
              max="4320"
            />
            <span className="text-sm text-gray-600">minutes</span>
          </div>
          <p className="text-xs text-gray-500">
            Your transaction will revert if it is pending for more than this long.
          </p>
        </div>

        {/* Expert Mode */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-gray-700">Expert Mode</Label>
              <p className="text-xs text-gray-500">Allow high price impact trades</p>
            </div>
            <Switch checked={expertMode} onCheckedChange={setExpertMode} />
          </div>

          {expertMode && (
            <Alert className="border-red-200 bg-red-50">
              <Info className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                Expert mode allows trades with high price impact. Use with caution.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Auto Slippage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-gray-700">Auto Slippage</Label>
              <p className="text-xs text-gray-500">Automatically adjust slippage based on market conditions</p>
            </div>
            <Switch checked={autoSlippage} onCheckedChange={setAutoSlippage} />
          </div>
        </div>

        {/* Information */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-700 space-y-1">
            <p className="font-medium">About Slippage:</p>
            <p>
              Slippage tolerance is the maximum price difference you're willing to accept between the estimated and
              actual price of your trade.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
