"use client"

import { useState, useEffect } from "react"
import { usePlatform } from "@/contexts/platform-context"

interface LastStandLauncherProps {
  playerId: string
  playerName: string
  onBack: () => void
}

export default function LastStandLauncher({ playerId, playerName, onBack }: LastStandLauncherProps) {
  const [gameMode, setGameMode] = useState<"practice" | "hourly" | "daily">("practice")
  const [showGame, setShowGame] = useState(false)
  const [gameStats, setGameStats] = useState<any>(null)
  const { platformType } = usePlatform()
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileKeywords = ["mobile", "android", "iphone", "ipad", "tablet"]
      const isMobileUA = mobileKeywords.some((keyword) => userAgent.includes(keyword))
      const isMobileScreen = window.innerWidth <= 768
      setIsMobile(isMobileUA || isMobileScreen || platformType === "mobile")
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [platformType])

  const handleGameStart = (mode: "practice" | "hourly" | "daily") => {
    setGameMode(mode)
    setShowGame(true)
