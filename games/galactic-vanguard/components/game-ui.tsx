"use client"

export default function GameUI({ score, health, maxHealth, timedAbilities, onTimedAbilityClick }) {
  const healthPercentage = (health / maxHealth) * 100

  const createCircularProgress = (progress) => {
    const radius = 20
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference * (1 - progress)

    return (
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-100"
        />
      </svg>
    )
  }

  return (
    <div className="absolute top-4 left-4 right-4 bottom-4 z-10 pointer-events-none text-white font-bold">
      <div className="absolute top-0 left-0 text-left">
        <p className="text-sm text-cyan-400" style={{ textShadow: "0 0 5px #06b6d4" }}>
          SCORE
        </p>
        <p className="text-2xl" style={{ textShadow: "0 0 8px #fff" }}>
          {score.toLocaleString()}
        </p>
      </div>

      <div className="absolute top-16 left-0 w-48">
        <p className="text-sm text-red-400 mb-1" style={{ textShadow: "0 0 5px #f87171" }}>
          HULL INTEGRITY
        </p>
        <div className="w-full h-3 bg-gray-800 border border-red-500 rounded">
          <div
            className={`h-full rounded-sm transition-all duration-300 ${
              healthPercentage > 60 ? "bg-green-500" : healthPercentage > 30 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
      </div>

      {timedAbilities && timedAbilities.length > 0 && (
        <>
          {/* Left side button - Bomb Missile */}
          <div className="absolute left-4 bottom-20 z-30 pointer-events-auto">
            <button
              onClick={() => onTimedAbilityClick && onTimedAbilityClick(0)}
              className={`w-16 h-16 rounded-xl border-2 transition-all duration-200 relative overflow-hidden shadow-lg ${
                timedAbilities[0]?.cooldown > 0
                  ? "border-gray-600 bg-gray-800/80 opacity-60"
                  : "border-orange-500 bg-orange-500/30 hover:bg-orange-500/40 active:bg-orange-500/50 hover:scale-105 shadow-orange-500/50 shadow-2xl animate-pulse"
              }`}
              disabled={timedAbilities[0]?.cooldown > 0}
              style={
                timedAbilities[0]?.cooldown > 0
                  ? {}
                  : {
                      boxShadow: "0 0 20px rgba(249, 115, 22, 0.6), 0 0 40px rgba(249, 115, 22, 0.3)",
                    }
              }
            >
              <div className="flex items-center justify-center h-full relative z-10">
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-orange-400 stroke-orange-300" strokeWidth="1">
                    {/* Missile body - main triangle */}
                    <path d="M12 2L16 10H8L12 2Z" fill="currentColor" />
                    {/* Explosion burst - diamond shape */}
                    <path d="M12 10L18 12L12 14L6 12L12 10Z" fill="currentColor" />
                    {/* Bottom explosion */}
                    <path d="M12 14L15 20L12 18L9 20L12 14Z" fill="currentColor" />
                    {/* Side fins for missile look */}
                    <path d="M8 8L4 10L8 12Z" fill="currentColor" />
                    <path d="M16 8L20 10L16 12Z" fill="currentColor" />
                  </svg>
                </div>
              </div>

              {timedAbilities[0]?.cooldown > 0 && (
                <div className="absolute inset-0 text-orange-400">
                  {createCircularProgress(
                    (timedAbilities[0].maxCooldown - timedAbilities[0].cooldown) / timedAbilities[0].maxCooldown,
                  )}
                </div>
              )}
            </button>
          </div>

          {/* Right side button - Pulse Beam */}
          <div className="absolute right-4 bottom-20 z-30 pointer-events-auto">
            <button
              onClick={() => onTimedAbilityClick && onTimedAbilityClick(1)}
              className={`w-16 h-16 rounded-xl border-2 transition-all duration-200 relative overflow-hidden shadow-lg ${
                timedAbilities[1]?.cooldown > 0
                  ? "border-gray-600 bg-gray-800/80 opacity-60"
                  : "border-green-500 bg-green-500/30 hover:bg-green-500/40 active:bg-green-500/50 hover:scale-105 shadow-green-500/50 shadow-2xl animate-pulse"
              }`}
              disabled={timedAbilities[1]?.cooldown > 0}
              style={
                timedAbilities[1]?.cooldown > 0
                  ? {}
                  : {
                      boxShadow: "0 0 20px rgba(34, 197, 94, 0.6), 0 0 40px rgba(34, 197, 94, 0.3)",
                    }
              }
            >
              <div className="flex items-center justify-center h-full relative z-10">
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-green-400">
                    {/* Concentric pulse rings */}
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" />
                    {/* Energy beam lines */}
                    <path d="M12 4L12 8M12 16L12 20M4 12L8 12M16 12L20 12" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>

              {timedAbilities[1]?.cooldown > 0 && (
                <div className="absolute inset-0 text-orange-400">
                  {createCircularProgress(
                    (timedAbilities[1].maxCooldown - timedAbilities[1].cooldown) / timedAbilities[1].maxCooldown,
                  )}
                </div>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
