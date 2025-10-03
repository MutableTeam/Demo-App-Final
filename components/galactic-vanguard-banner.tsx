"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import Image from "next/image"

const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(0, 255, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 255, 255, 0);
  }
`

const CyberBanner = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(90deg, rgba(16, 16, 48, 0.95) 0%, rgba(32, 16, 64, 0.95) 100%);
  border-top: 2px solid rgba(0, 255, 255, 0.5);
  padding: 0.75rem;
  z-index: 99999;
  animation: ${slideUp} 0.5s ease-out forwards;
  backdrop-filter: blur(10px);
  
  @media (min-width: 640px) {
    padding: 1rem;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #0ff, #f0f, #0ff);
    z-index: 1;
  }
`

const StandardBanner = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(90deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%);
  border-top: 2px solid #3b82f6;
  padding: 0.75rem;
  z-index: 99999;
  animation: ${slideUp} 0.5s ease-out forwards;
  backdrop-filter: blur(10px);
  
  @media (min-width: 640px) {
    padding: 1rem;
  }
`

const GameIcon = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid rgba(0, 255, 255, 0.5);
  animation: ${pulse} 2s infinite;
  flex-shrink: 0;
  
  @media (min-width: 640px) {
    width: 64px;
    height: 64px;
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 0.25rem;
  
  @media (min-width: 640px) {
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.5rem;
  }
  
  &:hover {
    color: white;
  }
`

interface GalacticVanguardBannerProps {
  onLaunchGame?: () => void
  walletConnected?: boolean
}

export function GalacticVanguardBanner({ onLaunchGame, walletConnected = false }: GalacticVanguardBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  useEffect(() => {
    if (walletConnected) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 4000)

      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [walletConnected])

  const handleClose = () => {
    setIsVisible(false)
  }

  const handlePlayNow = () => {
    if (onLaunchGame) {
      onLaunchGame()
    }
    handleClose()
  }

  if (!isVisible) return null

  const BannerComponent = isCyberpunk ? CyberBanner : StandardBanner

  return (
    <BannerComponent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <GameIcon>
          <Image src="/images/galactic-vanguard-card.jpg" alt="Galactic Vanguard" fill className="object-cover" />
        </GameIcon>
        <div className="min-w-0 flex-1">
          <p
            className={
              isCyberpunk
                ? "text-cyan-300 font-bold text-base sm:text-lg tracking-wide"
                : "text-blue-300 font-bold text-base sm:text-lg tracking-wide"
            }
          >
            <span className={isCyberpunk ? "text-pink-500" : "text-blue-500"}>WEEKEND SHUTDOWN QUEST!</span> GALACTIC
            VANGUARD
          </p>
          <p
            className={
              isCyberpunk
                ? "text-white text-xs sm:text-sm leading-tight"
                : "text-gray-200 text-xs sm:text-sm leading-tight"
            }
          >
            MUTB prizes for 1st 2nd and 3rd place on the leaderboard
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
        <Button
          onClick={handlePlayNow}
          variant="default"
          className={
            isCyberpunk
              ? "bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-bold text-sm sm:text-base px-4 py-2 flex-1 sm:flex-none"
              : "bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-sm sm:text-base px-4 py-2 flex-1 sm:flex-none border-2 border-[#3b82f6] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
          }
        >
          PLAY NOW
        </Button>
      </div>
      <CloseButton onClick={handleClose} aria-label="Close banner">
        <X size={16} className="sm:w-5 sm:h-5" />
      </CloseButton>
    </BannerComponent>
  )
}
