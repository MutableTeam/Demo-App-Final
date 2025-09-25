import { NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/middleware"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// GET /api/chat/users - Get online users
async function getOnlineUsers(req: AuthenticatedRequest) {
  try {
    if (!req.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get users who have been active in the last 5 minutes
    const onlineUsers = await sql`
      SELECT 
        user_id,
        username,
        last_seen
      FROM chat_user_status
      WHERE is_online = TRUE 
        AND last_seen > NOW() - INTERVAL '5 minutes'
      ORDER BY last_seen DESC
    `

    return NextResponse.json({
      success: true,
      users: onlineUsers,
      count: onlineUsers.length,
    })
  } catch (error) {
    console.error("Get online users error:", error)
    return NextResponse.json({ error: "Failed to fetch online users" }, { status: 500 })
  }
}

// POST /api/chat/users/status - Update user online status
async function updateUserStatus(req: AuthenticatedRequest) {
  try {
    if (!req.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await req.json()
    const { isOnline } = body

    await sql`
      INSERT INTO chat_user_status (user_id, username, is_online, last_seen)
      VALUES (${req.user.userId}, ${req.user.name || req.user.email}, ${isOnline}, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        username = EXCLUDED.username,
        is_online = ${isOnline},
        last_seen = NOW(),
        updated_at = NOW()
    `

    return NextResponse.json({
      success: true,
      status: isOnline ? "online" : "offline",
    })
  } catch (error) {
    console.error("Update user status error:", error)
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}

export const GET = withAuth(getOnlineUsers)
export const POST = withAuth(updateUserStatus)
