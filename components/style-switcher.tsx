"use client"

import { Button } from "@/components/ui/button"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import { keyframes } from "@emotion/react"
import styled from "@emotion/styled"

interface StyleSwitcherProps {
  className?: string
  size?: "default" | "sm" | "xs"
}

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(0, 255, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 255, 255, 0);
  }
`

const CyberButton = styled(Button)`
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, #0a0a24 0%, #1a1a4a 100%);
  border: 1px solid rgba(0, 255, 255, 0.3);
  color: #0ff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(0, 255, 255, 0.6);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.9);
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.8), transparent);
    z-index: 1;
  }
`

export function StyleSwitcher({ className, size = "default" }: StyleSwitcherProps) {
  const { styleMode, toggleStyleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  // Create a tooltip text that indicates what will happen when clicked
  const tooltipText = isCyberpunk ? "Switch to Light UI" : "Switch to Dark UI"

  // The button text now reflects the current state
  const buttonText = isCyberpunk ? "Dark UI" : "Light UI"

  return (
    <>
      {isCyberpunk ? (
        <CyberButton
          onClick={toggleStyleMode}
          className={cn("relative", size === "xs" ? "h-8 w-8 p-0" : size === "sm" ? "h-9 text-xs" : "h-10", className)}
          title={tooltipText}
        >
          {/* No icon */}
          <span>{buttonText}</span>
        </CyberButton>
      ) : (
        <Button
          variant="outline"
          size={size === "xs" ? "icon" : size === "sm" ? "sm" : "default"}
          onClick={toggleStyleMode}
          className={cn(className)}
          title={tooltipText}
        >
          {/* No icon */}
          <span>{buttonText}</span>
        </Button>
      )}
    </>
  )
}
