"use client"

/**
 * Google Analytics Configuration:
 * - Stream Name: Mutable PvP
 * - Stream URL: https://www.mutablepvp.com
 * - Stream ID: 11192198601
 * - Measurement ID: G-W6CVTBKPBW
 */

// Initialize Google Analytics
export function initializeGoogleAnalytics(measurementId = "G-W6CVTBKPBW") {
  if (typeof window !== "undefined") {
    // Add Google Analytics script
    const script1 = document.createElement("script")
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script1)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    gtag("js", new Date())
    gtag("config", measurementId)

    // Make gtag available globally
    ;(window as any).gtag = gtag

    console.log("Google Analytics initialized with ID:", measurementId)
  }
}

// Track an event in Google Analytics
export function trackEvent(eventName: string, eventParams: object = {}) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    ;(window as any).gtag("event", eventName, eventParams)
    console.log(`Tracked event: ${eventName}`, eventParams)
  } else {
    console.warn("gtag is not initialized. Event not tracked:", eventName, eventParams)
  }
}

// Declare global gtag function
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}
