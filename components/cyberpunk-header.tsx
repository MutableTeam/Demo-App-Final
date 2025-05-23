"use client"

import type React from "react"
import { StyleSwitcher } from "./style-switcher"
import { ThemeToggle } from "./theme-toggle"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import Image from "next/image"
import { CyberGlowText, CyberBadge } from "./cyberpunk-components"
import { cn } from "@/lib/utils"

const scanline = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
`

const CyberHeaderContainer = styled.header`
  background: linear-gradient(180deg, rgba(16, 16, 48, 0.9) 0%, rgba(10, 10, 36, 0.8) 100%);
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  position: relative;
  z-index: 10;
  backdrop-filter: blur(10px);
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
    animation: ${scanline} 8s linear infinite;
    z-index: 1;
    opacity: 0.3;
  }
`

const LogoGlow = styled(Image)`
  filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.7));
`

interface CyberpunkHeaderProps {
  className?: string
  showStyleSwitcher?: boolean
  showThemeToggle?: boolean
  logo?: React.ReactNode
  title?: string
  actions?: React.ReactNode
}

export function CyberpunkHeader({
  className,
  showStyleSwitcher = true,
  showThemeToggle = true,
  logo,
  title = "MUTABLE PLATFORM",
  actions,
}: CyberpunkHeaderProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  if (!isCyberpunk) {
    return (
      <header
        className={cn("flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-md", className)}
      >
        <div className="flex items-center gap-4">
          {logo || (
            <Image
              src="/images/mutable-logo-transparent.png"
              alt="Mutable Logo"
              width={120}
              height={60}
              className="h-8 w-auto"
            />
          )}
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {showStyleSwitcher && <StyleSwitcher size="sm" />}
          {showThemeToggle && <ThemeToggle />}
        </div>
      </header>
    )
  }

  return (
    <CyberHeaderContainer className={cn("flex items-center justify-between p-4", className)}>
      <div className="flex items-center gap-4">
        {logo || (
          <LogoGlow
            src="/images/mutable-logo-transparent.png"
            alt="Mutable Logo"
            width={120}
            height={60}
            className="h-8 w-auto"
          />
        )}
        <CyberGlowText className="text-xl font-bold">{title}</CyberGlowText>
        <CyberBadge>BETA</CyberBadge>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {showStyleSwitcher && <StyleSwitcher size="sm" />}
        {showThemeToggle && <ThemeToggle />}
      </div>
    </CyberHeaderContainer>
  )
}
