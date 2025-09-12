"use client"

/**
 * Google Analytics Configuration:
 * - Stream Name: App.Mutablepvp
 * - Stream URL: https://app.mutablepvp.com
 * - Stream ID: 11192198601
 * - Measurement ID: G-8TPFC6NL03
 */

// Initialize Google Analytics
export function initializeGoogleAnalytics(measurementId = "G-8TPFC6NL03") {
  if (typeof window !== "undefined") {
    // Check if already initialized to prevent duplicate scripts
    if ((window as any).gtag) {
      console.log("Google Analytics already initialized")
      return
    }

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
    gtag("config", measurementId, {
      page_title: "Mutable PvP",
      page_location: "https://app.mutablepvp.com",
    })

    // Make gtag available globally
    ;(window as any).gtag = gtag

    console.log("Google Analytics initialized with ID:", measurementId)
  }
}

// Track an event in Google Analytics with App_ prefix
export function trackEvent(eventName: string, eventParams: object = {}) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    // Ensure event name uses underscores and has App_ prefix
    const cleanEventName = eventName.replace(/[-\s]+/g, "_")
    const prefixedEventName = cleanEventName.startsWith("App_") ? cleanEventName : `App_${cleanEventName}`

    // Use proper gtag event syntax
    ;(window as any).gtag("event", prefixedEventName, {
      event_category: "engagement",
      ...eventParams,
    })

    console.log(`[v0] Tracked event: ${prefixedEventName}`, eventParams)
  } else {
    console.warn("[v0] gtag is not initialized. Event not tracked:", eventName, eventParams)
  }
}

// Track page landing
export function trackPageLanding() {
  trackEvent("Page_Landing", {
    event_category: "Navigation",
    event_label: "User landed on page",
  })
}

// Track login events with platform and wallet type details
export function trackLogin(
  loginType: "wallet" | "demo",
  platform: "mobile" | "desktop",
  walletType?: "phantom" | "solflare" | "test",
) {
  const eventName = `Login_${platform.charAt(0).toUpperCase() + platform.slice(1)}_${walletType ? walletType.charAt(0).toUpperCase() + walletType.slice(1) : loginType === "demo" ? "Demo" : "Wallet"}`

  trackEvent(eventName, {
    event_category: "Authentication",
    event_label: `${platform.charAt(0).toUpperCase() + platform.slice(1)} ${walletType ? walletType.charAt(0).toUpperCase() + walletType.slice(1) : loginType === "demo" ? "Demo" : "Wallet"} Login`,
    login_method: loginType,
    platform: platform,
    wallet_type: walletType || (loginType === "demo" ? "test" : "unknown"),
  })
}

// Track game play events
export function trackGamePlay(gameName: string, gameId: string) {
  trackEvent(`${gameName.replace(/[\s-]+/g, "_")}_Play`, {
    event_category: "Games",
    event_label: `${gameName} Play Button`,
    game_id: gameId,
  })
}

// Declare global gtag function
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}
