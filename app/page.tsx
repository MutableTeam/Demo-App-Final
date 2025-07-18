"use client"

import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import MutablePlatform from "@/components/mutable-platform"
import { MobileNavigation } from "@/components/mobile-navigation"
import { CyberpunkThemeProvider } from "@/contexts/cyberpunk-theme-context"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <CyberpunkThemeProvider>
        <div className="min-h-screen bg-black">
          {isMobile ? <MobileNavigation /> : <MutablePlatform />}
          <Toaster />
        </div>
      </CyberpunkThemeProvider>
    </ThemeProvider>
  )
}
