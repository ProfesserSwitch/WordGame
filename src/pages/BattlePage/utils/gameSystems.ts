import { LETTER_DATA } from "../store/constants";
import type {
  InventoryItem,
  Enemy,
  SkillData,
  DictEntry,
  Projectile,
} from "../types";

// --- 🎴 Deck & Inventory Systems ---
export const DeckManager = {
  deck: [] as string[],
  
  init() {
    this.deck = [];
    Object.keys(LETTER_DATA).forEach((char) => {
      for (let i = 0; i < LETTER_DATA[char].count; i++) this.deck.push(char);
    });
  },

  getRandomChar() {
    if (this.deck.length === 0) this.init();
    return this.deck[Math.floor(Math.random() * this.deck.length)];
  },

  createItem(index: number): InventoryItem {
    return {
      id: Math.random(),
      char: this.getRandomChar(),
      visible: true,
      originalIndex: index,
    };
  },

  generateList(count: number, startIndex = 0): InventoryItem[] {
    return Array.from({ length: count }).map((_, i) =>
      this.createItem(startIndex + i)
    );
  },
};

// --- 🎒 Inventory Utils ---
export const InventoryUtils = {
  fillEmptySlots: (
    currentInv: (InventoryItem | null)[],
    reservedIndices: number[],
    limit: number,
    forceReplace = false
  ) => {
    const nextInv = [...currentInv];
    for (let i = 0; i < limit; i++) {
      const isReserved = reservedIndices.includes(i);
      const isEmpty = nextInv[i] === null;
      if (!isReserved && (isEmpty || forceReplace)) {
        nextInv[i] = DeckManager.createItem(i);
      }
    }
    return nextInv;
  },

  returnItems: (
    currentInv: (InventoryItem | null)[],
    itemsToReturn: InventoryItem[],
    limit: number
  ) => {
    const nextInv = [...currentInv];
    itemsToReturn.forEach((item) => {
      let targetIdx = item.originalIndex;
      if (nextInv[targetIdx] !== null) {
        const emptyIdx = nextInv.findIndex((x, i) => x === null && i < limit);
        if (emptyIdx !== -1) targetIdx = emptyIdx;
      }
      nextInv[targetIdx] = item;
    });
    return nextInv;
  },
};

// --- 🗺️ Stage & Enemy Processing ---
export const StageProcessor = {
  processStageData: (apiData: any[]) => {
    const waves: Record<number, Enemy[]> = {};
    apiData.forEach((data, index) => {
      const waveNo = data.wave_no;
      if (!waves[waveNo]) waves[waveNo] = [];

      const availablePatterns = [...new Set(data.pattern_list.map((p: any) => p.pattern_no))];
      const selectedPatternNo = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];

      waves[waveNo].push({
        ...data,
        id: parseInt(data.event_id) || Math.random(),
        hp: data.max_hp,
        maxHp: data.max_hp,
        x: 0,
        currentStep: 1,
        selectedPattern: selectedPatternNo,
        atkFrame: 0,
        shoutText: "",
        ac: 10 + (data.level || 0),
        patternList: data.pattern_list
      });
    });
    return waves;
  }
};

// --- ⚔️ Combat Logic (แก้ไขใหม่) ---
export const CombatSystem = {

  // ✅ แก้ไข: เอา playerAtk ออกจากสูตร
  calculateDamage: (
    skill: SkillData,  
    inputWord: string = "", 
    targetEnemy?: Enemy,
  ) => {

    // 1. คำนวณแต้มของคำ (Weighted Length)
    // - ตัวปกติ = 1
    // - ตัวแพ้ทาง = ค่า Multiplier ใน weakness_list
    let weightedLength = 0;
    const lowerWord = inputWord.toLowerCase();

    if (targetEnemy && targetEnemy.weakness_list && lowerWord.length > 0) {
        for (const char of lowerWord) {
            // หาว่าตัวอักษรนี้ศัตรูแพ้ทางไหม?
            const weakData = targetEnemy.weakness_list.find((w: any) => w.alphabet.toLowerCase() === char);
            
            if (weakData) {
                // ถ้าเจอ: บวกตามค่า Multiplier (เช่น +2, +1.5)
                weightedLength += weakData.multiplier;
            } else {
                // ถ้าไม่เจอ: บวก 1 ปกติ
                weightedLength += 1;
            }
        }
    } else {
        // ถ้าไม่มีศัตรู หรือไม่มีข้อมูลแพ้ทาง ให้นับตามความยาวปกติ
        weightedLength = lowerWord.length;
    }

    let baseDamage = 0;
    
    // ⚔️ 1. กรณี Basic Attack (MP Cost = 0)
    // สูตรใหม่: (แต้มที่คำนวณได้ * Power) เพียวๆ ไม่บวก ATK แล้ว
    if ((skill.mpCost || 0) === 0 && skill.effectType === "DAMAGE") {
        const power = skill.basePower || 1;
        baseDamage = (weightedLength * power);
    } 
    // 🚀 2. กรณี Skill (MP > 0) 
    // ใช้ดาเมจคงที่ (ตามที่ตกลงไว้ว่าสกิลล็อคความแรง)
    else if (skill.damageMin !== undefined) {
        baseDamage = skill.damageMin;
    } 
    else {
        baseDamage = 1;
    }

    // ✅ คืนค่าเป็นทศนิยม (เช่น 2.5) ไม่ปัดเศษ
    return parseFloat(baseDamage.toFixed(1));
  },

  calculateWordScore: (word: string): number => {
    return word
      .toUpperCase()
      .split("")
      .reduce((total, char) => {
        const data = LETTER_DATA[char];
        const score = data ? data.score : 0;
        return total + score;
      }, 0);
  },
};

// --- 🚀 Physics Engine ---
export const PhysicsEngine = {
  updateProjectiles: (projectiles: Projectile[], dt: number) => {
    return projectiles.map((p) => {
      const dx = dt * 0.09;
      const nextX = p.x + dx;
      let nextY = p.y;

      if (p.movementType === "straight") {
        nextY = p.startY || p.y;
      } else {
        nextY = (p.startY || p.y) + Math.sin(nextX * 0.15 + (p.phase || 0)) * 20;
      }

      const deltaY = nextY - p.y;
      const deltaX = nextX - p.x;
      const rotation = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      return { ...p, x: nextX, y: nextY, rotation };
    });
  },

  checkCollisions: (projectiles: Projectile[], enemies: Enemy[]) => {
    const hits: { p: Projectile; targetIndex: number; damage: number }[] = [];
    const activeProjectiles: Projectile[] = [];

    projectiles.forEach((p) => {
      const targetIndex = enemies.findIndex((e) => e.id === p.targetId);
      const target = enemies[targetIndex];

      if (target && p.x >= target.x) {
        hits.push({ p, targetIndex, damage: p.isMiss ? 0 : p.damage });
      } else if (p.x < 110) { 
        activeProjectiles.push(p);
      }
    });

    return { activeProjectiles, hits };
  },
};

// --- 🗣️ Word System ---
export const WordSystem = {
  getRandomWordByLength: (dictionary: DictEntry[], length: number): string => {
    const candidates = dictionary.filter((d) => d.word.length === length);
    if (candidates.length > 0) {
      const randomIndex = Math.floor(Math.random() * candidates.length);
      return candidates[randomIndex].word.toUpperCase();
    }
    
    const fallbackChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += fallbackChars.charAt(
        Math.floor(Math.random() * fallbackChars.length)
      );
    }
    return result;
  },
};