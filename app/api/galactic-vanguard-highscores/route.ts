import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { player_name, score, wave, play_duration } = await request.json()

    const result = await sql`
      INSERT INTO galactic_vanguard_highscores (player_name, score, wave, play_duration)
      VALUES (${player_name}, ${score}, ${wave}, ${play_duration})
      RETURNING id
    `

    console.log("[v0] Successfully saved high score:", { player_name, score, wave, play_duration })
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

    const results = await sql`
      SELECT player_name, score, wave, play_duration, created_at 
      FROM galactic_vanguard_highscores 
      ORDER BY score DESC 
      LIMIT ${limit}
    `

    return NextResponse.json({ highScores: results })
  } catch (error) {
    console.error("Error fetching high scores:", error)
    return NextResponse.json({ error: "Failed to fetch high scores" }, { status: 500 })
  }
}
