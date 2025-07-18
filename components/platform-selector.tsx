"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Monitor, Smartphone, Gamepad2, MousePointer, TouchpadIcon as TouchIcon } from "lucide-react"
import { usePlatform, type PlatformType } from "@/contexts/platform-context"
import { cn } from "@/lib/utils"

interface PlatformSelectorProps {
  onPlatformSelected: (platform: PlatformType) => void
}

export default function PlatformSelector({ onPlatformSelected }: PlatformSelectorProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null)
  const { setPlatform } = usePlatform()

  const handlePlatformSelect = (platform: PlatformType) => {
    setSelectedPlatform(platform)
    setPlatform(platform)
    onPlatformSelected(platform)
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
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Choose Your Gaming Platform
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select your preferred gaming experience. This will optimize controls and interface for your device.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((platform) => {
          const IconComponent = platform.icon
          const isSelected = selectedPlatform === platform.type

          return (
            <Card
              key={platform.type}
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer group",
                "min-h-[320px] border-2",
                isSelected
                  ? "border-primary shadow-lg shadow-primary/25 dark:shadow-primary/50"
                  : "border-border hover:border-primary/50",
                "dark:bg-gradient-to-br dark:from-background/50 dark:to-background/30",
                "light:bg-gradient-to-br light:from-background light:to-muted/30",
              )}
              onClick={() => handlePlatformSelect(platform.type)}
            >
              <div
                className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                  `bg-gradient-to-br ${platform.color}`,
                )}
              />

              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div
                    className={cn(
                      "p-4 rounded-full transition-all duration-300",
                      "bg-gradient-to-br from-primary/20 to-primary/10",
                      "group-hover:from-primary/30 group-hover:to-primary/20",
                      "dark:shadow-lg dark:shadow-primary/25",
                    )}
                  >
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mb-2">
                  <CardTitle className="text-2xl font-bold">{platform.title}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {platform.badge}
                  </Badge>
                </div>

                <CardDescription className="text-base leading-relaxed">{platform.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                    Features & Controls
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {platform.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span className="text-foreground/90">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className={cn(
                    "w-full mt-6 h-12 text-base font-semibold transition-all duration-300",
                    "bg-gradient-to-r hover:shadow-lg",
                    platform.type === "desktop"
                      ? "from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      : "from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700",
                    isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePlatformSelect(platform.type)
                  }}
                >
                  {isSelected ? (
                    <>
                      <Gamepad2 className="mr-2 h-5 w-5" />
                      Selected - Continue
                    </>
                  ) : (
                    <>
                      {platform.type === "desktop" ? (
                        <MousePointer className="mr-2 h-5 w-5" />
                      ) : (
                        <TouchIcon className="mr-2 h-5 w-5" />
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
        <p className="text-sm text-muted-foreground">You can change this setting later in the game preferences</p>
      </div>
    </div>
  )
}
