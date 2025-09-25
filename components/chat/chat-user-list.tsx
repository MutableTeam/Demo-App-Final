"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatUser } from "@/services/chat-websocket-service"

interface ChatUserListProps {
  users: ChatUser[]
  className?: string
}

export function ChatUserList({ users, className }: ChatUserListProps) {
  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase()
  }

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return "now"
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center gap-2 p-4 border-b border-chat-border">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Online Users</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {users.length}
        </Badge>
      </div>

      <ScrollArea className="flex-1 chat-scroll-area">
        <div className="p-2 space-y-1">
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No users online</div>
          ) : (
            users.map((user) => (
              <div
                key={user.user_id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-chat-surface/50 transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-chat-surface text-xs font-medium">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 chat-online-indicator rounded-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{user.username}</div>
                  <div className="text-xs text-muted-foreground">{formatLastSeen(user.last_seen)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
