"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createInitialLastStandState, type LastStandGameState } from "./game-state"
import { updateLastStandGameState } from "./game-engine"
import LastStandRenderer from "./game-renderer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { debugManager } from "@/utils/debug-utils"
import { audioManager, playGameOverSound } from "@/utils/audio-manager"
import CountdownTimer from "@/components/pvp-game/countdown-timer"
import { usePlatform } from "@/contexts/platform-context"
import { useGameControls } from "@/hooks/use-game-controls"
import { gameInputHandler, type GameInputState } from "@/utils/game-input-handler"

interface LastStandGameProps {
  playerId: string
  playerName: string
  gameMode?: string
  onGameEnd: (stats: any) => void
  onCancel: () => void
}

export default function LastStandGame({
  playerId,
  playerName,
  gameMode = "practice",
  onGameEnd,
  onCancel,
}: LastStandGameProps) {
  const { platformType, setUiActive } = usePlatform()
  const isMobile = platformType === "mobile"

  const [gameState, setGameState] = useState<LastStandGameState>(() =>
    createInitialLastStandState(playerId, playerName, gameMode),
  )
  const [showCountdown, setShowCountdown] = useState<boolean>(true)
  const [showGameOver, setShowGameOver] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)

  const gameStateRef = useRef(gameState)
  const lastUpdateTimeRef = useRef<number>(Date.now())
  const requestAnimationFrameIdRef = useRef<number | null>(null)

  const isGameActive = !showCountdown && !showGameOver && !isPaused && !gameState.isLevelingUp

  // Setup desktop controls
  useGameControls({
    playerId: "player",
    gameStateRef,
    platformType: platformType || "desktop",
    isEnabled: !isMobile && isGameActive,
  })

  // Setup mobile controls
  useEffect(() => {
    if (isMobile) {
      const handleMobileInput = (inputState: GameInputState) => {
        const playerControls = gameStateRef.current.players.player.controls
        playerControls.up = inputState.movement.up
        playerControls.down = inputState.movement.down
        playerControls.left = inputState.movement.left
        playerControls.right = inputState.movement.right

        if (inputState.aiming.active) {
          gameStateRef.current.players.player.rotation = inputState.aiming.angle
        }
        playerControls.shoot = inputState.actions.shoot

        playerControls.dash = inputState.actions.dash
        playerControls.special = inputState.actions.special
      }
      gameInputHandler.setCallbacks({ onStateChange: handleMobileInput })
      return () => gameInputHandler.setCallbacks({})
    }
  }, [isMobile])

  // Effect to control UI visibility for mobile controls
  useEffect(() => {
    if (isMobile) {
      const isOverlayVisible = showGameOver || isPaused || gameState.isLevelingUp
      setUiActive(isOverlayVisible)
    }
    // Cleanup on unmount
    return () => {
      if (isMobile) {
        setUiActive(false)
      }
    }
  }, [isMobile, showGameOver, isPaused, gameState.isLevelingUp, setUiActive])

  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  const handleCountdownComplete = () => {
    setShowCountdown(false)
    startGame()
  }

  const startGame = () => {
    const initialState = createInitialLastStandState(playerId, playerName, gameMode)
    const adaptedState = { ...initialState, players: { player: initialState.player } }
    setGameState(adaptedState)
    gameStateRef.current = adaptedState
    lastUpdateTimeRef.current = Date.now()
    requestAnimationFrameIdRef.current = requestAnimationFrame(gameLoop)
  }

  const gameLoop = useCallback(() => {
    const now = Date.now()
    const deltaTime = Math.min((now - lastUpdateTimeRef.current) / 1000, 0.1)
    lastUpdateTimeRef.current = now

    const unadaptedState = { ...gameStateRef.current, player: gameStateRef.current.players.player }
    const newState = updateLastStandGameState(unadaptedState, deltaTime, []) // Actions are now handled directly via state
    const adaptedState = { ...newState, players: { player: newState.player } }

    if (newState.isGameOver && !gameStateRef.current.isGameOver) {
      handleGameOver(newState)
    }

    gameStateRef.current = adaptedState
    setGameState(adaptedState)
    setIsPaused(newState.isPaused)

    if (!newState.isGameOver) {
      requestAnimationFrameIdRef.current = requestAnimationFrame(gameLoop)
    }
  }, [])

  const handleGameOver = (finalState: any) => {
    setShowGameOver(true)
    audioManager.stopBackgroundMusic()
    playGameOverSound()
    debugManager.logInfo("LAST_STAND", "Game over", {
      score: finalState.playerStats.score,
      wave: finalState.completedWaves,
      timeAlive: finalState.playerStats.timeAlive,
    })
  }

  const handleExit = () => {
    if (requestAnimationFrameIdRef.current) {
      cancelAnimationFrame(requestAnimationFrameIdRef.current)
    }
    onGameEnd({
      score: gameState.playerStats.score,
      wave: gameState.completedWaves,
      timeAlive: gameState.playerStats.timeAlive,
    })
  }

  const handleUpgradeSelect = (upgradeId: string) => {
    const player = gameStateRef.current.players.player
    const upgrade = gameState.availableUpgrades.find((u) => u.id === upgradeId)
    if (upgrade && player) {
      // This logic should ideally be in the game engine, but for now:
      if (upgrade.stat === "maxHealth") player.maxHealth += upgrade.value
      if (upgrade.stat === "moveSpeed") player.moveSpeed += upgrade.value
      player.health = player.maxHealth // Heal on level up
      gameStateRef.current.isLevelingUp = false
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !gameState.isLevelingUp) {
        setIsPaused((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [gameState.isLevelingUp])

  useEffect(() => {
    audioManager.init()
    return () => {
      audioManager.stopBackgroundMusic()
    }
  }, [])

  if (showCountdown) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-900">
        <CountdownTimer duration={3} onComplete={handleCountdownComplete} size="large" />
      </div>
    )
  }

  if (showGameOver) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-900/80">
        <Card className="w-[400px] bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="font-mono text-center">GAME OVER</CardTitle>
          </CardHeader>
          <CardContent>{/* Stats display */}</CardContent>
          <CardFooter>
            <Button onClick={handleExit} className="w-full">
              Exit Game
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full bg-gray-900 overflow-hidden">
      <LastStandRenderer gameState={gameState} />
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none text-white">
        {/* HUD elements */}
      </div>

      {gameState.isLevelingUp && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-5xl font-bold text-yellow-400">LEVEL UP!</h1>
            <div className="flex gap-6">
              {gameState.availableUpgrades.map((upgrade) => (
                <Card
                  key={upgrade.id}
                  className="w-64 bg-gray-900/80 border-2 border-yellow-400/50 hover:border-yellow-400 cursor-pointer"
                  onClick={() => handleUpgradeSelect(upgrade.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-yellow-400">{upgrade.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{upgrade.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {isPaused && !gameState.isLevelingUp && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <Card className="w-[300px]">
            <CardHeader>
              <CardTitle className="text-center">PAUSED</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={() => setIsPaused(false)} className="w-full">
                Resume
              </Button>
              <Button variant="outline" className="w-full bg-transparent" onClick={handleExit}>
                Exit Game
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
