"use client"

/**
 * Google Analytics Configuration:
 * - Stream Name: App.Mutablepvp
 * - Stream URL: https://app.mutablepvp.com
 * - Stream ID: 11192198601
 * - Measurement ID: G-8TPFC6NL03
 */

// Check if gtag is available and ready
export function isAnalyticsReady(): boolean {
  return typeof window !== "undefined" && typeof (window as any).gtag === "function"
}

// Track an event in Google Analytics with App_ prefix
export function trackEvent(eventName: string, eventParams: object = {}) {
  if (typeof window !== "undefined") {
    if (!(window as any).gtag) {
      console.warn("[v0] gtag is not available. Event not tracked:", eventName, eventParams)
      return
    }

    // Ensure event name uses underscores and has App_ prefix
    const cleanEventName = eventName.replace(/[-\s]+/g, "_")
    const prefixedEventName = cleanEventName.startsWith("App_") ? cleanEventName : `App_${cleanEventName}`

    try {
      // Use proper gtag event syntax
      ;(window as any).gtag("event", prefixedEventName, {
        event_category: "engagement",
        ...eventParams,
      })

      console.log(`[v0] ✅ Successfully tracked event: ${prefixedEventName}`, eventParams)
    } catch (error) {
      console.error("[v0] ❌ Error tracking event:", prefixedEventName, error)
    }
  } else {
    console.warn("[v0] Window not available. Event not tracked:", eventName, eventParams)
  }
}

export function testAnalytics() {
  console.log("[v0] 🧪 Testing Google Analytics...")
  console.log("[v0] gtag available:", typeof (window as any).gtag)
  console.log("[v0] dataLayer available:", typeof window.dataLayer)
  console.log("[v0] dataLayer contents:", window.dataLayer)

  // Send a test event
  trackEvent("Test_Analytics_Connection", {
    test_timestamp: new Date().toISOString(),
    test_source: "manual_test",
  })
}

// Track page landing
export function trackPageLanding() {
  console.log("[v0] 📍 Tracking page landing...")
  trackEvent("Page_Landing", {
    event_category: "Navigation",
    event_label: "User landed on page",
    timestamp: new Date().toISOString(),
  })
}

// Track login events with platform and wallet type details
export function trackLogin(
  loginType: "wallet" | "demo",
  platform: "mobile" | "desktop",
  walletType?: "phantom" | "solflare" | "test",
) {
  const eventName = `Login_${platform.charAt(0).toUpperCase() + platform.slice(1)}_${walletType ? walletType.charAt(0).toUpperCase() + walletType.slice(1) : loginType === "demo" ? "Demo" : "Wallet"}`

  console.log(`[v0] 🔐 Tracking login: ${eventName}`)
  trackEvent(eventName, {
    event_category: "Authentication",
    event_label: `${platform.charAt(0).toUpperCase() + platform.slice(1)} ${walletType ? walletType.charAt(0).toUpperCase() + walletType.slice(1) : loginType === "demo" ? "Demo" : "Wallet"} Login`,
    login_method: loginType,
    platform: platform,
    wallet_type: walletType || (loginType === "demo" ? "test" : "unknown"),
    timestamp: new Date().toISOString(),
  })
}

// Track game play events
export function trackGamePlay(gameName: string, gameId: string) {
  const eventName = `${gameName.replace(/[\s-]+/g, "_")}_Play`
  console.log(`[v0] 🎮 Tracking game play: ${eventName}`)

  trackEvent(eventName, {
    event_category: "Games",
    event_label: `${gameName} Play Button`,
    game_id: gameId,
    timestamp: new Date().toISOString(),
  })
}

// Track navigation events
export function trackNavigation(section: string) {
  const eventName = `Navbar_${section}`
  console.log(`[v0] 🧭 Tracking navigation: ${eventName}`)

  trackEvent(eventName, {
    event_category: "Navigation",
    event_label: `Navbar ${section} Click`,
    section: section.toLowerCase(),
    timestamp: new Date().toISOString(),
  })
}

// Declare global gtag function
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}
