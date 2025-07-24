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
  image: "/images/archer-game.png",
  icon: <Target className="h-5 w-5" />,
  status: "live",
  minWager: 1,
  maxPlayers: 4,
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

// Helper function to generate walls
const generateWalls = () => {
  const walls = []
  const thickness = 20
  const width = 800
  const height = 600

  // Arena boundaries
  walls.push({
    id: "wall-top",
    position: { x: width / 2, y: thickness / 2 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    size: thickness,
    health: Number.POSITIVE_INFINITY,
    color: "#333333",
    type: "wall",
  })

  walls.push({
    id: "wall-bottom",
    position: { x: width / 2, y: height - thickness / 2 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    size: thickness,
    health: Number.POSITIVE_INFINITY,
    color: "#333333",
    type: "wall",
  })

  walls.push({
    id: "wall-left",
    position: { x: thickness / 2, y: height / 2 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    size: thickness,
    health: Number.POSITIVE_INFINITY,
    color: "#333333",
    type: "wall",
  })

  walls.push({
    id: "wall-right",
    position: { x: width - thickness / 2, y: height / 2 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    size: thickness,
    health: Number.POSITIVE_INFINITY,
    color: "#333333",
    type: "wall",
  })

  // Add some obstacles
  walls.push({
    id: "obstacle-1",
    position: { x: width / 2, y: height / 2 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    size: 40,
    health: Number.POSITIVE_INFINITY,
    color: "#555555",
    type: "wall",
  })

  walls.push({
    id: "obstacle-2",
    position: { x: width / 4, y: height / 4 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    size: 30,
    health: Number.POSITIVE_INFINITY,
    color: "#555555",
    type: "wall",
  })

  walls.push({
    id: "obstacle-3",
    position: { x: (width / 4) * 3, y: (height / 4) * 3 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    size: 30,
    health: Number.POSITIVE_INFINITY,
    color: "#555555",
    type: "wall",
  })

  return walls
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

  // Create initial game state
  const initialState = {
    players: {},
    arrows: [],
    walls: generateWalls(),
    pickups: [],
    arenaSize: { width: 800, height: 600 },
    gameTime: 0,
    maxGameTime: 180, // 3 minutes
    isGameOver: false,
    winner: null,
    gameMode: gameMode, // Store the game mode in the state
  }

  // Calculate spawn positions in different corners
  const positions = [
    { x: 100, y: 100 },
    { x: 700, y: 500 },
    { x: 700, y: 100 },
    { x: 100, y: 500 },
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
