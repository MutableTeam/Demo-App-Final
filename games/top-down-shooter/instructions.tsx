"use client"

import { MousePointer, Target, TouchpadIcon } from "lucide-react"

interface GameInstructionsProps {
  platform: "desktop" | "mobile"
}

export function GameInstructions({ platform }: GameInstructionsProps) {
  return (
    <div className="text-center text-gray-300 text-lg">
      {platform === "desktop" ? (
        <div className="space-y-2">
          <p className="flex items-center justify-center gap-2">
            <span className="flex gap-1">
              <kbd className="px-2 py-1 text-sm bg-gray-700 rounded">W</kbd>
              <kbd className="px-2 py-1 text-sm bg-gray-700 rounded">A</kbd>
              <kbd className="px-2 py-1 text-sm bg-gray-700 rounded">S</kbd>
              <kbd className="px-2 py-1 text-sm bg-gray-700 rounded">D</kbd>
            </span>
            to Move
          </p>
          <p className="flex items-center justify-center gap-2">
            <MousePointer className="h-5 w-5" />
            Mouse to Aim & Click to Shoot
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="flex items-center justify-center gap-2">
            <TouchpadIcon className="h-5 w-5" />
            Touch Left Side to Move
          </p>
          <p className="flex items-center justify-center gap-2">
            <Target className="h-5 w-5" />
            Touch Right Side to Aim & Shoot
          </p>
        </div>
      )}
    </div>
  )
}
