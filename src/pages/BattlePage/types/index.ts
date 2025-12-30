export interface Enemy {
  id: number;
  x: number;
  name: string;
  hp: number;
  maxHp: number;
  ac: number; // ✅ เพิ่ม Armor Class
  atk_power_min: number;
  atk_power_max: number;
  pattern: EnemyActionType[]; // เก็บชุดคำสั่ง เช่น ["ATTACK", "WAIT", "ATTACK"]
  currentStep: number;        // บอกว่าตอนนี้ถึงขั้นตอนไหนแล้ว (0, 1, 2...)
  level: string;
  atkFrame: number;
  shoutText?: string;
}

// ✅ Action มีแค่ 3 อย่างเหมือนเดิม
export type EnemyActionType = "ATTACK" | "WAIT" | "SKILL";

// ✅ GameState เพิ่ม QUIZ_MODE
export type GameState = 
  | "LOADING" 
  | "ADVANTURE" 
  | "PREPARING_COMBAT" 
  | "PLAYERTURN" 
  | "ENEMYTURN" 
  | "ACTION" 
  | "OVER" 
  | "QUIZ_MODE"; 


export interface QuizData {
  question: string; // คำภาษาไทย
  choices: string[]; // Choice ภาษาอังกฤษ (4 คำ)
  correctAnswer: string; // คำตอบที่ถูก
  enemyId: number; // ID ศัตรูที่ถาม (เพื่อทำ Animation)
}

export interface PlayerStat {
  max_hp: number;
  hp: number;
  shield: number;
  mp: number;    // ✅ เพิ่ม Mana Points
  max_mp: number; // ✅ เพิ่ม Max Mana Points
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
  apCost: number;
  minWordLength: number;
  targetType: 'SINGLE' | 'MULTI' | 'SELF';
  maxTargets: number;
  effectType: 'DAMAGE' | 'HEAL' | 'SHIELD' | 'SPIN'; // etc.
  basePower: number;
  hitChanceBonus: number;
  isAutoHit: boolean;
  projectileVisual: 'ORB' | 'V_SHAPE' | 'FIREBALL' | 'NONE';
  mpCost?: number; // ✅ เพิ่มค่าใช้จ่ายมานา (ถ้ามี) 
  // ✅ เพิ่ม 3 ค่านี้ (ใส่ ? เพื่อให้เป็น Optional เผื่อสกิลเก่าไม่มี)
  damageMin?: number; 
  damageMax?: number;
  hitCount?: number; 
}