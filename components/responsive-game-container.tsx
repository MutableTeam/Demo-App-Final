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

interface ViewportDimensions {
  width: number
  height: number
  scale: number
  offsetX: number
  offsetY: number
}

export default function ResponsiveGameContainer({
  children,
  gameWidth,
  gameHeight,
  className = "",
}: ResponsiveGameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState<ViewportDimensions>({
    width: 0,
    height: 0,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  })
  const [isLandscape, setIsLandscape] = useState(false)
  const [showOrientationPrompt, setShowOrientationPrompt] = useState(false)
  const isMobile = useIsMobile()

  // Get actual viewport dimensions accounting for mobile browser UI
  const getViewportDimensions = useCallback(() => {
    let width = window.innerWidth
    let height = window.innerHeight

    // Use visual viewport if available (better for mobile)
    if (window.visualViewport) {
      width = window.visualViewport.width
      height = window.visualViewport.height
    }

    // On mobile, account for browser UI
    if (isMobile) {
      // Use screen dimensions if they're more accurate
      if (screen.width && screen.height) {
        const screenWidth = Math.max(screen.width, screen.height)
        const screenHeight = Math.min(screen.width, screen.height)

        // In landscape, use full screen dimensions
        if (width > height) {
          width = screenWidth
          height = screenHeight
        }
      }
    }

    return { width, height }
  }, [isMobile])

  // Calculate optimal scaling and positioning
  const calculateViewport = useCallback(() => {
    const { width: viewportWidth, height: viewportHeight } = getViewportDimensions()

    if (viewportWidth === 0 || viewportHeight === 0) return

    // Calculate scale factors for both dimensions
    const scaleX = viewportWidth / gameWidth
    const scaleY = viewportHeight / gameHeight

    // Use the smaller scale to ensure the entire game fits
    const scale = Math.min(scaleX, scaleY)

    // Apply reasonable scale limits
    const minScale = 0.2
    const maxScale = 4.0
    const finalScale = Math.max(minScale, Math.min(maxScale, scale))

    // Calculate scaled game dimensions
    const scaledWidth = gameWidth * finalScale
    const scaledHeight = gameHeight * finalScale

    // Center the game in the viewport
    const offsetX = (viewportWidth - scaledWidth) / 2
    const offsetY = (viewportHeight - scaledHeight) / 2

    setViewport({
      width: viewportWidth,
      height: viewportHeight,
      scale: finalScale,
      offsetX: Math.max(0, offsetX),
      offsetY: Math.max(0, offsetY),
    })

    // Update container dimensions if on mobile
    if (isMobile && containerRef.current) {
      containerRef.current.style.width = `${viewportWidth}px`
      containerRef.current.style.height = `${viewportHeight}px`
    }
  }, [gameWidth, gameHeight, getViewportDimensions, isMobile])

  // Handle orientation changes
  const handleOrientationChange = useCallback(() => {
    const isCurrentlyLandscape = window.innerWidth > window.innerHeight
    setIsLandscape(isCurrentlyLandscape)

    // Show orientation prompt on mobile portrait
    if (isMobile && !isCurrentlyLandscape) {
      setShowOrientationPrompt(true)
    } else {
      setShowOrientationPrompt(false)
    }

    // Recalculate viewport after orientation change
    setTimeout(calculateViewport, 100)
  }, [isMobile, calculateViewport])

  // Set up event listeners and initial calculation
  useEffect(() => {
    // Initial calculations
    handleOrientationChange()
    calculateViewport()

    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout
    const debouncedResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        calculateViewport()
        handleOrientationChange()
      }, 100)
    }

    // Event listeners
    window.addEventListener("resize", debouncedResize)
    window.addEventListener("orientationchange", debouncedResize)

    // Mobile-specific listeners
    if (isMobile) {
      window.addEventListener("scroll", debouncedResize)
      document.addEventListener("fullscreenchange", debouncedResize)

      // Visual viewport listeners for mobile keyboard handling
      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", debouncedResize)
        window.visualViewport.addEventListener("scroll", debouncedResize)
      }
    }

    return () => {
      clearTimeout(resizeTimeout)
      window.removeEventListener("resize", debouncedResize)
      window.removeEventListener("orientationchange", debouncedResize)
      window.removeEventListener("scroll", debouncedResize)
      document.removeEventListener("fullscreenchange", debouncedResize)

      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", debouncedResize)
        window.visualViewport.removeEventListener("scroll", debouncedResize)
      }
    }
  }, [calculateViewport, handleOrientationChange, isMobile])

  // Mobile orientation prompt component
  const OrientationPrompt = () => {
    if (!showOrientationPrompt) return null

    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] text-white">
        <div className="text-center p-8 max-w-sm">
          <div className="text-6xl mb-6 animate-bounce">📱</div>
          <h2 className="text-2xl font-bold mb-4">Rotate Your Device</h2>
          <p className="text-lg mb-6">Please rotate your device to landscape mode for the best gaming experience.</p>
          <div className="flex justify-center items-center space-x-4">
            <div className="text-4xl animate-pulse">📱</div>
            <div className="text-2xl">→</div>
            <div className="text-4xl animate-pulse transform rotate-90">📱</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Global mobile styles */}
      <style jsx global>{`
        /* Mobile-specific viewport handling */
        @media (max-width: 768px) {
          html {
            height: 100%;
            height: 100vh;
            height: 100dvh;
          }
          
          body {
            margin: 0;
            padding: 0;
            height: 100%;
            height: 100vh;
            height: 100dvh;
            overflow: hidden;
            position: fixed;
            width: 100%;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
          
          /* Prevent zoom and scrolling */
          * {
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
          
          /* Hide address bar on mobile */
          .responsive-game-container {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            height: 100dvh !important;
            overflow: hidden !important;
            background: #000 !important;
          }
        }
        
        /* Desktop styles */
        @media (min-width: 769px) {
          .responsive-game-container {
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 600px;
          }
        }
      `}</style>

      <OrientationPrompt />

      <div
        ref={containerRef}
        className={`responsive-game-container ${className}`}
        style={{
          position: isMobile ? "fixed" : "relative",
          top: isMobile ? 0 : "auto",
          left: isMobile ? 0 : "auto",
          width: isMobile ? "100vw" : "100%",
          height: isMobile ? "100vh" : "100%",
          overflow: "hidden",
          background: "#000",
          zIndex: isMobile ? 50 : "auto",
        }}
      >
        {/* Game content with dynamic scaling */}
        <div
          ref={gameRef}
          className="game-content"
          style={{
            position: "absolute",
            left: `${viewport.offsetX}px`,
            top: `${viewport.offsetY}px`,
            width: `${gameWidth}px`,
            height: `${gameHeight}px`,
            transform: `scale(${viewport.scale})`,
            transformOrigin: "top left",
            imageRendering: "pixelated",
            imageRendering: "-moz-crisp-edges",
            imageRendering: "crisp-edges",
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        >
          {children}
        </div>

        {/* Debug overlay (development only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="absolute top-2 left-2 bg-black/80 text-white text-xs p-3 rounded font-mono z-[100] max-w-xs">
            <div className="space-y-1">
              <div>Scale: {viewport.scale.toFixed(3)}</div>
              <div>
                Viewport: {viewport.width}×{viewport.height}
              </div>
              <div>
                Game: {gameWidth}×{gameHeight}
              </div>
              <div>
                Offset: {viewport.offsetX.toFixed(0)}, {viewport.offsetY.toFixed(0)}
              </div>
              <div>Mobile: {isMobile ? "Yes" : "No"}</div>
              <div>Landscape: {isLandscape ? "Yes" : "No"}</div>
              <div>
                Screen: {screen.width}×{screen.height}
              </div>
              {window.visualViewport && (
                <div>
                  Visual: {window.visualViewport.width}×{window.visualViewport.height}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scale indicator for mobile */}
        {isMobile && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {Math.round(viewport.scale * 100)}%
          </div>
        )}
      </div>
    </>
  )
}
