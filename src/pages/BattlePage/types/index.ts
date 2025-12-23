export type Enemy = {
  id: number;
  name: string;       
  hp: number;
  maxHp: number;
  // ระบบการโจมตีและคำศัพท์
  level: "A1" | "A2" | "B1" | "B2"; // ระดับของศัตรูเพื่อดึงคำศัพท์
  atk_power_min: number;  // จำนวนคำต่ำสุดที่สุ่มได้
  atk_power_max: number;  // จำนวนคำสูงสุดที่สุ่มได้
  // ระบบ Cooldown (เสียเทิร์นหลังโจมตี)
  cooldown: number;       // ค่า Cooldown พื้นฐาน (เช่น 2 เทิร์น)
  current_cooldown: number; // ตัวนับ Cooldown ปัจจุบัน (ถ้า > 0 คือยังโจมตีไม่ได้)
  // ตำแหน่งและอนิเมชั่น
  x: number;
  targetX: number;
  atkFrame: number;       // 0: ปกติ, 1: เตรียม, 2: ฟาด
  // สถานะเพิ่มเติม (Optional)
  shoutText?: string;     // เก็บคำที่สุ่มได้เพื่อเอาไปแสดงบนหัวศัตรู
};
export type Projectile = {
  id: number;
  x: number;
  y: number;
  damage: number;
  targetId: number;
};
export type InventoryItem = {
  id: number;
  char: string;
  visible: boolean; // อันเดิมที่มีอยู่
  isSelected?: boolean; // ✅ เพิ่มสถานะนี้: ถ้า true คือถูกเลือกไปแล้ว (ช่องนี้จะว่าง)
};
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
export type  PlayerStat = {
    max_hp: number;
    hp: number;
    atk: number;
    equipment: string[];
    deck: Letter[];
    bag: bag[];
}; 
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
export type GameState = "ADVANTURE" | "PLAYERTURN" | "ENEMYTURN" | "ACTION" | "OVER";