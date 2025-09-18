import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Create a reusable SQL client
export const sql = neon(process.env.DATABASE_URL)

// Database connection test function
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time`
    console.log("Database connected successfully:", result[0].current_time)
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

// Generic query helper with error handling
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  try {
    const result = await sql(query, ...params)
    return result as T[]
  } catch (error) {
    console.error("Query execution failed:", error)
    throw new Error(`Database query failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
