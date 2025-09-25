import { WebSocketService } from "./websocket-service"

export interface ChatMessage {
  id: number
  user_id: string
  username: string
  message: string
  created_at: string
  updated_at: string
}

export interface ChatUser {
  user_id: string
  username: string
  last_seen: string
}

export interface ChatEvents {
  "chat:message": ChatMessage
  "chat:user_joined": ChatUser
  "chat:user_left": ChatUser
  "chat:users_online": { users: ChatUser[]; count: number }
  "chat:typing": { user_id: string; username: string; isTyping: boolean }
}

export class ChatWebSocketService extends WebSocketService {
  private typingTimeout: NodeJS.Timeout | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null
  private currentUser: { userId: string; username: string } | null = null

  constructor(url: string) {
    super(url)
    this.setupChatHandlers()
  }

  private setupChatHandlers() {
    // Set up heartbeat to maintain connection and update online status
    this.on("connected", () => {
      this.startHeartbeat()
    })

    this.on("disconnected", () => {
      this.stopHeartbeat()
    })
  }

  // Initialize chat with user authentication
  async initializeChat(authToken: string, user: { userId: string; username: string }) {
    this.currentUser = user

    try {
      await this.connect()

      // Send authentication and join chat
      this.send("chat:join", {
        token: authToken,
        user: user,
      })

      return true
    } catch (error) {
      console.error("Failed to initialize chat:", error)
      return false
    }
  }

  // Send a chat message
  sendMessage(message: string) {
    if (!this.currentUser) {
      console.error("User not authenticated")
      return
    }

    this.send("chat:send_message", {
      message: message.trim(),
      user: this.currentUser,
    })
  }

  // Handle typing indicators
  sendTyping(isTyping: boolean) {
    if (!this.currentUser) return

    // Clear existing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout)
      this.typingTimeout = null
    }

    this.send("chat:typing", {
      user: this.currentUser,
      isTyping,
    })

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      this.typingTimeout = setTimeout(() => {
        this.sendTyping(false)
      }, 3000)
    }
  }

  // Request online users list
  requestOnlineUsers() {
    this.send("chat:get_online_users", {})
  }

  // Set up event listeners for chat events
  onMessage(callback: (message: ChatMessage) => void) {
    this.on("chat:message", callback)
    return () => this.off("chat:message")
  }

  onUserJoined(callback: (user: ChatUser) => void) {
    this.on("chat:user_joined", callback)
    return () => this.off("chat:user_joined")
  }

  onUserLeft(callback: (user: ChatUser) => void) {
    this.on("chat:user_left", callback)
    return () => this.off("chat:user_left")
  }

  onUsersOnline(callback: (data: { users: ChatUser[]; count: number }) => void) {
    this.on("chat:users_online", callback)
    return () => this.off("chat:users_online")
  }

  onTyping(callback: (data: { user_id: string; username: string; isTyping: boolean }) => void) {
    this.on("chat:typing", callback)
    return () => this.off("chat:typing")
  }

  // Heartbeat to maintain connection and online status
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.currentUser) {
        this.send("chat:heartbeat", {
          user: this.currentUser,
        })
      }
    }, 30000) // Send heartbeat every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // Clean disconnect
  disconnect() {
    this.stopHeartbeat()

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout)
      this.typingTimeout = null
    }

    if (this.currentUser) {
      this.send("chat:leave", {
        user: this.currentUser,
      })
    }

    super.disconnect()
    this.currentUser = null
  }
}

// Singleton instance for global chat
let chatServiceInstance: ChatWebSocketService | null = null

export function getChatService(): ChatWebSocketService {
  if (!chatServiceInstance) {
    const wsUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "ws://localhost:8080"
    chatServiceInstance = new ChatWebSocketService(wsUrl)
  }
  return chatServiceInstance
}

export function resetChatService() {
  if (chatServiceInstance) {
    chatServiceInstance.disconnect()
    chatServiceInstance = null
  }
}
