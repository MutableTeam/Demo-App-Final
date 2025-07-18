"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone, Monitor, Gamepad2, TouchpadIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"

interface ModeSelectionProps {
  onModeSelect: (mode: "mobile" | "desktop") => void
}

export default function ModeSelection({ onModeSelect }: ModeSelectionProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"
  const [selectedMode, setSelectedMode] = useState<"mobile" | "desktop" | null>(null)

  const handleModeSelect = (mode: "mobile" | "desktop") => {
    setSelectedMode(mode)
    setTimeout(() => {
      onModeSelect(mode)
    }, 300)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1
            className={cn(
              "text-4xl font-bold mb-4 font-mono",
              isCyberpunk ? "text-cyan-400" : "text-gray-900 dark:text-white",
            )}
          >
            Choose Your Experience
          </h1>
          <p className={cn("text-lg", isCyberpunk ? "text-cyan-300/70" : "text-gray-600 dark:text-gray-300")}>
            Select how you'd like to play on the Mutable world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mobile Mode */}
          <Card
            className={cn(
              "cursor-pointer transition-all duration-300 hover:scale-105 border-2",
              selectedMode === "mobile" && "ring-4 ring-blue-500",
              isCyberpunk ? "bg-black/80 border-cyan-500/50 hover:border-cyan-400" : "hover:border-blue-400",
            )}
            onClick={() => handleModeSelect("mobile")}
          >
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div
                  className={cn("p-4 rounded-full", isCyberpunk ? "bg-cyan-900/50" : "bg-blue-100 dark:bg-blue-900")}
                >
                  <Smartphone
                    className={cn("h-12 w-12", isCyberpunk ? "text-cyan-400" : "text-blue-600 dark:text-blue-400")}
                  />
                </div>
              </div>
              <CardTitle
                className={cn("text-2xl font-mono", isCyberpunk ? "text-cyan-400" : "text-gray-900 dark:text-white")}
              >
                Mobile Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <TouchpadIcon className={cn("h-5 w-5", isCyberpunk ? "text-cyan-500" : "text-blue-500")} />
                  <span
                    className={cn("text-sm", isCyberpunk ? "text-cyan-300/70" : "text-gray-600 dark:text-gray-300")}
                  >
                    Touch controls & virtual joystick
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Gamepad2 className={cn("h-5 w-5", isCyberpunk ? "text-cyan-500" : "text-blue-500")} />
                  <span
                    className={cn("text-sm", isCyberpunk ? "text-cyan-300/70" : "text-gray-600 dark:text-gray-300")}
                  >
                    Optimized for mobile gaming
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Smartphone className={cn("h-5 w-5", isCyberpunk ? "text-cyan-500" : "text-blue-500")} />
                  <span
                    className={cn("text-sm", isCyberpunk ? "text-cyan-300/70" : "text-gray-600 dark:text-gray-300")}
                  >
                    Responsive design for all screen sizes
                  </span>
                </div>
              </div>
              <Button
                className={cn(
                  "w-full mt-6",
                  isCyberpunk
                    ? "bg-cyan-900/50 hover:bg-cyan-800/50 text-cyan-400 border border-cyan-500"
                    : "bg-blue-600 hover:bg-blue-700 text-white",
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  handleModeSelect("mobile")
                }}
              >
                Choose Mobile
              </Button>
            </CardContent>
          </Card>

          {/* Desktop Mode */}
          <Card
            className={cn(
              "cursor-pointer transition-all duration-300 hover:scale-105 border-2",
              selectedMode === "desktop" && "ring-4 ring-green-500",
              isCyberpunk ? "bg-black/80 border-cyan-500/50 hover:border-cyan-400" : "hover:border-green-400",
            )}
            onClick={() => handleModeSelect("desktop")}
          >
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div
                  className={cn("p-4 rounded-full", isCyberpunk ? "bg-cyan-900/50" : "bg-green-100 dark:bg-green-900")}
                >
                  <Monitor
                    className={cn("h-12 w-12", isCyberpunk ? "text-cyan-400" : "text-green-600 dark:text-green-400")}
                  />
                </div>
              </div>
              <CardTitle
                className={cn("text-2xl font-mono", isCyberpunk ? "text-cyan-400" : "text-gray-900 dark:text-white")}
              >
                Desktop Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Gamepad2 className={cn("h-5 w-5", isCyberpunk ? "text-cyan-500" : "text-green-500")} />
                  <span
                    className={cn("text-sm", isCyberpunk ? "text-cyan-300/70" : "text-gray-600 dark:text-gray-300")}
                  >
                    Keyboard & mouse controls
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Monitor className={cn("h-5 w-5", isCyberpunk ? "text-cyan-500" : "text-green-500")} />
                  <span
                    className={cn("text-sm", isCyberpunk ? "text-cyan-300/70" : "text-gray-600 dark:text-gray-300")}
                  >
                    Full desktop interface
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Gamepad2 className={cn("h-5 w-5", isCyberpunk ? "text-cyan-500" : "text-green-500")} />
                  <span
                    className={cn("text-sm", isCyberpunk ? "text-cyan-300/70" : "text-gray-600 dark:text-gray-300")}
                  >
                    Enhanced gaming features
                  </span>
                </div>
              </div>
              <Button
                className={cn(
                  "w-full mt-6",
                  isCyberpunk
                    ? "bg-cyan-900/50 hover:bg-cyan-800/50 text-cyan-400 border border-cyan-500"
                    : "bg-green-600 hover:bg-green-700 text-white",
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  handleModeSelect("desktop")
                }}
              >
                Choose Desktop
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
