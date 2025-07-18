"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type PlatformType = "desktop" | "mobile"

interface PlatformContextType {
  platform: PlatformType | null
  isSelected: boolean
  setPlatform: (platform: PlatformType) => void
  resetPlatform: () => void
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined)

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [platform, setPlatformState] = useState<PlatformType | null>(null)
  const [isSelected, setIsSelected] = useState(false)

  // Load platform preference from localStorage on mount
  useEffect(() => {
    const savedPlatform = localStorage.getItem("mutable-platform-type")
    if (savedPlatform && (savedPlatform === "desktop" || savedPlatform === "mobile")) {
      setPlatformState(savedPlatform as PlatformType)
      setIsSelected(true)
    }
  }, [])

  const setPlatform = (platform: PlatformType) => {
    setPlatformState(platform)
    setIsSelected(true)
    localStorage.setItem("mutable-platform-type", platform)
  }

  const resetPlatform = () => {
    setPlatformState(null)
    setIsSelected(false)
    localStorage.removeItem("mutable-platform-type")
  }

  return (
    <PlatformContext.Provider
      value={{
        platform,
        isSelected,
        setPlatform,
        resetPlatform,
      }}
    >
      {children}
    </PlatformContext.Provider>
  )
}

export function usePlatform() {
  const context = useContext(PlatformContext)
  if (context === undefined) {
    throw new Error("usePlatform must be used within a PlatformProvider")
  }
  return context
}
