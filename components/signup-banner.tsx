"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface SignUpBannerProps {
  onSignUp?: () => void
  walletConnected?: boolean
}

export function SignUpBanner({ onSignUp, walletConnected = false }: SignUpBannerProps) {
  const [isVisible, setIsVisible] = useState(false)

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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto bg-gradient-to-r from-orange-500 to-yellow-500 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image
                  src="/images/mutable-token.png"
                  alt="MUTB Token"
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-white shadow-md"
                />
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 animate-pulse">
                  FREE
                </Badge>
              </div>
              <div className="text-white">
                <h3 className="text-xl font-bold mb-1">🎉 Welcome Bonus Available!</h3>
                <p className="text-white/90">
                  Sign up now and receive up to <span className="font-bold">100 Free MUTB Tokens</span> to start gaming!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSignUp}
                className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-6 py-2 shadow-md"
              >
                Claim Your Tokens
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClose} className="text-white hover:bg-white/20 p-2">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
