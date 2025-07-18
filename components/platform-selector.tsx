"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { usePlatform } from "@/contexts/platform-context"
import Image from "next/image"
import { CheckCircle } from "lucide-react"

export default function PlatformSelector() {
  const { platform, setPlatform } = usePlatform()
  const [selectedPlatform, setSelectedPlatform] = useState<"desktop" | "mobile" | null>(platform)

  const handleSelectPlatform = (type: "desktop" | "mobile") => {
    setSelectedPlatform(type)
    setPlatform(type)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <div className="mb-12">
        <Image
          src="/images/mutable-logo-transparent.png"
          alt="MutablePvP Logo"
          width={200}
          height={200}
          className="mx-auto"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Desktop Card */}
        <Card
          className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
            selectedPlatform === "desktop" ? "border-green-500 shadow-lg shadow-green-500/30" : "border-gray-700"
          } bg-gray-800/50 backdrop-blur-sm`}
        >
          <Image
            src="/images/retro-desktop-gaming.png"
            alt="Retro Desktop Gaming Setup"
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 opacity-30"
          />
          <CardContent className="relative z-10 flex flex-col items-center justify-center p-8 text-center h-full">
            <div className="text-4xl font-bold mb-4">Desktop</div>
            <Button
              onClick={() => handleSelectPlatform("desktop")}
              className="mt-4 px-8 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {selectedPlatform === "desktop" ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" /> Selected
                </span>
              ) : (
                "Select"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Mobile Card */}
        <Card
          className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
            selectedPlatform === "mobile" ? "border-green-500 shadow-lg shadow-green-500/30" : "border-gray-700"
          } bg-gray-800/50 backdrop-blur-sm`}
        >
          <Image
            src="/images/retro-mobile-gaming.png"
            alt="Retro Mobile Gaming Hands"
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 opacity-30"
          />
          <CardContent className="relative z-10 flex flex-col items-center justify-center p-8 text-center h-full">
            <div className="text-4xl font-bold mb-4">Mobile</div>
            <Button
              onClick={() => handleSelectPlatform("mobile")}
              className="mt-4 px-8 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {selectedPlatform === "mobile" ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" /> Selected
                </span>
              ) : (
                "Select"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
