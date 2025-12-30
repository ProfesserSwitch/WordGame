import { create } from "zustand";
import type {
  Enemy,
  Projectile,
  DamagePopup,
  GameState,
  DictEntry,
  InventoryItem,
  PlayerStat,
  SkillData,
  QuizData,
} from "../types";
import { PLAYER_X_POS, FIXED_Y, PLAYER_ATK } from "./constants";
import { sfx } from "../../../utils/sfx";

import {
  EnemyFactory,
  CombatSystem,
  PhysicsEngine,
  WordSystem,
} from "../../BattlePage/App"; 

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ✅ Interface เพิ่ม MP
interface GameStateStore {
  gameState: GameState | "PREPARING_COMBAT";
  playerStat: PlayerStat;
  enemies: Enemy[];
  projectiles: Projectile[];
  distance: number;
  damagePopups: DamagePopup[];
  dictionary: DictEntry[];
  playerShoutText: string;
  inventory: InventoryItem[];
  
  currentQuiz: QuizData | null;
  quizResolver: ((isCorrect: boolean) => void) | null;

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
  
  actionSpin: (newInventory: InventoryItem[]) => Promise<void>;
  resolveQuiz: (answer: string) => void;
}

export const useGameStore = create<GameStateStore>((set, get) => ({
  gameState: "ADVANTURE",
  // ✅ เริ่มต้น MP 0 / 25
  playerStat: { 
      max_hp: 10, hp: 10, 
      shield: 0, 
      atk: PLAYER_ATK, def: 0, 
      max_ap: 3, ap: 3, 
      max_bap: 1, bap: 1, 
      mp: 0, max_mp: 25 // 🆕
  },
  enemies: [],
  projectiles: [],
  distance: 0,
  damagePopups: [],
  dictionary: [],
  playerShoutText: "",
  inventory: [],
  animResolver: null,
  currentQuiz: null,
  quizResolver: null,

  notifyAnimationComplete: () => {
    const resolver = get().animResolver;
    if (resolver) { resolver(); set({ animResolver: null }); }
  },
  waitAnim: async (timeoutMs = 1000) => {
    const safeTimeout = setTimeout(() => get().notifyAnimationComplete(), timeoutMs);
    await new Promise<void>((resolve) => set({ animResolver: resolve }));
    clearTimeout(safeTimeout);
  },

  setDictionary: (data) => set({ dictionary: data }),
  addPopup: (p) => set((s) => ({ damagePopups: [...s.damagePopups, p] })),
  removePopup: (id) => set((s) => ({ damagePopups: s.damagePopups.filter((p) => p.id !== id) })),
  alphabetMissle: (p) => set((s) => ({ projectiles: [...s.projectiles, p] })),
  setInventory: (items) => set({ inventory: items }),

  reset: () => set({
      gameState: "ADVANTURE",
      playerStat: { 
          max_hp: 10, hp: 10, shield: 0, atk: PLAYER_ATK, def: 0, 
          max_ap: 3, ap: 3, max_bap: 1, bap: 1,
          mp: 0, max_mp: 25 
      },
      enemies: [], projectiles: [], distance: 0, damagePopups: [], inventory: [],
      currentQuiz: null, quizResolver: null
  }),

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
      enemies: EnemyFactory.generateGroup(3, 60),
      playerStat: { ...get().playerStat, ap: get().playerStat.max_ap, bap: get().playerStat.max_bap },
    });
  },

  actionSpin: async (newInventory) => {
    const store = get();
    if (store.playerStat.ap < 1) return;

    set((s) => ({
      playerStat: { ...s.playerStat, ap: s.playerStat.ap - 1 },
      playerShoutText: "SPIN!",
      gameState: "ACTION",
      inventory: newInventory
    }));

    await store.waitAnim(600);
    set({ playerShoutText: "", gameState: "PLAYERTURN" });
  },

  castSkill: async (skill, chosenWord, targetIds, newInventory = []) => {
    const store = get();
    // ✅ Check MP ก่อน
    if (store.playerStat.ap < (skill.apCost || 0)) return;
    if (store.playerStat.mp < (skill.mpCost || 0)) return; 

    let currentInv = [...store.inventory];
    
    // ✅ หัก AP และ MP
    set((s) => ({
      playerShoutText: skill.name,
      gameState: "ACTION",
      inventory: currentInv,
      playerStat: { 
          ...s.playerStat, 
          ap: s.playerStat.ap - (skill.apCost || 0),
          mp: s.playerStat.mp - (skill.mpCost || 0) // หัก MP ถ้ามี cost
      },
    }));
    await store.waitAnim(800);

    const wordScore = CombatSystem.calculateWordScore(chosenWord);

    // ✅ ถ้าสกิลนี้ไม่เสีย MP (mpCost = 0) แสดงว่าเพิ่ม MP +5
    if ((skill.mpCost || 0) === 0) {
        set((s) => ({
            playerStat: {
                ...s.playerStat,
                mp: Math.min(s.playerStat.max_mp, s.playerStat.mp + 5) // +5 MP
            }
        }));
        // (Optional) Popup +5 MP
        get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 90, value: 5, isPlayer: true }); 
    }

    if (skill.effectType === "SHIELD") {
      const shieldAmount = chosenWord.length * skill.basePower;
      set((s) => ({ playerStat: { ...s.playerStat, shield: s.playerStat.shield + shieldAmount } }));
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 60, value: shieldAmount, isPlayer: false });
    } else if (skill.effectType === "DAMAGE") {
      const totalMissiles = skill.hitCount || 1; 
      for (let i = 0; i < totalMissiles; i++) {
        let currentTargetId = targetIds[i % targetIds.length];
        let target = store.enemies.find((e) => e.id === currentTargetId);
        
        if (!target || target.hp <= 0) {
             const aliveTargetId = targetIds.find(tid => store.enemies.find(en => en.id === tid && en.hp > 0));
             if (aliveTargetId) {
                 currentTargetId = aliveTargetId;
                 target = store.enemies.find((e) => e.id === currentTargetId);
             }
        }
        if (!target) break; 

        const isHit = CombatSystem.calculateHit(skill, wordScore, target.ac);
        const finalDamage = CombatSystem.calculateDamage(skill, wordScore, isHit);

        sfx.playMissle();
        store.alphabetMissle({
            id: Math.random(), x: PLAYER_X_POS + 10, y: FIXED_Y - 50, startY: FIXED_Y - 50,
            damage: finalDamage, targetId: target.id, char: skill.projectileVisual === "V_SHAPE" ? "V" : "",
            visual: skill.projectileVisual, isMiss: !isHit,
            movementType: skill.projectileVisual === "V_SHAPE" ? "wavy" : "straight",
            scale: 1.0 + chosenWord.length * 0.1, phase: i * 2, 
        } as any);

        if (i < totalMissiles - 1) await delay(150);
      }
    }

    while (get().projectiles.length > 0) await delay(100);
    await delay(500);
    set({ playerShoutText: "" });

    if (get().enemies.filter((e) => e.hp > 0).length === 0) {
      set({ gameState: "ADVANTURE", enemies: [], projectiles: [], playerShoutText: "" });
      return;
    }

    if (get().playerStat.ap <= 0) await get().runEnemyTurn();
    else set({ gameState: "PLAYERTURN" });
  },

  updateEnemy: (id, data) => set((s) => ({ enemies: s.enemies.map((e) => (e.id === id ? { ...e, ...data } : e)) })),

  damageEnemy: (id, dmg) => {
    const target = get().enemies.find((e) => e.id === id);
    if (target) {
      const newHp = Math.max(0, target.hp - dmg);
      get().updateEnemy(id, { hp: newHp });
      get().addPopup({ id: Math.random(), x: target.x - 2, y: FIXED_Y - 80, value: dmg });
    }
  },

  resolveQuiz: (answer) => {
    const store = get();
    if (!store.currentQuiz || !store.quizResolver) return;
    const isCorrect = answer === store.currentQuiz.correctAnswer;
    store.quizResolver(isCorrect);
    set({ currentQuiz: null, quizResolver: null }); 
  },

  runEnemyTurn: async () => {
    const store = get();
    set({ playerShoutText: "", gameState: "ENEMYTURN" });

    for (const en of store.enemies) {
      if (en.hp <= 0) continue;
      if (get().playerStat.hp <= 0) {
          set({ gameState: "OVER" });
          return;
      }

      const action = en.pattern[en.currentStep];
      const nextStep = (en.currentStep + 1) % en.pattern.length;

      if (action === "ATTACK") {
          const dmg = Math.floor(Math.random() * (en.atk_power_max - en.atk_power_min + 1)) + en.atk_power_min;
          const shoutWord = WordSystem.getRandomWordByLength(store.dictionary, Math.min(dmg, 8)) || "GRR";

          get().updateEnemy(en.id, { shoutText: shoutWord });
          await delay(400);

          const originalX = en.x;
          get().updateEnemy(en.id, { x: PLAYER_X_POS + 10, atkFrame: 1 });
          await delay(400);

          get().damagePlayer(dmg);
          sfx.playHit();
          get().updateEnemy(en.id, { atkFrame: 2 });
          await delay(400);

          get().updateEnemy(en.id, { x: originalX, atkFrame: 0, shoutText: "", currentStep: nextStep });
          await delay(200);
          continue; 
      }

      if (action === "WAIT") {
        get().updateEnemy(en.id, { shoutText: "...", currentStep: nextStep });
        get().addPopup({ id: Math.random(), x: en.x - 2, y: FIXED_Y - 80, value: 0 });
        await delay(800);
        get().updateEnemy(en.id, { shoutText: "" });
        continue;
      }

      if (action === "SKILL") {
        const vocabList = store.dictionary;
        const correctEntry = vocabList[Math.floor(Math.random() * vocabList.length)];
        const wrongEntries = vocabList.filter(v => v.word !== correctEntry.word).sort(() => 0.5 - Math.random()).slice(0, 3);
        const choices = [correctEntry.word, ...wrongEntries.map(w => w.word)].sort(() => 0.5 - Math.random());

        set({ gameState: "QUIZ_MODE" });
        
        const originalX = en.x;
        
        get().updateEnemy(en.id, { 
            x: PLAYER_X_POS + 15, 
            shoutText: correctEntry.meaning, 
            atkFrame: 1 
        });

        await delay(500); 

        set({
            currentQuiz: {
                question: correctEntry.meaning,
                correctAnswer: correctEntry.word,
                choices: choices,
                enemyId: en.id
            }
        });

        const isCorrect = await new Promise<boolean>((resolve) => {
            set({ quizResolver: resolve });
        });

        set({ gameState: "ENEMYTURN" }); 
        await delay(50); 

        get().updateEnemy(en.id, { x: PLAYER_X_POS + 10 }); 
        get().updateEnemy(en.id, { atkFrame: 2 }); 

        if (isCorrect) {
            // sfx.playJump();
            get().updateEnemy(en.id, { shoutText: "MISSED!" });
            get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 80, value: -1, isPlayer: true });
        } else {
            const dmg = (Math.floor(Math.random() * (en.atk_power_max - en.atk_power_min + 1)) + en.atk_power_min) * 2;
            sfx.playHit();
            get().damagePlayer(dmg);
        }

        await delay(1000);
        get().updateEnemy(en.id, { x: originalX, atkFrame: 0, shoutText: "", currentStep: nextStep });
        await delay(500);
      }
      
      if (get().playerStat.hp <= 0) {
         set({ gameState: "OVER" });
         return;
      }
    }

    if (get().playerStat.hp > 0) {
      set((s) => ({ gameState: "PLAYERTURN", playerStat: { ...s.playerStat, ap: s.playerStat.max_ap, bap: s.playerStat.max_bap } }));
    }
  },

  update: (dt) => set((state) => {
      if (state.gameState === "ADVANTURE") {
        const newDist = state.distance + dt * 0.02;
        return newDist >= 120 ? { distance: 120, gameState: "PREPARING_COMBAT" } : { distance: newDist };
      }
      if (state.projectiles.length > 0) {
        const movedProjectiles = PhysicsEngine.updateProjectiles(state.projectiles, dt);
        const { activeProjectiles, hits } = PhysicsEngine.checkCollisions(movedProjectiles, state.enemies);
        if (hits.length > 0) {
          const newEnemies = [...state.enemies];
          hits.forEach((hit: { targetIndex: number; damage: number }) => {
            const { targetIndex, damage } = hit;
            const target = newEnemies[targetIndex];
            newEnemies[targetIndex] = { ...target, hp: Math.max(0, target.hp - damage) };
            get().addPopup({ id: Math.random(), x: target.x - 2, y: FIXED_Y - 80, value: damage === 0 ? -1 : damage });
          });
          return { enemies: newEnemies, projectiles: activeProjectiles };
        }
        return { projectiles: activeProjectiles };
      }
      return {};
    }),
}));