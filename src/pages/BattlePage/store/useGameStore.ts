import { create } from "zustand";
import type { Enemy, Projectile, DamagePopup, GameState, DictEntry, InventoryItem, PlayerStat, SkillData } from "../types";
import { PLAYER_X_POS, FIXED_Y, PLAYER_ATK } from "../constants";
import { sfx } from "../../../utils/sfx";
import { EnemyFactory, CombatSystem, PhysicsEngine, WordSystem } from "../../../utils/gameLogic"; // Import Logic ใหม่

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface GameStateStore {
  // ... (Interface คงเดิม) ...
  gameState: GameState | "PREPARING_COMBAT";
  playerStat: PlayerStat;
  enemies: Enemy[];
  projectiles: Projectile[];
  distance: number;
  damagePopups: DamagePopup[];
  dictionary: DictEntry[];
  playerShoutText: string;
  inventory: InventoryItem[];

  animResolver: (() => void) | null;
  notifyAnimationComplete: () => void;
  waitAnim: (timeout?: number) => Promise<void>;

  setDictionary: (data: DictEntry[]) => void;
  update: (dt: number) => void;
  reset: () => void;
  damagePlayer: (dmg: number) => void;
  castSkill: (skill: SkillData, chosenWord: string, targetIds: number[], newInventory?: InventoryItem[]) => Promise<void>;
  spawnEnemies: (loot: InventoryItem[]) => void;
  updateEnemy: (id: number, data: Partial<Enemy>) => void;
  damageEnemy: (id: number, dmg: number) => void;
  runEnemyTurn: () => Promise<void>;
  addPopup: (p: DamagePopup) => void;
  removePopup: (id: number) => void;
  alphabetMissle: (p: Projectile) => void;
  setInventory: (items: InventoryItem[]) => void;
}

