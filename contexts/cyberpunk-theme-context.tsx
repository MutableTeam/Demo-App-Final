"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { cyberpunkTheme, cyberpunkColors, cyberpunkAnimations } from "@/styles/cyberpunk-theme"

type StyleMode = "regular" | "cyberpunk"

interface CyberpunkThemeContextType {
  styleMode: StyleMode
  setStyleMode: (mode: StyleMode) => void
  toggleStyleMode: () => void
  theme: typeof cyberpunkTheme
  colors: typeof cyberpunkColors
  animations: typeof cyberpunkAnimations
}

const CyberpunkThemeContext = createContext<CyberpunkThemeContextType | undefined>(undefined)

export function CyberpunkThemeProvider({ children }: { children: React.ReactNode }) {
  // Change default from "regular" to "cyberpunk"
  const [styleMode, setStyleMode] = useState<StyleMode>("cyberpunk")

  // Load preference from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("styleMode") as StyleMode | null
    if (savedMode && (savedMode === "regular" || savedMode === "cyberpunk")) {
      setStyleMode(savedMode)
    } else {
      // If no saved preference, set to cyberpunk and save it
      setStyleMode("cyberpunk")
      localStorage.setItem("styleMode", "cyberpunk")
    }
  }, [])

  // Save preference to localStorage when changed
  useEffect(() => {
    localStorage.setItem("styleMode", styleMode)

    // Apply global CSS variables for cyberpunk mode
    if (styleMode === "cyberpunk") {
      document.documentElement.classList.add("cyberpunk-theme")
      document.body.style.backgroundColor = "#000"
      document.body.style.color = "rgb(224, 255, 255)"

      // Force all cards to use cyberpunk styling
      const cards = document.querySelectorAll(".card, .arcade-card")
      cards.forEach((card) => {
        ;(card as HTMLElement).style.backgroundColor = "rgba(0, 0, 0, 0.8)"
        ;(card as HTMLElement).style.borderColor = "rgba(6, 182, 212, 0.5)"
        ;(card as HTMLElement).style.color = "rgb(224, 255, 255)"
      })
    } else {
      document.documentElement.classList.remove("cyberpunk-theme")
      document.body.style.removeProperty("background-color")
      document.body.style.removeProperty("color")
    }
  }, [styleMode])

  const toggleStyleMode = () => {
    setStyleMode((prev) => (prev === "regular" ? "cyberpunk" : "regular"))
  }

  return (
    <CyberpunkThemeContext.Provider
      value={{
        styleMode,
        setStyleMode,
        toggleStyleMode,
        theme: cyberpunkTheme,
        colors: cyberpunkColors,
        animations: cyberpunkAnimations,
      }}
    >
      {children}
    </CyberpunkThemeContext.Provider>
  )
}

export function useCyberpunkTheme() {
  const context = useContext(CyberpunkThemeContext)
  if (context === undefined) {
    throw new Error("useCyberpunkTheme must be used within a CyberpunkThemeProvider")
  }
  return context
}
