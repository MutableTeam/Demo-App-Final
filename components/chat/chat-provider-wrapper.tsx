"use client"

import type React from "react"

import { ChatProvider } from "@/contexts/chat-context"
import { GlobalChatWidget } from "./global-chat-widget"

interface ChatProviderWrapperProps {
  children: React.ReactNode
  showGlobalChat?: boolean
  chatPosition?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  showUserList?: boolean
}

export function ChatProviderWrapper({
  children,
  showGlobalChat = false,
  chatPosition = "bottom-right",
  showUserList = true,
}: ChatProviderWrapperProps) {
  return (
    <ChatProvider>
      {children}
      {showGlobalChat && <GlobalChatWidget position={chatPosition} showUserList={showUserList} />}
    </ChatProvider>
  )
}
