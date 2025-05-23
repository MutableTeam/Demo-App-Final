"use client"

import { useEffect, useRef, useState } from "react"
import type { GameState } from "./game-engine"
import { archerPixiRenderer } from "@/utils/rendering/pixi-renderer-setup"

// Import filters from pixi-filters
import "@pixi/filter-glow"

interface GameRendererEnhancedProps {
  gameState: GameState
  localPlayerId: string
}

export default function GameRendererEnhanced({ gameState, localPlayerId }: GameRendererEnhancedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererInitializedRef = useRef<boolean>(false)
  const [debugMode, setDebugMode] = useState<boolean>(false)

  // Initialize Pixi.js renderer
  useEffect(() => {
    const initializeRenderer = async () => {
      if (!canvasRef.current || rendererInitializedRef.current) return

      try {
        // Initialize the Pixi renderer with the canvas
        await archerPixiRenderer.initialize(canvasRef.current, gameState.arenaSize.width, gameState.arenaSize.height)

        rendererInitializedRef.current = true
        console.log("Pixi.js renderer initialized successfully")
      } catch (error) {
        console.error("Failed to initialize Pixi.js renderer:", error)
      }
    }

    initializeRenderer()

    // Clean up on unmount
    return () => {
      if (rendererInitializedRef.current) {
        archerPixiRenderer.destroy()
        rendererInitializedRef.current = false
      }
    }
  }, [gameState.arenaSize.width, gameState.arenaSize.height])

  // Update renderer with game state
  useEffect(() => {
    if (!rendererInitializedRef.current) return

    // Render the current game state
    archerPixiRenderer.render(gameState, localPlayerId)
  }, [gameState, localPlayerId])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !rendererInitializedRef.current) return

      // Get the container dimensions
      const container = canvasRef.current.parentElement
      if (!container) return

      // Calculate the scale to fit the canvas in the container
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      // Maintain aspect ratio
      const gameAspect = gameState.arenaSize.width / gameState.arenaSize.height
      const containerAspect = containerWidth / containerHeight

      let width, height

      if (containerAspect > gameAspect) {
        // Container is wider than game
        height = containerHeight
        width = height * gameAspect
      } else {
        // Container is taller than game
        width = containerWidth
        height = width / gameAspect
      }

      // Update canvas style
      canvasRef.current.style.width = `${width}px`
      canvasRef.current.style.height = `${height}px`
    }

    // Initial sizing
    handleResize()

    // Add resize listener
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => window.removeEventListener("resize", handleResize)
  }, [gameState.arenaSize.width, gameState.arenaSize.height])

  // Toggle debug mode
  const handleCanvasClick = (e: any) => {
    setDebugMode(!debugMode)
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      style={{ width: "100%", height: "100%", backgroundColor: "black" }}
    />
  )
}
