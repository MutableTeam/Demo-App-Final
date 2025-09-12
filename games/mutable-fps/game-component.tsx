"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crosshair, Users, Clock, Trophy } from "lucide-react"

interface MutableFPSGameComponentProps {
  gameState: any
  onGameAction: (action: any) => void
  playerId: string
}

export default function MutableFPSGameComponent({ gameState, onGameAction, playerId }: MutableFPSGameComponentProps) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <Card className="p-8 bg-black/80 border-cyan-500/50 text-center max-w-md">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-cyan-500/20 rounded-full border border-cyan-500/50">
              <Crosshair className="h-12 w-12 text-cyan-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-cyan-400 font-mono">MUTABLE FPS</h2>
            <p className="text-cyan-300/70">Coming Soon</p>
          </div>

          <div className="space-y-3 text-sm text-cyan-300/60">
            <div className="flex items-center justify-center gap-2">
              <Users className="h-4 w-4" />
              <span>Up to 8 Players</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" />
              <span>5-15 min matches</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>Competitive FPS Action</span>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-xs text-cyan-300/50 mb-4">
              Intense cyberpunk FPS battles are currently in development. Get ready for fast-paced action in futuristic
              arenas!
            </p>
            <Button disabled className="w-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-400">
              In Development
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
