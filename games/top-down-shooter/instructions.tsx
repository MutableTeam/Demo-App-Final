"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Keyboard, Mouse, Smartphone, Target, Heart, Trophy } from "lucide-react"
import type { PlatformType } from "@/contexts/platform-context"

interface GameInstructionsProps {
  platform: PlatformType
}

export function GameInstructions({ platform }: GameInstructionsProps) {
  const isMobile = platform === "mobile"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          How to Play
          <Badge variant="outline">{isMobile ? "Mobile" : "Desktop"}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              {isMobile ? <Smartphone className="h-4 w-4" /> : <Keyboard className="h-4 w-4" />}
              Controls
            </h4>
            <div className="space-y-2 text-sm">
              {isMobile ? (
                <>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Touch Left
                    </Badge>
                    <span>Move player</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Touch Right
                    </Badge>
                    <span>Aim & shoot</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      WASD
                    </Badge>
                    <span>Move player</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mouse className="h-3 w-3" />
                    <span>Aim with mouse</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Click
                    </Badge>
                    <span>Shoot</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Objective */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Objective
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Destroy red enemies</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-3 w-3 text-green-500" />
                <span>Avoid taking damage</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-3 w-3 text-yellow-500" />
                <span>Score as high as possible</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong>{" "}
            {isMobile
              ? "Use quick taps on the right side to shoot rapidly at enemies!"
              : "Keep moving and use precise mouse clicks to eliminate enemies efficiently!"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Also export as default to fix the import issue
export default GameInstructions
