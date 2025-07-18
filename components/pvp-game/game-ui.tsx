"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { GameState } from "./game-engine"

interface GameUIProps {
  gameState: GameState
  localPlayerId: string
  onAction?: (action: string) => void
  className?: string
}

export default function GameUI({ gameState, localPlayerId, onAction, className }: GameUIProps) {
  const [showStats, setShowStats] = useState(false)
  const localPlayer = gameState.players[localPlayerId]

  if (!localPlayer) return null

  return (
    <div className={`absolute inset-0 pointer-events-none ${className || ""}`}>
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
        {/* Player Stats */}
        <Card className="bg-black/80 border-cyan-400/50 text-cyan-400">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
              <div>
                <div className="font-mono text-sm">{localPlayer.name}</div>
                <div className="text-xs opacity-70">
                  HP: {localPlayer.health}/{localPlayer.maxHealth}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Timer */}
        <Card className="bg-black/80 border-cyan-400/50 text-cyan-400">
          <CardContent className="p-3">
            <div className="font-mono text-lg">
              {Math.floor(gameState.gameTime / 60)
                .toString()
                .padStart(2, "0")}
              :
              {Math.floor(gameState.gameTime % 60)
                .toString()
                .padStart(2, "0")}
            </div>
          </CardContent>
        </Card>

        {/* Score */}
        <Card className="bg-black/80 border-cyan-400/50 text-cyan-400">
          <CardContent className="p-3">
            <div className="font-mono">
              <div className="text-xs opacity-70">SCORE</div>
              <div className="text-lg">{localPlayer.score || 0}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Controls Info */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center pointer-events-auto">
        <Card className="bg-black/80 border-cyan-400/30 text-cyan-400/70">
          <CardContent className="p-2">
            <div className="flex gap-4 text-xs font-mono">
              <span>WASD: Move</span>
              <span>SPACE: Shoot</span>
              <span>SHIFT: Dash</span>
              <span>E: Special</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Effects */}
      <div className="absolute top-20 left-4 flex flex-col gap-2 pointer-events-auto">
        {localPlayer.isDashing && (
          <Badge variant="outline" className="bg-blue-500/20 border-blue-400 text-blue-300">
            DASHING
          </Badge>
        )}
        {localPlayer.isDrawingBow && (
          <Badge variant="outline" className="bg-yellow-500/20 border-yellow-400 text-yellow-300">
            DRAWING BOW
          </Badge>
        )}
        {localPlayer.isChargingSpecial && (
          <Badge variant="outline" className="bg-purple-500/20 border-purple-400 text-purple-300">
            CHARGING SPECIAL
          </Badge>
        )}
      </div>

      {/* Debug Toggle */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowStats(!showStats)}
          className="bg-black/80 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10"
        >
          {showStats ? "Hide Stats" : "Show Stats"}
        </Button>
      </div>

      {/* Extended Stats Panel */}
      {showStats && (
        <div className="absolute top-16 right-4 pointer-events-auto">
          <Card className="bg-black/90 border-cyan-400/50 text-cyan-400 w-64">
            <CardHeader>
              <CardTitle className="text-sm font-mono">GAME STATS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span>Players:</span>
                <span>{Object.keys(gameState.players).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Arrows:</span>
                <span>{gameState.arrows?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Walls:</span>
                <span>{gameState.walls?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Pickups:</span>
                <span>{gameState.pickups?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span>{gameState.gameStatus}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
