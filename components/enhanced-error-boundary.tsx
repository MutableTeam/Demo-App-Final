"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Bug, RefreshCw, Copy, Check } from "lucide-react"
import logger from "@/utils/logger"

interface FallbackProps {
  error: Error
  resetErrorBoundary: () => void
  componentStack?: string
  componentName?: string
}

function ErrorFallback({ error, resetErrorBoundary, componentStack, componentName }: FallbackProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // Log the error to our logger
  React.useEffect(() => {
    logger.error(`Error in ${componentName || "unknown component"}`, {
      component: componentName,
      details: {
        message: error.message,
        name: error.name,
      },
      stack: error.stack || "No stack trace available",
    })
  }, [error, componentName])

  const copyErrorDetails = () => {
    const errorDetails = JSON.stringify(
      {
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack,
        },
        componentStack,
        componentName,
        timestamp: new Date().toISOString(),
        logs: logger.getLogs(),
      },
      null,
      2,
    )

    navigator.clipboard.writeText(errorDetails).then(() => {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    })
  }

  return (
    <Card className="border-2 border-red-300 shadow-md">
      <CardHeader className="bg-red-50">
        <div className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-red-500" />
          <CardTitle className="text-red-700">Something went wrong</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="p-3 bg-red-50 rounded-md border border-red-200">
          <p className="font-mono text-sm">{error.message}</p>
        </div>

        {componentName && (
          <div className="text-sm">
            <span className="font-semibold">Component:</span> {componentName}
          </div>
        )}

        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-xs"
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          >
            {isDetailsOpen ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Hide technical details
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Show technical details
              </>
            )}
          </Button>

          {isDetailsOpen && (
            <div className="space-y-2">
              <div className="text-xs">
                <div className="font-semibold mb-1">Error name:</div>
                <div className="font-mono bg-gray-100 p-2 rounded">{error.name}</div>
              </div>

              {error.stack && (
                <div className="text-xs">
                  <div className="font-semibold mb-1">Stack trace:</div>
                  <pre className="font-mono bg-gray-100 p-2 rounded overflow-x-auto text-[10px] max-h-40">
                    {error.stack}
                  </pre>
                </div>
              )}

              {componentStack && (
                <div className="text-xs">
                  <div className="font-semibold mb-1">Component stack:</div>
                  <pre className="font-mono bg-gray-100 p-2 rounded overflow-x-auto text-[10px] max-h-40">
                    {componentStack}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button variant="outline" size="sm" className="text-xs" onClick={copyErrorDetails}>
          {isCopied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copy error details
            </>
          )}
        </Button>
        <Button
          variant="default"
          size="sm"
          className="text-xs bg-red-600 hover:bg-red-700"
          onClick={resetErrorBoundary}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Try again
        </Button>
      </CardFooter>
    </Card>
  )
}

interface EnhancedErrorBoundaryProps {
  children: React.ReactNode
  componentName?: string
  fallback?: React.ReactNode
}

export class EnhancedErrorBoundary extends React.Component<
  EnhancedErrorBoundaryProps,
  { hasError: boolean; error: Error | null; componentStack: string }
> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, componentStack: "" }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    this.setState({ componentStack: info.componentStack })

    logger.error(`Error caught in ${this.props.componentName || "unknown"} boundary`, {
      component: this.props.componentName,
      details: {
        message: error.message,
        name: error.name,
        componentStack: info.componentStack,
      },
      stack: error.stack,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback
          error={this.state.error!}
          resetErrorBoundary={() => this.setState({ hasError: false, error: null })}
          componentStack={this.state.componentStack}
          componentName={this.props.componentName}
        />
      )
    }

    return this.props.children
  }
}
