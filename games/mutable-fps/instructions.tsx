"use client"
import { Card } from "@/components/ui/card"
import { Crosshair, Target, Zap, Shield } from "lucide-react"

export default function MutableFPSInstructions() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-cyan-500/20 rounded-full border border-cyan-500/50">
              <Crosshair className="h-12 w-12 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-cyan-400 font-mono">MUTABLE FPS</h1>
          <p className="text-xl text-cyan-300/70">Cyberpunk Arena Combat</p>
        </div>

        {/* Game Overview */}
        <Card className="p-6 bg-black/80 border-cyan-500/50">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Game Overview</h2>
          <p className="text-cyan-300/80 leading-relaxed">
            Enter the neon-lit battlegrounds of Mutable FPS, where cyberpunk meets competitive shooting. Battle up to 8
            players in fast-paced arena combat using futuristic weapons and abilities. Master the art of cyber warfare
            in multiple game modes designed for intense PvP action.
          </p>
        </Card>

        {/* Game Modes */}
        <Card className="p-6 bg-black/80 border-cyan-500/50">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Game Modes</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-cyan-300">Deathmatch</h3>
              <p className="text-cyan-300/70 text-sm">
                Free-for-all combat where every player fights for themselves. First to reach the kill limit wins.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-cyan-300">Team Deathmatch</h3>
              <p className="text-cyan-300/70 text-sm">
                4v4 team-based combat. Coordinate with your team to dominate the battlefield.
              </p>
            </div>
          </div>
        </Card>

        {/* Controls & Features */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-black/80 border-cyan-500/50">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Target className="h-6 w-6" />
              Controls
            </h2>
            <div className="space-y-2 text-sm text-cyan-300/80">
              <div>
                <strong>WASD:</strong> Movement
              </div>
              <div>
                <strong>Mouse:</strong> Look around
              </div>
              <div>
                <strong>Left Click:</strong> Fire weapon
              </div>
              <div>
                <strong>Right Click:</strong> Aim down sights
              </div>
              <div>
                <strong>Space:</strong> Jump
              </div>
              <div>
                <strong>Shift:</strong> Sprint
              </div>
              <div>
                <strong>R:</strong> Reload
              </div>
              <div>
                <strong>E:</strong> Interact/Pick up
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-black/80 border-cyan-500/50">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Zap className="h-6 w-6" />
              Features
            </h2>
            <div className="space-y-2 text-sm text-cyan-300/80">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Cyberpunk weapons & abilities</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>Multiple arena environments</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Power-ups and upgrades</span>
              </div>
              <div className="flex items-center gap-2">
                <Crosshair className="h-4 w-4" />
                <span>Competitive ranking system</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Coming Soon Notice */}
        <Card className="p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/50">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-cyan-400">Coming Soon</h3>
            <p className="text-cyan-300/70">
              Mutable FPS is currently in development. Stay tuned for intense cyberpunk combat!
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
