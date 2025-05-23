export interface GameProps {
  gameId: string
  playerId: string
  roomId: string
  onGameEnd: (score: number) => void
  onError: (error: Error) => void
}

export interface GameState {
  status: "waiting" | "playing" | "ended"
  score: number
  players: {
    id: string
    name: string
    score: number
  }[]
  timeRemaining?: number
}

export interface GameController {
  initialize: () => Promise<void>
  start: () => void
  pause: () => void
  resume: () => void
  end: () => void
  cleanup: () => void
  getState: () => GameState
}

export interface GameRenderProps {
  controller: GameController
  width: number
  height: number
}
