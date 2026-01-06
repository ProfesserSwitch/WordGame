import type { StateCreator } from "zustand";
import type { GameStateStore, Enemy, QuizData, InventoryItem } from "../../types";
import { PLAYER_X_POS, FIXED_Y } from "../constants";
import { sfx } from "../../utils/sfx";
import { WordSystem } from "../../utils/gameSystems";

// ✅ Explicit Type: ms
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface EnemySlice {
  stageData: Record<number, Enemy[]> | null;
  currentWave: number;
  enemies: Enemy[];
  isDodging: boolean;
  currentQuiz: QuizData | null;
  quizResolver: ((isCorrect: boolean) => void) | null;

  // Actions
  spawnEnemies: (loot: (InventoryItem | null)[]) => void;
  updateEnemy: (id: number, data: Partial<Enemy>) => void;
  damageEnemy: (id: number, dmg: number) => void;
  runEnemyTurn: () => Promise<void>;
  resolveQuiz: (answer: string) => void;
}

export const createEnemySlice: StateCreator<GameStateStore, [], [], EnemySlice> = (set, get) => ({
  stageData: null,
  currentWave: 1,
  enemies: [],
  isDodging: false,
  currentQuiz: null,
  quizResolver: null,

  spawnEnemies: (loot: (InventoryItem | null)[]) => {
    const store = get();
    const waveData = store.stageData ? store.stageData[store.currentWave] : [];

    if (!waveData || waveData.length === 0) {
        console.log("No enemies found for wave " + store.currentWave);
        set({ gameState: "GAME_CLEARED", playerShoutText: "GAME CLEARED!" }); 
        return;
    }

    const enemiesWithPos = waveData.map((e, i) => ({
        ...e,
        x: 80 - (i * 13), 
        hp: e.max_hp,
        shield: 0,
    }));

    set({
      gameState: "PLAYERTURN",
      inventory: loot,
      enemies: enemiesWithPos,
      playerStat: {
        ...store.playerStat,
        rp: store.playerStat.max_rp,
      },
    });
  },

  updateEnemy: (id: number, data: Partial<Enemy>) =>
    set((s) => ({
      enemies: s.enemies.map((e) => (e.id === id ? { ...e, ...data } : e)),
    })),

  damageEnemy: (id: number, dmg: number) => {
    const target = get().enemies.find((e) => e.id === id);
    if (target) {
      // 🛡️ Logic การคำนวณดาเมจผ่านโล่ (ถ้ามี)
      let finalDmg = dmg;
      let currentShield = target.shield || 0;

      if (currentShield > 0) {
        if (currentShield >= dmg) {
            currentShield -= dmg;
            finalDmg = 0;
        } else {
            finalDmg -= currentShield;
            currentShield = 0;
        }
        // อัปเดตโล่ที่เหลือ
        get().updateEnemy(id, { shield: currentShield });
      }

      const newHp = Math.max(0, target.hp - finalDmg);
      get().updateEnemy(id, { hp: newHp });
      
      // แสดง Popup ดาเมจ
      get().addPopup({
        id: Math.random(), x: target.x - 2, y: FIXED_Y - 80, value: finalDmg,
      });
    }
  },

  resolveQuiz: (answer: string) => {
    const store = get();
    if (!store.currentQuiz || !store.quizResolver) return;
    const isCorrect: boolean = answer === store.currentQuiz.correctAnswer;
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

      // AI Logic
      let actionObj = null;
      if(en.patternList) {
          actionObj = en.patternList.find((p: any) => p.pattern_no === en.selectedPattern && p.order === en.currentStep);
      }
      
      const actionMove: string = actionObj ? actionObj.move.toUpperCase() : "WAIT";
      
      let nextStep: number = en.currentStep + 1;
      const hasNext = en.patternList?.some((p: any) => p.pattern_no === en.selectedPattern && p.order === nextStep);
      if (!hasNext) nextStep = 1;

      // --- EXECUTE ACTION ---
      
      // 🛡️ [GUARD] Action
      if (actionMove === "GUARD") {
        // ใช้ค่า def เป็นเกณฑ์ในการเพิ่ม Shield (ถ้าไม่มี def ให้ใช้ 5)
        const shieldGain = en.def || 5; 

        get().updateEnemy(en.id, { shoutText: "GUARD!" });
        await delay(400);

        // คำนวณ Shield ใหม่
        const currentShield = en.shield || 0;
        const newShield = currentShield + shieldGain;
        
        get().updateEnemy(en.id, { shield: newShield });

        // (Optional) อาจจะเพิ่ม sfx เสียงใส่เกราะตรงนี้
        // sfx.playBuff(); 

        await delay(600);

        get().updateEnemy(en.id, {
          shoutText: "",
          currentStep: nextStep,
        });
        await delay(200);
        continue;
      }

      if (actionMove === "ATTACK") {
        const dmg: number = Math.floor(Math.random() * (en.atk_power_max - en.atk_power_min + 1)) + en.atk_power_min;
        const shoutWord: string = WordSystem.getRandomWordByLength(store.dictionary, Math.min(dmg, 8)) || "GRR";

        get().updateEnemy(en.id, { shoutText: shoutWord });
        await delay(400);

        const originalX: number = en.x;
        get().updateEnemy(en.id, { x: PLAYER_X_POS + 10, atkFrame: 1 });
        await delay(400);

        get().damagePlayer(dmg);
        sfx.playHit();
        get().updateEnemy(en.id, { atkFrame: 2 });
        await delay(400);

        get().updateEnemy(en.id, {
          x: originalX, atkFrame: 0, shoutText: "", currentStep: nextStep,
        });
        await delay(200);
        continue;
      }

      if (actionMove === "WAIT") {
        get().updateEnemy(en.id, { shoutText: "...", currentStep: nextStep });
        get().addPopup({ id: Math.random(), x: en.x - 2, y: FIXED_Y - 80, value: 0 });
        await delay(800);
        get().updateEnemy(en.id, { shoutText: "" });
        continue;
      }

      if (actionMove === "SKILL") {
        const vocabList = store.dictionary;
        const correctEntry = vocabList[Math.floor(Math.random() * vocabList.length)];
        const wrongEntries = vocabList
          .filter((v) => v.word !== correctEntry.word)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        const choices = [correctEntry.word, ...wrongEntries.map((w) => w.word)].sort(
          () => 0.5 - Math.random()
        );

        set({ gameState: "QUIZ_MODE" });
        const originalX: number = en.x;
        get().updateEnemy(en.id, {
          x: PLAYER_X_POS + 15, shoutText: correctEntry.meaning, atkFrame: 1,
        });
        await delay(500);

        set({
          currentQuiz: {
            question: correctEntry.meaning,
            correctAnswer: correctEntry.word,
            choices: choices,
            enemyId: en.id,
          },
        });

        const isCorrect = await new Promise<boolean>((resolve) => {
          set({ quizResolver: resolve });
        });

        set({ gameState: "ENEMYTURN" });
        await delay(50);
        get().updateEnemy(en.id, { x: PLAYER_X_POS + 10, atkFrame: 2 });

        if (isCorrect) {
          set({ isDodging: true });
          get().updateEnemy(en.id, { shoutText: "MISSED!" });
          get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 80, value: -1, isPlayer: true });
        } else {
          const dmg: number = (Math.floor(Math.random() * (en.atk_power_max - en.atk_power_min + 1)) + en.atk_power_min) * 2;
          sfx.playHit();
          get().damagePlayer(dmg);
        }

        await delay(1000);
        set({ isDodging: false });
        get().updateEnemy(en.id, {
          x: originalX, atkFrame: 0, shoutText: "", currentStep: nextStep,
        });
        await delay(500);
      }

      if (get().playerStat.hp <= 0) {
        set({ gameState: "OVER" });
        return;
      }
    }

    if (get().playerStat.hp > 0) {
      get().startPlayerTurn();
    }
  },
});