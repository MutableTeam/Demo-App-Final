"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"
import Image from "next/image"
import { usePlatform } from "@/contexts/platform-context"
import { cn } from "@/lib/utils"

export default function PlatformSelector() {
  const { platform, setPlatform } = usePlatform()
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(platform)

  const handleSelectPlatform = (type: "desktop" | "mobile") => {
    setSelectedPlatform(type)
  }

  const handleConfirmSelection = () => {
    if (selectedPlatform) {
      setPlatform(selectedPlatform as "desktop" | "mobile")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <Image
        src="/images/mutable-logo-transparent.png"
        alt="Mutable PvP Logo"
        width={200}
        height={200}
        className="mb-12 animate-pulse"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Desktop Card */}
        <Card
          className={cn(
            "relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 cursor-pointer group",
            selectedPlatform === "desktop" ? "ring-4 ring-green-500 scale-105" : "hover:scale-105 hover:shadow-xl",
          )}
          onClick={() => handleSelectPlatform("desktop")}
        >
          <Image
            src="/images/retro-desktop-gaming.png"
            alt="Retro Desktop Gaming Setup"
            width={600}
            height={400}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
            <h2 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">Desktop</h2>
            <p className="text-gray-300 text-sm">Optimized for keyboard & mouse</p>
          </div>
          {selectedPlatform === "desktop" && (
            <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-2 flex items-center gap-1 text-sm font-semibold">
              <Check className="h-4 w-4" /> Selected
            </div>
          )}
        </Card>

        {/* Mobile Card */}
        <Card
          className={cn(
            "relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 cursor-pointer group",
            selectedPlatform === "mobile" ? "ring-4 ring-green-500 scale-105" : "hover:scale-105 hover:shadow-xl",
          )}
          onClick={() => handleSelectPlatform("mobile")}
        >
          <Image
            src="/images/retro-mobile-gaming.png"
            alt="Retro Mobile Gaming Hands"
            width={600}
            height={400}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
            <h2 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">Mobile</h2>
            <p className="text-gray-300 text-sm">Optimized for touch controls</p>
          </div>
          {selectedPlatform === "mobile" && (
            <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-2 flex items-center gap-1 text-sm font-semibold">
              <Check className="h-4 w-4" /> Selected
            </div>
          )}
        </Card>
      </div>

      <Button
        onClick={handleConfirmSelection}
        disabled={!selectedPlatform}
        className="mt-12 px-8 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors duration-300 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Confirm Selection
      </Button>
    </div>
  )
}
