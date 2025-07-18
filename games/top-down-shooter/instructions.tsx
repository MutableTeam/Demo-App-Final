import { Keyboard, MousePointer, TouchpadIcon } from "lucide-react"

interface GameInstructionsProps {
  platform: "desktop" | "mobile"
}

export function GameInstructions({ platform }: GameInstructionsProps) {
  return (
    <div className="text-center text-white max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4">How to Play:</h3>
      {platform === "desktop" ? (
        <div className="space-y-2">
          <p className="flex items-center justify-center gap-2">
            <Keyboard className="h-5 w-5" /> Use <span className="font-bold">WASD</span> to Move
          </p>
          <p className="flex items-center justify-center gap-2">
            <MousePointer className="h-5 w-5" /> Use <span className="font-bold">Mouse</span> to Aim and Shoot
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="flex items-center justify-center gap-2">
            <TouchpadIcon className="h-5 w-5" /> Tap left side of screen to Move
          </p>
          <p className="flex items-center justify-center gap-2">
            <TouchpadIcon className="h-5 w-5" /> Tap right side of screen to Shoot
          </p>
        </div>
      )}
      <p className="mt-4 text-sm text-gray-300">Survive as long as you can against endless enemies!</p>
    </div>
  )
}
