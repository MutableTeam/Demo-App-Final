"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Coins, Users, Zap } from "lucide-react"

export function SignUpBanner() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubmitted(true)
      // Here you would typically send the email to your backend
      console.log("Email submitted:", email)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">Welcome to the Waitlist!</h3>
            <p className="text-green-700">You'll be among the first to receive your MUTB tokens when we launch.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 px-3 py-1">
            <Coins className="w-4 h-4 mr-1" />
            Early Access
          </Badge>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Get Free MUTB Tokens</CardTitle>
        <CardDescription className="text-lg text-gray-600">
          Join our waitlist and be the first to receive tokens when we launch
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Gift className="w-6 h-6 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Free Tokens</h4>
            <p className="text-sm text-gray-600">Get MUTB tokens at launch</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Early Access</h4>
            <p className="text-sm text-gray-600">Be first to play new games</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Exclusive Perks</h4>
            <p className="text-sm text-gray-600">Special rewards and bonuses</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-8">
              Join Waitlist
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center">We'll never spam you. Unsubscribe at any time.</p>
        </form>
      </CardContent>
    </Card>
  )
}
