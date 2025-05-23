/**
 * Basic debugging system for Mutable games
 * Provides logging, error handling, performance monitoring, and state tracking
 */

// Debug levels
export enum DebugLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
}

// Debug configuration
interface DebugConfig {
  enabled: boolean
  level: DebugLevel
  capturePerformance: boolean
  maxLogs: number
}

// Performance metrics
interface PerformanceMetrics {
  fps: number
  frameTime: number
  memoryUsage?: number
  entityCount?: number
}

// Log entry structure
interface LogEntry {
  timestamp: number
  level: DebugLevel
  component: string
  message: string
  data?: any
  stack?: string
}

// State snapshot
interface StateSnapshot {
  timestamp: number
  label: string
  state: any
}

/**
 * Debug Manager - Core debugging functionality
 */
class DebugManager {
  private static instance: DebugManager
  private config: DebugConfig = {
    enabled: false,
    level: DebugLevel.ERROR,
    capturePerformance: false,
    maxLogs: 1000,
  }

  private logs: LogEntry[] = []
  private performanceHistory: PerformanceMetrics[] = []
  private stateSnapshots: StateSnapshot[] = []
  private lastFrameTime = 0
  private frameCount = 0
  private frameStartTime = 0

  private constructor() {}

  public static getInstance(): DebugManager {
    if (!DebugManager.instance) {
      DebugManager.instance = new DebugManager()
    }
    return DebugManager.instance
  }

  // Initialize the debug system
  public initialize(config?: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...config }
    this.log(DebugLevel.INFO, "DebugManager", "Debug system initialized", this.config)

