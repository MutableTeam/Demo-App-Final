"use client"

import { useState, useEffect } from "react"

export type OrientationType = "portrait" | "landscape"

export function useOrientation(): OrientationType {
  const [orientation, setOrientation] = useState<OrientationType>("portrait")

  useEffect(() => {
    const updateOrientation = () => {
      if (typeof window !== "undefined") {
        // Check if screen orientation API is available
        if (screen.orientation) {
          const angle = screen.orientation.angle
          setOrientation(angle === 90 || angle === 270 ? "landscape" : "portrait")
        } else {
          // Fallback to window dimensions
          setOrientation(window.innerWidth > window.innerHeight ? "landscape" : "portrait")
        }
      }
    }

    // Initial check
    updateOrientation()

    // Listen for orientation changes
    if (typeof window !== "undefined") {
      window.addEventListener("orientationchange", updateOrientation)
      window.addEventListener("resize", updateOrientation)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("orientationchange", updateOrientation)
        window.removeEventListener("resize", updateOrientation)
      }
    }
  }, [])

  return orientation
}
