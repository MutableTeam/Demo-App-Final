"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import GameControllerEnhanced from "./pvp-game/game-controller-enhanced"

interface MobileGameContainerProps {
  gameId: string
  playerId: string
  playerName: string
  isHost: boolean
  gameMode: string
  onGameEnd: (winner: string | null) => void
  className?: string
}

interface JoystickState {
  x: number
  y: number
  isDragging: boolean
}

interface ActionState {
  action: string
  pressed: boolean
}

export default function MobileGameContainer({
  gameId,
  playerId,
  playerName,
  isHost,
  gameMode,
  onGameEnd,
  className,
}: MobileGameContainerProps) {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")
  const [joystickState, setJoystickState] = useState<JoystickState>({ x: 0, y: 0, isDragging: false })
  const [actionState, setActionState] = useState<ActionState | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gamePaused, setGamePaused] = useState(false)

  const joystickRef = useRef<HTMLDivElement>(null)
  const joystickKnobRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Detect orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      const isLandscape = window.innerWidth > window.innerHeight
      setOrientation(isLandscape ? "landscape" : "portrait")
    }

    handleOrientationChange()
    window.addEventListener("resize", handleOrientationChange)
    window.addEventListener("orientationchange", handleOrientationChange)

    return () => {
      window.removeEventListener("resize", handleOrientationChange)
      window.removeEventListener("orientationchange", handleOrientationChange)
    }
  }, [])

  // Joystick touch handlers
  const handleJoystickStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    setJoystickState((prev) => ({ ...prev, isDragging: true }))
  }, [])

  const handleJoystickMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!joystickState.isDragging || !joystickRef.current) return

      e.preventDefault()

      const rect = joystickRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      let clientX: number, clientY: number

      if ("touches" in e) {
        if (e.touches.length === 0) return
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        clientX = e.clientX
        clientY = e.clientY
      }

      const deltaX = clientX - centerX
      const deltaY = clientY - centerY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const maxDistance = rect.width / 2 - 10 // Account for knob size

      let normalizedX = deltaX / maxDistance
      let normalizedY = deltaY / maxDistance

      // Clamp to circle
      if (distance > maxDistance) {
        normalizedX = (deltaX / distance) * 1
        normalizedY = (deltaY / distance) * 1
      }

      setJoystickState({
        x: Math.max(-1, Math.min(1, normalizedX)),
        y: Math.max(-1, Math.min(1, normalizedY)),
        isDragging: true,
      })
    },
    [joystickState.isDragging],
  )

  const handleJoystickEnd = useCallback(() => {
    setJoystickState({ x: 0, y: 0, isDragging: false })
  }, [])

  // Action button handlers
  const handleActionPress = useCallback((action: string) => {
    setActionState({ action, pressed: true })
  }, [])

  const handleActionRelease = useCallback((action: string) => {
    setActionState({ action, pressed: false })
    // Clear action state after a brief moment
    setTimeout(() => setActionState(null), 50)
  }, [])

  // Game control handlers
  const handleGameStart = useCallback(() => {
    setGameStarted(true)
    setGamePaused(false)
  }, [])

  const handleGamePause = useCallback(() => {
    setGamePaused(!gamePaused)
  }, [gamePaused])

  const handleGameStop = useCallback(() => {
    setGameStarted(false)
    setGamePaused(false)
    onGameEnd(null)
  }, [onGameEnd])

  const handleGameReset = useCallback(() => {
    setGameStarted(false)
    setGamePaused(false)
    // Reset will be handled by restarting the game
    setTimeout(() => {
      setGameStarted(true)
    }, 100)
  }, [])

  // Touch event handlers for the entire document
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (joystickState.isDragging) {
        handleJoystickMove(e as any)
      }
    }

    const handleTouchEnd = () => {
      if (joystickState.isDragging) {
        handleJoystickEnd()
      }
    }

    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd)
    document.addEventListener("mousemove", handleJoystickMove as any)
    document.addEventListener("mouseup", handleTouchEnd)

    return () => {
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
      document.removeEventListener("mousemove", handleJoystickMove as any)
      document.removeEventListener("mouseup", handleTouchEnd)
    }
  }, [joystickState.isDragging, handleJoystickMove, handleJoystickEnd])

  const isLandscape = orientation === "landscape"

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full bg-gray-900 overflow-hidden",
        "touch-none select-none", // Prevent default touch behaviors
        className,
      )}
      style={{
        minHeight: "100vh",
        maxHeight: "100vh",
      }}
    >
      {/* Game Content Area */}
      <div
        className={cn(
          "absolute bg-black border-2 border-gray-600 rounded-lg overflow-hidden",
          isLandscape
            ? "top-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-200px)] h-[calc(100%-32px)]"
            : "top-4 left-4 right-4 h-[calc(60%-16px)]",
        )}
      >
        <GameControllerEnhanced
          gameId={gameId}
          playerId={playerId}
          playerName={playerName}
          isHost={isHost}
          gameMode={gameMode}
          onGameEnd={onGameEnd}
          platformType="mobile"
          joystickInput={joystickState}
          actionInput={actionState}
          onGameStart={handleGameStart}
          onGamePause={handleGamePause}
          onGameStop={handleGameStop}
          onGameReset={handleGameReset}
          isPlaying={gameStarted}
          isPaused={gamePaused}
          className="w-full h-full"
        />
      </div>

      {/* Movement Controls (Left Side) */}
      <div
        className={cn(
          "absolute flex flex-col items-center justify-center",
          isLandscape ? "left-4 top-1/2 transform -translate-y-1/2 w-32 h-32" : "bottom-4 left-4 w-32 h-32",
        )}
      >
        <div className="text-gray-400 text-xs font-mono mb-2 text-center">{isLandscape ? "MOVEMENT" : "MOVE"}</div>
        <div
          ref={joystickRef}
          className="relative w-24 h-24 bg-gray-800 border-2 border-gray-600 rounded-full cursor-pointer"
          onTouchStart={handleJoystickStart}
          onMouseDown={handleJoystickStart}
        >
          {/* Joystick Base */}
          <div className="absolute inset-2 bg-gray-700 rounded-full opacity-50" />

          {/* Joystick Knob */}
          <div
            ref={joystickKnobRef}
            className="absolute w-8 h-8 bg-gray-300 border-2 border-gray-500 rounded-full transition-all duration-75"
            style={{
              left: `calc(50% + ${joystickState.x * 32}px - 16px)`,
              top: `calc(50% + ${joystickState.y * 32}px - 16px)`,
              backgroundColor: joystickState.isDragging ? "#60a5fa" : "#d1d5db",
            }}
          />

          {/* Directional indicators */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-500 rounded-full" />
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-500 rounded-full" />
            <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-500 rounded-full" />
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-500 rounded-full" />
          </div>
        </div>
        <div className="text-gray-500 text-xs font-mono mt-1">ANALOG</div>
      </div>

      {/* Action Controls (Right Side) */}
      <div
        className={cn(
          "absolute flex flex-col items-center justify-center",
          isLandscape ? "right-4 top-1/2 transform -translate-y-1/2 w-32 h-40" : "bottom-4 right-4 w-32 h-40",
        )}
      >
        <div className="text-gray-400 text-xs font-mono mb-2 text-center">ACTIONS</div>

        {/* Action Buttons Layout */}
        <div className="relative w-24 h-24">
          {/* Y Button (Top) */}
          <button
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gray-700 hover:bg-gray-600 active:bg-blue-600 border-2 border-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm transition-colors"
            onTouchStart={() => handleActionPress("actionY")}
            onTouchEnd={() => handleActionRelease("actionY")}
            onMouseDown={() => handleActionPress("actionY")}
            onMouseUp={() => handleActionRelease("actionY")}
          >
            Y
          </button>

          {/* X Button (Right) */}
          <button
            className="absolute top-1/2 right-0 transform -translate-y-1/2 w-12 h-12 bg-gray-700 hover:bg-gray-600 active:bg-orange-600 border-2 border-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm transition-colors"
            onTouchStart={() => handleActionPress("actionX")}
            onTouchEnd={() => handleActionRelease("actionX")}
            onMouseDown={() => handleActionPress("actionX")}
            onMouseUp={() => handleActionRelease("actionX")}
          >
            X
          </button>

          {/* B Button (Bottom) */}
          <button
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gray-700 hover:bg-gray-600 active:bg-red-600 border-2 border-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm transition-colors"
            onTouchStart={() => handleActionPress("actionB")}
            onTouchEnd={() => handleActionRelease("actionB")}
            onMouseDown={() => handleActionPress("actionB")}
            onMouseUp={() => handleActionRelease("actionB")}
          >
            B
          </button>

          {/* A Button (Left) */}
          <button
            className="absolute top-1/2 left-0 transform -translate-y-1/2 w-12 h-12 bg-gray-700 hover:bg-gray-600 active:bg-green-600 border-2 border-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm transition-colors"
            onTouchStart={() => handleActionPress("actionA")}
            onTouchEnd={() => handleActionRelease("actionA")}
            onMouseDown={() => handleActionPress("actionA")}
            onMouseUp={() => handleActionRelease("actionA")}
          >
            A
          </button>
        </div>
      </div>

      {/* Portrait Mode Additional Controls */}
      {!isLandscape && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
          {/* D-Pad Style Controls */}
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-3 gap-1">
              <div />
              <button className="w-8 h-8 bg-gray-700 border border-gray-500 rounded flex items-center justify-center text-xs text-white">
                ↑
              </button>
              <div />
              <button className="w-8 h-8 bg-gray-700 border border-gray-500 rounded flex items-center justify-center text-xs text-white">
                ←
              </button>
              <div className="w-8 h-8 bg-gray-800 border border-gray-600 rounded" />
              <button className="w-8 h-8 bg-gray-700 border border-gray-500 rounded flex items-center justify-center text-xs text-white">
                →
              </button>
              <div />
              <button className="w-8 h-8 bg-gray-700 border border-gray-500 rounded flex items-center justify-center text-xs text-white">
                ↓
              </button>
              <div />
            </div>
            <div className="text-gray-500 text-xs font-mono mt-1">MOVE</div>
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="absolute top-2 left-2 text-xs text-gray-400 font-mono bg-black/50 px-2 py-1 rounded">
        {orientation.toUpperCase()} | JS: {joystickState.x.toFixed(2)},{joystickState.y.toFixed(2)}
        {actionState && ` | ${actionState.action}: ${actionState.pressed}`}
      </div>

      {/* Game Status */}
      <div className="absolute top-2 right-2 text-xs text-gray-400 font-mono bg-black/50 px-2 py-1 rounded">
        {gameStarted ? (gamePaused ? "PAUSED" : "PLAYING") : "READY"}
      </div>
    </div>
  )
}
