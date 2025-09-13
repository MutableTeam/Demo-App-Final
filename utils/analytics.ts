"use client"

/**
 * Google Analytics 4 Configuration:
 * - GA4 Measurement ID: G-8TPFC6NL03
 * - Stream Name: App.Mutablepvp
 * - Stream URL: https://app.mutablepvp.com
 * - Stream ID: 12150943480
 */

declare global {
  interface Window {
    dataLayer: any[]
    gtag: Function
  }
}

export function isAnalyticsReady(): boolean {
  return typeof window !== "undefined" && typeof window.dataLayer !== "undefined" && Array.isArray(window.dataLayer)
}

export function trackEvent(eventName: string, eventParams: object = {}) {
  if (typeof window === "undefined") {
    console.warn("[v0] Window not available. Event not tracked:", eventName)
    return
  }

  window.dataLayer = window.dataLayer || []

  const cleanEventName = eventName.replace(/[-\s]+/g, "_")
  const prefixedEventName = cleanEventName.startsWith("App_") ? cleanEventName : `App_${cleanEventName}`

  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", prefixedEventName, {
        event_category: "engagement",
        event_timestamp: new Date().toISOString(),
        ...eventParams,
      })
      console.log(`[v0] ✅ GA4 event tracked: ${prefixedEventName}`, eventParams)
    } else {
      window.dataLayer.push({
        event: prefixedEventName,
        event_category: "engagement",
        event_timestamp: new Date().toISOString(),
        ...eventParams,
      })
      console.log(`[v0] ✅ DataLayer event tracked: ${prefixedEventName}`, eventParams)
    }
  } catch (error) {
    console.error("[v0] ❌ Error tracking event:", prefixedEventName, error)
  }
}

export function trackPageView(pagePath?: string, pageTitle?: string) {
  if (typeof window === "undefined") return

  window.dataLayer = window.dataLayer || []

  if (typeof window.gtag === "function") {
    window.gtag("config", "G-8TPFC6NL03", {
      page_path: pagePath || window.location.pathname,
      page_title: pageTitle || document.title,
      page_location: window.location.href,
    })
    console.log("[v0] 📍 GA4 page view tracked:", pagePath || window.location.pathname)
  } else {
    window.dataLayer.push({
      event: "page_view",
      page_path: pagePath || window.location.pathname,
      page_title: pageTitle || document.title,
      page_location: window.location.href,
    })
    console.log("[v0] 📍 DataLayer page view tracked:", pagePath || window.location.pathname)
  }
}

export function testAnalytics() {
  console.log("[v0] 🧪 Testing Google Analytics 4...")
  console.log("[v0] GA4 dataLayer available:", typeof window.dataLayer)
  console.log("[v0] GA4 gtag available:", typeof window.gtag)
  console.log("[v0] GA4 dataLayer length:", window.dataLayer?.length)

  if (window.dataLayer) {
    console.log("[v0] Recent GA4 dataLayer entries:", window.dataLayer.slice(-5))
  }

  // Send a test event
  trackEvent("Test_GA4_Connection", {
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
  const walletName =
    walletType === "test"
      ? "Demo"
      : walletType
        ? walletType.charAt(0).toUpperCase() + walletType.slice(1)
        : loginType === "demo"
          ? "Demo"
          : "Wallet"

  const eventName = `Login_${platform.charAt(0).toUpperCase() + platform.slice(1)}_${walletName}`

  console.log(`[v0] 🔐 Tracking login event:`, {
    eventName,
    finalEventName: `App_${eventName}`,
    loginType,
    platform,
    walletType,
    walletName,
    windowWidth: typeof window !== "undefined" ? window.innerWidth : "undefined",
  })

  trackEvent(eventName, {
    event_category: "Authentication",
    event_label: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Login`,
    login_method: loginType,
    platform: platform,
    wallet_type: walletType || (loginType === "demo" ? "demo" : "unknown"),
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
