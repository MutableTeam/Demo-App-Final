"use client"

import type React from "react"

import { useEffect } from "react"
import { initializeGoogleAnalytics, trackPageLanding } from "@/utils/analytics"

export function GoogleAnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Google Analytics with new measurement ID
    initializeGoogleAnalytics("G-W6CVTBKPBW")

    // Track initial page landing
    trackPageLanding()

    console.log("[v0] Google Analytics initialized in layout")
  }, [])

  return <>{children}</>
}
