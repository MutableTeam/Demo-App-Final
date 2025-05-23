"use client"

import { useState, useEffect } from "react"
import transitionDebugger from "@/utils/transition-debug"

interface ResourceMonitorProps {
  visible?: boolean
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
}

export default function ResourceMonitor({ visible = false, position = "bottom-right" }: ResourceMonitorProps) {
  const [isVisible, setIsVisible] = useState(visible)
  const [resourceCounts, setResourceCounts] = useState({
    timers: 0,
    intervals: 0,
    rafs: 0,
    eventListeners: 0,
  })
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null)

  // Position classes
  const positionClasses = {
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2",
    "bottom-left": "bottom-2 left-2",
    "bottom-right": "bottom-2 right-2",
  }

  // Update resource counts
  useEffect(() => {
    if (!isVisible) return

    const updateInterval = setInterval(() => {
      // Get resource counts
      const counts = transitionDebugger.getActiveResourceCounts()
      setResourceCounts(counts)

      // Get memory usage if available
      if (typeof performance !== "undefined" && (performance as any).memory) {
        const memory = (performance as any).memory
        setMemoryUsage(memory.usedJSHeapSize / (1024 * 1024))
      }
    }, 1000)

    return () => clearInterval(updateInterval)
  }, [isVisible])

  // Toggle visibility with F11
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault()
        setIsVisible((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 bg-black/80 text-white p-3 rounded-md font-mono text-xs w-64`}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Resource Monitor</h3>
        <button onClick={() => setIsVisible(false)} className="text-white/70 hover:text-white">
          ×
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Timers:</span>
          <span className={resourceCounts.timers > 10 ? "text-red-400" : "text-green-400"}>
            {resourceCounts.timers}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Intervals:</span>
          <span className={resourceCounts.intervals > 5 ? "text-red-400" : "text-green-400"}>
            {resourceCounts.intervals}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Animation Frames:</span>
          <span className={resourceCounts.rafs > 5 ? "text-red-400" : "text-green-400"}>{resourceCounts.rafs}</span>
        </div>
        <div className="flex justify-between">
          <span>Event Listeners:</span>
          <span className={resourceCounts.eventListeners > 20 ? "text-red-400" : "text-green-400"}>
            {resourceCounts.eventListeners}
          </span>
        </div>

        {memoryUsage !== null && (
          <div className="flex justify-between">
            <span>Memory Usage:</span>
            <span className={memoryUsage > 100 ? "text-red-400" : "text-green-400"}>{memoryUsage.toFixed(1)} MB</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-white/20">
        <button
          onClick={() => transitionDebugger.cleanupAll("ResourceMonitor")}
          className="w-full bg-red-600/70 hover:bg-red-600 text-white text-xs py-1 px-2 rounded"
        >
          Force Cleanup All Resources
        </button>
      </div>

      <div className="mt-2 text-xs text-white/50">Press F11 to toggle this monitor</div>
    </div>
  )
}
