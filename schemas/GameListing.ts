import { Schema, type } from "@colyseus/schema"

export class GameListing extends Schema {
  @type("string") roomId: string
  @type("string") gameType: string
  @type("number") playerCount: number
  @type("number") maxPlayers: number
  @type("boolean") passwordProtected: boolean
  @type("string") lobbyName: string
  @type("string") status: string
}
