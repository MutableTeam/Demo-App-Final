"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Monitor, Gamepad2, Zap } from "lucide-react"
import Image from "next/image"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import SoundButton from "./sound-button"

interface ModeSelectionProps {
  onModeSelect: (mode: "desktop" | "mobile") => void
}

export default function ModeSelection({ onModeSelect }: ModeSelectionProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"
  const [hoveredMode, setHoveredMode] = useState<"desktop" | "mobile" | null>(null)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Image
              src="/images/mutable-logo-transparent.png"
              alt="Mutable Logo"
              width={200}
              height={120}
              className="mx-auto"
            />
          </div>
          <h1
            className={cn(
              "text-4xl md:text-5xl font-bold mb-4 font-mono",
              isCyberpunk ? "text-cyan-400" : "text-white",
            )}
          >
            CHOOSE YOUR EXPERIENCE
          </h1>
          <p className={cn("text-lg md:text-xl", isCyberpunk ? "text-cyan-300/70" : "text-gray-300")}>
            Select how you want to play on the Mutable platform
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Desktop Mode */}
          <Card
            className={cn(
              "relative overflow-hidden transition-all duration-300 cursor-pointer border-2",
              isCyberpunk
                ? "bg-black/80 border-cyan-500/50 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,255,255,0.3)]"
                : "bg-[#fbf3de] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
              hoveredMode === "desktop" && "scale-105",
            )}
            onMouseEnter={() => setHoveredMode("desktop")}
            onMouseLeave={() => setHoveredMode(null)}
            onClick={() => onModeSelect("desktop")}
          >
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className={cn("p-4 rounded-full", isCyberpunk ? "bg-cyan-900/50" : "bg-blue-100")}>
                  <Monitor className={cn("h-12 w-12", isCyberpunk ? "text-cyan-400" : "text-blue-600")} />
                </div>
              </div>
              <CardTitle className={cn("text-2xl font-mono", isCyberpunk ? "text-cyan-400" : "text-black")}>
                DESKTOP MODE
              </CardTitle>
              <CardDescription className={cn("text-base", isCyberpunk ? "text-cyan-300/70" : "text-gray-600")}>
                Full-featured gaming experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Gamepad2 className={cn("h-5 w-5", isCyberpunk ? "text-cyan-500" : "text-blue-600")} />
                  <span className={cn("text-sm", isCyberpunk ? "text-cyan-300" : "text-gray-700")}>
                    Complete game library access
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className={cn("h-5 w-5", isCyberpunk ? "text-cyan-500" : "text-blue-600")} />
                  <span className={cn("text-sm", isCyberpunk ? "text-cyan-300" : "text-gray-700")}>
                    Advanced trading features
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Monitor className={cn("h-5 w-5", isCyberpunk ? "text-cyan-500" : "text-blue-600")} />
                  <span className={cn("text-sm", isCyberpunk ? "text-cyan-300" : "text-gray-700")}>
                    Keyboard & mouse controls
                  </span>
                </div>
              </div>
              <SoundButton
                className={cn(
                  "w-full mt-6 font-mono font-bold",
                  isCyberpunk
                    ? "bg-cyan-900/50 hover:bg-cyan-800/50 text-cyan-400 border border-cyan-500"
                    : "bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]",
                )}
                onClick={() => onModeSelect("desktop")}
              >
                ENTER DESKTOP MODE
              </SoundButton>
            </CardContent>
          </Card>

          {/* Mobile Mode */}
          <Card
            className={cn(
              "relative overflow-hidden transition-all duration-300 cursor-pointer border-2",
              isCyberpunk
                ? "bg-black/80 border-pink-500/50 hover:border-pink-400 hover:shadow-[0_0_30px_rgba(255,0,255,0.3)]"
                : "bg-[#fbf3de] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
              hoveredMode === "mobile" && "scale-105",
            )}
            onMouseEnter={() => setHoveredMode("mobile")}
            onMouseLeave={() => setHoveredMode(null)}
            onClick={() => onModeSelect("mobile")}
          >
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className={cn("p-4 rounded-full", isCyberpunk ? "bg-pink-900/50" : "bg-green-100")}>
                  <Smartphone className={cn("h-12 w-12", isCyberpunk ? "text-pink-400" : "text-green-600")} />
                </div>
              </div>
              <CardTitle className={cn("text-2xl font-mono", isCyberpunk ? "text-pink-400" : "text-black")}>
                MOBILE MODE
              </CardTitle>
              <CardDescription className={cn("text-base", isCyberpunk ? "text-pink-300/70" : "text-gray-600")}>
                Optimized for touch devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Smartphone className={cn("h-5 w-5", isCyberpunk ? "text-pink-500" : "text-green-600")} />
                  <span className={cn("text-sm", isCyberpunk ? "text-pink-300" : "text-gray-700")}>
                    Touch-optimized controls
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Gamepad2 className={cn("h-5 w-5", isCyberpunk ? "text-pink-500" : "text-green-600")} />
                  <span className={cn("text-sm", isCyberpunk ? "text-pink-300" : "text-gray-700")}>
                    Mobile-friendly games
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className={cn("h-5 w-5", isCyberpunk ? "text-pink-500" : "text-green-600")} />
                  <span className={cn("text-sm", isCyberpunk ? "text-pink-300" : "text-gray-700")}>
                    Streamlined interface
                  </span>
                </div>
              </div>
              <SoundButton
                className={cn(
                  "w-full mt-6 font-mono font-bold",
                  isCyberpunk
                    ? "bg-pink-900/50 hover:bg-pink-800/50 text-pink-400 border border-pink-500"
                    : "bg-[#4CAF50] hover:bg-[#45a049] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]",
                )}
                onClick={() => onModeSelect("mobile")}
              >
                ENTER MOBILE MODE
              </SoundButton>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className={cn("text-sm", isCyberpunk ? "text-cyan-300/50" : "text-gray-400")}>
            You can switch between modes anytime by disconnecting your wallet
          </p>
        </div>
      </div>
    </div>
  )
}