export const useGameStore = create<GameStateStore>((set, get) => ({
  // --- Initial State ---
  gameState: "ADVANTURE",
  playerStat: { max_hp: 10, hp: 10, shield: 0, atk: PLAYER_ATK, def: 0, max_ap: 3, ap: 3, max_bap: 1, bap: 1 },
  enemies: [],
  projectiles: [],
  distance: 0,
  damagePopups: [],
  dictionary: [],
  playerShoutText: "",
  inventory: [],
  animResolver: null,

  // --- Animation Helpers ---
  notifyAnimationComplete: () => {
    const resolver = get().animResolver;
    if (resolver) { resolver(); set({ animResolver: null }); }
  },
  waitAnim: async (timeoutMs = 1000) => {
    const safeTimeout = setTimeout(() => get().notifyAnimationComplete(), timeoutMs);
    await new Promise<void>((resolve) => set({ animResolver: resolve }));
    clearTimeout(safeTimeout);
  },

  // --- Basic Setters ---
  setDictionary: (data) => set({ dictionary: data }),
  addPopup: (p) => set((s) => ({ damagePopups: [...s.damagePopups, p] })),
  removePopup: (id) => set((s) => ({ damagePopups: s.damagePopups.filter((p) => p.id !== id) })),
  alphabetMissle: (p) => set((s) => ({ projectiles: [...s.projectiles, p] })),
  setInventory: (items) => set({ inventory: items }),

  reset: () => set({
    gameState: "ADVANTURE",
    playerStat: { max_hp: 10, hp: 10, shield: 0, atk: PLAYER_ATK, def:0, max_ap: 3, ap: 3, max_bap: 1, bap: 1 },
    enemies: [], projectiles: [], distance: 0, damagePopups: [], inventory: [],
  }),

  // --- Combat Actions ---

  damagePlayer: (dmg) => {
    const { playerStat: stat } = get();
    let remainingDmg = dmg;
    let newShield = stat.shield;

    if (newShield > 0) {
      const block = Math.min(newShield, remainingDmg);
      newShield -= block;
      remainingDmg -= block;
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 70, value: 0, isPlayer: true }); 
    }

    const newHp = Math.max(0, stat.hp - remainingDmg);
    set({ playerStat: { ...stat, hp: newHp, shield: newShield } });
    
    if (remainingDmg > 0) get().addPopup({ id: Math.random(), x: PLAYER_X_POS - 2, y: FIXED_Y - 50, value: remainingDmg, isPlayer: true });
    if (newHp <= 0) set({ gameState: "OVER" });
  },

  spawnEnemies: (loot) => {
    set({
      gameState: "PLAYERTURN",
      inventory: loot,
      enemies: EnemyFactory.generateGroup(3, 60), // ✅ ใช้ Factory
      playerStat: { ...get().playerStat, ap: get().playerStat.max_ap, bap: get().playerStat.max_bap }
    });
  },

  castSkill: async (skill, chosenWord, targetIds, newInventory = []) => {
    const store = get();
    if (store.playerStat.ap < skill.apCost) return;

    // 1. Resource Management
    let currentInv = [...store.inventory];
    if (skill.effectType !== 'SPIN' && skill.minWordLength > 0) {
        const charsUsed = chosenWord.split('');
        charsUsed.forEach(char => {
            const index = currentInv.findIndex(item => item.char === char);
            if (index !== -1) currentInv.splice(index, 1);
        });
    }

    // 2. Start Action State
    set(s => ({ 
        playerShoutText: skill.name, 
        gameState: "ACTION", 
        inventory: currentInv,
        playerStat: { ...s.playerStat, ap: s.playerStat.ap - skill.apCost }
    }));
    await store.waitAnim(800);

    // 3. Apply Skill Effects
    const wordScore = CombatSystem.calculateWordScore(chosenWord); // ✅ ใช้ Utility

    if (skill.effectType === 'SPIN' && newInventory.length > 0) {
         set({ inventory: newInventory });
    } 
    else if (skill.effectType === 'SHIELD') {
        const shieldAmount = chosenWord.length * skill.basePower;
        set(s => ({ playerStat: { ...s.playerStat, shield: s.playerStat.shield + shieldAmount } }));
        get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 60, value: shieldAmount, isPlayer: false });
    } 
    else if (skill.effectType === 'DAMAGE') {
        for (const tid of targetIds) {
            const target = store.enemies.find(e => e.id === tid);
            if (!target || target.hp <= 0) continue;

            const isHit = CombatSystem.calculateHit(skill, wordScore, target.ac); // ✅ ใช้ Utility
            const finalDamage = CombatSystem.calculateDamage(skill, wordScore, isHit);

            sfx.playMissle();
            store.alphabetMissle({
                id: Math.random(),
                x: PLAYER_X_POS + 10, y: FIXED_Y - 50, startY: FIXED_Y - 50,
                damage: finalDamage, targetId: tid,
                char: skill.projectileVisual === 'V_SHAPE' ? 'V' : '',
                visual: skill.projectileVisual,
                isMiss: !isHit,
                movementType: skill.projectileVisual === 'V_SHAPE' ? 'wavy' : 'straight',
                scale: 1.0 + (chosenWord.length * 0.1),
            } as any);
            await delay(200);
        }
    }

    // 4. Wait for Projectiles
    while (get().projectiles.length > 0) await delay(100);
    await delay(500);
    set({ playerShoutText: "" });

    // 5. End Turn Logic
    if (get().enemies.filter((e) => e.hp > 0).length === 0) {
        set({ gameState: "ADVANTURE", enemies: [], projectiles: [], playerShoutText: "" });
        return;
    }
    
    if (get().playerStat.ap <= 0) await get().runEnemyTurn();
    else set({ gameState: "PLAYERTURN" });
  },

  // --- Enemy Turn (AI) ---
  updateEnemy: (id, data) => set((s) => ({ enemies: s.enemies.map((e) => (e.id === id ? { ...e, ...data } : e)) })),
  
