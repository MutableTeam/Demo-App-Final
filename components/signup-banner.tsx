"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Mail, Gift, Trophy, Coins, Users } from "lucide-react"

interface SignUpBannerProps {
  walletConnected?: boolean
}

export function SignUpBanner({ walletConnected = false }: SignUpBannerProps) {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitted(true)
    setIsLoading(false)
  }

  const benefits = [
    {
      icon: <Gift className="w-5 h-5 text-orange-500" />,
      title: "Welcome Bonus",
      description: "Get 100 MUTB tokens when you sign up",
    },
    {
      icon: <Trophy className="w-5 h-5 text-blue-500" />,
      title: "Exclusive Games",
      description: "Access to premium games and tournaments",
    },
    {
      icon: <Coins className="w-5 h-5 text-green-500" />,
      title: "Higher Rewards",
      description: "Earn 25% more tokens on all games",
    },
    {
      icon: <Users className="w-5 h-5 text-purple-500" />,
      title: "Community Access",
      description: "Join our Discord and get insider updates",
    },
  ]

  if (isSubmitted) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Mutable!</h3>
          <p className="text-gray-600 mb-4">Check your email for your welcome bonus and next steps.</p>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            100 MUTB tokens will be credited to your account
          </Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Join the Mutable Gaming Revolution</CardTitle>
        <CardDescription className="text-lg text-gray-600">
          Sign up now and get exclusive benefits, bonus tokens, and early access to new games
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-2">
                {benefit.icon}
                <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
              </div>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Email Signup Form */}
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 whitespace-nowrap"
              >
                {isLoading ? "Signing Up..." : "Get Started"}
              </Button>
            </div>
          </form>

          <p className="text-xs text-gray-500 text-center mt-3">
            By signing up, you agree to our Terms of Service and Privacy Policy.
            {walletConnected && " Your wallet is already connected - you're ready to play!"}
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-orange-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              {Math.floor(Math.random() * 500) + 1000} players online now
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
