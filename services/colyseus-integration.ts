import { Client, type Room } from "colyseus.js"

export interface ColyseusPlayer {
  id: string
  name: string
  isReady: boolean
  isHost?: boolean
}

export interface ColyseusLobbyOptions {
  gameMode: string
  wager: number
  maxPlayers: number
}

export class ColyseusIntegrationService {
  private client: Client | null = null
  private hubRoom: Room | null = null
  private lobbyRoom: Room | null = null
  private battleRoom: Room | null = null

  constructor(private serverUrl: string) {}

  async connect(): Promise<void> {
    if (this.client) {
      return // Already connected
    }

    this.client = new Client(this.serverUrl)
    console.log("Connected to Colyseus server:", this.serverUrl)
  }

  async joinHub(username: string): Promise<Room> {
    if (!this.client) {
      throw new Error("Not connected to server")
    }

    this.hubRoom = await this.client.joinOrCreate("hub", { username })
    console.log("Joined hub room:", this.hubRoom.id)
    return this.hubRoom
  }

  async createLobby(options: ColyseusLobbyOptions & { username: string }): Promise<Room> {
    if (!this.client) {
      throw new Error("Not connected to server")
    }

    this.lobbyRoom = await this.client.create("lobby", options)
    console.log("Created lobby room:", this.lobbyRoom.id)
    return this.lobbyRoom
  }

  async joinLobby(lobbyId: string, username: string): Promise<Room> {
    if (!this.client) {
      throw new Error("Not connected to server")
    }

    this.lobbyRoom = await this.client.joinById(lobbyId, { username })
    console.log("Joined lobby room:", this.lobbyRoom.id)
    return this.lobbyRoom
  }

  async toggleReady(ready: boolean): Promise<void> {
    if (!this.lobbyRoom) {
      throw new Error("Not in a lobby")
    }

    await this.lobbyRoom.send("ready", { ready })
    console.log("Toggled ready state:", ready)
  }

  async leaveLobby(): Promise<void> {
    if (this.lobbyRoom) {
      await this.lobbyRoom.leave()
      this.lobbyRoom = null
      console.log("Left lobby room")
    }
  }

  async leaveHub(): Promise<void> {
    if (this.hubRoom) {
      await this.hubRoom.leave()
      this.hubRoom = null
      console.log("Left hub room")
    }
  }

  async joinBattleRoom(options: any): Promise<Room> {
    if (!this.client) {
      throw new Error("Not connected to server")
    }

    this.battleRoom = await this.client.joinOrCreate("battle", options)
    console.log("Joined battle room:", this.battleRoom.id)
    return this.battleRoom
  }

  async leaveBattleRoom(): Promise<void> {
    if (this.battleRoom) {
      await this.battleRoom.leave()
      this.battleRoom = null
      console.log("Left battle room")
    }
  }

  async disconnect(): Promise<void> {
    // Leave all rooms first
    await this.leaveBattleRoom()
    await this.leaveLobby()
    await this.leaveHub()

    // Disconnect client
    if (this.client) {
      // Note: Colyseus client doesn't have a direct disconnect method
      // Rooms will automatically disconnect when they go out of scope
      this.client = null
      console.log("Disconnected from Colyseus server")
    }
  }

  // Getters for current room states
  get isConnected(): boolean {
    return this.client !== null
  }

  get isInHub(): boolean {
    return this.hubRoom !== null
  }

  get isInLobby(): boolean {
    return this.lobbyRoom !== null
  }

  get isInBattle(): boolean {
    return this.battleRoom !== null
  }

  get currentLobbyRoom(): Room | null {
    return this.lobbyRoom
  }

  get currentHubRoom(): Room | null {
    return this.hubRoom
  }

  get currentBattleRoom(): Room | null {
    return this.battleRoom
  }
}
