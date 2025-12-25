export interface Enemy {
  id: number;
  x: number;
  name: string;
  hp: number;
  maxHp: number;
  ac: number; // ✅ เพิ่ม Armor Class
  atk_power_min: number;
  atk_power_max: number;
  cooldown: number;
  current_cooldown: number;
  level: string;
  atkFrame: number;
  shoutText?: string;
}

export interface PlayerStat {
  max_hp: number;
  hp: number;
  shield: number;
  atk: number;
  def: number;
  // ✅ เพิ่ม Action Points
  max_ap: number;
  ap: number;     // Action Points
  max_bap: number;
  bap: number;    // Bonus Action Points
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  startY?: number;
  phase?: number;
  damage: number;
  targetId: number;
  char: string;
  
  // New Props
  scale?: number;
  visual?: 'FIREBALL' | 'V_SHAPE' | 'NONE'; // รูปแบบภาพ
  movementType?: 'straight' | 'wavy';       // รูปแบบการวิ่ง
  rotation?: number;                        // องศาการหมุน
  isMiss?: boolean;
}

export interface InventoryItem {
  char: string;
  id: number;
  visible: boolean;
  originalIndex: number; // ✅ เพิ่มเพื่อเก็บตำแหน่งเริ่มต้นใน Inventory
}
export type DamagePopup = {
  id: number;
  x: number;
  y: number;
  value: number;
  isPlayer?: boolean;
};

export type DictEntry = { 
  word: string; 
  type: string; 
  meaning: string; 
  level: string;
};

// export type PlayerStat = {
//     max_hp: number;
//     hp: number;
//     atk: number;
//     // ใส่ ? ไว้ก่อน เผื่อใน Store ค่าเริ่มต้นยังไม่มีพวกนี้ จะได้ไม่แดงครับ
//     equipment?: string[];
//     deck?: Letter[];
//     bag?: bag[];
// }; 

export type Letter = {
  word: string;
  level: number;
  ability: string | null;
  change: number;
}

export type bag = {
  item: string;
  count: number;
}

export type GameState = "ADVANTURE" | "PLAYERTURN" | "ENEMYTURN" | "ACTION" | "OVER" | "PREPARING_COMBAT";

// ✅ 1. กำหนดประเภทเป้าหมาย
export type TargetType = 'SINGLE' | 'MULTI' | 'SELF' | 'ALL';

// ✅ 2. กำหนดประเภทเอฟเฟค
export type EffectType = 'DAMAGE' | 'SHIELD' | 'BUFF' | 'SPIN';

// ✅ 3. กำหนดหน้าตากระสุน
export type ProjectileVisual = 'FIREBALL' | 'V_SHAPE' | 'NONE'; 

// ✅ 4. โครงสร้างข้อมูลของ Skill (Data Structure)
export interface SkillData {
  id: string;
  name: string;
  icon: string;
  description: string;
  
  // เงื่อนไขการใช้
  apCost: number;
  minWordLength: number;
  
  // ระบบเล็ง
  targetType: TargetType;
  maxTargets: number; // เล็งได้กี่ตัว (เช่น V-Missile = 2)

  // ผลลัพธ์
  effectType: EffectType;
  basePower: number;    // พลังพื้นฐาน (เช่น Shield=5 per letter)
  hitChanceBonus: number; // โบนัสความแม่น (V-Missile = 100)
  isAutoHit: boolean;     // เป็นเวทมนตร์ที่ไม่ต้องทอยเต๋าหรือไม่
  
  // หน้าตา
  projectileVisual: ProjectileVisual;
}