"use client"
import type { GameState } from "./game-engine"

interface DebugOverlayProps {
  gameState: GameState
  localPlayerId: string
  aiControllers: Record<string, any>
}

export function DebugOverlay({ gameState, localPlayerId, aiControllers }: DebugOverlayProps) {
  const aiPlayers = Object.values(gameState.players).filter((p) => p.id !== localPlayerId)

  return (
    <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-md">
      <h3 className="text-sm font-bold mb-2">Debug Information</h3>

      {/* Game State */}
      <div className="mb-3">
        <h4 className="font-semibold">Game State:</h4>
        <div>Time: {gameState.gameTime.toFixed(1)}s</div>
        <div>Players: {Object.keys(gameState.players).length}</div>
        <div>Arrows: {gameState.arrows?.length || 0}</div>
        <div>Game Over: {gameState.isGameOver ? "Yes" : "No"}</div>
      </div>

      {/* Local Player */}
      {gameState.players[localPlayerId] && (
        <div className="mb-3">
          <h4 className="font-semibold">Local Player:</h4>
          <div>Health: {gameState.players[localPlayerId].health}</div>
          <div>
            Position: ({Math.round(gameState.players[localPlayerId].position.x)},{" "}
            {Math.round(gameState.players[localPlayerId].position.y)})
          </div>
          <div>Rotation: {gameState.players[localPlayerId].rotation.toFixed(2)}</div>
          <div>Animation: {gameState.players[localPlayerId].animationState}</div>
        </div>
      )}

      {/* AI Players */}
      <div className="mb-3">
        <h4 className="font-semibold">AI Players:</h4>
        {aiPlayers.map((player) => {
          const controller = aiControllers[player.id]
          return (
            <div key={player.id} className="ml-2 mb-2 border-l border-gray-600 pl-2">
              <div className="font-medium">{player.name}</div>
              <div>
                Health: {player.health} | Lives: {player.lives}
              </div>
              <div>
                Pos: ({Math.round(player.position.x)}, {Math.round(player.position.y)})
              </div>
              <div>Rot: {player.rotation.toFixed(2)}</div>
              <div>Animation: {player.animationState}</div>
              <div>Drawing Bow: {player.isDrawingBow ? "Yes" : "No"}</div>
              {controller && (
                <div className="text-gray-300">
                  <div>Target: {controller.state?.targetId || "None"}</div>
                  <div>Behavior: {controller.state?.currentBehavior || "Unknown"}</div>
                  <div>Controls: {JSON.stringify(player.controls)}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Performance */}
      <div>
        <h4 className="font-semibold">Performance:</h4>
        <div>FPS: {Math.round(1000 / 16)} (estimated)</div>
        <div>AI Controllers: {Object.keys(aiControllers).length}</div>
      </div>
    </div>
  )
}
