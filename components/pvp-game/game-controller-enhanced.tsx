"use client"

import { useState, useEffect, useRef } from "react"
import EnhancedGameRenderer from "./enhanced-game-renderer"
import { useGameInputHandler } from "@/utils/game-input-handler"
import type { GameState } from "@/games/last-stand/game-state"
import { GameEngine } from "@/games/last-stand/game-engine"
import { Button } from "@/components/ui/button"
import { Pause, Play, Volume2, VolumeX } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

interface GameControllerEnhancedProps {
  gameId: string
  playerId: string
  playerName: string
  isHost: boolean
  gameMode: "pvp" | "pve"
  onGameEnd: (winner: string | null) => void
  platformType: "desktop" | "mobile"
  joystickInput?: { x: number; y: number }
  actionInput?: { action: string; pressed: boolean } | null
}

export default function GameControllerEnhanced({
  gameId,
  playerId,
  playerName,
  isHost,
  gameMode,
  onGameEnd,
  platformType,
  joystickInput,
  actionInput,
}: GameControllerEnhancedProps) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const gameEngineRef = useRef<GameEngine | null>(null)

  const { handleJoystickMove, handleAbility, cleanup } = useGameInputHandler({
    gameEngine: gameEngineRef.current,
    playerId,
    isMobile: platformType === "mobile",
  })

  useEffect(() => {
    const engine = new GameEngine(
      (newState) => {
        setGameState(newState)
        if (newState.gameOver) {
          setGameOver(true)
          setWinner(newState.winner)
          setTimeout(() => onGameEnd(newState.winner), 3000)
        }
      },
      {
        gameId,
        playerId,
        playerName,
        isHost,
        gameMode,
        platformType,
      },
    )
    gameEngineRef.current = engine
    engine.start()

    return () => {
      engine.stop()
      cleanup()
    }
  }, [gameId, playerId, playerName, isHost, gameMode, onGameEnd, platformType, cleanup])

  // Handle joystick input from props
  useEffect(() => {
    if (platformType === "mobile" && joystickInput && gameEngineRef.current) {
      handleJoystickMove(joystickInput)
    }
  }, [joystickInput, platformType, handleJoystickMove])

  // Handle action button input from props
  useEffect(() => {
    if (platformType === "mobile" && actionInput && gameEngineRef.current) {
      const { action, pressed } = actionInput
      if (pressed) {
        switch (action) {
          case "actionA": // Main attack
            handleAbility("basic_attack")
            break
          case "actionB": // Dash
            handleAbility("dash")
            break
          case "actionX": // Explosive arrow
            handleAbility("explosive_arrow")
            break
          case "actionY": // Not mapped yet, could be for a future ability
            break
        }
      }
    }
  }, [actionInput, platformType, handleAbility])

  const togglePause = () => {
    setIsPaused(!isPaused)
    if (isPaused) {
      gameEngineRef.current?.resume()
    } else {
      gameEngineRef.current?.pause()
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    // Add logic to mute/unmute game sounds via gameEngineRef
  }

  if (!gameState) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <p className="text-white text-xl">Loading Game...</p>
      </div>
    )
  }

  const { players, enemies, projectiles, powerUps, timer, wave } = gameState
  const currentPlayer = players.find((p) => p.id === playerId)

  return (
    <div className="w-full h-full relative bg-black text-white">
      <EnhancedGameRenderer
        players={players}
        enemies={enemies}
        projectiles={projectiles}
        powerUps={powerUps}
        isPaused={isPaused}
      />

      {/* Game UI Overlays */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-black/30 flex justify-between items-center">
        <h2 className="text-2xl font-bold font-mono text-cyan-400">Archer Arena</h2>
        <div className="flex items-center gap-2">
          <Button onClick={togglePause} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            {isPaused ? <Play /> : <Pause />}
          </Button>
          <Button onClick={toggleMute} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            {isMuted ? <VolumeX /> : <Volume2 />}
          </Button>
        </div>
      </div>

      <div className="absolute top-20 left-4">
        <Card className="bg-black/50 border-cyan-500/50 text-white">
          <CardHeader>
            <CardTitle className="text-cyan-400">SCOREBOARD</CardTitle>
          </CardHeader>
          <CardContent>
            {players.map((p) => (
              <div key={p.id} className="flex justify-between">
                <span>{p.name}</span>
                <span>{p.score}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="absolute top-20 right-4 text-center">
        <p className="text-4xl font-mono">
          {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
        </p>
        <p className="text-lg font-mono">Wave: {wave}</p>
      </div>

      {currentPlayer && (
        <div className="absolute bottom-4 left-4 flex items-center gap-4">
          <div className="w-24 h-4 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500" style={{ width: `${currentPlayer.health}%` }}></div>
          </div>
          <div className="flex gap-2">{/* Display abilities */}</div>
        </div>
      )}

      <AnimatePresence>
        {gameOver && (
          <motion.div
            className="absolute inset-0 bg-black/70 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="bg-black/80 border-pink-500/50 text-white text-center">
              <CardHeader>
                <CardTitle className="text-4xl text-pink-400">GAME OVER</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl">{winner ? `${winner} is victorious!` : "The horde survives..."}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
