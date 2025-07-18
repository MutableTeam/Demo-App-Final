"use client"

export interface ResponsiveGameConfig {
  baseWidth: number
  baseHeight: number
  minScale: number
  maxScale: number
  maintainAspectRatio: boolean
  enableSafeArea: boolean
}

export interface ResponsiveGameMetrics {
  viewportWidth: number
  viewportHeight: number
  gameWidth: number
  gameHeight: number
  scale: number
  offsetX: number
  offsetY: number
  isLandscape: boolean
  safeAreaInsets: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export class ResponsiveGameManager {
  private config: ResponsiveGameConfig
  private metrics: ResponsiveGameMetrics
  private callbacks: Set<(metrics: ResponsiveGameMetrics) => void> = new Set()

  constructor(config: ResponsiveGameConfig) {
    this.config = config
    this.metrics = this.calculateMetrics()
    this.setupEventListeners()
  }

  private calculateMetrics(): ResponsiveGameMetrics {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const isLandscape = viewportWidth > viewportHeight

    // Get safe area insets
    const safeAreaInsets = this.getSafeAreaInsets()

    // Calculate available space
    const availableWidth = viewportWidth - safeAreaInsets.left - safeAreaInsets.right
    const availableHeight = viewportHeight - safeAreaInsets.top - safeAreaInsets.bottom

    // Calculate scale
    const scaleX = availableWidth / this.config.baseWidth
    const scaleY = availableHeight / this.config.baseHeight

    let scale: number
    if (this.config.maintainAspectRatio) {
      scale = Math.min(scaleX, scaleY)
    } else {
      scale = Math.max(scaleX, scaleY)
    }

    // Apply scale limits
    scale = Math.max(this.config.minScale, Math.min(this.config.maxScale, scale))

    // Calculate final dimensions
    const gameWidth = this.config.baseWidth * scale
    const gameHeight = this.config.baseHeight * scale

    // Calculate centering offsets
    const offsetX = safeAreaInsets.left + (availableWidth - gameWidth) / 2
    const offsetY = safeAreaInsets.top + (availableHeight - gameHeight) / 2

    return {
      viewportWidth,
      viewportHeight,
      gameWidth,
      gameHeight,
      scale,
      offsetX,
      offsetY,
      isLandscape,
      safeAreaInsets,
    }
  }

  private getSafeAreaInsets() {
    if (!this.config.enableSafeArea) {
      return { top: 0, right: 0, bottom: 0, left: 0 }
    }

    const style = getComputedStyle(document.documentElement)
    return {
      top: Number.parseInt(style.getPropertyValue("--safe-area-inset-top") || "0", 10),
      right: Number.parseInt(style.getPropertyValue("--safe-area-inset-right") || "0", 10),
      bottom: Number.parseInt(style.getPropertyValue("--safe-area-inset-bottom") || "0", 10),
      left: Number.parseInt(style.getPropertyValue("--safe-area-inset-left") || "0", 10),
    }
  }

  private setupEventListeners() {
    const updateMetrics = () => {
      const newMetrics = this.calculateMetrics()
      const hasChanged = JSON.stringify(newMetrics) !== JSON.stringify(this.metrics)

      if (hasChanged) {
        this.metrics = newMetrics
        this.notifyCallbacks()
      }
    }

    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout
    const debouncedUpdate = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(updateMetrics, 100)
    }

    window.addEventListener("resize", debouncedUpdate)
    window.addEventListener("orientationchange", debouncedUpdate)

    // Visual viewport support
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", debouncedUpdate)
      window.visualViewport.addEventListener("scroll", debouncedUpdate)
    }
  }

  private notifyCallbacks() {
    this.callbacks.forEach((callback) => callback(this.metrics))
  }

  public subscribe(callback: (metrics: ResponsiveGameMetrics) => void): () => void {
    this.callbacks.add(callback)

    // Immediately call with current metrics
    callback(this.metrics)

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback)
    }
  }

  public getMetrics(): ResponsiveGameMetrics {
    return { ...this.metrics }
  }

  public updateConfig(newConfig: Partial<ResponsiveGameConfig>) {
    this.config = { ...this.config, ...newConfig }
    this.metrics = this.calculateMetrics()
    this.notifyCallbacks()
  }

  public destroy() {
    this.callbacks.clear()
    // Remove event listeners would go here if we stored references
  }
}

// Utility functions for common responsive game operations
export const ResponsiveGameUtils = {
  // Convert screen coordinates to game coordinates
  screenToGame: (screenX: number, screenY: number, metrics: ResponsiveGameMetrics) => {
    const gameX = (screenX - metrics.offsetX) / metrics.scale
    const gameY = (screenY - metrics.offsetY) / metrics.scale
    return { x: gameX, y: gameY }
  },

  // Convert game coordinates to screen coordinates
  gameToScreen: (gameX: number, gameY: number, metrics: ResponsiveGameMetrics) => {
    const screenX = gameX * metrics.scale + metrics.offsetX
    const screenY = gameY * metrics.scale + metrics.offsetY
    return { x: screenX, y: screenY }
  },

  // Check if a point is within the game area
  isPointInGame: (screenX: number, screenY: number, metrics: ResponsiveGameMetrics) => {
    return (
      screenX >= metrics.offsetX &&
      screenX <= metrics.offsetX + metrics.gameWidth &&
      screenY >= metrics.offsetY &&
      screenY <= metrics.offsetY + metrics.gameHeight
    )
  },

  // Get optimal font size based on scale
  getScaledFontSize: (baseFontSize: number, metrics: ResponsiveGameMetrics) => {
    return Math.max(12, baseFontSize * metrics.scale)
  },

  // Get optimal UI element size based on scale
  getScaledUISize: (baseSize: number, metrics: ResponsiveGameMetrics) => {
    return Math.max(20, baseSize * metrics.scale)
  },
}
