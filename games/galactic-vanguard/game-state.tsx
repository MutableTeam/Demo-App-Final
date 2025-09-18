export interface GalacticVanguardGameState {
  playerId: string
  playerName: string
  gameMode: string
  gameStatus: "pending" | "active" | "completed"
  score: number
  wave: number
  lives: number
  startTime: number
  endTime?: number
}

export function createInitialGalacticVanguardState(
  playerId: string,
  playerName: string,
  gameMode: string,
): GalacticVanguardGameState {
  return {
    playerId,
    playerName,
    gameMode,
    gameStatus: "pending",
    score: 0,
    wave: 1,
    lives: 3,
    startTime: Date.now(),
  }
}
