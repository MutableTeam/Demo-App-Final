"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Volume2, VolumeX, Music } from "lucide-react"
import { Slider } from "@/components/ui/slider"

export function GlobalAudioControls() {
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState([75])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Load saved audio preferences
    const savedMuted = localStorage.getItem("mutable-audio-muted")
    const savedVolume = localStorage.getItem("mutable-audio-volume")

    if (savedMuted) {
      setIsMuted(JSON.parse(savedMuted))
    }
    if (savedVolume) {
      setVolume([Number.parseInt(savedVolume)])
    }
  }, [])

  const toggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    localStorage.setItem("mutable-audio-muted", JSON.stringify(newMuted))
  }

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume)
    localStorage.setItem("mutable-audio-volume", newVolume[0].toString())

    // If volume is set above 0, unmute
    if (newVolume[0] > 0 && isMuted) {
      setIsMuted(false)
      localStorage.setItem("mutable-audio-muted", "false")
    }
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm">
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleMute} className="h-8 w-8 p-0 hover:bg-gray-100">
              {isMuted ? <VolumeX className="h-4 w-4 text-gray-600" /> : <Volume2 className="h-4 w-4 text-gray-600" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <Music className="h-4 w-4 text-gray-600" />
            </Button>

            {isExpanded && (
              <div className="flex items-center gap-2 ml-2">
                <Slider value={volume} onValueChange={handleVolumeChange} max={100} step={1} className="w-20" />
                <span className="text-xs text-gray-600 min-w-[2rem]">{volume[0]}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GlobalAudioControls
