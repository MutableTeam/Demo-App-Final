"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { gameInputHandler, type InputState } from "@/utils/game-input-handler"
import type { GameState } from "@/components/pvp-game/game-engine"
import type { PlatformType } from "@/contexts/platform-context"
import { logger } from "@/utils/logger"

interface UseGameControlsProps {
  playerId: string
  gameStateRef: React.MutableRefObject<GameState>
  platformType: PlatformType
  isEnabled: boolean
}

export function useGameControls({ playerId, gameStateRef, platformType, isEnabled }: UseGameControlsProps) {
  const previousInputRef = useRef<InputState | null>(null)
  const isChargingRef = useRef(false)
  const chargeStartTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isEnabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (platformType !== "desktop") return

      const player = gameStateRef.current.players[playerId]
      if (!player) return

      const controls = { ...player.controls }

      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          controls.up = true
          break
        case "s":
        case "arrowdown":
          controls.down = true
          break
        case "a":
        case "arrowleft":
          controls.left = true
          break
        case "d":
        case "arrowright":
          controls.right = true
          break
        case " ":
          controls.dash = true
          break
        case "shift":
          controls.special = true
          break
        case "e":
          controls.explosiveArrow = true
          break
      }

      player.controls = controls
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (platformType !== "desktop") return

      const player = gameStateRef.current.players[playerId]
      if (!player) return

      const controls = { ...player.controls }

      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          controls.up = false
          break
        case "s":
        case "arrowdown":
          controls.down = false
          break
        case "a":
        case "arrowleft":
          controls.left = false
          break
        case "d":
        case "arrowright":
          controls.right = false
          break
        case " ":
          controls.dash = false
          break
        case "shift":
          controls.special = false
          break
        case "e":
          controls.explosiveArrow = false
          break
      }

      player.controls = controls
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (platformType !== "desktop" || e.button !== 0) return

      const player = gameStateRef.current.players[playerId]
      if (!player) return

      if (!player.isDrawingBow) {
        player.isDrawingBow = true
        player.drawStartTime = Date.now() / 1000
        logger.info("GAME_CONTROLS", "Started drawing bow (mouse down)")
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (platformType !== "desktop" || e.button !== 0) return

      const player = gameStateRef.current.players[playerId]
      if (!player) return

      if (player.isDrawingBow) {
        player.controls.shoot = true
        player.isDrawingBow = false
        logger.info("GAME_CONTROLS", "Released bow (mouse up)")
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (platformType !== "desktop") return

      const player = gameStateRef.current.players[playerId]
      if (!player) return

      const canvas = document.querySelector("canvas")
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const playerScreenX = player.position.x
      const playerScreenY = player.position.y

      const angle = Math.atan2(mouseY - playerScreenY, mouseX - playerScreenX)
      player.rotation = angle
    }

    const handleInputChange = (inputState: InputState) => {
      if (platformType !== "mobile") return

      const player = gameStateRef.current.players[playerId]
      if (!player) return

      const previous = previousInputRef.current

      // Handle movement
      const controls = { ...player.controls }
      const threshold = 0.3

      if (inputState.movement.isActive && inputState.movement.distance > threshold) {
        controls.up = inputState.movement.y > threshold
        controls.down = inputState.movement.y < -threshold
        controls.left = inputState.movement.x < -threshold
        controls.right = inputState.movement.x > threshold
      } else {
        controls.up = false
        controls.down = false
        controls.left = false
        controls.right = false
      }

      // Handle aiming and shooting
      const aimThreshold = 0.2
      const wasAiming = previous?.aiming.isActive && previous.aiming.distance > aimThreshold
      const isAiming = inputState.aiming.isActive && inputState.aiming.distance > aimThreshold

      // Start charging when joystick is first pulled
      if (!wasAiming && isAiming && !isChargingRef.current) {
        isChargingRef.current = true
        chargeStartTimeRef.current = Date.now() / 1000
        player.isDrawingBow = true
        player.drawStartTime = chargeStartTimeRef.current
        logger.info("GAME_CONTROLS", `Charge started at ${chargeStartTimeRef.current}`)
      }

      // Update aiming direction while charging
      if (isAiming && isChargingRef.current) {
        player.rotation = inputState.aiming.angle
      }

      // Fire when joystick is released
      if (wasAiming && !isAiming && isChargingRef.current) {
        controls.shoot = true
        player.isDrawingBow = false
        isChargingRef.current = false
        chargeStartTimeRef.current = null
        logger.info("GAME_CONTROLS", "Shoot command sent to game engine.")
      }

      // Handle action buttons
      controls.dash = inputState.actionButtons.dash
      controls.special = inputState.actionButtons.special
      controls.explosiveArrow = inputState.actionButtons.explosiveArrow

      player.controls = controls
      previousInputRef.current = inputState
    }

    // Set up event listeners
    if (platformType === "desktop") {
      window.addEventListener("keydown", handleKeyDown)
      window.addEventListener("keyup", handleKeyUp)
      window.addEventListener("mousedown", handleMouseDown)
      window.addEventListener("mouseup", handleMouseUp)
      window.addEventListener("mousemove", handleMouseMove)
    } else {
      const unsubscribe = gameInputHandler.subscribe(handleInputChange)
      return unsubscribe
    }

    return () => {
      if (platformType === "desktop") {
        window.removeEventListener("keydown", handleKeyDown)
        window.removeEventListener("keyup", handleKeyUp)
        window.removeEventListener("mousedown", handleMouseDown)
        window.removeEventListener("mouseup", handleMouseUp)
        window.removeEventListener("mousemove", handleMouseMove)
      }
    }
  }, [playerId, platformType, isEnabled])
}
