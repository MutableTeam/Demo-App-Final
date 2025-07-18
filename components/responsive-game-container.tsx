"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { useIsMobile } from "@/components/ui/use-mobile"

interface ResponsiveGameContainerProps {
  children: React.ReactNode
  gameWidth: number
  gameHeight: number
  className?: string
}

export default function ResponsiveGameContainer({
  children,
  gameWidth,
  gameHeight,
  className = "",
}: ResponsiveGameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [gamePosition, setGamePosition] = useState({ x: 0, y: 0 })
  const isMobile = useIsMobile()

  // Calculate optimal scale and positioning
  const calculateLayout = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // Calculate scale to fit game while maintaining aspect ratio
    const scaleX = containerWidth / gameWidth
    const scaleY = containerHeight / gameHeight
    const optimalScale = Math.min(scaleX, scaleY)

    // On mobile, ensure we don't scale too small
    const minScale = isMobile ? 0.6 : 0.5
    const maxScale = isMobile ? 1.2 : 1.5
    const finalScale = Math.max(minScale, Math.min(maxScale, optimalScale))

    // Calculate scaled game dimensions
    const scaledWidth = gameWidth * finalScale
    const scaledHeight = gameHeight * finalScale

    // Center the game in the container
    const gameX = (containerWidth - scaledWidth) / 2
    const gameY = (containerHeight - scaledHeight) / 2

    // On mobile, adjust positioning to account for safe areas
    let adjustedGameY = gameY
    if (isMobile) {
      // Account for mobile browser UI and safe areas
      const safeAreaTop = Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sat") || "0")
      const safeAreaBottom = Number.parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--sab") || "0",
      )

      // Adjust Y position to avoid bottom safe area
      adjustedGameY = Math.max(10, Math.min(gameY, containerHeight - scaledHeight - safeAreaBottom - 20))
    }

    setScale(finalScale)
    setContainerSize({ width: containerWidth, height: containerHeight })
    setGamePosition({ x: Math.max(0, gameX), y: Math.max(0, adjustedGameY) })
  }, [gameWidth, gameHeight, isMobile])

  // Handle resize and orientation changes
  useEffect(() => {
    const handleResize = () => {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(calculateLayout)
    }

    // Initial calculation
    calculateLayout()

    // Set up event listeners
    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleResize)

    // Handle mobile viewport changes (address bar hiding/showing)
    if (isMobile) {
      let resizeTimer: NodeJS.Timeout
      const handleViewportChange = () => {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(handleResize, 150)
      }

      window.addEventListener("scroll", handleViewportChange)
      window.addEventListener("touchstart", handleViewportChange)

      return () => {
        window.removeEventListener("resize", handleResize)
        window.removeEventListener("orientationchange", handleResize)
        window.removeEventListener("scroll", handleViewportChange)
        window.removeEventListener("touchstart", handleViewportChange)
        clearTimeout(resizeTimer)
      }
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)
    }
  }, [calculateLayout, isMobile])

  // Set CSS custom properties for safe areas on mobile
  useEffect(() => {
    if (isMobile && "CSS" in window && "supports" in window.CSS) {
      const updateSafeAreas = () => {
        const root = document.documentElement

        // Set safe area custom properties
        if (window.CSS.supports("padding-top: env(safe-area-inset-top)")) {
          root.style.setProperty("--sat", "env(safe-area-inset-top)")
          root.style.setProperty("--sab", "env(safe-area-inset-bottom)")
          root.style.setProperty("--sal", "env(safe-area-inset-left)")
          root.style.setProperty("--sar", "env(safe-area-inset-right)")
        }
      }

      updateSafeAreas()
      window.addEventListener("orientationchange", updateSafeAreas)

      return () => {
        window.removeEventListener("orientationchange", updateSafeAreas)
      }
    }
  }, [isMobile])

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{
        // Ensure container takes full available space
        minHeight: isMobile ? "100vh" : "600px",
        // Handle mobile viewport units
        height: isMobile ? "100dvh" : "100%",
      }}
    >
      {/* Game content wrapper */}
      <div
        className="absolute"
        style={{
          left: `${gamePosition.x}px`,
          top: `${gamePosition.y}px`,
          width: `${gameWidth}px`,
          height: `${gameHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          // Ensure crisp pixel rendering
          imageRendering: "pixelated",
          imageRendering: "-moz-crisp-edges",
          imageRendering: "crisp-edges",
        }}
      >
        {children}
      </div>

      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs p-2 rounded font-mono">
          <div>Scale: {scale.toFixed(2)}</div>
          <div>
            Container: {containerSize.width}x{containerSize.height}
          </div>
          <div>
            Game: {gameWidth}x{gameHeight}
          </div>
          <div>
            Position: {gamePosition.x.toFixed(0)}, {gamePosition.y.toFixed(0)}
          </div>
          <div>Mobile: {isMobile ? "Yes" : "No"}</div>
        </div>
      )}

      {/* Mobile-specific UI adjustments */}
      {isMobile && (
        <style jsx>{`
          /* Prevent zoom on double tap */
          * {
            touch-action: manipulation;
          }
          
          /* Hide mobile browser UI elements when possible */
          :global(body) {
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
          }
          
          /* Ensure full viewport usage */
          :global(html), :global(body) {
            height: 100%;
            overflow: hidden;
          }
        `}</style>
      )}
    </div>
  )
}
