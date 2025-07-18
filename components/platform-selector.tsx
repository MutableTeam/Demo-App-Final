"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Monitor, Smartphone, Check } from "lucide-react"
import { usePlatform } from "@/contexts/platform-context"
import Image from "next/image"

export default function PlatformSelector() {
  const { platform, setPlatform } = usePlatform()
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null)

  const platforms = [
    {
      id: "desktop",
      name: "Desktop",
      icon: Monitor,
      image: "/images/retro-desktop-gaming.png",
      description: "Keyboard & Mouse",
    },
    {
      id: "mobile",
      name: "Mobile",
      icon: Smartphone,
      image: "/images/retro-mobile-gaming.png",
      description: "Touch Controls",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-12">
        <Image
          src="/images/mutable-logo-transparent.png"
          alt="MutablePvP"
          width={200}
          height={80}
          className="h-16 w-auto"
        />
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {platforms.map((platformOption) => {
          const Icon = platformOption.icon
          const isSelected = platform === platformOption.id
          const isHovered = hoveredPlatform === platformOption.id

          return (
            <Card
              key={platformOption.id}
              className={`
                relative overflow-hidden cursor-pointer transition-all duration-300 ease-out
                ${isSelected ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950" : "hover:shadow-2xl"}
                ${isHovered ? "scale-105 shadow-2xl" : ""}
                group
              `}
              onClick={() => setPlatform(platformOption.id as "desktop" | "mobile")}
              onMouseEnter={() => setHoveredPlatform(platformOption.id)}
              onMouseLeave={() => setHoveredPlatform(null)}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}

              {/* Background Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={platformOption.image || "/placeholder.svg"}
                  alt={platformOption.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <Icon className="h-12 w-12 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{platformOption.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{platformOption.description}</p>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
