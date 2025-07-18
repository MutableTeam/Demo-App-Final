"use client"

import { cn } from "@/lib/utils"

interface DemoWatermarkProps {
  className?: string
}

export default function DemoWatermark({ className }: DemoWatermarkProps) {
  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 z-[80] pointer-events-none select-none",
        "text-xs text-white/40 font-mono",
        "bg-black/10 backdrop-blur-sm rounded px-2 py-1",
        "border border-white/5",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
        <span>v0.dev prototype</span>
      </div>
    </div>
  )
}
