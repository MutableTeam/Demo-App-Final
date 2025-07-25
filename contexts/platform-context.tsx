"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"

export type PlatformType = "desktop" | "mobile"

interface PlatformContextType {
  platformType: PlatformType | null
  isSelected: boolean
  setPlatform: (platform: PlatformType) => void
  resetPlatform: () => void
  isUiActive: boolean
  setUiActive: (isActive: boolean) => void
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined)

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [platformType, setPlatformState] = useState<PlatformType | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isUiActive, setUiActiveState] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient) {
      const storedPlatform = localStorage.getItem("mutable-platform-type") as PlatformType | null
      if (storedPlatform) {
        setPlatformState(storedPlatform)
      }
    }
  }, [isClient])

  const setPlatform = useCallback(
    (platform: PlatformType) => {
      setPlatformState(platform)
      if (isClient) {
        localStorage.setItem("mutable-platform-type", platform)
      }
    },
    [isClient],
  )

  const resetPlatform = useCallback(() => {
    setPlatformState(null)
    if (isClient) {
      localStorage.removeItem("mutable-platform-type")
    }
  }, [isClient])

  const setUiActive = useCallback((isActive: boolean) => {
    setUiActiveState(isActive)
  }, [])

  return (
    <PlatformContext.Provider
      value={{
        platformType,
        isSelected: platformType !== null,
        setPlatform,
        resetPlatform,
        isUiActive,
        setUiActive,
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