damageEnemy: (id, dmg) => {
    const target = get().enemies.find(e => e.id === id);
    if (target) {
        const newHp = Math.max(0, target.hp - dmg);
        
        // อัปเดต HP ศัตรู
        get().updateEnemy(id, { hp: newHp });
        
        // แสดงตัวเลขดาเมจ (Popup)
        get().addPopup({ 
            id: Math.random(), 
            x: target.x - 2, 
            y: FIXED_Y - 80, 
            value: dmg 
        });
    }
  },

  runEnemyTurn: async () => {
    const store = get();
    set({ playerShoutText: "", gameState: "ENEMYTURN" });
    
    for (const en of store.enemies) {
      if (en.hp <= 0) continue;
      
      // Cooldown Logic
      if (en.current_cooldown > 0) {
        get().addPopup({ id: Math.random(), x: en.x - 2, y: FIXED_Y - 80, value: 0 });
        get().updateEnemy(en.id, { current_cooldown: en.current_cooldown - 1 });
        await delay(600); continue;
      }
      
      // ✅ 1. คำนวณดาเมจก่อน (เพื่อเอาไปหาคำศัพท์)
      const dmg = Math.floor(Math.random() * (en.atk_power_max - en.atk_power_min + 1)) + en.atk_power_min;

      // ✅ 2. สุ่มคำศัพท์ที่มีความยาวเท่ากับ dmg
      const shoutWord = WordSystem.getRandomWordByLength(store.dictionary, dmg);

      // Attack Logic (Shout -> Move -> Deal Damage)
      get().updateEnemy(en.id, { shoutText: shoutWord }); // 🗣️ ตะโกนคำที่สุ่มได้
      await delay(400);
      
      const originalX = en.x;
      get().updateEnemy(en.id, { x: PLAYER_X_POS + 3, atkFrame: 1 });
      await delay(400);

      // Deal Damage (ใช้ค่า dmg ที่คำนวณไว้แล้ว)
      get().damagePlayer(dmg);
      sfx.playHit();
      get().updateEnemy(en.id, { atkFrame: 2 });
      
      await delay(400);
      get().updateEnemy(en.id, { x: originalX, atkFrame: 0, current_cooldown: en.cooldown, shoutText: "" });
      await delay(200);
    }
    
    if (get().playerStat.hp > 0) {
      set((s) => ({ gameState: "PLAYERTURN", playerStat: { ...s.playerStat, ap: s.playerStat.max_ap, bap: s.playerStat.max_bap } }));
    }
  },

  // --- Game Loop (Refactored) ---
  update: (dt) => set((state) => {
      // 1. Adventure Mode
      if (state.gameState === "ADVANTURE") {
        const newDist = state.distance + dt * 0.02;
        return newDist >= 120 ? { distance: 120, gameState: "PREPARING_COMBAT" } : { distance: newDist };
      }

      // 2. Projectile Physics & Collision
      if (state.projectiles.length > 0) {
         // ✅ ใช้ Physics Engine
         const movedProjectiles = PhysicsEngine.updateProjectiles(state.projectiles, dt);
         const { activeProjectiles, hits } = PhysicsEngine.checkCollisions(movedProjectiles, state.enemies);

         // Process Hits (State Update) 
         if (hits.length > 0) {
            const newEnemies = [...state.enemies];
            hits.forEach(({ targetIndex, damage }) => {
                const target = newEnemies[targetIndex];
                newEnemies[targetIndex] = { ...target, hp: Math.max(0, target.hp - damage) };
                
                // Add Popup (Side Effect)
                get().addPopup({ 
                    id: Math.random(), 
                    x: target.x - 2, y: FIXED_Y - 80, 
                    value: damage === 0 ? -1 : damage // -1 for Miss
                });
            });
            return { enemies: newEnemies, projectiles: activeProjectiles };
         }

         return { projectiles: activeProjectiles };
      }
      return {};
    }),
}));