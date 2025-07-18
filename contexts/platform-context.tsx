"use client"
import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"

export type PlatformType = "desktop" | "mobile"

interface PlatformContextType {
  platformType: PlatformType | null
  isSelected: boolean
  setPlatform: (platform: PlatformType) => void
  resetPlatform: () => void
}

const PlatformContext = createContext<PlatformContextType>({
  platformType: null,
  isSelected: false,
  setPlatform: () => {},
  resetPlatform: () => {},
})

export const usePlatform = () => useContext(PlatformContext)

interface PlatformProviderProps {
  children: ReactNode
}

export function PlatformProvider({ children }: PlatformProviderProps) {
  const [platformType, setPlatformTypeState] = useState<PlatformType | null>(null)
  const [isSelected, setIsSelected] = useState(false)

  // Load platform preference from localStorage on mount
  useEffect(() => {
    const savedPlatform = localStorage.getItem("mutable-platform-type")
    if (savedPlatform && (savedPlatform === "desktop" || savedPlatform === "mobile")) {
      setPlatformTypeState(savedPlatform as PlatformType)
      setIsSelected(true)
    }
  }, [])

  const setPlatform = (platform: PlatformType) => {
    setPlatformTypeState(platform)
    setIsSelected(true)
    localStorage.setItem("mutable-platform-type", platform)
  }

  const resetPlatform = () => {
    setPlatformTypeState(null)
    setIsSelected(false)
    localStorage.removeItem("mutable-platform-type")
  }

  return (
    <PlatformContext.Provider
      value={{
        platformType,
        isSelected,
        setPlatform,
        resetPlatform,
      }}
    >
      {children}
    </PlatformContext.Provider>
  )
}
