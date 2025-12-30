export const MAX_PLAYER_HP = 100;
export const PLAYER_ATK = 5;

export const FIXED_Y = 280; // จุดที่ผู้เล่นและศัตรูยืนในแนวตั้ง
export const PLAYER_X_POS = 10; // จุดที่ผู้เล่นยืนในแนวนอน

export const DISPLAY_NORMAL = 16 * 3.5; 
export const DISPLAY_WIDE = 32 * 3.5;

export const VOWELS = ['A', 'E', 'I', 'O', 'U'];
export const HARD_LETTERS = ['X', 'Z', 'J', 'Q', 'K', 'V', 'W']; // เพิ่มตามความเหมาะสม

export const LETTER_DATA: { [key: string]: { count: number; score: number } } = {
  A: { count: 3, score: 1 },
  E: { count: 3, score: 1 },
  I: { count: 3, score: 1 },
  O: { count: 3, score: 1 },
  U: { count: 3, score: 1 },
  L: { count: 2, score: 1 },
  N: { count: 2, score: 1 },
  R: { count: 2, score: 1 },
  S: { count: 2, score: 1 },
  T: { count: 2, score: 1 },
  D: { count: 2, score: 1 },
  G: { count: 2, score: 1 },
  B: { count: 2, score: 1 },
  C: { count: 2, score: 1 },
  M: { count: 2, score: 1 },
  P: { count: 2, score: 1 },
  F: { count: 2, score: 1 },
  H: { count: 2, score: 1 },
  V: { count: 1, score: 2 },
  W: { count: 2, score: 1 },
  Y: { count: 2, score: 1 },
  K: { count: 2, score: 1 },
  J: { count: 1, score: 2 },
  X: { count: 1, score: 3 },
  Q: { count: 1, score: 3 },
  Z: { count: 1, score: 3 },
};