import { create } from "zustand";
import type { Enemy, Projectile, DamagePopup, GameState, DictEntry, InventoryItem } from "../types";
import { MAX_PLAYER_HP, PLAYER_X_POS, FIXED_Y, PLAYER_ATK, LETTER_DATA } from "../constants";
import { sfx } from "../../../utils/sfx"; 

// --- Helper: ฟังก์ชันสุ่มตัวอักษรตามน้ำหนัก ---
const generateRandomLetters = (count: number): InventoryItem[] => {
  // 1. สร้าง Deck จำลองตามจำนวนที่มีใน LETTER_DATA
  const deck: string[] = [];
  Object.keys(LETTER_DATA).forEach((char) => {
    const amount = LETTER_DATA[char].count;
    for (let i = 0; i < amount; i++) {
      deck.push(char);
    }
  });

  // 2. สุ่มหยิบออกมาตามจำนวนที่ขอ (count)
  const result: InventoryItem[] = [];
  for (let i = 0; i < count; i++) {
    const randomChar = deck[Math.floor(Math.random() * deck.length)];
    result.push({
      id: Math.random(), // สร้าง ID ให้ไม่ซ้ำ
      char: randomChar,
      visible: true,
    });
  }
  return result;
};

interface GameStateStore {
  // --- State Variables ---
  gameState: GameState;
  playerStat: {
    max_hp: number;
    hp: number;
    atk: number;
  };
  enemies: Enemy[];
  projectiles: Projectile[];
  distance: number;
  damagePopups: DamagePopup[];
  dictionary: DictEntry[];
  playerShoutText: string;
  inventory: InventoryItem[]; // ✅ เพิ่ม Inventory เข้ามาใน Store

  // --- Animation Control ---
  animResolver: (() => void) | null;
  notifyAnimationComplete: () => void;
  waitForAnimation: () => Promise<void>;

  // --- Actions ---
  setDictionary: (data: DictEntry[]) => void;
  update: (dt: number) => void;
  damagePlayer: (dmg: number) => void;
  spawnEnemies: () => void;
  shootFireball: (p: Projectile) => void;
  reset: () => void;
  addPopup: (p: DamagePopup) => void;
  removePopup: (id: number) => void;
  
  // --- Game Flow Logic ---
  playAction: (chosenWord: string, targetId: number) => Promise<void>;
  runEnemyTurn: () => Promise<void>;
  
  // --- Inventory Actions ---
  spinLetters: () => void; // ฟังก์ชันสำหรับปุ่ม Spin (สุ่มใหม่)
}

