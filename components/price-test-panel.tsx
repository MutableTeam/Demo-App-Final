"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react"
import { getCryptoPrice, getSOLPrice, clearPriceCache, getCacheStatus } from "@/utils/crypto-price"
import { getTokenPrice } from "@/utils/token-utils"
import { SOL_TOKEN } from "@/config/token-registry"

interface TestResult {
  name: string
  status: "pending" | "success" | "error"
  result?: any
  error?: string
  duration?: number
}

export function PriceTestPanel() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [cacheStatus, setCacheStatus] = useState<any>({})

  const updateTest = (name: string, update: Partial<TestResult>) => {
    setTests((prev) => prev.map((test) => (test.name === name ? { ...test, ...update } : test)))
  }

  const runTest = async (name: string, testFn: () => Promise<any>) => {
    const startTime = Date.now()
    updateTest(name, { status: "pending" })

    try {
      const result = await testFn()
      const duration = Date.now() - startTime
      updateTest(name, {
        status: "success",
        result,
        duration,
      })
      console.log(`✅ ${name} completed in ${duration}ms:`, result)
    } catch (error) {
      const duration = Date.now() - startTime
      updateTest(name, {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        duration,
      })
      console.error(`❌ ${name} failed in ${duration}ms:`, error)
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)

    // Initialize tests
    const testList: TestResult[] = [
      { name: "Direct API Route Test", status: "pending" },
      { name: 'getCryptoPrice("solana")', status: "pending" },
      { name: "getSOLPrice()", status: "pending" },
      { name: "getTokenPrice(SOL_TOKEN)", status: "pending" },
      { name: "Cache Test", status: "pending" },
      { name: "Force Refresh Test", status: "pending" },
    ]
    setTests(testList)

    // Test 1: Direct API route
    await runTest("Direct API Route Test", async () => {
      const response = await fetch("/api/crypto-price?coinId=solana")
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      return `$${data.usdPrice.toFixed(4)} (updated: ${new Date(data.timestamp).toLocaleTimeString()})`
    })

    // Test 2: getCryptoPrice function
    await runTest('getCryptoPrice("solana")', async () => {
      const price = await getCryptoPrice("solana")
      return `$${price.toFixed(4)}`
    })

    // Test 3: getSOLPrice function
    await runTest("getSOLPrice()", async () => {
      const price = await getSOLPrice()
      return `$${price.toFixed(4)}`
    })

    // Test 4: getTokenPrice with SOL_TOKEN
    await runTest("getTokenPrice(SOL_TOKEN)", async () => {
      const tokenPrice = await getTokenPrice(SOL_TOKEN)
      return `$${tokenPrice.usdPrice.toFixed(4)} (updated: ${new Date(tokenPrice.lastUpdated).toLocaleTimeString()})`
    })

    // Test 5: Cache test (should be faster)
    await runTest("Cache Test", async () => {
      const price = await getCryptoPrice("solana")
      return `$${price.toFixed(4)} (should be from cache)`
    })

    // Test 6: Force refresh test
    await runTest("Force Refresh Test", async () => {
      clearPriceCache()
      const price = await getCryptoPrice("solana")
      return `$${price.toFixed(4)} (fresh fetch after cache clear)`
    })

    // Update cache status
    setCacheStatus(getCacheStatus())
    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Running...</Badge>
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            Success
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Failed</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">SOL Price Fetching Test Panel</h1>
        <p className="text-gray-600">Comprehensive testing of cryptocurrency price fetching functionality</p>
      </div>

      <div className="grid gap-6">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
            <CardDescription>Run tests to verify SOL price fetching is working correctly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={runAllTests} disabled={isRunning} className="flex items-center gap-2">
                <RefreshCw className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`} />
                {isRunning ? "Running Tests..." : "Run All Tests"}
              </Button>
              <Button variant="outline" onClick={() => setCacheStatus(getCacheStatus())}>
                Update Cache Status
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  clearPriceCache()
                  setCacheStatus(getCacheStatus())
                }}
              >
                Clear Cache
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Results of price fetching tests with timing information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tests.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Click "Run All Tests" to start testing</p>
              ) : (
                tests.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <h3 className="font-medium">{test.name}</h3>
                        {test.result && <p className="text-sm text-gray-600 font-mono">{test.result}</p>}
                        {test.error && <p className="text-sm text-red-600">{test.error}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {test.duration && <span className="text-xs text-gray-500">{test.duration}ms</span>}
                      {getStatusBadge(test.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cache Status */}
        <Card>
          <CardHeader>
            <CardTitle>Cache Status</CardTitle>
            <CardDescription>Current state of the price cache</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(cacheStatus).length === 0 ? (
              <p className="text-gray-500">No cached data</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(cacheStatus).map(([coin, data]: [string, any]) => (
                  <div key={coin} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium capitalize">{coin}</span>
                      <span className="text-sm text-gray-600 ml-2">${data.price.toFixed(4)}</span>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>Age: {data.age}s</div>
                      {data.lastUpdated && <div>Updated: {new Date(data.lastUpdated * 1000).toLocaleTimeString()}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                1. <strong>Open Browser Console</strong> (F12 → Console) to see detailed logs
              </p>
              <p>
                2. <strong>Click "Run All Tests"</strong> to execute all price fetching tests
              </p>
              <p>
                3. <strong>Check Results</strong> - all tests should show success with current SOL prices
              </p>
              <p>
                4. <strong>Verify Prices</strong> - compare with current market rates (should not be $98.45)
              </p>
              <p>
                5. <strong>Monitor Cache</strong> - second calls should be faster due to caching
              </p>
            </div>
            <Separator className="my-4" />
            <div className="text-xs text-gray-500">
              <p>
                <strong>Expected Behavior:</strong>
              </p>
              <p>• All tests should pass with green checkmarks</p>
              <p>• SOL prices should reflect current market rates</p>
              <p>• Cache tests should be faster than initial fetches</p>
              <p>• Console should show detailed API call logs</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
