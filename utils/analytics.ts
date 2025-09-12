"use client"

/**
 * Google Analytics Configuration:
 * - Stream Name: App.Mutablepvp
 * - Stream URL: https://app.mutablepvp.com
 * - Stream ID: 12150943480
 * - Measurement ID: G-8TPFC6NL03
 */

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

// Check if analytics is ready
export function isAnalyticsReady(): boolean {
  return typeof window !== "undefined" && typeof window.dataLayer !== "undefined" && Array.isArray(window.dataLayer)
}

// Enhanced event tracking using dataLayer
export function trackEvent(eventName: string, eventParams: object = {}) {
  if (typeof window === "undefined") {
    console.warn("[v0] Window not available. Event not tracked:", eventName)
    return
  }

  if (!window.dataLayer) {
    console.warn("[v0] dataLayer not available. Event not tracked:", eventName)
    return
  }

  const cleanEventName = eventName.replace(/[-\s]+/g, "_")
  const prefixedEventName = cleanEventName.startsWith("App_") ? cleanEventName : `App_${cleanEventName}`

  try {
    window.dataLayer.push({
      event: prefixedEventName,
      event_category: "engagement",
      event_timestamp: new Date().toISOString(),
      ...eventParams,
    })

    console.log(`[v0] ✅ Successfully tracked event: ${prefixedEventName}`, eventParams)
  } catch (error) {
    console.error("[v0] ❌ Error tracking event:", prefixedEventName, error)
  }
}

// Manual page view tracking for custom navigation
export function trackPageView(pagePath?: string, pageTitle?: string) {
  if (typeof window === "undefined" || !window.dataLayer) return

  window.dataLayer.push({
    event: "page_view",
    page_path: pagePath || window.location.pathname,
    page_title: pageTitle || document.title,
    page_location: window.location.href,
  })

  console.log("[v0] 📍 Manual page view tracked:", pagePath || window.location.pathname)
}

// Enhanced test function with dataLayer debugging
export function testAnalytics() {
  console.log("[v0] 🧪 Testing Google Analytics...")
  console.log("[v0] dataLayer available:", typeof window.dataLayer)
  console.log("[v0] dataLayer length:", window.dataLayer?.length)
  console.log("[v0] gtag available:", typeof window.gtag)

  if (window.dataLayer) {
    console.log("[v0] Recent dataLayer entries:", window.dataLayer.slice(-5))
  }

  // Send a test event via dataLayer
  trackEvent("Test_Analytics_Connection", {
    test_timestamp: new Date().toISOString(),
    test_source: "manual_test",
    debug_mode: process.env.NODE_ENV === "development",
  })
}

// Track login events with enhanced parameters
export function trackLogin(
  loginType: "wallet" | "demo",
  platform: "mobile" | "desktop",
  walletType?: "phantom" | "solflare" | "test",
) {
  const eventName = `Login_${platform.charAt(0).toUpperCase() + platform.slice(1)}_${
    walletType ? walletType.charAt(0).toUpperCase() + walletType.slice(1) : loginType === "demo" ? "Demo" : "Wallet"
  }`

  console.log(`[v0] 🔐 Tracking login: ${eventName}`)
  trackEvent(eventName, {
    event_category: "Authentication",
    event_label: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Login`,
    login_method: loginType,
    platform: platform,
    wallet_type: walletType || (loginType === "demo" ? "test" : "unknown"),
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
  })
}

// Track conversion events
export function trackConversion(conversionName: string, value?: number, currency?: string) {
  console.log(`[v0] 💰 Tracking conversion: ${conversionName}`)

  trackEvent(conversionName, {
    event_category: "Conversion",
    event_label: conversionName,
    value: value,
    currency: currency || "USD",
  })
}
