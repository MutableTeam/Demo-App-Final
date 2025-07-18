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

        // Force all elements with dark text to have light text
        document.querySelectorAll(".text-black").forEach((el) => {
          el.classList.add("ios-dark-text-override")
        })
      } else {
        document.documentElement.classList.remove("ios-dark")

        // Remove override classes
        document.querySelectorAll(".ios-dark-bg-override").forEach((el) => {
          el.classList.remove("ios-dark-bg-override")
        })

        document.querySelectorAll(".ios-dark-text-override").forEach((el) => {
          el.classList.remove("ios-dark-text-override")
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
