export type Enemy = {
  id: number;
  hp: number;
  maxHp: number;
  atk: number;
  x: number;
  targetX: number;
  isAttacking: boolean;
  atkFrame: number;
  isCharging: boolean;
};

export type Projectile = {
  id: number;
  x: number;
  y: number;
  damage: number;
  targetId: number;
};

export type InventoryItem = {
  char: string;
  id: number;
  visible: boolean;
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
};

export type GameState = "RUN" | "BATTLE_PLAYER" | "BATTLE_ENEMY" | "ACTION" | "OVER";