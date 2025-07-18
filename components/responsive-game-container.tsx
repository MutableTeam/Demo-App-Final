"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ResponsiveGameContainerProps {
  children: React.ReactNode
  className?: string
  aspectRatio?: number
}

export default function ResponsiveGameContainer({
  children,
  className,
  aspectRatio = 16 / 9,
}: ResponsiveGameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const container = containerRef.current
        const containerWidth = container.clientWidth
        const containerHeight = container.clientHeight

        // Calculate the optimal size while maintaining aspect ratio
        const widthBasedHeight = containerWidth / aspectRatio
        const heightBasedWidth = containerHeight * aspectRatio

        let gameWidth, gameHeight

        if (widthBasedHeight <= containerHeight) {
          gameWidth = containerWidth
          gameHeight = widthBasedHeight
        } else {
          gameWidth = heightBasedWidth
          gameHeight = containerHeight
        }

        // Calculate scale for mobile optimization
        const baseWidth = 800 // Base game width
        const calculatedScale = Math.min(gameWidth / baseWidth, 1)

        setDimensions({ width: gameWidth, height: gameHeight })
        setScale(calculatedScale)
      }
    }

    updateDimensions()

    const resizeObserver = new ResizeObserver(updateDimensions)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    window.addEventListener("orientationchange", () => {
      setTimeout(updateDimensions, 100)
    })

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("orientationchange", updateDimensions)
    }
  }, [aspectRatio])

  return (
    <div ref={containerRef} className={cn("w-full h-full flex items-center justify-center bg-black", className)}>
      <div
        className="relative bg-gray-900 border border-gray-700 rounded-lg overflow-hidden"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  )
}
