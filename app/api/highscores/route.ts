import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { player_name, score, wave, play_duration } = await request.json()

    const result = await sql`
      INSERT INTO neon_auth.game_stats (user_id, game_type, score, games_played, games_won, player_name, wave, play_duration)
      VALUES ('anonymous', 'galactic-vanguard', ${score}, 1, 0, ${player_name}, ${wave}, ${play_duration})
      RETURNING id
    `

    return NextResponse.json({ success: true, id: result[0]?.id })
  } catch (error) {
    console.error("Error saving high score:", error)
    return NextResponse.json({ error: "Failed to save high score" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const gameType = searchParams.get("gameType") || "galactic-vanguard"

    const results = await sql`
      SELECT * FROM neon_auth.game_stats 
      WHERE game_type = ${gameType}
      ORDER BY score DESC 
      LIMIT ${limit}
    `

    return NextResponse.json({ highScores: results })
  } catch (error) {
    console.error("Error fetching high scores:", error)
    return NextResponse.json({ error: "Failed to fetch high scores" }, { status: 500 })
  }
}
