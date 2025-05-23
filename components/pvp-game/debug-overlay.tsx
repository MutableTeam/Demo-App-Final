"use client"

import { useState, useEffect } from "react"
import type { GameState } from "./game-engine"

interface DebugOverlayProps {
  gameState: GameState
  localPlayerId: string
  visible: boolean
}

export default function DebugOverlay({ gameState, localPlayerId, visible }: DebugOverlayProps) {
  const [fps, setFps] = useState<number>(0)
  const [lastFrameTime, setLastFrameTime] = useState<number>(Date.now())
  const [frameCount, setFrameCount] = useState<number>(0)

  // Update FPS counter
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = now - lastFrameTime
      if (elapsed > 0) {
        setFps(Math.round(frameCount / (elapsed / 1000)))
        setLastFrameTime(now)
        setFrameCount(0)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [frameCount, lastFrameTime])

  // Increment frame counter
  useEffect(() => {
    setFrameCount((prev) => prev + 1)
  }, [gameState])

  if (!visible) return null

  const player = gameState.players[localPlayerId]

  return (
    <div className="absolute top-0 left-0 p-2 bg-black/70 text-white text-xs font-mono w-64 z-10">
      <h3 className="font-bold mb-1">Debug Information</h3>
      <div className="space-y-1">
        <p>FPS: {fps}</p>
        <p>
          Game Time: {gameState.gameTime.toFixed(1)}s / {gameState.maxGameTime}s
        </p>
        <p>Players: {Object.keys(gameState.players).length}</p>
        <p>Arrows: {gameState.arrows.length}</p>

        {player && (
          <>
            <h4 className="font-bold mt-2">Local Player</h4>
            <p>
              Position: ({Math.round(player.position.x)}, {Math.round(player.position.y)})
            </p>
            <p>Health: {player.health}/100</p>
            <p>Animation: {player.animationState}</p>
            <p>Bow Drawing: {player.isDrawingBow ? "Yes" : "No"}</p>
            <p>Special Ready: {player.specialAttackCooldown <= 0 ? "Yes" : "No"}</p>
          </>
        )}
      </div>
    </div>
  )
}
