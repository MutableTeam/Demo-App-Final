"use client"

import { useState } from "react"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import {
  CyberCard,
  CyberCardHeader,
  CyberCardTitle,
  CyberCardContent,
  CyberButton,
  GridBackground,
} from "./styled-components"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Settings } from "lucide-react"

export function CyberpunkThemeSettings() {
  const { glowIntensity, animationIntensity, setGlowIntensity, setAnimationIntensity } = useCyberpunkTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <CyberButton
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full h-10 w-10 flex items-center justify-center"
      >
        <Settings className="h-5 w-5" />
      </CyberButton>

      {isOpen && (
        <CyberCard className="absolute bottom-12 right-0 w-64">
          <GridBackground />
          <CyberCardHeader>
            <CyberCardTitle>Theme Settings</CyberCardTitle>
          </CyberCardHeader>
          <CyberCardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-cyan-400">Glow Intensity</Label>
              <RadioGroup
                value={glowIntensity}
                onValueChange={(value) => setGlowIntensity(value as "low" | "medium" | "high")}
                className="flex space-x-2"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="low" id="glow-low" />
                  <Label htmlFor="glow-low">Low</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="medium" id="glow-medium" />
                  <Label htmlFor="glow-medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="high" id="glow-high" />
                  <Label htmlFor="glow-high">High</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-cyan-400">Animation Intensity</Label>
              <RadioGroup
                value={animationIntensity}
                onValueChange={(value) => setAnimationIntensity(value as "low" | "medium" | "high")}
                className="flex space-x-2"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="low" id="anim-low" />
                  <Label htmlFor="anim-low">Low</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="medium" id="anim-medium" />
                  <Label htmlFor="anim-medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="high" id="anim-high" />
                  <Label htmlFor="anim-high">High</Label>
                </div>
              </RadioGroup>
            </div>
          </CyberCardContent>
        </CyberCard>
      )}
    </div>
  )
}
