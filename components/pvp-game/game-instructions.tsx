"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"

export default function GameInstructions({ variant = "default" }: { variant?: "default" | "icon" }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {variant === "icon" ? (
          <Button
            variant="outline"
            size="icon"
            className="border-2 border-black text-black hover:bg-[#FFD54F] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            className="border-2 border-black text-black hover:bg-[#FFD54F] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            Game Instructions
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-2 border-black bg-[#fbf3de] z-50 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <DialogHeader>
          <DialogTitle className="font-mono">GAME INSTRUCTIONS</DialogTitle>
          <DialogDescription>How to play the bow and arrow game</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-bold mb-1">Controls</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Move with WASD or arrow keys</li>
              <li>Aim with mouse</li>
              <li>Hold Left-click to draw bow, release to fire</li>
              <li>The longer you draw, the more damage your arrow does</li>
              <li>Hold Right-click to charge special attack (fires three arrows)</li>
              <li>Press Shift to dash</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-1">Bow Mechanics</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                <span className="font-medium">Movement Penalty:</span> Moving at 40% speed while drawing your bow
              </li>
              <li>
                <span className="font-medium">Minimum Draw:</span> Must draw bow to at least 30% for effective shots
              </li>
              <li>
                <span className="font-medium">Weak Shots:</span> Arrows fired too quickly travel shorter distances and
                only do 1 damage
              </li>
              <li>
                <span className="font-medium">Full Draw:</span> Hold left-click for 1.5 seconds for maximum damage (25
                damage)
              </li>
              <li>
                <span className="font-medium">Special Attack:</span> Hold right-click to charge, releases 3 arrows in a
                spread pattern
              </li>
              <li>
                <span className="font-medium">Special Cooldown:</span> 5 seconds between special attacks
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-1">Game Modes</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                <span className="font-medium">1v1 Duel:</span> One life only! First to eliminate the opponent wins
              </li>
              <li>
                <span className="font-medium">Free-For-All:</span> Every player for themselves, highest score after 2
                minutes wins
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-1">Power-ups</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                <span className="font-medium">Shield:</span> Temporary invulnerability
              </li>
              <li>
                <span className="font-medium">Speed Boost:</span> Move faster for a short time
              </li>
              <li>
                <span className="font-medium">Quiver Upgrade:</span> Faster bow drawing for a short time
              </li>
              <li>
                <span className="font-medium">Health Pack:</span> Restore health
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-1">Rewards</h3>
            <p className="text-sm">
              Winners receive 95% of the total wager pool. 5% goes to the Mutable platform as a fee.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
