import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username || typeof username !== "string" || username.trim().length === 0) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const cleanUsername = username.trim()

    // Create a simple user object
    const user = {
      id: `user_${cleanUsername}_${Date.now()}`,
      username: cleanUsername,
      createdAt: new Date().toISOString(),
    }

    // Set username cookie
    const response = NextResponse.json({
      success: true,
      user,
    })

    response.cookies.set("chat-username", cleanUsername, {
      httpOnly: false, // Allow client-side access for this simple system
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    return response
  } catch (error) {
    console.error("Username auth error:", error)
    return NextResponse.json({ error: "Failed to set username" }, { status: 500 })
  }
}
