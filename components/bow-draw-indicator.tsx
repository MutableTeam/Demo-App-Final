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
  const [drawPercentage, setDrawPercentage] = useState(0)

  useEffect(() => {
    if (!isDrawing || drawStartTime === null) {
      setDrawPercentage(0)
      return
    }

    const updateDrawPercentage = () => {
      const currentTime = Date.now() / 1000
      const drawTime = currentTime - drawStartTime
      const percentage = Math.min((drawTime / maxDrawTime) * 100, 100)
      setDrawPercentage(percentage)

      if (isDrawing && percentage < 100) {
        requestAnimationFrame(updateDrawPercentage)
      }
    }

    const animationFrame = requestAnimationFrame(updateDrawPercentage)
    return () => cancelAnimationFrame(animationFrame)
  }, [isDrawing, drawStartTime, maxDrawTime])

  // Don't render if not drawing
  if (!isDrawing) return null

  // Determine color based on draw percentage
  const getColor = () => {
    if (drawPercentage < 30) return "bg-red-500"
    if (drawPercentage < 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className={cn("absolute z-10 pointer-events-none", className)}>
      <div className="w-32 h-2 bg-gray-800/70 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all", getColor())} style={{ width: `${drawPercentage}%` }}></div>
      </div>
    </div>
  )
}
