import { Target, Users } from "lucide-react"
import { gameRegistry } from "@/types/game-registry"
import GameComponent from "./game-component"
import Instructions from "./instructions"
import { debugManager } from "@/utils/debug-utils"

// Game configuration
const topDownShooterConfig = {
  id: "top-down-shooter",
  name: "Archer Arena",
  description: "A fast-paced top-down archery battle game",
  image: "/images/archer-arena-card.jpg",
  icon: <Target className="h-5 w-5" />,
  status: "live",
  minWager: 1,
  maxPlayers: 4,
  minPlayers: 2,
  gameType: "action",
  gameCategory: "PvP", // Add this line
  modes: [
    {
      id: "duel",
      name: "1v1 Duel",
      description: "Face off against another player in a one-on-one battle. One life only!",
      players: 2,
      icon: <Target className="h-4 w-4" />,
      minWager: 1,
    },
    {
      id: "ffa",
      name: "Free-For-All",
      description: "You against 3 other players in an all-out battle royale",
      players: 4,
      icon: <Users className="h-4 w-4" />,
      minWager: 2,
    },
  ],
}

// Helper function to create a player
const createPlayer = (id, name, position, color) => {
  return {
    id,
    name,
    position: { ...position }, // Create a new object to avoid reference issues
    velocity: { x: 0, y: 0 },
    rotation: 0,
    size: 24,
    health: 100,
    lives: 3, // Default lives
    color,
    type: "player",
    score: 0,
    kills: 0,
    deaths: 0,
    cooldown: 0,
    dashCooldown: 0,
    isDashing: false,
    dashDirection: null,
    isDrawingBow: false,
    drawStartTime: null,
    maxDrawTime: 1.5,
    isChargingSpecial: false,
    specialChargeStartTime: null,
    specialAttackCooldown: 0,
    specialAttackReady: false,
    animationState: "idle",
    lastAnimationChange: Date.now(),
    hitAnimationTimer: 0,
    respawnTimer: 0,
    lastDamageFrom: null,
    controls: {
      up: false,
      down: false,
      left: false,
      right: false,
      shoot: false,
      dash: false,
      special: false,
    },
  }
}

// Helper function to generate walls (obstacles) for a given arena size
const generateWalls = (width: number, height: number) => {
  const walls = []

  // The player is kept in bounds by the game engine, so these "walls" are just obstacles.
  // Let's create a more interesting layout for a 16:9 aspect ratio.

  // Central obstacle
  walls.push({
    id: "obstacle-center",
    position: { x: width / 2, y: height / 2 },
    size: 60,
  })

  // Four pillars
  walls.push({
    id: "obstacle-tl",
    position: { x: width * 0.25, y: height * 0.25 },
    size: 40,
  })
  walls.push({
    id: "obstacle-tr",
    position: { x: width * 0.75, y: height * 0.25 },
    size: 40,
  })
  walls.push({
    id: "obstacle-bl",
    position: { x: width * 0.25, y: height * 0.75 },
    size: 40,
  })
  walls.push({
    id: "obstacle-br",
    position: { x: width * 0.75, y: height * 0.75 },
    size: 40,
  })

  // Side obstacles
  walls.push({
    id: "obstacle-left",
    position: { x: 80, y: height / 2 },
    size: 30,
  })
  walls.push({
    id: "obstacle-right",
    position: { x: width - 80, y: height / 2 },
    size: 30,
  })

  return walls.map((wall) => ({
    ...wall,
    velocity: { x: 0, y: 0 },
    rotation: 0,
    health: Number.POSITIVE_INFINITY,
    color: "#555555",
    type: "wall",
  }))
}

