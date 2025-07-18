"use client"

import { useState, useEffect } from "react"
import { usePlatform } from "@/contexts/platform-context"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import PlatformSelector from "@/components/platform-selector"
import { MutablePlatform } from "@/components/mutable-platform"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const { platformType, isSelected } = usePlatform()
  const { styleMode } = useCyberpunkTheme()
  const [showPlatform, setShowPlatform] = useState(false)

  const isCyberpunk = styleMode === "cyberpunk"

  useEffect(() => {
    if (isSelected && platformType) {
      // Small delay to show the selection was made
      const timer = setTimeout(() => {
        setShowPlatform(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isSelected, platformType])

  const handlePlatformSelected = () => {
    setShowPlatform(true)
  }

  if (!isSelected || !showPlatform) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center p-4",
          isCyberpunk
            ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
            : "bg-gradient-to-br from-background to-muted/30",
        )}
      >
        <PlatformSelector onPlatformSelected={handlePlatformSelected} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "min-h-screen",
        isCyberpunk ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" : "bg-background",
      )}
    >
      <MutablePlatform />
    </div>
  )
}
