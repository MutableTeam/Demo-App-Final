"use client"

import { useState, useEffect, useRef } from "react"
import { gameInputHandler } from "@/utils/game-input-handler"
import { usePlatform } from "@/contexts/platform-context"
import EnhancedGameRenderer from "./enhanced-game-renderer"
import MobileGameContainer from "@/components/mobile-game-container"
import type { GameState } from "./game-engine"

interface GameControllerEnhancedProps {
  gameId: string
  playerId: string
  debugMode?: boolean
  onGameEnd?: (result: any) => void
  initialGameState?: Partial<GameState>
}

export default function GameControllerEnhanced({
  gameId,
  playerId,
  debugMode = false,
  onGameEnd,
  initialGameState,
}: GameControllerEnhancedProps) {
  const { platformType } = usePlatform()
  const [gameState, setGameState] = useState<GameState>({
    arenaSize: { width: 800, height: 600 },
    gameStatus: "playing",
    gameTime: 0,
    players: {
      [playerId]: {
        id: playerId,
        name: "Player",
        position: { x: 400, y: 300 },
        rotation: 0,
        health: 100,
        maxHealth: 100,
        size: 20,
        color: "#00ff88",
        score: 0,
        isDrawingBow: false,
        isDashing: false,
        isChargingSpecial: false,
        drawPower: 0,
      },
    },
    arrows: [],
    walls: [
      { position: { x: 200, y: 200 }, width: 100, height: 20 },
      { position: { x: 500, y: 400 }, width: 20, height: 100 },
      { position: { x: 300, y: 500 }, width: 150, height: 20 },
    ],
    pickups: [
      { position: { x: 150, y: 150 }, type: "health" },
      { position: { x: 650, y: 450 }, type: "ammo" },
    ],
    explosions: [],
    ...initialGameState,
  })

  const gameLoopRef = useRef<number>()
  const lastUpdateRef = useRef<number>(Date.now())

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      const now = Date.now()
      const deltaTime = (now - lastUpdateRef.current) / 1000
      lastUpdateRef.current = now

      // Get input state
      const inputState = gameInputHandler.getCurrentState()
      const player = gameState.players[playerId]

      if (player) {
        // Update player position based on movement input
        const speed = 200 // pixels per second
        const newX = player.position.x + inputState.movement.x * speed * deltaTime
        const newY = player.position.y + inputState.movement.y * speed * deltaTime

        // Keep player within bounds
        const clampedX = Math.max(player.size, Math.min(gameState.arenaSize.width - player.size, newX))
        const clampedY = Math.max(player.size, Math.min(gameState.arenaSize.height - player.size, newY))

        // Update player rotation based on movement
        if (inputState.movement.x !== 0 || inputState.movement.y !== 0) {
          player.rotation = Math.atan2(inputState.movement.y, inputState.movement.x)
        }

        // Update player state
        setGameState((prev) => ({
          ...prev,
          gameTime: prev.gameTime + deltaTime,
          players: {
            ...prev.players,
            [playerId]: {
              ...player,
              position: { x: clampedX, y: clampedY },
              isDrawingBow: inputState.actions.shoot,
              isDashing: inputState.actions.dash,
              isChargingSpecial: inputState.actions.special,
            },
          },
        }))
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState, playerId])

  // Handle keyboard input for desktop
  useEffect(() => {
    if (platformType !== "desktop") return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          gameInputHandler.setMovementInput(gameInputHandler.getMovementInput().x, -1)
          break
        case "KeyS":
        case "ArrowDown":
          gameInputHandler.setMovementInput(gameInputHandler.getMovementInput().x, 1)
          break
        case "KeyA":
        case "ArrowLeft":
          gameInputHandler.setMovementInput(-1, gameInputHandler.getMovementInput().y)
          break
        case "KeyD":
        case "ArrowRight":
          gameInputHandler.setMovementInput(1, gameInputHandler.getMovementInput().y)
          break
        case "Space":
          e.preventDefault()
          gameInputHandler.setShootPressed(true)
          break
        case "ShiftLeft":
          gameInputHandler.setDashPressed(true)
          break
        case "KeyE":
          gameInputHandler.setSpecialPressed(true)
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
        case "KeyS":
        case "ArrowDown":
          gameInputHandler.setMovementInput(gameInputHandler.getMovementInput().x, 0)
          break
        case "KeyA":
        case "ArrowLeft":
        case "KeyD":
        case "ArrowRight":
          gameInputHandler.setMovementInput(0, gameInputHandler.getMovementInput().y)
          break
        case "Space":
          gameInputHandler.setShootPressed(false)
          break
        case "ShiftLeft":
          gameInputHandler.setDashPressed(false)
          break
        case "KeyE":
          gameInputHandler.setSpecialPressed(false)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [platformType])

  const gameRenderer = (
    <EnhancedGameRenderer
      gameState={gameState}
      localPlayerId={playerId}
      debugMode={debugMode}
      platformType={platformType}
    />
  )

  if (platformType === "mobile") {
    return <MobileGameContainer>{gameRenderer}</MobileGameContainer>
  }

  return (
    <div className="w-full h-full bg-black">
      {gameRenderer}
      {debugMode && (
        <div className="absolute top-4 left-4 text-green-400 font-mono text-sm bg-black/80 p-2 rounded">
          <div>Platform: {platformType}</div>
          <div>Player: {playerId}</div>
          <div>Game ID: {gameId}</div>
        </div>
      )}
    </div>
  )
}
