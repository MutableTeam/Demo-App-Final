"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skull, Trophy, Zap, Clock, Coins, Target, Clock3, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface LastStandInstructionsProps {
  mode?: any
  isCyberpunk?: boolean
}

export default function LastStandInstructions({ mode, isCyberpunk }: LastStandInstructionsProps) {
  return (
    <Card className="bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skull className="h-5 w-5" />
          <CardTitle className="font-mono">ARCHER ARENA: LAST STAND</CardTitle>
        </div>
        <CardDescription>Survive waves of undead enemies and compete for high scores</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode && (
          <div
            className={cn(
              "bg-black/10 p-4 rounded-md",
              isCyberpunk && "bg-black/50 border border-cyan-500/50 text-cyan-300/90",
            )}
          >
            <h3 className={cn("font-bold mb-2 flex items-center gap-2", isCyberpunk && "text-cyan-300")}>
              {mode.id === "practice" ? (
                <Target className={cn("h-4 w-4", isCyberpunk && "text-cyan-400")} />
              ) : mode.id === "hourly" ? (
                <Clock3 className={cn("h-4 w-4", isCyberpunk && "text-cyan-400")} />
              ) : (
                <Award className={cn("h-4 w-4", isCyberpunk && "text-cyan-400")} />
              )}
              {mode.name}
            </h3>
            <p className={cn("text-sm mb-3", isCyberpunk && "text-cyan-300/90")}>{mode.description}</p>

            <div className="space-y-2">
              {mode.entryFee > 0 && (
                <div className="flex items-start gap-2">
                  <div className={cn("font-bold min-w-[120px]", isCyberpunk && "text-cyan-400")}>
                    <Coins className={cn("h-4 w-4 inline mr-1", isCyberpunk && "text-cyan-400")} />
                    Entry Fee:
                  </div>
                  <div className={cn("text-sm flex items-center", isCyberpunk && "text-cyan-300")}>
                    <Image src="/images/mutable-token.png" alt="MUTB" width={16} height={16} className="mr-1" />
                    {mode.entryFee} MUTB
                  </div>
                </div>
              )}

              {mode.duration > 0 && (
                <div className="flex items-start gap-2">
                  <div className={cn("font-bold min-w-[120px]", isCyberpunk && "text-cyan-400")}>
                    <Clock className={cn("h-4 w-4 inline mr-1", isCyberpunk && "text-cyan-400")} />
                    Duration:
                  </div>
                  <div className={cn("text-sm", isCyberpunk && "text-cyan-300")}>
                    {mode.duration / (60 * 60 * 1000) >= 1
                      ? `${mode.duration / (60 * 60 * 1000)} hours`
                      : `${mode.duration / (60 * 1000)} minutes`}
                  </div>
                </div>
              )}

              {mode.leaderboardRefresh && (
                <div className="flex items-start gap-2">
                  <div className={cn("font-bold min-w-[120px]", isCyberpunk && "text-cyan-400")}>
                    <Trophy className={cn("h-4 w-4 inline mr-1", isCyberpunk && "text-cyan-400")} />
                    Leaderboard:
                  </div>
                  <div className={cn("text-sm", isCyberpunk && "text-cyan-300")}>{mode.leaderboardRefresh}</div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-black/10 p-4 rounded-md">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Skull className="h-4 w-4" /> Game Modes
          </h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="font-bold min-w-[120px]">Hourly Challenge</div>
              <div className="text-sm">Compete for the highest score in a 1-hour leaderboard. Entry fee: 5 MUTB.</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="font-bold min-w-[120px]">Daily Challenge</div>
              <div className="text-sm">Compete for the highest score in a 24-hour leaderboard. Entry fee: 10 MUTB.</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="font-bold min-w-[120px]">Practice Mode</div>
              <div className="text-sm">Practice against waves of undead with no entry fee.</div>
            </div>
          </div>
        </div>

        <div className="bg-black/10 p-4 rounded-md">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Skull className="h-4 w-4" /> Enemy Types
          </h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="font-bold min-w-[120px]">Skeleton</div>
              <div className="text-sm">Basic enemy. Fast but weak.</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="font-bold min-w-[120px]">Zombie</div>
              <div className="text-sm">Slow but tough. Deals more damage.</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="font-bold min-w-[120px]">Ghost</div>
              <div className="text-sm">Very fast and can move through obstacles. Low health.</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="font-bold min-w-[120px]">Necromancer</div>
              <div className="text-sm">Boss enemy. High health and damage. Worth many points.</div>
            </div>
          </div>
        </div>

        <div className="bg-black/10 p-4 rounded-md">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4" /> Controls
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>WASD / Arrows</div>
            <div>Move</div>
            <div>Mouse</div>
            <div>Aim</div>
            <div>Left Click</div>
            <div>Shoot Arrow</div>
            <div>Right Click / Q</div>
            <div>Special Attack</div>
            <div>Shift</div>
            <div>Dash</div>
            <div>ESC</div>
            <div>Pause</div>
          </div>
        </div>

        <div className="bg-black/10 p-4 rounded-md">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Trophy className="h-4 w-4" /> Scoring
          </h3>
          <div className="space-y-1 text-sm">
            <p>Your score is based on the enemies you defeat:</p>
            <ul className="list-disc pl-4">
              <li>Skeleton: 10 points</li>
              <li>Zombie: 20 points</li>
              <li>Ghost: 15 points</li>
              <li>Necromancer: 50 points</li>
            </ul>
            <p className="mt-2">The top players on the leaderboard when the time expires will share the pot:</p>
            <ul className="list-disc pl-4">
              <li>1st Place: 50% of pot</li>
              <li>2nd Place: 25% of pot</li>
              <li>3rd Place: 15% of pot</li>
              <li>4th-10th Place: Share remaining 10% of pot</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
