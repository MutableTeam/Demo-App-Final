"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface ResponsiveGameContainerProps {
  children: React.ReactNode
  className?: string
}

export default function ResponsiveGameContainer({ children, className }: ResponsiveGameContainerProps) {
  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden bg-black",
        "md:aspect-video md:max-h-[calc(100vh-10rem)] md:rounded-lg",
        className,
      )}
    >
      {children}
    </div>
  )
}
