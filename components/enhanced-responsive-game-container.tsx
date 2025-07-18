"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { useIsMobile } from "@/components/ui/use-mobile"
import { debugManager } from "@/utils/debug-utils"

interface EnhancedResponsiveGameContainerProps {
  children: React.ReactNode
  gameWidth: number
  gameHeight: number
  className?: string
  maintainAspectRatio?: boolean
  enableDebugOverlay?: boolean
  onScaleChange?: (scale: number) => void
  onOrientationChange?: (isLandscape: boolean) => void
}

interface ViewportMetrics {
  width: number
  height: number
  scale: number
  gameX: number
  gameY: number
  isLandscape: boolean
  devicePixelRatio: number
  safeAreaInsets: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export default function EnhancedResponsiveGameContainer({
  children,
  gameWidth,
  gameHeight,
  className = "",
  maintainAspectRatio = true,
  enableDebugOverlay = false,
  onScaleChange,
  onOrientationChange,
}: EnhancedResponsiveGameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<HTMLDivElement>(null)
  const [metrics, setMetrics] = useState<ViewportMetrics>({
    width: 0,
    height: 0,
    scale: 1,
    gameX: 0,
    gameY: 0,
    isLandscape: false,
    devicePixelRatio: 1,
    safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
  })
  const [showOrientationPrompt, setShowOrientationPrompt] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const isMobile = useIsMobile()

  // Get safe area insets for devices with notches
  const getSafeAreaInsets = useCallback(() => {
    if (!CSS.supports("padding-top: env(safe-area-inset-top)")) {
      return { top: 0, right: 0, bottom: 0, left: 0 }
    }

    const style = getComputedStyle(document.documentElement)
    return {
      top: Number.parseInt(style.getPropertyValue("--safe-area-inset-top") || "0", 10),
      right: Number.parseInt(style.getPropertyValue("--safe-area-inset-right") || "0", 10),
      bottom: Number.parseInt(style.getPropertyValue("--safe-area-inset-bottom") || "0", 10),
      left: Number.parseInt(style.getPropertyValue("--safe-area-inset-left") || "0", 10),
    }
  }, [])

  // Enhanced viewport detection with support for visual viewport
  const getViewportDimensions = useCallback(() => {
    let width = window.innerWidth
    let height = window.innerHeight

    // Use visual viewport if available (better for mobile with keyboard)
    if (window.visualViewport) {
      width = window.visualViewport.width
      height = window.visualViewport.height
    }

    // On mobile, account for browser chrome
    if (isMobile) {
      // Use document.documentElement dimensions as fallback
      width = Math.max(width, document.documentElement.clientWidth)
      height = Math.max(height, document.documentElement.clientHeight)
    }

    return { width, height }
  }, [isMobile])

  // Calculate optimal scaling and positioning
  const calculateOptimalLayout = useCallback(() => {
    if (!containerRef.current) return null

    const { width: viewportWidth, height: viewportHeight } = getViewportDimensions()
    const safeAreaInsets = getSafeAreaInsets()

    // Calculate available space after safe area insets
    const availableWidth = viewportWidth - safeAreaInsets.left - safeAreaInsets.right
    const availableHeight = viewportHeight - safeAreaInsets.top - safeAreaInsets.bottom

    // Calculate scale to fit game perfectly
    const scaleX = availableWidth / gameWidth
    const scaleY = availableHeight / gameHeight

    // Choose scale based on aspect ratio maintenance
    let scale: number
    if (maintainAspectRatio) {
      // Use smaller scale to ensure everything fits
      scale = Math.min(scaleX, scaleY)
    } else {
      // Use average scale for better screen utilization
      scale = (scaleX + scaleY) / 2
    }

    // Apply reasonable scale limits
    const minScale = 0.2
    const maxScale = 4.0
    scale = Math.max(minScale, Math.min(maxScale, scale))

    // Calculate scaled dimensions
    const scaledWidth = gameWidth * scale
    const scaledHeight = gameHeight * scale

    // Perfect centering with safe area consideration
    const gameX = safeAreaInsets.left + (availableWidth - scaledWidth) / 2
    const gameY = safeAreaInsets.top + (availableHeight - scaledHeight) / 2

    // Orientation detection
    const isLandscape = viewportWidth > viewportHeight

    return {
      width: viewportWidth,
      height: viewportHeight,
      scale,
      gameX,
      gameY,
      isLandscape,
      devicePixelRatio: window.devicePixelRatio || 1,
      safeAreaInsets,
    }
  }, [gameWidth, gameHeight, maintainAspectRatio, getViewportDimensions, getSafeAreaInsets])

  // Apply calculated layout
  const applyLayout = useCallback(
    (newMetrics: ViewportMetrics) => {
      if (!containerRef.current || !gameRef.current) return

      const container = containerRef.current
      const game = gameRef.current

      // Update container to fill viewport
      container.style.width = `${newMetrics.width}px`
      container.style.height = `${newMetrics.height}px`

      // Position and scale game content
      game.style.transform = `translate(${newMetrics.gameX}px, ${newMetrics.gameY}px) scale(${newMetrics.scale})`
      game.style.transformOrigin = "top left"
      game.style.width = `${gameWidth}px`
      game.style.height = `${gameHeight}px`

      // Update state
      setMetrics(newMetrics)

      // Call callbacks
      onScaleChange?.(newMetrics.scale)
      onOrientationChange?.(newMetrics.isLandscape)

      debugManager.logInfo("ResponsiveContainer", "Layout applied", {
        scale: newMetrics.scale,
        position: { x: newMetrics.gameX, y: newMetrics.gameY },
        viewport: { width: newMetrics.width, height: newMetrics.height },
        isLandscape: newMetrics.isLandscape,
      })
    },
    [gameWidth, gameHeight, onScaleChange, onOrientationChange],
  )

  // Main layout calculation and application
  const updateLayout = useCallback(() => {
    const newMetrics = calculateOptimalLayout()
    if (!newMetrics) return

    applyLayout(newMetrics)
    setIsInitialized(true)

    // Show orientation prompt for mobile portrait
    if (isMobile && !newMetrics.isLandscape) {
      setShowOrientationPrompt(true)
    } else {
      setShowOrientationPrompt(false)
    }
  }, [calculateOptimalLayout, applyLayout, isMobile])

  // Debounced resize handler
  const [resizeTimeout, setResizeTimeout] = useState<NodeJS.Timeout | null>(null)
  const debouncedUpdateLayout = useCallback(() => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }

    const timeout = setTimeout(() => {
      // Use multiple animation frames for smooth updates
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          updateLayout()
        })
      })
    }, 50)

    setResizeTimeout(timeout)
  }, [updateLayout, resizeTimeout])

  // Set up event listeners
  useEffect(() => {
    // Initial layout
    const initialTimer = setTimeout(updateLayout, 100)

    // Resize events
    window.addEventListener("resize", debouncedUpdateLayout)
    window.addEventListener("orientationchange", debouncedUpdateLayout)

    // Mobile-specific events
    if (isMobile) {
      // Visual viewport support for mobile keyboard handling
      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", debouncedUpdateLayout)
        window.visualViewport.addEventListener("scroll", debouncedUpdateLayout)
      }

      // Touch events that might affect layout
      document.addEventListener("touchstart", debouncedUpdateLayout, { passive: true })
      document.addEventListener("touchend", debouncedUpdateLayout, { passive: true })
    }

    // Cleanup
    return () => {
      clearTimeout(initialTimer)
      if (resizeTimeout) clearTimeout(resizeTimeout)

      window.removeEventListener("resize", debouncedUpdateLayout)
      window.removeEventListener("orientationchange", debouncedUpdateLayout)

      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", debouncedUpdateLayout)
        window.visualViewport.removeEventListener("scroll", debouncedUpdateLayout)
      }

      document.removeEventListener("touchstart", debouncedUpdateLayout)
      document.removeEventListener("touchend", debouncedUpdateLayout)
    }
  }, [updateLayout, debouncedUpdateLayout, isMobile, resizeTimeout])

  // Orientation prompt component
  const OrientationPrompt = () => {
    if (!showOrientationPrompt) return null

    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] text-white">
        <div className="text-center p-8 max-w-sm">
          <div className="text-6xl mb-6 animate-pulse">📱</div>
          <h2 className="text-2xl font-bold mb-4">Rotate Your Device</h2>
          <p className="text-lg mb-6">Please rotate your device to landscape mode for the optimal gaming experience.</p>
          <div className="flex justify-center items-center space-x-4">
            <div className="text-4xl animate-bounce">↻</div>
            <div className="text-sm opacity-75">Landscape mode provides better controls and visibility</div>
          </div>
          <button
            onClick={() => setShowOrientationPrompt(false)}
            className="mt-6 px-4 py-2 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"
          >
            Continue in Portrait
          </button>
        </div>
      </div>
    )
  }

  // Debug overlay
  const DebugOverlay = () => {
    if (!enableDebugOverlay || !isInitialized) return null

    return (
      <div className="fixed top-4 left-4 bg-black/80 text-white text-xs p-3 rounded-lg font-mono z-50 max-w-xs">
        <div className="space-y-1">
          <div className="text-green-400 font-bold">Layout Metrics</div>
          <div>Scale: {metrics.scale.toFixed(3)}</div>
          <div>
            Viewport: {metrics.width}×{metrics.height}
          </div>
          <div>
            Game Size: {gameWidth}×{gameHeight}
          </div>
          <div>
            Position: ({metrics.gameX.toFixed(0)}, {metrics.gameY.toFixed(0)})
          </div>
          <div>Orientation: {metrics.isLandscape ? "Landscape" : "Portrait"}</div>
          <div>DPR: {metrics.devicePixelRatio}</div>
          <div>Mobile: {isMobile ? "Yes" : "No"}</div>
          <div className="text-yellow-400">Safe Area:</div>
          <div>
            T:{metrics.safeAreaInsets.top} R:{metrics.safeAreaInsets.right}
          </div>
          <div>
            B:{metrics.safeAreaInsets.bottom} L:{metrics.safeAreaInsets.left}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Global CSS for mobile optimization */}
      <style jsx global>{`
        :root {
          --safe-area-inset-top: env(safe-area-inset-top);
          --safe-area-inset-right: env(safe-area-inset-right);
          --safe-area-inset-bottom: env(safe-area-inset-bottom);
          --safe-area-inset-left: env(safe-area-inset-left);
        }
        
        /* Mobile viewport optimization */
        @media (max-width: 768px) {
          html {
            height: 100%;
            height: 100dvh;
          }
          
          body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            height: 100dvh;
            overflow: hidden;
            position: fixed;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
          
          /* Prevent zoom on input focus */
          input, textarea, select {
            font-size: 16px;
          }
          
          /* Hide scrollbars */
          ::-webkit-scrollbar {
            display: none;
          }
          
          /* Optimize rendering */
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        }
        
        /* Hardware acceleration for smooth scaling */
        .responsive-game-container {
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        
        /* Smooth transitions during orientation changes */
        .responsive-game-content {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }
      `}</style>

      <OrientationPrompt />
      <DebugOverlay />

      {/* Main container */}
      <div
        ref={containerRef}
        className={`responsive-game-container ${className}`}
        style={{
          position: isMobile ? "fixed" : "relative",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#000",
          zIndex: 1,
        }}
      >
        {/* Game content wrapper */}
        <div
          ref={gameRef}
          className="responsive-game-content"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${gameWidth}px`,
            height: `${gameHeight}px`,
            imageRendering: "pixelated",
            imageRendering: "-moz-crisp-edges",
            imageRendering: "crisp-edges",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
            WebkitTapHighlightColor: "transparent",
            touchAction: "none",
          }}
        >
          {isInitialized && children}
        </div>
      </div>
    </>
  )
}
