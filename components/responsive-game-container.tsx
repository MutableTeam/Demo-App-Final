"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ResponsiveGameContainerProps {
  children: React.ReactNode
  className?: string
  aspectRatio?: number // width/height ratio, default 16/9
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
}

export default function ResponsiveGameContainer({
  children,
  className,
  aspectRatio = 16 / 9,
  minWidth = 320,
  minHeight = 240,
  maxWidth = 1920,
  maxHeight = 1080,
}: ResponsiveGameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 })

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const parent = container.parentElement
      if (!parent) return

      const parentRect = parent.getBoundingClientRect()
      const availableWidth = parentRect.width - 32 // Account for padding
      const availableHeight = parentRect.height - 32

      // Calculate dimensions based on aspect ratio
      let width = availableWidth
      let height = width / aspectRatio

      // If height exceeds available space, constrain by height
      if (height > availableHeight) {
        height = availableHeight
        width = height * aspectRatio
      }

      // Apply min/max constraints
      width = Math.max(minWidth, Math.min(maxWidth, width))
      height = Math.max(minHeight, Math.min(maxHeight, height))

      // Ensure aspect ratio is maintained
      if (width / height > aspectRatio) {
        width = height * aspectRatio
      } else {
        height = width / aspectRatio
      }

      setDimensions({ width: Math.round(width), height: Math.round(height) })
    }

    // Initial calculation
    updateDimensions()

    // Update on resize
    const resizeObserver = new ResizeObserver(updateDimensions)
    if (containerRef.current?.parentElement) {
      resizeObserver.observe(containerRef.current.parentElement)
    }

    // Update on window resize as fallback
    window.addEventListener("resize", updateDimensions)
    window.addEventListener("orientationchange", () => {
      setTimeout(updateDimensions, 100) // Delay to allow orientation change to complete
    })

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateDimensions)
      window.removeEventListener("orientationchange", updateDimensions)
    }
  }, [aspectRatio, minWidth, minHeight, maxWidth, maxHeight])

  return (
    <div
      ref={containerRef}
      className={cn("relative mx-auto bg-black rounded-lg overflow-hidden shadow-lg", className)}
      style={{
        width: dimensions.width,
        height: dimensions.height,
      }}
    >
      {children}
    </div>
  )
}
