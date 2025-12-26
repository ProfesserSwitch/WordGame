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
    basePower: 1, // ไม่ได้ใช้แล้วถ้ามี min/max แต่ใส่ไว้กันบัค
    hitChanceBonus: 0,
    isAutoHit: false,
    projectileVisual: "FIREBALL",
    
    // ✅ สเปคใหม่: ดาเมจ 1-10
    damageMin: 1,
    damageMax: 10,
    hitCount: 1
  },
  {
    id: "v_missile",
    name: "V-MISSILE",
    icon: "🚀",
    description: "Hits 3 times (1-4 dmg each). Req 3+ letters.",
    apCost: 1,
    minWordLength: 3,
    targetType: "MULTI", // หรือ SINGLE ถ้าอยากเล็งตัวเดียวแล้วยิงรัวใส่
    maxTargets: 1,       // ปกติ Multi-hit มักเล็งเป้าเดียวแล้วรัวใส่
    effectType: "DAMAGE",
    basePower: 1, 
    hitChanceBonus: 100,
    isAutoHit: true,
    projectileVisual: "V_SHAPE",

    // ✅ สเปคใหม่: ยิง 3 ที ทีละ 1-4
    damageMin: 1,
    damageMax: 4,
    hitCount: 3 
  },
  // ... (SHIELD, SPIN เหมือนเดิม)
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
    basePower: 5,
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