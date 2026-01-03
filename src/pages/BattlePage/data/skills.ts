import type { SkillData } from "../types";

export const SKILL_DATABASE: SkillData[] = [
  // ⚔️ BASIC ATTACK (O-BALL)
  {
    id: "o_ball",
    name: "O-BALL",
    icon: "🔥",
    // อัปเดตคำอธิบายให้ตรงกับ Logic ใหม่
    description: "Dmg based on Word Length + ATK. (+5 MP)", 
    apCost: 1,
    mpCost: 0, // ✅ 0 MP = Basic Attack
    minWordLength: 1,
    targetType: "SINGLE",
    maxTargets: 1,
    effectType: "DAMAGE",
    
    // ✅ ตัวคูณความแรง: Dmg = (Length * basePower) + PlayerATK
    basePower: 1, 
    
    hitChanceBonus: 0,
    isAutoHit: false, // ท่าโจมตีปกติ ต้องคำนวณความแม่นยำ
    projectileVisual: "FIREBALL",
    
    // ไม่ใช้ในการคำนวณ Basic Attack แต่ใส่ไว้กัน Type Error
    damageMin: 0, 
    damageMax: 0,
    hitCount: 1,
  },

  // 🛡️ BASIC DEFENSE (SHIELD)
  {
    id: "shield",
    name: "SHIELD",
    icon: "🛡",
    description: "Shield based on Word Length. (+5 MP)",
    apCost: 1,
    mpCost: 0, // ✅ 0 MP = Basic Defense
    minWordLength: 1,
    targetType: "SELF",
    maxTargets: 0,
    effectType: "SHIELD",
    
    // ✅ ตัวคูณเกราะ: Shield = Length * basePower
    basePower: 1, 
    
    hitChanceBonus: 0,
    isAutoHit: true, // ท่าบัฟตัวเองมักจะไม่พลาด
    projectileVisual: "NONE",
  },

  // 🚀 SKILL ATTACK (V-MISSILE)
  {
    id: "v_missile",
    name: "V-MISSILE",
    icon: "🚀",
    description: "Ultimate! 3 Hits (Fixed Dmg).",
    apCost: 1,
    mpCost: 25, // ✅ มี MP Cost = Skill
    minWordLength: 0, // สกิลกดใช้ได้เลย ไม่สนความยาวคำ (หรือจะบังคับก็ได้)
    targetType: "MULTI",
    maxTargets: 1,
    effectType: "DAMAGE",
    basePower: 0, // ไม่ได้ใช้คำนวณแบบ Basic
    hitChanceBonus: 100, // สกิลมักจะแม่นยำสูง
    isAutoHit: true, 
    projectileVisual: "V_SHAPE",
    
    // ✅ Logic สกิลจะสุ่มดาเมจจาก Min-Max โดยตรง
    damageMin: 1, 
    damageMax: 4,
    
    hitCount: 3, // ยิง 3 นัด
  },
];