import type { SkillData } from "../pages/BattlePage/types"; // path ตามโครงสร้างคุณ

export const SKILL_DATABASE: SkillData[] = [
  {
    id: "o_ball",
    name: "O-BALL",
    icon: "🔥",
    description: "Deals 1-10 Damage. Random.",
    apCost: 1,
    minWordLength: 1,
    targetType: "SINGLE",
    maxTargets: 1,
    effectType: "DAMAGE",
    basePower: 1,
    hitChanceBonus: 0,
    isAutoHit: false,
    projectileVisual: "FIREBALL",
    damageMin: 1,
    damageMax: 10,
    hitCount: 1
  },
  {
    id: "v_missile",
    name: "V-MISSILE",
    icon: "🚀",
    description: "Hits 3 times (1-4 dmg each). ",
    apCost: 1,
    minWordLength: 0,
    targetType: "MULTI", 
    maxTargets: 1,     
    effectType: "DAMAGE",
    basePower: 1, 
    hitChanceBonus: 100,
    isAutoHit: true,
    projectileVisual: "V_SHAPE",
    damageMin: 1,
    damageMax: 4,
    hitCount: 3 
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
    basePower: 1,
    hitChanceBonus: 0,
    isAutoHit: true,
    projectileVisual: "NONE"
  }
];