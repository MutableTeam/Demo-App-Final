"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  console.log("[v0] ChatWindow render - messages count:", messages.length)

  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      })
      console.log("[v0] Scrolled to bottom, scrollHeight:", container.scrollHeight)
    }
  }

  const handleScroll = () => {
    if (!messagesContainerRef.current) return

    const container = messagesContainerRef.current
    const { scrollTop, scrollHeight, clientHeight } = container
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50

    console.log("[v0] Scroll event:", { scrollTop, scrollHeight, clientHeight, isNearBottom })

    setIsAtBottom(isNearBottom)
    setShowScrollButton(!isNearBottom && messages.length > 0)

    // Load more messages when scrolled to top
    if (scrollTop < 100 && hasMoreMessages && !isLoading) {
      console.log("[v0] Loading more messages...")
      loadMoreMessages()
    }
  }

  // Auto-scroll to bottom for new messages if user is at bottom
  useEffect(() => {
    if (isAtBottom && messages.length > 0) {
      console.log("[v0] Auto-scrolling to bottom for new messages")
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => scrollToBottom(false), 50)
    }
  }, [messages.length, isAtBottom])

  // Initial scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      console.log("[v0] Initial scroll to bottom")
      setTimeout(() => scrollToBottom(false), 100)
    }
  }, [messages.length > 0])

  const typingUsersText =
    typingUsers.length > 0
      ? typingUsers.length === 1
        ? `${typingUsers[0]} is typing...`
        : `${typingUsers.slice(0, 2).join(", ")}${typingUsers.length > 2 ? ` and ${typingUsers.length - 2} others` : ""} are typing...`
      : ""

  return (
    <div className={cn("flex h-full chat-container rounded-lg overflow-hidden", className)}>
      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Messages area - COMPLETELY REDESIGNED */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={messagesContainerRef}
            className="absolute inset-0 overflow-y-auto overscroll-contain"
            onScroll={handleScroll}
            style={{
              WebkitOverflowScrolling: "touch",
              scrollBehavior: "smooth",
            }}
          >
            <div className="p-2 space-y-1 min-h-full flex flex-col">
              {/* Load more button */}
              {hasMoreMessages && (
                <div className="text-center py-2 flex-shrink-0">
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

              {/* Messages */}
              <div className="flex-1">
                {messages.length === 0 && !isLoading ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="space-y-1">
                    {messages.map((message) => (
                      <ChatMessageComponent
                        key={message.id}
                        message={message}
                        isOwn={message.user_id === currentUserId}
                      />
                    ))}
                  </div>
                )}

                {/* Typing indicator */}
                {typingUsersText && (
                  <div className="px-4 py-2 text-xs chat-typing-indicator italic">{typingUsersText}</div>
                )}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            </div>
          </div>

          {/* Scroll to bottom button */}
          {showScrollButton && (
            <Button
              onClick={() => scrollToBottom(true)}
              size="sm"
              className="absolute bottom-4 right-4 rounded-full w-8 h-8 p-0 bg-chat-accent hover:bg-chat-accent/90 z-10"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Input area */}
        <div className="flex-shrink-0">
          <ChatInput
            onSendMessage={sendMessage}
            onTyping={sendTyping}
            disabled={!isConnected}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
          />
        </div>
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
