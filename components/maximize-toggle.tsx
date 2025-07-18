"use client"

import { useState, useEffect, useCallback } from "react"
import { Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MaximizeToggleProps {
  onToggle?: (isMaximized: boolean) => void
  className?: string
}

export function MaximizeToggle({ onToggle, className }: MaximizeToggleProps) {
  const [isMaximized, setIsMaximized] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(mobile)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Load saved state on mount - default to minimized
  useEffect(() => {
    const saved = localStorage.getItem("screen-maximized")
    const maximized = saved === "true"
    setIsMaximized(maximized)

    // Apply initial state
    if (maximized) {
      applyMaximizedState(true)
    }

    onToggle?.(maximized)
  }, [onToggle])

  const applyMaximizedState = useCallback(
    (maximize: boolean) => {
      const html = document.documentElement
      const body = document.body

      if (maximize) {
        // Add maximize classes
        html.classList.add("screen-maximized")
        body.classList.add("maximized-body")

        // For mobile devices, request fullscreen API if available
        if (isMobile && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {
            // Fallback if fullscreen API fails
            console.log("Fullscreen API not available, using CSS fallback")
          })
        }

        // Prevent scrolling on body
        body.style.overflow = "hidden"
        body.style.position = "fixed"
        body.style.width = "100%"
        body.style.height = "100%"

        // Hide mobile browser UI elements
        if (isMobile) {
          const viewport = document.querySelector("meta[name=viewport]")
          if (viewport) {
            viewport.setAttribute(
              "content",
              "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover",
            )
          }

          // Force address bar to hide on mobile
          setTimeout(() => {
            window.scrollTo(0, 1)
            window.scrollTo(0, 0)
          }, 100)
        }
      } else {
        // Remove maximize classes
        html.classList.remove("screen-maximized")
        body.classList.remove("maximized-body")

        // Exit fullscreen if active
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {
            console.log("Exit fullscreen failed")
          })
        }

        // Restore normal scrolling
        body.style.overflow = ""
        body.style.position = ""
        body.style.width = ""
        body.style.height = ""

        // Restore normal viewport on mobile
        if (isMobile) {
          const viewport = document.querySelector("meta[name=viewport]")
          if (viewport) {
            viewport.setAttribute("content", "width=device-width, initial-scale=1.0")
          }
        }
      }
    },
    [isMobile],
  )

  const handleToggle = useCallback(() => {
    const newMaximized = !isMaximized
    setIsMaximized(newMaximized)

    // Save to localStorage
    localStorage.setItem("screen-maximized", newMaximized.toString())

    // Apply the state changes
    applyMaximizedState(newMaximized)

    onToggle?.(newMaximized)
  }, [isMaximized, applyMaximizedState, onToggle])

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement
      if (!isFullscreen && isMaximized) {
        // User exited fullscreen via browser controls, update our state
        setIsMaximized(false)
        localStorage.setItem("screen-maximized", "false")
        applyMaximizedState(false)
        onToggle?.(false)
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [isMaximized, applyMaximizedState, onToggle])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={cn(
        "h-8 w-8 bg-black/70 backdrop-blur-sm hover:bg-black/80 transition-all duration-300",
        "border border-white/20 hover:border-white/40",
        "shadow-lg hover:shadow-xl hover:scale-105",
        isMaximized && "bg-blue-600/80 border-blue-400/60 text-white",
        isMobile && "h-10 w-10", // Larger touch target on mobile
        className,
      )}
      aria-label={isMaximized ? "Exit fullscreen" : "Enter fullscreen"}
      title={isMaximized ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isMaximized ? (
        <Minimize className={cn("text-white transition-transform", isMobile ? "h-5 w-5" : "h-4 w-4")} />
      ) : (
        <Maximize className={cn("text-white transition-transform", isMobile ? "h-5 w-5" : "h-4 w-4")} />
      )}
    </Button>
  )
}

// Hook to detect maximize state
export function useMaximizeState() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    const checkMaximized = () => {
      const hasClass = document.documentElement.classList.contains("screen-maximized")
      setIsMaximized(hasClass)
    }

    // Check initial state
    checkMaximized()

    // Listen for class changes
    const observer = new MutationObserver(checkMaximized)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  return isMaximized
}
