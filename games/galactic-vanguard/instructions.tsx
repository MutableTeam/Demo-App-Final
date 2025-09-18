import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Target, Shield, Gamepad2 } from "lucide-react"

export default function GalacticVanguardInstructions() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Galactic Vanguard - Game Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Objective
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Survive as long as possible against endless waves of geometric enemies in this retro-style space shooter.
              Each wave brings more enemies and increased difficulty. Rack up points by destroying enemies and see how
              many waves you can survive!
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-green-500" />
              Controls
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              Gameplay Elements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Your Ship</h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Cyan triangular spacecraft</li>
                  <li>• Fast and maneuverable</li>
                  <li>• Shoots yellow energy bullets</li>
                  <li>• Can move in all directions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Enemy Types</h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
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
            <h3 className="text-lg font-semibold mb-3">Scoring System</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <ul className="space-y-2 text-sm">
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
            <h3 className="text-lg font-semibold mb-3">Strategy Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Keep moving to avoid enemy collisions</li>
                <li>• Use the edges of the screen strategically</li>
                <li>• Focus fire on closer enemies first</li>
                <li>• Watch for enemy movement patterns</li>
              </ul>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Don't get cornered by multiple enemies</li>
                <li>• Time your shots to maximize hits</li>
                <li>• Each wave gets progressively harder</li>
                <li>• Practice makes perfect!</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Game Features</h4>
            <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-300">
              <li>• Retro geometric art style with neon colors</li>
              <li>• Smooth 60fps gameplay</li>
              <li>• Particle explosion effects</li>
              <li>• Progressive difficulty scaling</li>
              <li>• Synthwave-inspired visual design</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
