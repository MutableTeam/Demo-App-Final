"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Monitor, Smartphone } from "lucide-react"

interface ModeSelectionProps {
  onSelectMode: (mode: "desktop" | "mobile") => void
}

export default function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  return (
    <div className="w-full h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-black/60 backdrop-blur-md border-2 border-cyber-cyan text-white shadow-lg shadow-cyber-cyan/20">
        <CardHeader className="text-center border-b border-cyber-cyan/50 pb-4">
          <CardTitle className="text-3xl font-bold text-cyber-cyan-light tracking-widest">
            CHOOSE YOUR EXPERIENCE
          </CardTitle>
          <CardDescription className="text-gray-300 font-mono">
            Select how you want to enter the Mutable world.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-6 p-6">
          <Button
            variant="outline"
            onClick={() => onSelectMode("desktop")}
            className="w-full h-32 flex flex-col gap-2 bg-transparent hover:bg-cyber-blue/20 border-2 border-cyber-blue text-white hover:text-cyber-blue-light text-lg font-bold transition-all duration-300"
          >
            <Monitor className="w-10 h-10" />
            <span>Desktop</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => onSelectMode("mobile")}
            className="w-full h-32 flex flex-col gap-2 bg-transparent hover:bg-cyber-magenta/20 border-2 border-cyber-magenta text-white hover:text-cyber-magenta-light text-lg font-bold transition-all duration-300"
          >
            <Smartphone className="w-10 h-10" />
            <span>Mobile</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
