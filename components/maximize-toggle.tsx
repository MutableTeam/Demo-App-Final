"use client"

import { useState, useEffect } from "react"
import { Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MaximizeToggleProps {
  onToggle?: (isMaximized: boolean) => void
  className?: string
}

export function MaximizeToggle({ onToggle, className = "" }: MaximizeToggleProps) {
  const [isMaximized, setIsMaximized] = useState(false)

  // Load saved state on mount
  useEffect(() => {
    const saved = localStorage.getItem("screen-maximized")
    const maximized = saved === "true"
    setIsMaximized(maximized)

    // Apply initial state
    if (maximized) {
      document.documentElement.classList.add("screen-maximized")
    }

    onToggle?.(maximized)
  }, [onToggle])

  const handleToggle = () => {
    const newMaximized = !isMaximized
    setIsMaximized(newMaximized)

    // Save to localStorage
    localStorage.setItem("screen-maximized", newMaximized.toString())

    // Apply CSS class to document root
    if (newMaximized) {
      document.documentElement.classList.add("screen-maximized")
    } else {
      document.documentElement.classList.remove("screen-maximized")
    }

    onToggle?.(newMaximized)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={`h-8 w-8 bg-black/70 backdrop-blur-sm hover:bg-black/80 transition-colors ${className}`}
      aria-label={isMaximized ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isMaximized ? <Minimize className="h-4 w-4 text-white" /> : <Maximize className="h-4 w-4 text-white" />}
    </Button>
  )
}
