"use client"

import { useState, useEffect } from "react"
import { debugManager, DebugLevel } from "@/utils/debug-utils"

interface GameDiagnosticsProps {
  visible?: boolean
}

export default function GameDiagnostics({ visible = false }: GameDiagnosticsProps) {
  const [isVisible, setIsVisible] = useState(visible)
  const [diagnosticData, setDiagnosticData] = useState<{
    browserInfo: string
    screenSize: string
    memoryUsage: string
    webGLSupport: boolean
    audioSupport: boolean
    storageAvailable: boolean
    errors: number
    warnings: number
  }>({
    browserInfo: "Checking...",
    screenSize: "Checking...",
    memoryUsage: "Checking...",
    webGLSupport: false,
    audioSupport: false,
    storageAvailable: false,
    errors: 0,
    warnings: 0,
  })

  useEffect(() => {
    if (!isVisible) return

    // Run diagnostics
    const runDiagnostics = () => {
      try {
        // Browser info
        const browserInfo = `${navigator.userAgent}`

        // Screen size
        const screenSize = `${window.innerWidth}x${window.innerHeight}`

        // Memory usage
        let memoryUsage = "Not available"
        if ((performance as any).memory) {
          const memory = (performance as any).memory
          const usedMB = Math.round(memory.usedJSHeapSize / (1024 * 1024))
          const totalMB = Math.round(memory.totalJSHeapSize / (1024 * 1024))
          memoryUsage = `${usedMB}MB / ${totalMB}MB`
        }

        // WebGL support
        let webGLSupport = false
        try {
          const canvas = document.createElement("canvas")
          webGLSupport = !!(
            window.WebGLRenderingContext &&
            (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
          )
        } catch (e) {
          webGLSupport = false
        }

        // Audio support
        const audioSupport =
          typeof AudioContext !== "undefined" || typeof (window as any).webkitAudioContext !== "undefined"

        // Storage available
        let storageAvailable = false
        try {
          localStorage.setItem("test", "test")
          localStorage.removeItem("test")
          storageAvailable = true
        } catch (e) {
          storageAvailable = false
        }

        // Count errors and warnings
        const logs = debugManager.getLogs()
        const errors = logs.filter((log) => log.level === DebugLevel.ERROR).length
        const warnings = logs.filter((log) => log.level === DebugLevel.WARN).length

        setDiagnosticData({
          browserInfo,
          screenSize,
          memoryUsage,
          webGLSupport,
          audioSupport,
          storageAvailable,
          errors,
          warnings,
        })
      } catch (error) {
        console.error("Error running diagnostics:", error)
      }
    }

    runDiagnostics()
    const interval = setInterval(runDiagnostics, 5000)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed top-2 left-2 z-50 bg-black/80 text-white p-3 rounded text-xs font-mono max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Game Diagnostics</h3>
        <button onClick={() => setIsVisible(false)} className="px-1 hover:bg-gray-700 rounded">
          ×
        </button>
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-2 gap-1">
          <span className="text-gray-400">Browser:</span>
          <span className="truncate">{diagnosticData.browserInfo.split(" ").slice(-1)}</span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <span className="text-gray-400">Screen:</span>
          <span>{diagnosticData.screenSize}</span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <span className="text-gray-400">Memory:</span>
          <span>{diagnosticData.memoryUsage}</span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <span className="text-gray-400">WebGL:</span>
          <span className={diagnosticData.webGLSupport ? "text-green-400" : "text-red-400"}>
            {diagnosticData.webGLSupport ? "Supported" : "Not supported"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <span className="text-gray-400">Audio:</span>
          <span className={diagnosticData.audioSupport ? "text-green-400" : "text-red-400"}>
            {diagnosticData.audioSupport ? "Supported" : "Not supported"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <span className="text-gray-400">Storage:</span>
          <span className={diagnosticData.storageAvailable ? "text-green-400" : "text-red-400"}>
            {diagnosticData.storageAvailable ? "Available" : "Unavailable"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <span className="text-gray-400">Errors:</span>
          <span className={diagnosticData.errors > 0 ? "text-red-400" : "text-green-400"}>{diagnosticData.errors}</span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <span className="text-gray-400">Warnings:</span>
          <span className={diagnosticData.warnings > 0 ? "text-yellow-400" : "text-green-400"}>
            {diagnosticData.warnings}
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <button
          onClick={() => {
            const logs = debugManager.exportLogs()
            const blob = new Blob([logs], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `game-logs-${new Date().toISOString().slice(0, 10)}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
        >
          Export Logs
        </button>
      </div>
    </div>
  )
}
