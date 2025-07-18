"use client"

import { useState } from "react"

interface PromoWatermarkProps {
  className?: string
}

export default function PromoWatermark({ className = "" }: PromoWatermarkProps) {
  const [isVisible, setIsVisible] = useState(true)

  return (
    <div className={`fixed top-4 left-4 z-[80] ${className}`}>
      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-2 text-white/80 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <span>MUTABLE DEMO</span>
        </div>
      </div>
    </div>
  )
}
