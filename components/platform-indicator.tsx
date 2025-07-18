"use client"

import { Monitor, Smartphone } from "lucide-react"
import { usePlatform } from "@/contexts/platform-context"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"

export default function PlatformIndicator() {
  const { platformType } = usePlatform()
  const { styleMode } = useCyberpunkTheme()

  const isCyberpunk = styleMode === "cyberpunk"

  if (!platformType) return null

  const isDesktop = platformType === "desktop"
  const Icon = isDesktop ? Monitor : Smartphone

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-[80]",
        "flex items-center gap-2 px-3 py-2 rounded-lg",
        "text-sm font-medium transition-all duration-300",
        isCyberpunk
          ? [
              "bg-gradient-to-r from-slate-900/90 to-purple-900/90",
              "border border-cyan-500/50",
              "text-cyan-400 font-mono",
              "shadow-[0_0_10px_rgba(0,255,255,0.3)]",
              "backdrop-blur-sm",
            ]
          : ["bg-background/90 backdrop-blur-sm", "border border-border", "text-foreground", "shadow-lg"],
      )}
    >
      <Icon className={cn("h-4 w-4", isCyberpunk ? "text-cyan-400" : "text-primary")} />
      <span className={cn(isCyberpunk ? "text-cyan-300" : "text-muted-foreground")}>
        {isDesktop ? "Desktop Mode" : "Mobile Mode"}
      </span>
    </div>
  )
}
