/**
 * Utility functions for iOS dark mode detection and fixes
 */

// Function to detect if the device is running iOS
export const isIOS = (): boolean => {
  if (typeof window === "undefined") return false

  // Check for iOS devices
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}

// Function to apply iOS-specific dark mode class
export const applyIOSDarkModeClass = (): void => {
  if (typeof window === "undefined") return

  if (isIOS()) {
    // Check if dark mode is enabled
    const isDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches

    if (isDarkMode) {
      document.documentElement.classList.add("ios-dark")
    } else {
      document.documentElement.classList.remove("ios-dark")
    }

    // Listen for changes in color scheme
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (e.matches) {
        document.documentElement.classList.add("ios-dark")
      } else {
        document.documentElement.classList.remove("ios-dark")
      }
    })
  }
}

// Function to get iOS-safe dark mode class
export const getIOSSafeDarkClass = (baseClass: string): string => {
  if (isIOS()) {
    return `${baseClass} ios-dark-safe`
  }
  return baseClass
}
