"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Rocket, Target, Zap, Smartphone } from "lucide-react"

export default function StartScreen({ onStart, playerName, setPlayerName, isMobile }) {
  return (
    <div className="absolute inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-30 p-4">
      <Card
        className={`bg-gradient-to-b from-gray-900 to-black border-cyan-500 border-2 shadow-2xl shadow-cyan-500/20 ${
          isMobile ? "w-full max-w-sm p-6" : "max-w-md w-full p-8"
        }`}
      >
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
                <Rocket className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1
              className={`font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent ${
                isMobile ? "text-2xl" : "text-3xl"
              }`}
            >
              SPACE DEFENDER
            </h1>
            <p className="text-gray-400 text-sm">
              {isMobile ? "Touch-optimized space combat" : "Defend humanity against the alien invasion"}
            </p>
          </div>

          <div className="space-y-4 text-left">
            <Label htmlFor="playerName" className="text-cyan-400 font-semibold">
              Pilot Name
            </Label>
            <Input
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="bg-black/60 border-cyan-500 text-white placeholder-gray-500"
              placeholder="Enter your call sign..."
              maxLength={20}
            />
          </div>

          <div className="space-y-3 text-sm text-gray-300">
            {isMobile ? (
              <>
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>Touch anywhere on screen to move</span>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span>Dual auto-firing weapons</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-green-400" />
                  <span>Mobile-optimized gameplay</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <span>Auto-firing weapons system</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span>3 enemy types with unique behaviors</span>
                </div>
                <div className="flex items-center gap-3">
                  <Rocket className="w-4 h-4 text-green-400" />
                  <span>Difficulty increases over time</span>
                </div>
              </>
            )}
          </div>

          <Button
            onClick={onStart}
            className={`w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/30 transition-all duration-300 ${
              isMobile ? "py-4 text-lg" : "py-3"
            }`}
            disabled={!playerName.trim()}
          >
            LAUNCH MISSION
          </Button>

          <div className="text-xs text-gray-500 space-y-1">
            {isMobile ? (
              <>
                <p>Touch and drag anywhere to move your ship</p>
                <p>Joystick appears where you touch</p>
              </>
            ) : (
              <>
                <p>Desktop: Use WASD or Arrow Keys</p>
                <p>Mobile: Touch controls available</p>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
