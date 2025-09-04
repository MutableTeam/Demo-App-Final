"use client"

import type React from "react"
import { createContext, useContext, useEffect } from "react"
import { cyberpunkTheme, cyberpunkColors, cyberpunkAnimations } from "@/styles/cyberpunk-theme"

interface CyberpunkThemeContextType {
  styleMode: "cyberpunk"
  theme: typeof cyberpunkTheme
  colors: typeof cyberpunkColors
  animations: typeof cyberpunkAnimations
  isCyberpunkMode: true
}

const CyberpunkThemeContext = createContext<CyberpunkThemeContextType | undefined>(undefined)

export function CyberpunkThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
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

    localStorage.removeItem("styleMode")
  }, [])

  return (
    <CyberpunkThemeContext.Provider
      value={{
        styleMode: "cyberpunk",
        theme: cyberpunkTheme,
        colors: cyberpunkColors,
        animations: cyberpunkAnimations,
        isCyberpunkMode: true,
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
