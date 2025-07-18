"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, ExternalLink, Sparkles } from "lucide-react"

export function DemoWatermark() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-orange-200 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-600" />
              <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">DEMO</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 hover:bg-orange-100"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900">Mutable Gaming Platform Demo</p>
            <p className="text-xs text-gray-600">
              This is a demonstration of the Mutable gaming platform. Connect your wallet to explore games and features.
            </p>
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7 border-orange-200 text-orange-700 hover:bg-orange-50 bg-transparent"
                onClick={() => window.open("https://mutable.ai", "_blank")}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Learn More
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DemoWatermark
