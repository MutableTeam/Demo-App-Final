/**
 * Utility functions for dark mode compatibility
 */

// Function to determine if the current device is in dark mode
export const isDarkMode = (): boolean => {
  if (typeof window === "undefined") return false

  // Check if the user has set a preference in localStorage
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme) {
    return savedTheme === "dark"
  }

  // Otherwise, check system preference
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
}

// Function to get appropriate text color based on background
export const getTextColorForBackground = (bgColor: string): string => {
  // Simple logic: for dark backgrounds, use light text and vice versa
  const darkBackgrounds = [
    "bg-gray-800",
    "bg-gray-900",
    "bg-black",
    "bg-slate-800",
    "bg-slate-900",
    "bg-zinc-800",
    "bg-zinc-900",
    "bg-neutral-800",
    "bg-neutral-900",
    "bg-stone-800",
    "bg-stone-900",
  ]

  return darkBackgrounds.some((dark) => bgColor.includes(dark)) ? "text-white" : "text-gray-900"
}

// Function to get appropriate background color for dark mode
export const getDarkModeBackground = (defaultBg: string): string => {
  // Map common light backgrounds to their dark equivalents
  const bgMap: Record<string, string> = {
    "bg-white": "dark:bg-gray-800",
    "bg-gray-50": "dark:bg-gray-900",
    "bg-gray-100": "dark:bg-gray-800",
    "bg-gray-200": "dark:bg-gray-700",
    "bg-blue-50": "dark:bg-blue-900",
    "bg-blue-100": "dark:bg-blue-800",
    "bg-green-50": "dark:bg-green-900",
    "bg-green-100": "dark:bg-green-800",
  }

  // Find the matching dark background or return a default
  for (const [light, dark] of Object.entries(bgMap)) {
    if (defaultBg.includes(light)) {
      return dark
    }
  }

  return "dark:bg-gray-800" // Default dark background
}

// Function to add dark mode border color
export const getDarkModeBorder = (defaultBorder: string): string => {
  // Map common light borders to their dark equivalents
  const borderMap: Record<string, string> = {
    "border-gray-200": "dark:border-gray-700",
    "border-gray-300": "dark:border-gray-600",
    "border-blue-200": "dark:border-blue-700",
    "border-blue-300": "dark:border-blue-600",
    "border-green-200": "dark:border-green-700",
    "border-green-300": "dark:border-green-600",
  }

  // Find the matching dark border or return a default
  for (const [light, dark] of Object.entries(borderMap)) {
    if (defaultBorder.includes(light)) {
      return dark
    }
  }

  return "dark:border-gray-700" // Default dark border
}
