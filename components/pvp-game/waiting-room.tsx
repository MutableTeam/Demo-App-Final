"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Gamepad2, Users, CheckCircle2, XCircle } from "lucide-react"
import Image from "next/image"
import SoundButton from "../sound-button"
import CountdownTimer from "./countdown-timer"
import { debugManager } from "@/utils/debug-utils"
import transitionDebugger from "@/utils/transition-debug"
import GameInstructions from "./game-instructions"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { Button } from "@/components/ui/button"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"

// Cyberpunk animations
const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 10px rgba(255, 0, 255, 0.5), 0 0 20px rgba(255, 0, 255, 0.3);
  }
  100% {
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.3);
  }
`

const CyberWaitingCard = styled(Card)`
  background: rgba(16, 16, 48, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  animation: ${pulse} 3s infinite alternate;
  
  &:hover {
    border-color: rgba(0, 255, 255, 0.8);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.8), transparent);
    z-index: 1;
  }
`

const CyberPlayerCard = styled.div`
  background: rgba(16, 16, 48, 0.7);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  
  &.ready {
    border-color: rgba(0, 255, 128, 0.5);
    background: rgba(0, 255, 128, 0.1);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(0, 255, 128, 0.8), transparent);
    }
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(0, 255, 128, 0.8), transparent);
    }
  }
  
  &.waiting {
    border-color: rgba(255, 255, 0, 0.5);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 0, 0.8), transparent);
    }
  }
  
  &.empty {
    border-style: dashed;
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.05);
  }
