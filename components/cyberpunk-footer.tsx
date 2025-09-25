"use client"

import type React from "react"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { MessageCircle, User, Volume2, VolumeX } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChatWindow } from "./chat/chat-window"
import { useChatContext } from "@/contexts/chat-context"
import { audioManager, initializeAudio, playRandomCoinSound } from "@/utils/audio-manager"

const scanline = keyframes`
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(-100%);
  }
`

const CyberFooterContainer = styled.footer`
  border-top: 1px solid rgba(0, 255, 255, 0.3);
  position: relative;
  z-index: 10;
  backdrop-filter: blur(10px);
  
  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
    animation: ${scanline} 8s linear infinite;
    z-index: 1;
    opacity: 0.3;
  }
`

const CyberLink = styled.a`
  color: #0ff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    color: #fff;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.9);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.3s ease;
  }
  
  &:hover::after {
    transform: scaleX(1);
  }
`

const XLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const TelegramLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
)

const InstagramLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.073-1.689-.073-4.948 0-3.204.013-3.583.072-4.948.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948 4.354-.2 6.782-2.618 6.979-6.98-.059-1.28-.073-1.689-.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const FacebookLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const DiscordLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z" />
  </svg>
)

interface CyberpunkFooterProps {
  className?: string
  socialLinks?: Array<{ label: string; href: string; icon?: React.ReactNode }>
  showChat?: boolean
}

export function CyberpunkFooter({
  className,
  socialLinks = [
    { label: "X", href: "https://x.com/mutablepvp", icon: <XLogo size={18} /> },
    { label: "Telegram", href: "https://t.me/officialmutablepvp", icon: <TelegramLogo size={18} /> },
    { label: "Discord", href: "https://discord.com/invite/p4NpUd3mH2", icon: <DiscordLogo size={18} /> },
  ],
  showChat = true,
}: CyberpunkFooterProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastMessageCount, setLastMessageCount] = useState(0)
  const [currentUser, setCurrentUser] = useState<{ userId: string; username: string } | null>(null)
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false)
  const [usernameInput, setUsernameInput] = useState("")
  const [isSettingUsername, setIsSettingUsername] = useState(false)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [isAudioInitialized, setIsAudioInitialized] = useState<boolean>(false)

  const { messages, onlineUsers, isConnected, connect } = useChatContext()

  useEffect(() => {
    if (!showChat) return

    const initializeUser = async () => {
      const existingUsername = getCookie("chat-username")
      if (existingUsername) {
        const user = {
          userId: `user_${existingUsername}`,
          username: existingUsername,
        }
        setCurrentUser(user)
        await connect("username-auth", user)
        return
      }
    }

    initializeUser()
  }, [showChat, connect])

  useEffect(() => {
    const init = async () => {
      await initializeAudio()
      setIsAudioInitialized(true)
      setIsMuted(audioManager.isSoundMuted())
    }
    init()
  }, [])

  const handleToggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    audioManager.setMuted(newMuted)

    if (!newMuted) {
      audioManager.resumeAudioContext()
      playRandomCoinSound()
    }
  }

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

      setCookie("chat-username", username)
      setCurrentUser(user)
      setShowUsernamePrompt(false)
      setUsernameInput("")

      await connect("username-auth", user)
    } catch (error) {
      console.error("Failed to set username:", error)
    } finally {
      setIsSettingUsername(false)
    }
  }

  const handleOpenChat = () => {
    if (!currentUser) {
      setShowUsernamePrompt(true)
    }
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

  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null
    return null
  }

  const setCookie = (name: string, value: string, days = 30) => {
    if (typeof document === "undefined") return
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-black/20 backdrop-blur-sm",
        className,
      )}
    >
      <div className="w-full grid grid-cols-3 items-center">
        {/* Left section - Mute button */}
        <div className="flex justify-start">
          <button
            onClick={handleToggleMute}
            className={cn(
              "p-1 flex items-center gap-2 transition-colors duration-200",
              isCyberpunk
                ? "text-cyan-400 hover:text-white hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.9)]"
                : "text-primary hover:text-primary/60",
            )}
            title={isMuted ? "Unmute" : "Mute"}
            aria-label={isMuted ? "Unmute" : "Mute"}
            disabled={!isAudioInitialized}
          >
            <span className="text-sm font-mono">
              <span className="hidden sm:inline">{isMuted ? "Unmute" : "Mute"}</span>
            </span>
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        {/* Center section - Social links */}
        <div className="flex items-center justify-center gap-3">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "p-1 flex items-center justify-center transition-colors duration-200",
                isCyberpunk
                  ? "text-cyan-400 hover:text-white hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.9)]"
                  : "text-primary hover:text-primary/60",
              )}
              title={social.label}
              aria-label={social.label}
            >
              {social.icon}
            </a>
          ))}
        </div>

        {/* Right section - Chat */}
        <div className="flex justify-end">
          {showChat && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button
                  onClick={handleOpenChat}
                  className={cn(
                    "p-1 flex items-center gap-2 transition-colors duration-200 relative",
                    isCyberpunk
                      ? "text-cyan-400 hover:text-white hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.9)]"
                      : "text-primary hover:text-primary/60",
                  )}
                  title="Global Chat"
                  aria-label="Open chat"
                >
                  <span className="text-sm font-mono">
                    <span className="hidden sm:inline">Global Chat</span>
                    <span className="sm:hidden">Chat</span>
                  </span>
                  <MessageCircle size={18} />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] bg-destructive text-destructive-foreground flex items-center justify-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                  {isConnected && onlineUsers.length > 0 && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full" />
                  )}
                </button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className={cn(
                  "p-0 flex flex-col",
                  "w-80 sm:w-80", // Desktop: 320px
                  "max-sm:w-[280px] max-sm:h-[400px]", // Mobile: 280px wide, 400px tall
                  "max-sm:fixed max-sm:bottom-16 max-sm:right-2 max-sm:top-auto max-sm:rounded-lg max-sm:border max-sm:shadow-lg",
                )}
              >
                <SheetHeader className="p-4 border-b border-chat-border flex-shrink-0">
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
                <div className="flex-1 flex flex-col min-h-0">
                  {showUsernamePrompt ? (
                    <div className="flex items-center justify-center flex-1 p-6">
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
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={!usernameInput.trim() || isSettingUsername}
                          >
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
          )}
        </div>
      </div>
    </div>
  )
}
