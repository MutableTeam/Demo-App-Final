"use client"

import type React from "react"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import Image from "next/image"
import { CyberGlowText } from "./cyberpunk-components"
import { cn } from "@/lib/utils"

const scanline = keyframes`
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(-100%);
  }
`

const CyberFooterContainer = styled.footer`
  background: linear-gradient(0deg, rgba(16, 16, 48, 0.9) 0%, rgba(10, 10, 36, 0.8) 100%);
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

interface CyberpunkFooterProps {
  className?: string
  logo?: React.ReactNode
  copyright?: string
  links?: Array<{ label: string; href: string }>
}

export function CyberpunkFooter({
  className,
  logo,
  copyright = "© 2023 Mutable Arcade",
  links = [
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Support", href: "#" },
  ],
}: CyberpunkFooterProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  const currentYear = new Date().getFullYear()
  const copyrightWithYear = copyright.replace(/\d{4}/, currentYear.toString())

  if (!isCyberpunk) {
    return (
      <footer
        className={cn(
          "flex flex-col md:flex-row justify-between items-center gap-4 p-4 border-t bg-background/80 backdrop-blur-md",
          className,
        )}
      >
        <div className="flex items-center gap-4">
          {logo || (
            <Image
              src="/images/mutable-logo-transparent.png"
              alt="Mutable Logo"
              width={80}
              height={40}
              className="h-6 w-auto"
            />
          )}
          <p className="text-sm text-muted-foreground">{copyrightWithYear}</p>
        </div>
        <div className="flex gap-4">
          {links.map((link) => (
            <a key={link.label} href={link.href} className="text-sm text-primary hover:text-primary/80 hover:underline">
              {link.label}
            </a>
          ))}
        </div>
      </footer>
    )
  }

  return (
    <CyberFooterContainer className={cn("flex flex-col md:flex-row justify-between items-center gap-4 p-4", className)}>
      <div className="flex items-center gap-4">
        {logo || (
          <Image
            src="/images/mutable-logo-transparent.png"
            alt="Mutable Logo"
            width={80}
            height={40}
            className="h-6 w-auto"
          />
        )}
        <CyberGlowText className="text-sm">{copyrightWithYear}</CyberGlowText>
      </div>
      <div className="flex gap-4">
        {links.map((link) => (
          <CyberLink key={link.label} href={link.href}>
            {link.label}
          </CyberLink>
        ))}
      </div>
    </CyberFooterContainer>
  )
}
