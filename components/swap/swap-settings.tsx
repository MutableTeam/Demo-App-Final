"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Settings, Zap, Shield } from "lucide-react"

interface SwapSettings {
  slippageTolerance: number
  transactionDeadline: number
  autoRouting: boolean
  expertMode: boolean
  soundEffects: boolean
  confirmTransactions: boolean
}

export function SwapSettings() {
  const [settings, setSettings] = useState<SwapSettings>({
    slippageTolerance: 0.5,
    transactionDeadline: 20,
    autoRouting: true,
    expertMode: false,
    soundEffects: true,
    confirmTransactions: true,
  })

  const [customSlippage, setCustomSlippage] = useState("")

  const presetSlippages = [0.1, 0.5, 1.0]

  const handleSlippageChange = (value: number) => {
    setSettings({ ...settings, slippageTolerance: value })
    setCustomSlippage("")
  }

  const handleCustomSlippageChange = (value: string) => {
    setCustomSlippage(value)
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue > 0 && numValue <= 50) {
      setSettings({ ...settings, slippageTolerance: numValue })
    }
  }

  const resetToDefaults = () => {
    setSettings({
      slippageTolerance: 0.5,
      transactionDeadline: 20,
      autoRouting: true,
      expertMode: false,
      soundEffects: true,
      confirmTransactions: true,
    })
    setCustomSlippage("")
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Settings className="h-5 w-5 text-orange-600" />
          Swap Settings
        </CardTitle>
        <CardDescription className="text-gray-600">Customize your trading preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Slippage Tolerance */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Slippage Tolerance</Label>
          <div className="flex gap-2">
            {presetSlippages.map((slippage) => (
              <Button
                key={slippage}
                variant={settings.slippageTolerance === slippage ? "default" : "outline"}
                size="sm"
                onClick={() => handleSlippageChange(slippage)}
                className={
                  settings.slippageTolerance === slippage
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                }
              >
                {slippage}%
              </Button>
            ))}
            <div className="relative">
              <Input
                type="number"
                placeholder="Custom"
                value={customSlippage}
                onChange={(e) => handleCustomSlippageChange(e.target.value)}
                className="w-20 text-center bg-white border-gray-300"
                min="0"
                max="50"
                step="0.1"
              />
              {customSlippage && <span className="absolute right-2 top-2 text-xs text-gray-500">%</span>}
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Your transaction will revert if the price changes unfavorably by more than this percentage.
          </p>
          {settings.slippageTolerance > 5 && (
            <div className="flex items-center gap-2 p-2 rounded bg-yellow-50 border border-yellow-200">
              <Shield className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">High slippage tolerance may result in unfavorable trades</span>
            </div>
          )}
        </div>

        {/* Transaction Deadline */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Transaction Deadline</Label>
          <div className="space-y-2">
            <Slider
              value={[settings.transactionDeadline]}
              onValueChange={(value) => setSettings({ ...settings, transactionDeadline: value[0] })}
              max={60}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>1 minute</span>
              <span className="font-medium">{settings.transactionDeadline} minutes</span>
              <span>60 minutes</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Your transaction will be cancelled if it is pending for more than this long.
          </p>
        </div>

        {/* Toggle Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Auto Routing</Label>
              <p className="text-xs text-gray-500">Automatically find the best route for your swap</p>
            </div>
            <Switch
              checked={settings.autoRouting}
              onCheckedChange={(checked) => setSettings({ ...settings, autoRouting: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-gray-700">Expert Mode</Label>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                  Advanced
                </Badge>
              </div>
              <p className="text-xs text-gray-500">Allow high price impact trades and skip confirmation</p>
            </div>
            <Switch
              checked={settings.expertMode}
              onCheckedChange={(checked) => setSettings({ ...settings, expertMode: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Sound Effects</Label>
              <p className="text-xs text-gray-500">Play sounds for successful transactions</p>
            </div>
            <Switch
              checked={settings.soundEffects}
              onCheckedChange={(checked) => setSettings({ ...settings, soundEffects: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Confirm Transactions</Label>
              <p className="text-xs text-gray-500">Show confirmation dialog before executing swaps</p>
            </div>
            <Switch
              checked={settings.confirmTransactions}
              onCheckedChange={(checked) => setSettings({ ...settings, confirmTransactions: checked })}
            />
          </div>
        </div>

        {/* Expert Mode Warning */}
        {settings.expertMode && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">Expert Mode Enabled</span>
            </div>
            <p className="text-xs text-red-600">
              Expert mode allows high price impact trades and skips confirmation dialogs. Use with caution.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <Button
            onClick={resetToDefaults}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
          >
            Reset to Defaults
          </Button>
          <Button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
            <Zap className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
