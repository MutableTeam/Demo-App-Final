"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"

// Glitch animations for cyberpunk mode
const glitchAnim1 = keyframes`
  0% {
    transform: none;
    opacity: 1;
  }
  7% {
    transform: skew(-0.5deg, -0.9deg);
    opacity: 0.75;
  }
  10% {
    transform: none;
    opacity: 1;
  }
  27% {
    transform: none;
    opacity: 1;
  }
  30% {
    transform: skew(0.8deg, -0.1deg);
    opacity: 0.75;
  }
  35% {
    transform: none;
    opacity: 1;
  }
  52% {
    transform: none;
    opacity: 1;
  }
  55% {
    transform: skew(-1deg, 0.2deg);
    opacity: 0.75;
  }
  50% {
    transform: none;
    opacity: 1;
  }
  72% {
    transform: none;
    opacity: 1;
  }
  75% {
    transform: skew(0.4deg, 1deg);
    opacity: 0.75;
  }
  80% {
    transform: none;
    opacity: 1;
  }
  100% {
    transform: none;
    opacity: 1;
  }
`

const glitchAnim2 = keyframes`
  0% {
    transform: none;
    opacity: 0.25;
  }
  7% {
    transform: translate(-2px, -3px);
    opacity: 0.5;
  }
  10% {
    transform: none;
    opacity: 0.25;
  }
  27% {
    transform: none;
    opacity: 0.25;
  }
  30% {
    transform: translate(-5px, -2px);
    opacity: 0.5;
  }
  35% {
    transform: none;
    opacity: 0.25;
  }
  52% {
    transform: none;
    opacity: 0.25;
  }
  55% {
    transform: translate(-5px, -1px);
    opacity: 0.5;
  }
  50% {
    transform: none;
    opacity: 0.25;
  }
  72% {
    transform: none;
    opacity: 0.25;
  }
  75% {
    transform: translate(-2px, -6px);
    opacity: 0.5;
  }
  80% {
    transform: none;
    opacity: 0.25;
  }
  100% {
    transform: none;
    opacity: 0.25;
  }
`

// Styled components for cyberpunk mode
const CyberCardHeader = styled.div`
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  background: rgba(16, 16, 48, 0.7) !important;
  position: relative;
  z-index: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
  }
`

const CyberCardTitle = styled.h3`
  color: #0ff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  font-family: monospace;
  font-weight: bold;
  font-size: 1.5rem;
  letter-spacing: 1px;
  margin: 0;
`

const CyberCardDescription = styled.p`
  color: rgba(0, 255, 255, 0.7);
  font-family: monospace;
  font-size: 0.875rem;
  margin: 0;
  text-shadow: 0 0 2px rgba(0, 255, 255, 0.3);
  letter-spacing: 0.5px;
  line-height: 1.5;
`

const CyberCardContent = styled.div`
  position: relative;
  z-index: 1;
  padding: 1.5rem;
  padding-top: 1rem;
  background: transparent !important;
  
  /* Glitch effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 255, 255, 0.05);
    z-index: -1;
    animation: ${glitchAnim1} 8s infinite;
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 0, 255, 0.05);
    z-index: -1;
    animation: ${glitchAnim2} 8s infinite;
    pointer-events: none;
  }
  
  /* Occasional text glitch */
  & > * {
    position: relative;
  }
`

const CyberCardFooter = styled.div`
  border-top: 1px solid rgba(0, 255, 255, 0.3);
  background: rgba(16, 16, 48, 0.7);
  position: relative;
  z-index: 1;
  padding: 1.5rem;
  padding-top: 1rem;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.8), transparent);
  }
`

const GridBackground = styled.div`
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
`

// Regular Card component with conditional rendering
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border !bg-black/80 !text-cyan-100 shadow-sm cyberpunk-card !border-cyan-500/50",
        className,
      )}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "rgb(224, 255, 255)",
        borderColor: "rgba(6, 182, 212, 0.5)",
      }}
      {...props}
    >
      <GridBackground />
      {props.children}
    </div>
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <CyberCardHeader ref={ref} className={className} {...props} />
  },
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return <CyberCardTitle ref={ref} className={className} {...props} />
  },
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={className} {...props} />
  },
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <CyberCardContent ref={ref} className={cn("mt-2 text-cyan-100", className)} {...props} />
  },
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <CyberCardFooter ref={ref} className={className} {...props} />
  },
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
