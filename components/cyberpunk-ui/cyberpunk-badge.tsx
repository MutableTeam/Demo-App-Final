import type React from "react"
import { Badge } from "@/components/ui/badge"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"

interface CyberpunkBadgeProps {
  children: React.ReactNode
  variant?: "default" | "secondary" | "destructive" | "outline"
  className?: string
}

export function CyberpunkBadge({ children, variant = "default", className }: CyberpunkBadgeProps) {
  const { isCyberpunkMode, styleMode } = useCyberpunkTheme()

  const getCyberpunkStyles = () => {
    if (!isCyberpunkMode || styleMode !== "cyberpunk") return ""

    switch (variant) {
      case "default":
        return "bg-[#00f0ff] bg-opacity-20 text-[#00f0ff] border border-[#00f0ff] border-opacity-30"
      case "secondary":
        return "bg-[#ff00ff] bg-opacity-20 text-[#ff00ff] border border-[#ff00ff] border-opacity-30"
      case "destructive":
        return "bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-30"
      case "outline":
        return "bg-transparent text-[#00f0ff] border border-[#00f0ff] border-opacity-50"
      default:
        return "bg-[#00f0ff] bg-opacity-20 text-[#00f0ff] border border-[#00f0ff] border-opacity-30"
    }
  }

  return (
    <Badge variant={variant} className={cn(getCyberpunkStyles(), className)}>
      {children}
    </Badge>
  )
}
