import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GuitarIcon as Golf } from "lucide-react"

const ClosestToThePinGameComponent = () => {
  return (
    <div className="flex items-center justify-center h-full bg-green-100">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Golf className="h-8 w-8" />
            Closest to the Pin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">Game in Development</p>
          <p className="text-muted-foreground">Get ready to test your swing! This game is coming soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default ClosestToThePinGameComponent
