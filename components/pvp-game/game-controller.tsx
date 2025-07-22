"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { GameRenderer } from "./game-renderer"
import { CountdownTimer } from "./countdown-timer"
import { GameInstructions } from "./game-instructions"
import { MatchmakingLobby } from "./matchmaking-lobby"
import { WaitingRoom } from "./waiting-room"
import { GameDiagnostics } from "./game-diagnostics"
import { DebugOverlay } from "./debug-overlay"
import { useGameControls } from "@/hooks/use-game-controls"
import { usePlatform } from "@/contexts/platform-context"
import { createInitialGameState, createPlayer, updateGameState, playerColors, type GameState } from "./game-engine"
import { createAIController, AIDifficulty } from "@/utils/game-ai"

interface GameControllerProps {
  onGameEnd?: (winner: string | null) => void
}

interface AIController {
  personality: any
  state: any
  update: (playerId: string, gameState: GameState, deltaTime: number) => { controls: any; targetRotation: number }
}

export default function GameController({ onGameEnd }: GameControllerProps) {
  const { platformType } = usePlatform()
  const [gameState, setGameState] = useState<GameState>(createInitialGameState())
  const [gamePhase, setGamePhase] = useState<"lobby" | "waiting" | "countdown" | "playing" | "ended">("lobby")
  const [localPlayerId, setLocalPlayerId] = useState<string>("")
  const [showInstructions, setShowInstructions] = useState(false)
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [showDebugOverlay, setShowDebugOverlay] = useState(false)

  const gameStateRef = useRef<GameState>(gameState)
  const lastUpdateTimeRef = useRef<number>(Date.now())
  const gameLoopRef = useRef<number | null>(null)
  const aiControllersRef = useRef<Record<string, AIController>>({})

  // Update the ref whenever gameState changes
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  // Initialize game controls
  useGameControls({
    playerId: localPlayerId,
    gameStateRef,
    platformType,
    isEnabled: gamePhase === "playing" && localPlayerId !== "",
  })

  // Create AI players and controllers
  const createAIPlayers = useCallback((playerName: string) => {
    const newGameState = createInitialGameState()

    // Add human player
    const humanPlayerId = `player-${Date.now()}`
    const humanPlayer = createPlayer(humanPlayerId, playerName, { x: 100, y: 100 }, playerColors[0])
    newGameState.players[humanPlayerId] = humanPlayer
    setLocalPlayerId(humanPlayerId)

    // Add AI players
    const aiPlayerConfigs = [
      { name: "AI Hunter", difficulty: AIDifficulty.MEDIUM, position: { x: 700, y: 100 } },
      { name: "AI Sniper", difficulty: AIDifficulty.HARD, position: { x: 700, y: 500 } },
      { name: "AI Warrior", difficulty: AIDifficulty.MEDIUM, position: { x: 100, y: 500 } },
    ]

    aiPlayerConfigs.forEach((config, index) => {
      const aiPlayerId = `ai-${Date.now()}-${index}`
      const aiPlayer = createPlayer(aiPlayerId, config.name, config.position, playerColors[index + 1])

      // Ensure AI player has all required properties
      aiPlayer.controls = {
        up: false,
        down: false,
        left: false,
        right: false,
        shoot: false,
        dash: false,
        special: false,
        explosiveArrow: false,
      }

      newGameState.players[aiPlayerId] = aiPlayer

      // Create AI controller
      const aiController = createAIController(config.difficulty)
      aiControllersRef.current[aiPlayerId] = aiController

      console.log(`Created AI player: ${config.name} (${aiPlayerId}) at position:`, config.position)
    })

    return newGameState
  }, [])

  // Handle player joining
  const handlePlayerJoin = useCallback(
    (playerName: string) => {
      console.log("Player joining:", playerName)
      const newGameState = createAIPlayers(playerName)
      setGameState(newGameState)
      setGamePhase("waiting")
    },
    [createAIPlayers],
  )

  // Start countdown
  const handleStartGame = useCallback(() => {
    console.log("Starting game countdown")
    setGamePhase("countdown")
  }, [])

  // Handle countdown complete
  const handleCountdownComplete = useCallback(() => {
    console.log("Countdown complete, starting game")
    setGamePhase("playing")
    startGameLoop()
  }, [])

  // Game loop
  const startGameLoop = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
    }

    const gameLoop = () => {
      const now = Date.now()
      const deltaTime = (now - lastUpdateTimeRef.current) / 1000
      lastUpdateTimeRef.current = now

      // Update AI controllers
      const currentGameState = gameStateRef.current
      Object.keys(aiControllersRef.current).forEach((aiPlayerId) => {
        const aiController = aiControllersRef.current[aiPlayerId]
        const aiPlayer = currentGameState.players[aiPlayerId]

        if (aiController && aiPlayer && aiPlayer.health > 0 && aiPlayer.lives > 0) {
          try {
            // Get AI decision
            const aiDecision = aiController.update(aiPlayerId, currentGameState, deltaTime)

            // Apply AI controls to player
            aiPlayer.controls = { ...aiDecision.controls }
            aiPlayer.rotation = aiDecision.targetRotation

            // Debug logging for AI behavior
            if (Math.random() < 0.01) {
              // Log occasionally to avoid spam
              console.log(
                `AI ${aiPlayerId} controls:`,
                aiDecision.controls,
                `rotation: ${aiDecision.targetRotation.toFixed(2)}`,
              )
            }
          } catch (error) {
            console.error(`Error updating AI ${aiPlayerId}:`, error)
          }
        }
      })

      // Update game state
      try {
        const updatedGameState = updateGameState(currentGameState, deltaTime, (playerId) => {
          console.log(`Player ${playerId} died`)
        })

        // Check for game over
        if (updatedGameState.isGameOver && gamePhase === "playing") {
          setGamePhase("ended")
          if (onGameEnd) {
            onGameEnd(updatedGameState.winner)
          }
          if (gameLoopRef.current) {
            cancelAnimationFrame(gameLoopRef.current)
            gameLoopRef.current = null
          }
          return
        }

        setGameState(updatedGameState)
        gameStateRef.current = updatedGameState
      } catch (error) {
        console.error("Error updating game state:", error)
      }

      // Continue game loop
      if (gamePhase === "playing") {
        gameLoopRef.current = requestAnimationFrame(gameLoop)
      }
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [gamePhase, onGameEnd])

  // Cleanup game loop on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [])

  // Handle game restart
  const handleRestart = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
      gameLoopRef.current = null
    }

    // Clear AI controllers
    aiControllersRef.current = {}

    setGameState(createInitialGameState())
    setGamePhase("lobby")
    setLocalPlayerId("")
    setShowInstructions(false)
    setShowDiagnostics(false)
    setShowDebugOverlay(false)
  }, [])

  // Debug functions
  const toggleInstructions = () => setShowInstructions(!showInstructions)
  const toggleDiagnostics = () => setShowDiagnostics(!showDiagnostics)
  const toggleDebugOverlay = () => setShowDebugOverlay(!showDebugOverlay)

  // Render based on game phase
  if (gamePhase === "lobby") {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <MatchmakingLobby onPlayerJoin={handlePlayerJoin} />
      </div>
    )
  }

  if (gamePhase === "waiting") {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <WaitingRoom
          players={Object.values(gameState.players)}
          onStartGame={handleStartGame}
          onShowInstructions={toggleInstructions}
        />
      </div>
    )
  }

  if (gamePhase === "countdown") {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <CountdownTimer onComplete={handleCountdownComplete} />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Game Renderer */}
      <GameRenderer gameState={gameState} localPlayerId={localPlayerId} />

      {/* Instructions Overlay */}
      {showInstructions && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <GameInstructions onClose={toggleInstructions} />
        </div>
      )}

      {/* Diagnostics Overlay */}
      {showDiagnostics && (
        <div className="absolute top-4 left-4 z-40">
          <GameDiagnostics gameState={gameState} />
        </div>
      )}

      {/* Debug Overlay */}
      {showDebugOverlay && (
        <div className="absolute top-4 right-4 z-40">
          <DebugOverlay gameState={gameState} localPlayerId={localPlayerId} aiControllers={aiControllersRef.current} />
        </div>
      )}

      {/* Game Over Screen */}
      {gamePhase === "ended" && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            {gameState.winner && (
              <p className="text-lg mb-4">Winner: {gameState.players[gameState.winner]?.name || "Unknown"}</p>
            )}
            <button onClick={handleRestart} className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Debug Controls */}
      <div className="absolute bottom-4 left-4 z-30 space-x-2">
        <button
          onClick={toggleInstructions}
          className="px-3 py-1 bg-gray-800 text-white text-sm rounded opacity-75 hover:opacity-100"
        >
          Instructions
        </button>
        <button
          onClick={toggleDiagnostics}
          className="px-3 py-1 bg-gray-800 text-white text-sm rounded opacity-75 hover:opacity-100"
        >
          Diagnostics
        </button>
        <button
          onClick={toggleDebugOverlay}
          className="px-3 py-1 bg-gray-800 text-white text-sm rounded opacity-75 hover:opacity-100"
        >
          Debug
        </button>
      </div>
    </div>
  )
}
