"use client"

import { usePlatform } from "@/contexts/platform-context"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { Monitor, Smartphone } from "lucide-react"
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
        "text-xs font-medium transition-all duration-300",
        "backdrop-blur-sm border",
        isCyberpunk
          ? [
              "bg-slate-900/80 border-cyan-500/30",
              "text-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.2)]",
              "hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]",
            ]
          : ["bg-background/80 border-border/50", "text-foreground/80 shadow-sm", "hover:bg-background/90"],
      )}
    >
      <Icon className={cn("h-3 w-3", isCyberpunk ? "text-cyan-400" : "text-primary")} />
      <span className={cn(isCyberpunk ? "font-mono tracking-wide" : "")}>{isDesktop ? "Desktop" : "Mobile"} Mode</span>
    </div>
  )
}
