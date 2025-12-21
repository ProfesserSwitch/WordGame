import { create } from "zustand";
import type { Enemy, Projectile, DamagePopup, GameState } from "../types";
import { MAX_PLAYER_HP, PLAYER_X_POS, FIXED_Y } from "../constants";

interface GameStateStore {
  gameState: GameState;
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
  removePopup: (id) =>
    set((s) => ({ damagePopups: s.damagePopups.filter((p) => p.id !== id) })),

  damagePlayer: (dmg) => {
    set((s) => ({ playerHp: Math.max(0, s.playerHp - dmg) }));
    get().addPopup({
      id: Math.random(),
      x: PLAYER_X_POS + 2,
      y: FIXED_Y - 70,
      value: dmg,
      isPlayer: true,
    });
    if (get().playerHp <= 0) set({ gameState: "OVER" });
  },

  spawnEnemies: () =>
    set({
      gameState: "BATTLE_PLAYER",
      enemies: [
        {
          id: Math.random(),
          hp: 20,
          maxHp: 20,
          atk: 10,
          x: 75,
          targetX: 75,
          isAttacking: false,
          atkFrame: 0,
          isCharging: false,
        },
        {
          id: Math.random(),
          hp: 100,
          maxHp: 100,
          atk: 10,
          x: 88,
          targetX: 88,
          isAttacking: false,
          atkFrame: 0,
          isCharging: false,
        },
      ],
    }),

  fireProjectile: (p) => set((s) => ({ projectiles: [...s.projectiles, p] })),

  endPlayerTurn: async (dmg, targetId) => {
    set({ gameState: "ACTION" });

    // 1. รออนิเมชั่นตัวละครโจมตี 1 -> 2
    await new Promise((r) => setTimeout(r, 450));

    // 2. ปล่อยลูกไฟ
    const target = get().enemies.find((e) => e.id === targetId);
    if (target && target.hp > 0) {
      get().fireProjectile({
        id: Math.random(),
        x: PLAYER_X_POS + 8,
        y: FIXED_Y - 50,
        damage: dmg,
        targetId,
      });
    }

    // 3. รอจนกว่าลูกไฟจะวิ่งไปชนศัตรู
    let projectileMoving = true;
    while (projectileMoving) {
        await new Promise(r => setTimeout(r, 100));
        if (get().projectiles.length === 0) projectileMoving = false;
    }

    // 4. รอให้ศัตรูเล่นอนิเมชั่นโดนดาเมจ หรือ กระเด็น
    await new Promise((r) => setTimeout(r, 800));

    const aliveCount = get().enemies.filter((e) => e.hp > 0).length;
    if (aliveCount === 0) {
      set({ gameState: "RUN", enemies: [], projectiles: [] });
      return;
    }

    // 5. เริ่มเทิร์นศัตรู
    set({ gameState: "BATTLE_ENEMY" });
    const enemyIds = get().enemies.map((e) => e.id);

    for (const id of enemyIds) {
      const currentEn = get().enemies.find((e) => e.id === id);
      if (!currentEn || currentEn.hp <= 0) continue;

      const moveDelay = 400;

      if (currentEn.isCharging) {
        set((s) => ({
          enemies: s.enemies.map((e) =>
            e.id === id
              ? { ...e, x: PLAYER_X_POS + 8, atkFrame: 1, isCharging: false }
              : e
          ),
        }));
        await new Promise((r) => setTimeout(r, moveDelay));

        if (get().enemies.find((e) => e.id === id)?.hp ?? 0 > 0) {
          set((s) => ({
            enemies: s.enemies.map((e) =>
              e.id === id ? { ...e, atkFrame: 2 } : e
            ),
          }));
          get().damagePlayer(currentEn.atk * 3);
        }
      } else {
        if (Math.random() > 0.3) {
          set((s) => ({
            enemies: s.enemies.map((e) =>
              e.id === id ? { ...e, x: PLAYER_X_POS + 8, atkFrame: 1 } : e
            ),
          }));
          await new Promise((r) => setTimeout(r, moveDelay));

          if (get().enemies.find((e) => e.id === id)?.hp ?? 0 > 0) {
            set((s) => ({
              enemies: s.enemies.map((e) =>
                e.id === id ? { ...e, atkFrame: 2 } : e
              ),
            }));
            get().damagePlayer(currentEn.atk);
          }
        } else {
          set((s) => ({
            enemies: s.enemies.map((e) =>
              e.id === id ? { ...e, isCharging: true } : e
            ),
          }));
          get().addPopup({
            id: Math.random(),
            x: currentEn.x,
            y: FIXED_Y - 80,
            value: 0,
          });
          await new Promise((r) => setTimeout(r, 800));
          continue;
        }
      }

      await new Promise((r) => setTimeout(r, moveDelay));
      set((s) => ({
        enemies: s.enemies.map((e) =>
          e.id === id && e.hp > 0 ? { ...e, x: e.targetX, atkFrame: 0 } : e
        ),
      }));
    }

    const finalAlive = get().enemies.filter((e) => e.hp > 0);
    if (finalAlive.length === 0) {
      set({ gameState: "RUN", enemies: [], projectiles: [] });
    } else if (get().playerHp > 0) {
      set({ gameState: "BATTLE_PLAYER" });
    }
  },

  reset: () =>
    set({
      gameState: "RUN",
      playerHp: MAX_PLAYER_HP,
      enemies: [],
      projectiles: [],
      distance: 0,
      damagePopups: [],
    }),

  update: (dt) =>
    set((state) => {
      if (state.gameState === "RUN") {
        const newDist = state.distance + dt * 0.02;
        if (newDist >= 120) {
          setTimeout(() => get().spawnEnemies(), 0);
          return { distance: 0 };
        }
        return { distance: newDist };
      }
      if (state.projectiles.length > 0) {
        const nextProjs = state.projectiles.map((p) => ({
          ...p,
          x: p.x + dt * 0.08,
        }));
        let currentEnemies = [...state.enemies];
        const activeProjs: Projectile[] = [];

        nextProjs.forEach((p) => {
          const target = currentEnemies.find((e) => e.id === p.targetId);
          if (target && p.x >= target.x) {
            target.hp = Math.max(0, target.hp - p.damage);
            get().addPopup({
              id: Math.random(),
              x: target.x + 1,
              y: FIXED_Y - 80,
              value: p.damage,
            });
          } else if (p.x < 110) {
            activeProjs.push(p);
          }
        });
        return { enemies: currentEnemies, projectiles: activeProjs };
      }
      return {};
    }),
}));