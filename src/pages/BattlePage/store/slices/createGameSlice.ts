import type { StateCreator } from "zustand";
import type { GameStateStore, GameState, DictEntry, Projectile, DamagePopup } from "../../types";
import { FIXED_Y } from "../constants";
import { StageProcessor, PhysicsEngine, DeckManager } from "../../utils/gameSystems";
import { ASSET_LIST } from "../../config/assetManifest";
import { preloadImages } from "../../utils/assetLoader";

// ✅ Explicit Type: ms
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface GameSlice {
  gameState: GameState;
  projectiles: Projectile[];
  damagePopups: DamagePopup[];
  dictionary: DictEntry[];
  distance: number;
  loadingProgress: number;
  animResolver: (() => void) | null;

  // Actions
  initializeGame: () => Promise<void>;
  notifyAnimationComplete: () => void;
  waitAnim: (timeout?: number) => Promise<void>;
  setDictionary: (data: DictEntry[]) => void;
  addPopup: (p: DamagePopup) => void;
  removePopup: (id: number) => void;
  alphabetMissle: (p: Projectile) => void;
  update: (dt: number) => void;
  reset: () => void;
}

export const createGameSlice: StateCreator<GameStateStore, [], [], GameSlice> = (set, get) => ({
  gameState: "ADVANTURE",
  projectiles: [],
  damagePopups: [],
  dictionary: [],
  distance: 0,
  loadingProgress: 0,
  animResolver: null,

  initializeGame: async () => {
    set({ loadingProgress: 0 });

    try {
      // 1. Fetch Dictionary
      const dictRes = await fetch("http://localhost:3000/dict");
      if (!dictRes.ok) throw new Error("Failed to fetch dictionary");
      const dictData = await dictRes.json();
      set({ dictionary: dictData, loadingProgress: 10 });

      // 2. Fetch Stage Data
      const stageRes = await fetch("http://localhost:3000/getStageById/green-grass-1");
      if (!stageRes.ok) throw new Error("Failed to fetch stage data");
      const stageRaw = await stageRes.json();
      const processedStage = StageProcessor.processStageData(stageRaw);
      // ตรงนี้เรา set เข้า store ส่วนกลางซึ่ง enemy slice จะมองเห็น
      set({ stageData: processedStage, loadingProgress: 40 });

      // 3. Initialize Deck
      DeckManager.init();

      // 4. Preload Images
      // ✅ Explicit Type: progress
      await preloadImages(ASSET_LIST, (progress: number) => {
        const totalProgress: number = 40 + Math.round(progress * 0.6);
        set({ loadingProgress: totalProgress });
      });

      set({ loadingProgress: 100 });
      await delay(1000); 

    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  notifyAnimationComplete: () => {
    const resolver = get().animResolver;
    if (resolver) {
      resolver();
      set({ animResolver: null });
    }
  },

  // ✅ Explicit Type: timeoutMs
  waitAnim: async (timeoutMs: number = 1000) => {
    const safeTimeout = setTimeout(
      () => get().notifyAnimationComplete(),
      timeoutMs
    );
    await new Promise<void>((resolve) => set({ animResolver: resolve }));
    clearTimeout(safeTimeout);
  },

  // ✅ Explicit Type: data
  setDictionary: (data: DictEntry[]) => set({ dictionary: data }),
  
  // ✅ Explicit Type: p
  addPopup: (p: DamagePopup) => set((s) => ({ damagePopups: [...s.damagePopups, p] })),
  
  // ✅ Explicit Type: id
  removePopup: (id: number) => set((s) => ({ damagePopups: s.damagePopups.filter((p) => p.id !== id) })),
  
  // ✅ Explicit Type: p
  alphabetMissle: (p: Projectile) => set((s) => ({ projectiles: [...s.projectiles, p] })),

  reset: () =>
    set({
      gameState: "ADVANTURE",
      currentWave: 1, 
      playerStat: {
          max_hp: 10, hp: 10, shield: 0, atk: 1, def: 0,
          // ✅ UPDATE: ตัด AP/BAP ออก ใส่ RP แทน (เริ่มที่ 3)
          max_rp: 3, rp: 3,
          mp: 0, max_mp: 25, unlockedSlots: 10,
      },
      enemies: [],
      projectiles: [],
      distance: 0,
      damagePopups: [],
      inventory: [],
      currentQuiz: null,
      quizResolver: null,
    }),

  // ✅ Explicit Type: dt
  update: (dt: number) =>
    set((state) => {
      // ✅ Update Walking Logic
      if (state.gameState === "ADVANTURE") {
        const speed: number = 0.02; 
        const newDist: number = state.distance + dt * speed;
        const targetDist: number = state.currentWave * 120; 

        if (newDist >= targetDist) {
            return { distance: targetDist, gameState: "PREPARING_COMBAT" };
        } else {
            return { distance: newDist };
        }
      }
      
      // ✅ Physics Update
      if (state.projectiles.length > 0) {
        const movedProjectiles = PhysicsEngine.updateProjectiles(
          state.projectiles,
          dt
        );
        const { activeProjectiles, hits } = PhysicsEngine.checkCollisions(
          movedProjectiles,
          state.enemies
        );
        if (hits.length > 0) {
          const newEnemies = [...state.enemies];
          // ✅ Explicit Type: hit
          hits.forEach((hit: { targetIndex: number; damage: number }) => {
            const { targetIndex, damage } = hit;
            const target = newEnemies[targetIndex];
            newEnemies[targetIndex] = {
              ...target,
              hp: Math.max(0, target.hp - damage),
            };
            get().addPopup({
              id: Math.random(), x: target.x - 2, y: FIXED_Y - 80, value: damage === 0 ? -1 : damage,
            });
          });
          return { enemies: newEnemies, projectiles: activeProjectiles };
        }
        return { projectiles: activeProjectiles };
      }
      return {};
    }),
});