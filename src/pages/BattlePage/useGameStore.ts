// src/store/useGameStore.ts
import { create } from "zustand";
import type { Enemy, Projectile, DamagePopup } from "./types";
import { MAX_PLAYER_HP, PLAYER_X_POS, FIXED_Y } from "./constants";

interface GameStateStore {
  gameState: "RUN" | "BATTLE_PLAYER" | "BATTLE_ENEMY" | "ACTION" | "OVER";
  playerHp: number;
  enemies: Enemy[];
  projectiles: Projectile[];
  distance: number;
  damagePopups: DamagePopup[];
  update: (dt: number) => void;
  damagePlayer: (dmg: number) => void;
  spawnEnemies: () => void;
  fireProjectile: (p: Projectile) => void;
  reset: () => void;
  addPopup: (p: DamagePopup) => void;
  removePopup: (id: number) => void;
  endPlayerTurn: (dmg: number, targetId: number) => Promise<void>;
}

export const useGameStore = create<GameStateStore>((set, get) => ({
  gameState: "RUN",
  playerHp: MAX_PLAYER_HP,
  enemies: [],
  projectiles: [],
  distance: 0,
  damagePopups: [],

  addPopup: (p) => set((s) => ({ damagePopups: [...s.damagePopups, p] })),
  removePopup: (id) => set((s) => ({ damagePopups: s.damagePopups.filter((p) => p.id !== id) })),

  // ฟังก์ชันลดเลือดผู้เล่น
  damagePlayer: (dmg) => {
    set((s) => ({ playerHp: Math.max(0, s.playerHp - dmg) }));
    get().addPopup({ id: Math.random(), x: PLAYER_X_POS + 2, y: FIXED_Y - 70, value: dmg, isPlayer: true });
    if (get().playerHp <= 0) set({ gameState: "OVER" });
  },

  // สุ่มเกิดศัตรูเมื่อวิ่งถึงระยะ
  spawnEnemies: () =>
    set({
      gameState: "BATTLE_PLAYER",
      enemies: [
        { id: Math.random(), hp: 20, maxHp: 20, atk: 10, x: 75, targetX: 75, isAttacking: false, atkFrame: 0, isCharging: false },
        { id: Math.random(), hp: 20, maxHp: 20, atk: 10, x: 88, targetX: 88, isAttacking: false, atkFrame: 0, isCharging: false },
      ],
    }),

  fireProjectile: (p) => set((s) => ({ projectiles: [...s.projectiles, p] })),

  // --- Logic การสลับเทิร์น (หัวใจสำคัญ) ---
  endPlayerTurn: async (dmg, targetId) => {
    set({ gameState: "ACTION" }); // ล็อค UI ไม่ให้กดเล่นตอนกำลังอนิเมชั่น
    
    // 1. ผู้เล่นยิงลูกไฟ
    const target = get().enemies.find((e) => e.id === targetId);
    if (target && target.hp > 0) {
      get().fireProjectile({ id: Math.random(), x: PLAYER_X_POS + 8, y: FIXED_Y - 50, damage: dmg, targetId });
    }

    await new Promise((r) => setTimeout(r, 1000)); // รอให้ลูกไฟวิ่งไปชน

    // ถ้าศัตรูตายหมด -> กลับไปวิ่ง
    if (get().enemies.filter(e => e.hp > 0).length === 0) {
      set({ gameState: "RUN", enemies: [], projectiles: [] });
      return;
    }

    // 2. เริ่มเทิร์นศัตรู
    set({ gameState: "BATTLE_ENEMY" });
    const enemyIds = get().enemies.map(e => e.id);

    for (const id of enemyIds) {
      const currentEn = get().enemies.find(e => e.id === id);
      if (!currentEn || currentEn.hp <= 0) continue;

      const moveDelay = 400;

      if (currentEn.isCharging) {
        // ถ้าชาร์จอยู่ -> พุ่งไปตีกระแทกแรงๆ
        set((s) => ({ enemies: s.enemies.map((e) => e.id === id ? { ...e, x: PLAYER_X_POS + 8, atkFrame: 1, isCharging: false } : e) }));
        await new Promise((r) => setTimeout(r, moveDelay));
        get().damagePlayer(currentEn.atk * 3); // แรง 3 เท่า!
      } else {
        // สุ่มเลือกว่าจะตีปกติ หรือ ชาร์จพลัง
        if (Math.random() > 0.3) {
          set((s) => ({ enemies: s.enemies.map((e) => e.id === id ? { ...e, x: PLAYER_X_POS + 8, atkFrame: 1 } : e) }));
          await new Promise((r) => setTimeout(r, moveDelay));
          get().damagePlayer(currentEn.atk);
        } else {
          set((s) => ({ enemies: s.enemies.map((e) => e.id === id ? { ...e, isCharging: true } : e) }));
          get().addPopup({ id: Math.random(), x: currentEn.x, y: FIXED_Y - 80, value: 0 }); // โชว์คำว่า CHARGE
          await new Promise((r) => setTimeout(r, 800));
          continue; 
        }
      }

      // เดินกลับที่เดิม
      await new Promise((r) => setTimeout(r, moveDelay));
      set((s) => ({ enemies: s.enemies.map((e) => (e.id === id && e.hp > 0) ? { ...e, x: e.targetX, atkFrame: 0 } : e) }));
    }

    // จบเทิร์นศัตรู -> เช็คว่าผู้เล่นยังไม่ตายให้กลับไปเทิร์นผู้เล่น
    if (get().playerHp > 0) set({ gameState: "BATTLE_PLAYER" });
  },

  reset: () => set({ gameState: "RUN", playerHp: MAX_PLAYER_HP, enemies: [], projectiles: [], distance: 0, damagePopups: [] }),

  // ฟังก์ชันอัปเดตตำแหน่งสิ่งต่างๆ ในทุกเฟรม
  update: (dt) => set((state) => {
      // 1. ถ้ากำลังวิ่ง -> เพิ่มระยะทาง
      if (state.gameState === "RUN") {
        const newDist = state.distance + dt * 0.02;
        if (newDist >= 120) {
          setTimeout(() => get().spawnEnemies(), 0);
          return { distance: 0 };
        }
        return { distance: newDist };
      }
      // 2. ถ้ามีลูกไฟ -> ขยับลูกไฟไปข้างหน้า
      if (state.projectiles.length > 0) {
        const nextProjs = state.projectiles.map((p) => ({ ...p, x: p.x + dt * 0.06 }));
        let currentEnemies = [...state.enemies];
        const activeProjs: Projectile[] = [];
        
        nextProjs.forEach((p) => {
          const target = currentEnemies.find((e) => e.id === p.targetId);
          if (target && p.x >= target.x) { // ชนศัตรู
            target.hp = Math.max(0, target.hp - p.damage);
            get().addPopup({ id: Math.random(), x: target.x + 1, y: FIXED_Y - 80, value: p.damage });
          } else if (p.x < 110) {
            activeProjs.push(p);
          }
        });
        return { enemies: currentEnemies, projectiles: activeProjs };
      }
      return {};
    }),
}));