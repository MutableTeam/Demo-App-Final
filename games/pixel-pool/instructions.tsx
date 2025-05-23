import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PocketIcon as Pool } from "lucide-react"

export default function PixelPoolInstructions() {
  return (
    <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader className="border-b-2 border-black">
        <div className="flex items-center gap-2">
          <div className="bg-[#FFD54F] p-1 rounded-md border border-black">
            <Pool size={16} />
          </div>
          <CardTitle className="font-mono">PIXEL POOL INSTRUCTIONS</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="bg-yellow-100 p-3 rounded-md border border-yellow-300">
          <p className="text-center font-bold">🚧 Game In Development 🚧</p>
          <p className="text-center">This game is currently being developed and will be available soon!</p>
        </div>

        <h3 className="font-bold">How To Play:</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Aim with your mouse</li>
          <li>Adjust power with the power meter</li>
          <li>Click to shoot</li>
          <li>Sink all your balls and then the 8-ball to win</li>
        </ul>
      </CardContent>
    </Card>
  )
}
