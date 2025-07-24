export interface Upgrade {
  id: string
  name: string
  description: string
  type: "player" | "bow" | "arrow"
  maxLevel?: number
  apply: (state: any) => any // Simplified for this context
}

export const UPGRADES: Upgrade[] = [
  // --- Arrow Upgrades ---
  {
    id: "multi-shot",
    name: "Multi-Shot",
    description: "Fire 2 additional arrows in a cone.",
    type: "arrow",
    maxLevel: 3,
    apply: (player) => ({ ...player, multiShot: (player.multiShot || 0) + 1 }),
  },
  {
    id: "piercing-shot",
    name: "Piercing Shot",
    description: "Arrows pierce through an additional enemy.",
    type: "arrow",
    maxLevel: 5,
    apply: (player) => ({ ...player, piercing: (player.piercing || 0) + 1 }),
  },
  {
    id: "ricochet-shot",
    name: "Ricochet Shot",
    description: "Arrows bounce off walls once.",
    type: "arrow",
    maxLevel: 3,
    apply: (player) => ({ ...player, ricochet: (player.ricochet || 0) + 1 }),
  },
  {
    id: "explosive-arrows",
    name: "Explosive Arrows",
    description: "Arrows explode on impact, dealing area damage.",
    type: "arrow",
    apply: (player) => ({ ...player, explosiveArrows: true }),
  },
  {
    id: "frost-arrows",
    name: "Frost Arrows",
    description: "Arrows chill enemies, slowing them on hit.",
    type: "arrow",
    apply: (player) => ({ ...player, frostArrows: true }),
  },
  {
    id: "homing-arrows",
    name: "Homing Arrows",
    description: "Arrows lightly seek out nearby enemies.",
    type: "arrow",
    apply: (player) => ({ ...player, homingArrows: true }),
  },

  // --- Bow Upgrades ---
  {
    id: "increase-damage",
    name: "Sharpened Arrowheads",
    description: "Increases arrow base damage by 15%.",
    type: "bow",
    maxLevel: 5,
    apply: (player) => ({ ...player, damageMultiplier: (player.damageMultiplier || 1) * 1.15 }),
  },
  {
    id: "increase-draw-speed",
    name: "Quick Draw",
    description: "Increases bow draw speed by 20%.",
    type: "bow",
    maxLevel: 4,
    apply: (player) => ({ ...player, maxDrawTime: player.maxDrawTime * 0.8 }),
  },
  {
    id: "increase-crit-chance",
    name: "Deadeye",
    description: "Increases critical hit chance by 10%.",
    type: "bow",
    maxLevel: 5,
    apply: (player) => ({ ...player, critChance: (player.critChance || 0) + 0.1 }),
  },

  // --- Player Upgrades ---
  {
    id: "increase-max-health",
    name: "Iron Skin",
    description: "Increases maximum health by 25.",
    type: "player",
    maxLevel: 5,
    apply: (player) => ({ ...player, maxHealth: player.maxHealth + 25, health: player.health + 25 }),
  },
  {
    id: "increase-move-speed",
    name: "Fleet Footed",
    description: "Increases movement speed by 10%.",
    type: "player",
    maxLevel: 3,
    apply: (player) => ({ ...player, moveSpeedMultiplier: (player.moveSpeedMultiplier || 1) * 1.1 }),
  },
  {
    id: "reduce-dash-cooldown",
    name: "Phase Shift",
    description: "Reduces dash cooldown by 20%.",
    type: "player",
    maxLevel: 3,
    apply: (player) => ({ ...player, dashCooldownTime: (player.dashCooldownTime || 1.5) * 0.8 }),
  },
  {
    id: "health-regen",
    name: "Regeneration",
    description: "Slowly regenerate health over time.",
    type: "player",
    apply: (player) => ({ ...player, healthRegen: (player.healthRegen || 0) + 0.5 }),
  },
  {
    id: "xp-gain",
    name: "Wisdom",
    description: "Gain 20% more experience from all sources.",
    type: "player",
    apply: (player) => ({ ...player, xpMultiplier: (player.xpMultiplier || 1) * 1.2 }),
  },
  {
    id: "summon-wolf",
    name: "Summon Wolf Companion",
    description: "A loyal wolf fights by your side.",
    type: "player",
    apply: (player) => ({ ...player, hasWolf: true }),
  },
]
