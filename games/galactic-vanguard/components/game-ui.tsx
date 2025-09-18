"use client"

export default function GameUI({ score, health, maxHealth, abilitySlots, selectedAbilitySlot, onAbilitySlotClick }) {
  const healthPercentage = (health / maxHealth) * 100

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

      {/* Removed Wave Counter */}

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

      {/* Ability Slots */}
      <div className="absolute bottom-0 right-0 flex gap-2 pointer-events-auto">
        {abilitySlots.map((ability, index) => (
          <button
            key={index}
            onClick={() => onAbilitySlotClick(index)}
            className={`w-16 h-16 rounded-lg border-2 transition-all duration-200 ${
              selectedAbilitySlot === index
                ? "border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/30"
                : ability
                  ? "border-cyan-500 bg-black/60 hover:bg-black/80 hover:border-cyan-400"
                  : "border-gray-600 bg-gray-800/40"
            }`}
            disabled={!ability}
          >
            {ability ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-6 h-6 rounded-sm mb-1" style={{ backgroundColor: ability.color }} />
                <span className="text-xs text-gray-300 leading-tight">{ability.name.split(" ")[0]}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 rounded border-2 border-dashed border-gray-600" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Ability Selection Indicator */}
      {selectedAbilitySlot !== null && abilitySlots[selectedAbilitySlot] && (
        <div className="absolute bottom-20 right-0 bg-black/80 border border-yellow-400 rounded px-3 py-1 pointer-events-none">
          <p className="text-sm text-yellow-400">{abilitySlots[selectedAbilitySlot].name} Selected</p>
          <p className="text-xs text-gray-300">Click to use</p>
        </div>
      )}
    </div>
  )
}
