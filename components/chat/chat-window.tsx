"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatMessageComponent } from "./chat-message"
import { ChatInput } from "./chat-input"
import { ChatUserList } from "./chat-user-list"
import { useChatContext } from "@/contexts/chat-context"

interface ChatWindowProps {
  currentUserId?: string
  showUserList?: boolean
  className?: string
}

export function ChatWindow({ currentUserId, showUserList = true, className }: ChatWindowProps) {
  const {
    messages,
    onlineUsers,
    isConnected,
    isLoading,
    typingUsers,
    sendMessage,
    sendTyping,
    loadMoreMessages,
    hasMoreMessages,
  } = useChatContext()

  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

    setIsAtBottom(isNearBottom)
    setShowScrollButton(!isNearBottom && messages.length > 0)

    // Load more messages when scrolled to top
    if (scrollTop === 0 && hasMoreMessages && !isLoading) {
      loadMoreMessages()
    }
  }

  // Auto-scroll to bottom for new messages if user is at bottom
  useEffect(() => {
    if (isAtBottom && messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, isAtBottom])

  const typingUsersText =
    typingUsers.length > 0
      ? typingUsers.length === 1
        ? `${typingUsers[0]} is typing...`
        : `${typingUsers.slice(0, 2).join(", ")}${typingUsers.length > 2 ? ` and ${typingUsers.length - 2} others` : ""} are typing...`
      : ""

  return (
    <div className={cn("flex h-full chat-container rounded-lg overflow-hidden", className)}>
      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-chat-border">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-chat-online" : "bg-destructive")} />
            <span className="font-medium text-sm">Global Chat</span>
            {onlineUsers.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {onlineUsers.length} online
              </Badge>
            )}
          </div>

          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {/* Messages area */}
        <div className="flex-1 relative">
          <ScrollArea ref={scrollAreaRef} className="h-full chat-scroll-area" onScrollCapture={handleScroll}>
            <div className="p-2 space-y-1">
              {hasMoreMessages && (
                <div className="text-center py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadMoreMessages}
                    disabled={isLoading}
                    className="text-xs text-muted-foreground"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Loading...
                      </>
                    ) : (
                      "Load more messages"
                    )}
                  </Button>
                </div>
              )}

              {messages.length === 0 && !isLoading ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessageComponent key={message.id} message={message} isOwn={message.user_id === currentUserId} />
                ))
              )}

              {/* Typing indicator */}
              {typingUsersText && (
                <div className="px-4 py-2 text-xs chat-typing-indicator italic">{typingUsersText}</div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Scroll to bottom button */}
          {showScrollButton && (
            <Button
              onClick={scrollToBottom}
              size="sm"
              className="absolute bottom-4 right-4 rounded-full w-8 h-8 p-0 bg-chat-accent hover:bg-chat-accent/90"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Input area */}
        <ChatInput
          onSendMessage={sendMessage}
          onTyping={sendTyping}
          disabled={!isConnected}
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
        />
      </div>

      {/* User list sidebar */}
      {showUserList && (
        <>
          <Separator orientation="vertical" className="bg-chat-border" />
          <div className="w-64 flex-shrink-0">
            <ChatUserList users={onlineUsers} />
          </div>
        </>
      )}
    </div>
  )
}
