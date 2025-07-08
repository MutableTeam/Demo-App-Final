import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { GameMode } from "@/types/game-registry"

interface PvPTestInstructionsProps {
  mode: GameMode
  isCyberpunk?: boolean
}

export default function PvPTestInstructions({ mode, isCyberpunk }: PvPTestInstructionsProps) {
  return (
    <Card className={cn("bg-black/10", isCyberpunk && "!bg-cyan-900/20 !border-cyan-500/30")}>
      <CardHeader>
        <CardTitle className="font-mono text-lg">PvP Test Instructions</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 list-disc pl-5">
          <li>This is a test game to demonstrate the PvP lobby flow.</li>
          <li>Join or create a game to enter the waiting room.</li>
          <li>Once the lobby is full, the game will start.</li>
          <li>The actual game would be loaded from an external engine.</li>
        </ul>
      </CardContent>
    </Card>
  )
}
