"use client"

import type React from "react"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import { cn } from "@/lib/utils"
import { Facebook, Instagram } from "lucide-react"

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

interface CyberpunkFooterProps {
  className?: string
  socialLinks?: Array<{ label: string; href: string; icon?: React.ReactNode }>
}

export function CyberpunkFooter({
  className,
  socialLinks = [
    { label: "X", href: "https://x.com/mutablepvp", icon: <XLogo size={18} /> },
    { label: "Telegram", href: "https://t.me/OfficialMutablePvP", icon: <TelegramLogo size={18} /> },
    { label: "Facebook", href: "https://facebook.com/mutablepvp", icon: <Facebook size={18} /> },
    { label: "Instagram", href: "https://instagram.com/mutablepvp", icon: <Instagram size={18} /> },
  ],
}: CyberpunkFooterProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 flex justify-center items-center p-4 z-40", className)}>
      <div className="flex gap-4 items-center">
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
    </div>
  )
}
