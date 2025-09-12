"use client"

import type React from "react"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "")

    // Wait for gtag to be available
    const trackPageView = () => {
      if (typeof window !== "undefined" && window.dataLayer) {
        window.dataLayer.push({
          event: "page_view",
          page_path: url,
          page_title: document.title,
          page_location: window.location.href,
        })
        console.log("[v0] 📍 Page view tracked:", url)
      }
    }

    // Small delay to ensure gtag is loaded
    const timer = setTimeout(trackPageView, 100)
    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  return <>{children}</>
}
