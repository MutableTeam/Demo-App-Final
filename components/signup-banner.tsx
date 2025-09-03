"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import Image from "next/image"
import { PreRegisterForm } from "@/components/pre-register-form"

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
  padding: 0.75rem;
  z-index: 9999;
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

const TokenImage = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(0, 255, 255, 0.5);
  animation: ${pulse} 2s infinite;
  flex-shrink: 0;
  
  @media (min-width: 640px) {
    width: 50px;
    height: 50px;
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

interface SignUpBannerProps {
  onSignUp?: () => void
  walletConnected?: boolean
}

export function SignUpBanner({ onSignUp, walletConnected = false }: SignUpBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showPreRegisterForm, setShowPreRegisterForm] = useState(false)
  const { styleMode } = useCyberpunkTheme()

  useEffect(() => {
    // Show banner always unless it was dismissed
    if (!localStorage.getItem("signupBannerDismissed")) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    // Remember that user dismissed the banner
    localStorage.setItem("signupBannerDismissed", "true")
  }

  const handleSignUp = () => {
    setShowPreRegisterForm(true)
  }

  const handleFormSuccess = () => {
    // Close the form and banner after successful submission
    setShowPreRegisterForm(false)
    handleClose()
  }

  if (!isVisible) return null

  return (
    <>
      <PreRegisterForm
        isOpen={showPreRegisterForm}
        onClose={() => setShowPreRegisterForm(false)}
        onSuccess={handleFormSuccess}
      />
      <CyberBanner className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <TokenImage>
            <Image src="/images/mutable-token.png" alt="MUTB Token" fill className="object-cover" />
          </TokenImage>
          <div className="min-w-0 flex-1">
            <p className="text-cyan-300 font-bold text-base sm:text-lg tracking-wide">
              <span className="text-pink-500">TOKEN</span> AIRDROP OFFER
            </p>
            <p className="text-white text-xs sm:text-sm leading-tight">
              Sign up now for your chance to recieve a free airdrop of tokens when we go live as well as in app rewards!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <Button
            onClick={handleSignUp}
            variant="default"
            className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-bold text-sm sm:text-base px-4 py-2 flex-1 sm:flex-none"
          >
            SIGN UP NOW
          </Button>
        </div>
        <CloseButton onClick={handleClose} aria-label="Close banner">
          <X size={16} className="sm:w-5 sm:h-5" />
        </CloseButton>
      </CyberBanner>
    </>
  )
}
