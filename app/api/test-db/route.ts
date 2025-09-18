import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    console.log("[v0] Testing database connection...")

    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      console.log("[v0] DATABASE_URL not found")
      return NextResponse.json(
        {
          error: "DATABASE_URL environment variable not found",
          success: false,
        },
        { status: 500 },
      )
    }

    console.log("[v0] DATABASE_URL exists, creating connection...")
    const sql = neon(process.env.DATABASE_URL)

    // Test basic connection
    console.log("[v0] Testing basic query...")
    const result = await sql`SELECT NOW() as current_time`
    console.log("[v0] Basic query successful:", result)

    // Check if users_sync table exists
    console.log("[v0] Checking users_sync table...")
    const tableCheck = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users_sync'
      ORDER BY ordinal_position;
    `
    console.log("[v0] users_sync table structure:", tableCheck)

    return NextResponse.json({
      success: true,
      currentTime: result[0].current_time,
      usersTableColumns: tableCheck,
      message: "Database connection successful",
    })
  } catch (error) {
    console.error("[v0] Database test error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown database error",
        success: false,
      },
      { status: 500 },
    )
  }
}
