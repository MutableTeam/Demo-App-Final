"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type StyleMode = "default" | "cyberpunk"

interface CyberpunkThemeContextType {
  styleMode: StyleMode
  setStyleMode: (mode: StyleMode) => void
  toggleStyleMode: () => void
}

const CyberpunkThemeContext = createContext<CyberpunkThemeContextType | undefined>(undefined)

export function CyberpunkThemeProvider({ children }: { children: React.ReactNode }) {
  const [styleMode, setStyleModeState] = useState<StyleMode>("default")

  // Load style mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("mutable-style-mode")
    if (savedMode && (savedMode === "default" || savedMode === "cyberpunk")) {
      setStyleModeState(savedMode as StyleMode)
    }
  }, [])

  const setStyleMode = (mode: StyleMode) => {
    setStyleModeState(mode)
    localStorage.setItem("mutable-style-mode", mode)
  }

  const toggleStyleMode = () => {
    const newMode = styleMode === "default" ? "cyberpunk" : "default"
    setStyleMode(newMode)
  }

  return (
    <CyberpunkThemeContext.Provider
      value={{
        styleMode,
        setStyleMode,
        toggleStyleMode,
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
