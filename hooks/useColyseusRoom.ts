"use client"

import type React from "react"

import { useEffect } from "react"
import type { Room } from "colyseus.js"
import type { PlayerState } from "./usePlayerState"

export function useColyseusRoom(
  room: Room | null,
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>,
  log: (message: string, type?: "info" | "error" | "success") => void,
  roomName: string,
) {
  useEffect(() => {
    if (!room) return

    log(`Setting up handlers for ${roomName} (ID: ${room.id})`, "info")

    room.onLeave((code) => {
      log(`${roomName} left with code ${code}`, "info")
      setPlayerState((prev) => ({
        ...prev,
        isInHub: roomName === "Player Hub Room" ? false : prev.isInHub,
        isInLobby: roomName === "Player Lobby Room" ? false : prev.isInLobby,
        isInBattleRoom: roomName === "Player Battle Room" ? false : prev.isInBattleRoom,
        status: `${roomName} Left`,
        isReady: false, // Reset ready state on leave
      }))
    })

    room.onError((code, message) => {
      log(`${roomName} error: ${message} (Code: ${code})`, "error")
      setPlayerState((prev) => ({
        ...prev,
        status: `${roomName} Error: ${message}`,
      }))
    })

    return () => {
      // No explicit leave here, as it's handled by onLeave or external disconnect
      // This cleanup is for removing listeners if the room object changes or component unmounts
      log(`Cleaning up handlers for ${roomName}`, "info")
    }
  }, [room, setPlayerState, log, roomName])
}