// Initialize game state based on parameters
const initializeGameState = (params) => {
  const { playerId, playerName, isHost, gameMode, players } = params

  debugManager.logInfo("GAME_INIT", `Initializing game state for mode: ${gameMode}`, {
    playerId,
    playerName,
    isHost,
    playerCount: players.length,
  })

  // New arena size for landscape mobile (16:9 aspect ratio)
  const arenaWidth = 1280
  const arenaHeight = 720

  // Create initial game state
  const initialState = {
    players: {},
    arrows: [],
    walls: generateWalls(arenaWidth, arenaHeight),
    pickups: [],
    arenaSize: { width: arenaWidth, height: arenaHeight },
    gameTime: 0,
    maxGameTime: 180, // 3 minutes
    isGameOver: false,
    winner: null,
    gameMode: gameMode, // Store the game mode in the state
  }

  // Calculate dynamic spawn positions with padding
  const spawnPadding = 150
  const positions = [
    { x: spawnPadding, y: spawnPadding }, // Top-left
    { x: arenaWidth - spawnPadding, y: arenaHeight - spawnPadding }, // Bottom-right
    { x: arenaWidth - spawnPadding, y: spawnPadding }, // Top-right
    { x: spawnPadding, y: arenaHeight - spawnPadding }, // Bottom-left
  ]

  // Assign different colors to players
  const colors = ["#FF5252", "#4CAF50", "#2196F3", "#FFC107"]

  // Set lives based on game mode
  const lives = gameMode === "duel" ? 1 : 3
  debugManager.logInfo("GAME_INIT", `Setting lives to ${lives} for mode: ${gameMode}`)

  // Add the local player first
  initialState.players[playerId] = createPlayer(playerId, playerName, positions[0], colors[0])
  initialState.players[playerId].lives = lives

  // Get real players (excluding the local player)
  const realPlayers = players.filter((p) => p.id !== playerId)
  debugManager.logInfo("GAME_INIT", `Real players count: ${realPlayers.length}`)

  // Handle different game modes
  if (gameMode === "duel") {
    // DUEL MODE: Only one opponent (either real or AI)
    debugManager.logInfo("GAME_INIT", "Setting up DUEL mode with one opponent")

    if (realPlayers.length > 0) {
      // Use the first real player as the opponent
      const opponent = realPlayers[0]
      initialState.players[opponent.id] = createPlayer(
        opponent.id,
        opponent.name,
        positions[1], // Position opposite to player
        colors[1],
      )
      initialState.players[opponent.id].lives = lives
      debugManager.logInfo("GAME_INIT", `Added real opponent: ${opponent.name}`)
    } else {
      // Add a single AI opponent
      const aiId = "ai-opponent"
      initialState.players[aiId] = createPlayer(
        aiId,
        "AI Opponent",
        positions[1], // Position opposite to player
        colors[1],
      )
      initialState.players[aiId].lives = lives
      debugManager.logInfo("GAME_INIT", "Added AI opponent for duel mode")
    }
  } else {
    // FREE-FOR-ALL MODE: Up to 3 opponents (mix of real and AI)
    debugManager.logInfo("GAME_INIT", "Setting up FREE-FOR-ALL mode")

    // Add real players first (up to 3)
    let playerIndex = 1
    realPlayers.forEach((player, index) => {
      if (playerIndex <= 3) {
        // Limit to 3 opponents
        initialState.players[player.id] = createPlayer(
          player.id,
          player.name,
          positions[playerIndex],
          colors[playerIndex],
        )
        initialState.players[player.id].lives = lives
        playerIndex++
        debugManager.logInfo("GAME_INIT", `Added real player: ${player.name}`)
      }
    })

    // Fill remaining slots with AI players (up to total of 4 players including local player)
    const aiCount = 4 - playerIndex
    debugManager.logInfo("GAME_INIT", `Adding ${aiCount} AI players to fill slots`)

    for (let i = 0; i < aiCount; i++) {
      const aiId = `ai-${i + 1}`
      initialState.players[aiId] = createPlayer(aiId, `AI ${i + 1}`, positions[playerIndex], colors[playerIndex])
      initialState.players[aiId].lives = lives
      playerIndex++
    }
  }

  // Log the final player count
  const finalPlayerCount = Object.keys(initialState.players).length
  debugManager.logInfo("GAME_INIT", `Final player count: ${finalPlayerCount}`, {
    players: Object.keys(initialState.players).map((id) => ({
      id,
      name: initialState.players[id].name,
      lives: initialState.players[id].lives,
    })),
  })

  return initialState
}

// Register the game with the registry
const TopDownShooterGame = {
  GameComponent,
  InstructionsComponent: Instructions,
  config: topDownShooterConfig,
  initializeGameState,
}

// Register the game
gameRegistry.registerGame(TopDownShooterGame)

export default TopDownShooterGame
