"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Gamepad2 } from "lucide-react"
import Image from "next/image"
import WaitingRoom from "./waiting-room"
import SoundButton from "../sound-button"
import { withClickSound } from "@/utils/sound-utils"
import GameErrorBoundary from "@/components/game-error-boundary"
import { debugManager } from "@/utils/debug-utils"
import transitionDebugger from "@/utils/transition-debug"
import { gameRegistry, type GameImplementation } from "@/types/game-registry"
import { GameContainer } from "@/components/game-container"
import GamePopOutContainer from "@/components/game-pop-out-container"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { Button } from "@/components/ui/button"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import { SUPPORTED_TOKENS, type Token } from "@/config/token-registry"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface MatchmakingLobbyProps {
  publicKey: string
  playerName: string
  mutbBalance: number
  solBalance: number | null
  onExit: () => void
  selectedGame?: string
  selectedToken: Token
  onTokenChange: (token: Token) => void
}

interface GameLobby {
  id: string
  host: string
  hostName: string
  mode: string
  modeName: string
  wager: number
  wagerToken: Token
  players: number
  maxPlayers: number
  status: "waiting" | "full" | "in-progress"
  gameType: string
}

export default function MatchmakingLobby({
  publicKey,
  playerName,
  mutbBalance,
  solBalance,
  onExit,
  selectedGame = "pvp-test",
  selectedToken,
  onTokenChange,
}: MatchmakingLobbyProps) {
  const [activeTab, setActiveTab] = useState("browse")
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [selectedGameImpl, setSelectedGameImpl] = useState<GameImplementation | null>(null)
  const [wagerAmount, setWagerAmount] = useState<number>(1)
  const [localPlayerName, setLocalPlayerName] = useState(playerName)
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  // Game state management
  const [gameState, setGameState] = useState<"lobby" | "waiting" | "playing" | "results">("lobby")
  const [selectedLobby, setSelectedLobby] = useState<GameLobby | null>(null)
  const [gameResult, setGameResult] = useState<{ winner: string | null; reward: number; token: Token } | null>(null)

  // Pop-out state
  const [isGamePopOutOpen, setIsGamePopOutOpen] = useState(false)

  // Refs for cleanup tracking
  const componentIdRef = useRef<string>(`matchmaking-${Date.now()}`)

  // Local state for lobbies, replacing mock data
  const [lobbies, setLobbies] = useState<GameLobby[]>([])

  // Load selected game implementation
  useEffect(() => {
    const gameImpl = gameRegistry.getGame(selectedGame)
    if (gameImpl) {
      setSelectedGameImpl(gameImpl)
      if (gameImpl.config.modes.length > 0) {
        setSelectedMode(gameImpl.config.modes[0].id)
        setWagerAmount(gameImpl.config.modes[0].minWager)
      }
    } else {
      const availableGames = gameRegistry.getGamesByType("pvp")
      if (availableGames.length > 0) {
        setSelectedGameImpl(availableGames[0])
      }
    }
  }, [selectedGame])

  // Track component mount
  useEffect(() => {
    debugManager.trackComponentMount("MatchmakingLobby", { publicKey, selectedGame })
    transitionDebugger.trackTransition("none", "mounted", "MatchmakingLobby")

    return () => {
      debugManager.trackComponentUnmount("MatchmakingLobby")
      transitionDebugger.trackTransition("mounted", "unmounted", "MatchmakingLobby")
      transitionDebugger.cleanupAll("MatchmakingLobby")
    }
  }, [publicKey, selectedGame])

  // Open game pop-out when game starts
  useEffect(() => {
    if (gameState === "playing") {
      setIsGamePopOutOpen(true)
    } else {
      setIsGamePopOutOpen(false)
    }
  }, [gameState])

  const getTokenBalance = (token: Token) => (token.symbol === "SOL" ? (solBalance ?? 0) : mutbBalance)

  const createLobby = () => {
    if (!selectedMode || !selectedGameImpl) return

    const mode = selectedGameImpl.config.modes.find((m) => m.id === selectedMode)
    if (!mode) return

    if (wagerAmount < mode.minWager) {
      alert(`Minimum wager for ${mode.name} is ${mode.minWager} ${selectedToken.symbol}`)
      return
    }

    const balance = getTokenBalance(selectedToken)

    if (wagerAmount > balance) {
      alert(`You don't have enough ${selectedToken.symbol} tokens for this wager`)
      return
    }

    const newLobby: GameLobby = {
      id: `lobby-${Date.now()}`,
      host: publicKey,
      hostName: localPlayerName,
      mode: selectedMode,
      modeName: mode.name,
      wager: wagerAmount,
      wagerToken: selectedToken,
      players: 1,
      maxPlayers: mode.players,
      status: "waiting",
      gameType: selectedGameImpl.config.id,
    }

    setLobbies((prev) => [...prev, newLobby])
    setSelectedLobby(newLobby)
    setGameState("waiting")
    debugManager.logInfo("MatchmakingLobby", "Created new lobby", newLobby)
  }

  const joinLobby = (lobby: GameLobby) => {
    if (lobby.status !== "waiting") return
    const balance = getTokenBalance(lobby.wagerToken)
    if (lobby.wager > balance) {
      alert(`You don't have enough ${lobby.wagerToken.symbol} tokens for this wager`)
      return
    }

    setLobbies((prevLobbies) =>
      prevLobbies.map((l) => {
        if (l.id === lobby.id) {
          const newPlayerCount = l.players + 1
          const newStatus = newPlayerCount === l.maxPlayers ? "full" : "waiting"
          return { ...l, players: newPlayerCount, status: newStatus }
        }
        return l
      }),
    )

    setSelectedLobby(lobby)
    setGameState("waiting")
    debugManager.logInfo("MatchmakingLobby", "Joined lobby", lobby)
  }

  const handleGameEnd = (winner: string | null) => {
    if (!selectedLobby) return

    const totalPot = selectedLobby.wager * selectedLobby.maxPlayers
    const winnerReward = totalPot * 0.95 // 5% platform fee

    setGameResult({
      winner,
      reward: winner === publicKey ? winnerReward : 0,
      token: selectedLobby.wagerToken,
    })

    setIsGamePopOutOpen(false)
    setGameState("results")
    debugManager.logInfo("MatchmakingLobby", "Game ended", {
      winner,
      reward: winner === publicKey ? winnerReward : 0,
      token: selectedLobby.wagerToken.symbol,
    })
  }

  const exitGame = () => {
    setGameState("lobby")
    setSelectedLobby(null)
    setGameResult(null)
    setIsGamePopOutOpen(false)
    onExit()
    debugManager.logInfo("MatchmakingLobby", "Exiting game")
  }

  const exitWaitingRoom = () => {
    setGameState("lobby")
    setSelectedLobby(null)
    debugManager.logInfo("MatchmakingLobby", "Exited waiting room")
  }

  const startGame = () => {
    if (!selectedLobby || !selectedGameImpl) return
    setGameState("playing")
    debugManager.logInfo("MatchmakingLobby", "Starting game")
  }

  const handleClosePopOut = () => {
    if (window.confirm("Are you sure you want to exit the game? Your progress will be lost.")) {
      setIsGamePopOutOpen(false)
      handleGameEnd(null)
    }
  }

  const renderGameContent = () => {
    if (!selectedLobby || !selectedGameImpl) return null

    return (
      <div className="w-full h-full">
        <GameErrorBoundary>
          <GameContainer
            gameId={selectedLobby.gameType}
            playerId={publicKey}
            playerName={localPlayerName}
            isHost={selectedLobby.host === publicKey}
            gameMode={selectedLobby.mode}
            onGameEnd={handleGameEnd}
          />
        </GameErrorBoundary>
      </div>
    )
  }

  if (gameState === "results" && gameResult) {
    const { winner, reward, token } = gameResult
    return isCyberpunk ? (
      <CyberModeCard>
        <CardHeader>
          <CardTitle className="text-center font-mono text-[#0ff]">GAME OVER</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {winner === publicKey ? (
            <>
              <div className="text-4xl font-bold font-mono text-[#0ff]">YOU WIN!</div>
              <div className="flex items-center justify-center gap-2 text-2xl text-[#0ff]">
                <Image
                  src={token.logoURI || "/placeholder.svg"}
                  alt={token.symbol}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="font-mono">
                  +{reward.toFixed(token.symbol === "SOL" ? 4 : 2)} {token.symbol}
                </span>
              </div>
            </>
          ) : (
            <div className="text-4xl font-bold font-mono text-[#f0f]">YOU LOSE!</div>
          )}
        </CardContent>
        <CardFooter>
          <CyberModeButton className="w-full" onClick={exitGame}>
            RETURN TO LOBBY
          </CyberModeButton>
        </CardFooter>
      </CyberModeCard>
    ) : (
      <Card className="bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle className="text-center font-mono">GAME OVER</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {winner === publicKey ? (
            <>
              <div className="text-4xl font-bold font-mono text-green-600">YOU WIN!</div>
              <div className="flex items-center justify-center gap-2 text-2xl">
                <Image src={token.logoURI || "/placeholder.svg"} alt={token.symbol} width={32} height={32} />
                <span className="font-mono">
                  +{reward.toFixed(token.symbol === "SOL" ? 4 : 2)} {token.symbol}
                </span>
              </div>
            </>
          ) : (
            <div className="text-4xl font-bold font-mono text-red-600">YOU LOSE!</div>
          )}
        </CardContent>
        <CardFooter>
          <SoundButton
            className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
            onClick={exitGame}
          >
            RETURN TO LOBBY
          </SoundButton>
        </CardFooter>
      </Card>
    )
  }

  if (gameState === "waiting" && selectedLobby) {
    return (
      <WaitingRoom
        lobbyId={selectedLobby.id}
        hostId={selectedLobby.host}
        hostName={selectedLobby.hostName}
        publicKey={publicKey}
        playerName={localPlayerName}
        maxPlayers={selectedLobby.maxPlayers}
        wager={selectedLobby.wager}
        wagerToken={selectedLobby.wagerToken}
        gameMode={selectedLobby.modeName}
        onExit={exitWaitingRoom}
        onGameStart={startGame}
      />
    )
  }

  const allGames = gameRegistry.getGamesByType("pvp")
  const filteredLobbies = selectedGameImpl
    ? lobbies.filter((lobby) => lobby.gameType === selectedGameImpl.config.id)
    : []

  return (
    <>
      <GamePopOutContainer
        isOpen={isGamePopOutOpen}
        onClose={handleClosePopOut}
        title={selectedGameImpl?.config.name || "MUTABLE GAME"}
      >
        {renderGameContent()}
      </GamePopOutContainer>

      {isCyberpunk ? (
        <CyberModeCard>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-[#0ff]" />
                <CardTitle className="font-mono text-[#0ff]">PVP ARENA</CardTitle>
              </div>
              <SoundButton
                variant="outline"
                className="!border-pink-500/50 !text-pink-400 hover:!bg-pink-900/30"
                onClick={onExit}
              >
                Back
              </SoundButton>
            </div>
            <CardDescription className="text-[#0ff]/70">Battle other players and win tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label className="font-mono mb-2 block text-[#0ff]">SELECT GAME</Label>
              <div className="flex flex-wrap gap-2">
                {allGames.map((game) => (
                  <CyberModeBadge
                    key={game.config.id}
                    variant={selectedGameImpl?.config.id === game.config.id ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedGameImpl?.config.id === game.config.id ? "bg-[#0ff]/20" : "hover:bg-[#0ff]/10"
                    }`}
                    onClick={() => setSelectedGameImpl(game)}
                  >
                    <div className="flex items-center gap-1">
                      <span className="mr-1">{game.config.icon}</span>
                      {game.config.name}
                    </div>
                  </CyberModeBadge>
                ))}
              </div>
            </div>

            <CyberModeTabs defaultValue="browse" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="cyber-tab-list mb-4">
                <TabsTrigger value="browse" className="cyber-tab" onClick={withClickSound()}>
                  BROWSE GAMES
                </TabsTrigger>
                <TabsTrigger value="create" className="cyber-tab" onClick={withClickSound()}>
                  CREATE GAME
                </TabsTrigger>
              </TabsList>

              <TabsContent value="browse" className="space-y-4">
                {filteredLobbies.length > 0 ? (
                  <div className="space-y-3">
                    {filteredLobbies.map((lobby) => {
                      const gameImpl = gameRegistry.getGame(lobby.gameType)
                      const gameMode = gameImpl?.config.modes.find((m) => m.id === lobby.mode)

                      return (
                        <div
                          key={lobby.id}
                          className="flex items-center justify-between p-3 border border-[#0ff]/30 rounded-md bg-[#0a0a24]/80 hover:bg-[#0a0a24] hover:border-[#0ff]/60 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-[#0a0a24] p-2 rounded-md border border-[#0ff]/50 text-[#0ff]">
                              {gameMode?.icon || gameImpl?.config.icon || <Gamepad2 className="h-5 w-5" />}
                            </div>
                            <div>
                              <div className="font-bold font-mono flex items-center gap-2 text-[#0ff]">
                                {gameMode?.name || "Unknown"}
                                <CyberModeBadge variant="outline" className="font-normal text-xs">
                                  {lobby.status === "in-progress"
                                    ? "IN PROGRESS"
                                    : lobby.players + "/" + lobby.maxPlayers}
                                </CyberModeBadge>
                              </div>
                              <div className="text-sm text-[#0ff]/70">Host: {lobby.hostName}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-sm font-medium text-[#0ff]/80">Wager</div>
                              <div className="font-mono flex items-center justify-center gap-1 text-[#0ff]">
                                <Image
                                  src={lobby.wagerToken.logoURI || "/placeholder.svg"}
                                  alt={lobby.wagerToken.symbol}
                                  width={12}
                                  height={12}
                                />
                                <span>{lobby.wager}</span>
                              </div>
                            </div>
                            <CyberModeButton
                              disabled={lobby.status !== "waiting" || lobby.host === publicKey}
                              onClick={() => joinLobby(lobby)}
                            >
                              {lobby.status === "in-progress"
                                ? "IN PROGRESS"
                                : lobby.status === "full"
                                  ? "FULL"
                                  : lobby.host === publicKey
                                    ? "YOUR GAME"
                                    : "JOIN"}
                            </CyberModeButton>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#0ff]/70">
                    <Gamepad2 className="h-12 w-12 mx-auto mb-2 opacity-20 text-[#0ff]" />
                    <p className="font-mono text-[#0ff]">NO ACTIVE GAMES</p>
                    <p className="text-sm mt-2 text-[#0ff]/70">Create a new game to start playing</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="create" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="playerName" className="font-mono text-[#0ff]">
                      YOUR NAME
                    </Label>
                    <CyberModeInput
                      id="playerName"
                      value={localPlayerName}
                      onChange={(e) => setLocalPlayerName(e.target.value)}
                      maxLength={15}
                    />
                  </div>

                  {selectedGameImpl && (
                    <>
                      <div>
                        <Label className="font-mono text-[#0ff]">GAME MODE</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          {selectedGameImpl.config.modes.map((mode) => (
                            <div
                              key={mode.id}
                              className={`p-3 border rounded-md cursor-pointer transition-colors ${
                                selectedMode === mode.id
                                  ? "border-[#0ff]/60 bg-[#0a0a24]"
                                  : "border-[#0ff]/30 bg-[#0a0a24]/80 hover:border-[#0ff]/60"
                              }`}
                              onClick={withClickSound(() => setSelectedMode(mode.id))}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className="bg-[#0a0a24] p-1 rounded-md border border-[#0ff]/50 text-[#0ff]">
                                  {mode.icon}
                                </div>
                                <div className="font-bold font-mono text-[#0ff]">{mode.name}</div>
                              </div>
                              <p className="text-sm text-[#0ff]/70">{mode.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="wagerAmount" className="font-mono text-[#0ff]">
                      WAGER AMOUNT
                    </Label>
                    <div className="flex items-center gap-2">
                      <CyberModeInput
                        id="wagerAmount"
                        type="number"
                        min={1}
                        max={getTokenBalance(selectedToken)}
                        value={wagerAmount}
                        onChange={(e) => setWagerAmount(Number(e.target.value))}
                      />
                      <Select
                        value={selectedToken.symbol}
                        onValueChange={(value) => {
                          const token = SUPPORTED_TOKENS.find((t) => t.symbol === value)
                          if (token) onTokenChange(token)
                        }}
                      >
                        <SelectTrigger className="w-[120px] cyber-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="cyber-select-content">
                          {SUPPORTED_TOKENS.map((token) => (
                            <SelectItem key={token.symbol} value={token.symbol}>
                              <div className="flex items-center gap-2">
                                <Image
                                  src={token.logoURI || "/placeholder.svg"}
                                  alt={token.symbol}
                                  width={16}
                                  height={16}
                                />
                                {token.symbol}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-sm text-[#0ff]/70 mt-1">
                      Your balance: {getTokenBalance(selectedToken).toFixed(selectedToken.symbol === "SOL" ? 4 : 2)}{" "}
                      {selectedToken.symbol}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </CyberModeTabs>
          </CardContent>
          <CardFooter>
            {activeTab === "create" ? (
              <CyberModeButton
                className="w-full"
                disabled={
                  !selectedMode || !selectedGameImpl || wagerAmount <= 0 || wagerAmount > getTokenBalance(selectedToken)
                }
                onClick={createLobby}
              >
                CREATE GAME
              </CyberModeButton>
            ) : (
              <CyberModeButton className="w-full" onClick={() => setActiveTab("create")}>
                CREATE NEW GAME
              </CyberModeButton>
            )}
          </CardFooter>
        </CyberModeCard>
      ) : (
        <Card className="bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5" />
                <CardTitle className="font-mono">PVP ARENA</CardTitle>
              </div>
              <SoundButton variant="outline" className="border-2 border-black" onClick={onExit}>
                Back
              </SoundButton>
            </div>
            <CardDescription>Battle other players and win tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label className="font-mono mb-2 block">SELECT GAME</Label>
              <div className="flex flex-wrap gap-2">
                {allGames.map((game) => (
                  <Badge
                    key={game.config.id}
                    variant={selectedGameImpl?.config.id === game.config.id ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedGameImpl?.config.id === game.config.id ? "bg-[#FFD54F] text-black" : "hover:bg-gray-100"
                    } border-2 border-black`}
                    onClick={() => setSelectedGameImpl(game)}
                  >
                    <div className="flex items-center gap-1">
                      <span className="mr-1">{game.config.icon}</span>
                      {game.config.name}
                    </div>
                  </Badge>
                ))}
              </div>
            </div>

            <Tabs defaultValue="browse" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 border-2 border-black bg-[#FFD54F]">
                <TabsTrigger
                  value="browse"
                  className="data-[state=active]:bg-white data-[state=active]:text-black font-mono"
                  onClick={withClickSound()}
                >
                  BROWSE GAMES
                </TabsTrigger>
                <TabsTrigger
                  value="create"
                  className="data-[state=active]:bg-white data-[state=active]:text-black font-mono"
                  onClick={withClickSound()}
                >
                  CREATE GAME
                </TabsTrigger>
              </TabsList>

              <TabsContent value="browse" className="space-y-4">
                {filteredLobbies.length > 0 ? (
                  <div className="space-y-3">
                    {filteredLobbies.map((lobby) => {
                      const gameImpl = gameRegistry.getGame(lobby.gameType)
                      const gameMode = gameImpl?.config.modes.find((m) => m.id === lobby.mode)

                      return (
                        <div
                          key={lobby.id}
                          className="flex items-center justify-between p-3 border-2 border-black rounded-md bg-[#f5efdc] hover:bg-[#f0e9d2] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-[#FFD54F] p-2 rounded-md border-2 border-black">
                              {gameMode?.icon || gameImpl?.config.icon || <Gamepad2 className="h-5 w-5" />}
                            </div>
                            <div>
                              <div className="font-bold font-mono flex items-center gap-2">
                                {gameMode?.name || "Unknown"}
                                <Badge variant="outline" className="bg-gray-100 text-gray-700 font-normal text-xs">
                                  {lobby.status === "in-progress"
                                    ? "IN PROGRESS"
                                    : lobby.players + "/" + lobby.maxPlayers}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">Host: {lobby.hostName}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-sm font-medium">Wager</div>
                              <div className="font-mono flex items-center justify-center gap-1">
                                <Image
                                  src={lobby.wagerToken.logoURI || "/placeholder.svg"}
                                  alt={lobby.wagerToken.symbol}
                                  width={12}
                                  height={12}
                                />
                                <span>{lobby.wager}</span>
                              </div>
                            </div>
                            <SoundButton
                              className="bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
                              disabled={lobby.status !== "waiting" || lobby.host === publicKey}
                              onClick={() => joinLobby(lobby)}
                            >
                              {lobby.status === "in-progress"
                                ? "IN PROGRESS"
                                : lobby.status === "full"
                                  ? "FULL"
                                  : lobby.host === publicKey
                                    ? "YOUR GAME"
                                    : "JOIN"}
                            </SoundButton>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Gamepad2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p className="font-mono">NO ACTIVE GAMES</p>
                    <p className="text-sm mt-2">Create a new game to start playing</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="create" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="playerName" className="font-mono">
                      YOUR NAME
                    </Label>
                    <Input
                      id="playerName"
                      value={localPlayerName}
                      onChange={(e) => setLocalPlayerName(e.target.value)}
                      className="border-2 border-black"
                      maxLength={15}
                    />
                  </div>

                  {selectedGameImpl && (
                    <>
                      <div>
                        <Label className="font-mono">GAME MODE</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          {selectedGameImpl.config.modes.map((mode) => (
                            <div
                              key={mode.id}
                              className={`p-3 border-2 rounded-md cursor-pointer transition-colors ${
                                selectedMode === mode.id
                                  ? "border-black bg-[#FFD54F]"
                                  : "border-gray-300 bg-[#f5efdc] hover:border-black"
                              }`}
                              onClick={withClickSound(() => setSelectedMode(mode.id))}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className="bg-white p-1 rounded-md border border-black">{mode.icon}</div>
                                <div className="font-bold font-mono">{mode.name}</div>
                              </div>
                              <p className="text-sm text-muted-foreground">{mode.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="wagerAmount" className="font-mono">
                      WAGER AMOUNT
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="wagerAmount"
                        type="number"
                        min={1}
                        max={getTokenBalance(selectedToken)}
                        value={wagerAmount}
                        onChange={(e) => setWagerAmount(Number(e.target.value))}
                        className="border-2 border-black"
                      />
                      <Select
                        value={selectedToken.symbol}
                        onValueChange={(value) => {
                          const token = SUPPORTED_TOKENS.find((t) => t.symbol === value)
                          if (token) onTokenChange(token)
                        }}
                      >
                        <SelectTrigger className="w-[120px] border-2 border-black">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_TOKENS.map((token) => (
                            <SelectItem key={token.symbol} value={token.symbol}>
                              <div className="flex items-center gap-2">
                                <Image
                                  src={token.logoURI || "/placeholder.svg"}
                                  alt={token.symbol}
                                  width={16}
                                  height={16}
                                />
                                {token.symbol}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your balance: {getTokenBalance(selectedToken).toFixed(selectedToken.symbol === "SOL" ? 4 : 2)}{" "}
                      {selectedToken.symbol}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            {activeTab === "create" ? (
              <SoundButton
                className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
                disabled={
                  !selectedMode || !selectedGameImpl || wagerAmount <= 0 || wagerAmount > getTokenBalance(selectedToken)
                }
                onClick={createLobby}
              >
                CREATE GAME
              </SoundButton>
            ) : (
              <SoundButton
                className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
                onClick={() => setActiveTab("create")}
              >
                CREATE NEW GAME
              </SoundButton>
            )}
          </CardFooter>
        </Card>
      )}
    </>
  )
}
