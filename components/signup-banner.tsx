"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Gift, Coins, Users, TrendingUp, CheckCircle, X } from "lucide-react"
import { toast } from "sonner"

interface SignUpBannerProps {
  walletConnected?: boolean
}

export function SignUpBanner({ walletConnected = false }: SignUpBannerProps) {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true)
      toast.success("Successfully signed up for updates!")
    }, 1000)
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClose}
        className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-white/50"
      >
        <X className="h-4 w-4" />
      </Button>

      <CardContent className="p-8">
        {!isSubmitted ? (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Gift className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Join the Mutable Community</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Get early access to new games, exclusive tournaments, and earn bonus MUTB tokens. Be part of the
                  future of decentralized gaming!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="text-center p-4 bg-white rounded-lg border border-orange-100">
                <Coins className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Bonus Tokens</h3>
                <p className="text-sm text-gray-600">Earn 100 MUTB tokens just for signing up</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-orange-100">
                <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Exclusive Access</h3>
                <p className="text-sm text-gray-600">Early access to new games and features</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-orange-100">
                <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Weekly Updates</h3>
                <p className="text-sm text-gray-600">Latest news and tournament announcements</p>
              </div>
            </div>

            <Separator className="max-w-3xl mx-auto" />

            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6">
                  <Mail className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>

            {walletConnected && (
              <div className="text-center">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Wallet Connected - Ready to Play!
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4 py-8">
            <div className="flex justify-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Mutable!</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Thanks for signing up! Check your email for your welcome bonus and keep an eye out for exclusive
                updates.
              </p>
            </div>
            <div className="flex justify-center">
              <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-sm px-3 py-1">
                <Coins className="h-4 w-4 mr-1" />
                100 MUTB tokens will be credited to your account
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
