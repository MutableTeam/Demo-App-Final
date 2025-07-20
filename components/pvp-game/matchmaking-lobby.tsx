"use client"

import { Tabs } from "@/components/ui/tabs"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Users, Clock, Gamepad2, Settings, Wifi, WifiOff } from "lucide-react"
import DesktopGameContainer from "@/components/desktop-game-container"
import type { PlatformType } from "@/contexts/platform-context"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"

// Cyberpunk animations
const scanline = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
`

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

const CyberModeCardStyle = styled(Card)`
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), transparent);
    animation: ${scanline} 4s linear infinite;
    z-index: 1;
    opacity: 0.3;
    pointer-events: none;
  }
`

const CyberModeBadge = styled(Badge)`
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.2) 0%, rgba(255, 0, 255, 0.2) 100%);
  border: 1px solid rgba(0, 255, 255, 0.5);
  color: #0ff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  font-family: monospace;
  font-weight: bold;
  font-size: 0.75rem;
  letter-spacing: 1px;
`

const CyberModeButton = styled(Button)`
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
`

const CyberModeInput = styled(Input)`
  background: rgba(16, 16, 48, 0.7);
  border: 1px solid rgba(0, 255, 255, 0.3);
  color: #0ff;
  font-family: monospace;
  
  &:focus {
    border-color: rgba(0, 255, 255, 0.8);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  }
`

const CyberModeTabs = styled(Tabs)`
  .cyber-tab-list {
    background: linear-gradient(90deg, rgba(16, 16, 48, 0.7) 0%, rgba(32, 16, 64, 0.7) 100%);
    border: 1px solid rgba(0, 255, 255, 0.3);
    overflow: hidden;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
      z-index: 1;
    }
  }
  
  .cyber-tab {
    color: rgba(255, 255, 255, 0.7);
    font-family: monospace;
    position: relative;
    transition: all 0.3s ease;
    
    &[data-state="active"] {
      background: rgba(0, 255, 255, 0.1);
      color: #0ff;
      text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
      
      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, #0ff, transparent);
      }
    }
    
    &:hover:not([data-state="active"]) {
      background: rgba(0, 255, 255, 0.05);
      color: rgba(0, 255, 255, 0.9);
    }
  }
`

const CyberModeCard = styled(Card)`
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

interface Player {
  id: string
  name: string
  isReady: boolean
  isHost: boolean
}

interface MatchmakingLobbyProps {
  gameMode: string
  onBack: () => void
  platformType?: PlatformType
}

export default function MatchmakingLobby({ gameMode, onBack, platformType = "desktop" }: MatchmakingLobbyProps) {
  const [players, setPlayers] = useState<Player[]>([{ id: "player1", name: "You", isReady: false, isHost: true }])
  const [isConnected, setIsConnected] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [playerName, setPlayerName] = useState("Player")
  const [roomCode, setRoomCode] = useState("")
  const [countdown, setCountdown] = useState(0)
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  // Simulate connection status
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Simulate finding players
  useEffect(() => {
    if (isSearching) {
      const timer = setTimeout(() => {
        setPlayers((prev) => [
          ...prev,
          { id: "ai1", name: "AI Player 1", isReady: true, isHost: false },
          { id: "ai2", name: "AI Player 2", isReady: true, isHost: false },
        ])
        setIsSearching(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isSearching])

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (countdown === 0 && players.length > 1 && players.every((p) => p.isReady)) {
      setGameStarted(true)
    }
  }, [countdown, players])

  const handleReady = () => {
    setPlayers((prev) => prev.map((p) => (p.id === "player1" ? { ...p, isReady: !p.isReady } : p)))
  }

  const handleStartSearch = () => {
    setIsSearching(true)
  }

  const handleStartGame = () => {
    if (players.every((p) => p.isReady)) {
      setCountdown(3)
    }
  }

  const handleGameEnd = (winner?: string | null) => {
    setGameStarted(false)
    setCountdown(0)
    // Reset players ready status
    setPlayers((prev) => prev.map((p) => ({ ...p, isReady: false })))
  }

  if (gameStarted) {
    return (
      <DesktopGameContainer
        gameId="archer-arena"
        playerId="player1"
        playerName={playerName}
        isHost={true}
        gameMode={gameMode}
        onGameEnd={handleGameEnd}
        platformType={platformType}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="w-6 h-6" />
              {gameMode.toUpperCase()} Lobby
            </CardTitle>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  Connecting...
                </Badge>
              )}
              <Button onClick={onBack} variant="outline" size="sm">
                Back
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Player Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="playerName">Your Name</Label>
              <Input
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="roomCode">Room Code (Optional)</Label>
              <Input
                id="roomCode"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter room code"
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold">Game Mode: {gameMode.toUpperCase()}</h4>
              <p className="text-sm text-muted-foreground">
                {gameMode === "duel" && "1v1 archer battle to the death"}
                {gameMode === "ffa" && "Free-for-all battle royale"}
                {gameMode === "timed" && "Score as many points as possible"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Players List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Players ({players.length}/4)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {players.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{player.name}</p>
                      {player.isHost && (
                        <Badge variant="secondary" className="text-xs">
                          Host
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge variant={player.isReady ? "default" : "outline"}>
                    {player.isReady ? "Ready" : "Not Ready"}
                  </Badge>
                </div>
              ))}

              {players.length < 4 && (
                <div className="flex items-center justify-center p-3 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <p className="text-muted-foreground text-sm">Waiting for players...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Game Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Game Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {countdown > 0 ? (
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{countdown}</div>
                <p className="text-muted-foreground">Game starting...</p>
              </div>
            ) : (
              <>
                <Button
                  onClick={handleReady}
                  variant={players.find((p) => p.id === "player1")?.isReady ? "secondary" : "default"}
                  className="w-full"
                >
                  {players.find((p) => p.id === "player1")?.isReady ? "Not Ready" : "Ready Up"}
                </Button>

                {players.length === 1 && !isSearching && (
                  <Button onClick={handleStartSearch} variant="outline" className="w-full bg-transparent">
                    Find Players
                  </Button>
                )}

                {isSearching && (
                  <div className="text-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Searching for players...</p>
                  </div>
                )}

                {players.length > 1 && players.every((p) => p.isReady) && (
                  <Button onClick={handleStartGame} className="w-full">
                    <Clock className="w-4 h-4 mr-2" />
                    Start Game
                  </Button>
                )}
              </>
            )}

            <Separator />

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Controls
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                {platformType === "desktop" ? (
                  <>
                    <p>• WASD - Move</p>
                    <p>• Mouse - Aim</p>
                    <p>• Click - Shoot</p>
                    <p>• Right Click - Special</p>
                    <p>• Shift - Dash</p>
                  </>
                ) : (
                  <>
                    <p>• Left Joystick - Move</p>
                    <p>• Right Area - Aim</p>
                    <p>• Action Buttons - Abilities</p>
                    <p>• Touch optimized controls</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
