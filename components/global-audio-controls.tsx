"use client"

import { useEffect, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { audioManager, initializeAudio, playRandomCoinSound } from "@/utils/audio-manager"

export default function GlobalAudioControls() {
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  useEffect(() => {
    // Initialize audio system
    const init = async () => {
      await initializeAudio()
      setIsInitialized(true)
      // Check if audio was previously muted
      setIsMuted(audioManager.isSoundMuted())
    }

    init()
  }, [])

  const handleToggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)

    // Use the correct method from AudioManager
    audioManager.setMuted(newMuted)

    if (!newMuted) {
      audioManager.resumeAudioContext()
      // Play a sound when unmuting to provide immediate feedback
      playRandomCoinSound()
    }
  }

  return (
    <div className="fixed top-14 right-2 z-50">
      <button
        onClick={handleToggleMute}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-black/70 backdrop-blur-sm hover:bg-black/80 transition-colors"
        aria-label={isMuted ? "Unmute" : "Mute"}
        disabled={!isInitialized}
      >
        {isMuted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
      </button>
    </div>
  )
}
