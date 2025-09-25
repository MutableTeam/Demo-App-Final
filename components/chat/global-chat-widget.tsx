"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageCircle, X, Minimize2, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatWindow } from "./chat-window"
import { useChatContext } from "@/contexts/chat-context"
import { useGlobalUsername } from "@/contexts/global-username-context"

interface GlobalChatWidgetProps {
  className?: string
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  showUserList?: boolean
}

export function GlobalChatWidget({ className, position = "bottom-right", showUserList = true }: GlobalChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastMessageCount, setLastMessageCount] = useState(0)
  const [currentUser, setCurrentUser] = useState<{ userId: string; username: string } | null>(null)
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false)
  const [usernameInput, setUsernameInput] = useState("")
  const [isSettingUsername, setIsSettingUsername] = useState(false)

  const hasInitializedRef = useRef(false)
  const { username: globalUsername, setUsername: setGlobalUsername } = useGlobalUsername()

  const { messages, onlineUsers, isConnected, connect } = useChatContext()

  useEffect(() => {
    if (hasInitializedRef.current) return

    const initializeUser = async () => {
      if (globalUsername) {
        const user = {
          userId: `user_${globalUsername}`,
          username: globalUsername,
        }
        setCurrentUser(user)
        console.log("[v0] Chat widget: Using global username:", user)
        await connect("username-auth", user)
        return
      }

      console.log("[v0] Chat widget: No username found, user needs to set one")
    }

    hasInitializedRef.current = true
    initializeUser()
  }, [globalUsername, connect])

  useEffect(() => {
    const handleUsernameChange = (event: CustomEvent) => {
      const newUsername = event.detail.username
      if (newUsername && newUsername !== globalUsername) {
        const user = {
          userId: `user_${newUsername}`,
          username: newUsername,
        }
        setCurrentUser(user)
        connect("username-auth", user)
      }
    }

    window.addEventListener("usernameChanged", handleUsernameChange as EventListener)
    return () => {
      window.removeEventListener("usernameChanged", handleUsernameChange as EventListener)
    }
  }, [globalUsername, connect])

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usernameInput.trim() || isSettingUsername) return

    setIsSettingUsername(true)
    try {
      const username = usernameInput.trim()
      const user = {
        userId: `user_${username}`,
        username: username,
      }

      setGlobalUsername(username)
      setCurrentUser(user)
      setShowUsernamePrompt(false)
      setUsernameInput("")

      console.log("[v0] Chat widget: Username set:", user)
      await connect("username-auth", user)
    } catch (error) {
      console.error("[v0] Chat widget: Failed to set username:", error)
    } finally {
      setIsSettingUsername(false)
    }
  }

  const handleOpenChat = () => {
    if (!currentUser) {
      setShowUsernamePrompt(true)
    }
    setIsMinimized(false)
    setIsOpen(true)
  }

  useEffect(() => {
    if (messages.length > lastMessageCount && !isOpen) {
      const newMessages = messages.length - lastMessageCount
      setUnreadCount((prev) => prev + newMessages)
    }
    setLastMessageCount(messages.length)
  }, [messages.length, lastMessageCount, isOpen])

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
    }
  }, [isOpen])

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  }

  return (
    <>
      {/* Mobile Sheet */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              onClick={handleOpenChat}
              className={cn(
                "fixed z-50 rounded-full w-14 h-14 p-0 shadow-lg bg-chat-accent hover:bg-chat-accent/90 text-chat-accent-foreground",
                positionClasses[position],
                className,
              )}
            >
              <div className="relative">
                <MessageCircle className="h-6 w-6" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-destructive text-destructive-foreground">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
                {isConnected && onlineUsers.length > 0 && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 chat-online-indicator rounded-full" />
                )}
              </div>
            </Button>
          </SheetTrigger>

          <SheetContent side="bottom" className="h-[80vh] p-0">
            <SheetHeader className="p-4 border-b border-chat-border">
              <SheetTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Global Chat
                {onlineUsers.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {onlineUsers.length} online
                  </Badge>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="h-full">
              {showUsernamePrompt ? (
                <div className="flex items-center justify-center h-full p-6">
                  <div className="w-full max-w-sm space-y-4">
                    <div className="text-center">
                      <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">Join the Chat</h3>
                      <p className="text-sm text-muted-foreground">Choose a username to start chatting</p>
                    </div>
                    <form onSubmit={handleUsernameSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          placeholder="Enter your username"
                          disabled={isSettingUsername}
                          autoFocus
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={!usernameInput.trim() || isSettingUsername}>
                        {isSettingUsername ? "Joining..." : "Join Chat"}
                      </Button>
                    </form>
                  </div>
                </div>
              ) : currentUser ? (
                <ChatWindow currentUserId={currentUser.userId} showUserList={false} />
              ) : null}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Widget */}
      <div className="hidden md:block">
        {!isMinimized ? (
          <div
            className={cn(
              "fixed z-50 w-96 h-[500px] bg-background border border-chat-border rounded-lg shadow-2xl",
              positionClasses[position],
              className,
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-chat-border bg-chat-surface rounded-t-lg">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="font-medium text-sm">Global Chat</span>
                {onlineUsers.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {onlineUsers.length}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                  className="h-6 w-6 p-0 hover:bg-chat-border"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0 hover:bg-chat-border"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="h-[calc(100%-49px)]">
              {showUsernamePrompt ? (
                <div className="flex items-center justify-center h-full p-6">
                  <div className="w-full max-w-sm space-y-4">
                    <div className="text-center">
                      <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">Join the Chat</h3>
                      <p className="text-sm text-muted-foreground">Choose a username to start chatting</p>
                    </div>
                    <form onSubmit={handleUsernameSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="username-desktop">Username</Label>
                        <Input
                          id="username-desktop"
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          placeholder="Enter your username"
                          disabled={isSettingUsername}
                          autoFocus
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={!usernameInput.trim() || isSettingUsername}>
                        {isSettingUsername ? "Joining..." : "Join Chat"}
                      </Button>
                    </form>
                  </div>
                </div>
              ) : currentUser ? (
                <ChatWindow currentUserId={currentUser.userId} showUserList={showUserList} />
              ) : null}
            </div>
          </div>
        ) : (
          <Button
            onClick={() => {
              setIsMinimized(false)
              handleOpenChat()
            }}
            size="lg"
            className={cn(
              "fixed z-50 rounded-full w-14 h-14 p-0 shadow-lg bg-chat-accent hover:bg-chat-accent/90 text-chat-accent-foreground",
              positionClasses[position],
              className,
            )}
          >
            <div className="relative">
              <MessageCircle className="h-6 w-6" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-destructive text-destructive-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
              {isConnected && onlineUsers.length > 0 && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 chat-online-indicator rounded-full" />
              )}
            </div>
          </Button>
        )}
      </div>
    </>
  )
}
