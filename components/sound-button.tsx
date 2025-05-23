"use client"

import type React from "react"

import { forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { playRandomCoinSound, audioManager } from "@/utils/audio-manager"
import type { ButtonProps } from "@/components/ui/button"

// Extend the Button component to add sound functionality
const SoundButton = forwardRef<HTMLButtonElement, ButtonProps>(({ onClick, children, ...props }, ref) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Only try to play sound if audio is initialized and not muted
    if (!audioManager.isSoundMuted()) {
      playRandomCoinSound()
    }

    // Call the original onClick handler if provided
    if (onClick) {
      onClick(event)
    }
  }

  return (
    <Button ref={ref} onClick={handleClick} {...props}>
      {children}
    </Button>
  )
})

SoundButton.displayName = "SoundButton"

export default SoundButton
