"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface BowDrawIndicatorProps {
  isDrawing: boolean
  drawStartTime: number | null
  maxDrawTime: number
  className?: string
}

export default function BowDrawIndicator({ isDrawing, drawStartTime, maxDrawTime, className }: BowDrawIndicatorProps) {
  const [chargePercentage, setChargePercentage] = useState(0)

  useEffect(() => {
    if (!isDrawing || drawStartTime === null) {
      setChargePercentage(0)
      return
    }

    const updateCharge = () => {
      const currentTime = Date.now() / 1000
      const drawTime = currentTime - drawStartTime
      const percentage = Math.min(drawTime / maxDrawTime, 1) * 100
      setChargePercentage(percentage)

      if (isDrawing && drawStartTime !== null) {
        requestAnimationFrame(updateCharge)
      }
    }

    const animationId = requestAnimationFrame(updateCharge)
    return () => cancelAnimationFrame(animationId)
  }, [isDrawing, drawStartTime, maxDrawTime])

  if (!isDrawing) return null

  // Determine color based on charge level
  const getChargeColor = () => {
    if (chargePercentage >= 90) return "bg-red-500"
    if (chargePercentage >= 60) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className={cn("absolute z-10 flex flex-col items-center", className)}>
      <div className="text-xs font-bold text-white mb-1">
        {chargePercentage >= 100 ? "FULL POWER!" : `${Math.floor(chargePercentage)}%`}
      </div>
      <div className="w-24 h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
        <div className={cn("h-full transition-all", getChargeColor())} style={{ width: `${chargePercentage}%` }} />
      </div>
    </div>
  )
}
