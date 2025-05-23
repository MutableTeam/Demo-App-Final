import { Gamepad2, Target, Zap, Shield, Heart } from "lucide-react"

export default function Instructions() {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Target className="h-6 w-6" /> Archer Arena Instructions
      </h2>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" /> Controls
        </h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <span className="font-medium">Movement:</span> WASD or Arrow Keys
          </li>
          <li>
            <span className="font-medium">Aim:</span> Mouse
          </li>
          <li>
            <span className="font-medium">Shoot:</span> Left Mouse Button (hold to charge, release to fire)
          </li>
          <li>
            <span className="font-medium">Dash:</span> Space Bar
          </li>
          <li>
            <span className="font-medium">Special Attack:</span> Right Mouse Button
          </li>
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5" /> Bow Mechanics
        </h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <span className="font-medium">Draw Time:</span> Hold left mouse to draw your bow. The longer you draw, the
            more powerful your shot.
          </li>
          <li>
            <span className="font-medium">Movement Penalty:</span> Your movement speed is reduced to 40% while drawing
            your bow.
          </li>
          <li>
            <span className="font-medium">Minimum Draw:</span> You must draw your bow for at least 30% of full draw time
            for an effective shot.
          </li>
          <li>
            <span className="font-medium">Weak Shots:</span> Arrows fired before minimum draw will travel slower and
            fall to the ground quickly.
          </li>
          <li>
            <span className="font-medium">Full Draw:</span> Maximum damage and speed is achieved at full draw (1.5
            seconds).
          </li>
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" /> Special Abilities
        </h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <span className="font-medium">Dash:</span> Quick burst of speed in your movement direction. 2 second
            cooldown.
          </li>
          <li>
            <span className="font-medium">Triple Shot:</span> Fire three arrows in a spread pattern. 5 second cooldown.
          </li>
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Heart className="h-5 w-5" /> Game Modes
        </h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <span className="font-medium">Duel:</span> 1v1 battle. First to eliminate the opponent wins.
          </li>
          <li>
            <span className="font-medium">Free-For-All:</span> Up to 4 players. First to 10 kills or highest score when
            time expires wins.
          </li>
        </ul>
      </div>

      <div className="mt-4 p-3 bg-amber-100 border border-amber-300 rounded-md">
        <p className="text-amber-800 font-medium">
          Tip: Position yourself strategically before drawing your bow, as your movement will be limited while aiming.
          Make sure to fully draw your bow for maximum damage and range!
        </p>
      </div>
    </div>
  )
}
