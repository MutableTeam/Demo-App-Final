"use client"

import { useState, useEffect } from "react"
import { debugManager, DebugLevel } from "@/utils/debug-utils"

interface DebugOverlayProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  initiallyVisible?: boolean
}

export default function DebugOverlay({ position = "bottom-right", initiallyVisible = false }: DebugOverlayProps) {
  const [visible, setVisible] = useState(initiallyVisible)
  const [logs, setLogs] = useState<any[]>([])
  const [fps, setFps] = useState<number>(0)
  const [expanded, setExpanded] = useState(false)

  // Position styles
  const positionClasses = {
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2",
    "bottom-left": "bottom-2 left-2",
    "bottom-right": "bottom-2 right-2",
  }

  // Update logs and performance metrics
  useEffect(() => {
    if (!visible) return

    const interval = setInterval(() => {
      // Get latest logs (only errors and warnings)
      const allLogs = debugManager.getLogs()
      const filteredLogs = allLogs.filter((log) => log.level <= DebugLevel.WARN).slice(-5) // Show only last 5 errors/warnings

      setLogs(filteredLogs)

      // Get performance data
      const perfHistory = debugManager.getPerformanceHistory()
      if (perfHistory.length > 0) {
        setFps(perfHistory[perfHistory.length - 1].fps)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [visible])

  // Toggle visibility with F7 key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F7") {
        setVisible((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  if (!visible) {
    return null
  }

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 bg-black/80 text-white p-2 rounded text-xs font-mono`}
      style={{ maxWidth: expanded ? "500px" : "200px" }}
    >
      <div className="flex justify-between items-center mb-1">
        <div className="font-bold">Debug {fps > 0 ? `(${fps} FPS)` : ""}</div>
        <div className="flex gap-1">
          <button onClick={() => setExpanded(!expanded)} className="px-1 hover:bg-gray-700 rounded">
            {expanded ? "−" : "+"}
          </button>
          <button onClick={() => setVisible(false)} className="px-1 hover:bg-gray-700 rounded">
            ×
          </button>
        </div>
      </div>

      {expanded && logs.length > 0 ? (
        <div className="max-h-60 overflow-y-auto">
          {logs.map((log, i) => (
            <div
              key={i}
              className={`py-1 border-t border-gray-700 ${
                log.level === DebugLevel.ERROR
                  ? "text-red-400"
                  : log.level === DebugLevel.WARN
                    ? "text-yellow-400"
                    : "text-white"
              }`}
            >
              <div className="flex justify-between">
                <span>[{DebugLevel[log.level]}]</span>
                <span className="opacity-70">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <div>
                {log.component}: {log.message}
              </div>
            </div>
          ))}
        </div>
      ) : expanded ? (
        <div className="py-2 text-gray-400">No errors or warnings</div>
      ) : (
        <div className="text-gray-400">Press F7 to toggle debug overlay</div>
      )}
    </div>
  )
}
