"use client"
import { Skull, Trophy, Zap, Clock, Coins, Target, Clock3, Award, Touchpad } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { usePlatform } from "@/contexts/platform-context"

interface LastStandInstructionsProps {
  mode?: any
  isCyberpunk?: boolean
}

export default function LastStandInstructions({ mode, isCyberpunk }: LastStandInstructionsProps) {
  const { platformType } = usePlatform()
  const isMobile = platformType === "mobile"

  return (
    <div className="space-y-4">
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
              <div className="flex items-center">
                <div className={cn("font-bold w-32 flex items-center", isCyberpunk && "text-cyan-400")}>
                  <Coins className={cn("h-4 w-4 mr-2", isCyberpunk && "text-cyan-400")} />
                  Entry Fee:
                </div>
                <div className={cn("text-sm flex items-center", isCyberpunk && "text-cyan-300")}>
                  <Image src="/images/mutable-token.png" alt="MUTB" width={16} height={16} className="mr-1" />
                  {mode.entryFee} MUTB
                </div>
              </div>
            )}

            {mode.duration > 0 && (
              <div className="flex items-center">
                <div className={cn("font-bold w-32 flex items-center", isCyberpunk && "text-cyan-400")}>
                  <Clock className={cn("h-4 w-4 mr-2", isCyberpunk && "text-cyan-400")} />
                  Duration:
                </div>
                <div className={cn("text-sm", isCyberpunk && "text-cyan-300")}>
                  {mode.duration / (60 * 60 * 1000) >= 1
                    ? `${mode.duration / (60 * 60 * 1000)} hour${mode.duration / (60 * 60 * 1000) > 1 ? "s" : ""}`
                    : `${mode.duration / (60 * 1000)} minutes`}
                </div>
              </div>
            )}

            {mode.leaderboardRefresh && (
              <div className="flex items-center">
                <div className={cn("font-bold w-32 flex items-center", isCyberpunk && "text-cyan-400")}>
                  <Trophy className={cn("h-4 w-4 mr-2", isCyberpunk && "text-cyan-400")} />
                  Leaderboard:
                </div>
                <div className={cn("text-sm", isCyberpunk && "text-cyan-300")}>{mode.leaderboardRefresh}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={cn("bg-black/10 p-4 rounded-md", isCyberpunk && "bg-black/50 border border-cyan-500/50")}>
        <h3 className={cn("font-bold mb-2 flex items-center gap-2", isCyberpunk && "text-cyan-300")}>
          <Skull className={cn("h-4 w-4", isCyberpunk && "text-cyan-400")} /> Game Modes
        </h3>
        <div className={cn("space-y-2", isCyberpunk && "text-cyan-300/90")}>
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

      <div className={cn("bg-black/10 p-4 rounded-md", isCyberpunk && "bg-black/50 border border-cyan-500/50")}>
        <h3 className={cn("font-bold mb-2 flex items-center gap-2", isCyberpunk && "text-cyan-300")}>
          <Skull className={cn("h-4 w-4", isCyberpunk && "text-cyan-400")} /> Enemy Types
        </h3>
        <div className={cn("space-y-2", isCyberpunk && "text-cyan-300/90")}>
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

      <div className={cn("bg-black/10 p-4 rounded-md", isCyberpunk && "bg-black/50 border border-cyan-500/50")}>
        <h3 className={cn("font-bold mb-2 flex items-center gap-2", isCyberpunk && "text-cyan-300")}>
          <Zap className={cn("h-4 w-4", isCyberpunk && "text-cyan-400")} /> Controls
        </h3>
        {isMobile ? (
          <div className={cn("space-y-3 text-sm", isCyberpunk && "text-cyan-300/90")}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="font-medium flex items-center gap-2">
                <Touchpad size={14} /> Left Joystick
              </div>
              <div>Move Character</div>
              <div className="font-medium flex items-center gap-2">
                <Touchpad size={14} /> Right Joystick
              </div>
              <div>Aim & Shoot</div>
              <div className="font-medium">Dash Button</div>
              <div>Quick Dodge</div>
              <div className="font-medium">Special Button</div>
              <div>Charge Special Attack</div>
            </div>
            <div
              className={cn("mt-4 p-3 rounded-md text-xs space-y-1", isCyberpunk ? "bg-cyan-900/20" : "bg-black/20")}
            >
              <p className={cn("font-bold mb-1", isCyberpunk && "text-cyan-300")}>How to Play on Mobile:</p>
              <p>• Touch the left side of the screen to show the movement joystick.</p>
              <p>• Touch the right side to show the aiming joystick. Drag to aim, release to fire.</p>
              <p>• Use the dedicated on-screen buttons for Dash and Special Attack.</p>
            </div>
          </div>
        ) : (
          <div className={cn("grid grid-cols-2 gap-2 text-sm", isCyberpunk && "text-cyan-300/90")}>
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
        )}
      </div>

      <div className={cn("bg-black/10 p-4 rounded-md", isCyberpunk && "bg-black/50 border border-cyan-500/50")}>
        <h3 className={cn("font-bold mb-2 flex items-center gap-2", isCyberpunk && "text-cyan-300")}>
          <Trophy className={cn("h-4 w-4", isCyberpunk && "text-cyan-400")} /> Scoring
        </h3>
        <div className={cn("space-y-1 text-sm", isCyberpunk && "text-cyan-300/90")}>
          <p>Your score is based on the enemies you defeat:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Skeleton: 10 points</li>
            <li>Zombie: 20 points</li>
            <li>Ghost: 15 points</li>
            <li>Necromancer: 50 points</li>
          </ul>
          <p className="mt-2 pt-2 border-t border-white/10">
            The top players on the leaderboard when the time expires will share the pot:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>1st Place: 50% of pot</li>
            <li>2nd Place: 25% of pot</li>
            <li>3rd Place: 15% of pot</li>
            <li>4th-10th Place: Share remaining 10% of pot</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
