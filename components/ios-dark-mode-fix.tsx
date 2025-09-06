"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { isIOS } from "@/utils/ios-dark-mode"

export function IOSDarkModeFix() {
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    if (!isIOS()) return

    // Function to apply iOS dark mode fixes
    const applyIOSDarkMode = () => {
      const isDark = resolvedTheme === "dark" || theme === "dark"

      if (isDark) {
        document.documentElement.classList.add("ios-dark")

        // Force all elements with light backgrounds to have dark backgrounds
        document.querySelectorAll('[class*="bg-[#"]').forEach((el) => {
          el.classList.add("ios-dark-bg-override")
        })

        document.querySelectorAll(".text-black, span").forEach((el) => {
          el.classList.add("ios-dark-text-override")
          // Force inline style as backup with higher specificity
          if (el instanceof HTMLElement) {
            el.style.setProperty("color", "#ffffff", "important")
          }
        })

        document.querySelectorAll("span").forEach((el) => {
          if (
            el instanceof HTMLElement &&
            (el.textContent?.includes("Phantom") || el.textContent?.includes("Demo Mode"))
          ) {
            el.style.setProperty("color", "#00ffff", "important")
            el.style.setProperty("background-color", "transparent", "important")
          }
        })
      } else {
        document.documentElement.classList.remove("ios-dark")

        // Remove override classes
        document.querySelectorAll(".ios-dark-bg-override").forEach((el) => {
          el.classList.remove("ios-dark-bg-override")
        })

        document.querySelectorAll(".ios-dark-text-override").forEach((el) => {
          el.classList.remove("ios-dark-text-override")
          // Remove inline style
          if (el instanceof HTMLElement) {
            el.style.removeProperty("color")
          }
        })
      }
    }

    // Apply immediately
    applyIOSDarkMode()

    // Set up a mutation observer to catch dynamically added elements
    const observer = new MutationObserver(applyIOSDarkMode)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => {
      observer.disconnect()
    }
  }, [theme, resolvedTheme])

  // This component doesn't render anything
  return null
}
