"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type PlatformType = "desktop" | "mobile"

interface PlatformContextType {
  platform: PlatformType | null
  setPlatform: (platform: PlatformType) => void
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined)

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [platform, setPlatform] = useState<PlatformType | null>(null)

  return <PlatformContext.Provider value={{ platform, setPlatform }}>{children}</PlatformContext.Provider>
}

export function usePlatform() {
  const context = useContext(PlatformContext)
  if (context === undefined) {
    throw new Error("usePlatform must be used within a PlatformProvider")
  }
  return context
}
