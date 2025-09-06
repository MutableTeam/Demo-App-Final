"use client"

import { useState, useEffect, useRef } from "react"
import { debugManager } from "@/utils/debug-utils"
import transitionDebugger from "@/utils/transition-debug"

interface CountdownTimerProps {
  duration: number
  onComplete: () => void
  size?: "small" | "medium" | "large"
  className?: string
}

export default function CountdownTimer({ duration, onComplete, size = "medium", className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const componentId = useRef(`countdown-timer-${Date.now()}`).current
  const hasCompletedRef = useRef(false)
  const startTimeRef = useRef<number>(Date.now())
  const intervalIdRef = useRef<number | null>(null)

  // Use effect with empty dependency array to ensure it only runs once on mount
  useEffect(() => {
    debugManager.trackComponentMount("CountdownTimer", { duration })
    transitionDebugger.trackTransition("none", "mounted", "CountdownTimer")

    // Record the start time only once
    startTimeRef.current = Date.now()

    debugManager.logInfo("CountdownTimer", `Starting countdown from ${duration} seconds, componentId: ${componentId}`)

    // Set up the countdown interval with more precise timing
    intervalIdRef.current = transitionDebugger.safeSetInterval(
      () => {
        const now = Date.now()
        const elapsedSeconds = Math.floor((now - startTimeRef.current) / 1000)
        const newTimeLeft = Math.max(0, duration - elapsedSeconds)

        debugManager.logInfo("CountdownTimer", `Tick: ${newTimeLeft} seconds left`)

        setTimeLeft(newTimeLeft)

        // If countdown is complete and hasn't been handled yet
        if (newTimeLeft <= 0 && !hasCompletedRef.current) {
          // Mark as completed to prevent multiple calls
          hasCompletedRef.current = true

          debugManager.logInfo("CountdownTimer", "Countdown reached zero, clearing interval and triggering completion")

          // Clear the interval immediately
          if (intervalIdRef.current !== null) {
            transitionDebugger.safeClearInterval(`${componentId}-countdown`)
            intervalIdRef.current = null
          }

          // Call onComplete directly
          try {
            debugManager.logInfo("CountdownTimer", "Executing onComplete callback")
            onComplete()
            debugManager.logInfo("CountdownTimer", "onComplete callback executed successfully")
          } catch (error) {
            debugManager.logError("CountdownTimer", "Error in onComplete callback", error)
          }
        }
      },
      250, // More frequent updates for smoother countdown
      `${componentId}-countdown`,
    )

    // Clean up function that only runs on unmount
    return () => {
      debugManager.logInfo("CountdownTimer", `Unmounting countdown timer, componentId: ${componentId}`)

      if (intervalIdRef.current !== null) {
        transitionDebugger.safeClearInterval(`${componentId}-countdown`)
        intervalIdRef.current = null
      }

      debugManager.trackComponentUnmount("CountdownTimer")
      transitionDebugger.trackTransition("mounted", "unmounted", "CountdownTimer")

      // If we're unmounting and haven't completed yet, log it
      if (!hasCompletedRef.current && timeLeft > 0) {
        debugManager.logWarning("CountdownTimer", "Timer unmounted before completion", { timeLeft })
      }
    }
  }, []) // Empty dependency array to ensure this only runs once

  // Determine size classes
  const sizeClasses = {
    small: "text-2xl",
    medium: "text-4xl",
    large: "text-6xl",
  }

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`font-mono font-bold ${sizeClasses[size]} text-center ${
          timeLeft <= 1 ? "text-red-400" : timeLeft <= 2 ? "text-amber-400" : "text-white"
        }`}
        aria-live="polite"
      >
        {timeLeft}
      </div>
    </div>
  )
}
