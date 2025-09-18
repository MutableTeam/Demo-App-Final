"use client"

export default function MobileGameUI({ score, abilitySlots, selectedAbilitySlot, onAbilitySlotClick }) {
  return (
    <div className="absolute top-4 left-4 right-4 bottom-4 z-10 pointer-events-none text-white font-bold">
      <div className="absolute top-0 left-0 text-left">
        <p className="text-sm text-cyan-400" style={{ textShadow: "0 0 5px #06b6d4" }}>
          SCORE
        </p>
        <p className="text-xl" style={{ textShadow: "0 0 8px #fff" }}>
          {score.toLocaleString()}
        </p>
      </div>

      {/* Mobile Ability Slots */}
      <div className="absolute bottom-4 right-4 flex gap-2 pointer-events-auto">
        {abilitySlots.map((ability, index) => (
          <button
            key={index}
            onClick={() => onAbilitySlotClick(index)}
            className={`w-14 h-14 rounded-lg border-2 transition-all duration-200 ${
              selectedAbilitySlot === index
                ? "border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/30"
                : ability
                  ? "border-cyan-500 bg-black/60 active:bg-black/80"
                  : "border-gray-600 bg-gray-800/40"
            }`}
            disabled={!ability}
          >
            {ability ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-5 h-5 rounded-sm mb-1" style={{ backgroundColor: ability.color }} />
                <span className="text-xs text-gray-300 leading-tight">{ability.name.split(" ")[0]}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 rounded border-2 border-dashed border-gray-600" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Mobile Ability Selection Indicator */}
      {selectedAbilitySlot !== null && abilitySlots[selectedAbilitySlot] && (
        <div className="absolute bottom-24 right-4 bg-black/80 border border-yellow-400 rounded px-2 py-1 pointer-events-none">
          <p className="text-sm text-yellow-400">{abilitySlots[selectedAbilitySlot].name}</p>
          <p className="text-xs text-gray-300">Tap to use</p>
        </div>
      )}
    </div>
  )
}
