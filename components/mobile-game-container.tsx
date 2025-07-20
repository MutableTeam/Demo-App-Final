"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
}

export default function MobileGameContainer({ children, className }: MobileGameContainerProps) {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerWidth > window.innerHeight ? "landscape" : "portrait")
    }

    handleOrientationChange()
    window.addEventListener("resize", handleOrientationChange)
    return () => window.removeEventListener("resize", handleOrientationChange)
  }, [])

  return (
    <div
      className={cn(
        "fixed inset-0 bg-zinc-900 flex items-center justify-center p-2 sm:p-4 font-mono text-zinc-400",
        className,
      )}
    >
      <div className="bg-zinc-800/50 rounded-2xl border border-zinc-700/50 w-full h-full flex items-center justify-center p-4">
        <div className="bg-black/70 border border-dashed border-zinc-600 rounded-lg flex items-center justify-center relative w-full h-full">
          {children}
        </div>
      </div>
    </div>
  )
}
