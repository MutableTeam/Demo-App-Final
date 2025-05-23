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
    box-shadow: 0 0 0 0 rgba(255, 0, 128, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 0, 128, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 0, 128, 0);
  }
`

const CyberBanner = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(90deg, rgba(16, 16, 48, 0.95) 0%, rgba(32, 16, 64, 0.95) 100%);
  border-top: 2px solid rgba(0, 255, 255, 0.5);
  padding: 1rem;
  z-index: 9999;
  animation: ${slideUp} 0.5s ease-out forwards;
  backdrop-filter: blur(10px);
  
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

const TokenImage = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(0, 255, 255, 0.5);
  animation: ${pulse} 2s infinite;
  
  @media (min-width: 640px) {
    width: 50px;
    height: 50px;
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: white;
  }
`

interface SignUpBannerProps {
  onSignUp?: () => void
  walletConnected?: boolean // New prop to check wallet connection status
}

export function SignUpBanner({ onSignUp, walletConnected = false }: SignUpBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  useEffect(() => {
    // Only show banner if wallet is connected and banner wasn't dismissed
    if (walletConnected && !localStorage.getItem("signupBannerDismissed")) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [walletConnected])

  const handleClose = () => {
    setIsVisible(false)
    // Remember that user dismissed the banner
    localStorage.setItem("signupBannerDismissed", "true")
  }

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp()
    }
    // For demo purposes, just close the banner
    handleClose()
  }

  if (!isVisible) return null

  if (!isCyberpunk) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-blue-500 p-4 z-[9999] flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm text-white">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500">
            <Image src="/images/mutable-token.png" alt="MUTB Token" fill className="object-cover" />
          </div>
          <p className="font-medium">Sign up now and receive up to 100 Free MUTB Tokens!</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSignUp} className="whitespace-nowrap bg-blue-600 hover:bg-blue-700">
            Sign Up Now
          </Button>
          <button onClick={handleClose} className="p-1 text-gray-300 hover:text-white">
            <X size={20} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <CyberBanner className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <TokenImage>
          <Image src="/images/mutable-token.png" alt="MUTB Token" fill className="object-cover" />
        </TokenImage>
        <div>
          <p className="text-cyan-300 font-bold text-lg tracking-wide">
            <span className="text-pink-500">FREE</span> TOKEN OFFER
          </p>
          <p className="text-white text-sm sm:text-base">Sign up now and receive up to 100 Free MUTB Tokens!</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleSignUp}
          variant={isCyberpunk ? "default" : "default"}
          className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-bold"
        >
          CLAIM YOUR TOKENS
        </Button>
        <CloseButton onClick={handleClose} aria-label="Close banner">
          <X size={20} />
        </CloseButton>
      </div>
    </CyberBanner>
  )
}
