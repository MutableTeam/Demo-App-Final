import type { GameState } from "./game-engine"

interface DebugOverlayProps {
  gameState: GameState
  localPlayerId: string
  visible: boolean
}

export function DebugOverlay({ gameState, localPlayerId, visible }: DebugOverlayProps) {
  if (!visible) {
    return null
  }

  const localPlayer = gameState.players[localPlayerId]

  return (
    <div className="absolute top-0 left-0 p-2 bg-black bg-opacity-50 text-white text-xs font-mono z-50 pointer-events-none">
      <h3 className="font-bold text-sm mb-2">Debug Overlay</h3>
      <div>Game Time: {gameState.gameTime.toFixed(2)}s</div>
      <div>Is Game Over: {gameState.isGameOver.toString()}</div>
      <div>Winner: {gameState.winner || "None"}</div>
      <div className="mt-2 font-bold">Players ({Object.keys(gameState.players).length}):</div>
      {Object.values(gameState.players).map((player) => (
        <div key={player.id} className="mt-1 pl-2 border-l border-gray-600">
          <div>
            ID: {player.name} {player.id === localPlayerId ? "(You)" : ""}
          </div>
          <div>Health: {player.health}</div>
          <div>
            Position: ({player.position.x.toFixed(0)}, {player.position.y.toFixed(0)})
          </div>
          <div>Rotation: {player.rotation.toFixed(2)}</div>
          <div>Drawing Bow: {player.isDrawingBow.toString()}</div>
          <div>Controls: {JSON.stringify(player.controls)}</div>
        </div>
      ))}
      <div className="mt-2 font-bold">Projectiles ({gameState.projectiles.length}):</div>
      {/* You can add projectile info here if needed */}
    </div>
  )
}
