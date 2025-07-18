"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Monitor, Smartphone, Gamepad2 } from "lucide-react"
import { usePlatform, type PlatformType } from "@/contexts/platform-context"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import Image from "next/image"
import { LOGOS } from "@/utils/image-paths"

interface PlatformSelectorProps {
  onPlatformSelected?: (platform: PlatformType) => void
}

export default function PlatformSelector({ onPlatformSelected }: PlatformSelectorProps) {
  const { setPlatformType } = usePlatform()
  const { styleMode } = useCyberpunkTheme()
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null)

  const handlePlatformSelect = (platform: PlatformType) => {
    setSelectedPlatform(platform)
    setPlatformType(platform)
    onPlatformSelected?.(platform)
  }

  const platforms = [
    {
      type: "desktop" as PlatformType,
      title: "Desktop",
      description: "Keyboard & Mouse Controls",
      icon: Monitor,
      features: ["WASD Movement", "Mouse Aiming", "Keyboard Shortcuts", "Full Screen Gaming"],
      badge: "Recommended",
    },
    {
      type: "mobile" as PlatformType,
      title: "Mobile",
      description: "Touch Controls",
      icon: Smartphone,
      features: ["Touch Movement", "Tap to Shoot", "Gesture Controls", "Optimized UI"],
      badge: "Touch Friendly",
    },
  ]

  const isCyberpunk = styleMode === "cyberpunk"

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 p-4">
      {/* Logo */}
      <div className="text-center mb-8">
        <Image
          src={LOGOS.MUTABLE.TRANSPARENT || "/placeholder.svg"}
          alt="Mutable Logo"
          width={300}
          height={180}
          className={`w-auto h-auto max-w-[300px] mx-auto ${
            isCyberpunk ? "filter drop-shadow-[0_0_15px_rgba(0,255,255,0.7)] animate-pulse" : "filter drop-shadow-lg"
          }`}
        />
      </div>

      {/* Platform Selection Card */}
      <Card
        className={`${
          isCyberpunk
            ? "bg-gradient-to-br from-slate-900/90 to-purple-900/90 border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)] backdrop-blur-sm"
            : "bg-card border-border shadow-lg"
        }`}
      >
        <CardHeader
          className={`text-center ${isCyberpunk ? "border-b border-cyan-500/30 bg-slate-900/70" : "border-b"}`}
        >
          <CardTitle
            className={`flex items-center justify-center gap-3 text-2xl ${
              isCyberpunk
                ? "text-cyan-400 font-mono font-bold tracking-wider text-shadow-[0_0_5px_rgba(0,255,255,0.7)]"
                : "text-foreground"
            }`}
          >
            <Gamepad2 className="h-8 w-8" />
            Select Your Platform
          </CardTitle>
          <CardDescription
            className={`text-lg ${isCyberpunk ? "text-cyan-400/80 font-mono" : "text-muted-foreground"}`}
          >
            Choose your preferred gaming experience
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {platforms.map((platform) => {
              const IconComponent = platform.icon
              return (
                <Button
                  key={platform.type}
                  onClick={() => handlePlatformSelect(platform.type)}
                  variant="outline"
                  className={`h-auto min-h-[280px] w-full flex flex-col items-center justify-center gap-4 p-8 text-left transition-all duration-300 ${
                    isCyberpunk
                      ? `bg-gradient-to-br from-slate-800/80 to-purple-800/80 border-2 border-cyan-500/50 
                         hover:bg-gradient-to-br hover:from-cyan-900/20 hover:to-purple-900/20 
                         hover:border-cyan-400/80 hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] 
                         hover:-translate-y-1 active:translate-y-0`
                      : `bg-background border-2 border-border hover:bg-accent hover:border-primary/50 
                         hover:shadow-lg hover:-translate-y-1 active:translate-y-0`
                  }`}
                >
                  <div className="flex flex-col items-center gap-4 w-full">
                    {/* Icon and Title */}
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-12 w-12 ${isCyberpunk ? "text-cyan-400" : "text-primary"}`} />
                      <span
                        className={`text-2xl font-bold ${
                          isCyberpunk ? "text-cyan-400 font-mono tracking-wider" : "text-foreground"
                        }`}
                      >
                        {platform.title}
                      </span>
                    </div>

                    {/* Badge */}
                    <Badge
                      className={`text-sm px-3 py-1 ${
                        isCyberpunk
                          ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 text-cyan-400 font-mono font-bold tracking-wide"
                          : "bg-primary/10 text-primary border-primary/20"
                      }`}
                    >
                      {platform.badge}
                    </Badge>

                    {/* Description */}
                    <p
                      className={`text-lg text-center ${
                        isCyberpunk ? "text-cyan-300/90 font-mono" : "text-muted-foreground"
                      }`}
                    >
                      {platform.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2 w-full">
                      {platform.features.map((feature, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-2 text-base ${
                            isCyberpunk ? "text-cyan-200/80 font-mono" : "text-muted-foreground"
                          }`}
                        >
                          <span className={`${isCyberpunk ? "text-cyan-400" : "text-primary"}`}>•</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>

          <div className="mt-8 text-center">
            <p className={`text-sm ${isCyberpunk ? "text-cyan-400/70 font-mono" : "text-muted-foreground"}`}>
              You can change this setting later in the game options
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
