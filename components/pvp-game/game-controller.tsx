"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { GameRenderer } from "./game-renderer"
import { DebugOverlay } from "./debug-overlay"
import { GameEngine, type GameState } from "./game-engine"
import { gameInputHandler } from "../../utils/game-input-handler"
import { AIController } from "../../utils/game-ai"

interface GameControllerProps {
  localPlayerId: string
  onGameEnd?: (winner: string | null) => void
  debugMode?: boolean
}

export default function GameController({ localPlayerId, onGameEnd, debugMode = false }: GameControllerProps) {
  const gameEngineRef = useRef<GameEngine | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const animationFrameRef = useRef<number>()
  const aiControllersRef = useRef<Record<string, AIController>>({})
  const lastUpdateTimeRef = useRef<number>(Date.now())

  // Initialize game engine
  useEffect(() => {
    if (!gameEngineRef.current) {
      gameEngineRef.current = new GameEngine()

      // Add local player
      gameEngineRef.current.addPlayer(localPlayerId, `Player`, false)

      // Add AI players
      const aiPlayerIds = ["ai_1", "ai_2", "ai_3"]
      aiPlayerIds.forEach((aiId, index) => {
        gameEngineRef.current?.addPlayer(aiId, `AI Bot ${index + 1}`, true)

        // Create AI controller
        aiControllersRef.current[aiId] = new AIController(aiId)
      })

      // Set initial game state
      setGameState(gameEngineRef.current.getGameState())
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [localPlayerId])

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameEngineRef.current) return

    const now = Date.now()
    const deltaTime = (now - lastUpdateTimeRef.current) / 1000
    lastUpdateTimeRef.current = now

    const currentState = gameEngineRef.current.getGameState()

    // Update AI controllers
    Object.entries(aiControllersRef.current).forEach(([aiId, controller]) => {
      const aiPlayer = currentState.players[aiId]
      if (aiPlayer && aiPlayer.health > 0) {
        // Update AI with current game state
        controller.update(currentState, deltaTime)

        // Apply AI decisions to player
        const decision = controller.getDecision()
        if (decision) {
          // Apply movement controls
          aiPlayer.controls = {
            up: decision.moveUp,
            down: decision.moveDown,
            left: decision.moveLeft,
            right: decision.moveRight,
            shoot: decision.shoot,
            drawBow: decision.drawBow,
            specialAttack: decision.specialAttack,
          }

          // Apply rotation
          if (decision.targetRotation !== undefined) {
            aiPlayer.rotation = decision.targetRotation
          }

          // Handle bow drawing
          if (decision.drawBow && !aiPlayer.isDrawingBow) {
            gameEngineRef.current.startDrawingBow(aiId)
          } else if (!decision.drawBow && aiPlayer.isDrawingBow) {
            gameEngineRef.current.releaseBow(aiId)
          }

          // Handle shooting
          if (decision.shoot) {
            gameEngineRef.current.shoot(aiId)
          }

          // Handle special attack
          if (decision.specialAttack) {
            gameEngineRef.current.useSpecialAttack(aiId)
          }
        }
      }
    })

    // Update game engine
    gameEngineRef.current.update(deltaTime)

    // Update state
    const newState = gameEngineRef.current.getGameState()
    setGameState(newState)

    // Check for game end
    if (newState.isGameOver && onGameEnd) {
      const alivePlayers = Object.values(newState.players).filter((p) => p.health > 0)
      const winner = alivePlayers.length === 1 ? alivePlayers[0].id : null
      onGameEnd(winner)
      return
    }

    // Continue game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [onGameEnd])

  // Start game loop
  useEffect(() => {
    if (gameEngineRef.current) {
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameLoop])

  // Setup input handlers for local player
  useEffect(() => {
    if (!gameEngineRef.current) return

    const handleMove = (direction: string, pressed: boolean) => {
      const player = gameEngineRef.current.getGameState().players[localPlayerId]
      if (!player) return

      player.controls = player.controls || {}
      switch (direction) {
        case "up":
          player.controls.up = pressed
          break
        case "down":
          player.controls.down = pressed
          break
        case "left":
          player.controls.left = pressed
          break
        case "right":
          player.controls.right = pressed
          break
      }
    }

    const handleAim = (rotation: number) => {
      const player = gameEngineRef.current.getGameState().players[localPlayerId]
      if (player) {
        player.rotation = rotation
      }
    }

    const handleDrawBow = (drawing: boolean) => {
      if (drawing) {
        gameEngineRef.current.startDrawingBow(localPlayerId)
      } else {
        gameEngineRef.current.releaseBow(localPlayerId)
      }
    }

    const handleSpecialAttack = () => {
      gameEngineRef.current.useSpecialAttack(localPlayerId)
    }

    gameInputHandler.setCallbacks({
      onMove: handleMove,
      onAim: handleAim,
      onDrawBow: handleDrawBow,
      onSpecialAttack: handleSpecialAttack,
    })

    return () => {
      gameInputHandler.cleanup()
    }
  }, [localPlayerId])

  // Handle canvas click for debug toggle
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!debugMode) return

      const canvas = event.currentTarget
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      // Check if click is in bottom-right corner (for debug toggle)
      if (x > rect.width - 50 && y > rect.height - 50) {
        setShowDebug(!showDebug)
      }
    },
    [debugMode, showDebug],
  )

  if (!gameState) {
    return <div className="flex items-center justify-center h-64">Loading game...</div>
  }

  return (
    <div className="relative w-full h-full">
      <GameRenderer gameState={gameState} localPlayerId={localPlayerId} onClick={handleCanvasClick} />

      {debugMode && <DebugOverlay gameState={gameState} localPlayerId={localPlayerId} visible={showDebug} />}

      {debugMode && (
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 text-xs rounded z-20"
        >
          Debug: {showDebug ? "ON" : "OFF"}
        </button>
      )}
    </div>
  )
}
