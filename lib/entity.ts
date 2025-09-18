export abstract class Entity<T extends Record<string, any>> {
  protected data: T
  protected id?: string
  static entityName: string

  constructor(data: T) {
    this.data = data
  }

  // Create table if it doesn't exist
  protected static async ensureTable(entityName: string, schema: Record<string, string>) {
    const { sql } = await import("./db")
    const columns = Object.entries(schema)
      .map(([key, type]) => `${key} ${type}`)
      .join(", ")

    await sql`
      CREATE TABLE IF NOT EXISTS ${sql(entityName.toLowerCase())} (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT NOW(),
        ${sql.unsafe(columns)}
      )
    `
  }

  // Save entity to database
  async save(): Promise<void> {
    const { sql } = await import("./db")
    const entityName = (this.constructor as typeof Entity).entityName

    // Handle game_stats table specifically
    if (entityName === "game_stats") {
      const data = this.data as any
      const result = await sql`
        INSERT INTO game_stats (user_id, game_type, score, games_played, games_won)
        VALUES (${data.user_id}, ${data.game_type}, ${data.score}, ${data.games_played}, ${data.games_won})
        RETURNING id
      `

      if (result[0]) {
        this.id = result[0].id
      }
      return
    }

    const keys = Object.keys(this.data)
    const values = Object.values(this.data)

    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ")
    const columns = keys.join(", ")

    const result = await sql`
      INSERT INTO ${sql(entityName.toLowerCase())} (${sql.unsafe(columns)})
      VALUES (${sql.unsafe(placeholders)})
      RETURNING id
    `.bind(...values)

    if (result[0]) {
      this.id = result[0].id
    }
  }

  // List entities with optional ordering and limit
  static async list<U extends Entity<any>>(
    this: new (
      data: any,
    ) => U,
    orderBy = "created_at DESC",
    limit?: number,
  ): Promise<U[]> {
    const { sql } = await import("./db")
    const entityName = (this as any).entityName.toLowerCase()

    let query = `SELECT * FROM ${entityName} ORDER BY ${orderBy}`
    if (limit) {
      query += ` LIMIT ${limit}`
    }

    const results = await sql.unsafe(query)
    return results.map((row: any) => new this(row))
  }

  // Find entity by ID
  static async findById<U extends Entity<any>>(this: new (data: any) => U, id: string | number): Promise<U | null> {
    const { sql } = await import("./db")
    const entityName = (this as any).entityName.toLowerCase()
    const results = await sql`SELECT * FROM ${sql(entityName)} WHERE id = ${id}`

    if (results.length === 0) {
      return null
    }

    return new this(results[0])
  }

  // Delete entity
  async delete(): Promise<void> {
    if (!this.id) {
      throw new Error("Cannot delete entity without ID")
    }

    const { sql } = await import("./db")
    const entityName = (this.constructor as typeof Entity).entityName.toLowerCase()
    await sql`DELETE FROM ${sql(entityName)} WHERE id = ${this.id}`
  }
}
