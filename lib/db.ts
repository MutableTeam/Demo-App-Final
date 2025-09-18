import { neon } from "@neondatabase/serverless"

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL

if (!databaseUrl) {
  console.error(
    "Available env vars:",
    Object.keys(process.env).filter((key) => key.includes("DATABASE") || key.includes("POSTGRES")),
  )
  throw new Error(
    "No database URL found. Please check DATABASE_URL, POSTGRES_URL, or POSTGRES_PRISMA_URL environment variables.",
  )
}

// Create a reusable SQL client
export const sql = neon(databaseUrl)

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
