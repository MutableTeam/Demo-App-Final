"use client"

import { cn } from "@/lib/utils"

interface PromoWatermarkProps {
  className?: string
}

export default function PromoWatermark({ className }: PromoWatermarkProps) {
  return (
    <div
      className={cn(
        "fixed top-4 left-4 z-[80] pointer-events-none select-none",
        "text-xs text-white/60 font-mono",
        "bg-black/20 backdrop-blur-sm rounded px-2 py-1",
        "border border-white/10",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <span>MUTABLE DEMO</span>
      </div>
    </div>
  )
}
