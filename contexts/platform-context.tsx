"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type PlatformType = "desktop" | "mobile"

interface PlatformContextType {
  platformType: PlatformType
  setPlatformType: (type: PlatformType) => void
  isSelected: boolean
}

const PlatformContext = createContext<PlatformContextType>({
  platformType: "desktop",
  setPlatformType: () => {},
  isSelected: false,
})

export const usePlatform = () => useContext(PlatformContext)

interface PlatformProviderProps {
  children: ReactNode
}

export function PlatformProvider({ children }: PlatformProviderProps) {
  const [platformType, setPlatformTypeState] = useState<PlatformType>("desktop")
  const [isSelected, setIsSelected] = useState(false)

  // Load saved platform preference
  useEffect(() => {
    const saved = localStorage.getItem("mutable-platform-type")
    const savedSelected = localStorage.getItem("mutable-platform-selected")

    if (saved && (saved === "desktop" || saved === "mobile")) {
      setPlatformTypeState(saved)
    }

    if (savedSelected === "true") {
      setIsSelected(true)
    }
  }, [])

  const setPlatformType = (type: PlatformType) => {
    setPlatformTypeState(type)
    setIsSelected(true)
    localStorage.setItem("mutable-platform-type", type)
    localStorage.setItem("mutable-platform-selected", "true")
  }

  return (
    <PlatformContext.Provider
      value={{
        platformType,
        setPlatformType,
        isSelected,
      }}
    >
      {children}
    </PlatformContext.Provider>
  )
}
