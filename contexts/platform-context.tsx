"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type PlatformType = "desktop" | "mobile"

interface PlatformContextType {
  platformType: PlatformType
  setPlatformType: (type: PlatformType) => void
  isDesktop: boolean
  isMobile: boolean
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined)

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [platformType, setPlatformTypeState] = useState<PlatformType>("desktop")

  // Load preference from localStorage on mount
  useEffect(() => {
    const savedPlatform = localStorage.getItem("platformType") as PlatformType | null
    if (savedPlatform && (savedPlatform === "desktop" || savedPlatform === "mobile")) {
      setPlatformTypeState(savedPlatform)
    }
  }, [])

  // Save preference to localStorage when changed
  const setPlatformType = (type: PlatformType) => {
    setPlatformTypeState(type)
    localStorage.setItem("platformType", type)
  }

  const value = {
    platformType,
    setPlatformType,
    isDesktop: platformType === "desktop",
    isMobile: platformType === "mobile",
  }

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>
}

export function usePlatform() {
  const context = useContext(PlatformContext)
  if (context === undefined) {
    throw new Error("usePlatform must be used within a PlatformProvider")
  }
  return context
}
