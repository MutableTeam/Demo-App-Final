import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Target, Shield, Gamepad2, Smartphone, Monitor } from "lucide-react"
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
            <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              {isMobile ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
              <span>{isMobile ? "Mobile" : "Desktop"}</span>
            </div>
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
            <h3 className={cn("font-semibold mb-2 flex items-center gap-2", isMobile ? "text-base" : "text-lg")}>
              <Gamepad2 className={cn("h-4 w-4 text-green-500", isMobile && "h-3 w-3")} />
              Controls
            </h3>
            <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
              {isMobile ? (
                <div className="space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200 text-sm">Touch Controls</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Left Side
                        </Badge>
                        <span className="text-xs">Touch and drag to move ship</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Right Side
                        </Badge>
                        <span className="text-xs">Touch and drag to aim and shoot</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          DASH Button
                        </Badge>
                        <span className="text-xs">Quick evasive maneuver</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <strong>Tip:</strong> Rotate your device to landscape mode for the best gaming experience!
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">WASD</Badge>
                      <span className="text-sm">Move your ship</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Arrow Keys</Badge>
                      <span className="text-sm">Alternative movement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">SPACE</Badge>
                      <span className="text-sm">Shoot bullets</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">P</Badge>
                      <span className="text-sm">Pause game</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">R</Badge>
                      <span className="text-sm">Restart game</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <h3 className={cn("font-semibold mb-2 flex items-center gap-2", isMobile ? "text-base" : "text-lg")}>
              <Shield className={cn("h-4 w-4 text-purple-500", isMobile && "h-3 w-3")} />
              Gameplay Elements
            </h3>
            <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
              <div>
                <h4 className={cn("font-medium mb-2", isMobile ? "text-sm" : "text-base")}>Your Ship</h4>
                <ul className={cn("space-y-1 text-gray-600 dark:text-gray-400", isMobile ? "text-xs" : "text-sm")}>
                  <li>• Cyan triangular spacecraft</li>
                  <li>• Fast and maneuverable</li>
                  <li>• Shoots yellow energy bullets</li>
                  <li>• Can move in all directions</li>
                </ul>
              </div>
              <div>
                <h4 className={cn("font-medium mb-2", isMobile ? "text-sm" : "text-base")}>Enemy Types</h4>
                <ul className={cn("space-y-1 text-gray-600 dark:text-gray-400", isMobile ? "text-xs" : "text-sm")}>
                  <li>
                    • <span className="text-pink-500">Triangles</span> - Fast attackers
                  </li>
                  <li>
                    • <span className="text-green-500">Diamonds</span> - Balanced enemies
                  </li>
                  <li>
                    • <span className="text-purple-500">Hexagons</span> - Tough defenders
                  </li>
                  <li>• All enemies move toward your ship</li>
                </ul>
              </div>
            </div>
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

          <div>
            <h3 className={cn("font-semibold mb-2", isMobile ? "text-base" : "text-lg")}>Strategy Tips</h3>
            <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
              <ul className={cn("space-y-1 text-gray-600 dark:text-gray-400", isMobile ? "text-xs" : "text-sm")}>
                <li>• Keep moving to avoid enemy collisions</li>
                <li>• Use the edges of the screen strategically</li>
                <li>• Focus fire on closer enemies first</li>
                <li>• Watch for enemy movement patterns</li>
              </ul>
              <ul className={cn("space-y-1 text-gray-600 dark:text-gray-400", isMobile ? "text-xs" : "text-sm")}>
                <li>• Don't get cornered by multiple enemies</li>
                <li>• Time your shots to maximize hits</li>
                <li>• Each wave gets progressively harder</li>
                <li>• Practice makes perfect!</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <h4 className={cn("font-medium mb-2 text-blue-800 dark:text-blue-200", isMobile ? "text-sm" : "text-base")}>
              Game Features
            </h4>
            <ul className={cn("space-y-1 text-blue-700 dark:text-blue-300", isMobile ? "text-xs" : "text-sm")}>
              <li>• Retro geometric art style with neon colors</li>
              <li>• Smooth 60fps gameplay</li>
              <li>• Particle explosion effects</li>
              <li>• Progressive difficulty scaling</li>
              <li>• Synthwave-inspired visual design</li>
              {isMobile && <li>• Optimized for portrait and landscape modes</li>}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
