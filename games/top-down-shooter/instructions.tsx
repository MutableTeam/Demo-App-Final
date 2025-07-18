"use client"

import { MousePointer, Target, TouchpadIcon } from "lucide-react"

interface GameInstructionsProps {
  platform: "desktop" | "mobile"
}

export function GameInstructions({ platform }: GameInstructionsProps) {
  return (
    <div className="text-center text-gray-300">
      <h3 className="text-xl font-semibold mb-2">How to Play:</h3>
      {platform === "desktop" ? (
        <div className="space-y-2">
          <p className="flex items-center justify-center gap-2">
            <span className="flex gap-1">
              <kbd className="px-2 py-1 text-xs bg-gray-700 rounded">W</kbd>
              <kbd className="px-2 py-1 text-xs bg-gray-700 rounded">A</kbd>
              <kbd className="px-2 py-1 text-xs bg-gray-700 rounded">S</kbd>
              <kbd className="px-2 py-1 text-xs bg-gray-700 rounded">D</kbd>
            </span>
            Move Player
          </p>
          <p className="flex items-center justify-center gap-2">
            <MousePointer className="h-4 w-4" />
            Aim with Mouse
          </p>
          <p className="flex items-center justify-center gap-2">
            <kbd className="px-2 py-1 text-xs bg-gray-700 rounded">Space</kbd> or Click to Shoot
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="flex items-center justify-center gap-2">
            <TouchpadIcon className="h-4 w-4" />
            Touch Left Side to Move
          </p>
          <p className="flex items-center justify-center gap-2">
            <Target className="h-4 w-4" />
            Touch Right Side to Aim & Shoot
          </p>
        </div>
      )}
      <p className="mt-4 text-sm">Survive as long as you can and defeat enemies!</p>
    </div>
  )
}
