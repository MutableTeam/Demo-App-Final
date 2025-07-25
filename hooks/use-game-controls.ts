"use client"

import type React from "react"

import { useEffect, useCallback } from "react"
import { gameInputHandler, type GameInputState } from "@/utils/game-input-handler"
import type { LastStandGameState } from "@/games/last-stand/game-state"
import type { GameState as PvpGameState } from "@/components/pvp-game/game-engine"

type CombinedGameState = LastStandGameState | PvpGameState

interface UseGameControlsProps {
  playerId: string
  gameStateRef: React.MutableRefObject<CombinedGameState>
  platformType: "desktop" | "mobile"
  isEnabled: boolean
}

export function useGameControls({ playerId, gameStateRef, platformType, isEnabled }: UseGameControlsProps) {
  const getPlayer = useCallback(() => {
    const state = gameStateRef.current
    if (!state) return null

    // Handle different state structures
    if ("players" in state && state.players && typeof state.players === "object") {
      // This covers PvP GameState and the adapted LastStandGameState
      return (state.players as any)[playerId] || (state.players as any)["player"]
    }
    // Fallback for original LastStandGameState structure
    if ("player" in state && (state as any).player.id === playerId) {
      return (state as any).player
    }

    return null
  }, [gameStateRef, playerId])

  // --- DESKTOP CONTROLS ---
  useEffect(() => {
    if (platformType !== "desktop" || !isEnabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const player = getPlayer()
      if (!player || !player.controls) return
      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          player.controls.up = true
          break
        case "s":
        case "arrowdown":
          player.controls.down = true
          break
        case "a":
        case "arrowleft":
          player.controls.left = true
          break
        case "d":
        case "arrowright":
          player.controls.right = true
          break
        case "shift":
          player.controls.dash = true
          break
        case "e":
          player.controls.explosiveArrow = true
          break
        case "q":
        case "contextmenu": // Allow Q as an alternative for special
          player.controls.special = true
          break
        case " ": // Space for shoot
          player.controls.shoot = true
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const player = getPlayer()
      if (!player || !player.controls) return
      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          player.controls.up = false
          break
        case "s":
        case "arrowdown":
          player.controls.down = false
          break
        case "a":
        case "arrowleft":
          player.controls.left = false
          break
        case "d":
        case "arrowright":
          player.controls.right = false
          break
        case "shift":
          player.controls.dash = false
          break
        case "e":
          player.controls.explosiveArrow = false
          break
        case "q":
          player.controls.special = false
          break
        case " ":
          player.controls.shoot = false
          break
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const player = getPlayer()
      // Use a more robust selector if multiple canvases can exist
      const canvas = document.querySelector("canvas")
      if (!player || !canvas) return

      const rect = canvas.getBoundingClientRect()
      // Scale mouse coordinates to match canvas resolution
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const mouseX = (e.clientX - rect.left) * scaleX
      const mouseY = (e.clientY - rect.top) * scaleY

      player.rotation = Math.atan2(mouseY - player.position.y, mouseX - player.position.x)
    }

    const handleMouseDown = (e: MouseEvent) => {
      const player = getPlayer()
      if (!player || !player.controls) return
      if (e.button === 0) player.controls.shoot = true // Left click
      if (e.button === 2) player.controls.special = true // Right click
    }

    const handleMouseUp = (e: MouseEvent) => {
      const player = getPlayer()
      if (!player || !player.controls) return
      if (e.button === 0) player.controls.shoot = false
      if (e.button === 2) player.controls.special = false
    }

    const handleContextMenu = (e: MouseEvent) => e.preventDefault()

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("contextmenu", handleContextMenu)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [platformType, isEnabled, getPlayer])

  // --- MOBILE CONTROLS ---
  useEffect(() => {
    if (platformType !== "mobile" || !isEnabled) return

    const handleMobileInput = (inputState: GameInputState) => {
      const player = getPlayer()
      if (!player || !player.controls) return

      // Update player controls from the input state
      player.controls = {
        ...player.controls,
        ...inputState.movement,
        ...inputState.actions,
      }

      // Update rotation if aiming is active
      if (inputState.aiming.active) {
        player.rotation = inputState.aiming.angle
      }
    }

    gameInputHandler.setCallbacks({
      onStateChange: handleMobileInput,
    })

    return () => {
      // Clear callbacks when component unmounts or is disabled
      gameInputHandler.setCallbacks({})
    }
  }, [platformType, isEnabled, getPlayer])
}
