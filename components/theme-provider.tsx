"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useEffect } from "react"
import { applyIOSDarkModeClass, isIOS } from "@/utils/ios-dark-mode"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Apply iOS-specific dark mode fixes on mount
  useEffect(() => {
    const forceDarkMode = () => {
      if (typeof window !== "undefined") {
        // Force dark theme in localStorage
        localStorage.setItem("theme", "dark")

        // Force dark class on document
        document.documentElement.classList.add("dark")
        document.documentElement.classList.remove("light")

        // Force dark attribute
        document.documentElement.setAttribute("data-theme", "dark")

        // Override any light mode styles
        document.body.style.setProperty("color-scheme", "dark", "important")
      }
    }

    // Force dark mode immediately
    forceDarkMode()

    // Apply iOS dark mode class if needed
    applyIOSDarkModeClass()

    // Add iOS detection class to html element
    if (isIOS()) {
      document.documentElement.classList.add("ios-device")
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          const target = mutation.target as HTMLElement
          if (target === document.documentElement) {
            if (!target.classList.contains("dark")) {
              target.classList.add("dark")
              target.classList.remove("light")
            }
          }
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    const darkModeInterval = setInterval(forceDarkMode, 1000)

    return () => {
      observer.disconnect()
      clearInterval(darkModeInterval)
    }
  }, [])

  return (
    <NextThemesProvider {...props} defaultTheme="dark" enableSystem={false} forcedTheme="dark">
      {children}
    </NextThemesProvider>
  )
}
