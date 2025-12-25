import type { DictEntry, Enemy, Projectile, SkillData } from "../pages/BattlePage/types/index";
import { PLAYER_X_POS, LETTER_DATA, FIXED_Y } from "../pages/BattlePage/constants";

// ✅ 1. Enemy Factory: สร้างศัตรู
export const EnemyFactory = {
  createSlime: (level: "A1", xPos: number): Enemy => ({
    id: Math.random(),
    x: xPos,
    name: "Slime",
    hp: 10,
    maxHp: 10,
    ac: 12,
    atk_power_min: 2,
    atk_power_max: 3,
    cooldown: 2,
    current_cooldown: 0,
    level,
    atkFrame: 0,
  }),
  generateGroup: (count: number, startX: number) => {
    return Array.from({ length: count }).map((_, i) => 
      EnemyFactory.createSlime("A1", startX + (i * 10))
    );
  }
};

// ✅ 2. Combat System: คำนวณดาเมจและโอกาสตีโดน
export const CombatSystem = {
  calculateHit: (skill: SkillData, wordScore: number, targetAc: number) => {
    if (skill.isAutoHit) return true;
    const d20 = Math.floor(Math.random() * 20) + 1;
    return (d20 + wordScore + skill.hitChanceBonus) >= targetAc;
  },
  
  calculateDamage: (skill: SkillData, wordScore: number, isHit: boolean) => {
    if (!isHit) return 0;
    return Math.floor(wordScore * skill.basePower) || 1;
  },

  calculateWordScore: (word: string) => {
    return word.split('').reduce((sum, c) => sum + (LETTER_DATA[c]?.score || 0), 0);
  }
};

// ✅ 3. Physics Engine: คำนวณการเคลื่อนที่และการชน
export const PhysicsEngine = {
  updateProjectiles: (projectiles: Projectile[], dt: number) => {
    return projectiles.map((p) => {
      const dx = dt * 0.09;
      const nextX = p.x + dx;
      let nextY = p.y;

      if (p.movementType === 'straight') {
        nextY = p.startY || p.y;
      } else {
        // Wavy movement logic
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
      const targetIndex = enemies.findIndex(e => e.id === p.targetId);
      const target = enemies[targetIndex];

      // Check Collision condition (Hit target OR out of bounds)
      if (target && p.x >= target.x) {
        hits.push({ p, targetIndex, damage: p.isMiss ? 0 : p.damage });
      } else if (p.x < 110) { // Still flying
        activeProjectiles.push(p);
      }
    });

    return { activeProjectiles, hits };
  }
};

// ✅ 4. Word System: จัดการเรื่องคำศัพท์
export const WordSystem = {
  getRandomWordByLength: (dictionary: DictEntry[], length: number): string => {
    // กรองคำที่มีความยาวตรงกับดาเมจ
    const candidates = dictionary.filter(d => d.word.length === length);
    
    // ถ้ามีคำ ให้สุ่มมา 1 คำ
    if (candidates.length > 0) {
      const randomIndex = Math.floor(Math.random() * candidates.length);
      return candidates[randomIndex].word.toUpperCase();
    }
    
    // Fallback: ถ้าไม่มีคำยาวเท่านี้ใน dict ให้สร้างเสียงคำรามมั่วๆ เช่น ดาเมจ 3 -> "AAA"
    const fallbackChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += fallbackChars.charAt(Math.floor(Math.random() * fallbackChars.length));
    }
    return result;
  }
};