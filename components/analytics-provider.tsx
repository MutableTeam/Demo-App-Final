"use client"

import type React from "react"
import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

declare global {
  interface Window {
    dataLayer: any[]
    gtag: Function
  }
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "")

    const trackPageView = () => {
      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || []

        // Use gtag for GA4 page views
        if (typeof window.gtag === "function") {
          window.gtag("config", "G-8TPFC6NL03", {
            page_path: url,
            page_title: document.title,
            page_location: window.location.href,
          })
          console.log("[v0] 📍 GA4 page view tracked:", url)
        } else {
          // Fallback to dataLayer push
          window.dataLayer.push({
            event: "page_view",
            page_path: url,
            page_title: document.title,
            page_location: window.location.href,
          })
          console.log("[v0] 📍 DataLayer page view tracked:", url)
        }
      }
    }

    const timer = setTimeout(trackPageView, 500)
    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  return <>{children}</>
}