    // Set up global error handler
    if (typeof window !== "undefined") {
      window.onerror = (message, source, lineno, colno, error) => {
        this.logError("GLOBAL", String(message), error)
        return false // Let default error handler run
      }
    }
  }

  // Update configuration
  public updateConfig(config: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...config }
    this.log(DebugLevel.INFO, "DebugManager", "Debug configuration updated", this.config)
  }

  // Enable/disable debug mode
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled
    this.log(DebugLevel.INFO, "DebugManager", `Debug mode ${enabled ? "enabled" : "disabled"}`)

    // Store in localStorage if available
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("mutable_debug_mode", enabled.toString())
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  // Check if debug is enabled from localStorage
  public checkLocalStorageDebugMode(): boolean {
    try {
      if (typeof window !== "undefined") {
        const debugMode = window.localStorage.getItem("mutable_debug_mode") === "true"
        this.config.enabled = debugMode
        return debugMode
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    return false
  }

  // Core logging function
  private log(level: DebugLevel, component: string, message: string, data?: any, error?: Error): void {
    // Skip if debug is disabled or level is too low
    if (!this.config.enabled && level !== DebugLevel.ERROR) return
    if (level > this.config.level) return

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      component,
      message,
      data,
      stack: error?.stack,
    }

    // Add to log history
    this.logs.push(entry)

    // Trim logs if exceeding max
    if (this.logs.length > this.config.maxLogs) {
      this.logs = this.logs.slice(-this.config.maxLogs)
    }

    // Output to console
    const levelName = DebugLevel[level] || "UNKNOWN"
    const consoleMethod =
      level === DebugLevel.ERROR
        ? "error"
        : level === DebugLevel.WARN
          ? "warn"
          : level === DebugLevel.INFO
            ? "info"
            : "log"

    // Format: [LEVEL] [Component] Message
    const logMessage = `[${levelName}] [${component}] ${message}`

    // @ts-ignore - TypeScript doesn't know about console methods
    console[consoleMethod](logMessage, data ? data : "")

    if (error?.stack) {
      console.groupCollapsed("Stack trace")
      console.log(error.stack)
      console.groupEnd()
    }
  }

  // Public logging methods
  public logDebug(component: string, message: string, data?: any): void {
    this.log(DebugLevel.DEBUG, component, message, data)
  }

  public logInfo(component: string, message: string, data?: any): void {
    this.log(DebugLevel.INFO, component, message, data)
  }

  public logWarning(component: string, message: string, data?: any): void {
    this.log(DebugLevel.WARN, component, message, data)
  }

  public logError(component: string, message: string, error?: any): void {
    this.log(DebugLevel.ERROR, component, message, error, error instanceof Error ? error : undefined)
  }

  // Performance monitoring
  public startFrame(): void {
    if (!this.config.enabled || !this.config.capturePerformance) return
    this.frameStartTime = performance.now()
  }

  public endFrame(): void {
    if (!this.config.enabled || !this.config.capturePerformance) return

    const now = performance.now()
    const frameTime = now - this.frameStartTime
    this.frameCount++

    // Calculate FPS every second
    if (now - this.lastFrameTime >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime))

      const metrics: PerformanceMetrics = {
        fps,
        frameTime,
      }

      // Try to get memory info if available
      if (performance && (performance as any).memory) {
        metrics.memoryUsage = (performance as any).memory.usedJSHeapSize / (1024 * 1024)
      }

      this.performanceHistory.push(metrics)

      // Keep last 60 seconds of performance data
      if (this.performanceHistory.length > 60) {
        this.performanceHistory.shift()
      }

      // Log if FPS drops below threshold
      if (fps < 30) {
        this.logWarning("Performance", `Low FPS detected: ${fps}`)
      }

      this.lastFrameTime = now
      this.frameCount = 0
    }
  }

  // Track entity counts
  public trackEntities(counts: Record<string, number>): void {
    if (!this.config.enabled || !this.config.capturePerformance) return

    if (this.performanceHistory.length > 0) {
      this.performanceHistory[this.performanceHistory.length - 1].entityCount = Object.values(counts).reduce(
        (sum, count) => sum + count,
        0,
      )
    }
  }

  // Capture state snapshot
  public captureState(state: any, label = "State Snapshot"): void {
    if (!this.config.enabled) return

    try {
      // Create a deep copy of the state to avoid reference issues
      const stateCopy = JSON.parse(JSON.stringify(state))

      const snapshot: StateSnapshot = {
        timestamp: Date.now(),
        label,
        state: stateCopy,
      }

      this.stateSnapshots.push(snapshot)

      // Keep last 20 snapshots
      if (this.stateSnapshots.length > 20) {
        this.stateSnapshots.shift()
      }

      this.logDebug("StateCapture", `State snapshot captured: ${label}`)
    } catch (error) {
      this.logError("StateCapture", "Failed to capture state snapshot", error)
    }
  }

  // Get logs
  public getLogs(): LogEntry[] {
    return [...this.logs]
  }

  // Get performance history
  public getPerformanceHistory(): PerformanceMetrics[] {
    return [...this.performanceHistory]
  }

  // Get state snapshots
  public getStateSnapshots(): StateSnapshot[] {
    return [...this.stateSnapshots]
  }

  // Clear logs
  public clearLogs(): void {
    this.logs = []
    this.logInfo("DebugManager", "Logs cleared")
  }

  // Export logs as JSON
  public exportLogs(): string {
    try {
      return JSON.stringify(
        {
          logs: this.logs,
          performance: this.performanceHistory,
          snapshots: this.stateSnapshots,
          timestamp: new Date().toISOString(),
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
        },
        null,
        2,
      )
    } catch (error) {
      this.logError("DebugManager", "Failed to export logs", error)
      return JSON.stringify({ error: "Failed to export logs" })
    }
  }

  // Track component lifecycle
  public trackComponentMount(componentName: string, props?: any): void {
    this.logInfo("LIFECYCLE", `Component mounted: ${componentName}`, props)
  }

  public trackComponentUnmount(componentName: string, reason?: string): void {
    this.logInfo("LIFECYCLE", `Component unmounted: ${componentName}`, { reason })
  }

  public trackComponentRender(componentName: string): void {
    this.logDebug("LIFECYCLE", `Component rendered: ${componentName}`)
  }

  // Track React errors
  public trackReactError(error: Error, componentStack: string): void {
    this.logError("REACT_ERROR", `Error in React component: ${error.message}`, { error, componentStack })
  }

  // Track promise rejections
  public setupGlobalErrorTracking(): void {
    if (typeof window !== "undefined") {
      // Track unhandled promise rejections
      window.addEventListener("unhandledrejection", (event) => {
        this.logError("PROMISE_REJECTION", `Unhandled Promise Rejection: ${event.reason}`, event.reason)
      })

      // Track global errors
      const originalOnError = window.onerror
      window.onerror = (message, source, lineno, colno, error) => {
        this.logError("GLOBAL_ERROR", `Global error: ${message}`, { source, lineno, colno, error })

        // Call original handler if it exists
        if (typeof originalOnError === "function") {
          return originalOnError(message, source, lineno, colno, error)
        }
        return false
      }
    }
  }

  // Memory usage tracking
  public trackMemoryUsage(): void {
    if (typeof window !== "undefined" && (performance as any).memory) {
      const memory = (performance as any).memory
      this.logDebug("MEMORY", "Memory usage", {
        usedJSHeapSize: (memory.usedJSHeapSize / (1024 * 1024)).toFixed(2) + " MB",
        totalJSHeapSize: (memory.totalJSHeapSize / (1024 * 1024)).toFixed(2) + " MB",
        jsHeapSizeLimit: (memory.jsHeapSizeLimit / (1024 * 1024)).toFixed(2) + " MB",
      })
    }
  }
}

// Create and export the debug manager instance
export const debugManager = DebugManager.getInstance()

/**
 * Error handler utility
 */
class ErrorHandler {
  // Try to execute a function and catch any errors
  public try<T>(fn: () => T, context?: any): T | undefined {
    try {
      return fn()
    } catch (error) {
      const component = context?.component || "Unknown"
      debugManager.logError(component, `Error in ${component}`, error)
      return undefined
    }
  }

  // Wrap a function with error handling
  public wrap<T extends (...args: any[]) => any>(
    fn: T,
    component: string,
  ): (...args: Parameters<T>) => ReturnType<T> | undefined {
    return (...args: Parameters<T>): ReturnType<T> | undefined => {
      try {
        return fn(...args)
      } catch (error) {
        debugManager.logError(component, `Error in ${component}`, error)
        return undefined
      }
    }
  }
}

// Create and export the error handler instance
export const errorHandler = new ErrorHandler()

// Initialize debug system with default settings
debugManager.initialize({
  enabled: debugManager.checkLocalStorageDebugMode(),
  level: DebugLevel.ERROR,
  capturePerformance: true,
  maxLogs: 1000,
})

// Export everything
export default {
  debugManager,
  errorHandler,
  DebugLevel,
}
