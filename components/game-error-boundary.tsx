"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { debugManager } from "@/utils/debug-utils"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export default class GameErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our debug system
    debugManager.trackReactError(error, errorInfo.componentStack)

    // Capture a state snapshot if possible
    try {
      // Try to find game state in window for debugging
      if (typeof window !== "undefined" && (window as any).__gameStateRef) {
        debugManager.captureState((window as any).__gameStateRef.current, "Error State")
      }
    } catch (e) {
      debugManager.logError("ERROR_BOUNDARY", "Failed to capture state in error boundary", e)
    }

    this.setState({
      errorInfo,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render fallback UI or default error message
      return (
        this.props.fallback || (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
            <details className="whitespace-pre-wrap">
              <summary>Show error details</summary>
              <p className="mt-2 font-mono text-sm">{this.state.error?.toString()}</p>
              <p className="mt-2 font-mono text-sm overflow-auto max-h-40">{this.state.errorInfo?.componentStack}</p>
            </details>
            <button
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => window.location.reload()}
            >
              Reload Game
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
