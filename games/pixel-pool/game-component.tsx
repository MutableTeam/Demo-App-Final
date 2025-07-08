import { Card, CardContent } from "@/components/ui/card"
import { PocketIcon as Pool } from "lucide-react"

export default function PixelPoolGameComponent() {
  return (
    <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <CardContent className="p-4 flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-yellow-100 p-6 rounded-md border-2 border-yellow-300 text-center">
          <Pool size={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Pixel Pool</h2>
          <p className="text-lg mb-4">Coming Soon!</p>
          <p>This game is currently in development and will be available in a future update.</p>
        </div>
      </CardContent>
    </Card>
  )
}
