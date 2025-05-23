import type React from "react"
import { getGameById } from "@/games/registry"
import type { GameInfo } from "@/types/game-registry"
import type { GameProps } from "@/types/game-interface"

export class GameFactory {
  static createGame(gameId: string, props: Omit<GameProps, "gameId">): React.ReactNode | null {
    const gameInfo = getGameById(gameId)

    if (!gameInfo) {
      console.error(`Game with ID ${gameId} not found in registry`)
      return null
    }

    return gameInfo.component({
      gameId,
      ...props,
    })
  }

  static getGameInfo(gameId: string): GameInfo | undefined {
    return getGameById(gameId)
  }
}
