import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { GameMode } from "@/types/game-registry"

interface PvETestInstructionsProps {
  mode: GameMode
  isCyberpunk?: boolean
}

export default function PvETestInstructions({ mode, isCyberpunk }: PvETestInstructionsProps) {
  return (
    <Card className={cn("bg-black/10", isCyberpunk && "!bg-cyan-900/20 !border-cyan-500/30")}>
      <CardHeader>
        <CardTitle className="font-mono text-lg">PvE Test Instructions</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 list-disc pl-5">
          <li>This is a test game to demonstrate the PvE high-score challenge flow.</li>
          <li>Select a challenge and pay the entry fee to start.</li>
          <li>The actual game would be loaded from an external engine.</li>
          <li>At the end, your score would be submitted to the leaderboard for the selected challenge.</li>
        </ul>
      </CardContent>
    </Card>
  )
}
