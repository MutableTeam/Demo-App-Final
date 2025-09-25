"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"

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

interface ChatContextType {
  messages: ChatMessage[]
  onlineUsers: ChatUser[]
  isConnected: boolean
  isLoading: boolean
  typingUsers: string[]
  sendMessage: (message: string) => Promise<void>
  sendTyping: (isTyping: boolean) => void
  connect: (authToken: string, user: { userId: string; username: string }) => Promise<boolean>
  disconnect: () => void
  loadMoreMessages: () => Promise<void>
  hasMoreMessages: boolean
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  onlineUsers: [],
  isConnected: false,
  isLoading: false,
  typingUsers: [],
  sendMessage: async () => {},
  sendTyping: () => {},
  connect: async () => false,
  disconnect: () => {},
  loadMoreMessages: async () => {},
  hasMoreMessages: false,
})

export const useChatContext = () => useContext(ChatContext)

interface ChatProviderProps {
  children: ReactNode
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [currentUser, setCurrentUser] = useState<{ userId: string; username: string } | null>(null)

  const [lastMessageId, setLastMessageId] = useState<number>(0)

  const isConnectingRef = useRef(false)
  const messagePollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const userPollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const loadMessages = useCallback(async (offset = 0, limit = 50) => {
    try {
      const response = await fetch(`/api/chat/messages?limit=${limit}&offset=${offset}`)

      if (response.ok) {
        const data = await response.json()
        return data.messages || []
      }
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
    return []
  }, [])

  const pollForNewMessages = useCallback(async () => {
    if (!isConnected || isConnectingRef.current) return

    try {
      const response = await fetch(`/api/chat/messages?limit=10&after=${lastMessageId}`)

      if (response.ok) {
        const data = await response.json()
        const newMessages = data.messages || []

        if (newMessages.length > 0) {
          setMessages((prev) => [...prev, ...newMessages])
          setLastMessageId(Math.max(...newMessages.map((m: ChatMessage) => m.id)))
        }
      }
    } catch (error) {
      console.error("Failed to poll for new messages:", error)
    }
  }, [isConnected, lastMessageId])

  const pollForOnlineUsers = useCallback(async () => {
    if (!isConnected || isConnectingRef.current) return

    try {
      const response = await fetch("/api/chat/users")

      if (response.ok) {
        const data = await response.json()
        setOnlineUsers(data.users || [])
      }
    } catch (error) {
      console.error("Failed to poll for online users:", error)
    }
  }, [isConnected])

  // Connect to chat
  const connect = useCallback(
    async (token: string, user: { userId: string; username: string }) => {
      if (isConnectingRef.current || isConnected) {
        console.log("[v0] Chat already connecting or connected, skipping")
        return true
      }

      console.log("[v0] Chat connecting with user:", user)
      isConnectingRef.current = true
      setIsLoading(true)
      setCurrentUser(user)

      try {
        // Load initial messages
        const initialMessages = await loadMessages(0, 50)
        setMessages(initialMessages)

        if (initialMessages.length > 0) {
          setLastMessageId(Math.max(...initialMessages.map((m: ChatMessage) => m.id)))
        }

        setIsConnected(true)
        console.log("[v0] Chat connected successfully")

        if (messagePollingIntervalRef.current) {
          clearInterval(messagePollingIntervalRef.current)
        }
        if (userPollingIntervalRef.current) {
          clearInterval(userPollingIntervalRef.current)
        }

        const msgInterval = setInterval(pollForNewMessages, 5000) // Poll every 5 seconds instead of 30
        const userInterval = setInterval(pollForOnlineUsers, 30000) // Poll every 30 seconds instead of 60

        messagePollingIntervalRef.current = msgInterval
        userPollingIntervalRef.current = userInterval

        // Initial poll for online users
        await pollForOnlineUsers()

        return true
      } catch (error) {
        console.error("Failed to connect to chat:", error)
        return false
      } finally {
        setIsLoading(false)
        isConnectingRef.current = false
      }
    },
    [loadMessages, pollForNewMessages, pollForOnlineUsers, isConnected],
  )

  const sendMessage = useCallback(
    async (message: string) => {
      if (!currentUser || !message.trim()) return

      try {
        console.log("[v0] Sending message:", message)
        const response = await fetch("/api/chat/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message.trim(),
            userId: currentUser.userId,
            username: currentUser.username,
          }),
        })

        if (response.ok) {
          console.log("[v0] Message sent successfully")
          setTimeout(pollForNewMessages, 100)
        } else {
          console.error("[v0] Failed to send message:", response.status)
        }
      } catch (error) {
        console.error("Failed to send message:", error)
      }
    },
    [currentUser, pollForNewMessages],
  )

  const sendTyping = useCallback((isTyping: boolean) => {
    console.log("[v0] Typing indicator:", isTyping)
  }, [])

  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || isLoading) return

    setIsLoading(true)
    try {
      const olderMessages = await loadMessages(messages.length, 50)
      if (olderMessages.length > 0) {
        setMessages((prev) => [...olderMessages, ...prev])
        setHasMoreMessages(olderMessages.length === 50)
      } else {
        setHasMoreMessages(false)
      }
    } finally {
      setIsLoading(false)
    }
  }, [hasMoreMessages, isLoading, loadMessages, messages.length])

  const disconnect = useCallback(() => {
    console.log("[v0] Chat disconnecting")

    if (messagePollingIntervalRef.current) {
      clearInterval(messagePollingIntervalRef.current)
      messagePollingIntervalRef.current = null
    }
    if (userPollingIntervalRef.current) {
      clearInterval(userPollingIntervalRef.current)
      userPollingIntervalRef.current = null
    }

    setIsConnected(false)
    setMessages([])
    setOnlineUsers([])
    setTypingUsers([])
    setCurrentUser(null)
    setLastMessageId(0)
    isConnectingRef.current = false
  }, []) // No dependencies to prevent infinite re-renders

  useEffect(() => {
    return () => {
      console.log("[v0] ChatProvider unmounting, cleaning up")
      if (messagePollingIntervalRef.current) {
        clearInterval(messagePollingIntervalRef.current)
      }
      if (userPollingIntervalRef.current) {
        clearInterval(userPollingIntervalRef.current)
      }
    }
  }, []) // Empty dependency array - only run on mount/unmount

  return (
    <ChatContext.Provider
      value={{
        messages,
        onlineUsers,
        isConnected,
        isLoading,
        typingUsers,
        sendMessage,
        sendTyping,
        connect,
        disconnect,
        loadMoreMessages,
        hasMoreMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
