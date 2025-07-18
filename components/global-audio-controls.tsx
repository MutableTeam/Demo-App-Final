"use client"

import { useState, useEffect } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function GlobalAudioControls() {
  const [isMuted, setIsMuted] = useState(true) // Default to muted
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load audio preference from localStorage
    const savedMute = localStorage.getItem("audio-muted")
    const muted = savedMute !== "false" // Default to true if not set
    setIsMuted(muted)
    setIsLoaded(true)
  }, [])

  const toggleAudio = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    localStorage.setItem("audio-muted", newMuted.toString())

    // Dispatch custom event for other components to listen to
    window.dispatchEvent(
      new CustomEvent("audioToggle", {
        detail: { muted: newMuted },
      }),
    )
  }

  if (!isLoaded) {
    return null // Prevent hydration mismatch
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleAudio}
      className={cn(
        "h-8 w-8 bg-black/70 backdrop-blur-sm hover:bg-black/80 transition-all duration-300",
        "border border-white/20 hover:border-white/40",
        "shadow-lg hover:shadow-xl hover:scale-105",
        !isMuted && "bg-green-600/80 border-green-400/60",
      )}
      aria-label={isMuted ? "Unmute audio" : "Mute audio"}
      title={isMuted ? "Unmute audio" : "Mute audio"}
    >
      {isMuted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
    </Button>
  )
}
