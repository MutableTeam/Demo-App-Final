import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function POST(request: NextRequest) {
  console.log("[v0] Registration API called - starting processing")

  try {
    console.log("[v0] Attempting to parse request body...")

    let body
    try {
      body = await request.json()
      console.log("[v0] Request body parsed successfully")
    } catch (parseError) {
      console.error("[v0] Failed to parse request body:", parseError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    console.log("[v0] Request body received:", {
      email: body.email,
      name: body.name,
      hasPassword: !!body.password,
    })

    const { email, name, password, ...additionalData } = body

    // Validate required fields
    if (!email || !name || !password) {
      console.log("[v0] Missing required fields:", { email: !!email, name: !!name, password: !!password })
      return NextResponse.json({ error: "Email, name, and password are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("[v0] Invalid email format:", email)
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 8) {
      console.log("[v0] Password too short:", password.length)
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    console.log("[v0] Validation passed, creating user...")

    let user
    try {
      user = await AuthService.createUser({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        password,
        additionalData,
      })
      console.log("[v0] User created successfully:", { id: user.id, email: user.email })
    } catch (createError) {
      console.error("[v0] User creation failed:", createError)
      throw createError // Re-throw to be handled by outer catch
    }

    let token
    try {
      token = AuthService.generateToken(user)
      console.log("[v0] Token generated successfully")
    } catch (tokenError) {
      console.error("[v0] Token generation failed:", tokenError)
      throw tokenError // Re-throw to be handled by outer catch
    }

    // Return user data (without sensitive info)
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.created_at,
        },
        token,
      },
      { status: 201 },
    )

    // Set HTTP-only cookie for token
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    console.log("[v0] Registration completed successfully")
    return response
  } catch (error) {
    console.error("[v0] Registration error details:", error)

    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)

      if (error.message.includes("already exists")) {
        return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
      }

      return NextResponse.json(
        {
          error: "Registration failed. Please try again.",
          debug: process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 })
  }
}
