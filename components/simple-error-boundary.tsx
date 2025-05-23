"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Bug } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, info: { componentStack: string }) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class SimpleErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // Log the error to console
    console.error("Error caught by SimpleErrorBoundary:", error.message)

    // Call onError prop without causing state updates
    if (this.props.onError) {
      // Use setTimeout to break the current render cycle
      setTimeout(() => {
        try {
          this.props.onError?.(error, info)
        } catch (e) {
          console.error("Error in onError callback:", e)
        }
      }, 0)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="border-2 border-red-300 shadow-md">
          <CardHeader className="bg-red-50">
            <div className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-700">Something went wrong</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="p-3 bg-red-50 rounded-md border border-red-200">
              <p className="font-mono text-sm">{this.state.error?.message || "An unknown error occurred"}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="default"
              size="sm"
              className="bg-red-600 hover:bg-red-700"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Try again
            </Button>
          </CardFooter>
        </Card>
      )
    }

    return this.props.children
  }
}
