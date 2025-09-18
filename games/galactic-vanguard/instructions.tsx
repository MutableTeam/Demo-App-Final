import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface GalacticVanguardInstructionsProps {
  mode?: any
  isCyberpunk?: boolean
  isMobile?: boolean
}

export default function GalacticVanguardInstructions({
  mode,
  isCyberpunk,
  isMobile,
}: GalacticVanguardInstructionsProps) {
  return (
    <div className={cn("space-y-4", isMobile ? "p-2" : "max-w-4xl mx-auto p-6")}>
      <Card className={cn(isCyberpunk && "!bg-black/60 !border-cyan-500/30")}>
        <CardHeader className={cn(isMobile ? "p-3" : "p-4")}>
          <CardTitle className={cn("flex items-center gap-2", isMobile ? "text-lg" : "text-xl")}>
            <Zap className={cn("h-5 w-5 text-yellow-500", isMobile && "h-4 w-4")} />
            Galactic Vanguard - Game Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className={cn("space-y-4", isMobile ? "p-3 text-sm" : "p-4")}>
          <div>
            <h3 className={cn("font-semibold mb-2 flex items-center gap-2", isMobile ? "text-base" : "text-lg")}>
              <Target className={cn("h-4 w-4 text-blue-500", isMobile && "h-3 w-3")} />
              Objective
            </h3>
            <p className={cn("text-gray-700 dark:text-gray-300 leading-relaxed", isMobile && "text-sm")}>
              Survive as long as possible against endless waves of geometric enemies in this retro-style space shooter.
              Each wave brings more enemies and increased difficulty. Rack up points by destroying enemies and see how
              many waves you can survive!
            </p>
          </div>

          <div>
            <h3 className={cn("font-semibold mb-2", isMobile ? "text-base" : "text-lg")}>Scoring System</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <ul className={cn("space-y-1", isMobile ? "text-xs" : "text-sm")}>
                <li>
                  • <strong>10 points</strong> per enemy destroyed (multiplied by current wave)
                </li>
                <li>
                  • <strong>Wave multiplier</strong> increases your score as you progress
                </li>
                <li>
                  • <strong>Survival bonus</strong> for lasting longer
                </li>
                <li>• Try to beat your high score!</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
