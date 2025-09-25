import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const username = request.cookies.get("chat-username")?.value

    if (!username) {
      return NextResponse.json({ error: "No username set" }, { status: 401 })
    }

    // Create a simple user object from the username
    const user = {
      id: `user_${username}_${Date.now()}`,
      name: username,
      username: username,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Get user profile error:", error)
    return NextResponse.json({ error: "Failed to get user profile" }, { status: 500 })
  }
}
