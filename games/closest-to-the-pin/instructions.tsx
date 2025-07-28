import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Target, Wind, GuitarIcon as Golf } from "lucide-react"

const ClosestToThePinInstructions = () => {
  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Golf className="h-6 w-6" />
            How to Play: Closest to the Pin
          </CardTitle>
          <CardDescription>
            The objective is simple: hit your golf ball as close to the hole as possible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-bold flex items-center gap-2">
              <Target className="h-5 w-5" /> The Goal
            </h3>
            <p>In each round, you'll take one shot. The player whose ball lands nearest to the pin wins the pot.</p>
          </div>
          <div>
            <h3 className="font-bold flex items-center gap-2">
              <Wind className="h-5 w-5" /> Controls
            </h3>
            <ul className="list-disc list-inside pl-4">
              <li>
                <strong>Aim:</strong> Use your mouse or finger to set the direction of your shot.
              </li>
              <li>
                <strong>Power:</strong> Click and hold (or tap and hold) to start the power meter. Release at the
                desired power level.
              </li>
              <li>
                <strong>Club Selection:</strong> Choose from different clubs (Driver, Iron, Wedge) to affect your shot's
                distance and trajectory.
              </li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground pt-4">
            This game is currently in development. Controls and features are subject to change.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default ClosestToThePinInstructions
