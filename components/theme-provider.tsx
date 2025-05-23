"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useEffect } from "react"
import { applyIOSDarkModeClass, isIOS } from "@/utils/ios-dark-mode"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Apply iOS-specific dark mode fixes on mount
  useEffect(() => {
    // Apply iOS dark mode class if needed
    applyIOSDarkModeClass()

    // Add iOS detection class to html element
    if (isIOS()) {
      document.documentElement.classList.add("ios-device")
    }

    // Force light mode by default
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", "light")
      document.documentElement.classList.remove("dark")
    }
  }, [])

  return (
    <NextThemesProvider {...props} defaultTheme="light" enableSystem={false}>
      {children}
    </NextThemesProvider>
  )
}
