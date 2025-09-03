"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import {
  Loader2,
  Zap,
  Coins,
  GamepadIcon,
  Users,
  Clock,
  Mail,
  User,
  CheckCircle,
  Wallet,
  Gift,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function PreSalePage() {
  const { styleMode } = useCyberpunkTheme()
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [solanaAddress, setSolanaAddress] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !firstName) return

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    setIsSubmitted(true)
  }

  const isCyberpunk = styleMode === "cyberpunk"

  return (
    <div
      className={cn(
        "min-h-screen relative overflow-hidden",
        isCyberpunk
          ? "bg-gradient-to-br from-gray-900 via-purple-900 to-black"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
      )}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-40 right-20 w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-40" />
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-ping opacity-50" />
        <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-pulse opacity-30" />

        {/* Grid Pattern */}
        <div
          className={cn("absolute inset-0 opacity-10", isCyberpunk ? "bg-cyan-400" : "bg-indigo-400")}
          style={{
            backgroundImage: `
            linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Glowing Orbs */}
        <div
          className={cn(
            "absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20 animate-pulse",
            isCyberpunk ? "bg-cyan-500" : "bg-blue-500",
          )}
        />
        <div
          className={cn(
            "absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15 animate-pulse",
            isCyberpunk ? "bg-purple-500" : "bg-indigo-500",
          )}
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge
            variant="outline"
            className={cn(
              "mb-4 px-4 py-2 text-sm font-bold",
              isCyberpunk
                ? "border-cyan-400 text-cyan-400 bg-cyan-400/10"
                : "border-indigo-500 text-indigo-600 bg-indigo-50",
            )}
          >
            <Clock className="w-4 h-4 mr-2" />
            COMING SOON
          </Badge>

          <h1
            className={cn(
              "text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r bg-clip-text text-transparent",
              isCyberpunk ? "from-cyan-400 via-purple-400 to-pink-400" : "from-indigo-600 via-purple-600 to-blue-600",
            )}
          >
            MUTB Token Pre-Sale
          </h1>

          <p
            className={cn(
              "text-lg md:text-xl max-w-3xl mx-auto leading-relaxed",
              isCyberpunk ? "text-gray-300" : "text-gray-600",
            )}
          >
            Get early access to the future of Web3 gaming. Join thousands of gamers preparing for the next evolution of
            blockchain entertainment.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Sign Up Form */}
          <Card
            className={cn(
              "relative overflow-hidden border-2",
              isCyberpunk
                ? "bg-gray-900/80 border-cyan-400/30 backdrop-blur-sm"
                : "bg-white/80 border-indigo-200 backdrop-blur-sm shadow-xl",
            )}
          >
            {/* Card Glow Effect */}
            <div
              className={cn(
                "absolute inset-0 opacity-20 blur-xl",
                isCyberpunk
                  ? "bg-gradient-to-r from-cyan-400 to-purple-400"
                  : "bg-gradient-to-r from-indigo-400 to-blue-400",
              )}
            />

            <CardHeader className="relative z-10">
              <CardTitle
                className={cn(
                  "text-2xl font-bold flex items-center gap-2",
                  isCyberpunk ? "text-cyan-400" : "text-indigo-600",
                )}
              >
                <Zap className="w-6 h-6" />
                Early Access Registration
              </CardTitle>
              <CardDescription className={cn(isCyberpunk ? "text-gray-400" : "text-gray-600")}>
                Be the first to know when the pre-sale launches
              </CardDescription>
            </CardHeader>

            <CardContent className="relative z-10">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className={cn(
                        "flex items-center gap-2 font-semibold",
                        isCyberpunk ? "text-gray-300" : "text-gray-700",
                      )}
                    >
                      <User className="w-4 h-4" />
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className={cn(
                        "h-12 text-base",
                        isCyberpunk
                          ? "bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                          : "bg-white border-gray-300 focus:border-indigo-500",
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className={cn(
                        "flex items-center gap-2 font-semibold",
                        isCyberpunk ? "text-gray-300" : "text-gray-700",
                      )}
                    >
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={cn(
                        "h-12 text-base",
                        isCyberpunk
                          ? "bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                          : "bg-white border-gray-300 focus:border-indigo-500",
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="solanaAddress"
                      className={cn(
                        "flex items-center gap-2 font-semibold",
                        isCyberpunk ? "text-gray-300" : "text-gray-700",
                      )}
                    >
                      <Wallet className="w-4 h-4" />
                      Solana Wallet Address
                      <span className={cn("text-xs font-normal", isCyberpunk ? "text-gray-500" : "text-gray-500")}>
                        (Optional)
                      </span>
                    </Label>
                    <Input
                      id="solanaAddress"
                      type="text"
                      placeholder="e.g., 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
                      value={solanaAddress}
                      onChange={(e) => setSolanaAddress(e.target.value)}
                      className={cn(
                        "h-12 text-base font-mono",
                        isCyberpunk
                          ? "bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                          : "bg-white border-gray-300 focus:border-indigo-500",
                      )}
                    />
                    <div
                      className={cn(
                        "flex items-start gap-2 p-3 rounded-lg border",
                        isCyberpunk
                          ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-300"
                          : "bg-yellow-50 border-yellow-200 text-yellow-700",
                      )}
                    >
                      <Gift className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold mb-1">Free Airdrop Opportunity!</p>
                        <p className={cn(isCyberpunk ? "text-yellow-200" : "text-yellow-600")}>
                          Add your Solana wallet address for a chance at a free MUTB token airdrop when we go live. This
                          helps us reward our early supporters!
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn("flex items-start gap-2 text-xs", isCyberpunk ? "text-gray-400" : "text-gray-500")}
                    >
                      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <p>
                        Your wallet address should start with a letter or number and be 32-44 characters long. You can
                        find this in Phantom, Solflare, or any Solana wallet.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !email || !firstName}
                    className="w-full h-12 text-base font-bold"
                    variant={isCyberpunk ? "default" : "default"}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Joining Waitlist...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Join the Waitlist
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle
                    className={cn("w-16 h-16 mx-auto mb-4", isCyberpunk ? "text-green-400" : "text-green-500")}
                  />
                  <h3 className={cn("text-xl font-bold mb-2", isCyberpunk ? "text-green-400" : "text-green-600")}>
                    Welcome to the Future, {firstName}!
                  </h3>
                  <p className={cn("text-base mb-4", isCyberpunk ? "text-gray-300" : "text-gray-600")}>
                    You're now on the exclusive waitlist. We'll notify you the moment the pre-sale goes live.
                  </p>
                  {solanaAddress && (
                    <div
                      className={cn(
                        "p-3 rounded-lg border text-sm",
                        isCyberpunk
                          ? "bg-green-400/10 border-green-400/30 text-green-300"
                          : "bg-green-50 border-green-200 text-green-700",
                      )}
                    >
                      <Gift className="w-4 h-4 inline mr-2" />
                      <span className="font-semibold">Airdrop Eligible!</span> Your wallet is registered for potential
                      free tokens.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features & Benefits */}
          <div className="space-y-6">
            <Card
              className={cn(
                "border-2",
                isCyberpunk
                  ? "bg-gray-900/60 border-purple-400/30 backdrop-blur-sm"
                  : "bg-white/60 border-purple-200 backdrop-blur-sm shadow-lg",
              )}
            >
              <CardHeader>
                <CardTitle
                  className={cn(
                    "text-xl font-bold flex items-center gap-2",
                    isCyberpunk ? "text-purple-400" : "text-purple-600",
                  )}
                >
                  <Coins className="w-5 h-5" />
                  Pre-Sale Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                      isCyberpunk ? "bg-cyan-400" : "bg-indigo-500",
                    )}
                  />
                  <div>
                    <h4 className={cn("font-semibold", isCyberpunk ? "text-gray-200" : "text-gray-800")}>
                      Early Bird Pricing
                    </h4>
                    <p className={cn("text-sm", isCyberpunk ? "text-gray-400" : "text-gray-600")}>
                      Get MUTB tokens at the lowest possible price
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                      isCyberpunk ? "bg-cyan-400" : "bg-indigo-500",
                    )}
                  />
                  <div>
                    <h4 className={cn("font-semibold", isCyberpunk ? "text-gray-200" : "text-gray-800")}>
                      Exclusive NFT Rewards
                    </h4>
                    <p className={cn("text-sm", isCyberpunk ? "text-gray-400" : "text-gray-600")}>
                      Limited edition gaming assets and collectibles
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                      isCyberpunk ? "bg-cyan-400" : "bg-indigo-500",
                    )}
                  />
                  <div>
                    <h4 className={cn("font-semibold", isCyberpunk ? "text-gray-200" : "text-gray-800")}>VIP Access</h4>
                    <p className={cn("text-sm", isCyberpunk ? "text-gray-400" : "text-gray-600")}>
                      Priority access to new games and features
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                      isCyberpunk ? "bg-yellow-400" : "bg-yellow-500",
                    )}
                  />
                  <div>
                    <h4 className={cn("font-semibold", isCyberpunk ? "text-gray-200" : "text-gray-800")}>
                      Free Token Airdrop
                    </h4>
                    <p className={cn("text-sm", isCyberpunk ? "text-gray-400" : "text-gray-600")}>
                      Chance for free MUTB tokens with wallet registration
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "border-2",
                isCyberpunk
                  ? "bg-gray-900/60 border-green-400/30 backdrop-blur-sm"
                  : "bg-white/60 border-green-200 backdrop-blur-sm shadow-lg",
              )}
            >
              <CardHeader>
                <CardTitle
                  className={cn(
                    "text-xl font-bold flex items-center gap-2",
                    isCyberpunk ? "text-green-400" : "text-green-600",
                  )}
                >
                  <GamepadIcon className="w-5 h-5" />
                  Gaming Ecosystem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className={cn("text-sm", isCyberpunk ? "text-gray-300" : "text-gray-600")}>
                  MUTB tokens power the entire Mutable gaming ecosystem:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className={cn("flex items-center gap-2", isCyberpunk ? "text-gray-400" : "text-gray-600")}>
                    <span className={cn("w-1 h-1 rounded-full", isCyberpunk ? "bg-green-400" : "bg-green-500")} />
                    Tournament entry fees and prizes
                  </li>
                  <li className={cn("flex items-center gap-2", isCyberpunk ? "text-gray-400" : "text-gray-600")}>
                    <span className={cn("w-1 h-1 rounded-full", isCyberpunk ? "bg-green-400" : "bg-green-500")} />
                    NFT marketplace transactions
                  </li>
                  <li className={cn("flex items-center gap-2", isCyberpunk ? "text-gray-400" : "text-gray-600")}>
                    <span className={cn("w-1 h-1 rounded-full", isCyberpunk ? "bg-green-400" : "bg-green-500")} />
                    Staking rewards and governance
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "border-2",
                isCyberpunk
                  ? "bg-gray-900/60 border-yellow-400/30 backdrop-blur-sm"
                  : "bg-white/60 border-yellow-200 backdrop-blur-sm shadow-lg",
              )}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className={cn("w-8 h-8 mx-auto mb-2", isCyberpunk ? "text-yellow-400" : "text-yellow-600")} />
                  <div className={cn("text-2xl font-bold", isCyberpunk ? "text-yellow-400" : "text-yellow-600")}>
                    12,847
                  </div>
                  <p className={cn("text-sm", isCyberpunk ? "text-gray-400" : "text-gray-600")}>
                    Gamers already waiting
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className={cn("text-sm", isCyberpunk ? "text-gray-500" : "text-gray-500")}>
            Pre-sale details and timeline will be announced soon. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  )
}
