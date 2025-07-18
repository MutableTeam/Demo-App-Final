"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Monitor, Smartphone, Gamepad2 } from "lucide-react"
import { usePlatform, type PlatformType } from "@/contexts/platform-context"
import SoundButton from "./sound-button"
import { cyberpunkColors } from "@/styles/cyberpunk-theme"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import Image from "next/image"
import { LOGOS } from "@/utils/image-paths"

// Cyberpunk styled components
const pulseAnimation = keyframes`
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 15px ${cyberpunkColors.primary.cyan}, 0 0 30px ${cyberpunkColors.primary.cyan}80;
  }
  50% {
    opacity: 0.7;
    box-shadow: 0 0 25px ${cyberpunkColors.primary.magenta}, 0 0 40px ${cyberpunkColors.primary.magenta}80;
  }
`

const CyberpunkCard = styled(Card)`
  background: linear-gradient(135deg, rgba(16, 16, 48, 0.9) 0%, rgba(32, 16, 64, 0.9) 100%);
  border: 1px solid rgba(0, 255, 255, 0.3);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.2), inset 0 0 10px rgba(255, 0, 255, 0.1);
  backdrop-filter: blur(5px);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 48%, rgba(0, 255, 255, 0.1) 50%, transparent 52%);
    background-size: 200% 200%;
    animation: shine 8s infinite linear;
    z-index: 0;
  }

  @keyframes shine {
    0% { background-position: 200% 0; }
    100% { background-position: 0 200%; }
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 25px rgba(0, 255, 255, 0.4), inset 0 0 15px rgba(255, 0, 255, 0.2);
  }
`

const CyberpunkCardHeader = styled(CardHeader)`
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  background: rgba(16, 16, 48, 0.7);
  position: relative;
  z-index: 1;
`

const CyberpunkCardTitle = styled(CardTitle)`
  color: #0ff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  font-family: monospace;
  font-weight: bold;
  font-size: 1.2rem;
  letter-spacing: 1px;
  text-transform: uppercase;
`

const CyberpunkCardDescription = styled(CardDescription)`
  color: rgba(0, 255, 255, 0.8);
  font-family: monospace;
`

const CyberpunkCardContent = styled(CardContent)`
  position: relative;
  z-index: 1;
  color: ${cyberpunkColors.text.primary};
`

const PlatformButton = styled(SoundButton)`
  background: linear-gradient(135deg, rgba(16, 16, 48, 0.8) 0%, rgba(32, 16, 64, 0.8) 100%);
  border: 2px solid rgba(0, 255, 255, 0.5);
  color: #0ff;
  font-family: monospace;
  font-weight: bold;
  font-size: 1rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  height: 120px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%);
    border-color: rgba(0, 255, 255, 0.8);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(1px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
    z-index: 0;
  }

  &:hover::before {
    left: 100%;
  }
`

const LogoContainer = styled.div`
  position: relative;
  margin: 0 auto 2rem;
  text-align: center;
  max-width: 300px;
`

const StyledLogo = styled(Image)`
  filter: drop-shadow(0 0 15px rgba(0, 255, 255, 0.7));
  animation: ${pulseAnimation} 3s infinite alternate;
  transform-origin: center;
  transition: all 0.3s ease;
`

const CyberpunkBadge = styled(Badge)`
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.2) 0%, rgba(255, 0, 255, 0.2) 100%);
  border: 1px solid rgba(0, 255, 255, 0.5);
  color: #0ff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  font-family: monospace;
  font-weight: bold;
  font-size: 0.7rem;
  letter-spacing: 1px;
  text-transform: uppercase;
`

interface PlatformSelectorProps {
  onPlatformSelected?: (platform: PlatformType) => void
}

export default function PlatformSelector({ onPlatformSelected }: PlatformSelectorProps) {
  const { setPlatformType } = usePlatform()
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null)

  const handlePlatformSelect = (platform: PlatformType) => {
    setSelectedPlatform(platform)
    setPlatformType(platform)
    onPlatformSelected?.(platform)
  }

  const platforms = [
    {
      type: "desktop" as PlatformType,
      title: "Desktop",
      description: "Keyboard & Mouse Controls",
      icon: Monitor,
      features: ["WASD Movement", "Mouse Aiming", "Keyboard Shortcuts", "Full Screen Gaming"],
      badge: "Recommended",
    },
    {
      type: "mobile" as PlatformType,
      title: "Mobile",
      description: "Touch Controls",
      icon: Smartphone,
      features: ["Touch Movement", "Tap to Shoot", "Gesture Controls", "Optimized UI"],
      badge: "Touch Friendly",
    },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Logo */}
      <LogoContainer>
        <StyledLogo
          src={LOGOS.MUTABLE.TRANSPARENT || "/placeholder.svg"}
          alt="Mutable Logo"
          width={250}
          height={150}
          className="w-auto h-auto max-w-[250px] mx-auto"
        />
      </LogoContainer>

      {/* Platform Selection Card */}
      <CyberpunkCard>
        <CyberpunkCardHeader className="text-center">
          <CyberpunkCardTitle className="flex items-center justify-center gap-2">
            <Gamepad2 className="h-6 w-6" />
            Select Your Platform
          </CyberpunkCardTitle>
          <CyberpunkCardDescription>Choose your preferred gaming experience</CyberpunkCardDescription>
        </CyberpunkCardHeader>

        <CyberpunkCardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {platforms.map((platform) => {
              const IconComponent = platform.icon
              return (
                <PlatformButton
                  key={platform.type}
                  onClick={() => handlePlatformSelect(platform.type)}
                  className="w-full flex flex-col items-center justify-center gap-3 p-6"
                >
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-8 w-8" />
                      <span className="text-xl">{platform.title}</span>
                    </div>

                    <CyberpunkBadge>{platform.badge}</CyberpunkBadge>

                    <p className="text-sm opacity-80 text-center">{platform.description}</p>

                    <div className="text-xs opacity-70 text-center">
                      {platform.features.map((feature, index) => (
                        <div key={index} className="flex items-center justify-center gap-1">
                          <span>•</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </PlatformButton>
              )
            })}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-cyan-400/80 font-mono">You can change this setting later in the game options</p>
          </div>
        </CyberpunkCardContent>
      </CyberpunkCard>
    </div>
  )
}
