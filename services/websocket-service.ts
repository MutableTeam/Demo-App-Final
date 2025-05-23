export class WebSocketService {
  private socket: WebSocket | null = null
  private messageHandlers: Map<string, (data: any) => void> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: NodeJS.Timeout | null = null

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url)

        this.socket.onopen = () => {
          console.log("WebSocket connection established")
          this.reconnectAttempts = 0
          resolve()
        }

        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            const { type, data } = message

            const handler = this.messageHandlers.get(type)
            if (handler) {
              handler(data)
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error)
          }
        }

        this.socket.onerror = (error) => {
          console.error("WebSocket error:", error)
          reject(error)
        }

        this.socket.onclose = () => {
          console.log("WebSocket connection closed")
          this.attemptReconnect()
        }
      } catch (error) {
        console.error("Error connecting to WebSocket:", error)
        reject(error)
      }
    })
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

      console.log(
        `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      )

      this.reconnectTimeout = setTimeout(() => {
        this.connect().catch(() => {
          this.attemptReconnect()
        })
      }, delay)
    }
  }

  send(type: string, data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }))
    } else {
      console.error("WebSocket is not connected")
    }
  }

  on(type: string, handler: (data: any) => void): void {
    this.messageHandlers.set(type, handler)
  }

  off(type: string): void {
    this.messageHandlers.delete(type)
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }
}
