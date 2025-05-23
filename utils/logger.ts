type LogLevel = "debug" | "info" | "warn" | "error"

interface LogOptions {
  component?: string
  details?: any
  stack?: string
}

class Logger {
  private static instance: Logger
  private logs: Array<{ level: LogLevel; message: string; timestamp: Date; options?: LogOptions }> = []
  private isDebugMode = false

  private constructor() {
    // Try to read debug mode from localStorage if available
    try {
      this.isDebugMode = typeof window !== "undefined" && window.localStorage.getItem("mutable_debug_mode") === "true"
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  public enableDebugMode(): void {
    this.isDebugMode = true
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("mutable_debug_mode", "true")
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  public disableDebugMode(): void {
    this.isDebugMode = false
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("mutable_debug_mode", "false")
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  public debug(message: string, options?: LogOptions): void {
    try {
      this.log("debug", message, options)
    } catch (e) {
      console.error("Error in logger.debug:", e)
    }
  }

  public info(message: string, options?: LogOptions): void {
    try {
      this.log("info", message, options)
    } catch (e) {
      console.error("Error in logger.info:", e)
    }
  }

  public warn(message: string, options?: LogOptions): void {
    try {
      this.log("warn", message, options)
    } catch (e) {
      console.error("Error in logger.warn:", e)
    }
  }

  public error(message: string, options?: LogOptions): void {
    try {
      this.log("error", message, options)
    } catch (e) {
      console.error("Error in logger.error:", e)
    }
  }

  private log(level: LogLevel, message: string, options?: LogOptions): void {
    try {
      const logEntry = {
        level,
        message,
        timestamp: new Date(),
        options,
      }

      this.logs.push(logEntry)

      // Always log errors to console, but only log other levels in debug mode
      if (level === "error" || this.isDebugMode) {
        const consoleMethod = level === "debug" ? "log" : level
        const componentPrefix = options?.component ? `[${options.component}] ` : ""

        // @ts-ignore - TypeScript doesn't know about console methods
        console[consoleMethod](`${componentPrefix}${message}`, ...(options?.details ? [options.details] : []))

        if (options?.stack) {
          // @ts-ignore - TypeScript doesn't know about console methods
          console[consoleMethod]("Stack:", options.stack)
        }
      }
    } catch (e) {
      console.error("Error in logger.log:", e)
    }
  }

  public getLogs(): Array<{ level: LogLevel; message: string; timestamp: Date; options?: LogOptions }> {
    try {
      return [...this.logs]
    } catch (e) {
      console.error("Error in logger.getLogs:", e)
      return []
    }
  }

  public clearLogs(): void {
    try {
      this.logs = []
    } catch (e) {
      console.error("Error in logger.clearLogs:", e)
    }
  }

  public exportLogs(): string {
    try {
      return JSON.stringify(
        {
          logs: this.logs,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
          timestamp: new Date().toISOString(),
          debugMode: this.isDebugMode,
        },
        null,
        2,
      )
    } catch (e) {
      console.error("Error in logger.exportLogs:", e)
      return JSON.stringify({ error: "Failed to export logs" })
    }
  }
}

export const logger = Logger.getInstance()

export default logger
