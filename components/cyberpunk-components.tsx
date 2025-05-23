"use client"

import type React from "react"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"

// Animations
const scanline = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
`

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.9), 0 0 20px rgba(0, 255, 255, 0.5), 0 0 30px rgba(0, 255, 255, 0.3);
  }
  50% {
    opacity: 0.8;
    text-shadow: 0 0 15px rgba(255, 0, 255, 0.9), 0 0 25px rgba(255, 0, 255, 0.5), 0 0 35px rgba(255, 0, 255, 0.3);
  }
`

const glitch = keyframes`
  0%, 100% { 
    transform: translate(0); 
    text-shadow: -2px 0 #0ff, 2px 0 #f0f;
  }
  25% { 
    transform: translate(-2px, 2px); 
    text-shadow: 2px 0 #0ff, -2px 0 #f0f;
  }
  50% { 
    transform: translate(2px, -2px); 
    text-shadow: 2px 0 #0ff, -2px 0 #f0f;
  }
  75% { 
    transform: translate(-2px, -2px); 
    text-shadow: -2px 0 #0ff, 2px 0 #f0f;
  }
`

const borderFlow = keyframes`
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 0%;
  }
`

// Styled Components
export const CyberContainer = styled.div`
  background: linear-gradient(135deg, rgba(16, 16, 48, 0.9) 0%, rgba(32, 16, 64, 0.9) 100%);
  border: 1px solid rgba(0, 255, 255, 0.3);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.2), inset 0 0 10px rgba(255, 0, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
      linear-gradient(0deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
    transform: perspective(500px) rotateX(60deg);
    transform-origin: center bottom;
    opacity: 0.3;
    z-index: 0;
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
    animation: ${scanline} 4s linear infinite;
    z-index: 1;
    opacity: 0.3;
  }
`

export const CyberHeading = styled.h2`
  color: #0ff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  font-family: monospace;
  font-weight: bold;
  font-size: 1.5rem;
  letter-spacing: 1px;
  margin-bottom: 1rem;
  position: relative;
  z-index: 2;
`

export const CyberText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-family: monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  position: relative;
  z-index: 2;
`

export const CyberGlowText = styled.span`
  color: #0ff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  font-family: monospace;
  animation: ${pulse} 3s infinite alternate;
`

export const CyberMagentaText = styled.span`
  color: #f0f;
  text-shadow: 0 0 5px rgba(255, 0, 255, 0.7);
  font-family: monospace;
`

export const CyberGlitchText = styled.span`
  color: #0ff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  font-family: monospace;
  position: relative;
  display: inline-block;
  
  &:hover {
    animation: ${glitch} 0.3s infinite;
  }
`

export const CyberDivider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
  margin: 1.5rem 0;
  position: relative;
  z-index: 2;
`

export const CyberBadge = styled.span`
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.2) 0%, rgba(255, 0, 255, 0.2) 100%);
  border: 1px solid rgba(0, 255, 255, 0.5);
  color: #0ff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  font-family: monospace;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: inline-block;
  position: relative;
  z-index: 2;
`

export const CyberPanel = styled.div`
  background: rgba(16, 16, 48, 0.7);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  position: relative;
  z-index: 2;
  
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
    bottom: -1px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.8), transparent);
  }
`

export const CyberBorder = styled.div`
  position: relative;
  padding: 1px;
  border-radius: 0.5rem;
  background: linear-gradient(90deg, #0ff, #f0f, #0ff);
  background-size: 200% 100%;
  animation: ${borderFlow} 3s linear infinite;
  
  & > * {
    border-radius: 0.4rem;
    background: rgba(16, 16, 48, 0.9);
    position: relative;
    z-index: 2;
  }
`

// React Components
interface CyberComponentProps {
  children: React.ReactNode
  className?: string
}

export function CyberBox({ children, className }: CyberComponentProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  if (!isCyberpunk) {
    return <div className={className}>{children}</div>
  }

  return <CyberContainer className={className}>{children}</CyberContainer>
}

export function CyberTitle({ children, className }: CyberComponentProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  if (!isCyberpunk) {
    return <h2 className={`text-2xl font-bold ${className}`}>{children}</h2>
  }

  return <CyberHeading className={className}>{children}</CyberHeading>
}

export function CyberParagraph({ children, className }: CyberComponentProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  if (!isCyberpunk) {
    return <p className={className}>{children}</p>
  }

  return <CyberText className={className}>{children}</CyberText>
}

export function CyberHighlight({ children, className }: CyberComponentProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  if (!isCyberpunk) {
    return <span className={`font-bold text-primary ${className}`}>{children}</span>
  }

  return <CyberGlowText className={className}>{children}</CyberGlowText>
}

export function CyberAccent({ children, className }: CyberComponentProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  if (!isCyberpunk) {
    return <span className={`font-bold text-secondary ${className}`}>{children}</span>
  }

  return <CyberMagentaText className={className}>{children}</CyberMagentaText>
}

export function CyberSeparator({ className }: { className?: string }) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  if (!isCyberpunk) {
    return <hr className={`my-6 border-t ${className}`} />
  }

  return <CyberDivider className={className} />
}

export function CyberTag({ children, className }: CyberComponentProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  if (!isCyberpunk) {
    return (
      <span
        className={`inline-block px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded ${className}`}
      >
        {children}
      </span>
    )
  }

  return <CyberBadge className={className}>{children}</CyberBadge>
}

export function CyberSection({ children, className }: CyberComponentProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  if (!isCyberpunk) {
    return <div className={`p-4 bg-muted rounded-lg ${className}`}>{children}</div>
  }

  return <CyberPanel className={className}>{children}</CyberPanel>
}

export function CyberWrapper({ children, className }: CyberComponentProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  if (!isCyberpunk) {
    return <div className={`border rounded-lg p-px ${className}`}>{children}</div>
  }

  return <CyberBorder className={className}>{children}</CyberBorder>
}
