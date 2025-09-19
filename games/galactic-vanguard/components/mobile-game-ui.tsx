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

      {/* Left side button - Bomb Missile */}
      <div className="absolute left-4 bottom-20 z-30 pointer-events-auto">
        <button
          onClick={() => onTimedAbilityClick(0)}
          className={`w-16 h-16 rounded-xl border-2 transition-all duration-200 relative overflow-hidden shadow-lg ${
            timedAbilities[0]?.cooldown > 0
              ? "border-gray-600 bg-gray-800/80 opacity-60"
              : "border-orange-500 bg-orange-500/30 hover:bg-orange-500/40 active:bg-orange-500/50 hover:scale-105"
          }`}
          disabled={timedAbilities[0]?.cooldown > 0}
        >
          <div className="flex items-center justify-center h-full relative z-10">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-orange-400 stroke-orange-300" strokeWidth="0.5">
                {/* Missile body */}
                <path d="M12 2L14 8H10L12 2Z" />
                {/* Explosion burst */}
                <path d="M12 10L16 12L12 14L8 12L12 10Z" />
                <path d="M12 14L15 18L12 16L9 18L12 14Z" />
                {/* Additional explosion spikes */}
                <path d="M6 10L10 12L6 14L4 12L6 10Z" />
                <path d="M18 10L20 12L18 14L14 12L18 10Z" />
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
          onClick={() => onTimedAbilityClick(1)}
          className={`w-16 h-16 rounded-xl border-2 transition-all duration-200 relative overflow-hidden shadow-lg ${
            timedAbilities[1]?.cooldown > 0
              ? "border-gray-600 bg-gray-800/80 opacity-60"
              : "border-orange-500 bg-orange-500/30 hover:bg-orange-500/40 active:bg-orange-500/50 hover:scale-105"
          }`}
          disabled={timedAbilities[1]?.cooldown > 0}
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
  )
}
