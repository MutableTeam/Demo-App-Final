"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

interface GlobalUsernameContextType {
  username: string | null
  setUsername: (username: string) => void
  clearUsername: () => void
  isLoading: boolean
}

const GlobalUsernameContext = createContext<GlobalUsernameContextType | undefined>(undefined)

interface GlobalUsernameProviderProps {
  children: React.ReactNode
  publicKey?: string
}

export function GlobalUsernameProvider({ children, publicKey }: GlobalUsernameProviderProps) {
  const [username, setUsernameState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeUsername = () => {
      // Check for existing username in cookies
      const existingUsername = getCookie("chat-username")
      if (existingUsername) {
        setUsernameState(existingUsername)
      } else if (publicKey) {
        // Generate default username from publicKey if available
        const defaultUsername = `Player_${publicKey.substring(0, 4)}`
        setUsernameState(defaultUsername)
        setCookie("chat-username", defaultUsername)
      }
      setIsLoading(false)
    }

    initializeUsername()
  }, [publicKey])

  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null
    return null
  }

  const setCookie = (name: string, value: string, days = 30) => {
    if (typeof document === "undefined") return
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
  }

  const setUsername = useCallback((newUsername: string) => {
    const trimmedUsername = newUsername.trim()
    if (trimmedUsername) {
      setUsernameState(trimmedUsername)
      setCookie("chat-username", trimmedUsername)

      // Dispatch custom event to notify other components
      window.dispatchEvent(
        new CustomEvent("usernameChanged", {
          detail: { username: trimmedUsername },
        }),
      )
    }
  }, [])

  const clearUsername = useCallback(() => {
    setUsernameState(null)
    setCookie("chat-username", "", -1) // Delete cookie

    // Dispatch custom event to notify other components
    window.dispatchEvent(
      new CustomEvent("usernameChanged", {
        detail: { username: null },
      }),
    )
  }, [])

  const value: GlobalUsernameContextType = {
    username,
    setUsername,
    clearUsername,
    isLoading,
  }

  return <GlobalUsernameContext.Provider value={value}>{children}</GlobalUsernameContext.Provider>
}

export function useGlobalUsername() {
  const context = useContext(GlobalUsernameContext)
  if (context === undefined) {
    throw new Error("useGlobalUsername must be used within a GlobalUsernameProvider")
  }
  return context
}
