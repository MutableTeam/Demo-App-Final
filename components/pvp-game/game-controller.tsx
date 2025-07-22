"use client"

import { useEffect, useRef, useState } from "react"
import { createInitialGameState, createPlayer, updateGameState, type GameState } from "./game-engine"
import GameRenderer from "./game-renderer"
import { createAIController } from "@/utils/game-ai"
import { gameInputHandler, setupGameInputHandlers, type GameInputState } from "@/utils/game-input-handler"
import { usePlatform } from "@/contexts/platform-context"

interface GameControllerProps {
  playerId: string
  playerName: string
  isHost: boolean
  gameMode?: string
  onGameEnd?: (winner: string | null) => void
}

export default function GameController({
  playerId,
  playerName,
  isHost,
  gameMode = "duel",
  onGameEnd,
}: GameControllerProps) {
  const { platformType } = usePlatform()
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState())
  const gameStateRef = useRef<GameState>(gameState)
  const lastUpdateTimeRef = useRef<number>(Date.now())
  const requestAnimationFrameIdRef = useRef<number | null>(null)
  const gameInitializedRef = useRef<boolean>(false)
  const aiControllersRef = useRef<Record<string, ReturnType<typeof createAIController>>>({})
  const componentIdRef = useRef<string>(`game-controller-${Date.now()}`)

  // Initialize game
  useEffect(() => {
    if (gameInitializedRef.current) return
    gameInitializedRef.current = true

    const playerColors = ["#FF5252", "#4CAF50", "#2196F3", "#FFC107"]
    const playerPositions = [
      { x: 100, y: 100 },
      { x: 700, y: 500 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
    ]

    const currentState = createInitialGameState()

    // Add human player
    currentState.players[playerId] = createPlayer(playerId, playerName, playerPositions[0], playerColors[0])
    console.log(`Created player with ID: ${playerId}, name: ${playerName}`)

    // Add AI players
    const aiCount = gameMode === "ffa" || gameMode === "timed" ? 3 : 1
    for (let i = 1; i <= aiCount; i++) {
      const aiId = `ai-${i}`
      currentState.players[aiId] = createPlayer(aiId, `AI ${i}`, playerPositions[i], playerColors[i])
      aiControllersRef.current[aiId] = createAIController()
      console.log(`Created AI player ${aiId}`)
    }

    setGameState(currentState)
    gameStateRef.current = currentState

    // Start game loop
    const gameLoop = () => {
      const now = Date.now()
      const deltaTime = Math.min((now - lastUpdateTimeRef.current) / 1000, 0.1)
      lastUpdateTimeRef.current = now

      // Update AI controllers
      Object.keys(aiControllersRef.current).forEach((aiId) => {
        if (gameStateRef.current.players[aiId]) {
          const aiController = aiControllersRef.current[aiId]
          const { controls, targetRotation } = aiController.update(aiId, gameStateRef.current, deltaTime)
          gameStateRef.current.players[aiId].controls = controls
          gameStateRef.current.players[aiId].rotation = targetRotation
        }
      })

      // Update game state
      const newState = updateGameState(gameStateRef.current, deltaTime)
      gameStateRef.current = newState
      setGameState(newState)

      // Check for game end
      if (newState.isGameOver) {
        if (onGameEnd) onGameEnd(newState.winner)
        return
      }

      requestAnimationFrameIdRef.current = requestAnimationFrame(gameLoop)
    }

    requestAnimationFrameIdRef.current = requestAnimationFrame(gameLoop)

    // Setup input handlers
    let cleanupInputHandlers: (() => void) | null = null

    if (platformType === "desktop") {
      console.log("[InputDebug] Initializing DESKTOP controls.")
      cleanupInputHandlers = setupGameInputHandlers({
        playerId,
        gameStateRef,
        componentIdRef,
      })
    } else {
      console.log("[InputDebug] Initializing MOBILE controls.")
      const handleMobileInput = (inputState: GameInputState) => {
        const player = gameStateRef.current.players[playerId]
        if (!player) return

        player.controls = {
          ...player.controls,
          ...inputState.movement,
          ...inputState.actions,
        }

        if (inputState.aiming.active) {
          player.rotation = inputState.aiming.angle
        }
      }

      gameInputHandler.setCallbacks({
        onStateChange: handleMobileInput,
      })
      cleanupInputHandlers = () => gameInputHandler.destroy()
    }

    return () => {
      if (requestAnimationFrameIdRef.current) {
        cancelAnimationFrame(requestAnimationFrameIdRef.current)
      }
      if (cleanupInputHandlers) {
        console.log("[InputDebug] Cleaning up input handlers.")
        cleanupInputHandlers()
      }
      console.log("Game cleanup completed")
    }
  }, [playerId, playerName, isHost, gameMode, onGameEnd, platformType])

  if (!gameInitializedRef.current) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-800">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl font-bold">Loading Game...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <GameRenderer gameState={gameState} localPlayerId={playerId} />
      <div className="absolute bottom-2 right-2 text-xs text-white/70 bg-black/20 backdrop-blur-sm px-2 py-1 rounded">
        Press M to toggle sound
      </div>
    </div>
  )
}
