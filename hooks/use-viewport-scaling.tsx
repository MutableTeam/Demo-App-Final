"use client"

import { useState, useEffect, useCallback } from "react"
import { useIsMobile } from "@/components/ui/use-mobile"

interface ViewportInfo {
  width: number
  height: number
  scale: number
  isLandscape: boolean
  devicePixelRatio: number
  safeAreaInsets: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

interface ScalingOptions {
  gameWidth: number
  gameHeight: number
  maintainAspectRatio?: boolean
  minScale?: number
  maxScale?: number
  padding?: number
}

export function useViewportScaling(options: ScalingOptions) {
  const { gameWidth, gameHeight, maintainAspectRatio = true, minScale = 0.2, maxScale = 4.0, padding = 0 } = options

  const isMobile = useIsMobile()
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>({
    width: 0,
    height: 0,
    scale: 1,
    isLandscape: false,
    devicePixelRatio: 1,
    safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
  })

  // Get safe area insets
  const getSafeAreaInsets = useCallback(() => {
    if (typeof window === "undefined") return { top: 0, right: 0, bottom: 0, left: 0 }

    const style = getComputedStyle(document.documentElement)
    return {
      top: Number.parseInt(style.getPropertyValue("--safe-area-inset-top") || "0", 10),
      right: Number.parseInt(style.getPropertyValue("--safe-area-inset-right") || "0", 10),
      bottom: Number.parseInt(style.getPropertyValue("--safe-area-inset-bottom") || "0", 10),
      left: Number.parseInt(style.getPropertyValue("--safe-area-inset-left") || "0", 10),
    }
  }, [])

  // Calculate viewport dimensions
  const getViewportDimensions = useCallback(() => {
    if (typeof window === "undefined") return { width: 0, height: 0 }

    let width = window.innerWidth
    let height = window.innerHeight

    // Use visual viewport if available
    if (window.visualViewport) {
      width = window.visualViewport.width
      height = window.visualViewport.height
    }

    return { width, height }
  }, [])

  // Calculate optimal scale
  const calculateScale = useCallback(() => {
    const { width: viewportWidth, height: viewportHeight } = getViewportDimensions()
    const safeAreaInsets = getSafeAreaInsets()

    // Calculate available space
    const availableWidth = viewportWidth - safeAreaInsets.left - safeAreaInsets.right - padding * 2
    const availableHeight = viewportHeight - safeAreaInsets.top - safeAreaInsets.bottom - padding * 2

    // Calculate scale ratios
    const scaleX = availableWidth / gameWidth
    const scaleY = availableHeight / gameHeight

    // Choose appropriate scale
    let scale: number
    if (maintainAspectRatio) {
      scale = Math.min(scaleX, scaleY)
    } else {
      scale = Math.max(scaleX, scaleY)
    }

    // Apply limits
    scale = Math.max(minScale, Math.min(maxScale, scale))

    const isLandscape = viewportWidth > viewportHeight

    return {
      width: viewportWidth,
      height: viewportHeight,
      scale,
      isLandscape,
      devicePixelRatio: window.devicePixelRatio || 1,
      safeAreaInsets,
    }
  }, [
    gameWidth,
    gameHeight,
    maintainAspectRatio,
    minScale,
    maxScale,
    padding,
    getViewportDimensions,
    getSafeAreaInsets,
  ])

  // Update viewport info
  const updateViewportInfo = useCallback(() => {
    const newInfo = calculateScale()
    setViewportInfo(newInfo)
  }, [calculateScale])

  // Set up event listeners
  useEffect(() => {
    // Initial calculation
    updateViewportInfo()

    // Event listeners
    const handleResize = () => {
      // Debounce resize events
      setTimeout(updateViewportInfo, 100)
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleResize)

    // Mobile-specific listeners
    if (isMobile && window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize)
      window.visualViewport.addEventListener("scroll", handleResize)
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)

      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize)
        window.visualViewport.removeEventListener("scroll", handleResize)
      }
    }
  }, [updateViewportInfo, isMobile])

  // Helper function to get scaled dimensions
  const getScaledDimensions = useCallback(() => {
    return {
      width: gameWidth * viewportInfo.scale,
      height: gameHeight * viewportInfo.scale,
    }
  }, [gameWidth, gameHeight, viewportInfo.scale])

  // Helper function to get game position for centering
  const getGamePosition = useCallback(() => {
    const scaledDimensions = getScaledDimensions()
    const availableWidth = viewportInfo.width - viewportInfo.safeAreaInsets.left - viewportInfo.safeAreaInsets.right
    const availableHeight = viewportInfo.height - viewportInfo.safeAreaInsets.top - viewportInfo.safeAreaInsets.bottom

    return {
      x: viewportInfo.safeAreaInsets.left + (availableWidth - scaledDimensions.width) / 2,
      y: viewportInfo.safeAreaInsets.top + (availableHeight - scaledDimensions.height) / 2,
    }
  }, [viewportInfo, getScaledDimensions])

  return {
    viewportInfo,
    getScaledDimensions,
    getGamePosition,
    updateViewportInfo,
  }
}
