"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"

// Cyberpunk styled components
const glitchAnim1 = keyframes`
  0% {
    clip-path: inset(40% 0 61% 0);
    transform: translate(-2px, 2px);
  }
  20% {
    clip-path: inset(92% 0 1% 0);
    transform: translate(1px, 3px);
  }
  40% {
    clip-path: inset(43% 0 1% 0);
    transform: translate(-1px, -3px);
  }
  60% {
    clip-path: inset(25% 0 58% 0);
    transform: translate(3px, 1px);
  }
  80% {
    clip-path: inset(54% 0 7% 0);
    transform: translate(-3px, -2px);
  }
  100% {
    clip-path: inset(58% 0 43% 0);
    transform: translate(2px, -1px);
  }
`

const glitchAnim2 = keyframes`
  0% {
    clip-path: inset(24% 0 29% 0);
    transform: translate(2px, -2px);
  }
  20% {
    clip-path: inset(54% 0 26% 0);
    transform: translate(-3px, 1px);
  }
  40% {
    clip-path: inset(9% 0 38% 0);
    transform: translate(1px, 3px);
  }
  60% {
    clip-path: inset(23% 0 75% 0);
    transform: translate(3px, -1px);
  }
  80% {
    clip-path: inset(74% 0 26% 0);
    transform: translate(-2px, 2px);
  }
  100% {
    clip-path: inset(46% 0 11% 0);
    transform: translate(2px, -2px);
  }
`

const flickerAnim = keyframes`
  0% {
    opacity: 0.1;
  }
  2% {
    opacity: 0.9;
  }
  4% {
    opacity: 0.3;
  }
  8% {
    opacity: 0.8;
  }
  70% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
`

const StyledTabsList = styled(TabsPrimitive.List)`
  background: rgba(10, 10, 40, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  margin-bottom: 1.5rem;
  
  &::before, &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.2;
    pointer-events: none;
    z-index: 1;
  }
  
  &::before {
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.2), transparent);
    animation: ${flickerAnim} 4s linear infinite;
  }
  
  &::after {
    background: linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.2), transparent);
    animation: ${flickerAnim} 7s linear infinite reverse;
  }
`

const StyledTabsTrigger = styled(TabsPrimitive.Trigger)`
  color: rgba(150, 200, 255, 0.7);
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  &[data-state="active"] {
    color: rgba(0, 255, 255, 0.9);
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
    background: transparent;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: rgba(0, 255, 255, 0.8);
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
    }
    
    // Glitch effect for active tab
    &::before {
      content: attr(data-value);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      color: rgba(255, 0, 255, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      animation: ${glitchAnim1} 4s infinite linear alternate-reverse;
      z-index: -1;
      opacity: 0.5;
    }
  }
  
  &:hover:not([data-state="active"]) {
    color: rgba(150, 220, 255, 0.9);
    background: rgba(0, 100, 200, 0.1);
    
    // Glitch effect on hover
    &::before {
      content: attr(data-value);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      color: rgba(0, 255, 255, 0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      animation: ${glitchAnim2} 3s infinite linear alternate-reverse;
      z-index: -1;
      opacity: 0.3;
    }
  }
`

const CyberpunkTabs = TabsPrimitive.Root

const CyberpunkTabList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <StyledTabsList
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
))
CyberpunkTabList.displayName = TabsPrimitive.List.displayName

const CyberpunkTab = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <StyledTabsTrigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className,
    )}
    {...props}
  />
))
CyberpunkTab.displayName = TabsPrimitive.Trigger.displayName

const CyberpunkTabContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
))
CyberpunkTabContent.displayName = TabsPrimitive.Content.displayName

export { CyberpunkTabs, CyberpunkTabList, CyberpunkTab, CyberpunkTabContent }
