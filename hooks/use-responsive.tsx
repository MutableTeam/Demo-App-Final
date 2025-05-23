"use client"

import { useState, useEffect } from "react"
import { breakpoints } from "@/utils/responsive-utils"

type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl"

/**
 * Hook to detect current breakpoint
 * @returns The current breakpoint based on window width
 */
export function useBreakpoint() {
  // Default to 'md' for SSR
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("md")

  useEffect(() => {
    // Function to determine the current breakpoint
    const determineBreakpoint = () => {
      const width = window.innerWidth

      if (width < breakpoints.xs) return "xs"
      if (width < breakpoints.sm) return "sm"
      if (width < breakpoints.md) return "md"
      if (width < breakpoints.lg) return "lg"
      if (width < breakpoints.xl) return "xl"
      return "2xl"
    }

    // Set initial breakpoint
    setBreakpoint(determineBreakpoint())

    // Update breakpoint on resize
    const handleResize = () => {
      setBreakpoint(determineBreakpoint())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return breakpoint
}

/**
 * Hook to check if the current breakpoint matches or exceeds a given breakpoint
 * @param bp The breakpoint to check against
 * @returns Boolean indicating if the current viewport width matches or exceeds the given breakpoint
 */
export function useBreakpointMatch(bp: Breakpoint) {
  const currentBreakpoint = useBreakpoint()
  const order: Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "2xl"]

  return order.indexOf(currentBreakpoint) >= order.indexOf(bp)
}

/**
 * Hook to detect touch capability
 * @returns Boolean indicating if the device has touch capability
 */
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0

    setIsTouch(hasTouch)
  }, [])

  return isTouch
}

/**
 * Hook to detect device orientation
 * @returns Current orientation: 'portrait' or 'landscape'
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    typeof window !== "undefined" ? (window.innerHeight > window.innerWidth ? "portrait" : "landscape") : "portrait", // Default for SSR
  )

  useEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerHeight > window.innerWidth ? "portrait" : "landscape")
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return orientation
}

/**
 * Hook to get responsive values based on breakpoint
 * @param values Object with values for different breakpoints
 * @returns The value for the current breakpoint
 */
export function useResponsiveValue<T>(values: {
  base: T
  xs?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  "2xl"?: T
}): T {
  const breakpoint = useBreakpoint()
  const breakpointOrder: Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "2xl"]

  // Find the closest defined breakpoint
  const index = breakpointOrder.indexOf(breakpoint)
  for (let i = index; i >= 0; i--) {
    const bp = breakpointOrder[i]
    if (values[bp] !== undefined) {
      return values[bp] as T
    }
  }

  return values.base
}

export default {
  useBreakpoint,
  useBreakpointMatch,
  useIsTouchDevice,
  useOrientation,
  useResponsiveValue,
}
