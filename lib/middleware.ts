import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "./auth"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    name: string
  }
}

// Middleware to verify JWT tokens
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Get token from Authorization header or cookies
      const authHeader = req.headers.get("authorization")
      const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : req.cookies.get("auth-token")?.value

      if (!token) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }

      // Verify token
      const decoded = AuthService.verifyToken(token)
      if (!decoded) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
      }

      // Add user info to request
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name,
      }

      return handler(authenticatedReq)
    } catch (error) {
      console.error("Authentication middleware error:", error)
      return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
    }
  }
}

// Optional auth middleware (doesn't require authentication)
export function withOptionalAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get("authorization")
      const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : req.cookies.get("auth-token")?.value

      if (token) {
        const decoded = AuthService.verifyToken(token)
        if (decoded) {
          const authenticatedReq = req as AuthenticatedRequest
          authenticatedReq.user = {
            userId: decoded.userId,
            email: decoded.email,
            name: decoded.name,
          }
        }
      }

      return handler(req as AuthenticatedRequest)
    } catch (error) {
      console.error("Optional auth middleware error:", error)
      return handler(req as AuthenticatedRequest)
    }
  }
}
