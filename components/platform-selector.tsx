"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { usePlatform } from "@/contexts/platform-context"
import type { PlatformType } from "@/contexts/platform-context"

interface PlatformSelectorProps {
  onPlatformSelected: (platform: PlatformType) => void
}

export default function PlatformSelector({ onPlatformSelected }: PlatformSelectorProps) {
  const { selectPlatform } = usePlatform()

  // Automatically select desktop platform and proceed
  useEffect(() => {
    const platform: PlatformType = "desktop"
    selectPlatform(platform)
    onPlatformSelected(platform)
  }, [selectPlatform, onPlatformSelected])

  return (
    <Card className="w-full max-w-2xl mx-auto bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <CardContent className="p-8 text-center">
        <div className="text-lg font-mono">Loading...</div>
      </CardContent>
    </Card>
  )
}
