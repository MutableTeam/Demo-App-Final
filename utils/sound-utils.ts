import type React from "react"
import { audioManager, playRandomCoinSound } from "./audio-manager"

/**
 * Adds a click sound to any element's onClick handler
 * @param callback The original onClick handler
 * @returns A new onClick handler that plays a sound before executing the original callback
 */
export function withClickSound<T>(callback?: (event: React.MouseEvent<T>) => void) {
  return (event: React.MouseEvent<T>) => {
    if (!audioManager.isSoundMuted()) {
      playRandomCoinSound()
    }

    if (callback) {
      callback(event)
    }
  }
}
