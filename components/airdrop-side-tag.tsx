"use client"

import { useState, useEffect } from "react"
import { Gift } from "lucide-react"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import { PreRegisterForm } from "@/components/pre-register-form"

const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 0, 128, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(255, 0, 128, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 0, 128, 0);
  }
`

const glow = keyframes`
  0%, 100% {
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
  }
  50% {
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.8), 0 0 15px rgba(255, 0, 128, 0.5);
  }
`

const CyberTag = styled.div`
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 9998;
  animation: ${slideInRight} 0.6s ease-out forwards;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-50%) translateX(-4px);
  }
`

const TagContent = styled.div`
  background: linear-gradient(135deg, rgba(16, 16, 48, 0.95) 0%, rgba(32, 16, 64, 0.95) 100%);
  border: 2px solid rgba(0, 255, 255, 0.5);
  border-right: none;
  border-radius: 12px 0 0 12px;
  padding: 0.75rem 1rem 0.75rem 0.75rem;
  backdrop-filter: blur(10px);
  animation: ${pulse} 3s infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: 0;
    bottom: -2px;
    background: linear-gradient(45deg, #0ff, #f0f, #0ff);
    border-radius: 12px 0 0 12px;
    z-index: -1;
    opacity: 0.3;
  }
`

const TagText = styled.div`
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: #00ffff;
  font-weight: bold;
  font-size: 0.875rem;
  letter-spacing: 1px;
  animation: ${glow} 2s ease-in-out infinite;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 640px) {
    font-size: 0.75rem;
    span {
      display: none;
    }
  }
`

const StandardTag = styled.div`
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 9998;
  animation: ${slideInRight} 0.6s ease-out forwards;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-50%) translateX(-4px);
  }
`

const StandardTagContent = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border: 2px solid #3b82f6;
  border-right: none;
  border-radius: 12px 0 0 12px;
  padding: 0.75rem 1rem 0.75rem 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`

const StandardTagText = styled.div`
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: #3b82f6;
  font-weight: bold;
  font-size: 0.875rem;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 640px) {
    font-size: 0.75rem;
    span {
      display: none;
    }
  }
`

interface AirdropSideTagProps {
  walletConnected?: boolean
}

export function AirdropSideTag({ walletConnected = false }: AirdropSideTagProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showPreRegisterForm, setShowPreRegisterForm] = useState(false)
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

  const handleClick = () => {
    setShowPreRegisterForm(true)
  }

  const handleFormSuccess = () => {
    setShowPreRegisterForm(false)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <>
      <PreRegisterForm
        isOpen={showPreRegisterForm}
        onClose={() => setShowPreRegisterForm(false)}
        onSuccess={handleFormSuccess}
      />

      {isCyberpunk ? (
        <CyberTag onClick={handleClick}>
          <TagContent>
            <TagText>
              <Gift size={16} />
              <span>AIRDROP SIGNUP</span>
            </TagText>
          </TagContent>
        </CyberTag>
      ) : (
        <StandardTag onClick={handleClick}>
          <StandardTagContent>
            <StandardTagText>
              <Gift size={16} />
              <span>AIRDROP SIGNUP</span>
            </StandardTagText>
          </StandardTagContent>
        </StandardTag>
      )}
    </>
  )
}
