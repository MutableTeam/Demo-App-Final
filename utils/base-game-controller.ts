"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { debugManager } from "./debug-utils"
import { audioManager } from "./audio-manager"

export function useBaseGameController({ playerId, playerName, isHost, gameMode, initialGameState, onGameEnd }) {
  const [gameState, setGameState] = useState(initialGameState)
  const [showDebug, setShowDebug] = useState(false)
  const [showResourceMonitor, setShowResourceMonitor] = useState(false)

  // Refs for game state and timing
  const gameStateRef = useRef(initialGameState)
  const lastUpdateTimeRef = useRef(Date.now())
  const requestAnimationFrameIdRef = useRef(null)
  const audioInitializedRef = useRef(false)
  const gameInitializedRef = useRef(false)
  const componentIdRef = useRef(`game-${uuidv4().slice(0, 8)}`)

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F3 key for debug overlay
      if (e.key === "F3") {
        e.preventDefault()
        setShowDebug((prev) => !prev)
      }

      // F8 key for game debug
      if (e.key === "F8") {
        e.preventDefault()
        debugManager.toggleDebug()
      }

      // F11 key for resource monitor
      if (e.key === "F11") {
        e.preventDefault()
        setShowResourceMonitor((prev) => !prev)
      }

      // M key for mute/unmute
      if (e.key === "m" || e.key === "M") {
        e.preventDefault()
        audioManager.toggleMute()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Clean up game resources
  const cleanupGame = useCallback(() => {
    if (requestAnimationFrameIdRef.current !== null) {
      cancelAnimationFrame(requestAnimationFrameIdRef.current)
      requestAnimationFrameIdRef.current = null
    }

    // Stop background music
    try {
      audioManager.stopBackgroundMusic()
    } catch (err) {
      console.error("Error stopping background music:", err)
    }
  }, [])

  // Start background music
  const startBackgroundMusic = useCallback(() => {
    try {
      audioManager.startBackgroundMusic()
    } catch (err) {
      console.error("Error starting background music:", err)
    }
  }, [])

  // Handle game end
  const handleGameEnd = useCallback(
    (winner) => {
      cleanupGame()
      if (onGameEnd) {
        onGameEnd(winner)
      }
    },
    [cleanupGame, onGameEnd],
  )

  return {
    gameState,
    setGameState,
    gameStateRef,
    lastUpdateTimeRef,
    requestAnimationFrameIdRef,
    audioInitializedRef,
    gameInitializedRef,
    showDebug,
    setShowDebug,
    showResourceMonitor,
    setShowResourceMonitor,
    componentIdRef,
    cleanupGame,
    startBackgroundMusic,
    handleGameEnd,
  }
}
