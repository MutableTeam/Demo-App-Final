"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useMemo } from "react"

export type PlatformType = "desktop" | "mobile"

interface PlatformContextType {
  platformType: PlatformType | null
  isSelected: boolean
  setPlatform: (platform: PlatformType) => void
  resetPlatform: () => void
  isUiActive: boolean
  setUiActive: (isActive: boolean) => void
}

const PlatformContext = createContext<PlatformContextType>({
  platformType: null,
  isSelected: false,
  setPlatform: () => {},
  resetPlatform: () => {},
  isUiActive: false,
  setUiActive: () => {},
})

export const usePlatform = () => useContext(PlatformContext)

interface PlatformProviderProps {
  children: ReactNode
}

export function PlatformProvider({ children }: PlatformProviderProps) {
  const [platformType, setPlatformType] = useState<PlatformType | null>(null)
  const [isSelected, setIsSelected] = useState(false)
  const [isUiActive, setUiActive] = useState(false)

  // Load platform preference from localStorage on mount
  useEffect(() => {
    const savedPlatform = localStorage.getItem("mutable-platform-type")
    if (savedPlatform && (savedPlatform === "desktop" || savedPlatform === "mobile")) {
      setPlatformType(savedPlatform as PlatformType)
      setIsSelected(true)
    }
  }, [])

  const setPlatform = useCallback((platform: PlatformType) => {
    setPlatformType(platform)
    setIsSelected(true)
    localStorage.setItem("mutable-platform-type", platform)
  }, [])

  const resetPlatform = useCallback(() => {
    setPlatformType(null)
    setIsSelected(false)
    localStorage.removeItem("mutable-platform-type")
  }, [])

  const value = useMemo(
    () => ({
      platformType,
      isSelected,
      setPlatform,
      resetPlatform,
      isUiActive,
      setUiActive,
    }),
    [platformType, isSelected, setPlatform, resetPlatform, isUiActive],
  )

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>
}
