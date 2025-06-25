"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown } from "lucide-react"
import type { PlayerState } from "@/hooks/usePlayerState" // Assuming PlayerState is exported from here

interface ColyseusDebugWidgetProps {
  playerState: PlayerState
  colyseusLogs: string[]
}

export function ColyseusDebugWidget({ playerState, colyseusLogs }: ColyseusDebugWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [colyseusLogs])

  const getStatusColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-500"
      case "error":
        return "text-red-500"
      case "warning":
        return "text-yellow-500"
      case "info":
      default:
        return "text-blue-400"
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 bg-gray-900 text-white border border-gray-700 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between p-3 pb-2">
          <CardTitle className="text-sm font-bold text-cyan-400">Colyseus Debug</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="h-6 w-6 text-gray-400 hover:text-white"
          >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </CardHeader>
        {isOpen && (
          <CardContent className="p-3 pt-0 text-xs">
            <div className="mb-2">
              <p>
                <span className="font-semibold">Status:</span>{" "}
                <span className={getStatusColor(playerState.status.type)}>{playerState.status.text}</span>{" "}
                {/* FIX: Render .text property */}
              </p>
              <p>
                <span className="font-semibold">Connected:</span> {playerState.isConnected ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-semibold">In Hub:</span> {playerState.isInHub ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-semibold">In Lobby:</span> {playerState.isInLobby ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-semibold">In Battle Room:</span> {playerState.isInBattleRoom ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-semibold">Ready:</span> {playerState.isReady ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-semibold">Total Players (Hub):</span> {playerState.totalPlayers}
              </p>
              <p>
                <span className="font-semibold">Lobby Players:</span> {playerState.battleRoomPlayers}
              </p>
              <p>
                <span className="font-semibold">Lobby Ready:</span> {playerState.battleRoomReadyCount}
              </p>
              <p>
                <span className="font-semibold">Game Session:</span>{" "}
                {playerState.gameSessionActive ? playerState.gameSessionType : "None"}
              </p>
              <p>
                <span className="font-semibold">Username:</span> {playerState.username}
              </p>
              <p>
                <span className="font-semibold">SOL Balance:</span> {playerState.solBalance?.toFixed(4) ?? "N/A"}
              </p>
              <p>
                <span className="font-semibold">MUTB Balance:</span> {playerState.mutbBalance?.toFixed(2) ?? "N/A"}
              </p>
            </div>
            <h4 className="font-semibold mb-1 text-cyan-400">Logs:</h4>
            <ScrollArea className="h-32 w-full rounded-md border border-gray-700 p-2 bg-gray-800">
              {colyseusLogs.length === 0 ? (
                <p className="text-gray-500">No logs yet.</p>
              ) : (
                colyseusLogs.map((log, index) => (
                  <p key={index} className="text-gray-300 break-words text-[0.6rem] leading-tight mb-1">
                    {log}
                  </p>
                ))
              )}
              <div ref={logsEndRef} />
            </ScrollArea>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
