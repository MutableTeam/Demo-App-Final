// Basic player type
export interface Player {
  id: string
  name: string
  position: { x: number; y: number }
  color: string
  health: number
  score: number
  isActive: boolean
}

// Game state interface
export interface GameState {
  players: Record<string, Player>
  projectiles: any[]
  powerUps: any[]
  gameTime: number
  isGameOver: boolean
  winner: string | null
}

// Create a new player
export function createPlayer(id: string, name: string, position: { x: number; y: number }, color: string): Player {
  return {
    id,
    name,
    position,
    color,
    health: 100,
    score: 0,
    isActive: true,
  }
}

// Create initial game state
export function createInitialGameState(): GameState {
  return {
    players: {},
    projectiles: [],
    powerUps: [],
    gameTime: 0,
    isGameOver: false,
    winner: null,
  }
}

// Update game state (would be more complex in a real implementation)
export function updateGameState(state: GameState, deltaTime: number): GameState {
  // Update game time
  const updatedState = {
    ...state,
    gameTime: state.gameTime + deltaTime,
  }

  // Check for game over conditions
  const activePlayers = Object.values(updatedState.players).filter((player) => player.isActive)

  if (activePlayers.length <= 1 && Object.keys(updatedState.players).length > 1) {
    updatedState.isGameOver = true
    updatedState.winner = activePlayers.length === 1 ? activePlayers[0].id : null
  }

  return updatedState
}

// Handle player input
export function handlePlayerInput(state: GameState, playerId: string, input: any): GameState {
  const player = state.players[playerId]
  if (!player || !player.isActive) return state

  // Clone the state to avoid mutations
  const newState = { ...state }
  const updatedPlayer = { ...player }

  // Update player position based on input
  if (input.movement) {
    updatedPlayer.position = {
      x: updatedPlayer.position.x + input.movement.x,
      y: updatedPlayer.position.y + input.movement.y,
    }
  }

  // Add projectile if player is shooting
  if (input.shooting) {
    // In a real implementation, this would create a projectile
  }

  // Update the player in the state
  newState.players = {
    ...newState.players,
    [playerId]: updatedPlayer,
  }

  return newState
}
