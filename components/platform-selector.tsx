"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Monitor, Smartphone, Gamepad2, MousePointer, TouchpadIcon as TouchIcon } from "lucide-react"
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
  const [isProcessing, setIsProcessing] = useState(false)
  const { setPlatform } = usePlatform()
  const { styleMode } = useCyberpunkTheme()

  const isCyberpunk = styleMode === "cyberpunk"

  const handlePlatformSelect = async (platform: PlatformType) => {
    if (isProcessing) return

    console.log(`User selected platform: ${platform}`)
    setSelectedPlatform(platform)
    setIsProcessing(true)

    // Set platform in context
    setPlatform(platform)

    // Small delay for visual feedback
    setTimeout(() => {
      onPlatformSelected(platform)
      setIsProcessing(false)
    }, 800)
  }

  const platforms = [
    {
      type: "desktop" as PlatformType,
      title: "Desktop Gaming",
      description: "Full-featured gaming experience with keyboard and mouse controls",
      icon: Monitor,
      badge: "Recommended",
      features: [
        "WASD Movement Controls",
        "Mouse Aiming & Precision",
        "Keyboard Shortcuts",
        "Full Screen Gaming",
        "Advanced Graphics",
        "Multi-window Support",
      ],
      color: "from-blue-500 to-purple-600",
    },
    {
      type: "mobile" as PlatformType,
      title: "Mobile Gaming",
      description: "Touch-optimized gaming designed for smartphones and tablets",
      icon: Smartphone,
      badge: "Touch Friendly",
      features: [
        "Touch Movement Controls",
        "Tap to Shoot & Interact",
        "Gesture-based Actions",
        "Optimized UI Layout",
        "Portrait & Landscape",
        "Haptic Feedback",
      ],
      color: "from-green-500 to-teal-600",
    },
  ]

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      {/* Logo */}
      <div className="text-center mb-12">
        <Image
          src={LOGOS.MUTABLE.TRANSPARENT || "/placeholder.svg"}
          alt="Mutable Logo"
          width={300}
          height={180}
          className={cn(
            "w-auto h-auto max-w-[300px] mx-auto",
            isCyberpunk ? "filter drop-shadow-[0_0_15px_rgba(0,255,255,0.7)] animate-pulse" : "filter drop-shadow-lg",
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
                "min-h-[400px] border-2",
                isProcessing && "pointer-events-none opacity-75",
                isCyberpunk
                  ? [
                      "bg-gradient-to-br from-slate-900/90 to-purple-900/90",
                      "border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]",
                      "backdrop-blur-sm",
                      isSelected && "border-cyan-400/80 shadow-[0_0_25px_rgba(0,255,255,0.5)]",
                      "hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]",
                    ]
                  : [
                      "bg-gradient-to-br from-background to-muted/30",
                      isSelected
                        ? "border-primary shadow-lg shadow-primary/25 dark:shadow-primary/50"
                        : "border-border hover:border-primary/50",
                    ],
              )}
              onClick={() => handlePlatformSelect(platform.type)}
            >
              {/* Cyberpunk shine effect */}
              {isCyberpunk && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>
              )}

              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center mb-6">
                  <div
                    className={cn(
                      "p-6 rounded-full transition-all duration-300",
                      isCyberpunk
                        ? [
                            "bg-gradient-to-br from-cyan-500/20 to-purple-500/20",
                            "border border-cyan-500/50",
                            "shadow-[0_0_15px_rgba(0,255,255,0.3)]",
                            "group-hover:shadow-[0_0_25px_rgba(0,255,255,0.5)]",
                          ]
                        : [
                            "bg-gradient-to-br from-primary/20 to-primary/10",
                            "group-hover:from-primary/30 group-hover:to-primary/20",
                            "dark:shadow-lg dark:shadow-primary/25",
                          ],
                    )}
                  >
                    <IconComponent className={cn("h-12 w-12", isCyberpunk ? "text-cyan-400" : "text-primary")} />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 mb-4">
                  <CardTitle
                    className={cn(
                      "text-2xl font-bold",
                      isCyberpunk ? "text-cyan-400 font-mono tracking-wider" : "text-foreground",
                    )}
                  >
                    {platform.title}
                  </CardTitle>
                  <Badge
                    className={cn(
                      "text-xs px-3 py-1",
                      isCyberpunk
                        ? [
                            "bg-gradient-to-r from-cyan-500/20 to-purple-500/20",
                            "border border-cyan-500/50 text-cyan-400",
                            "font-mono font-bold tracking-wide",
                          ]
                        : "bg-primary/10 text-primary border-primary/20",
                    )}
                  >
                    {platform.badge}
                  </Badge>
                </div>

                <CardDescription
                  className={cn(
                    "text-base leading-relaxed",
                    isCyberpunk ? "text-cyan-300/90 font-mono" : "text-muted-foreground",
                  )}
                >
                  {platform.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 pb-8">
                <div className="space-y-4">
                  <h4
                    className={cn(
                      "font-semibold text-sm uppercase tracking-wide mb-4",
                      isCyberpunk ? "text-cyan-400/80 font-mono" : "text-muted-foreground",
                    )}
                  >
                    Features & Controls
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {platform.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 text-base">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full flex-shrink-0",
                            isCyberpunk ? "bg-cyan-400" : "bg-primary",
                          )}
                        />
                        <span className={cn(isCyberpunk ? "text-cyan-200/90 font-mono" : "text-foreground/90")}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className={cn(
                    "w-full mt-8 h-14 text-lg font-semibold transition-all duration-300",
                    isCyberpunk
                      ? [
                          "bg-gradient-to-r from-cyan-600 to-purple-600",
                          "hover:from-cyan-500 hover:to-purple-500",
                          "border border-cyan-500/50",
                          "text-white font-mono tracking-wide",
                          "shadow-[0_0_15px_rgba(0,255,255,0.3)]",
                          "hover:shadow-[0_0_25px_rgba(0,255,255,0.5)]",
                          isSelected && "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900",
                        ]
                      : [
                          "bg-gradient-to-r hover:shadow-lg",
                          platform.type === "desktop"
                            ? "from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                            : "from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700",
                          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                        ],
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePlatformSelect(platform.type)
                  }}
                  disabled={isProcessing}
                >
                  {isSelected && isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                      Loading...
                    </>
                  ) : isSelected ? (
                    <>
                      <Gamepad2 className="mr-3 h-6 w-6" />
                      Selected - Continue
                    </>
                  ) : (
                    <>
                      {platform.type === "desktop" ? (
                        <MousePointer className="mr-3 h-6 w-6" />
                      ) : (
                        <TouchIcon className="mr-3 h-6 w-6" />
                      )}
                      Select {platform.title}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="text-center mt-8">
        <p className={cn("text-sm", isCyberpunk ? "text-cyan-400/70 font-mono" : "text-muted-foreground")}>
          You can change this setting later in the game preferences
        </p>
      </div>
    </div>
  )
}
