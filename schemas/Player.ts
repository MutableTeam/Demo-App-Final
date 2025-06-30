import { Schema, type } from "@colyseus/schema"

export class Player extends Schema {
  @type("string") id: string
  @type("string") name: string
  @type("boolean") ready = false
  @type("string") sessionId: string
  @type("string") characterType = "default"
}