`

const CyberBadge = styled(Badge)`
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.2) 0%, rgba(255, 0, 255, 0.2) 100%);
  border: 1px solid rgba(0, 255, 255, 0.5);
  color: #0ff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  font-family: monospace;
  font-weight: bold;
  font-size: 0.75rem;
  letter-spacing: 1px;
  
  &.host {
    background: linear-gradient(90deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.2) 100%);
    border: 1px solid rgba(255, 215, 0, 0.5);
    color: #ffd700;
    text-shadow: 0 0 5px rgba(255, 215, 0, 0.7);
  }
  
  &.you {
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(200, 200, 200, 0.1) 100%);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  }
`

const CyberButton = styled(Button)`
  background: linear-gradient(90deg, #0ff 0%, #f0f 100%);
  color: #000;
  font-family: monospace;
  font-weight: bold;
  font-size: 0.875rem;
  letter-spacing: 1px;
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-shadow: none;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.7);
    background: linear-gradient(90deg, #0ff 20%, #f0f 80%);
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    background: linear-gradient(90deg, #666 0%, #333 100%);
    color: #aaa;
    box-shadow: none;
    transform: none;
  }
  
  &.outline {
    background: transparent;
    border: 1px solid rgba(0, 255, 255, 0.5);
    color: #0ff;
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
    
    &:hover {
      background: rgba(0, 255, 255, 0.1);
      border-color: rgba(0, 255, 255, 0.8);
    }
  }
`

interface Player {
  id: string
  name: string
  isReady: boolean
  isHost?: boolean
}

interface WaitingRoomProps {
  lobbyId: string
  hostId: string
  hostName: string
  publicKey: string
  playerName: string
  maxPlayers: number
  wager: number
  gameMode: string
  players?: Player[] // Real players from Colyseus
  isReady?: boolean
  onToggleReady?: () => void
  onExit: () => void
  onGameStart: () => void
}

export default function WaitingRoom({
  lobbyId,
  hostId,
  hostName,
  publicKey,
  playerName,
  maxPlayers,
  wager,
  gameMode,
  players: colyseusPlayers = [],
  isReady: colyseusIsReady = false,
  onToggleReady,
  onExit,
  onGameStart,
}: WaitingRoomProps) {
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [isHost] = useState(hostId === publicKey)
  const componentId = useRef(`waiting-room-${lobbyId}`).current
  const gameStartedRef = useRef(false)
  const countdownStartedAtRef = useRef<number | null>(null)
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  // Use real players from Colyseus or fallback to initial state
  const players =
    colyseusPlayers.length > 0
      ? colyseusPlayers
      : [
          { id: hostId, name: hostName, isReady: true, isHost: true },
          ...(publicKey !== hostId ? [{ id: publicKey, name: playerName, isReady: false }] : []),
        ]

  const isReady = colyseusIsReady

  // Check if all players are ready
  const allPlayersReady = players.length >= 2 && players.every((player) => player.isReady)

  // Track component mount
  useEffect(() => {
    debugManager.trackComponentMount("WaitingRoom", { lobbyId, isHost })
    transitionDebugger.trackTransition("none", "mounted", "WaitingRoom", { lobbyId, isHost })

    // Cleanup function - NO MORE SIMULATION INTERVALS
    return () => {
      debugManager.trackComponentUnmount("WaitingRoom")
      transitionDebugger.trackTransition("mounted", "unmounted", "WaitingRoom")

      // Clean up any remaining timers
      transitionDebugger.safeClearTimeout(`${componentId}-start-countdown`)
      transitionDebugger.safeClearTimeout(`${componentId}-game-start`)

      // Log cleanup
      debugManager.logInfo("WaitingRoom", "Component cleanup completed")
    }
  }, [lobbyId, isHost, componentId])

  // Watch for all players ready to automatically start countdown
  useEffect(() => {
    if (allPlayersReady && !isCountingDown && players.length >= 2 && countdownStartedAtRef.current === null) {
      debugManager.logInfo("WaitingRoom", "All players ready, starting countdown")

      // Add a small delay before starting countdown
      transitionDebugger.safeSetTimeout(
        () => {
          setIsCountingDown(true)
          countdownStartedAtRef.current = Date.now()
          debugManager.logInfo("WaitingRoom", "Countdown started at: " + countdownStartedAtRef.current)
        },
        1000,
        `${componentId}-auto-start-countdown`,
      )
    }

    return () => {
      transitionDebugger.safeClearTimeout(`${componentId}-auto-start-countdown`)
    }
  }, [allPlayersReady, isCountingDown, players.length, componentId])

  // Handle game start
  const handleGameStart = () => {
    // Prevent multiple game starts
    if (gameStartedRef.current) {
      debugManager.logWarning("WaitingRoom", "Game start already triggered, ignoring duplicate call")
      return
    }

    gameStartedRef.current = true
    debugManager.logInfo("WaitingRoom", "Game starting from waiting room")
    transitionDebugger.trackTransition("waiting", "starting", "WaitingRoom")

    // Call onGameStart directly to ensure it's called
    try {
      onGameStart()
      debugManager.logInfo("WaitingRoom", "onGameStart callback executed successfully")
    } catch (error) {
      debugManager.logError("WaitingRoom", "Error in onGameStart callback", error)
      // Reset the flag in case we need to try again
      gameStartedRef.current = false
    }
  }

  // Handle exit
  const handleExit = () => {
    debugManager.logInfo("WaitingRoom", "Exiting waiting room")
    transitionDebugger.trackTransition("waiting", "exiting", "WaitingRoom")

    try {
      onExit()
    } catch (error) {
      debugManager.logError("WaitingRoom", "Error in onExit callback", error)
    }
  }

  // Toggle ready status for current player
  const toggleReady = () => {
    if (onToggleReady) {
      onToggleReady()
    }
  }

  // Memoize the countdown timer to prevent re-renders
  const countdownTimer = isCountingDown ? (
    <div className="text-center space-y-2">
      <div className={`font-mono text-lg ${isCyberpunk ? "text-[#0ff]" : "dark:text-white"}`}>GAME STARTING IN</div>
      <CountdownTimer
        key={`countdown-${countdownStartedAtRef.current}`}
        duration={5}
        onComplete={handleGameStart}
        size="large"
        className="py-4"
      />
    </div>
  ) : null

  return isCyberpunk ? (
    <CyberWaitingCard>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-[#0ff]" />
            <CardTitle className="font-mono text-[#0ff]">WAITING ROOM</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <CyberBadge variant="outline">{gameMode}</CyberBadge>
            <GameInstructions variant="icon" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center gap-2">
          <Image src="/images/mutable-token.png" alt="MUTB" width={24} height={24} />
          <span className="font-mono text-xl text-[#0ff]">{wager} MUTB WAGER</span>
        </div>

        {isCountingDown ? (
          countdownTimer
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 text-[#0ff]" />
              <span className="font-mono text-[#0ff]">
                PLAYERS ({players.length}/{maxPlayers})
              </span>
            </div>
            <div className={`text-sm ${allPlayersReady ? "text-[#0f8] font-bold" : "text-[#0ff]/70"}`}>
              {allPlayersReady
                ? "All players ready! Game will start soon..."
                : "Waiting for all players to be ready..."}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: maxPlayers }).map((_, index) => {
            const player = players[index]
            return (
              <CyberPlayerCard
                key={index}
                className={`flex items-center gap-3 p-3 ${player ? (player.isReady ? "ready" : "waiting") : "empty"}`}
              >
                {player ? (
                  <>
                    <Avatar className="border border-[#0ff]/50">
                      <AvatarImage src={`/diverse-group-avatars.png?height=40&width=40&query=avatar ${index + 1}`} />
                      <AvatarFallback className="bg-[#0a0a24] text-[#0ff]">{player.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-bold font-mono flex items-center gap-2 text-[#0ff]">
                        {player.name}
                        {(player.isHost || player.id === hostId) && (
                          <CyberBadge variant="outline" className="ml-2 host">
                            HOST
                          </CyberBadge>
                        )}
                        {player.id === publicKey && (
                          <CyberBadge variant="outline" className="ml-2 you">
                            YOU
                          </CyberBadge>
                        )}
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        {player.isReady ? (
                          <div className="flex items-center text-[#0f8]">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Ready
                          </div>
                        ) : (
                          <div className="flex items-center text-yellow-400">
                            <XCircle className="h-3 w-3 mr-1" />
                            Not Ready
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-[#0ff]/50">
                    <div className="w-8 h-8 rounded-full bg-[#0a0a24] flex items-center justify-center border border-[#0ff]/30">
                      ?
                    </div>
                    <div className="font-mono">Waiting...</div>
                  </div>
                )}
              </CyberPlayerCard>
            )
          })}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-4">
        <CyberButton variant="outline" className="outline" onClick={handleExit} disabled={isCountingDown}>
          Leave Lobby
        </CyberButton>

        {isHost ? (
          <CyberButton onClick={handleGameStart} disabled={!allPlayersReady || isCountingDown}>
            Start Game
          </CyberButton>
        ) : (
          <CyberButton
            variant="outline"
            className={`outline ${isCountingDown ? "cursor-not-allowed opacity-50" : ""}`}
            onClick={toggleReady}
            disabled={isCountingDown}
          >
            {isReady ? "Not Ready" : "Ready!"}
          </CyberButton>
        )}
      </CardFooter>
    </CyberWaitingCard>
  ) : (
    <Card className="arcade-card bg-[#f5efdc]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 dark:text-gray-300" />
            <CardTitle className="font-mono dark:text-white">WAITING ROOM</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-[#FFD54F] text-black border-2 border-black font-mono dark:bg-[#D4AF37] dark:border-gray-700 dark:text-black"
            >
              {gameMode}
            </Badge>
            <GameInstructions variant="icon" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center gap-2">
          <Image src="/images/mutable-token.png" alt="MUTB" width={24} height={24} />
          <span className="font-mono text-xl dark:text-white">{wager} MUTB WAGER</span>
        </div>

        {isCountingDown ? (
          countdownTimer
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 dark:text-gray-300" />
              <span className="font-mono dark:text-white">
                PLAYERS ({players.length}/{maxPlayers})
              </span>
            </div>
            <div
              className={`text-sm ${allPlayersReady ? "text-green-600 font-bold dark:text-green-500" : "text-muted-foreground dark:text-gray-400"}`}
            >
              {allPlayersReady
                ? "All players ready! Game will start soon..."
                : "Waiting for all players to be ready..."}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: maxPlayers }).map((_, index) => {
            const player = players[index]
            return (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-md border-2 ${
                  player
                    ? player.isReady
                      ? "border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-700"
                      : "border-black bg-[#f5efdc] dark:bg-gray-700 dark:border-gray-600"
                    : "border-dashed border-gray-400 bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
                }`}
              >
                {player ? (
                  <>
                    <Avatar className="border border-black dark:border-gray-600">
                      <AvatarImage src={`/diverse-group-avatars.png?height=40&width=40&query=avatar ${index + 1}`} />
                      <AvatarFallback className="dark:bg-gray-700 dark:text-white">
                        {player.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-bold font-mono flex items-center gap-2 dark:text-white">
                        {player.name}
                        {(player.isHost || player.id === hostId) && (
                          <Badge
                            variant="outline"
                            className="ml-2 bg-[#FFD54F] text-black text-xs dark:bg-[#D4AF37] dark:border-gray-700"
                          >
                            HOST
                          </Badge>
                        )}
                        {player.id === publicKey && (
                          <Badge
                            variant="outline"
                            className="ml-2 bg-gray-200 text-gray-700 text-xs dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                          >
                            YOU
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        {player.isReady ? (
                          <div className="flex items-center text-green-600 dark:text-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Ready
                          </div>
                        ) : (
                          <div className="flex items-center text-amber-600 dark:text-amber-500">
                            <XCircle className="h-3 w-3 mr-1" />
                            Not Ready
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      ?
                    </div>
                    <div className="font-mono">Waiting...</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-4">
        <SoundButton
          className="flex-1 bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
          onClick={handleExit}
          disabled={isCountingDown}
        >
          Leave Lobby
        </SoundButton>

        {isHost ? (
          <SoundButton
            className="flex-1 bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
            onClick={handleGameStart}
            disabled={!allPlayersReady || isCountingDown}
          >
            Start Game
          </SoundButton>
        ) : (
          <SoundButton
            className={`flex-1 bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono ${
              isCountingDown ? "cursor-not-allowed opacity-50" : ""
            }`}
            onClick={toggleReady}
            disabled={isCountingDown}
          >
            {isReady ? "Not Ready" : "Ready!"}
          </SoundButton>
        )}
      </CardFooter>
    </Card>
  )
}
