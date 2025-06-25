"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { PlayerState } from "@/hooks/usePlayerState"
import { ChevronDown, ChevronUp, Wifi, WifiOff, MessageSquareText } from "lucide-react"
import { cn } from "@/lib/utils"

interface ColyseusDebugWidgetProps {
  playerState: PlayerState
  colyseusLogs: string[]
}

export function ColyseusDebugWidget({ playerState, colyseusLogs }: ColyseusDebugWidgetProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Card className="fixed bottom-4 right-4 w-80 bg-white text-gray-900 shadow-lg z-[1000]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 border-b border-gray-200">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-800">
          <Wifi className={cn("h-4 w-4", playerState.isConnected ? "text-green-500" : "text-red-500")} />
          Colyseus Status
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="h-6 w-6 text-gray-500 hover:text-gray-700"
        >
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          <span className="sr-only">{isOpen ? "Collapse" : "Expand"}</span>
        </Button>
      </CardHeader>
      {isOpen && (
        <CardContent className="p-3 text-xs">
          <div className="mb-2 text-black">
            {" "}
            {/* Ensure all text here is black */}
            <p>
              <strong>Player:</strong> {playerState.username}
            </p>
            <p className="flex items-center gap-1">
              <strong>Connection:</strong>{" "}
              {playerState.isConnected ? (
                <span className="text-green-500 flex items-center">
                  <Wifi className="h-3 w-3 mr-1" /> Connected
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <WifiOff className="h-3 w-3 mr-1" /> Disconnected
                </span>
              )}
            </p>
            <p>
              <strong>Current Status:</strong> {playerState.status}
            </p>
            <div className="flex gap-2 mt-1">
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs text-white",
                  playerState.isInHub ? "bg-blue-600" : "bg-gray-600",
                )}
              >
                Hub: {playerState.isInHub ? `Yes (${playerState.totalPlayers} players)` : "No"}
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs text-white",
                  playerState.isInLobby ? "bg-blue-600" : "bg-gray-600",
                )}
              >
                Lobby: {playerState.isInLobby ? "Yes" : "No"}
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs text-white",
                  playerState.isInBattleRoom ? "bg-blue-600" : "bg-gray-600",
                )}
              >
                Battle: {playerState.isInBattleRoom ? "Yes" : "No"}
              </span>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <h4 className="font-semibold mb-1 flex items-center gap-1 text-gray-800">
              <MessageSquareText className="h-3 w-3" /> Logs:
            </h4>
            <div className="h-24 overflow-y-auto bg-gray-800 p-2 rounded">
              {colyseusLogs.length === 0 ? (
                <p className="text-gray-400">No logs yet.</p>
              ) : (
                colyseusLogs.map((logEntry, index) => (
                  <p key={index} className="text-[0.65rem] leading-tight mb-0.5 break-words text-gray-100">
                    {logEntry}
                  </p>
                ))
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
