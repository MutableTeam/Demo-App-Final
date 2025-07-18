"use client"

import { usePlatform } from "@/contexts/platform-context"
import { Monitor, Smartphone } from "lucide-react"
import Image from "next/image"

export default function PlatformSelector() {
  const { platform, setPlatform } = usePlatform()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-12">
        <Image
          src="/images/mutable-logo-transparent.png"
          alt="MutablePvP"
          width={200}
          height={80}
          className="h-20 w-auto"
        />
      </div>

      {/* Platform Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Desktop Card */}
        <div
          onClick={() => setPlatform("desktop")}
          className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
            platform === "desktop" ? "ring-4 ring-blue-500" : ""
          }`}
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 p-8 h-80">
            {/* Background Image */}
            <div className="absolute inset-0 opacity-30">
              <Image src="/images/retro-desktop-gaming.png" alt="Desktop Gaming" fill className="object-cover" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
              <Monitor className="h-16 w-16 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Desktop</h3>
            </div>

            {/* Selection Indicator */}
            {platform === "desktop" && <div className="absolute top-4 right-4 w-4 h-4 bg-green-500 rounded-full"></div>}
          </div>
        </div>

        {/* Mobile Card */}
        <div
          onClick={() => setPlatform("mobile")}
          className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
            platform === "mobile" ? "ring-4 ring-green-500" : ""
          }`}
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 to-teal-700 p-8 h-80">
            {/* Background Image */}
            <div className="absolute inset-0 opacity-30">
              <Image src="/images/retro-mobile-gaming.png" alt="Mobile Gaming" fill className="object-cover" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
              <Smartphone className="h-16 w-16 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Mobile</h3>
            </div>

            {/* Selection Indicator */}
            {platform === "mobile" && <div className="absolute top-4 right-4 w-4 h-4 bg-green-500 rounded-full"></div>}
          </div>
        </div>
      </div>
    </div>
  )
}
