"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type PlatformType = "desktop" | "mobile"

interface PlatformContextType {
  platformType: PlatformType | null
  isSelected: boolean
  setPlatform: (platform: PlatformType) => void
  resetPlatform: () => void
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined)

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [platformType, setPlatformType] = useState<PlatformType | null>(null)
  const [isSelected, setIsSelected] = useState(false)

  // Load platform from localStorage on mount
  useEffect(() => {
    try {
      const savedPlatform = localStorage.getItem("mutable-platform")
      console.log("Loading platform from localStorage:", savedPlatform)
      if (savedPlatform && (savedPlatform === "desktop" || savedPlatform === "mobile")) {
        setPlatformType(savedPlatform as PlatformType)
        setIsSelected(true)
        console.log(`Loaded platform from storage: ${savedPlatform}`)
      }
    } catch (error) {
      console.error("Error loading platform from localStorage:", error)
    }
  }, [])

  const setPlatform = (platform: PlatformType) => {
    console.log(`Setting platform to: ${platform}`)
    try {
      setPlatformType(platform)
      setIsSelected(true)
      localStorage.setItem("mutable-platform", platform)
      console.log(`Platform successfully set to: ${platform}`)
    } catch (error) {
      console.error("Error setting platform:", error)
    }
  }

  const resetPlatform = () => {
    console.log("Resetting platform")
    try {
      setPlatformType(null)
      setIsSelected(false)
      localStorage.removeItem("mutable-platform")
      console.log("Platform successfully reset")
    } catch (error) {
      console.error("Error resetting platform:", error)
    }
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

export function usePlatform() {
  const context = useContext(PlatformContext)
  if (context === undefined) {
    throw new Error("usePlatform must be used within a PlatformProvider")
  }
  return context
}
