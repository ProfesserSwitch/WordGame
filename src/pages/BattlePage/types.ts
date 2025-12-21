// src/types.ts

// ข้อมูลศัตรู
export type Enemy = {
  id: number;
  hp: number;
  maxHp: number;
  atk: number;
  x: number;
  targetX: number; // ตำแหน่งยืนปกติ
  isAttacking: boolean;
  atkFrame: number; // 0: Idle, 1: Ready, 2: Impact
  isCharging: boolean; // สถานะชาร์จพลัง
};

// ข้อมูลลูกไฟ/กระสุน
export type Projectile = {
  id: number;
  x: number;
  y: number;
  damage: number;
  targetId: number;
};

// ข้อมูลตัวอักษรในมือ
export type InventoryItem = {
  char: string;
  id: number;
  visible: boolean;
};

// ข้อมูลตัวเลข Damage ที่เด้งขึ้นมา
export type DamagePopup = {
  id: number;
  x: number;
  y: number;
  value: number;
  isPlayer?: boolean; // ถ้าจริงจะเป็นสีแดง (ตัวละครโดนตี)
};

// ข้อมูลพจนานุกรม
export type DictEntry = { 
  word: string; 
  type: string; 
  meaning: string 
};