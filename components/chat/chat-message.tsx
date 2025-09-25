"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/services/chat-websocket-service"

interface ChatMessageProps {
  message: ChatMessage
  isOwn?: boolean
  className?: string
}

export function ChatMessageComponent({ message, isOwn = false, className }: ChatMessageProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase()
  }

  return (
    <div className={cn("chat-message group flex gap-3 px-4 py-3 rounded-lg", isOwn && "flex-row-reverse", className)}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="bg-chat-surface text-xs font-medium">{getInitials(message.username)}</AvatarFallback>
      </Avatar>

      <div className={cn("flex flex-col gap-1 min-w-0", isOwn && "items-end")}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{message.username}</span>
          <span>{formatTime(message.created_at)}</span>
        </div>

        <div
          className={cn(
            "rounded-lg px-3 py-2 text-sm break-words max-w-xs sm:max-w-md",
            isOwn ? "bg-chat-accent text-chat-accent-foreground ml-auto" : "bg-chat-surface text-foreground",
          )}
        >
          {message.message}
        </div>
      </div>
    </div>
  )
}
