"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type PlatformType = "desktop" | "mobile"

interface PlatformContextType {
  platform: PlatformType
  setPlatform: (platform: PlatformType) => void
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined)

interface PlatformProviderProps {
  children: ReactNode
}

export function PlatformProvider({ children }: PlatformProviderProps) {
  const [platform, setPlatform] = useState<PlatformType>("desktop")

  return <PlatformContext.Provider value={{ platform, setPlatform }}>{children}</PlatformContext.Provider>
}

export function usePlatform() {
  const context = useContext(PlatformContext)
  if (context === undefined) {
    throw new Error("usePlatform must be used within a PlatformProvider")
  }
  return context
}
