"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"
import { audioManager, initializeAudio, loadAudioFiles } from "@/utils/audio-manager"

export default function AudioToggleButton() {
  const [isMuted, setIsMuted] = useState(true)
  const [isAudioInitialized, setIsAudioInitialized] = useState(false)

  useEffect(() => {
    // Check initial mute state
    setIsMuted(audioManager.isSoundMuted())
  }, [])

  const handleToggleAudio = async () => {
    // Initialize audio on first interaction if not already initialized
    if (!isAudioInitialized) {
      try {
        await initializeAudio()
        setIsAudioInitialized(true)

        // Only load audio files when unmuting for the first time
        if (!isMuted) {
          await loadAudioFiles()
        }
      } catch (error) {
        console.error("Failed to initialize audio:", error)
      }
    } else if (!isMuted && !audioManager.isSoundMuted()) {
      // If we're unmuting and audio is not already loaded, load it now
      await loadAudioFiles()
    }

    // Toggle mute state
    const newMuteState = audioManager.toggleMute()
    setIsMuted(newMuteState)

    // Resume audio context if unmuting
    if (!newMuteState) {
      audioManager.resumeAudioContext()
    }
  }

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleToggleAudio}>
      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </Button>
  )
}
