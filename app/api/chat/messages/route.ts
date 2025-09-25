import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// GET /api/chat/messages - Fetch recent chat messages
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100)
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const after = searchParams.get("after")

    console.log("[v0] GET messages - limit:", limit, "offset:", offset, "after:", after)

    let messages
    if (after) {
      // Poll for new messages after a specific ID
      messages = await sql`
        SELECT 
          cm.id,
          cm.user_id,
          cm.username,
          cm.message,
          cm.created_at,
          cm.updated_at
        FROM chat_messages cm
        WHERE cm.is_deleted = FALSE AND cm.id > ${Number.parseInt(after)}
        ORDER BY cm.created_at ASC
        LIMIT ${limit}
      `
    } else {
      // Regular message loading
      messages = await sql`
        SELECT 
          cm.id,
          cm.user_id,
          cm.username,
          cm.message,
          cm.created_at,
          cm.updated_at
        FROM chat_messages cm
        WHERE cm.is_deleted = FALSE
        ORDER BY cm.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `

      // Reverse to show oldest first for regular loading
      messages = messages.reverse()
    }

    console.log("[v0] GET messages - found:", messages.length, "messages")

    return NextResponse.json({
      success: true,
      messages,
      hasMore: messages.length === limit,
    })
  } catch (error) {
    console.error("[v0] Get chat messages error:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

// POST /api/chat/messages - Send a new chat message
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message, userId, username } = body

    console.log("[v0] POST message - received:", message)

    if (!userId || !username) {
      console.log("[v0] POST message - missing userId or username")
      return NextResponse.json({ error: "User ID and username are required" }, { status: 400 })
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      console.log("[v0] POST message - invalid message")
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    if (message.length > 1000) {
      console.log("[v0] POST message - message too long")
      return NextResponse.json({ error: "Message too long (max 1000 characters)" }, { status: 400 })
    }

    const trimmedMessage = message.trim()

    console.log("[v0] POST message - inserting into database")

    try {
      await sql`
        INSERT INTO chat_user_status (user_id, username, is_online, last_seen)
        VALUES (${userId}, ${username}, TRUE, NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          username = EXCLUDED.username,
          is_online = TRUE,
          last_seen = NOW(),
          updated_at = NOW()
      `
      console.log("[v0] POST message - updated user status")
    } catch (userStatusError) {
      console.log("[v0] POST message - user status update failed (continuing anyway):", userStatusError.message)
      // Continue with message insertion even if user status update fails
    }

    try {
      const [newMessage] = await sql`
        INSERT INTO chat_messages (user_id, username, message)
        VALUES (${userId}, ${username}, ${trimmedMessage})
        RETURNING id, user_id, username, message, created_at, updated_at
      `

      console.log("[v0] POST message - inserted message:", newMessage)

      return NextResponse.json({
        success: true,
        message: newMessage,
      })
    } catch (messageError) {
      console.log("[v0] POST message - message insertion failed:", messageError.message)

      // If foreign key constraint error, provide helpful message
      if (messageError.message.includes("foreign key constraint")) {
        console.log("[v0] POST message - foreign key constraint detected, run the SQL script to fix database schema")
        return NextResponse.json(
          {
            error: "Database schema needs to be updated. Please run the SQL script to remove foreign key constraints.",
          },
          { status: 500 },
        )
      }

      throw messageError
    }
  } catch (error) {
    console.error("[v0] Post chat message error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
