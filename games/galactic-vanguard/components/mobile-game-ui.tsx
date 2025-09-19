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

      <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
        {timedAbilities.map((ability, index) => {
          const cooldownProgress =
            ability.cooldown > 0 ? (ability.maxCooldown - ability.cooldown) / ability.maxCooldown : 1

          return (
            <button
              key={index}
              onClick={() => onTimedAbilityClick(index)}
              className={`absolute w-20 h-20 rounded-xl border-2 transition-all duration-200 relative overflow-hidden shadow-lg pointer-events-auto ${
                index === 0 ? "bottom-16 left-6" : "bottom-16 right-6"
              } ${
                ability.cooldown > 0
                  ? "border-gray-600 bg-gray-800/80 opacity-60"
                  : "border-cyan-400 bg-cyan-500/30 hover:bg-cyan-500/40 active:bg-cyan-500/50 hover:scale-105"
              }`}
              disabled={ability.cooldown > 0}
            >
              <div className="flex items-center justify-center h-full relative z-10">
                {index === 0 ? (
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                    <div className="text-white text-2xl font-bold">💥</div>
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                    <div className="text-white text-2xl font-bold">⚡</div>
                  </div>
                )}
              </div>

              {ability.cooldown > 0 && (
                <div className="absolute inset-0 text-cyan-400">
                  {createCircularProgress(cooldownProgress)}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm text-white font-bold bg-black/70 rounded px-2 py-1">
                      {Math.ceil(ability.cooldown / 1000)}
                    </span>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}
