import { Entity } from "../lib/entity"

export interface HighScoreData {
  user_id?: string
  game_type: string
  score: number
  games_played?: number
  games_won?: number
  player_name?: string
  wave?: number
  play_duration?: number
}

export class HighScore extends Entity<HighScoreData> {
  static entityName = "neon_auth.game_stats"

  constructor(data: HighScoreData) {
    super(data)
  }

  static async create(data: HighScoreData): Promise<HighScore> {
    const entity = new HighScore({
      user_id: data.user_id || "anonymous",
      game_type: data.game_type || "galactic-vanguard",
      score: data.score,
      games_played: data.games_played || 1,
      games_won: data.games_won || 0,
      player_name: data.player_name,
      wave: data.wave,
      play_duration: data.play_duration,
    })
    await entity.save()
    return entity
  }

  static async getTopScores(gameType = "galactic-vanguard", limit = 10): Promise<HighScore[]> {
    const { sql } = await import("../lib/db")

    const results = await sql`
      SELECT * FROM neon_auth.game_stats 
      WHERE game_type = ${gameType}
      ORDER BY score DESC 
      LIMIT ${limit}
    `

    return results.map((row: any) => new HighScore(row))
  }

  get user_id(): string | undefined {
    return this.data.user_id
  }

  get game_type(): string {
    return this.data.game_type
  }

  get score(): number {
    return this.data.score
  }

  get games_played(): number | undefined {
    return this.data.games_played
  }

  get games_won(): number | undefined {
    return this.data.games_won
  }

  get player_name(): string | undefined {
    return this.data.player_name
  }

  get wave(): number | undefined {
    return this.data.wave
  }

  get play_duration(): number | undefined {
    return this.data.play_duration
  }
}
