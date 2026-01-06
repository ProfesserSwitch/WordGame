export type GameState = 
  | "ADVANTURE" 
  | "PREPARING_COMBAT" 
  | "PLAYERTURN" 
  | "ENEMYTURN" 
  | "ACTION" 
  | "OVER" 
  | "WAVE_CLEARED" 
  | "GAME_CLEARED" 
  | "QUIZ_MODE";

export interface InventoryItem {
  id: number;
  char: string;
  visible: boolean;
  originalIndex: number;
}

export interface Enemy {
  id: number;
  max_hp: number;
  hp: number;
  shield: number; 
  x: number;
  ac: number;
  atk_power_min: number;
  atk_power_max: number;
  weakness_list?: { alphabet: string; multiplier: number }[];
  patternList?: any[];
  selectedPattern?: number;
  currentStep: number;
  shoutText?: string;
  atkFrame: number;
  [key: string]: any;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  
  // ค่าเดิมที่มีอยู่แล้ว
  targetId?: number;
  damage: number;
  isMiss?: boolean;
  movementType?: "straight" | "curve"; // เดาจากโค้ด Physics
  startY?: number;
  phase?: number;
  visual?: string; // 'FIREBALL' | 'V_SHAPE' ฯลฯ

  // --- ✅ เพิ่ม 3 ตัวนี้ เพื่อให้ PhysicsEngine ส่งค่าได้ และ ProjectileEntity อ่านค่าได้ ---
  rotation?: number; 
  scale?: number;
  char?: string;     
}
export interface DamagePopup {
  id: number;
  x: number;
  y: number;
  value: number;
  isPlayer?: boolean;
}

export interface SkillData {
  id: string;         
  name: string;
  icon: string;           
  description: string;    
  apCost: number;        
  mpCost: number;          
  effectType: "DAMAGE" | "SHIELD" | "HEAL";
  targetType: "SINGLE" | "MULTI" | "SELF"; 
  maxTargets: number;
  basePower: number;
  hitChanceBonus: number;
  hitCount?: number;
  projectileVisual: string;
  minWordLength: number;
  isAutoHit?: boolean;
  damageMin?: number;
  damageMax?: number;
}

export interface DictEntry {
  word: string;
  meaning: string;
}

export interface PlayerStat {
  max_hp: number;
  hp: number;
  shield: number;
  atk: number;
  def: number;
  max_rp: number;
  rp: number;
  mp: number;
  max_mp: number;
  unlockedSlots: number;
}

export interface QuizData {
  question: string;
  correctAnswer: string;
  choices: string[];
  enemyId: number;
}

// --- ✅ MAIN STORE INTERFACE ---

export interface GameStateStore {
  // --- Game Slice State ---
  gameState: GameState;
  projectiles: Projectile[];
  damagePopups: DamagePopup[];
  dictionary: DictEntry[];
  distance: number;
  loadingProgress: number;
  animResolver: (() => void) | null;
  stageData: Record<number, Enemy[]> | null;

  // --- Player Slice State ---
  playerStat: PlayerStat;
  playerShoutText: string;
  // ✅ แก้ตรงนี้: ยอมรับ null
  inventory: (InventoryItem | null)[];

  // --- Enemy Slice State ---
  currentWave: number;
  enemies: Enemy[];
  isDodging: boolean;
  currentQuiz: QuizData | null;
  quizResolver: ((isCorrect: boolean) => void) | null;

  // --- Actions: Game Slice ---
  initializeGame: () => Promise<void>;
  notifyAnimationComplete: () => void;
  waitAnim: (timeout?: number) => Promise<void>;
  setDictionary: (data: DictEntry[]) => void;
  addPopup: (p: DamagePopup) => void;
  removePopup: (id: number) => void;
  alphabetMissle: (p: Projectile) => void;
  update: (dt: number) => void;
  reset: () => void;

  // --- Actions: Player Slice ---
  damagePlayer: (dmg: number) => void;
  setInventory: (items: (InventoryItem | null)[]) => void;
  startPlayerTurn: () => void;
  actionSpin: (newInventory: (InventoryItem | null)[]) => Promise<void>;
  castSkill: (skill: SkillData, chosenWord: string, targetIds: number[]) => Promise<void>;

  // --- Actions: Enemy Slice ---
  spawnEnemies: (loot: (InventoryItem | null)[]) => void;
  updateEnemy: (id: number, data: Partial<Enemy>) => void;
  damageEnemy: (id: number, dmg: number) => void;
  runEnemyTurn: () => Promise<void>;
  resolveQuiz: (answer: string) => void;
}