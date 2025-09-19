"use client"

export default function MobileGameUI({ score, timedAbilities, onTimedAbilityClick }) {
  const createCircularProgress = (progress) => {
    const radius = 32
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference * (1 - progress)

    return (
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
        <circle
          cx="36"
          cy="36"
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

      <div className="absolute bottom-8 left-0 right-0 z-30 pointer-events-none">
        <div className="flex justify-between px-4 pointer-events-auto">
          {timedAbilities.map((ability, index) => {
            const cooldownProgress =
              ability.cooldown > 0 ? (ability.maxCooldown - ability.cooldown) / ability.maxCooldown : 1

            return (
              <button
                key={index}
                onClick={() => onTimedAbilityClick(index)}
                className={`w-16 h-16 rounded-xl border-2 transition-all duration-200 relative overflow-hidden shadow-lg ${
                  ability.cooldown > 0
                    ? "border-gray-600 bg-gray-800/80 opacity-60"
                    : "border-orange-500 bg-orange-500/30 hover:bg-orange-500/40 active:bg-orange-500/50 hover:scale-105"
                }`}
                disabled={ability.cooldown > 0}
              >
                <div className="flex items-center justify-center h-full relative z-10">
                  {index === 0 ? (
                    <img src="/images/bomb-missile-icon.jpg" alt="Bomb Missile" className="w-10 h-10 object-contain" />
                  ) : (
                    <img src="/images/pulse-cannon-icon.jpg" alt="Pulse Cannon" className="w-10 h-10 object-contain" />
                  )}
                </div>

                {ability.cooldown > 0 && (
                  <div className="absolute inset-0 text-orange-400">
                    {createCircularProgress(cooldownProgress)}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-white font-bold bg-black/70 rounded px-1 py-0.5">
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
