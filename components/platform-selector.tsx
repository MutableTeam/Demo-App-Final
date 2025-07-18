"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Monitor, Smartphone, Gamepad2 } from "lucide-react"
import { usePlatform, type PlatformType } from "@/contexts/platform-context"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { LOGOS } from "@/utils/image-paths"

interface PlatformSelectorProps {
  onPlatformSelected: (platform: PlatformType) => void
}

export default function PlatformSelector({ onPlatformSelected }: PlatformSelectorProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null)
  const { setPlatform } = usePlatform()
  const { styleMode } = useCyberpunkTheme()

  const isCyberpunk = styleMode === "cyberpunk"

  const handlePlatformSelect = (platform: PlatformType) => {
    setSelectedPlatform(platform)
    setPlatform(platform)
    // Small delay for visual feedback
    setTimeout(() => {
      onPlatformSelected(platform)
    }, 300)
  }

  const platforms = [
    {
      type: "desktop" as PlatformType,
      title: "Desktop",
      icon: Monitor,
      image: "/images/desktop-gaming-setup.png",
      gradient: "from-blue-500/20 to-purple-600/20",
      hoverGradient: "from-blue-500/30 to-purple-600/30",
    },
    {
      type: "mobile" as PlatformType,
      title: "Mobile",
      icon: Smartphone,
      image: "/images/mobile-gaming-hands.png",
      gradient: "from-green-500/20 to-teal-600/20",
      hoverGradient: "from-green-500/30 to-teal-600/30",
    },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Logo */}
      <div className="text-center mb-12">
        <Image
          src={LOGOS.MUTABLE.TRANSPARENT || "/placeholder.svg"}
          alt="Mutable Logo"
          width={280}
          height={160}
          className={cn(
            "w-auto h-auto max-w-[280px] mx-auto",
            isCyberpunk ? "filter drop-shadow-[0_0_20px_rgba(0,255,255,0.8)]" : "filter drop-shadow-xl",
          )}
        />
        <h1
          className={cn(
            "text-2xl font-bold mt-6 mb-2",
            isCyberpunk
              ? "text-cyan-400 font-mono tracking-wider"
              : "bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent",
          )}
        >
          Choose Platform
        </h1>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {platforms.map((platform) => {
          const IconComponent = platform.icon
          const isSelected = selectedPlatform === platform.type

          return (
            <Card
              key={platform.type}
              className={cn(
                "relative overflow-hidden transition-all duration-500 hover:scale-105 cursor-pointer group",
                "aspect-[4/3] border-2 p-0",
                isCyberpunk
                  ? [
                      "bg-gradient-to-br from-slate-900/95 to-purple-900/95",
                      "border-cyan-500/40 shadow-[0_0_20px_rgba(0,255,255,0.3)]",
                      "backdrop-blur-sm",
                      isSelected && "border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.6)] scale-105",
                      "hover:border-cyan-400/80 hover:shadow-[0_0_25px_rgba(0,255,255,0.5)]",
                    ]
                  : [
                      "bg-gradient-to-br from-background to-muted/50",
                      isSelected
                        ? "border-primary shadow-xl shadow-primary/30 scale-105"
                        : "border-border hover:border-primary/60 hover:shadow-lg",
                    ],
              )}
              onClick={() => handlePlatformSelect(platform.type)}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={platform.image || "/placeholder.svg"}
                  alt={`${platform.title} Gaming`}
                  fill
                  className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500"
                />
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t transition-all duration-500",
                    isCyberpunk
                      ? "from-slate-900/90 via-slate-900/60 to-slate-900/30"
                      : "from-background/90 via-background/60 to-background/30",
                    isSelected && "from-primary/20 via-primary/10 to-transparent",
                  )}
                />
              </div>

              {/* Cyberpunk glow effect */}
              {isCyberpunk && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>
              )}

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center p-8">
                {/* Icon */}
                <div
                  className={cn(
                    "p-6 rounded-full mb-6 transition-all duration-500",
                    isCyberpunk
                      ? [
                          "bg-gradient-to-br from-cyan-500/30 to-purple-500/30",
                          "border-2 border-cyan-500/60",
                          "shadow-[0_0_20px_rgba(0,255,255,0.4)]",
                          "group-hover:shadow-[0_0_30px_rgba(0,255,255,0.6)]",
                          isSelected && "scale-110 shadow-[0_0_40px_rgba(0,255,255,0.8)]",
                        ]
                      : [
                          `bg-gradient-to-br ${platform.gradient}`,
                          `group-hover:bg-gradient-to-br group-hover:${platform.hoverGradient}`,
                          "border-2 border-primary/20 group-hover:border-primary/40",
                          "shadow-lg group-hover:shadow-xl",
                          isSelected && "scale-110 border-primary shadow-2xl shadow-primary/50",
                        ],
                  )}
                >
                  <IconComponent
                    className={cn(
                      "h-12 w-12 transition-all duration-500",
                      isCyberpunk ? "text-cyan-400" : "text-primary",
                      isSelected && "scale-110",
                    )}
                  />
                </div>

                {/* Title */}
                <h3
                  className={cn(
                    "text-2xl font-bold mb-4 transition-all duration-500",
                    isCyberpunk ? "text-cyan-400 font-mono tracking-wider" : "text-foreground",
                    isSelected && "scale-110",
                  )}
                >
                  {platform.title}
                </h3>

                {/* Selection Button */}
                <Button
                  className={cn(
                    "px-8 py-3 text-lg font-semibold transition-all duration-500",
                    isCyberpunk
                      ? [
                          "bg-gradient-to-r from-cyan-600/80 to-purple-600/80",
                          "hover:from-cyan-500 hover:to-purple-500",
                          "border border-cyan-500/60",
                          "text-white font-mono tracking-wide",
                          "shadow-[0_0_15px_rgba(0,255,255,0.4)]",
                          "hover:shadow-[0_0_25px_rgba(0,255,255,0.6)]",
                          isSelected &&
                            "bg-gradient-to-r from-cyan-400 to-purple-400 shadow-[0_0_30px_rgba(0,255,255,0.8)]",
                        ]
                      : [
                          "bg-gradient-to-r hover:shadow-lg",
                          platform.type === "desktop"
                            ? "from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                            : "from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700",
                          isSelected && "shadow-xl shadow-primary/50",
                        ],
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePlatformSelect(platform.type)
                  }}
                >
                  {isSelected ? (
                    <>
                      <Gamepad2 className="mr-2 h-5 w-5" />
                      Selected
                    </>
                  ) : (
                    "Select"
                  )}
                </Button>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div
                  className={cn(
                    "absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center",
                    isCyberpunk
                      ? "bg-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.8)]"
                      : "bg-primary shadow-lg shadow-primary/50",
                  )}
                >
                  <Gamepad2 className="h-3 w-3 text-white" />
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
