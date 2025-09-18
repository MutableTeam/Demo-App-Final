import { NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/middleware"
import { AuthService } from "@/lib/auth"

async function handler(req: AuthenticatedRequest) {
  try {
    if (!req.user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    // Get fresh user data from database
    const user = await AuthService.getUserById(req.user.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user statistics
    const stats = await AuthService.getUserStats(user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      stats,
    })
  } catch (error) {
    console.error("Get user profile error:", error)
    return NextResponse.json({ error: "Failed to get user profile" }, { status: 500 })
  }
}

export const GET = withAuth(handler)
