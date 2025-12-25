import type { SkillData } from "../pages/BattlePage/types";

export const SKILL_DATABASE: SkillData[] = [
  {
    id: "o_ball",
    name: "O-BALL",
    icon: "🔥",
    description: "Fires a fireball based on word score.",
    apCost: 1,
    minWordLength: 1,
    targetType: "SINGLE",
    maxTargets: 1,
    effectType: "DAMAGE",
    basePower: 1, // Multiplier หรือ Base damage
    hitChanceBonus: 0,
    isAutoHit: false,
    projectileVisual: "FIREBALL"
  },
  {
    id: "v_missile",
    name: "V-MISSILE",
    icon: "🚀",
    description: "Magic missile. Always hits. Req 4+ letters.",
    apCost: 1,
    minWordLength: 4,
    targetType: "MULTI",
    maxTargets: 2, // เล็งได้ 2 ตัว
    effectType: "DAMAGE",
    basePower: 1, 
    hitChanceBonus: 100,
    isAutoHit: true,
    projectileVisual: "V_SHAPE"
  },
  {
    id: "shield",
    name: "SHIELD",
    icon: "🛡",
    description: "Gain Shield based on word length.",
    apCost: 1,
    minWordLength: 1,
    targetType: "SELF",
    maxTargets: 0,
    effectType: "SHIELD",
    basePower: 5, // 5 Shield per letter
    hitChanceBonus: 0,
    isAutoHit: true,
    projectileVisual: "NONE"
  },
    {
    id: "spin",
    name: "SPIN",
    icon: "🎲",
    description: "Reroll unselected letters.",
    apCost: 1,
    minWordLength: 0,
    targetType: "SELF",
    maxTargets: 0,
    effectType: "SPIN", 
    basePower: 0,
    hitChanceBonus: 0,
    isAutoHit: true,
    projectileVisual: "NONE"
  }
];