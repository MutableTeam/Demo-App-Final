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
  const [isLandscape, setIsLandscape] = useState(false)
  const isMobile = useIsMobile()

  // Force landscape orientation on mobile
  useEffect(() => {
    if (isMobile) {
      const checkOrientation = () => {
        const isCurrentlyLandscape = window.innerWidth > window.innerHeight
        setIsLandscape(isCurrentlyLandscape)

        // Add orientation class to body for CSS targeting
        document.body.classList.toggle("mobile-landscape", isCurrentlyLandscape)
        document.body.classList.toggle("mobile-portrait", !isCurrentlyLandscape)
      }

      checkOrientation()
      window.addEventListener("orientationchange", checkOrientation)
      window.addEventListener("resize", checkOrientation)

      return () => {
        window.removeEventListener("orientationchange", checkOrientation)
        window.removeEventListener("resize", checkOrientation)
        document.body.classList.remove("mobile-landscape", "mobile-portrait")
      }
    }
  }, [isMobile])

  // Calculate optimal scale and positioning with perfect container fitting
  const calculateLayout = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    let containerWidth = container.clientWidth
    let containerHeight = container.clientHeight

    // On mobile, use full viewport dimensions
    if (isMobile) {
      containerWidth = window.innerWidth
      containerHeight = window.innerHeight

      // Account for mobile browser chrome
      if (window.visualViewport) {
        containerWidth = window.visualViewport.width
        containerHeight = window.visualViewport.height
      }
    }

    // Calculate scale to fit game perfectly in container
    const scaleX = containerWidth / gameWidth
    const scaleY = containerHeight / gameHeight

    // Use the smaller scale to ensure entire game fits
    const optimalScale = Math.min(scaleX, scaleY)

    // Apply minimum scale limits
    const minScale = 0.3
    const maxScale = 3.0
    const finalScale = Math.max(minScale, Math.min(maxScale, optimalScale))

    // Calculate scaled game dimensions
    const scaledWidth = gameWidth * finalScale
    const scaledHeight = gameHeight * finalScale

    // Center the game perfectly in the container
    const gameX = (containerWidth - scaledWidth) / 2
    const gameY = (containerHeight - scaledHeight) / 2

    setScale(finalScale)
    setContainerSize({ width: containerWidth, height: containerHeight })
    setGamePosition({ x: gameX, y: gameY })

    // Update container size to match viewport on mobile
    if (isMobile && containerRef.current) {
      containerRef.current.style.width = `${containerWidth}px`
      containerRef.current.style.height = `${containerHeight}px`
    }
  }, [gameWidth, gameHeight, isMobile])

  // Handle all resize events and viewport changes
  useEffect(() => {
    const handleResize = () => {
      // Use multiple animation frames to ensure all DOM updates are complete
      requestAnimationFrame(() => {
        requestAnimationFrame(calculateLayout)
      })
    }

    // Initial calculation with delay to ensure DOM is ready
    const initialTimer = setTimeout(calculateLayout, 100)

    // Set up event listeners
    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleResize)

    // Mobile-specific viewport handling
    if (isMobile) {
      window.addEventListener("scroll", handleResize)
      window.addEventListener("touchstart", handleResize)

      // Handle visual viewport changes (mobile keyboard, etc.)
      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", handleResize)
        window.visualViewport.addEventListener("scroll", handleResize)
      }
    }

    return () => {
      clearTimeout(initialTimer)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)
      window.removeEventListener("scroll", handleResize)
      window.removeEventListener("touchstart", handleResize)

      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize)
        window.visualViewport.removeEventListener("scroll", handleResize)
      }
    }
  }, [calculateLayout, isMobile])

  // Mobile orientation prompt component
  const OrientationPrompt = () => {
    if (!isMobile || isLandscape) return null

    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 text-white">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">📱</div>
          <h2 className="text-2xl font-bold mb-4">Rotate Your Device</h2>
          <p className="text-lg">Please rotate your device to landscape mode for the best gaming experience.</p>
          <div className="mt-6 animate-bounce">
            <div className="text-4xl">↻</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile CSS for perfect viewport handling */}
      <style jsx global>{`
        /* Mobile viewport and orientation handling */
        @media (max-width: 768px) {
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            position: fixed;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
          
          /* Force landscape orientation hint */
          @media (orientation: portrait) {
            body::before {
              content: '';
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.8);
              z-index: 1000;
              pointer-events: none;
            }
          }
          
          /* Landscape mode optimizations */
          @media (orientation: landscape) {
            body {
              height: 100vh;
              height: 100dvh; /* Dynamic viewport height */
            }
          }
          
          /* Hide mobile browser UI */
          body.mobile-landscape {
            -webkit-appearance: none;
            -webkit-user-select: none;
          }
          
          /* Prevent scrolling and zooming */
          * {
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
          
          /* Ensure game container takes full space */
          .game-container-wrapper {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            height: 100dvh !important;
            overflow: hidden !important;
          }
        }
        
        /* Desktop optimizations */
        @media (min-width: 769px) {
          .game-container-wrapper {
            position: relative;
            width: 100%;
            height: 100%;
          }
        }
      `}</style>

      <OrientationPrompt />

      <div
        ref={containerRef}
        className={`game-container-wrapper ${className}`}
        style={{
          position: isMobile ? "fixed" : "relative",
          top: isMobile ? 0 : "auto",
          left: isMobile ? 0 : "auto",
          width: isMobile ? "100vw" : "100%",
          height: isMobile ? "100vh" : "100%",
          overflow: "hidden",
          background: "#000",
        }}
      >
        {/* Game content wrapper with perfect centering */}
        <div
          className="absolute"
          style={{
            left: `${gamePosition.x}px`,
            top: `${gamePosition.y}px`,
            width: `${gameWidth}px`,
            height: `${gameHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            imageRendering: "pixelated",
            imageRendering: "-moz-crisp-edges",
            imageRendering: "crisp-edges",
            willChange: "transform",
          }}
        >
          {children}
        </div>

        {/* Debug info (development only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs p-2 rounded font-mono z-50">
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
            <div>Landscape: {isLandscape ? "Yes" : "No"}</div>
            <div>
              Viewport: {window.innerWidth}x{window.innerHeight}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
