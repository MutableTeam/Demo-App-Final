"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { keyframes } from "@emotion/react"
import styled from "@emotion/styled"

// Define animations
const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.7), 0 0 30px rgba(0, 255, 255, 0.4);
    border-color: rgba(0, 255, 255, 0.8);
  }
  50% {
    box-shadow: 0 0 25px rgba(255, 0, 255, 0.7), 0 0 40px rgba(255, 0, 255, 0.4);
    border-color: rgba(255, 0, 255, 0.8);
  }
`

const glitchAnim = keyframes`
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

const scanlineAnim = keyframes`
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 100%;
  }
`

const SelectedIndicator = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #0ff, #f0f);
  border-radius: 50%;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.7);
  
  &::before {
    content: '✓';
    color: black;
    font-weight: bold;
    font-size: 16px;
  }
`

const ScanlineOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(0, 255, 255, 0.1) 50%
  );
  background-size: 100% 4px;
  pointer-events: none;
  z-index: 5;
  animation: ${scanlineAnim} 10s linear infinite;
`

interface CyberpunkGameCardProps {
  title: string
  description: string
  imageSrc: string
  players?: string
  onPlay: () => void
  className?: string
  isSelected?: boolean
}

export function CyberpunkGameCard({
  title,
  description,
  imageSrc,
  players,
  onPlay,
  className,
  isSelected = false,
}: CyberpunkGameCardProps) {
  const { isCyberpunkMode, styleMode } = useCyberpunkTheme()
  const [hovered, setHovered] = useState(false)

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 group hover:shadow-lg relative",
        isCyberpunkMode &&
          styleMode === "cyberpunk" &&
          "border-[#00f0ff] border-opacity-50 bg-black bg-opacity-80 relative",
        isSelected &&
          isCyberpunkMode &&
          styleMode === "cyberpunk" &&
          "border-[#00f0ff] border-opacity-100 border-2 cyberpunk-selected",
        className,
      )}
      style={
        isSelected && isCyberpunkMode && styleMode === "cyberpunk"
          ? { animation: `${pulseGlow} 3s infinite` }
          : undefined
      }
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isCyberpunkMode && styleMode === "cyberpunk" && (
        <>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff00ff] to-transparent opacity-70"></div>
          <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-transparent via-[#00f0ff] to-transparent opacity-70"></div>
          <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-transparent via-[#ff00ff] to-transparent opacity-70"></div>

          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00f0ff] opacity-70"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00f0ff] opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#ff00ff] opacity-70"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#ff00ff] opacity-70"></div>

          {isSelected && <SelectedIndicator />}
          {isSelected && <ScanlineOverlay />}
        </>
      )}

      <div className="relative">
        <img
          src={imageSrc || "/placeholder.svg"}
          alt={title}
          className={cn(
            "w-full h-48 object-cover",
            isCyberpunkMode && styleMode === "cyberpunk" && "opacity-90 hover:opacity-100 transition-opacity",
            isSelected && isCyberpunkMode && styleMode === "cyberpunk" && "brightness-110 contrast-110",
          )}
        />

        {players && (
          <div
            className={cn(
              "absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded",
              isCyberpunkMode && styleMode === "cyberpunk"
                ? "bg-black bg-opacity-70 text-[#00f0ff] border border-[#00f0ff] border-opacity-50"
                : "bg-black bg-opacity-50 text-white",
            )}
          >
            {players}
          </div>
        )}
      </div>

      <CardHeader
        className={cn(
          "pb-2",
          isCyberpunkMode && styleMode === "cyberpunk" && "text-[#00f0ff]",
          isSelected && isCyberpunkMode && styleMode === "cyberpunk" && "bg-black bg-opacity-80",
        )}
      >
        <CardTitle
          className={cn(
            "text-xl",
            isCyberpunkMode && styleMode === "cyberpunk" && "text-[#00f0ff] font-bold",
            isSelected && isCyberpunkMode && styleMode === "cyberpunk" && "cyberpunk-title-selected",
          )}
          style={
            isSelected && isCyberpunkMode && styleMode === "cyberpunk"
              ? { animation: `${glitchAnim} 3s infinite` }
              : undefined
          }
        >
          {title}
          {isSelected && isCyberpunkMode && styleMode === "cyberpunk" && (
            <span className="ml-2 text-[#ff00ff]">SELECTED</span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-2">
        <CardDescription
          className={cn(
            isCyberpunkMode && styleMode === "cyberpunk" && "text-gray-300",
            isSelected && isCyberpunkMode && styleMode === "cyberpunk" && "text-white",
          )}
        >
          {description}
        </CardDescription>
      </CardContent>

      <CardFooter>
        <Button
          onClick={onPlay}
          className={cn(
            "w-full",
            isCyberpunkMode &&
              styleMode === "cyberpunk" &&
              "bg-gradient-to-r from-[#9333ea] to-[#3b82f6] hover:from-[#a855f7] hover:to-[#60a5fa] text-white",
            isSelected &&
              isCyberpunkMode &&
              styleMode === "cyberpunk" &&
              "bg-gradient-to-r from-[#ff00ff] to-[#00f0ff] hover:from-[#ff33ff] hover:to-[#33f3ff] text-black font-bold",
          )}
        >
          {isSelected ? "LAUNCH GAME" : "PLAY NOW"}
        </Button>
      </CardFooter>
    </Card>
  )
}
