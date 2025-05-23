"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// Mock services that don't require actual connections
class MockWebSocketService {
  connect() {
    return Promise.resolve()
  }

  disconnect() {
    // No-op
  }

  send(message: any) {
    console.log("Mock WebSocket send:", message)
    return Promise.resolve()
  }

  onMessage(callback: (data: any) => void) {
    // No-op, would register a callback in a real implementation
    return () => {} // Return cleanup function
  }
}

class MockGameApiService {
  async fetchGames() {
    return Promise.resolve([])
  }

  async joinGame(gameId: string, playerId: string) {
    return Promise.resolve({ success: true, roomId: `mock-room-${Date.now()}` })
  }

  async leaveGame(roomId: string, playerId: string) {
    return Promise.resolve({ success: true })
  }
}

interface GameContextType {
  websocketService: MockWebSocketService
  apiService: MockGameApiService
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

const GameContext = createContext<GameContextType>({
  websocketService: new MockWebSocketService(),
  apiService: new MockGameApiService(),
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
})

export const useGameContext = () => useContext(GameContext)

interface GameProviderProps {
  children: ReactNode
}

export function GameProvider({ children }: GameProviderProps) {
  const [websocketService] = useState<MockWebSocketService>(new MockWebSocketService())
  const [apiService] = useState<MockGameApiService>(new MockGameApiService())
  const [isConnected, setIsConnected] = useState(false)

  // No need for useEffect to initialize services since we're using mock services

  const connect = async () => {
    try {
      await websocketService.connect()
      setIsConnected(true)
      console.log("Mock WebSocket connected")
    } catch (error) {
      console.error("Failed to connect to mock game server:", error)
      setIsConnected(false)
    }
  }

  const disconnect = () => {
    websocketService.disconnect()
    setIsConnected(false)
    console.log("Mock WebSocket disconnected")
  }

  return (
    <GameContext.Provider
      value={{
        websocketService,
        apiService,
        isConnected,
        connect,
        disconnect,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}
