"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Monitor, Smartphone } from "lucide-react"
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
    onPlatformSelected(platform)
  }

  const platforms = [
    {
      type: "desktop" as PlatformType,
      title: "Desktop",
      icon: Monitor,
      image: "/images/retro-desktop-gaming.png",
    },
    {
      type: "mobile" as PlatformType,
      title: "Mobile",
      icon: Smartphone,
      image: "/images/retro-mobile-gaming.png",
    },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Logo */}
      <div className="text-center mb-8">
        <Image
          src={LOGOS.MUTABLE.TRANSPARENT || "/placeholder.svg"}
          alt="Mutable Logo"
          width={200}
          height={120}
          className={cn(
            "w-auto h-auto max-w-[200px] mx-auto",
            isCyberpunk ? "filter drop-shadow-[0_0_15px_rgba(0,255,255,0.7)]" : "filter drop-shadow-lg",
          )}
        />
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {platforms.map((platform) => {
          const IconComponent = platform.icon
          const isSelected = selectedPlatform === platform.type

          return (
            <Card
              key={platform.type}
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer group",
                "aspect-[4/3] border-2 p-0",
                isCyberpunk
                  ? [
                      "bg-gradient-to-br from-slate-900/90 to-purple-900/90",
                      "border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]",
                      "backdrop-blur-sm",
                      isSelected && "border-cyan-400/80 shadow-[0_0_25px_rgba(0,255,255,0.5)]",
                      "hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]",
                    ]
                  : [
                      "bg-gradient-to-br from-slate-900/90 to-purple-900/90",
                      "border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]",
                      "backdrop-blur-sm",
                      isSelected && "border-cyan-400/80 shadow-[0_0_25px_rgba(0,255,255,0.5)]",
                      "hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]",
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
                  className="object-cover opacity-80 group-hover:opacity-90 transition-opacity duration-300"
                />
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t transition-all duration-300",
                    "from-slate-900/80 via-slate-900/40 to-slate-900/20",
                    isSelected && "from-primary/30 via-primary/15 to-transparent",
                  )}
                />
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center p-8">
                {/* Icon */}
                <div
                  className={cn(
                    "p-6 rounded-full mb-4 transition-all duration-300",
                    "bg-gradient-to-br from-cyan-500/30 to-purple-500/30",
                    "border border-cyan-500/50",
                    "shadow-[0_0_15px_rgba(0,255,255,0.3)]",
                    "group-hover:shadow-[0_0_25px_rgba(0,255,255,0.5)]",
                    isSelected && "scale-110 shadow-[0_0_30px_rgba(0,255,255,0.7)]",
                  )}
                >
                  <IconComponent
                    className={cn("h-12 w-12 transition-all duration-300 text-cyan-400", isSelected && "scale-110")}
                  />
                </div>

                {/* Title */}
                <h3
                  className={cn(
                    "text-3xl font-bold transition-all duration-300 text-cyan-400 font-mono tracking-wider",
                    isSelected && "scale-110",
                  )}
                >
                  {platform.title}
                </h3>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
