"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface AirdropSessionContextType {
  isAirdropDismissed: boolean
  dismissAirdrop: () => void
  resetAirdropSession: () => void
}

const AirdropSessionContext = createContext<AirdropSessionContextType | undefined>(undefined)

interface AirdropSessionProviderProps {
  children: React.ReactNode
}

export function AirdropSessionProvider({ children }: AirdropSessionProviderProps) {
  const [isAirdropDismissed, setIsAirdropDismissed] = useState(false)

  const dismissAirdrop = () => {
    setIsAirdropDismissed(true)
  }

  const resetAirdropSession = () => {
    setIsAirdropDismissed(false)
  }

  const value: AirdropSessionContextType = {
    isAirdropDismissed,
    dismissAirdrop,
    resetAirdropSession,
  }

  return <AirdropSessionContext.Provider value={value}>{children}</AirdropSessionContext.Provider>
}

export function useAirdropSession() {
  const context = useContext(AirdropSessionContext)
  if (context === undefined) {
    throw new Error("useAirdropSession must be used within an AirdropSessionProvider")
  }
  return context
}
