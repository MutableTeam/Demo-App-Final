import type { Player } from "../../shared/types"
import type { GameState } from "../../shared/game-state"

const drawUI = (ctx: CanvasRenderingContext2D, player: Player, gameState: GameState) => {
  // Draw bow charge indicator
  if (player.isDrawingBow) {
    const chargePercentage = Math.min(1, (Date.now() - player.bowDrawStartTime) / player.bowChargeDuration)
    const barWidth = 100
    const barHeight = 10
    const x = player.x - barWidth / 2
    const y = player.y + player.radius + 10

    ctx.fillStyle = "gray"
    ctx.fillRect(x, y, barWidth, barHeight)

    ctx.fillStyle = "green"
    ctx.fillRect(x, y, barWidth * chargePercentage, barHeight)
  }

  // Draw timer
  const timeLeft = Math.max(0, gameState.gameEndTime - Date.now())
  const minutes = Math.floor(timeLeft / 60000)
  const seconds = Math.floor((timeLeft % 60000) / 1000)
  const timeLeftString = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`

  ctx.font = "20px Arial"
  ctx.fillStyle = "white"
  ctx.textAlign = "center"
  ctx.fillText(timeLeftString, gameState.arenaSize.width / 2, 30)

  // Draw scoreboard
  ctx.textAlign = "right"
  ctx.fillText(`Score: ${player.score}`, gameState.arenaSize.width - 20, 30)

  // Draw game over screen
  if (gameState.isGameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fillRect(0, 0, gameState.arenaSize.width, gameState.arenaSize.height)

    ctx.font = "40px Arial"
    ctx.fillStyle = "white"
    ctx.textAlign = "center"
    ctx.fillText("Game Over", gameState.arenaSize.width / 2, gameState.arenaSize.height / 2 - 20)
    ctx.fillText(`Your Score: ${player.score}`, gameState.arenaSize.width / 2, gameState.arenaSize.height / 2 + 30)
  }
}

export const enhancedGameRenderer = (ctx: CanvasRenderingContext2D, player: Player, gameState: GameState) => {
  drawUI(ctx, player, gameState)
}
