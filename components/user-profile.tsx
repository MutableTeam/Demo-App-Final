"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Wallet, Copy, Edit3, Check, X, Trophy, Gamepad2, ArrowLeftRight, TrendingUp } from "lucide-react"
import Image from "next/image"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

interface UserProfileProps {
  publicKey: string
  balance: number | null
  mutbBalance: number
  onDisconnect: () => void
}

export default function UserProfile({ publicKey, balance, mutbBalance, onDisconnect }: UserProfileProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [username, setUsername] = useState(`Player_${publicKey.substring(0, 4)}`)
  const [tempUsername, setTempUsername] = useState(username)

  // Mock user statistics
  const userStats = {
    gamesPlayed: 47,
    wins: 32,
    tokensSwapped: 1250.75,
    winRate: Math.round((32 / 47) * 100),
  }

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(publicKey)
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleSaveUsername = () => {
    setUsername(tempUsername)
    setIsEditingUsername(false)
    toast({
      title: "Username Updated",
      description: "Your username has been updated successfully",
    })
  }

  const handleCancelEdit = () => {
    setTempUsername(username)
    setIsEditingUsername(false)
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className={cn("arcade-card", isCyberpunk && "bg-black/80 border-cyan-500/50")}>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/images/mutable-logo-transparent.png" alt="Profile" />
              <AvatarFallback className={cn("text-2xl", isCyberpunk && "bg-cyan-900/50 text-cyan-300")}>
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {isEditingUsername ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                      className={cn("max-w-xs", isCyberpunk && "bg-black/50 border-cyan-500/50 text-cyan-300")}
                      maxLength={20}
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveUsername}
                      className={cn(
                        "h-8 w-8 p-0",
                        isCyberpunk && "bg-cyan-900/50 hover:bg-cyan-800/50 border-cyan-500",
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className={cn(
                        "h-8 w-8 p-0",
                        isCyberpunk && "bg-black/50 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/30",
                      )}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className={cn("text-2xl font-bold", isCyberpunk && "text-cyan-400")}>{username}</h2>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingUsername(true)}
                      className={cn("h-8 w-8 p-0", isCyberpunk && "text-cyan-400 hover:bg-cyan-900/30")}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "bg-green-100 text-green-800 border-green-300",
                  isCyberpunk && "bg-cyan-900/30 text-cyan-300 border-cyan-500/50",
                )}
              >
                <div className="flex items-center gap-1">
                  <div className={cn("w-2 h-2 rounded-full bg-green-500", isCyberpunk && "bg-cyan-400")} />
                  Connected
                </div>
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallet Information */}
        <Card className={cn("arcade-card", isCyberpunk && "bg-black/80 border-cyan-500/50")}>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isCyberpunk && "text-cyan-400")}>
              <Wallet className="h-5 w-5" />
              Wallet Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Wallet Address */}
            <div className="space-y-2">
              <Label className={cn("text-sm font-medium text-gray-900", isCyberpunk && "text-cyan-300")}>
                Wallet Address
              </Label>
              <div
                className={cn(
                  "flex items-center gap-2 p-3 bg-gray-100 rounded-md border border-gray-300",
                  isCyberpunk && "bg-black/50 border-cyan-500/30",
                )}
              >
                <code className={cn("flex-1 text-sm font-mono text-gray-800", isCyberpunk && "text-cyan-300")}>
                  {formatAddress(publicKey)}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyAddress}
                  className={cn(
                    "h-8 w-8 p-0 text-gray-700 hover:text-gray-900 hover:bg-gray-200",
                    isCyberpunk && "text-cyan-400 hover:bg-cyan-900/30",
                  )}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator className={isCyberpunk ? "bg-cyan-500/30" : "bg-gray-300"} />

            {/* Token Balances */}
            <div className="space-y-3">
              <Label className={cn("text-sm font-medium text-gray-900", isCyberpunk && "text-cyan-300")}>
                Token Balances
              </Label>

              {/* SOL Balance */}
              <div
                className={cn(
                  "flex items-center justify-between p-3 bg-gray-100 rounded-md border border-gray-300",
                  isCyberpunk && "bg-black/50 border-cyan-500/30",
                )}
              >
                <div className="flex items-center gap-2">
                  <Image src="/solana-logo.png" alt="SOL" width={24} height={24} className="rounded-full" />
                  <span className={cn("font-medium text-gray-800", isCyberpunk && "text-cyan-300")}>SOL</span>
                </div>
                <span className={cn("font-mono font-bold text-gray-900", isCyberpunk && "text-cyan-400")}>
                  {balance?.toFixed(4) || "0.0000"}
                </span>
              </div>

              {/* MUTB Balance */}
              <div
                className={cn(
                  "flex items-center justify-between p-3 bg-gray-100 rounded-md border border-gray-300",
                  isCyberpunk && "bg-black/50 border-cyan-500/30",
                )}
              >
                <div className="flex items-center gap-2">
                  <Image src="/images/mutable-token.png" alt="MUTB" width={24} height={24} className="rounded-full" />
                  <span className={cn("font-medium text-gray-800", isCyberpunk && "text-cyan-300")}>MUTB</span>
                </div>
                <span className={cn("font-mono font-bold text-gray-900", isCyberpunk && "text-cyan-400")}>
                  {mutbBalance.toFixed(2)}
                </span>
              </div>
            </div>

            <Separator className={isCyberpunk ? "bg-cyan-500/30" : "bg-gray-300"} />

            {/* Disconnect Button */}
            <Button
              onClick={onDisconnect}
              variant="destructive"
              className={cn(
                "w-full",
                isCyberpunk && "bg-red-900/50 hover:bg-red-800/50 border border-red-500/50 text-red-300",
              )}
            >
              Disconnect Wallet
            </Button>
          </CardContent>
        </Card>

        {/* Platform Statistics */}
        <Card className={cn("arcade-card", isCyberpunk && "bg-black/80 border-cyan-500/50")}>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isCyberpunk && "text-cyan-400")}>
              <Trophy className="h-5 w-5" />
              Platform Statistics
            </CardTitle>
            <CardDescription className={isCyberpunk ? "text-cyan-300/70" : ""}>
              Your activity on the Mutable platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Games Played */}
            <div
              className={cn(
                "flex items-center justify-between p-3 bg-gray-100 rounded-md border border-gray-300",
                isCyberpunk && "bg-black/50 border-cyan-500/30",
              )}
            >
              <div className="flex items-center gap-2">
                <Gamepad2 className={cn("h-5 w-5 text-blue-600", isCyberpunk && "text-cyan-500")} />
                <span className={cn("font-medium text-gray-800", isCyberpunk && "text-cyan-300")}>Games Played</span>
              </div>
              <span className={cn("font-bold text-lg text-gray-900", isCyberpunk && "text-cyan-400")}>
                {userStats.gamesPlayed}
              </span>
            </div>

            {/* Wins */}
            <div
              className={cn(
                "flex items-center justify-between p-3 bg-gray-100 rounded-md border border-gray-300",
                isCyberpunk && "bg-black/50 border-cyan-500/30",
              )}
            >
              <div className="flex items-center gap-2">
                <Trophy className={cn("h-5 w-5 text-yellow-600", isCyberpunk && "text-cyan-500")} />
                <span className={cn("font-medium text-gray-800", isCyberpunk && "text-cyan-300")}>Wins</span>
              </div>
              <span className={cn("font-bold text-lg text-gray-900", isCyberpunk && "text-cyan-400")}>
                {userStats.wins}
              </span>
            </div>

            {/* Win Rate */}
            <div
              className={cn(
                "flex items-center justify-between p-3 bg-gray-100 rounded-md border border-gray-300",
                isCyberpunk && "bg-black/50 border-cyan-500/30",
              )}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className={cn("h-5 w-5 text-green-600", isCyberpunk && "text-cyan-500")} />
                <span className={cn("font-medium text-gray-800", isCyberpunk && "text-cyan-300")}>Win Rate</span>
              </div>
              <span className={cn("font-bold text-lg text-gray-900", isCyberpunk && "text-cyan-400")}>
                {userStats.winRate}%
              </span>
            </div>

            {/* Tokens Swapped */}
            <div
              className={cn(
                "flex items-center justify-between p-3 bg-gray-100 rounded-md border border-gray-300",
                isCyberpunk && "bg-black/50 border-cyan-500/30",
              )}
            >
              <div className="flex items-center gap-2">
                <ArrowLeftRight className={cn("h-5 w-5 text-purple-600", isCyberpunk && "text-cyan-500")} />
                <span className={cn("font-medium text-gray-800", isCyberpunk && "text-cyan-300")}>Tokens Swapped</span>
              </div>
              <span className={cn("font-mono font-bold text-gray-900", isCyberpunk && "text-cyan-400")}>
                {userStats.tokensSwapped.toFixed(2)}
              </span>
            </div>

            {/* Achievement Badge */}
            <div className="pt-2">
              <Badge
                variant="outline"
                className={cn(
                  "w-full justify-center py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border-orange-300",
                  isCyberpunk && "bg-gradient-to-r from-cyan-900/30 to-purple-900/30 text-cyan-300 border-cyan-500/50",
                )}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Rising Star Player
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
