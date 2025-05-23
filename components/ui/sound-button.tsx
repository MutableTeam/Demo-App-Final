"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { audioManager, playRandomCoinSound } from "@/utils/audio-manager"
import type { ButtonProps } from "@/components/ui/button"

const SoundButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ onClick, children, ...props }, ref) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Only play sound if audio is not muted
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
