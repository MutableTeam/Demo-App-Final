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
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="text-xs text-orange-400 mb-2 text-center font-semibold">TIMED ABILITIES</div>
          <div className="flex gap-4 justify-center">
            {timedAbilities.map((ability, index) => {
              const cooldownProgress =
                ability.cooldown > 0 ? (ability.maxCooldown - ability.cooldown) / ability.maxCooldown : 1

              return (
                <button
                  key={index}
                  onClick={() => onTimedAbilityClick && onTimedAbilityClick(index)}
                  className={`w-16 h-16 rounded-lg border-2 transition-all duration-200 relative overflow-hidden ${
                    ability.cooldown > 0
                      ? "border-gray-600 bg-gray-800/60 opacity-60"
                      : "border-orange-500 bg-orange-500/20 hover:bg-orange-500/30 hover:scale-105"
                  }`}
                  disabled={ability.cooldown > 0}
                  title={`${ability.name} - Press ${index === 0 ? "Q" : "E"} key`}
                >
                  <div className="flex flex-col items-center justify-center h-full relative z-10">
                    {index === 0 ? (
                      // Bomb Missile Icon
                      <div className="w-8 h-8 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-red-400">
                          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 13L13 11L15 9H13V7H21V9ZM12 8C15.31 8 18 10.69 18 14C18 17.31 15.31 20 12 20C8.69 20 6 17.31 6 14C6 10.69 8.69 8 12 8ZM12 10C9.79 10 8 11.79 8 14C8 16.21 9.79 18 12 18C14.21 18 16 16.21 16 14C16 11.79 14.21 10 12 10Z" />
                        </svg>
                      </div>
                    ) : (
                      // Pulse Beam Icon
                      <div className="w-8 h-8 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-green-400">
                          <path d="M2 12H4L6 9H8L10 12H12L14 9H16L18 12H20L22 9V15H20L18 12H16L14 15H12L10 12H8L6 15H4L2 12Z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {ability.cooldown > 0 && (
                    <div className="absolute inset-0 text-orange-400">{createCircularProgress(cooldownProgress)}</div>
                  )}
                </button>
              )
            })}
          </div>
          <div className="text-xs text-gray-400 mt-1 text-center">Press Q/E</div>
        </div>
      )}
    </div>
  )
}
