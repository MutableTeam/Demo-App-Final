import { sql } from "./db"
import { hash, compare } from "bcryptjs"
import { sign, verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const SALT_ROUNDS = 12

export interface User {
  id: string
  email: string
  name: string
  created_at: Date
  updated_at: Date
  deleted_at?: Date
  raw_json?: any
}

export interface CreateUserData {
  email: string
  name: string
  password: string
  additionalData?: any
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthToken {
  userId: string
  email: string
  name: string
  iat: number
  exp: number
}

// User management functions
export class AuthService {
  // Create a new user
  static async createUser(userData: CreateUserData): Promise<User> {
    const { email, name, password, additionalData } = userData

    // Check if user already exists
    const existingUser = await this.getUserByEmail(email)
    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    // Hash password
    const hashedPassword = await hash(password, SALT_ROUNDS)

    // Generate unique ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const rawJson = {
      ...additionalData,
      hashedPassword,
      loginAttempts: 0,
      lastLogin: null,
    }

    try {
      const result = await sql`
        INSERT INTO users_sync (id, email, name, raw_json, created_at, updated_at)
        VALUES (${userId}, ${email}, ${name}, ${JSON.stringify(rawJson)}, NOW(), NOW())
        RETURNING id, email, name, created_at, updated_at, raw_json
      `

      return result[0] as User
    } catch (error) {
      console.error("Failed to create user:", error)
      throw new Error("Failed to create user account")
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await sql`
        SELECT id, email, name, created_at, updated_at, deleted_at, raw_json
        FROM users_sync 
        WHERE email = ${email} AND deleted_at IS NULL
      `

      return (result[0] as User) || null
    } catch (error) {
      console.error("Failed to get user by email:", error)
      return null
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const result = await sql`
        SELECT id, email, name, created_at, updated_at, deleted_at, raw_json
        FROM users_sync 
        WHERE id = ${userId} AND deleted_at IS NULL
      `

      return (result[0] as User) || null
    } catch (error) {
      console.error("Failed to get user by ID:", error)
      return null
    }
  }

  // Authenticate user login
  static async authenticateUser(credentials: LoginCredentials): Promise<User | null> {
    const { email, password } = credentials

    try {
      const user = await this.getUserByEmail(email)
      if (!user || !user.raw_json?.hashedPassword) {
        return null
      }

      const isValidPassword = await compare(password, user.raw_json.hashedPassword)
      if (!isValidPassword) {
        // Increment login attempts
        await this.incrementLoginAttempts(user.id)
        return null
      }

      // Update last login
      await this.updateLastLogin(user.id)

      return user
    } catch (error) {
      console.error("Authentication failed:", error)
      return null
    }
  }

  // Generate JWT token
  static generateToken(user: User): string {
    const payload: Omit<AuthToken, "iat" | "exp"> = {
      userId: user.id,
      email: user.email,
      name: user.name,
    }

    return sign(payload, JWT_SECRET, {
      expiresIn: "7d",
      issuer: "archer-arena-app",
    })
  }

  // Verify JWT token
  static verifyToken(token: string): AuthToken | null {
    try {
      const decoded = verify(token, JWT_SECRET) as AuthToken
      return decoded
    } catch (error) {
      console.error("Token verification failed:", error)
      return null
    }
  }

  // Update user profile
  static async updateUser(userId: string, updates: Partial<Pick<User, "name" | "email">>): Promise<User | null> {
    try {
      const setClause = []
      const values = []

      if (updates.name) {
        setClause.push("name = $" + (values.length + 1))
        values.push(updates.name)
      }

      if (updates.email) {
        setClause.push("email = $" + (values.length + 1))
        values.push(updates.email)
      }

      if (setClause.length === 0) {
        throw new Error("No valid updates provided")
      }

      setClause.push("updated_at = NOW()")
      values.push(userId)

      const query = `
        UPDATE users_sync 
        SET ${setClause.join(", ")}
        WHERE id = $${values.length} AND deleted_at IS NULL
        RETURNING id, email, name, created_at, updated_at, raw_json
      `

      const result = await sql(query, ...values)
      return (result[0] as User) || null
    } catch (error) {
      console.error("Failed to update user:", error)
      throw new Error("Failed to update user profile")
    }
  }

  // Soft delete user
  static async deleteUser(userId: string): Promise<boolean> {
    try {
      await sql`
        UPDATE users_sync 
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE id = ${userId}
      `
      return true
    } catch (error) {
      console.error("Failed to delete user:", error)
      return false
    }
  }

  // Helper: Increment login attempts
  private static async incrementLoginAttempts(userId: string): Promise<void> {
    try {
      await sql`
        UPDATE users_sync 
        SET raw_json = jsonb_set(
          COALESCE(raw_json, '{}'), 
          '{loginAttempts}', 
          (COALESCE(raw_json->>'loginAttempts', '0')::int + 1)::text::jsonb
        ),
        updated_at = NOW()
        WHERE id = ${userId}
      `
    } catch (error) {
      console.error("Failed to increment login attempts:", error)
    }
  }

  // Helper: Update last login timestamp
  private static async updateLastLogin(userId: string): Promise<void> {
    try {
      await sql`
        UPDATE users_sync 
        SET raw_json = jsonb_set(
          COALESCE(raw_json, '{}'), 
          '{lastLogin}', 
          to_jsonb(NOW())
        ),
        updated_at = NOW()
        WHERE id = ${userId}
      `
    } catch (error) {
      console.error("Failed to update last login:", error)
    }
  }

  // Get user statistics
  static async getUserStats(userId: string): Promise<any> {
    try {
      const user = await this.getUserById(userId)
      if (!user) return null

      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        memberSince: user.created_at,
        lastLogin: user.raw_json?.lastLogin || null,
        loginAttempts: user.raw_json?.loginAttempts || 0,
      }
    } catch (error) {
      console.error("Failed to get user stats:", error)
      return null
    }
  }
}
