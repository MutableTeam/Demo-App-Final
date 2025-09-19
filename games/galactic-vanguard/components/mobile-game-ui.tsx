"use client"

export default function MobileGameUI({ score, timedAbilities, onTimedAbilityClick }) {
  const createCircularProgress = (progress) => {
    const radius = 28
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference * (1 - progress)

    return (
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-100"
        />
      </svg>
    )
  }

  return (
    <>
      {/* Game overlay UI */}
      <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none text-white font-bold">
        <div className="absolute top-0 left-0 text-left">
          <p className="text-sm text-cyan-400" style={{ textShadow: "0 0 5px #06b6d4" }}>
            SCORE
          </p>
          <p className="text-xl" style={{ textShadow: "0 0 8px #fff" }}>
            {score.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-black/80 border-t border-cyan-500/30 p-6 z-20">
        <div className="flex justify-center">
          <div className="text-xs text-orange-400 mb-4 text-center font-semibold">TIMED ABILITIES</div>
        </div>
        <div className="flex gap-6 justify-center pointer-events-auto">
          {timedAbilities.map((ability, index) => {
            const cooldownProgress =
              ability.cooldown > 0 ? (ability.maxCooldown - ability.cooldown) / ability.maxCooldown : 1

            return (
              <button
                key={index}
                onClick={() => onTimedAbilityClick(index)}
                className={`w-24 h-24 rounded-xl border-2 transition-all duration-200 relative overflow-hidden ${
                  ability.cooldown > 0
                    ? "border-gray-600 bg-gray-800/60 opacity-60"
                    : "border-orange-500 bg-orange-500/20 hover:bg-orange-500/30 active:bg-orange-500/40 hover:scale-105"
                }`}
                disabled={ability.cooldown > 0}
              >
                <div className="flex flex-col items-center justify-center h-full relative z-10">
                  {index === 0 ? (
                    // Bomb Missile Icon
                    <div className="w-10 h-10 mb-1 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-red-400">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 13L13 11L15 9H13V7H21V9ZM12 8C15.31 8 18 10.69 18 14C18 17.31 15.31 20 12 20C8.69 20 6 17.31 6 14C6 10.69 8.69 8 12 8ZM12 10C9.79 10 8 11.79 8 14C8 16.21 9.79 18 12 18C14.21 18 16 16.21 16 14C16 11.79 14.21 10 12 10Z" />
                      </svg>
                    </div>
                  ) : (
                    // Pulse Beam Icon
                    <div className="w-10 h-10 mb-1 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-green-400">
                        <path d="M2 12H4L6 9H8L10 12H12L14 9H16L18 12H20L22 9V15H20L18 12H16L14 15H12L10 12H8L6 15H4L2 12Z" />
                      </svg>
                    </div>
                  )}
                  <span className="text-xs text-gray-300 leading-tight font-medium">{ability.name.split(" ")[0]}</span>
                </div>

                {ability.cooldown > 0 && (
                  <div className="absolute inset-0 text-orange-400">
                    {createCircularProgress(cooldownProgress)}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-white font-bold bg-black/60 rounded px-1">
                        {Math.ceil(ability.cooldown / 1000)}
                      </span>
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