export const useGameStore = create<GameStateStore>((set, get) => ({
  // 1. Initial State
  gameState: "ADVANTURE",
  playerStat: {
    max_hp: MAX_PLAYER_HP,
    hp: MAX_PLAYER_HP,
    atk: PLAYER_ATK,
  },
  enemies: [],
  projectiles: [],
  distance: 0,
  damagePopups: [],
  dictionary: [],
  playerShoutText: "",
  inventory: [], // เริ่มต้นเป็น array ว่าง
  
  // 2. Animation Control Implementation
  animResolver: null,

  waitForAnimation: () => {
    return new Promise((resolve) => {
      set({ animResolver: resolve });
    });
  },

  notifyAnimationComplete: () => {
    const resolver = get().animResolver;
    if (resolver) {
      resolver();
      set({ animResolver: null });
    }
  },

  // 3. Simple Actions
  setDictionary: (data) => set({ dictionary: data }),
  
  addPopup: (p) => set((s) => ({ damagePopups: [...s.damagePopups, p] })),
  
  removePopup: (id) =>
    set((s) => ({ damagePopups: s.damagePopups.filter((p) => p.id !== id) })),

  damagePlayer: (dmg) => {
    const currentHp = get().playerStat.hp;
    const newHp = Math.max(0, currentHp - dmg);

    set((s) => ({
      playerStat: { ...s.playerStat, hp: newHp },
    }));
    
    get().addPopup({
      id: Math.random(),
      x: PLAYER_X_POS - 2,
      y: FIXED_Y - 50,
      value: dmg,
      isPlayer: true,
    });

    if (newHp <= 0) set({ gameState: "OVER" });
  },

  spawnEnemies: () => {
    // ✅ เรียกใช้ฟังก์ชันสุ่มตัวอักษร 7 ตัว
    const initialLoot = generateRandomLetters(7);

    set({
      gameState: "PLAYERTURN",
      inventory: initialLoot, // ✅ ยัดใส่ Inventory ทันทีที่เจอศัตรู
      enemies: [
        {
          id: Math.random(),
          name: "Slime",
          hp: 50,
          maxHp: 50,
          atk_power_min: 2,
          atk_power_max: 3,
          cooldown: 2,
          current_cooldown: 0,
          level: "A1",
          x: 75,
          targetX: 75,
          atkFrame: 0,
        },
      ],
    });
  },

  shootFireball: (p) => set((s) => ({ projectiles: [...s.projectiles, p] })),

  spinLetters: () => {
     // สุ่มใหม่หมด (ใช้ 1 เทิร์น หรืออาจจะแค่เปลี่ยนของ - แล้วแต่ดีไซน์เกม)
     // ในที่นี้สมมติว่ากดแล้วเปลี่ยนเลย
     set({ inventory: generateRandomLetters(7) });
  },

  reset: () =>
    set({
      gameState: "ADVANTURE",
      playerStat: { max_hp: MAX_PLAYER_HP, hp: MAX_PLAYER_HP, atk: PLAYER_ATK },
      enemies: [],
      projectiles: [],
      distance: 0,
      damagePopups: [],
      inventory: [],
    }),

  // 4. Main Game Logic (Player Turn)
  playAction: async (chosenWord, targetId) => {
    const store = get();

    // ✅ ลบตัวอักษรที่ใช้ไปออกจาก Inventory
    const charsUsed = chosenWord.split('');
    let currentInv = [...store.inventory];

    charsUsed.forEach(char => {
        const index = currentInv.findIndex(item => item.char === char);
        if (index !== -1) {
            currentInv.splice(index, 1); // ลบตัวที่เจอออก 1 ตัว
        }
    });

    // อัปเดต Inventory ใหม่ (ตัวที่ใช้หายไป)
    set({ 
        playerShoutText: chosenWord, 
        gameState: "ACTION",
        inventory: currentInv 
    });

    // 4.2 รอ Animation ง้างมือ
    const safeTimeout = setTimeout(() => get().notifyAnimationComplete(), 1000);
    await store.waitForAnimation();
    clearTimeout(safeTimeout);

    // 4.3 สร้างลูกไฟ
    const target = store.enemies.find((e) => e.id === targetId);
    if (target && target.hp > 0) {
      sfx.playHit();
      store.shootFireball({
        id: Math.random(),
        x: PLAYER_X_POS + 10,
        y: FIXED_Y - 50,
        damage: chosenWord.length * PLAYER_ATK,
        targetId,
      });
    }

    // 4.4 รอลูกไฟชน
    let projectileMoving = true;
    while (projectileMoving) {
      await new Promise((r) => setTimeout(r, 100));
      if (get().projectiles.length === 0) projectileMoving = false;
    }

    await new Promise((r) => setTimeout(r, 500));

    // 4.5 เช็คชนะ
    const aliveCount = get().enemies.filter((e) => e.hp > 0).length;
    if (aliveCount === 0) {
      // ชนะแล้ว: ล้าง Inventory หรือจะเก็บไว้ก็ได้ (ที่นี้เลือกเก็บไว้ก่อน)
      set({ gameState: "ADVANTURE", enemies: [], projectiles: [], playerShoutText: "" });
      return;
    }

    // ✅ (Optional) เติมตัวอักษรให้เต็ม 7 ตัวหลังโจมตีเสร็จ?
    // ถ้าอยากให้เติมของอัตโนมัติ ให้เปิดบรรทัดนี้:
    // const needed = 7 - get().inventory.length;
    // if(needed > 0) set(s => ({ inventory: [...s.inventory, ...generateRandomLetters(needed)] }));

    // 4.6 เข้าสู่เทิร์นศัตรู
    await get().runEnemyTurn();
  },

  // 5. Enemy Turn (เหมือนเดิม)
  runEnemyTurn: async () => {
    const store = get();
    set({ playerShoutText: "", gameState: "ENEMYTURN" });

    const enemyIds = store.enemies.map((e) => e.id);

    for (const id of enemyIds) {
      const currentEn = get().enemies.find((e) => e.id === id);
      if (!currentEn || currentEn.hp <= 0) continue;

      // 5.1 Check Cooldown
      if (currentEn.current_cooldown > 0) {
        get().addPopup({
          id: Math.random(),
          x: currentEn.x - 2,
          y: FIXED_Y - 80,
          value: 0, 
        });
        set((s) => ({
          enemies: s.enemies.map((e) =>
            e.id === id ? { ...e, current_cooldown: e.current_cooldown - 1 } : e
          ),
        }));
        await new Promise((r) => setTimeout(r, 600));
        continue;
      }

      // 5.2 AI Logic
      const targetLength = Math.floor(Math.random() * (currentEn.atk_power_max - currentEn.atk_power_min + 1)) + currentEn.atk_power_min;
      const allDict = get().dictionary;
      const pool = allDict
        .filter((d) => d.level === currentEn.level && d.word.length === targetLength)
        .map((d) => d.word);

      let generatedShout = pool.length > 0 
        ? pool[Math.floor(Math.random() * pool.length)] 
        : "Grrr!";

      set((s) => ({
        enemies: s.enemies.map((e) => e.id === id ? { ...e, shoutText: generatedShout } : e),
      }));
      await new Promise((r) => setTimeout(r, 400));

      set((s) => ({
        enemies: s.enemies.map((e) => e.id === id ? { ...e, x: PLAYER_X_POS + 8, atkFrame: 1 } : e),
      }));

      await new Promise((r) => setTimeout(r, 400));

      if (get().enemies.find((e) => e.id === id)?.hp ?? 0 > 0) {
        const finalDmg = targetLength * 5;
        get().damagePlayer(finalDmg);
        sfx.playHit();
        set((s) => ({
          enemies: s.enemies.map((e) => e.id === id ? { ...e, atkFrame: 2 } : e),
        }));
      }

      await new Promise((r) => setTimeout(r, 400));

      set((s) => ({
        enemies: s.enemies.map((e) =>
          e.id === id && e.hp > 0
            ? { ...e, x: e.targetX, atkFrame: 0, current_cooldown: e.cooldown, shoutText: "" }
            : e
        ),
      }));

      await new Promise((r) => setTimeout(r, 200));
    }

    if (get().playerStat.hp > 0) {
      set({ gameState: "PLAYERTURN" });
    }
  },

  // 6. Update Loop (เหมือนเดิม)
  update: (dt) =>
    set((state) => {
      if (state.gameState === "ADVANTURE") {
        const newDist = state.distance + dt * 0.02;
        if (newDist >= 120) {
          setTimeout(() => get().spawnEnemies(), 0);
          return { distance: 0 };
        }
        return { distance: newDist };
      }
      if (state.projectiles.length > 0) {
        const nextProjs = state.projectiles.map((p) => ({ ...p, x: p.x + dt * 0.08 }));
        let currentEnemies = [...state.enemies];
        const activeProjs: Projectile[] = [];

        nextProjs.forEach((p) => {
          const target = currentEnemies.find((e) => e.id === p.targetId);
          if (target && p.x >= target.x) {
            target.hp = Math.max(0, target.hp - p.damage);
            get().addPopup({ id: Math.random(), x: target.x - 2, y: FIXED_Y - 80, value: p.damage });
          } else if (p.x < 110) {
            activeProjs.push(p);
          }
        });
        return { enemies: currentEnemies, projectiles: activeProjs };
      }
      return {};
    }),
}));